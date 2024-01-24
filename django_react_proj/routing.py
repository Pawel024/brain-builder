"""
from channels.routing import ProtocolTypeRouter, URLRouter
from django.urls import path
from . import consumers

websocket_urlpatterns = [
    path('ws/update/', consumers.SomeConsumer.as_asgi()),
    # Add more WebSocket endpoints here if needed
]

application = ProtocolTypeRouter({
    # http->django views is added by default
    'websocket': URLRouter(websocket_urlpatterns)
})
"""
