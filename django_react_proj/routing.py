"""
ASGI entrypoint. Configures Django and then runs the application
defined in the ASGI_APPLICATION setting.
"""


from channels.routing import ProtocolTypeRouter, URLRouter, ChannelLayerMiddlewareStack
from django.urls import path, re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/(?P<userId>\w+)/(?P<taskId>\w+)/$', consumers.Coach.as_asgi()),
    # Add more WebSocket endpoints here if needed
]




"""
import os
import django
from django.core.asgi import get_asgi_application
from django.urls import path, re_path
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
import django_eventstream

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "django_react_proj.settings")

application = ProtocolTypeRouter({
    'http': URLRouter([
        path('events/', AuthMiddlewareStack(
            URLRouter(django_eventstream.routing.urlpatterns)
        )),
        re_path(r'', get_asgi_application()),
    ]),
})
"""
