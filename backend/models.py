from django.db import models

class Row(models.Model):
    action = models.IntegerField()
    user_id = models.CharField(max_length=100)
    task_id = models.IntegerField()
    learning_rate = models.FloatField(max_length=10)
    epochs = models.IntegerField()
    normalization = models.BooleanField()
    network_setup = models.CharField(max_length=200)
    network_weights = models.CharField(max_length=1000000)
    network_biases = models.CharField(max_length=100000)
    nn_input = models.CharField(max_length=2000)
    error_list = models.CharField(max_length=2000)
    timestamp = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.network_setup


class TaskDescription(models.Model):
    task_id = models.IntegerField(unique=True)
    description = models.TextField()
    n_inputs = models.IntegerField()
    n_outputs = models.IntegerField()
    max_epochs = models.IntegerField()
    max_layers = models.IntegerField()
    max_nodes = models.IntegerField()
    normalization = models.BooleanField()

    def __str__(self):
        return self.description

class Progress(models.Model):
    user_id = models.CharField(max_length=100)
    task_id = models.IntegerField()
    progress = models.FloatField(max_length = 10)
    error_list = models.CharField(max_length=2000)
    plots = models.CharField(max_length=1000000)

    def __str__(self):
        return self.user_id