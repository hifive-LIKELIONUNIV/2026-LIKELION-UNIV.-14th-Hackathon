import base64
import io
import threading

import qrcode
from PIL import Image
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from django.db import close_old_connections
from django.http import JsonResponse, HttpResponse
from django.urls import reverse
from django.utils import timezone
from django.views.decorators.http import require_POST
from django.shortcuts import get_object_or_404
from .models import Product, CartItem, PersonaSelection, CapturedPhoto, PersonaResult
from .constants import (
    ERA_ORDER,
    ERA_META,
    next_era,
    PASSPORT_FRAME_PATH,
    PASSPORT_FRAME_SLOTS,
    PASSPORT_PLAIN_CANVAS_SIZE,
    PASSPORT_PLAIN_BACKGROUND_COLOR,
)
from . import ai_service

# 백그라운드 생성이 이 시간보다 오래 'processing' 상태로 멈춰 있으면
# (서버 재시작 등으로 스레드가 죽은 경우) 죽은 것으로 보고 재시도를 허용한다.
STALE_PROCESSING_THRESHOLD = timezone.timedelta(minutes=2)


# ---- React(별도 오리진) 연동을 위한 JSON API 전환 공통 헬퍼 ----
# 화면(render)/리다이렉트(redirect) 대신 전부 JsonResponse로 응답하도록 바꾸는 작업.
# 프론트가 다른 오리진에서 이미지를 <img src="...">로 바로 띄울 수 있도록,
# 이미지 필드는 상대경로(/media/...)가 아니라 항상 절대 URL로 내려준다.

def _abs(request, file_field):
    """ImageField -> 절대 URL 문자열. 파일이 없으면 None."""
    if not file_field:
        return None
    return request.build_absolute_uri(file_field.url)


def _product_json(request, product):
    return {
        'id': product.id,
        'name': product.name,
        'subtitle': product.subtitle,
        'description': product.description,
        'image_url': _abs(request, product.image),
        'price': str(product.price) if product.price is not None else None,
    }


def select_bag(request):
    if request.method == 'POST':
        product_id = request.POST.get('product_id')
        product = get_object_or_404(Product, id=product_id)

        if not request.session.session_key:
            request.session.create()

        selection = PersonaSelection.objects.create(
            user=request.user if request.user.is_authenticated else None,
            session_key=None if request.user.is_authenticated else request.session.session_key,
            product=product,
        )

        # 가방 선택 끝나면 바로 촬영 화면으로 이동
        return JsonResponse({
            'success': True,
            'selection_id': selection.id,
            'redirect': reverse('shop:capture_photo', args=[selection.id]),
        })

    cart_items = []

    if request.user.is_authenticated:
        cart_items = CartItem.objects.filter(user=request.user)[:3]

    if cart_items:
        products = [item.product for item in cart_items]
        message = "마음에 드는 가방을 골라주세요"
    else:
        products = Product.objects.filter(is_default=True)[:3]
        message = "취향에 맞는 가방을 골라주세요"

    return JsonResponse({
        'products': [_product_json(request, p) for p in products],
        'message': message,
    })


def select_bag_done(request):
    """임시 완료 페이지 - 현재 어떤 화면에서도 링크되어 있지 않은 미사용 엔드포인트.
    (React 전환 대상에서 제외 — 필요 없어지면 별도로 정리)"""
    return JsonResponse({'note': '미사용 엔드포인트'})


def capture_photo(request, selection_id):
    """웹캠 촬영 화면에 필요한 데이터. 실제 촬영/카운트다운 UI는 프론트(React)가 담당하고,
    여기서는 지금까지 촬영된 장수만 알려준다 (최대 2장)."""
    selection = get_object_or_404(PersonaSelection, id=selection_id)
    photo_count = selection.captured_photos.count()

    return JsonResponse({
        'selection_id': selection.id,
        'photo_count': photo_count,
        'max_photos': 2,
    })


@require_POST
def save_photo(request, selection_id):
    """캡처된 이미지(base64)를 받아서 CapturedPhoto로 저장"""
    selection = get_object_or_404(PersonaSelection, id=selection_id)

    data_url = request.POST.get('image_data')
    if not data_url:
        return JsonResponse({'error': '이미지 데이터가 없습니다.'}, status=400)

    if selection.captured_photos.count() >= 2:
        return JsonResponse({'error': '이미 2장을 촬영했습니다.'}, status=400)

    format_part, imgstr = data_url.split(';base64,')
    ext = format_part.split('/')[-1]

    photo = CapturedPhoto.objects.create(
        selection=selection,
        image=ContentFile(
            base64.b64decode(imgstr),
            name=f'photo_{selection_id}_{selection.captured_photos.count() + 1}.{ext}'
        )
    )

    photo_count = selection.captured_photos.count()
    next_step = 'choose' if photo_count >= 2 else 'capture_again'

    return JsonResponse({
        'success': True,
        'photo_id': photo.id,
        'image_url': _abs(request, photo.image),
        'photo_count': photo_count,
        'next_step': next_step,
        'redirect': reverse('shop:choose_photo_page', args=[selection.id]) if next_step == 'choose' else None,
    })


def choose_photo_page(request, selection_id):
    """촬영된 2장 중 선택하는 화면에 필요한 데이터"""
    selection = get_object_or_404(PersonaSelection, id=selection_id)
    photos = selection.captured_photos.all()

    if photos.count() < 2:
        return JsonResponse({
            'error': '아직 2장을 촬영하지 않았습니다.',
            'redirect': reverse('shop:capture_photo', args=[selection.id]),
        }, status=409)

    return JsonResponse({
        'selection_id': selection.id,
        'photos': [{'id': p.id, 'image_url': _abs(request, p.image)} for p in photos],
    })


@require_POST
def choose_photo(request, selection_id):
    """2장 중 하나를 최종 선택으로 표시"""
    selection = get_object_or_404(PersonaSelection, id=selection_id)
    photo_id = request.POST.get('photo_id')
    chosen_photo = get_object_or_404(CapturedPhoto, id=photo_id, selection=selection)

    selection.captured_photos.update(is_chosen=False)
    chosen_photo.is_chosen = True
    chosen_photo.save()

    # 사진이 확정되는 순간, 처음 두 시대(1976·2005)를 바로 백그라운드로 미리 시작.
    # 세 번째(2016)는 기존처럼 1976 결과를 보는 동안 한 칸씩 프리페치하도록 남겨둬서
    # 동시 진행 개수를 최대 2개로 제한한다 (DB 쓰기 충돌/API 동시 요청 리스크 완화).
    for era in ERA_ORDER[:2]:
        if era != '2026':
            _kick_off_era_generation(selection, era)

    # 사진 선택이 끝나면 첫 번째 시대(1976) 로딩 화면으로 이동
    return JsonResponse({
        'success': True,
        'redirect': reverse('shop:era_loading', args=[selection.id, ERA_ORDER[0]]),
    })


FINISH_MESSAGES = {
    'alone': 'TIME PORTAL의 여정이 마무리되었습니다. 이제 MCM HAUS에서 마음에 든 제품을 직접 만나보세요.',
    'with_staff': 'TIME PORTAL의 여정이 마무리되었습니다. 잠시만 기다려주세요. 직원이 잠시 후 도착합니다.',
}


def finish_selection(request, selection_id):
    selection = get_object_or_404(PersonaSelection, id=selection_id)

    if request.method == 'POST':
        mode = request.POST.get('mode')
        if mode not in FINISH_MESSAGES:
            return JsonResponse({'error': '잘못된 모드입니다.'}, status=400)

        if mode == 'with_staff':
            pass  # TODO: 직원 호출 알림 등 필요 시 여기에 추가

        # 여기서는 안내 문구만 돌려준다 — 로그아웃/세션 초기화는 사용자가 모달의
        # "처음으로"를 눌렀을 때만 별도로 restart_view를 호출해서 수행한다
        # (모드 선택 자체가 곧바로 로그아웃으로 이어지면 안 됨).
        return JsonResponse({
            'success': True,
            'message': FINISH_MESSAGES[mode],
        })

    return JsonResponse({
        'selection_id': selection.id,
        'messages': FINISH_MESSAGES,
    })


def recommend_products(request, selection_id):
    """선택한 가방에 고정으로 매핑된 추천 상품 보여주기"""
    selection = get_object_or_404(PersonaSelection, id=selection_id)

    recommended_products = selection.product.recommended_products.all()[:4]

    return JsonResponse({
        'selection_id': selection.id,
        'products': [_product_json(request, p) for p in recommended_products],
        # 비로그인 사용자는 장바구니 담기 기능 자체를 못 쓰므로, 버튼 노출 여부를
        # 프론트에서 판단할 수 있게 로그인 상태를 함께 내려준다.
        'cart_enabled': request.user.is_authenticated,
    })


@require_POST
def add_to_cart(request, product_id):
    """추천 상품 장바구니 담기 (로그인 필요)"""
    if not request.user.is_authenticated:
        return JsonResponse(
            {'error': '로그인이 필요한 기능입니다. 원하시는 상품은 직원에게 알려주세요.'},
            status=401
        )

    product = get_object_or_404(Product, id=product_id)
    CartItem.objects.create(user=request.user, product=product)

    return JsonResponse({'success': True})


# ---- 시대별 로딩 / 생성 / 결과 / 재생성 ----

def _get_or_create_result(selection, era):
    result, _ = PersonaResult.objects.get_or_create(selection=selection, era=era)
    return result


def _run_generation_in_background(result_id, target_field='generated_image'):
    """다음 시대 이미지를 백그라운드 스레드에서 미리 생성.

    호출하는 쪽에서 이미 result.status를 'processing'으로 바꿔둔 뒤 불러야 한다
    (그래야 이 스레드가 끝나기 전에 다른 요청이 같은 result를 중복 생성하지 않음).
    스레드는 별도 DB 커넥션을 쓰므로 시작/종료 시 close_old_connections()로 정리한다."""

    def _run():
        close_old_connections()
        try:
            result = PersonaResult.objects.get(id=result_id)
            ai_service.generate_result(result, target_field=target_field)
        except Exception as e:
            print(f"[background_generate 실패] result={result_id}: {e}")
            try:
                PersonaResult.objects.filter(id=result_id).update(status='failed')
            except Exception:
                pass
        finally:
            close_old_connections()

    threading.Thread(target=_run, daemon=True).start()


def _kick_off_era_generation(selection, era):
    """해당 시대의 PersonaResult가 아직 시작 전(pending)이면 백그라운드 생성을 시작한다.
    이미 진행 중/완료/실패한 상태면 아무것도 하지 않는다 — 특히 실패했던 걸 여기서
    조용히 재시도하면 사용자 모르게 API 비용이 또 나갈 수 있으므로, 실패 후 재시도는
    로딩 화면에서 사용자가 명시적으로 트리거하는 기존 흐름 그대로 둔다."""
    result, _ = PersonaResult.objects.get_or_create(selection=selection, era=era)
    if result.status != 'pending':
        return

    result.status = 'processing'
    result.save()
    _run_generation_in_background(result.id)


def _prefetch_next_era(selection, era):
    """현재 결과 화면(era)을 보고 있는 동안, 다음 시대 이미지를 미리 생성 시작.
    2026(현재)은 합성이 아니라 실시간 촬영이라 프리페치 대상이 아님."""
    upcoming_era = next_era(era)
    if not upcoming_era or upcoming_era == '2026':
        return
    _kick_off_era_generation(selection, upcoming_era)


def _is_stale_processing(result):
    """백그라운드 스레드가 죽었거나(서버 재시작 등) 응답 없이 오래 멈춰 있는지 확인.
    'processing' 상태인데 STALE_PROCESSING_THRESHOLD보다 오래 갱신이 없으면 죽은 것으로 본다."""
    return (
        result.status == 'processing'
        and timezone.now() - result.updated_at > STALE_PROCESSING_THRESHOLD
    )


def era_list(request):
    """시대 순서 + 각 시대 메타데이터(제목/설명/타임라인 표시용) 전체 목록.
    정적인 데이터라 프론트에서 앱 진입 시 한 번만 불러와 캐싱해두면 된다."""
    return JsonResponse({
        'era_order': ERA_ORDER,
        'era_meta': ERA_META,
    })


def era_loading(request, selection_id, era):
    """시대 이동 로딩 화면에 필요한 메타데이터. 실제 진행률 표시/폴링/생성 요청은
    프론트가 era_status / era_generate를 호출해서 직접 처리한다 (아래 두 엔드포인트).

    참고: 프리페치로 이미 status='done'이어도 여기서 결과로 자동 리다이렉트하지 않는다 —
    최소 노출 시간(로딩 UI)을 프론트가 스스로 챙길 수 있도록 상태 판단은 프론트에 맡긴다."""
    selection = get_object_or_404(PersonaSelection, id=selection_id)
    if era not in ERA_ORDER:
        return JsonResponse({'error': '알 수 없는 시대입니다.'}, status=404)

    return JsonResponse({
        'selection_id': selection.id,
        'era': era,
        'era_meta': ERA_META[era],
    })


def era_status(request, selection_id, era):
    """로딩 화면 폴링용 — 백그라운드 프리페치를 포함해 현재 생성 상태만 조회."""
    selection = get_object_or_404(PersonaSelection, id=selection_id)
    if era not in ERA_ORDER:
        return JsonResponse({'error': '알 수 없는 시대입니다.'}, status=400)

    result = _get_or_create_result(selection, era)

    if result.status == 'done':
        return JsonResponse({
            'status': 'done',
            'redirect': reverse('shop:era_result', args=[selection.id, era]),
        })

    return JsonResponse({'status': result.status})


@require_POST
def era_generate(request, selection_id, era):
    """실제 gpt-image-2 호출. 로딩 화면의 fetch가 이 엔드포인트를 호출."""
    selection = get_object_or_404(PersonaSelection, id=selection_id)
    if era not in ERA_ORDER:
        return JsonResponse({'error': '알 수 없는 시대입니다.'}, status=400)

    result = _get_or_create_result(selection, era)

    if result.status == 'done':
        return JsonResponse({
            'success': True,
            'redirect': reverse('shop:era_result', args=[selection.id, era]),
        })

    if result.status == 'processing' and not _is_stale_processing(result):
        # 이미 백그라운드 프리페치(또는 다른 탭 요청)로 생성이 진행 중 —
        # 여기서 또 생성을 시작하면 같은 결과를 두 번 만드는 셈이라 상태만 알려주고
        # 프런트에서 폴링하도록 한다
        return JsonResponse({'processing': True})

    if result.status == 'processing':
        # 'processing'인데 오래 갱신이 없음 -> 백그라운드 스레드가 죽은 것으로 보고 재시도
        print(f"[era_generate] stale processing 감지, 재시도: selection={selection.id} era={era}")

    result.status = 'processing'
    result.save()

    try:
        ai_service.generate_result(result)
    except Exception as e:
        print(f"[era_generate 실패] selection={selection.id} era={era}: {e}")
        result.status = 'failed'
        result.save()
        return JsonResponse(
            {'error': '이미지 생성에 실패했어요. 잠시 후 다시 시도해주세요.'},
            status=500,
        )

    return JsonResponse({
        'success': True,
        'image_url': _abs(request, result.generated_image),
        'redirect': reverse('shop:era_result', args=[selection.id, era]),
    })


def era_result(request, selection_id, era):
    """시대별 합성 결과 화면에 필요한 데이터. 아직 생성 안 됐으면 로딩 상태로 응답."""
    selection = get_object_or_404(PersonaSelection, id=selection_id)
    if era not in ERA_ORDER:
        return JsonResponse({'error': '알 수 없는 시대입니다.'}, status=404)

    result = get_object_or_404(PersonaResult, selection=selection, era=era)
    if result.status != 'done':
        # 아직 결과가 없음 — 프론트는 이 응답을 받으면 로딩 화면(폴링)으로 진입하면 된다
        return JsonResponse({
            'status': result.status,
            'redirect': reverse('shop:era_loading', args=[selection.id, era]),
        }, status=202)

    # 사용자가 이 결과를 보는 동안 다음 시대 이미지를 백그라운드에서 미리 생성 시작
    _prefetch_next_era(selection, era)

    # "다시 생성"으로 만든 후보가 아직 남아있으면(선택 전) 결과 화면에는 새로 만든
    # 후보 이미지를 보여주고, "다시 생성" 대신 "사진 선택하기" 버튼을 노출한다.
    has_candidate = bool(result.regen_candidate_image)

    context = {
        'status': 'done',
        'selection_id': selection.id,
        'era': era,
        'era_meta': ERA_META[era],
        'era_order': ERA_ORDER,
        'image_url': _abs(request, result.generated_image),
        'has_candidate': has_candidate,
        'candidate_image_url': _abs(request, result.regen_candidate_image) if has_candidate else None,
        # 2026(현재)은 합성이 아니라 원본 사진이라 다시 생성 대상이 아님
        'can_regenerate': (not has_candidate) and (not result.regenerated) and era != '2026',
        'next_era': next_era(era),
    }
    return JsonResponse(context)


@require_POST
def era_regenerate(request, selection_id, era):
    """'다시 생성' — 시대당 1회만 허용, 서버에서 강제.

    기존 generated_image는 건드리지 않고 regen_candidate_image에 새 이미지를 만들어둔 뒤,
    사용자가 둘 중 하나를 고르는 선택 화면(era_regen_choose)으로 보낸다."""
    selection = get_object_or_404(PersonaSelection, id=selection_id)
    result = get_object_or_404(PersonaResult, selection=selection, era=era)

    if era == '2026':
        return JsonResponse({'error': '현재 시대는 다시 생성할 수 없습니다.'}, status=400)
    if result.regenerated:
        return JsonResponse({'error': '이미 다시 생성을 사용했습니다.'}, status=400)

    # 실패 시 되돌릴 수 있게, regenerated 플래그는 성공했을 때만 저장한다
    # (이렇게 안 하면 일시적인 API 오류 하나로 재생성 기회를 그냥 날리게 됨)
    previous_status = result.status
    result.status = 'processing'
    result.save()

    try:
        ai_service.generate_result(result, target_field='regen_candidate_image')
    except Exception as e:
        print(f"[era_regenerate 실패] selection={selection.id} era={era}: {e}")
        result.status = previous_status
        result.save()
        return JsonResponse(
            {'error': '다시 생성에 실패했어요. 잠시 후 다시 시도해주세요.'},
            status=500,
        )

    result.regenerated = True
    result.save()

    return JsonResponse({
        'success': True,
        'redirect': reverse('shop:era_regen_choose', args=[selection.id, era]),
    })


def era_regen_choose(request, selection_id, era):
    """'다시 생성' 직후, 기존 사진과 새로 생성된 사진 중 하나를 고르는 화면에 필요한 데이터."""
    selection = get_object_or_404(PersonaSelection, id=selection_id)
    result = get_object_or_404(PersonaResult, selection=selection, era=era)

    if not result.regen_candidate_image:
        # 고를 후보가 없으면(직접 URL 접근 등) 결과 화면으로 되돌림
        return JsonResponse({
            'error': '선택할 수 있는 후보 사진이 없습니다.',
            'redirect': reverse('shop:era_result', args=[selection.id, era]),
        }, status=409)

    return JsonResponse({
        'selection_id': selection.id,
        'era': era,
        'era_meta': ERA_META[era],
        'original_image_url': _abs(request, result.generated_image),
        'candidate_image_url': _abs(request, result.regen_candidate_image),
    })


@require_POST
def era_regen_confirm(request, selection_id, era):
    """선택 화면에서 최종적으로 고른 사진을 결과(generated_image)에 반영."""
    selection = get_object_or_404(PersonaSelection, id=selection_id)
    result = get_object_or_404(PersonaResult, selection=selection, era=era)

    choice = request.POST.get('choice')
    if choice not in ('original', 'candidate'):
        return JsonResponse({'error': '잘못된 선택입니다.'}, status=400)

    if choice == 'candidate':
        if not result.regen_candidate_image:
            return JsonResponse({'error': '선택할 수 있는 사진이 없습니다.'}, status=400)
        with result.regen_candidate_image.open('rb') as f:
            result.generated_image.save(
                f"result_{selection.id}_{era}.png",
                ContentFile(f.read()),
                save=False,
            )

    # 어떤 걸 골랐든 후보 이미지는 정리
    if result.regen_candidate_image:
        result.regen_candidate_image.delete(save=False)
    result.save()

    return JsonResponse({
        'success': True,
        'image_url': _abs(request, result.generated_image),
        'redirect': reverse('shop:era_result', args=[selection.id, era]),
    })


def era_2026_capture(request, selection_id):
    """시대4(현재)는 합성 없이, 이 시점에 새로 촬영한 사진을 그대로 결과로 사용.
    era_result(2016)의 '다음 시대로'가 이 화면으로 이동시킴."""
    selection = get_object_or_404(PersonaSelection, id=selection_id)
    result = _get_or_create_result(selection, '2026')

    if result.status == 'done':
        return JsonResponse({
            'status': 'done',
            'redirect': reverse('shop:era_result', args=[selection.id, '2026']),
        })

    return JsonResponse({
        'status': result.status,
        'selection_id': selection.id,
        'era_meta': ERA_META['2026'],
    })


@require_POST
def era_2026_capture_save(request, selection_id):
    """방금 찍은 사진(base64)을 합성 없이 바로 PersonaResult(era=2026)의 결과로 저장."""
    selection = get_object_or_404(PersonaSelection, id=selection_id)
    result = _get_or_create_result(selection, '2026')

    data_url = request.POST.get('image_data')
    if not data_url:
        return JsonResponse({'error': '이미지 데이터가 없습니다.'}, status=400)

    format_part, imgstr = data_url.split(';base64,')
    ext = format_part.split('/')[-1]

    result.generated_image.save(
        f"result_{selection.id}_2026.{ext}",
        ContentFile(base64.b64decode(imgstr)),
        save=False,
    )
    result.status = 'done'
    result.save()

    return JsonResponse({
        'success': True,
        'image_url': _abs(request, result.generated_image),
        'redirect': reverse('shop:era_result', args=[selection.id, '2026']),
    })


def passport_result(request, selection_id):
    """4개 시대 결과를 인생네컷처럼 모아 보여주는 최종 화면에 필요한 데이터."""
    selection = get_object_or_404(PersonaSelection, id=selection_id)
    results = PersonaResult.objects.filter(selection=selection, status='done').order_by('era')

    if results.count() < len(ERA_ORDER):
        for era in ERA_ORDER:
            if not results.filter(era=era).exists():
                return JsonResponse({
                    'error': f'{era} 시대 결과가 아직 준비되지 않았습니다.',
                    'redirect': reverse('shop:era_loading', args=[selection.id, era]),
                }, status=409)

    return JsonResponse({
        'selection_id': selection.id,
        'product_name': selection.product.name,
        'results': [
            {'era': r.era, 'image_url': _abs(request, r.generated_image)}
            for r in results
        ],
        'qrcode_url': reverse('shop:passport_qrcode', args=[selection.id]),
    })


def _build_passport_grid_image(results):
    """4개 PersonaResult 이미지를 하나의 네컷 이미지로 합성.

    PASSPORT_FRAME_PATH(constants.py)가 지정돼 있으면 그 프레임 이미지 위에
    PASSPORT_FRAME_SLOTS 좌표대로 사진을 앉혀서 합성하고, 지정돼 있지 않으면
    지금까지와 동일하게 단색 배경 위에 격자로 배치한다.
    프론트/디자인팀에서 프레임 에셋을 받으면 constants.py의 두 값만 채우면
    이 함수는 그대로 프레임 버전으로 동작한다."""
    if PASSPORT_FRAME_PATH:
        return _build_passport_grid_image_with_frame(results, PASSPORT_FRAME_PATH)
    return _build_passport_grid_image_plain(results)


def _build_passport_grid_image_plain(results):
    """프레임 없이: 단색 배경 위에 PASSPORT_FRAME_SLOTS 자리대로 사진만 배치(기존 방식)."""
    canvas = Image.new('RGB', PASSPORT_PLAIN_CANVAS_SIZE, color=PASSPORT_PLAIN_BACKGROUND_COLOR)

    for result, (x, y, w, h) in zip(results, PASSPORT_FRAME_SLOTS):
        with Image.open(result.generated_image.path) as img:
            img = img.convert('RGB').resize((w, h))
            canvas.paste(img, (x, y))

    return canvas


def _build_passport_grid_image_with_frame(results, frame_path):
    """프레임 PNG(사진 자리만 투명하게 뚫린 이미지) 위에 사진을 앉혀서 합성.
    캔버스 크기는 프레임 이미지 자체의 크기를 그대로 쓴다."""
    with Image.open(frame_path) as frame:
        frame = frame.convert('RGBA')
        canvas = Image.new('RGBA', frame.size, (0, 0, 0, 0))

        for result, (x, y, w, h) in zip(results, PASSPORT_FRAME_SLOTS):
            with Image.open(result.generated_image.path) as img:
                img = img.convert('RGB').resize((w, h))
                canvas.paste(img, (x, y))

        # 사진 위에 프레임을 얹기 — 프레임 자체의 알파 채널을 마스크로 써서
        # 투명한 자리(사진)는 그대로 비치고, 불투명한 자리(테두리/로고 등)는 프레임이 덮음
        canvas.paste(frame, (0, 0), frame)

    return canvas.convert('RGB')


def _get_or_build_passport_image(selection, results):
    """selection.passport_image에 캐싱된 네컷 합성 이미지를 반환하고, 없으면
    (또는 파일이 사라졌으면) 새로 만들어서 저장해둔다.

    미리보기 화면 로드, 다운로드 클릭, QR 재스캔 등 여러 번 요청이 와도 매번
    4장을 다시 열어서 합성하지 않고 한 번 만든 결과를 재사용하기 위함.
    한 selection의 4개 결과는 passport 화면에 도달한 시점엔 더 이상 바뀌지
    않으므로(재생성은 그 전에만 가능) 별도 무효화 로직 없이 캐시해도 안전하다."""
    if selection.passport_image and default_storage.exists(selection.passport_image.name):
        return selection.passport_image

    canvas = _build_passport_grid_image(results)
    buffer = io.BytesIO()
    canvas.save(buffer, format='PNG')
    selection.passport_image.save(
        f"passport_{selection.id}.png",
        ContentFile(buffer.getvalue()),
        save=True,
    )
    return selection.passport_image


def passport_preview(request, selection_id):
    """QR코드를 스캔하면 도착하는 미리보기 화면에 필요한 데이터. 사진을 확인한 뒤
    '다운로드' 버튼을 직접 눌러야 다운로드가 시작된다(스캔하자마자 바로 다운로드되던 것에서 변경)."""
    selection = get_object_or_404(PersonaSelection, id=selection_id)
    results = PersonaResult.objects.filter(selection=selection, status='done').order_by('era')

    if results.count() < len(ERA_ORDER):
        return JsonResponse({'error': '아직 모든 시대의 결과가 준비되지 않았습니다.'}, status=404)

    return JsonResponse({
        'selection_id': selection.id,
        'preview_image_url': request.build_absolute_uri(
            reverse('shop:passport_preview_image', args=[selection.id])
        ),
        'download_url': request.build_absolute_uri(
            reverse('shop:passport_download', args=[selection.id])
        ),
    })


def passport_preview_image(request, selection_id):
    """미리보기 화면에 표시할 네컷 이미지(바이너리 PNG 응답 — JSON 아님).
    passport_download와 같은 이미지를 재사용하되, Content-Disposition을 attachment로
    주지 않아서 <img>로 바로 보여줄 수 있다."""
    selection = get_object_or_404(PersonaSelection, id=selection_id)
    results = list(PersonaResult.objects.filter(selection=selection, status='done').order_by('era'))

    if len(results) < len(ERA_ORDER):
        return JsonResponse({'error': '아직 모든 시대의 결과가 준비되지 않았습니다.'}, status=404)

    passport_image = _get_or_build_passport_image(selection, results)
    with passport_image.open('rb') as f:
        return HttpResponse(f.read(), content_type='image/png')


def passport_download(request, selection_id):
    """4개 시대 결과를 하나의 네컷 이미지로 합쳐서 다운로드용으로 반환(바이너리 PNG 응답 — JSON 아님).
    미리보기 화면의 '다운로드' 버튼이 이 URL을 가리킨다."""
    selection = get_object_or_404(PersonaSelection, id=selection_id)
    results = list(PersonaResult.objects.filter(selection=selection, status='done').order_by('era'))

    if len(results) < len(ERA_ORDER):
        return JsonResponse({'error': '아직 모든 시대의 결과가 준비되지 않았습니다.'}, status=404)

    passport_image = _get_or_build_passport_image(selection, results)
    with passport_image.open('rb') as f:
        data = f.read()

    response = HttpResponse(data, content_type='image/png')
    response['Content-Disposition'] = f'attachment; filename="time_passport_{selection.id}.png"'
    return response


def passport_qrcode(request, selection_id):
    """네컷 미리보기 URL을 QR코드 이미지로 즉석 생성해서 반환.
    사용자가 휴대폰으로 스캔하면 미리보기 화면으로 이동하고, 거기서 다운로드 버튼을 눌러야 함."""
    selection = get_object_or_404(PersonaSelection, id=selection_id)
    target_url = request.build_absolute_uri(
        reverse('shop:passport_preview', args=[selection.id])
    )

    img = qrcode.make(target_url)
    buffer = io.BytesIO()
    img.save(buffer, format='PNG')

    return HttpResponse(buffer.getvalue(), content_type='image/png')