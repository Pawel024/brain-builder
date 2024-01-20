from django.contrib import admin
from django.contrib.auth.models import Group, User
from .models import Row, TaskDescription, Progress, Quiz

admin.site.register(Row)
admin.site.register(TaskDescription)
admin.site.register(Progress)
admin.site.register(Quiz)