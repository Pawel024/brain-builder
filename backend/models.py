from django.db import models

class Row(models.Model):
    action = models.IntegerField()
    tag = models.IntegerField()
    timestamp = models.DateTimeField(auto_now=True)
    learning_rate = models.FloatField(max_length=20)
    epochs = models.IntegerField()
    network_setup = models.CharField(max_length=200)
    network_weights = models.CharField(max_length=1000000)
    network_biases = models.CharField(max_length=100000)
    nn_input = models.CharField(max_length=2000)
    error_list = models.CharField(max_length=2000)

    def __str__(self):
        return self.network_setup