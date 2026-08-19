from django.db import models
from django.conf import settings

from django.db import models
from django.conf import settings


class Product(models.Model):
    name = models.CharField('제품명', max_length=100)
    product_code = models.CharField('상품코드', max_length=50, unique=True)
    detail_info = models.TextField('상세정보', blank=True)
    feature = models.TextField('특성', blank=True)
    description = models.TextField('설명', blank=True)
    color = models.CharField('색깔', max_length=50, blank=True)
    size = models.CharField('크기', max_length=100, blank=True)
    image = models.ImageField('사진', upload_to='products/', blank=True, null=True)
    price = models.DecimalField('가격', max_digits=10, decimal_places=2, null=True, blank=True)

    is_default = models.BooleanField(default=False)
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

    # 4개 시대 결과를 합친 네컷 이미지 캐시. 미리보기/다운로드 요청마다 매번 다시
    # 합성하지 않도록, 한 번 만든 뒤 여기 저장해두고 재사용한다.
    passport_image = models.ImageField(upload_to='passports/', blank=True, null=True)

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
    # "다시 생성"으로 새로 만든 후보 이미지. 사용자가 기존/새 사진 중 하나를 고르기 전까지
    # generated_image는 건드리지 않고 여기에만 임시로 저장해둔다.
    regen_candidate_image = models.ImageField(upload_to='persona_results/', blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    regenerated = models.BooleanField(default=False)  # "다시 생성"은 시대당 1회만 허용
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['era']
        unique_together = ('selection', 'era')
    def __str__(self):
        return f"{self.selection} - {self.era} ({self.status})"


class EraReference(models.Model):
    """가방(Product)별 시대 합성에 쓰이는 레퍼런스 이미지 (관리자 페이지에서 업로드).
    2026(현재)은 합성이 아니라 촬영 사진을 그대로 쓰므로 레퍼런스가 필요 없음."""

    ERA_CHOICES = [
        ('1976', '1976'),
        ('2005', '2005'),
        ('2016', '2016'),
    ]

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='era_references'
    )
    era = models.CharField(max_length=4, choices=ERA_CHOICES)
    image = models.ImageField(upload_to='era_references/')
    detail_prompt = models.TextField(
        blank=True,
        help_text="이 가방×시대 조합에서 강조하고 싶은 디테일(선택사항). "
                   "작성하면 생성 프롬프트에 그대로 추가됩니다. (영어 권장)"
    )
    # detect_face_height_ratio()는 OpenCV Haar Cascade로 얼굴을 검출하는 연산이라
    # 매 생성 요청마다 다시 돌릴 필요가 없음 — 레퍼런스 이미지가 바뀌지 않는 한 결과가
    # 항상 같으므로 최초 1회 계산 후 여기 캐싱해둠.
    # face_height_ratio_computed로 "아직 계산 안 함"과 "계산했는데 얼굴 미검출(None)"을
    # 구분 — 안 그러면 얼굴 미검출 케이스가 캐싱되지 않고 매번 재계산됨.
    face_height_ratio = models.FloatField(null=True, blank=True, editable=False)
    face_height_ratio_computed = models.BooleanField(default=False, editable=False)

    class Meta:
        unique_together = ('product', 'era')

    def __str__(self):
        return f"{self.product.name} - {self.era}"

    def save(self, *args, **kwargs):
        # 관리자 페이지 등에서 image를 새로 업로드하면 캐싱된 비율이 더 이상 유효하지
        # 않으므로 자동으로 초기화 -> 다음 생성 요청 때 다시 계산됨
        if self.pk:
            previous = EraReference.objects.filter(pk=self.pk).values_list('image', flat=True).first()
            if previous is not None and previous != self.image.name:
                self.face_height_ratio = None
                self.face_height_ratio_computed = False
        super().save(*args, **kwargs)


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