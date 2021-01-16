from django.urls import path
from room import views
import random

app_name = 'room'
random = random.randint(0, 9999)

urlpatterns = [
    path('<int:pk>/', views.Home, name='index'),
    path('create', views.create, name='create'),
    path('<int:pk>/changename', views.changename, name='changename'),
    path('<int:pk>/draw', views.draw, name='draw'),
    path('<int:pk>/reset', views.reset, name='reset'),
]
