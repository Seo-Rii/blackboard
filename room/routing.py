from django.conf.urls import url
from . import consumers

websocket_urlpatterns = [
    url(r'^ws/blackboard/(?P<room_name>[^/]+)/$', consumers.DrawConsumer.as_asgi()),
]
