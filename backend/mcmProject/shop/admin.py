from django.contrib import admin
from .models import Product, CartItem, PersonaSelection, PersonaResult, CapturedPhoto, EraReference


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'product_code', 'color', 'price', 'is_default', 'created_at')
    list_filter = ('is_default', 'color')
    search_fields = ('name', 'product_code')
    filter_horizontal = ('recommended_products',)


@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ('user', 'product', 'added_at')
    list_filter = ('added_at',)


@admin.register(PersonaSelection)
class PersonaSelectionAdmin(admin.ModelAdmin):
    list_display = ('user', 'session_key', 'product', 'created_at')
    list_filter = ('created_at',)


@admin.register(PersonaResult)
class PersonaResultAdmin(admin.ModelAdmin):
    list_display = ('selection', 'era', 'status', 'regenerated', 'created_at', 'updated_at')
    list_filter = ('era', 'status')


@admin.register(EraReference)
class EraReferenceAdmin(admin.ModelAdmin):
    list_display = ('product', 'era')
    list_filter = ('era', 'product')


@admin.register(CapturedPhoto)
class CapturedPhotoAdmin(admin.ModelAdmin):
    list_display = ('selection', 'is_chosen', 'created_at')
    list_filter = ('is_chosen',)

    def get_changeform_initial_data(self, request):
        # 실제 웹캠 촬영 플로우에서는 두 장을 찍기 전까진 반드시 False여야 맞는 값이라
        # 모델의 기본값 자체는 그대로 둠. 다만 admin에서 웹캠 없이 사진을 직접 업로드해
        # 테스트할 때(README의 지름길 방법) 매번 수동으로 체크하는 게 번거로우니,
        # "추가" 폼에서만 기본으로 체크되어 보이도록 초기값만 바꿔준다.
        initial = super().get_changeform_initial_data(request)
        initial['is_chosen'] = True
        return initial