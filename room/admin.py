from django.contrib import admin

# Register your models here.
from .models import line, room

admin.site.register(line)
admin.site.register(room)
