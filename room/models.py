from django.db import models
from django.contrib.postgres.fields import ArrayField
import json


class room(models.Model):
    name = models.CharField(max_length=50)

    def __str__(self):
        return str(self.pk) + '_' + self.name


class line(models.Model):
    DoesNotExist = None
    points = models.TextField()
    c = models.IntegerField()
    w = models.IntegerField()
    t = models.IntegerField()
    draw = models.ForeignKey(room, on_delete=models.CASCADE)

    def __str__(self):
        return json.dumps({'point': self.points, 'c': self.c, 'w': self.w, 't': self.t})
