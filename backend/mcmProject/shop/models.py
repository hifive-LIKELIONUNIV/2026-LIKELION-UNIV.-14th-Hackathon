from django.db import models
from django.conf import settings

class Product(models.Model):
    name = models.CharField(max_length=100)
    subtitle = models.CharField(max_length=200, blank=True)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to='products/', blank=True, null=True)
    is_default = models.BooleanField(default=False)
    price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    recommended_products = models.ManyToManyField(
        'self',
        blank=True,
        symmetrical=False,
        related_name='recommended_by'
    )

    def __str__(self):
        return self.name


class CartItem(models.Model):
    """유저의 장바구니 아이템"""
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='cart_items'
    )
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-added_at']  

    def __str__(self):
        return f"{self.user} - {self.product.name}"


class PersonaSelection(models.Model):
    """유저가 고른 가방 (합성 대상). 하나의 선택 = 이후 4개 시대 결과가 매달림"""
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='persona_selections',
        null=True,   
        blank=True
    )
    session_key = models.CharField(max_length=40, null=True, blank=True)  # 비로그인 유저 식별용
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        who = self.user if self.user else f"guest({self.session_key})"
        return f"{who} - {self.product.name}"


class PersonaResult(models.Model):
    """가방 선택 하나당 4개 시대별로 합성된 결과"""

    ERA_CHOICES = [
        ('1976', '1976'),
        ('2005', '2005'),
        ('2016', '2016'),
        ('2026', '2026'),
    ]

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('done', 'Done'),
        ('failed', 'Failed'),
    ]

    selection = models.ForeignKey(
        PersonaSelection,
        on_delete=models.CASCADE,
        related_name='results'
    )
    era = models.CharField(max_length=4, choices=ERA_CHOICES)
    generated_image = models.ImageField(upload_to='persona_results/', blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['era']
        unique_together = ('selection', 'era')  
    def __str__(self):
        return f"{self.selection} - {self.era} ({self.status})"

class CapturedPhoto(models.Model):
    """웹캠으로 촬영된 사진 (선택 전 후보, 2장)"""
    selection = models.ForeignKey(
        PersonaSelection,
        on_delete=models.CASCADE,
        related_name='captured_photos'
    )
    image = models.ImageField(upload_to='captured_photos/')
    is_chosen = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"{self.selection} - photo #{self.id} ({'선택됨' if self.is_chosen else '미선택'})"