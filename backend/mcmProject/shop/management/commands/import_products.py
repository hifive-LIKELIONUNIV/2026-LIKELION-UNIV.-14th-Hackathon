"""
'MCM 상품 정리.xlsx' 형식의 엑셀 파일을 읽어서 Product를 생성/업데이트하는 관리 명령어.

사용법:
    python manage.py import_products "MCM 상품 정리.xlsx"
    python manage.py import_products "MCM 상품 정리.xlsx" --dry-run      # DB에 실제로 안 남기고 미리보기만
    python manage.py import_products "MCM 상품 정리.xlsx" --skip-images # 이미지 다운로드 생략(속도용)

엑셀에 시트 3개가 있다고 가정한다 (시트명이 바뀌면 이 파일 상단 상수만 고치면 됨):
  1) '3개 가방 상품'   — 가방 선택 화면에 나오는 핵심 3종(Stark/Pina/Ella). is_default=True로 저장.
  2) '가방 리스트'      — 전체 카탈로그(20여 종). is_default=False로 저장, 추천 연결은 안 함.
  3) '백팩 추천 상품'   — 핵심 3종 각각 아래에 추천 상품 3~4개씩 나열된 구조.
                         섹션 헤더(핵심 가방 이름) -> 컬럼 제목 줄('태그','제품명'...) -> 상품 행들
                         -> 빈 줄로 섹션 종료, 반복. 여기 나온 상품은 해당 핵심 가방의
                         recommended_products로 연결됨(신발/후드 등 가방이 아닌 상품도 포함될 수 있음).

같은 상품이 여러 시트에 중복으로 나오는 경우(예: 카탈로그 + 추천 양쪽에 있는 상품)는
'상품코드'로 매칭해서 하나로 합쳐진다 — 상품코드가 없는 행은 이름으로 매칭.
재실행해도 중복 생성되지 않고 기존 값을 최신 엑셀 내용으로 갱신한다.
"""

import re
import urllib.request
from decimal import Decimal, InvalidOperation

import openpyxl
from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand, CommandError

from shop.models import Product

MAIN_SHEET = '3개 가방 상품'
CATALOG_SHEET = '가방 리스트'
RECOMMEND_SHEET = '백팩 추천 상품'

URL_RE = re.compile(r'https?://\S+')
PRICE_RE = re.compile(r'\d[\d,]*')


def _clean(value):
    if value is None:
        return ''
    return str(value).strip()


def _first_url(value):
    """'블랙: url1, 꼬냑: url2' 처럼 라벨이 섞인 셀에서도 맨 처음 나오는 URL 하나만 뽑는다."""
    if not value:
        return None
    match = URL_RE.search(str(value))
    return match.group(0) if match else None


def _parse_price(value):
    """가격 셀 파싱. 대부분 숫자지만, 엑셀 수식이 깨져서 텍스트로 들어간 셀
    (예: '650000+D5C5:J5CB5:J5')도 있어서 맨 앞 숫자 덩어리만 뽑아 쓴다."""
    if value is None:
        return None
    if isinstance(value, (int, float)):
        return Decimal(str(value))
    text = str(value).replace(',', '')
    match = PRICE_RE.search(text)
    if not match:
        return None
    try:
        return Decimal(match.group(0).replace(',', ''))
    except InvalidOperation:
        return None


class Command(BaseCommand):
    help = "'MCM 상품 정리' 형식 엑셀을 읽어서 Product를 생성/업데이트합니다."

    def add_arguments(self, parser):
        parser.add_argument('xlsx_path', help='엑셀 파일 경로')
        parser.add_argument(
            '--skip-images', action='store_true',
            help='이미지 다운로드를 건너뜁니다 (속도 우선/네트워크 없을 때).',
        )
        parser.add_argument(
            '--dry-run', action='store_true',
            help='실제로 DB에 저장하지 않고 무엇이 처리될지만 출력합니다.',
        )

    def handle(self, *args, **options):
        path = options['xlsx_path']
        skip_images = options['skip_images']
        dry_run = options['dry_run']

        try:
            wb = openpyxl.load_workbook(path, data_only=True)
        except FileNotFoundError:
            raise CommandError(f"파일을 찾을 수 없습니다: {path}")

        for sheet_name in (MAIN_SHEET, CATALOG_SHEET, RECOMMEND_SHEET):
            if sheet_name not in wb.sheetnames:
                raise CommandError(
                    f"'{sheet_name}' 시트를 찾을 수 없습니다. "
                    f"엑셀에 있는 시트: {wb.sheetnames}"
                )

        main_products = self._import_main_sheet(wb[MAIN_SHEET], skip_images, dry_run)
        self._import_catalog_sheet(wb[CATALOG_SHEET], skip_images, dry_run)
        self._import_recommend_sheet(wb[RECOMMEND_SHEET], main_products, skip_images, dry_run)

        if dry_run:
            self.stdout.write(self.style.WARNING('--dry-run 모드였습니다 — 실제로 저장되지 않았습니다.'))
        else:
            self.stdout.write(self.style.SUCCESS('완료.'))

    # ---- 시트별 처리 ----

    def _import_main_sheet(self, ws, skip_images, dry_run):
        """'3개 가방 상품' — 가방 선택 화면의 핵심 3종 (is_default=True)."""
        self.stdout.write(f"[{MAIN_SHEET}] 처리 중...")
        result = {}
        for row in ws.iter_rows(min_row=2, values_only=True):
            if not row or not _clean(row[0] if len(row) > 0 else None):
                continue
            name, sku, subtitle, features, description, color, size, image_url, price = (
                tuple(row) + (None,) * 9
            )[:9]
            product = self._upsert_product(
                name=name, sku=sku, subtitle=subtitle, features=features, description=description,
                image_url=image_url, price=price, is_default=True,
                skip_images=skip_images, dry_run=dry_run,
            )
            result[_clean(name)] = product
        return result

    def _import_catalog_sheet(self, ws, skip_images, dry_run):
        """'가방 리스트' — 전체 카탈로그 (is_default=False). 추천 연결은 별도 시트에서 처리."""
        self.stdout.write(f"[{CATALOG_SHEET}] 처리 중...")
        for row in ws.iter_rows(min_row=2, values_only=True):
            if not row or not _clean(row[1] if len(row) > 1 else None):
                continue
            tag, name, sku, subtitle, features, description, color, size, image_url, price = (
                tuple(row) + (None,) * 10
            )[:10]
            self._upsert_product(
                name=name, sku=sku, subtitle=subtitle, features=features, description=description,
                image_url=image_url, price=price, is_default=False,
                skip_images=skip_images, dry_run=dry_run,
            )

    def _import_recommend_sheet(self, ws, main_products, skip_images, dry_run):
        """'백팩 추천 상품' — 섹션(핵심 가방 이름) 아래에 추천 상품들이 나열된 구조.
        섹션 헤더 다음 줄은 컬럼 제목 줄이라 건너뛰고, 빈 줄이 나오면 섹션이 끝난 것으로 본다."""
        self.stdout.write(f"[{RECOMMEND_SHEET}] 처리 중...")
        current_main_name = None
        rows = list(ws.iter_rows(values_only=True))
        i = 0
        while i < len(rows):
            row = rows[i]
            first = _clean(row[0]) if row else ''

            # 진짜 빈 줄(모든 칸이 비어있음)일 때만 섹션 종료로 본다 — '가방 리스트'와
            # 마찬가지로 이 시트도 같은 카테고리가 이어지면 '태그' 칸(첫 칸)만 비워두는
            # 경우가 많아서, 첫 칸만 보고 판단하면 정상 데이터 행을 섹션 밖으로 오인함.
            if not row or all(_clean(c) == '' for c in row):
                current_main_name = None
                i += 1
                continue

            # 섹션 헤더: 1번째 칸에 핵심 가방 이름, 나머지 칸은 비어있음
            if first in main_products and all(_clean(c) == '' for c in row[1:]):
                current_main_name = first
                i += 1
                continue

            # 컬럼 제목 줄('태그','제품명',...)은 건너뜀
            if first == '태그':
                i += 1
                continue

            if current_main_name is None:
                i += 1
                continue

            tag, name, sku, subtitle, features, description, color, size, image_url, price = (
                tuple(row) + (None,) * 10
            )[:10]
            if not _clean(name):
                i += 1
                continue

            product = self._upsert_product(
                name=name, sku=sku, subtitle=subtitle, features=features, description=description,
                image_url=image_url, price=price, is_default=False,
                skip_images=skip_images, dry_run=dry_run,
            )
            if not dry_run and product is not None:
                main_products[current_main_name].recommended_products.add(product)
            i += 1

    # ---- 공통 upsert ----

    def _upsert_product(self, *, name, sku, subtitle, features, description, image_url, price,
                         is_default, skip_images, dry_run):
        name = _clean(name)
        if not name:
            return None

        sku = _clean(sku)
        subtitle = _clean(subtitle)[:200]  # Product.subtitle max_length=200
        full_description = _clean(description)
        features_text = _clean(features)
        if features_text:
            full_description = f"{full_description}\n\n{features_text}".strip()
        price_value = _parse_price(price)

        if dry_run:
            self.stdout.write(f"  - (dry-run) {name} [{sku or '코드없음'}] {price_value}")
            return None

        lookup = {'sku': sku} if sku else {'name': name}
        product, created = Product.objects.get_or_create(
            **lookup,
            defaults={
                'name': name,
                'subtitle': subtitle,
                'description': full_description,
                'price': price_value,
                'is_default': is_default,
                'sku': sku,
            },
        )
        # 이미 있던 상품이면 최신 엑셀 내용으로 갱신 (이미지는 아래에서 별도 처리 — 있으면 안 건드림)
        product.name = name
        product.subtitle = subtitle
        product.description = full_description
        product.price = price_value
        product.sku = sku
        if is_default:
            product.is_default = True  # 핵심 3종은 다른 시트에서 덮어써도 계속 True 유지
        product.save()

        if not skip_images and not product.image:
            url = _first_url(image_url)
            if url:
                self._download_image(product, url)

        action = '생성' if created else '갱신'
        self.stdout.write(f"  - {action}: {name} [{sku or '코드없음'}]")
        return product

    def _download_image(self, product, url):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=10) as resp:
                data = resp.read()
        except Exception as e:
            self.stdout.write(self.style.WARNING(f"    이미지 다운로드 실패({product.name}): {e}"))
            return

        filename = f"{product.sku or product.pk}.jpg"
        product.image.save(filename, ContentFile(data), save=True)
