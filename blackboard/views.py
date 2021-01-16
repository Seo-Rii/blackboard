from django.shortcuts import render

from django.shortcuts import render, get_object_or_404, HttpResponseRedirect, reverse
from room.models import room
from django.views import generic


def IndexView(request):
    return render(request, 'home.html')
