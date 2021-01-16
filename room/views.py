from django.shortcuts import render
from django.shortcuts import render, HttpResponseRedirect, reverse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from room.models import line, room
from django.views import generic
import json


def Home(request, pk):
    try:
        r = room.objects.get(pk=pk)
    except:
        return HttpResponseRedirect(reverse('home') + '?state=404')

    return render(request, 'room/main.html', {'r': r, 'socketid': pk})


def create(request):
    try:
        cnt = len(room.objects.all()) + 1
    except:
        cnt = 1

    while True:
        try:
            room.objects.get(pk=cnt)
        except:
            break
        cnt = cnt + 1
    try:
        room.objects.get(pk=cnt)
    except:
        room.objects.create(name='새 블랙보드', pk=cnt)

    return HttpResponseRedirect(reverse('room:index', args=(cnt,)))


@csrf_exempt
def changename(request, pk):
    try:
        r = room.objects.get(pk=pk)
        r.name = request.body.decode('utf-8')
        r.save()
    except:
        pass

    return HttpResponse()


@csrf_exempt
def draw(request, pk):
    try:
        el = json.loads(request.body)
        line.objects.create(points=el['point'], c=el['c'], w=el['w'], t=el['t'], draw=room.objects.get(pk=pk))
        return HttpResponse(1)
    except:
        return HttpResponse(0)


@csrf_exempt
def reset(request, pk):
    try:
        r = room.objects.get(pk=pk)
        for i in r.line_set.all():
            i.delete()
        return HttpResponse(1)
    except:
        return HttpResponse(0)
