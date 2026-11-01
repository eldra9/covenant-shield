import os
from django.conf import settings
from django.http import FileResponse, Http404
from rest_framework import permissions, views
from rest_framework.response import Response


class HealthView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, *args, **kwargs):
        return Response({
            'status': 'ok',
            'service': 'Covenant Shield API',
            'debug': settings.DEBUG,
            'version': '1.0.0',
        })


class DownloadApkView(views.APIView):
    """Serve the compiled Android APK file directly for download."""
    permission_classes = [permissions.AllowAny]

    def get(self, request, *args, **kwargs):
        apk_path = os.path.join(settings.BASE_DIR, 'downloads', 'AegisGuard.apk')
        if not os.path.exists(apk_path):
            raise Http404("APK file not found")
        response = FileResponse(open(apk_path, 'rb'), content_type='application/vnd.android.package-archive')
        response['Content-Disposition'] = 'attachment; filename="AegisGuard.apk"'
        response['Content-Length'] = os.path.getsize(apk_path)
        return response


class AppDownloadInfoView(views.APIView):
    """Metadata and instructions for both Android and iOS app downloads."""
    permission_classes = [permissions.AllowAny]

    def get(self, request, *args, **kwargs):
        apk_path = os.path.join(settings.BASE_DIR, 'downloads', 'AegisGuard.apk')
        apk_exists = os.path.exists(apk_path)
        apk_size_mb = round(os.path.getsize(apk_path) / (1024 * 1024), 1) if apk_exists else 0

        host = request.build_absolute_uri('/')[:-1]

        return Response({
            'app_name': 'Covenant Shield AegisGuard',
            'version': '1.0.0',
            'android': {
                'available': apk_exists,
                'filename': 'AegisGuard.apk',
                'size_mb': apk_size_mb,
                'download_url': f'{host}/api/v1/downloads/aegisguard.apk',
                'instructions': 'Download the .apk file to your Android phone and tap to install (enable "Install from unknown sources" if prompted).',
            },
            'ios': {
                'available': True,
                'type': 'PWA & Xcode Archive',
                'instructions': 'Open the guard app in Safari on your iPhone and tap "Share" -> "Add to Home Screen" for the standalone native app experience.',
                'xcode_project_path': 'covenant_shield/Guard app/flutter_app/ios/Runner.xcworkspace',
            },
        })
