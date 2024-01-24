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
# Idea: a lot of files use the same imports, check if this can be done more efficiently
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
from django_eventstream import send_event
#import aiohttp

def process(req, root_link, pk=None, csrf_token=None):
    req = dict(req)
    task_id, user_id = req['task_id'], req['user_id']

    # load the games dataframe 
    levels.games = json.loads(req['games_data'])  # use without pako
    levels.games = pd.DataFrame(levels.games).set_index('task_id')


    if req['action'] == 0:  # load the data and send the feature names and images to the frontend
        d = {}
        tag = int(req['task_id'])
        levels.get_data(tag)
        d['feature_names'] = json.dumps([x.replace('_', ' ') for x in levels.data.feature_names])
        d['plots'] = json.dumps([b64encode(image).decode() for image in levels.data.images])

        send_event(f'{user_id}/{task_id}', 'data', d)


    elif req['action'] == 1:  # create and train a network
        d, u = {}, {}
        epochs, learning_rate = int(req['epochs']), float(req['learning_rate'])
        input_list = ((learning_rate, epochs, bool(req['normalization'])), json.loads(req['network_input']))
        tag = int(req['task_id'])

        network, training_set, test_set = building.build_nn(input_list, tag, pk=pk, task_id=task_id, user_id=user_id, root_link=root_link)
        print("Network initiated, starting training")
        
        d['progress'] = 0  # just update the progress
        send_event(f'{user_id}/{task_id}', 'progress', d)
        
        for epoch in range(epochs):
            print("Epoch: ", epoch)
            errors, accuracy, we, bi = building.train_nn_epoch(network, training_set, test_set, epoch, epochs, learning_rate, tag)
            if we is not None:
                w = we
                b = bi
            if errors is not None:
                 e = [errors, accuracy]

            if epoch % (epochs // 100 if epochs >= 100 else 1) == 0:  # every 1% of the total epochs:
                print("Updating progress")
                d['progress'] = round(epoch / epochs, 2)  # update the progress

                if epoch % (epochs // 10 if epochs >= 10 else 1) == 0:  # every 10% of the total epochs:
                    print("Updating all the stuff")
                    levels.data.plot_decision_boundary(network)  # plot the current decision boundary (will be ignored if the dataset has too many dimensions)
                    u['plots'] = json.dumps([b64encode(image).decode() for image in levels.data.images])  # list of base64 encoded images, showing pyplots of the data (potentially with decision boundary)
                    u['error_list'] = json.dumps(e)  # list of 2 entries: first one is list of errors for plotting, second one is accuracy on test set
                    u['network_weights'] = json.dumps(w)  # list of lists of floats representing the weights
                    u['network_biases'] = json.dumps(b)  # list of lists of floats representing the biases

                    print("Epoch: ", epoch, ", Error: ", errors[-1])
                    send_event(f'{user_id}/{task_id}', 'update', u)

                send_event(f'{user_id}/{task_id}', 'progress', d)
        
        # save the network to a pickle file
        with open('nn.txt', 'wb') as output:
            pickle.dump(network, output, pickle.HIGHEST_PROTOCOL)
        
        d['progress'] = 1
        levels.data.plot_decision_boundary(network)  # plot the current decision boundary (will be ignored if the dataset has too many dimensions)
        u['plots'] = json.dumps([b64encode(image).decode() for image in levels.data.images])  # list of base64 encoded images, showing pyplots of the data (potentially with decision boundary)
        u['error_list'] = json.dumps(e)  # list of 2 entries: first one is list of errors for plotting, second one is accuracy on test set
        u['network_weights'] = json.dumps(w)  # list of lists of floats representing the weights
        u['network_biases'] = json.dumps(b)  # list of lists of floats representing the biases
        
        send_event(f'{user_id}/{task_id}', 'progress', d)
        send_event(f'{user_id}/{task_id}', 'update', u)



    elif req['action'] == 2:  # classify a given input
        if 'nn.txt' in os.listdir() and 'data.txt' in os.listdir():
            # load neural network from json using nn_path
            with open('nn.txt', 'rb') as inpu:
                nn = pickle.load(inpu)
            with open('data.txt', 'rb') as inpu:
                data = pickle.load(inpu)

            input_vector = json.loads(req['network_input'])
            if len(input_vector) != data.n_inputs:
                print("Wrong Network")
                output_value = "Wrong Network"
            else:
                tag = int(req['task_id'])
                building.dataset = data
                output_value = building.predict(input_vector, nn, tag, normalization=bool(req['normalization']), name=True)
        else:
            print("No Network / No Data")
            output_value = "No Network / No Data"
        req['network_input'] = json.dumps(output_value)

    req['action'] = 0
    return req


"""
async def send_data(root_link, data, headers=None, user_id=None, task_id=None, pk=None):
    async with aiohttp.ClientSession() as session:
        try:
            if pk is not None:  # might give issues
                print(f"Sending PUT to progress/{pk}")
                async with session.put(root_link + f"api/progress/{pk}", data=data, headers = headers, timeout=2) as r:
                    print("Response: ", await r.text())
            else:
                print("Sending POST")
                async with session.post(root_link + f"api/progress/", data=data, headers = headers, timeout=2) as r:
                    print("Response: ", await r.text())
            print("Response: ", r)
    except requests.exceptions.ReadTimeout as e:
        print(f"Request timed out (error {e}), continuing anyway")


async def process(req, root_link, pk=None, csrf_token=None):
    req = dict(req)
    task_id, user_id = req['task_id'], req['user_id']
    pk = req['progress_pk']
    h = {'X-CSRFToken': csrf_token}
    d = {
        'user_id': user_id,
        'task_id': int(task_id),
        'progress': -1,
        'feature_names': json.dumps([]),
        'plots': json.dumps([]),
        'error_list': json.dumps([]),
        'network_weights': json.dumps([]),
        'network_biases': json.dumps([])
        }

    # load the games dataframe 
    levels.games = json.loads(req['games_data'])  # use without pako
    levels.games = pd.DataFrame(levels.games).set_index('task_id')



    if req['action'] == 0:  # load the data and send the feature names and images to the frontend
        
        tag = int(req['task_id'])
        levels.get_data(tag)
        d['progress'] = 0  # reset the progress
        d['error_list'] = json.dumps([])  # reset the error list
        d['network_weights'] = json.dumps([])  # reset the weights
        d['network_biases'] = json.dumps([])  # reset the biases
        d['feature_names'] = json.dumps([x.replace('_', ' ') for x in levels.data.feature_names])
        d['plots'] = json.dumps([b64encode(image).decode() for image in levels.data.images])


        tasks = asyncio.create_task(send_data(root_link, d, headers=h, user_id=user_id, task_id=task_id, pk=pk))
        try: 
            result = await tasks
        except Exception as e:
            print("An error occured when sending the data back (process_data.py, action 0): ", e)



    elif req['action'] == 1:  # create and train a network
        epochs, learning_rate = int(req['epochs']), float(req['learning_rate'])
        input_list = ((learning_rate, epochs, bool(req['normalization'])), json.loads(req['network_input']))
        tag = int(req['task_id'])

        network, training_set, test_set = building.build_nn(input_list, tag, pk=pk, task_id=task_id, user_id=user_id, root_link=root_link)
        print("Network initiated, starting training")
        
        d['feature_names'] = json.dumps([x.replace('_', ' ') for x in levels.data.feature_names])  # list of strings representing the feature names
        d['progress'] = 0  # just update the progress
        tasks = [asyncio.create_task(send_data(root_link, d, headers=h, user_id=user_id, task_id=task_id, pk=pk))]  # send a progress update to the frontend
        
        for epoch in range(epochs):
            print("Epoch: ", epoch)
            errors, accuracy, we, bi = building.train_nn_epoch(network, training_set, test_set, epoch, epochs, learning_rate, tag)
            if we is not None:
                w = we
                b = bi
            if errors is not None:
                 e = [errors, accuracy]

            if epoch % (epochs // 10 if epochs >= 10 else 1) == 0:  # every 1% of the total epochs:
                print("Updating progress")
                d['progress'] = round(epoch / epochs, 2)  # update the progress

                if epoch % (epochs // 10 if epochs >= 10 else 1) == 0:  # every 10% of the total epochs:
                    print("Updating all the stuff")
                    levels.data.plot_decision_boundary(network)  # plot the current decision boundary (will be ignored if the dataset has too many dimensions)
                    d['plots'] = json.dumps([b64encode(image).decode() for image in levels.data.images])  # list of base64 encoded images, showing pyplots of the data (potentially with decision boundary)
                    d['error_list'] = json.dumps(e)  # list of 2 entries: first one is list of errors for plotting, second one is accuracy on test set
                    d['network_weights'] = json.dumps(w)  # list of lists of floats representing the weights
                    d['network_biases'] = json.dumps(b)  # list of lists of floats representing the biases
                    print("Epoch: ", epoch, ", Error: ", errors[-1])

                tasks += [asyncio.create_task(send_data(root_link, d, headers=h, user_id=user_id, task_id=task_id, pk=pk))]  # send a progress update to the frontend
        
        # save the network to a pickle file
        with open('nn.txt', 'wb') as output:
            pickle.dump(network, output, pickle.HIGHEST_PROTOCOL)
        
        d['progress'] = 1
        levels.data.plot_decision_boundary(network)  # plot the current decision boundary (will be ignored if the dataset has too many dimensions)
        d['plots'] = json.dumps([b64encode(image).decode() for image in levels.data.images])  # list of base64 encoded images, showing pyplots of the data (potentially with decision boundary)
        d['error_list'] = json.dumps(e)  # list of 2 entries: first one is list of errors for plotting, second one is accuracy on test set
        d['network_weights'] = json.dumps(w)  # list of lists of floats representing the weights
        d['network_biases'] = json.dumps(b)  # list of lists of floats representing the biases
        tasks += [asyncio.create_task(send_data(root_link, d, headers=h, user_id=user_id, task_id=task_id, pk=pk))]  # send a progress update to the frontend

        try: 
            result = await tasks
        except Exception as e:
            print("An error occured when sending the data back (process_data.py, action 0): ", e)



    elif req['action'] == 2:  # classify a given input
        if 'nn.txt' in os.listdir() and 'data.txt' in os.listdir():
            # load neural network from json using nn_path
            with open('nn.txt', 'rb') as inpu:
                nn = pickle.load(inpu)
            with open('data.txt', 'rb') as inpu:
                data = pickle.load(inpu)

            input_vector = json.loads(req['network_input'])
            if len(input_vector) != data.n_inputs:
                print("Wrong Network")
                output_value = "Wrong Network"
            else:
                tag = int(req['task_id'])
                building.dataset = data
                output_value = building.predict(input_vector, nn, tag, normalization=bool(req['normalization']), name=True)
        else:
            print("No Network / No Data")
            output_value = "No Network / No Data"
        req['network_input'] = json.dumps(output_value)

    req['action'] = 0
    return req
"""
