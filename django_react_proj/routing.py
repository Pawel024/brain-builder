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
