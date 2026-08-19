import requests
from urllib.parse import urlparse
from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand
import openpyxl
from shop.models import Product


class Command(BaseCommand):
    help = 'MCM 상품 정리.xlsx를 읽어서 Product 테이블에 저장'

    def add_arguments(self, parser):
        parser.add_argument('excel_path', type=str, help='엑셀 파일 경로')
        parser.add_argument(
            '--no-image',
            action='store_true',
            help='이미지 다운로드 생략 (텍스트만 먼저 채울 때)'
        )

    def handle(self, *args, **options):
        path = options['excel_path']
        skip_image = options['no_image']

        wb = openpyxl.load_workbook(path, data_only=True)
        ws = wb.active

        created, updated, skipped, image_fail = 0, 0, 0, 0

        # 헤더 순서: 제품명, 상품코드, 상세정보, 특성, 설명, 색깔, 크기, 사진 링크, 가격
        for row in ws.iter_rows(min_row=2, values_only=True):
            if not row or not row[0]:
                skipped += 1
                continue

            (
                name, product_code, detail_info, feature,
                desc, color, size, image_url, price
            ) = (row + (None,) * 9)[:9]

            color = (color or '').replace('\xa0', '').strip()
            size = (size or '').replace('\xa0', '').strip()

            obj, is_created = Product.objects.update_or_create(
                product_code=product_code,
                defaults={
                    'name': name or '',
                    'detail_info': (detail_info or '').strip(),
                    'feature': (feature or '').strip(),
                    'description': (desc or '').strip(),
                    'color': color,
                    'size': size,
                    'price': price or None,
                }
            )
            created += is_created
            updated += (not is_created)

            # 이미지 다운로드 & 저장
            if not skip_image and image_url:
                try:
                    headers = {
                        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) '
                                       'AppleWebKit/537.36 (KHTML, like Gecko) '
                                       'Chrome/120.0.0.0 Safari/537.36',
                        'Referer': 'https://www.mcmworldwide.com/',
                    }
                    resp = requests.get(image_url, headers=headers, timeout=10)
                    resp.raise_for_status()
                    ext = urlparse(image_url).path.split('.')[-1].split('?')[0] or 'jpg'
                    if len(ext) > 4:
                        ext = 'jpg'
                    filename = f'{obj.id}.{ext}'
                    obj.image.save(filename, ContentFile(resp.content), save=True)
                except Exception as e:
                    image_fail += 1
                    self.stdout.write(self.style.WARNING(
                        f'이미지 다운로드 실패 ({name}): {e}'
                    ))

        self.stdout.write(self.style.SUCCESS(
            f'완료: 생성 {created}건, 업데이트 {updated}건, 스킵 {skipped}건, '
            f'이미지 실패 {image_fail}건'
        ))