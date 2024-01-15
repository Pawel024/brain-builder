from rest_framework import serializers
from .models import Row, TaskDescription

class RowSerializer(serializers.ModelSerializer):

    class Meta:
        model = Row
        fields = ('pk', 'task_id', 'user_id', 'learning_rate', 'epochs', 'network_setup', 'network_weights', 'network_biases', 'nn_input', 'action', 'error_list', 'timestamp')


class TaskDescriptionSerializer(serializers.ModelSerializer):

    class Meta:
        model = TaskDescription
        fields = ('pk', 'task_id', 'description')