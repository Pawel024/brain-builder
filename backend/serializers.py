from rest_framework import serializers
from .models import Row, TaskDescription
from rest_framework import serializers
from .models import Row, TaskDescription

class RowSerializer(serializers.ModelSerializer):

    class Meta:
        model = Row
        fields = ('pk', 'action', 'task_id', 'user_id', 'learning_rate', 'epochs', 'normalization', 'network_setup', 'network_weights', 'network_biases', 'nn_input', 'error_list', 'timestamp')

class TaskDescriptionSerializer(serializers.ModelSerializer):

    class Meta:
        model = TaskDescription
        class TaskDescriptionSerializer(serializers.ModelSerializer):
            class Meta:
                model = TaskDescription
                fields = ('pk', 'task_id', 'description', 'n_inputs', 'n_outputs', 'max_epochs', 'max_layers', 'max_nodes', 'normalization')

class ProgressSerializer(serializers.ModelSerializer):

    class Meta:
        model = Progress
        fields = ('pk', 'task_id', 'user_id', 'progress', 'error_list', 'plots')
