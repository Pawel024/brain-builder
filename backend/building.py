"""
This module contains the functions used to build the neural network.
It is called by the process_data module,
and calls the levels module for information on the games, and the modular_network module for the actual network.
"""

# Improvements:
# Idea: look into batches: Do we need them? How do they work?
# Idea: consider migrating some functions from levels.py to here
# Idea: construct a function which plots the decision boundary

from sklearn.model_selection import train_test_split
from .modular_network import *  # UNCOMMENT THIS
#import .levels  # UNCOMMENT THIS
#from modular_network import *  # COMMENT THIS
#from data_functions import *  # COMMENT THIS
from . import levels  # COMMENT THIS
import pickle

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

dataset = None
n_inputs = 0
n_outputs = 0


def build_nn(input_list, tag):
    global dataset, n_inputs, n_outputs
    # convert the input list to usable values
    structure, learning_rate, epochs = levels.convert_input(input_list, tag)
    n_inputs, n_outputs = structure[0][0], structure[-1][0]

    # now separate into training and testing data:
    batch_size = 10  # feed small amounts of data to adjust gradient with, usually between 8 and 64
    # random_parameter = np.random.randint(1, 100)
    random_parameter = 42
    training_set, test_set = levels.get_data(tag)
    training_set = torch.utils.data.DataLoader(training_set, batch_size=batch_size, shuffle=True)
    test_set = torch.utils.data.DataLoader(test_set, batch_size=batch_size, shuffle=True)
    # shuffle: always turn on if dataset is ordered!
    print('Data loaded, initiating neural network')

    # initiate and train the network
    nn = BuildNetwork(structure)
    # print("Status check: ", nn.forward(torch.rand((28, 28)).view((1, 28*28))))
    # optimizer has to be defined outside the network module, idk why
    optimizer = torch.optim.SGD(nn.parameters(), lr=learning_rate)
    errors = nn.train_network(epochs, training_set, test_set, optimizer, typ=levels.find_type(tag), dat=levels.data)

    if levels.find_type(tag) == 1:
        levels.data.plot_decision_boundary(nn, epochs)

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


def predict(x, nn, tag, normalization=False, name=False):
    if levels.find_type(tag) == 1:
        if normalization:
            x = dataset.normalize(x)
            x = torch.tensor(x, dtype=torch.float32)
        output = torch.argmax(nn(x.view(-1, n_inputs))[0])
        if name:
            output = dataset.label_name(output)
        return output

    elif levels.find_type(tag) == 2:
        if normalization:
            x = dataset.normalize(x)
            x = torch.tensor(x, dtype=torch.float32)
        output = nn(x.view(-1, n_inputs))[0]
        output = dataset.denormalize(output.tolist())
        if name:
            output = dict(zip(dataset.label_name(output), output))
        return output

    else:
        print("Task not supported yet")
        return None
