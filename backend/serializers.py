from rest_framework import serializers
from .models import Row

class RowSerializer(serializers.ModelSerializer):

    class Meta:
        model = Row
        fields = ('action', 'tag', 'timestamp', 'pk', 'learning_rate', 'epochs', 'normalization', 'network_setup', 'network_weights', 'network_biases', 'nn_input', 'error_list')