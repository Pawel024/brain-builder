from rest_framework import serializers
from .models import Row

class RowSerializer(serializers.ModelSerializer):

    class Meta:
        model = Row
        fields = ('pk', 'learning_rate', 'epochs', 'network_setup', 'network_weights', 'network_biases', 'nn_input', 'action', 'error_list', 'timestamp')