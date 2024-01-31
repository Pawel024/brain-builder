"""
ASGI entrypoint. Configures Django and then runs the application
defined in the ASGI_APPLICATION setting.
"""


from channels.routing import ProtocolTypeRouter, URLRouter
from django.urls import path, re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/(?P<userId>[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12})/(?P<taskId>\w+)/$', consumers.Coach.as_asgi()),
    re_path(r'custom/(?P<userId>[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12})/(?P<customId>\w+)/$', consumers.Plotter.as_asgi()),
    # Add more WebSocket endpoints here if needed
]

application = ProtocolTypeRouter({
    # (http->django views is added by default)
    'websocket': URLRouter(
        websocket_urlpatterns
    ),
})






















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
