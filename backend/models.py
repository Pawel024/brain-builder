from django.db import models

class Row(models.Model):
    user_id = models.CharField(max_length=36)
    task_id = models.IntegerField()
    learning_rate = models.FloatField(max_length=20)
    epochs = models.IntegerField()
    network_setup = models.CharField(max_length=200)
    network_weights = models.CharField(max_length=1000000)
    network_biases = models.CharField(max_length=100000)
    nn_input = models.CharField(max_length=2000)
    action = models.IntegerField()
    error_list = models.CharField(max_length=2000)
    timestamp = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.network_setup