import json
from .classification import *
import os

def process(data):
    data = dict(data)

    if data['action'] == 1:  # create and train a network
        input_list = ((float(data['learning_rate']), int(data['epochs']), bool(data['normalization'])), json.loads(data['network_setup']))
        csv_file_path = os.path.join(os.path.dirname(__file__), 'Clas2a.csv')
        structure, errors, w, b = construct_classifier(input_list, csv_file_path)
        data['network_setup'] = json.dumps(structure)  # list of integers representing nodes per layer, eg [4, 8, 8, 8, 2]
        data['network_weights'] = json.dumps(w)  # list of lists of floats representing the weights
        data['network_biases'] = json.dumps(b)  # list of lists of floats representing the biases
        data['error_list'] = json.dumps(errors)
        # list of 2 entries: first one is list of errors for plotting, second one is accuracy on test set

    elif data['action'] == 2:  # classify a given input
        if 'nn.txt':
            # load neural network from json using nn_path
            with open('nn.txt', 'rb') as input:
                nn = pickle.load(input)

            input_vector = json.loads(data['nn_input'])
            output_value = classify(input_vector, nn, normalise=True, name=True)
        else:
            output_value = "No Network"
        data['nn_input'] = output_value

    data['action'] = 0
    return data
