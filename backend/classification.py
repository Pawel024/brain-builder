# This program will try to determine whether a given aircraft is made by Boeing or Airbus,
#  based on maximum take-off weight, number of engines, wing span, length, wheelbase and approach speed.
# The data has been compiled in the 'Clas1' Excel sheet
#  and comprises 67 Boeing aircraft and 37 Airbus aircraft.

from sklearn.model_selection import train_test_split
import numpy as np
import torch
# from torchvision import transforms, utils
# from torch.utils.data import Dataset  # DataLoader
from .modular_network import *
from .data_functions import *
import os
import pickle

# an example input
# csv_file_path = 'Clas2a.csv'
# input_list = [
# important hyperparameters
#    [[0.005],  # learning rate
#     [150]],  # number of epochs
# number of nodes per layer (each layer has its own list so the code can easily be upgraded later)
#    [[5],  # input layer (will be ignored)
#     [2],
#     [4],
#     [8],
#     [8],
#     [4],
#     [2],
#     [1]]  # output layer (will be ignored)
# ]

# structure = [[n_inputs], (4, 'Linear', 'Sigmoid', True), (8, 'Linear', 'Sigmoid', True),
#             (4, 'Linear', 'Sigmoid', True), (n_classes, 'Linear', 'Log_Softmax', True)]
# learning_rate = 0.005
# epochs = 200

dataset = None
n_inputs = 1
n_classes = 1


def convert_input(lst):
    other, nodes = lst
    structure = [[nodes[0]]]
    for x in nodes[1:]:
        structure += [[x, 'Linear', 'Sigmoid', True]]  # all nodes are linear and include a sigmoid activation and bias
    learning_rate, epochs = other
    return structure, learning_rate, epochs


def construct_classifier(input_list, csv_file_path):
    global dataset, n_inputs, n_classes
    # convert the input list to usable values
    structure, learning_rate, epochs = convert_input(input_list)

    # load the dataset from Excel -> use custom dataset class
    dataset = DataFromExcel(csv_file_path=csv_file_path)

    # overwrite the first and last layer
    n_inputs = dataset.data_parameters["n_features"]
    n_classes = dataset.data.iloc[-1, 0] + 1
    structure[0][0] = n_inputs
    structure[-1][0], structure[-1][2] = n_classes, 'Log_Softmax'

    # now separate into training and testing data:
    batch_size = 550  # feed small amounts of data to adjust gradient with, usually between 8 and 64
    random_parameter = np.random.randint(1, 100)
    training_set, test_set = train_test_split(dataset, test_size=0.1, random_state=random_parameter)
    training_set = torch.utils.data.DataLoader(training_set, batch_size=batch_size, shuffle=True)
    test_set = torch.utils.data.DataLoader(test_set, batch_size=batch_size, shuffle=True)
    # shuffle: always turn on if dataset is ordered!
    print('Data loaded, initiating neural network')

    # initiate and train the network
    nn = BuildNetwork(structure)
    # print("Status check: ", nn.forward(torch.rand((28, 28)).view((1, 28*28))))
    # optimizer has to be defined outside the network module, idk why
    optimizer = torch.optim.SGD(nn.parameters(), lr=learning_rate)
    errors = nn.train_network(epochs, training_set, test_set, optimizer)

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
    
    output_structure = []
    for i in range(len(structure)):
        output_structure += [int(structure[i][0])]
    
    weights, biases = get_parameters(nn)

    # save the network to a pickle file
    with open('nn.txt', 'wb') as output:
        pickle.dump(nn, output, pickle.HIGHEST_PROTOCOL)

    return output_structure, errors, weights, biases


def get_parameters(nn):
    weights = []
    biases = []
    for layer in nn.layers:
        weights += [layer.weight.data.tolist()]
        biases += [layer.bias.data.tolist()]
    return weights, biases


def classify(x, nn, normalise=False, name=False):
    if normalise:
        x = dataset.normalise_input(x)
        x = torch.tensor(x, dtype=torch.float32)
    output = torch.argmax(nn(x.view(-1, n_inputs))[0])
    if name:
        output = dataset.label_name(output)
    return output



