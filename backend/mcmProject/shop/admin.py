from django.contrib import admin
from .models import Product, CartItem, PersonaSelection, PersonaResult, CapturedPhoto, EraReference


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'subtitle', 'is_default', 'created_at')
    list_filter = ('is_default',)
    search_fields = ('name',)
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