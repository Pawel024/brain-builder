"""
This module contains the functions used to build the neural network.
It is called by the process_data module,
and calls the levels module for information on the games, and the modular_network module for the actual network.
"""

# Improvements:
# Idea: look into batches: Do we need them? How do they work?
# Idea: consider migrating some functions from levels.py to here
# Idea: construct a function which plots the decision boundary

from .modular_network import * 
from . import levels  
#import pickle
#import os

# an example input
# input_list = [
# important hyperparameters
#    [[0.005],  # learning rate
#     [150]],  # number of epochs
# number of nodes per layer (each layer has its own list so the code can easily be upgraded later)
#    [[5],  # input layer
#     [2],
#     [4],
#     [8],
#     [8],
#     [4],
#     [2],
#     [1]]  # output layer
# ]

# structure = [[n_inputs], (4, 'Linear', 'Sigmoid', True), (8, 'Linear', 'Sigmoid', True),
#             (4, 'Linear', 'Sigmoid', True), (n_outputs, 'Linear', 'Log_Softmax', True)]
# learning_rate = 0.005
# epochs = 200


def build_nn(input_list, tag, dat=None, af=True):
    # convert the input list to usable values
    structure, learning_rate, epochs, norma = levels.convert_input(input_list, tag, af=af)

    # now separate into training and testing data:
    batch_size = 1  # feed small amounts of data to adjust gradient with, usually between 8 and 64
    data, (training_set, test_set) = levels.get_data(tag, norma, dat)
    training_set = torch.utils.data.DataLoader(training_set, batch_size=batch_size, shuffle=True)
    test_set = torch.utils.data.DataLoader(test_set, batch_size=batch_size, shuffle=True)
    # shuffle: always turn on if dataset is ordered!
    print('Data loaded, initiating neural network')

    # initiate and train the network
    nn = BuildNetwork(structure)
    # print("Status check: ", nn.forward(torch.rand((28, 28)).view((1, 28*28))))

    # for testing
    """"    
        for data in test_set:
            for idx, datapoint in enumerate(data['data']):
                label = data['label'][idx]
                prediction = torch.argmax(nn(datapoint.float().view(-1, n_inputs))[0])
                print("Characteristics: ", datapoint)
                print("I predict ", prediction)
                print("It is labeled as ", label)
                input("Press Enter ")
    """

    return nn, data, training_set, test_set


def train_nn_epoch(nn, training_set, test_set, current_epoch, epochs, learning_rate, tag, errors):
    accuracy, weights, biases = None, None, None
    optimizer = torch.optim.SGD(nn.parameters(), lr=learning_rate)  # optimizer has to be defined outside the network module, idk why
    typ = levels.find_type(tag)

    nn.train_epoch(training_set, optimizer, typ)

    if current_epoch % (epochs // 100 if epochs >= 100 else 1) == 0:
        error, accuracy = nn.test(test_set, typ, acc=False)  # TODO: should this be training_set or test_set?
        errors += [error]
        weights, biases = get_parameters(nn)
        
    if round(current_epoch/epochs, 2) >= 0.9 or current_epoch > epochs-2:
        error, accuracy = nn.test(test_set, typ, acc=True)

    return errors, accuracy, weights, biases



def get_parameters(nn):
    weights = []
    biases = []
    for layer in nn.layers:
        weights += [layer.weight.data.tolist()]
        biases += [layer.bias.data.tolist()]
    return weights, biases


def predict(x, nn, tag, data, normalization=False, name=False):
    if levels.find_type(tag) == 1:
        if normalization:
            x = data.normalize(x)
        x = torch.tensor(x, dtype=torch.float32)
        output = torch.argmax(nn(x.view(-1, data.n_features))[0]).item()
        if name:
            output = data.label_name(output)
        return output

    elif levels.find_type(tag) == 2:
        if normalization:
            x = data.normalize(x)
        x = torch.tensor(x, dtype=torch.float32)
        output = nn(x.view(-1, data.n_features))[0]
        if normalization:
            output = data.denormalize(output.tolist())
        else:
            output = output.tolist()
        return output

    else:
        print("Task not supported yet")
        return None
