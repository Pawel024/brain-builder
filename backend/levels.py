"""
This module contains the information on the different levels and challenges used in the backend.
It is called by the process_data module,
and calls the data_functions module to get the actual data.
The game data is stored in a csv file, which is loaded into a pandas dataframe.
There are 3 ways to obtain a dataset:
1. load a dataset from sklearn (e.g. 'load_wine()', 'load_iris()', 'load_digits')
2. load a dataset from an Excel file (e.g. 'Clas1', 'Clas2a', 'Reg1')
3. use a custom dataset class (e.g. 'sin' or 'circle')
"""

# Improvements:
# Idea: look into 'make_classification', 'make_regression' and 'make_blobs' from sklearn.datasets
# Idea: add an 'image' option to load an image dataset from a folder
# Idea: add a 'custom' option to load a custom dataset from a csv (and potentially expand this to images?)
# Idea: look into reinforcement learning

from . import data_functions as df
import os
from sklearn import datasets
from sklearn.model_selection import train_test_split
import pandas as pd
import pickle
import numpy as np

games = None


# this is how you access data in the dataframe
def find_type(tag):
    """
    Returns the task type of the given tag:
    0 for tutorial, 1 for classification, 2 for regression
    """
    return games.loc[tag, 'type']


def convert_input(lst, tag, af=True):
    # basic settings
    other, nodes = lst
    structure = [[nodes[0]]]
    for x in nodes[1:]:
        structure += [[x, 'Linear', 'Sigmoid', True]]  # all nodes are linear and include a sigmoid activation and bias
    learning_rate, epochs, normalization = other

    assert structure[0][0] == games.loc[tag, 'n_inputs']
    assert structure[-1][0] == games.loc[tag, 'n_outputs']

    # modifications depending on tag
    if games.loc[tag, 'type'] == 1:
        structure[-1][2] = 'Softmax'
    elif games.loc[tag, 'type'] == 2:
        structure[-1][2] = ''

    # modifications depending on activation setting
    if not af:
        for x in structure[1:]:
            x[2] = ''

    return structure, learning_rate, epochs, normalization


def get_data(tag, normalization=False, data=None):
    magic_box = {'df': df, 'datasets': datasets, 'normalization': normalization}
    if games.loc[tag, 'dataset'] is None:
        print("No dataset found for tag ", tag)
    
    # if the dataset has been passed on, just use that
    elif data is not None:
        pass

    elif type(games.loc[tag, 'dataset']) is str and games.loc[tag, 'dataset'].startswith('load_'):
        # import a dataset from sklearn
        exec('data = df.DataFromSklearn1(datasets.' + games.loc[tag, 'dataset'] + ', normalize=normalization)', magic_box)
        data = magic_box['data']
        # Note: exec may cause security problems if games is defined elsewhere, but should be fine for now

    elif type(games.loc[tag, 'dataset']) is str and games.loc[tag, 'dataset'].startswith('make_'):
        # import a dataset from sklearn
        exec('data = df.DataFromSklearn2(datasets.' + games.loc[tag, 'dataset'] + ', normalize=normalization, data_type=' + str(find_type(tag)) + ')', magic_box)
        data = magic_box['data']
        # Note: exec may cause security problems if games is defined elsewhere, but should be fine for now

    elif type(games.loc[tag, 'dataset']) is str and games.loc[tag, 'dataset'].startswith('['):
        # Note: I had to use eval here on the external csv file,
        # so first some basic security measures:
        if (len(games.loc[tag, 'dataset']) < 100 and list(games.loc[tag, 'dataset'])[-1] == ']' and
                not games.loc[tag, 'dataset'].__contains__('(') and not games.loc[tag, 'dataset'].__contains__(')')):
            data = df.DataFromFunction(eval(games.loc[tag, 'dataset']), normalize=normalization)

    elif type(games.loc[tag, 'dataset']) is str:
        # load the dataset from Excel -> use custom dataset class
        data = df.DataFromExcel(os.path.join(os.path.dirname(__file__), games.loc[tag, 'dataset']), data_type=games.loc[tag, 'type'], normalize=normalization)

    return data, train_test_split(data, test_size=0.2)
