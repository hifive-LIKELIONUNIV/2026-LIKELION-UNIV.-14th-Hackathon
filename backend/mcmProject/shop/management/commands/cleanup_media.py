"""
저장 공간 관리용 커맨드.

행사 중 계속 쌓이는 미디어 파일(촬영사진/시대별 생성결과/네컷 이미지)을 3단계로 정리한다:

  1. 방치된 selection — 생성된 지 오래됐는데 passport(네컷)까지 완주 못 한 세션.
     관련 촬영사진/생성결과 파일과 DB 행을 전부 삭제.
  2. 선택 안 된 촬영사진 — 이미 사진 선택이 끝난 selection에 남아있는, 다시 쓰일 일
     없는 미선택 사진(원래 2장 중 안 고른 1장).
  3. 고아 파일 — 어떤 DB 행도 더 이상 참조하지 않는 미디어 파일(과거 DB 리셋 등으로
     생긴 것들 포함). 디스크를 직접 스캔해서 찾아낸다.

방금 촬영/생성 중인 방문객 파일을 실수로 건드리지 않도록, 2·3단계는 기본적으로
최근 1시간 이내에 수정된 파일은 건드리지 않는다(--min-age-minutes로 조절 가능).

사용 예:
    python manage.py cleanup_media --dry-run   # 미리보기만, 실제로 안 지움 (권장: 먼저 이걸로 확인)
    python manage.py cleanup_media             # 실제로 삭제
    python manage.py cleanup_media --abandoned-hours=6 --min-age-minutes=30
"""
import time
from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand
from django.utils import timezone

from shop.models import CapturedPhoto, PersonaResult, PersonaSelection

# 정리 대상으로 볼 미디어 하위 폴더 (레퍼런스/상품/프레임처럼 계속 유지해야 하는
# 자산은 여기 포함하지 않음 — era_references, products, frames, passports는 실수로라도
# 건드리면 안 되므로 passports도 제외하고 DB에서 참조하는 것만 남기는 방식으로 다룸)
MANAGED_SUBDIRS = ['captured_photos', 'persona_results']

DEFAULT_MIN_AGE_MINUTES = 60
DEFAULT_ABANDONED_HOURS = 12


class Command(BaseCommand):
    help = "촬영사진/생성결과 중 방치된 세션, 선택 안 된 사진, 고아 파일을 정리해서 저장 공간을 회수한다."

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run', action='store_true',
            help="실제로 삭제하지 않고 무엇이 지워질지만 보여준다.",
        )
        parser.add_argument(
            '--abandoned-hours', type=int, default=DEFAULT_ABANDONED_HOURS,
            help=f"이 시간(시간 단위) 이상 지났는데 passport를 완료 못한 selection을 "
                 f"방치된 것으로 본다. 기본 {DEFAULT_ABANDONED_HOURS}시간.",
        )
        parser.add_argument(
            '--min-age-minutes', type=int, default=DEFAULT_MIN_AGE_MINUTES,
            help=f"선택 안 된 사진/고아 파일 정리 시, 이보다 최근에 수정된 파일은 "
                 f"안전을 위해 건너뛴다. 기본 {DEFAULT_MIN_AGE_MINUTES}분.",
        )

    def handle(self, *args, **options):
        self.dry_run = options['dry_run']
        self.abandoned_hours = options['abandoned_hours']
        self.min_age_minutes = options['min_age_minutes']

        if self.dry_run:
            self.stdout.write(self.style.WARNING("[DRY RUN] 실제로 삭제하지 않고 미리보기만 합니다.\n"))

        total_freed = 0
        total_freed += self._cleanup_abandoned_selections()
        total_freed += self._cleanup_unchosen_photos()
        total_freed += self._cleanup_orphan_files()

        label = "예상 회수 용량" if self.dry_run else "실제 회수한 용량"
        self.stdout.write(self.style.SUCCESS(f"\n총 {label}: {self._human_size(total_freed)}"))
        if self.dry_run:
            self.stdout.write("실제로 지우려면 --dry-run 없이 다시 실행하세요.")

    # ---- 유틸 ----

    def _human_size(self, num_bytes):
        size = float(num_bytes)
        for unit in ['B', 'KB', 'MB', 'GB']:
            if size < 1024:
                return f"{size:.1f}{unit}"
            size /= 1024
        return f"{size:.1f}TB"

    def _file_size(self, field_file):
        try:
            return field_file.size
        except Exception:
            return 0

    def _delete_field_file(self, field_file):
        """FieldFile을 안전하게 삭제(용량만 미리 재고, dry-run이면 실제 삭제는 안 함)."""
        if not field_file:
            return 0
        size = self._file_size(field_file)
        if not self.dry_run:
            try:
                field_file.delete(save=False)
            except Exception as e:
                self.stderr.write(f"  파일 삭제 실패({field_file.name}): {e}")
                return 0
        return size

    # ---- 1단계: 방치된 selection ----

    def _cleanup_abandoned_selections(self):
        cutoff = timezone.now() - timezone.timedelta(hours=self.abandoned_hours)
        qs = PersonaSelection.objects.filter(created_at__lt=cutoff, passport_image='')

        if not qs.exists():
            self.stdout.write("[1/3] 방치된 selection 없음.")
            return 0

        prefix = "[DRY RUN] " if self.dry_run else ""
        total_size = 0
        count = 0

        for selection in qs:
            sel_size = 0
            for photo in selection.captured_photos.all():
                sel_size += self._delete_field_file(photo.image)
            for result in selection.results.all():
                sel_size += self._delete_field_file(result.generated_image)
                sel_size += self._delete_field_file(result.regen_candidate_image)

            self.stdout.write(
                f"{prefix}selection #{selection.id} "
                f"({selection.created_at:%Y-%m-%d %H:%M} 생성) 정리 — {self._human_size(sel_size)}"
            )

            if not self.dry_run:
                selection.delete()  # CASCADE로 captured_photos/results DB 행도 함께 삭제됨

            total_size += sel_size
            count += 1

        self.stdout.write(f"[1/3] 방치된 selection {count}개 정리 — {self._human_size(total_size)}\n")
        return total_size

    # ---- 2단계: 선택 안 된 촬영사진 ----

    def _cleanup_unchosen_photos(self):
        # 이미 선택이 끝난(=is_chosen=True인 사진이 있는) selection의 미선택 사진만 대상.
        # 아직 선택 전(2장 다 남아있어야 하는 상태)인 selection은 절대 건드리지 않음.
        chosen_selection_ids = list(
            CapturedPhoto.objects.filter(is_chosen=True)
            .values_list('selection_id', flat=True).distinct()
        )

        cutoff = timezone.now() - timezone.timedelta(minutes=self.min_age_minutes)
        qs = CapturedPhoto.objects.filter(
            selection_id__in=chosen_selection_ids,
            is_chosen=False,
            created_at__lt=cutoff,
        )

        count = qs.count()
        if count == 0:
            self.stdout.write("[2/3] 선택 안 된 촬영사진 없음.")
            return 0

        prefix = "[DRY RUN] " if self.dry_run else ""
        total_size = 0
        for photo in qs:
            total_size += self._delete_field_file(photo.image)
            if not self.dry_run:
                photo.delete()

        self.stdout.write(f"{prefix}[2/3] 선택 안 된 촬영사진 {count}개 정리 — {self._human_size(total_size)}\n")
        return total_size

    # ---- 3단계: 고아 파일 ----

    def _referenced_paths(self):
        """현재 DB가 참조 중인 모든 관리대상 미디어 파일의 절대경로 집합."""
        paths = set()
        for photo in CapturedPhoto.objects.all():
            if photo.image:
                paths.add(str(Path(photo.image.path).resolve()))
        for result in PersonaResult.objects.all():
            if result.generated_image:
                paths.add(str(Path(result.generated_image.path).resolve()))
            if result.regen_candidate_image:
                paths.add(str(Path(result.regen_candidate_image.path).resolve()))
        return paths

    def _cleanup_orphan_files(self):
        referenced = self._referenced_paths()
        cutoff_ts = time.time() - (self.min_age_minutes * 60)

        prefix = "[DRY RUN] " if self.dry_run else ""
        total_size = 0
        count = 0

        for subdir in MANAGED_SUBDIRS:
            dir_path = Path(settings.MEDIA_ROOT) / subdir
            if not dir_path.exists():
                continue
            for file_path in dir_path.iterdir():
                if not file_path.is_file():
                    continue
                if str(file_path.resolve()) in referenced:
                    continue
                try:
                    stat = file_path.stat()
                except OSError:
                    continue
                if stat.st_mtime > cutoff_ts:
                    continue  # 방금 생긴 파일 — 아직 DB에 연결되는 중일 수 있으니 건너뜀

                if not self.dry_run:
                    try:
                        file_path.unlink()
                    except OSError as e:
                        self.stderr.write(f"  고아 파일 삭제 실패({file_path}): {e}")
                        continue

                total_size += stat.st_size
                count += 1

        self.stdout.write(f"{prefix}[3/3] 고아 파일 {count}개 정리 — {self._human_size(total_size)}\n")
        return total_size
