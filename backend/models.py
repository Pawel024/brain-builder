from django.db import models

class Row(models.Model):
    action = models.IntegerField()
    user_id = models.CharField(max_length=100)
    task_id = models.IntegerField()
    learning_rate = models.FloatField(max_length=10)
    epochs = models.IntegerField()
    normalization = models.BooleanField()
    network_setup = models.CharField(max_length=200)
    network_weights = models.TextField()
    network_biases = models.TextField()
    nn_input = models.CharField(max_length=200)
    error_list = models.TextField()
    timestamp = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.network_setup


class TaskDescription(models.Model):
    task_id = models.IntegerField(unique=True)
    description = models.TextField()
    dataset = models.CharField(max_length=200)
    n_inputs = models.IntegerField()
    n_outputs = models.IntegerField()
    max_epochs = models.IntegerField()
    max_layers = models.IntegerField()
    max_nodes = models.IntegerField()
    normalization = models.BooleanField()

    def __str__(self):
        return str(self.task_id)

class Progress(models.Model):
    user_id = models.CharField(max_length=100)
    task_id = models.IntegerField()
    progress = models.FloatField(max_length = 10)
    error_list = models.CharField(max_length=2000)
    plots = models.CharField(max_length=1000000)

    def __str__(self):
        return self.user_id
    
class Quiz(models.Model):
    quiz_id = models.IntegerField(unique=True)
    
    question_1 = models.TextField(null=True)
    option_1_a = models.CharField(max_length=200, null=True)
    option_1_b = models.CharField(max_length=200, null=True)
    option_1_c = models.CharField(max_length=200, null=True)
    option_1_d = models.CharField(max_length=200, null=True)
    answer_1 = models.CharField(max_length=200, null=True)
    
    question_2 = models.TextField(null=True)
    option_2_a = models.CharField(max_length=200, null=True)
    option_2_b = models.CharField(max_length=200, null=True)
    option_2_c = models.CharField(max_length=200, null=True)
    option_2_d = models.CharField(max_length=200, null=True)
    answer_2 = models.CharField(max_length=200, null=True)

    question_3 = models.TextField(null=True)
    option_3_a = models.CharField(max_length=200, null=True)
    option_3_b = models.CharField(max_length=200, null=True)
    option_3_c = models.CharField(max_length=200, null=True)
    option_3_d = models.CharField(max_length=200, null=True)
    answer_3 = models.CharField(max_length=200, null=True)

    question_4 = models.TextField(null=True)
    option_4_a = models.CharField(max_length=200, null=True)
    option_4_b = models.CharField(max_length=200, null=True)
    option_4_c = models.CharField(max_length=200, null=True)
    option_4_d = models.CharField(max_length=200, null=True)
    answer_4 = models.CharField(max_length=200, null=True)

    question_5 = models.TextField(null=True)
    option_5_a = models.CharField(max_length=200, null=True)
    option_5_b = models.CharField(max_length=200, null=True)
    option_5_c = models.CharField(max_length=200, null=True)
    option_5_d = models.CharField(max_length=200, null=True)
    answer_5 = models.CharField(max_length=200, null=True)

    def __str__(self):
        return str(self.quiz_id)