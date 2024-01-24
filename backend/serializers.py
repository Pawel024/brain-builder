from rest_framework import serializers
from .models import Row, TaskDescription, Progress, Quiz

class RowSerializer(serializers.ModelSerializer):

    class Meta:
        model = Row
        fields = ('pk', 'action', 'task_id', 'user_id', 'progress_pk', 'learning_rate', 'epochs', 'normalization', 'network_input', 'games_data','timestamp')

class TaskDescriptionSerializer(serializers.ModelSerializer):

    class Meta:
        model = TaskDescription
        fields = ('pk', 'task_id', 'name', 'description', 'type', 'dataset', 'n_inputs', 'n_outputs', 'max_epochs', 'max_layers', 'max_nodes', 'normalization_visibility', 'iterations_slider_visibility', 'lr_slider_visibility')

class ProgressSerializer(serializers.ModelSerializer):

    class Meta:
        model = Progress
        fields = ('pk', 'task_id', 'user_id', 'progress', 'error_list', 'network_weights', 'network_biases', 'plots', 'feature_names', 'timestamp')


class QuizSerializer(serializers.ModelSerializer):
    class Meta:
        model = Quiz
        fields = [
            'quiz_id', 
            'question_1', 'option_1_a', 'option_1_b', 'option_1_c', 'option_1_d', 'answer_1',
            'question_2', 'option_2_a', 'option_2_b', 'option_2_c', 'option_2_d', 'answer_2',
            'question_3', 'option_3_a', 'option_3_b', 'option_3_c', 'option_3_d', 'answer_3',
            'question_4', 'option_4_a', 'option_4_b', 'option_4_c', 'option_4_d', 'answer_4',
            'question_5', 'option_5_a', 'option_5_b', 'option_5_c', 'option_5_d', 'answer_5',
        ]
