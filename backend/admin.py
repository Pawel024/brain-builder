from django.contrib import admin
from django.contrib.auth.models import Group, User
from .models import Row, TaskDescription, Progress, Quiz, Intro, Feedback

admin.site.register(Row)
admin.site.register(TaskDescription)
admin.site.register(Progress)
admin.site.register(Quiz)
admin.site.register(Intro)
admin.site.register(Feedback)