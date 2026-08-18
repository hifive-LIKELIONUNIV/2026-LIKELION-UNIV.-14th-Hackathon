from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('', include('onboarding.urls')),
    path('admin/', admin.site.urls),
    path('accounts/', include('accounts.urls')),
    path('shop/', include('shop.urls')),
    path('api/accounts/', include('accounts.api_urls')),
    path('api/shop/', include('shop.api_urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)