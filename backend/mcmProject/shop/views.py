import base64
from django.core.files.base import ContentFile
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from django.shortcuts import render, redirect, get_object_or_404
from .models import Product, CartItem, PersonaSelection, CapturedPhoto


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
        return redirect('shop:capture_photo', selection_id=selection.id)

    cart_items = []

    if request.user.is_authenticated:
        cart_items = CartItem.objects.filter(user=request.user)[:3]

    if cart_items:
        products = [item.product for item in cart_items]
        message = "마음에 드는 가방을 골라주세요"
    else:
        products = Product.objects.filter(is_default=True)[:3]
        message = "취향에 맞는 가방을 골라주세요"

    context = {
        'products': products,
        'message': message,
    }
    return render(request, 'shop/select_bag.html', context)


def select_bag_done(request):
    """임시 완료 페이지 - 나중에 촬영 화면으로 대체"""
    return render(request, 'shop/select_bag_done.html')


def capture_photo(request, selection_id):
    """웹캠 촬영 화면 보여주기"""
    selection = get_object_or_404(PersonaSelection, id=selection_id)
    photo_count = selection.captured_photos.count()

    context = {
        'selection': selection,
        'photo_count': photo_count,
    }
    return render(request, 'shop/capture_photo.html', context)


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

    return JsonResponse({
        'success': True,
        'photo_count': photo_count,
        'next_step': 'choose' if photo_count >= 2 else 'capture_again',
    })


def choose_photo_page(request, selection_id):
    """촬영된 2장 중 선택하는 화면"""
    selection = get_object_or_404(PersonaSelection, id=selection_id)
    photos = selection.captured_photos.all()

    if photos.count() < 2:
        return redirect('shop:capture_photo', selection_id=selection.id)

    context = {
        'selection': selection,
        'photos': photos,
    }
    return render(request, 'shop/choose_photo.html', context)


@require_POST
def choose_photo(request, selection_id):
    """2장 중 하나를 최종 선택으로 표시"""
    selection = get_object_or_404(PersonaSelection, id=selection_id)
    photo_id = request.POST.get('photo_id')
    chosen_photo = get_object_or_404(CapturedPhoto, id=photo_id, selection=selection)

    selection.captured_photos.update(is_chosen=False)
    chosen_photo.is_chosen = True
    chosen_photo.save()

    # 임시로 완료 표시
    return redirect('shop:select_bag_done')