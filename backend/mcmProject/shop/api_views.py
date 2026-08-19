import json

from django.http import JsonResponse, Http404
from django.shortcuts import get_object_or_404
from django.views.decorators.http import require_POST

from .models import Product, PersonaSelection, PersonaResult, CapturedPhoto
from .constants import ERA_ORDER, next_era
from .views import _get_or_create_result, _kick_off_era_generation

# React SPA용 JSON 엔드포인트. HTML만 렌더링하던 기존 GET 뷰(select_bag, capture_photo,
# choose_photo_page, era_result, era_regen_choose, recommend_products, passport_result)를
# 대체하는 용도이고, 이미 JSON을 반환하는 POST 엔드포인트(save_photo, era_generate,
# era_status, era_regenerate, era_regen_confirm, era_2026_capture_save, add_to_cart)는
# 기존 shop/urls.py 경로를 그대로 재사용한다.
#
# 단, choose_photo(HTML 버전)는 JsonResponse가 아니라 실제 HTTP redirect(302)를 반환해서
# fetch로 호출하면 React 입장에서 다루기 애매하므로, 여기 choose_photo_api로 별도 재작성함.


def _product_dict(request, product):
    return {
        'id': product.id,
        'name': product.name,
        'subtitle': product.detail_info,
        'description': product.description,
        'image_url': request.build_absolute_uri(product.image.url) if product.image else None,
        'price': str(product.price) if product.price is not None else None,
    }


def products_list(request):
    """select_bag GET과 동일한 상품 조회 로직 (장바구니 있으면 장바구니, 없으면 기본 상품)."""
    cart_items = []
    if request.user.is_authenticated:
        from .models import CartItem
        cart_items = CartItem.objects.filter(user=request.user)[:3]

    if cart_items:
        products = [item.product for item in cart_items]
        message = "마음에 드는 가방을 골라주세요"
    else:
        products = Product.objects.filter(is_default=True)[:3]
        message = "취향에 맞는 가방을 골라주세요"

    return JsonResponse({
        'message': message,
        'products': [_product_dict(request, p) for p in products],
    })


@require_POST
def select_bag_api(request):
    """select_bag POST와 동일한 PersonaSelection 생성 로직."""
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'error': '잘못된 요청입니다.'}, status=400)

    product_id = data.get('product_id')
    product = get_object_or_404(Product, id=product_id)

    if not request.session.session_key:
        request.session.create()

    selection = PersonaSelection.objects.create(
        user=request.user if request.user.is_authenticated else None,
        session_key=None if request.user.is_authenticated else request.session.session_key,
        product=product,
    )

    return JsonResponse({'selection_id': selection.id})


def capture_status(request, selection_id):
    selection = get_object_or_404(PersonaSelection, id=selection_id)
    return JsonResponse({'photo_count': selection.captured_photos.count()})


@require_POST
def choose_photo_api(request, selection_id):
    """choose_photo(HTML, redirect 응답) POST와 동일한 로직 — 촬영된 2장 중 하나를 최종
    선택으로 표시하고, 첫 두 시대(1976·2005) 이미지 생성을 백그라운드로 바로 시작한다."""
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'error': '잘못된 요청입니다.'}, status=400)

    selection = get_object_or_404(PersonaSelection, id=selection_id)
    photo_id = data.get('photo_id')
    chosen_photo = get_object_or_404(CapturedPhoto, id=photo_id, selection=selection)

    selection.captured_photos.update(is_chosen=False)
    chosen_photo.is_chosen = True
    chosen_photo.save()

    for era in ERA_ORDER[:2]:
        if era != '2026':
            _kick_off_era_generation(selection, era)

    return JsonResponse({'success': True, 'first_era': ERA_ORDER[0]})


def photos_list(request, selection_id):
    selection = get_object_or_404(PersonaSelection, id=selection_id)
    photos = selection.captured_photos.all()
    return JsonResponse({
        'photos': [
            {'id': photo.id, 'image_url': request.build_absolute_uri(photo.image.url)}
            for photo in photos
        ],
    })


def era_result_api(request, selection_id, era):
    selection = get_object_or_404(PersonaSelection, id=selection_id)
    if era not in ERA_ORDER:
        return JsonResponse({'error': '알 수 없는 시대입니다.'}, status=400)

    result = _get_or_create_result(selection, era)

    has_candidate = bool(result.regen_candidate_image)

    return JsonResponse({
        'status': result.status,
        'image_url': request.build_absolute_uri(result.generated_image.url) if result.generated_image else None,
        'has_candidate': has_candidate,
        'can_regenerate': (not has_candidate) and (not result.regenerated) and era != '2026',
        'next_era': next_era(era),
    })


def era_regen_choice_api(request, selection_id, era):
    selection = get_object_or_404(PersonaSelection, id=selection_id)
    result = get_object_or_404(PersonaResult, selection=selection, era=era)

    if not result.regen_candidate_image:
        raise Http404("비교할 후보 이미지가 없습니다.")

    return JsonResponse({
        'original_image_url': request.build_absolute_uri(result.generated_image.url),
        'candidate_image_url': request.build_absolute_uri(result.regen_candidate_image.url),
    })


def era_2026_status(request, selection_id):
    selection = get_object_or_404(PersonaSelection, id=selection_id)
    result = _get_or_create_result(selection, '2026')
    return JsonResponse({
        'status': result.status,
        'image_url': request.build_absolute_uri(result.generated_image.url) if result.generated_image else None,
    })


def recommend_products_api(request, selection_id):
    selection = get_object_or_404(PersonaSelection, id=selection_id)
    products = selection.product.recommended_products.all()[:4]
    return JsonResponse({'products': [_product_dict(request, p) for p in products]})


def passport_api(request, selection_id):
    selection = get_object_or_404(PersonaSelection, id=selection_id)
    results = PersonaResult.objects.filter(selection=selection, status='done').order_by('era')

    ready = results.count() >= len(ERA_ORDER)

    return JsonResponse({
        'ready': ready,
        'results': [
            {'era': r.era, 'image_url': request.build_absolute_uri(r.generated_image.url)}
            for r in results
        ],
    })
