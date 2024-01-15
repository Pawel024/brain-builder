"""
This module is used to process the data sent from the frontend.
It is activated when the backend receives a POST request from the frontend.
When this happens, the data is sent to the process function, which reads out the data and performs the requested action:
0. do nothing
1. create and train a network
2. classify a given input (if no network is initialized, it will return "No Network")
"""

# Improvements:
# Idea: a lot of files use the same imports, check if this can be done more efficiently
# Idea: make the normalization an integer value so it's easier to expand

import json
import .building  # UNCOMMENT THIS
# import building  # COMMENT THIS
import os
import pickle


def process(request):
    request = dict(request)

    if request['action'] == 1:  # create and train a network
        input_list = ((float(request['learning_rate']), int(request['epochs']), bool(request['normalization'])), json.loads(request['network_setup']))
        tag = int(request['tag'])
        structure, errors, w, b = building.build_nn(input_list, tag)
        request['network_setup'] = json.dumps(structure)  # list of integers representing nodes per layer, eg [4, 8, 8, 8, 2]
        request['network_weights'] = json.dumps(w)  # list of lists of floats representing the weights
        request['network_biases'] = json.dumps(b)  # list of lists of floats representing the biases
        request['error_list'] = json.dumps(errors)
        # list of 2 entries: first one is list of errors for plotting, second one is accuracy on test set

    elif request['action'] == 2:  # classify a given input

        if 'nn.txt' in os.listdir() and 'data.txt' in os.listdir():
            # load neural network from json using nn_path
            with open('nn.txt', 'rb') as inpu:
                nn = pickle.load(inpu)
            with open('data.txt', 'rb') as inpu:
                data = pickle.load(inpu)

            setup = json.loads(request['network_setup'])
            if setup[0] != nn.input[0][0] or setup[-1] != nn.input[-1][0]:
                print("Wrong Network")
                output_value = "Wrong Network"
            else:
                input_vector = json.loads(request['nn_input'])
                tag = int(request['tag'])
                building.dataset = data
                output_value = building.predict(input_vector, nn, tag, normalization=bool(request['normalization']), name=False)
        else:
            print("No Network")
            output_value = "No Network"
        request['nn_input'] = output_value

    request['action'] = 0
    return request
