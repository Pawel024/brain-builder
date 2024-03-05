"""
This module is used to process the data sent from the frontend.
It is activated when the backend receives a POST request from the frontend.
When this happens, the data is sent to the process function, which reads out the data and performs the requested action:
0. Load the data; the feature names and images are sent to the frontend via the 'events' SSE using the 'data' message
1. Build and train a network; updates are sent via the 'events' SSE using the 'progress' and 'update' messages
2. Classify a given input (if no network is initialized, it will return "No Network"); the predicted value is returned with rest of the request
Messages:
- 'data': contains the feature names and images
- 'progress': contains the progress -> every 1% of epochs
- 'update': contains the error list, weights, biases and plots -> every 10% of epochs
"""

# Improvements:
# Idea: make the normalization an integer value so it's easier to expand

from . import building 
from . import levels 
from . import data_functions as df
import os
import pickle
import requests
import pandas as pd
import json
from base64 import b64encode, b64decode
from django_react_proj.consumers import Coach
from django.core.cache import cache
import time
from asgiref.sync import sync_to_async
import asyncio

async def process(req):
    print("Processing action ", req['action'])

    req = dict(req)
    task_id, user_id = req['task_id'], req['user_id']

    # load the games dataframe 
    levels.games = json.loads(req['games_data'])  # use without pako
    levels.games = pd.DataFrame(levels.games).set_index('task_id')


    if req['action'] == 0:  # load the data and send the feature names and images to the frontend
        d = {}
        tag = int(req['task_id'])
        normalization = bool(req['normalization'])

        data, (training_set, test_set) = levels.get_data(tag, normalization)
        cache.set(f'{user_id}_data', pickle.dumps(data), 10*60)  # cache the data for 10 minutes
        print("Data loaded and stored in cache")

        d['title'] = 'data'
        d['feature_names'] = [x.replace('_', ' ') for x in data.feature_names]
        d['plot'] = b64encode(data.images[-1]).decode()  # base64 encoded image, showing pyplot of the data
        d['n_objects'] = data.n_objects

        coach = Coach.connections.get((str(user_id), str(task_id)))
        t = 0
        while coach is None and t < 10:
            time.sleep(0.1)
            print("Waiting for coach")
            t += 0.1
        if coach is not None:
            print('Sending data to coach')
            await coach.send_data(d)


    elif req['action'] == 1:  # create and train a network
        d, u = {}, {}
        errors = []
        epochs, learning_rate, normalization, af = int(req['epochs']), float(req['learning_rate']), bool(req['normalization']), bool(req['activations_on'])
        input_list = ((learning_rate, epochs, normalization), json.loads(req['network_input']))  # TODO: remove the learning rate and epochs from this path
        tag = int(req['task_id'])

        # check if a cached version of the data exists and load it if it does
        data = cache.get(f'{user_id}_data')
        if data is not None:
            data = pickle.loads(data)
            print("Loaded data from cache")
        else:
            data = None
            print("No data in cache, about to load it")

        network, data, training_set, test_set = building.build_nn(input_list, tag, dat=data, af=af)
        print("Network initiated, starting training")
        d['title'] = 'progress'
        d['progress'] = 0  # just update the progress
        coach = Coach.connections.get((str(user_id), str(task_id)))
        if coach is not None:
            await coach.send_data(d)
        
        u['title'] = 'update'
        
        for epoch in range(epochs):
            if Coach.cancelVars.get((str(user_id), str(task_id))):
                print("Training cancelled")
                break
            print("Epoch: ", epoch)
            errors, accuracy, we, bi = building.train_nn_epoch(network, training_set, test_set, epoch, epochs, learning_rate, tag, errors)
            if we is not None:
                w = we
                b = bi
            if errors is not None:
                 e = [errors, accuracy]

            if epoch % (epochs // 100 if epochs >= 100 else 1) == 0:  # every 1% of the total epochs:
                print("Updating progress")
                d['progress'] = round(epoch / epochs, 2)  # update the progress
                d['error_list'] = e  # list of 2 entries: first one is list of errors for plotting, second one is accuracy on test set

                if epoch % (epochs // 50 if epochs >= 50 else 1) == 0:  # every 10% of the total epochs:
                    print("Updating all the stuff")
                    data.plot_decision_boundary(network)  # plot the current decision boundary (will be ignored if the dataset has too many dimensions)
                    u['plot'] = b64encode(data.images[-1]).decode()  # base64 encoded image, showing pyplot of the data (potentially with decision boundary)
                    u['network_weights'] = w  # list of lists of floats representing the weights
                    u['network_biases'] = b  # list of lists of floats representing the biases
                    print("First bias: ", b[0])

                    print("Epoch: ", epoch, ", Error: ", errors[-1])

                    coach = Coach.connections.get((str(user_id), str(task_id)))
                    if coach is not None:
                        print('Sending data to coach')
                        await coach.send_data(u)

                coach = Coach.connections.get((str(user_id), str(task_id)))
                if coach is not None:
                    print('Sending data to coach')
                    await coach.send_data(d)
        
        data.plot_decision_boundary(network)  # plot the current decision boundary (will be ignored if the dataset has too many dimensions)

        d['progress'] = 1
        d['error_list'] = e  # list of 2 entries: first one is list of errors for plotting, second one is accuracy on test set
        
        u['network_weights'] = w  # list of lists of floats representing the weights
        u['network_biases'] = b  # list of lists of floats representing the biases
        u['plot'] = b64encode(data.images[-1]).decode()  # base64 encoded image, showing pyplot of the data (potentially with decision boundary)

        print("About to save network and data to cache...")
        # save the network and data to pickle files and store them in the cache
        network = pickle.dumps(network, -1)
        data = pickle.dumps(data, -1)
        cache.set(f'{user_id}_nn', network, 10*60)  # cache the network for 10 minutes
        cache.set(f'{user_id}_data', data, 10*60)  # cache the data for 10 minutes
        print("Network and data successfully saved to cache!")
        
        coach = Coach.connections.get((str(user_id), str(task_id)))
        if coach is not None:
            print('Sending double data to coach')
            await coach.send_data(d)
            await coach.send_data(u)
            # if the websocket is still open, close it
            await coach.close()



    elif req['action'] == 2:  # classify a given input
        # check if a cached version of the network and data exist and load them if they do
        nn = cache.get(f'{user_id}_nn')
        data = cache.get(f'{user_id}_data')

        if nn is not None and data is not None:
            nn = pickle.loads(nn)
            data = pickle.loads(data)

            input_vector = json.loads(req['network_input'])
            if len(input_vector) != data.n_features:
                print("Wrong Network")
                output_value = "Wrong Network"
            else:
                tag = int(req['task_id'])
                output_value = building.predict(input_vector, nn, tag, data, normalization=bool(req['normalization']), name=True)
        else:
            print("No Network (or no data)")
            output_value = "No Network"
        req['network_input'] = json.dumps(output_value)

    req['action'] = 0
    return req
