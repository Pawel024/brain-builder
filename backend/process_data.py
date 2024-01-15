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
from . import building 
from . import levels 
from . import data_functions as df
from . import modular_network as mn
import os
import pickle
import requests
import pandas as pd


def process(req, root_link):
    req = dict(req)

    # load the games dataframe from the API
    #  this dataframe contains all the game-specific info the backend uses
    response = requests.get(root_link + 'api/tasks/?user_id=' + str(req['user_id']) + '&task_id=' + str(req['task_id']))
    levels.games = response.json()
    levels.games = pd.DataFrame(levels.games)
    df.root_link, mn.root_link = root_link, root_link
    df.task_id, mn.task_id = req['task_id'], req['task_id']
    df.user_id, mn.user_id = req['user_id'], req['user_id']
    df.pk, mn.pk = req['pk'], req['pk']


    if req['action'] == 1:  # create and train a network
        input_list = ((float(req['learning_rate']), int(req['epochs']), bool(req['normalization'])), json.loads(req['network_setup']))
        tag = int(req['task_id'])
        structure, errors, w, b = building.build_nn(input_list, tag)
        req['network_setup'] = json.dumps(structure)  # list of integers representing nodes per layer, eg [4, 8, 8, 8, 2]
        req['network_weights'] = json.dumps(w)  # list of lists of floats representing the weights
        req['network_biases'] = json.dumps(b)  # list of lists of floats representing the biases
        req['error_list'] = json.dumps(errors)
        # list of 2 entries: first one is list of errors for plotting, second one is accuracy on test set

    elif req['action'] == 2:  # classify a given input

        if 'nn.txt' in os.listdir() and 'data.txt' in os.listdir():
            # load neural network from json using nn_path
            with open('nn.txt', 'rb') as inpu:
                nn = pickle.load(inpu)
            with open('data.txt', 'rb') as inpu:
                data = pickle.load(inpu)

            setup = json.loads(req['network_setup'])
            if setup[0] != nn.input[0][0] or setup[-1] != nn.input[-1][0]:
                print("Wrong Network")
                output_value = "Wrong Network"
            else:
                input_vector = json.loads(req['nn_input'])
                tag = int(req['task_id'])
                building.dataset = data
                output_value = building.predict(input_vector, nn, tag, normalization=bool(req['normalization']), name=False)
        else:
            print("No Network")
            output_value = "No Network"
        req['nn_input'] = output_value

    req['action'] = 0
    return req
