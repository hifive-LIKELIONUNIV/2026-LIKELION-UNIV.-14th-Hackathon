from django.contrib import admin
from .models import Product, CartItem, PersonaSelection, PersonaResult


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'subtitle', 'is_default', 'created_at')
    list_filter = ('is_default',)
    search_fields = ('name',)


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
    list_display = ('selection', 'era', 'status', 'created_at', 'updated_at')
    list_filter = ('era', 'status')