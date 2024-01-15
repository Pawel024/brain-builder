"""
This module contains 3 classes:
- DataFromExcel: creates a dataset from a .csv file (e.g. Clas2a.csv), useful for real-world data
- DataFromSklearn: creates a dataset from a dataset from sklearn (wine, iris, etc.), useful for classification
- DataFromCustom: creates a dataset from a specified function, useful for regression
These classes and their functions are used in the building.py and levels.py modules.
"""

# Improvements:
# idea: add custom feature selection
# idea: add manually defined normalization to standard normal distribution
# idea: add sklearn.preprocessing.MinMaxScaler(), .Normalizer() and .StandardScaler to scale the data
# idea: add class for images

import os
from io import BytesIO  # for sending the images
import requests  # for sending the images
from base64 import b64encode  # for sending the images
import numpy as np
import pandas as pd
import torch
from torch.utils.data import Dataset, DataLoader
from matplotlib import pyplot as plt

root_link = None
task_id = None
user_id = None


class DataFromExcel(Dataset):
    """Create a dataset from a CSV file with column labels in the first row.
    data_type can be one of the following integers:
    - 0: classification (a single 'Targets' column, data in columns labeled with feature names)
    - 1: regression (multiple 'Target_n' or 'Target_abc' columns, data in columns labeled with feature names)
    """

    def __init__(self, csv_file_path, data_type=1, normalize=False):
        """
        Arguments:
            csv_file_path (string): Path to the csv file with annotations.
            data_type (integer): currently only 0 is supported
            normalize (boolean): normalize the data to the range [0, 1]
        """
        self.data_type, self.normalization = data_type, normalize
        self.data = pd.read_csv(csv_file_path)
        # set some initial values
        self.n_targets, self.n_features, self.n_objects = 0, 0, 0
        self.target_names, self.feature_names, self.minima, self.maxima = [], [], [], []

        if data_type == 1:
            self.feature_names = self.data.columns[~self.data.columns.str.contains('Target')]
            self.feature_names = [x.replace(' ', '_') for x in self.feature_names]
            self.feature_names = [x.replace('/', '_') for x in self.feature_names]

            self.n_features = len(self.feature_names)
            self.n_objects = len(self.data)

            self.target_names = self.data.loc[:, 'Target'].unique()
            self.n_targets = len(self.target_names)
            # now transform the target_names to integers
            for i in range(self.n_objects):
                self.data.loc[i, 'Target'] = np.where(self.target_names == self.data.loc[i, 'Target'])[0][0]

            self.minima = np.min(self.data.loc[:, self.feature_names], axis=0)
            self.maxima = np.max(self.data.loc[:, self.feature_names], axis=0)

            if self.normalization:
                for i, f in enumerate(self.feature_names):
                    self.data.loc[:, f] = ((self.data.loc[:, f] - self.minima.iloc[i]) /
                                           (self.maxima.iloc[i] - self.minima.iloc[i]))

        elif data_type == 2:
            # first find all the target columns
            self.target_names = self.data.columns[self.data.columns.str.contains('Target')]
            self.n_targets = len(self.target_names)

            self.feature_names = self.data.columns[~self.data.columns.str.contains('Target')]
            self.feature_names = [x.replace(' ', '_') for x in self.feature_names]
            self.feature_names = [x.replace('/', '_') for x in self.feature_names]
            self.n_features = len(self.feature_names)
            self.n_objects = len(self.data)

            self.minima = self.data.min(axis=0)
            self.maxima = self.data.max(axis=0)
            if self.normalization:
                for i in range(self.n_features + self.n_targets):
                    self.data.iloc[:, i] = ((self.data.iloc[:, i] - self.minima.iloc[i]) /
                                            (self.maxima.iloc[i] - self.minima.iloc[i]))

        else:
            print("Data type not supported yet")
            pass

        self.plot_data()  # uncomment if you want plots of the data; they will be saved in plt_dir

    # modifying the inherited functions

    def __len__(self):
        return self.n_objects

    def __getitem__(self, idx):

        if torch.is_tensor(idx):
            idx = np.array(idx.tolist())

        target = None

        if self.data_type == 1:
            target = self.data.loc[idx, 'Target']
            target = np.array([target], dtype=int).reshape(-1, 1)

        elif self.data_type == 2:
            target = self.data.loc[idx, self.target_names]
            target = np.array([target], dtype=float).reshape(-1, self.n_targets)

        dat = self.data.loc[idx, self.feature_names]
        dat = np.array([dat], dtype=float).reshape(-1, self.n_features)
        sample = {'data': dat, 'target': target}

        return sample

    # adding some extra functions

    def normalize(self, X):
        try:
            assert len(X) == self.n_features
        except AssertionError:
            print("Looks like x does not have the right length, is your data type supported?")
            return None
        out = []
        for i, x in enumerate(X):
            mini = self.minima.loc[self.feature_names[i]]
            maxi = self.maxima.loc[self.feature_names[i]]
            out += [(x-mini)/(maxi-mini)]
        return out

    def denormalize(self, Y):  # this is only necessary for regression
        assert len(Y) == self.n_targets
        out = []
        for i, y in enumerate(Y):
            mini = self.minima.loc[self.target_names[i]]
            maxi = self.maxima.loc[self.target_names[i]]
            out += [y*(maxi-mini)+mini]
        return out

    def label_name(self, i):
        assert type(i) is int
        try:
            return self.target_names[i]
        except IndexError:
            print("Target name not found")
            return None

    def sort_data(self, column='Target'):
        """Sorts the target_names of the dataset in ascending order and returns the sorted dataset."""
        self.data.sort_values(by=[column], inplace=True)
        self.data.reset_index(drop=True, inplace=True)

    def plot_data(self):
        """Plots the data."""
        img = BytesIO.BytesIO()

        if self.data_type == 1:
            n_plots = self.n_features * (self.n_features - 1) // 2
            n_rows = int(n_plots**0.5)
            n_cols = n_plots // n_rows
            if n_rows * n_cols < n_plots:
                n_cols += 1
            fig, ax = plt.subplots(n_rows, n_cols)
            k = 0

            for i in range(self.n_features):
                if type(self.data.iloc[0, i]) is not str and self.data.columns[i] != 'Target':
                    for j in range(i+1, self.n_features+1):
                        if type(self.data.iloc[0, j]) is not str and self.data.columns[j] != 'Target':
                            row = k // n_cols
                            col = k % n_cols
                            ax[row, col].scatter(self.data.iloc[:, i], self.data.iloc[:, j], c=self.data.loc[:, 'Target'])
                            ax[row, col].set_xlabel(self.data.columns[i])
                            ax[row, col].set_ylabel(self.data.columns[j])
                            k += 1

        elif self.data_type == 2:
            n_plots = (self.n_features + self.n_targets) * (self.n_features + self.n_targets - 1) // 2
            n_rows = int(n_plots**0.5)
            n_cols = n_plots // n_rows
            if n_rows * n_cols < n_plots:
                n_cols += 1
            fig, ax = plt.subplots(n_rows, n_cols)
            k = 0
            for i in range(self.n_features + self.n_targets - 1):
                if type(self.data.iloc[0, i]) is not str:
                    for j in range(i+1, self.n_features + self.n_targets):
                        if type(self.data.iloc[0, j]) is not str:
                            row = k // n_cols
                            col = k % n_cols
                            ax[row, col].scatter(self.data.iloc[:, i], self.data.iloc[:, j])
                            ax[row, col].set_xlabel(self.data.columns[i])
                            ax[row, col].set_ylabel(self.data.columns[j])
                            k += 1

        plt.savefig(img, format='png')
        img.seek(0)
        img = b64encode(img.getvalue()).decode('utf-8')
        requests.put(root_link + 'progress/', json={'progress': -1, 'plots': img, 'error_list': json.dumps([]), 'user_id': user_id, 'task_id': task_id})
        plt.clf()

    # This function is based on a CSE2510 Notebook and plots the decision boundary of a classifier
    def plot_decision_boundary(self, model, epoch=0):
        step = 0.01

        if self.data_type == 1:
            if self.n_features < 3:  # can probably go up to 4 or 5
                if self.normalization:
                    mesh = np.meshgrid(*self.n_features*[np.arange(-0.1, 1.1, step)])
                else:
                    mesh = np.meshgrid(*[np.arange(mini, maxi, step) for mini, maxi in zip(self.minima, self.maxima)])

                # Plot the decision boundary. For that, we will assign a color to each
                # point in the mesh.
                mesh = np.array(mesh)
                Z = np.array(model.predict(mesh.reshape(self.n_features, -1).T))
                Z = Z.reshape(mesh[0].shape)

                n_plots = self.n_features * (self.n_features - 1) // 2
                n_rows = int(n_plots**0.5)
                n_cols = n_plots // n_rows
                if n_rows * n_cols < n_plots:
                    n_cols += 1
                fig, ax = plt.subplots(n_rows, n_cols)
                k = 0

                for i in range(self.n_features):
                    if type(self.data.iloc[0, i]) is not str and self.data.columns[i] != 'Target':
                        for j in range(i + 1, self.n_features + 1):
                            if type(self.data.iloc[0, j]) is not str and self.data.columns[i] != 'Target':
                                # Put the result into a color plot
                                row = k // n_cols
                                col = k % n_cols
                                ax[row, col].contourf(mesh[np.where(np.array(self.feature_names) == self.data.columns[i])[0]][0],
                                             mesh[np.where(np.array(self.feature_names) == self.data.columns[j])[0]][0],
                                             Z, alpha=0.5)
                                ax[row, col].scatter(self.data.iloc[:, i], self.data.iloc[:, j], c=self.data.loc[:, 'Target'])
                                ax[row, col].set_xlabel(self.data.columns[i])
                                ax[row, col].set_ylabel(self.data.columns[j])
                                k += 1
                img = BytesIO.BytesIO()
                plt.savefig(img, format='png')
                img.seek(0)
                img = b64encode(img.getvalue()).decode('utf-8')
                plt.clf()
                return img
                                

        elif self.data_type == 2:
            if self.n_features < 2 and self.n_targets < 2:
                if self.normalization:
                    inp = np.arange(-0.1, 1.1, step)
                else:
                    mini, maxi = self.minima[0], self.maxima[0]
                    inp = np.arange(mini, maxi, step)

                # Plot the decision boundary. For that, we will assign a color to each
                # point in the mesh.
                inp = np.array(inp)
                Z = np.array(model.predict(inp.reshape(self.n_features, -1).T))

                
                plt.plot(inp, Z)
                plt.scatter(self.data.loc[:, self.feature_names[0]], self.data.loc[:, self.target_names[0]])
                plt.xlabel(self.feature_names[0])
                plt.ylabel(self.target_names[0])
                img = BytesIO.BytesIO()
                plt.savefig(img, format='png')
                img.seek(0)
                img = b64encode(img.getvalue()).decode('utf-8')
                plt.clf()
                return img



"""
# _________________________________________________________________
# TESTING
d = DataFromExcel('TestR.csv', normalize=True, data_type=1)

print(d.label_name(0))
print(d.minima)
norm = d.normalize([89, 20])
print(norm)
norm = [1, 1]
print(d.denormalize(norm))
"""


class DataFromSklearn1(Dataset):  # this one is for load_wine(), etc.
    def __init__(self, dataset, normalize=False):  # assumed to be for classification
        self.data = dataset.data
        self.targets = dataset.target
        self.normalization = normalize

        self.target_names = dataset.target_names
        self.feature_names = dataset.feature_names
        self.feature_names = [x.replace(' ', '_') for x in self.feature_names]
        self.feature_names = [x.replace('/', '_') for x in self.feature_names]

        self.n_targets = len(self.target_names)
        self.n_features = len(self.feature_names)
        self.n_objects = len(self.data)

        self.minima = np.min(self.data, axis=0)
        self.maxima = np.max(self.data, axis=0)

        if self.normalization:
            for i in range(self.n_features):
                self.data[:, i] = ((self.data[:, i] - self.minima[i]) / (self.maxima[i] - self.minima[i]))

        self.plot_data()  # uncomment if you want plots of the data; they will be saved in plt_dir

    def __len__(self):
        return self.n_objects

    def __getitem__(self, idx):

        if torch.is_tensor(idx):
            idx = np.array(idx.tolist())

        target = self.targets[idx]
        target = np.array([target], dtype=int).reshape(-1, 1)
        dat = self.data[idx, :]
        dat = np.array([dat], dtype=float).reshape(-1, self.n_features)
        sample = {'data': dat, 'target': target}

        return sample

    # adding some extra functions

    def normalize(self, x):
        assert len(x) == self.n_features
        out = []
        for i, x in enumerate(x):
            mini = self.minima[i]
            maxi = self.maxima[i]
            out += [(x-mini)/(maxi-mini)]
        return out

    def label_name(self, i):
        assert type(i) is int
        assert i < self.n_targets
        return self.target_names[i]

    def sort_data(self, column='Target'):
        """Sorts the labels of the dataset in ascending order and returns the sorted dataset."""
        # sort the numpy array
        if column == 'Target':
            idx = np.argsort(self.targets)
            self.targets = self.targets[idx]
            self.data = self.data[idx, :]
        else:
            idx = np.argsort(self.data[:, np.where(self.feature_names == column)])
            self.data = self.data[idx, :]
            self.targets = self.targets[idx]

    def plot_data(self):
        """Plots the data."""
        img = BytesIO.BytesIO()

        n_plots = self.n_features * (self.n_features - 1) // 2
        n_rows = int(n_plots**0.5)
        n_cols = n_plots // n_rows
        if n_rows * n_cols < n_plots:
            n_cols += 1
        fig, ax = plt.subplots(n_rows, n_cols)
        k = 0

        for i in range(self.n_features-1):
            if type(self.data[0, i]) is not str:
                for j in range(i+1, self.n_features):
                    if type(self.data[0, j]) is not str:
                        row = k // n_cols
                        col = k % n_cols
                        ax[row, col].scatter(self.data[:, i], self.data[:, j], c=self.targets)
                        ax[row, col].set_xlabel(self.data.columns[i])
                        ax[row, col].set_ylabel(self.data.columns[j])
                        k += 1
        
        plt.savefig(img, format='png')
        img.seek(0)
        img = b64encode(img.getvalue()).decode('utf-8')
        requests.put(root_link + 'api/progress/', json={'progress':-1, 'plots': img, 'error_list': json.dumps([]), 'user_id': user_id, 'task_id': task_id})
        plt.clf()

    def plot_decision_boundary(self, model, epoch=0):
        step = 0.01

        if self.n_features < 3:
            if self.normalization:
                mesh = np.meshgrid(*self.n_features * [np.arange(-0.1, 1.1, step)])
            else:
                mesh = np.meshgrid(*[np.arange(mini, maxi, step) for mini, maxi in zip(self.minima, self.maxima)])

            # Plot the decision boundary. For that, we will assign a color to each
            # point in the mesh.
            mesh = np.array(mesh)
            Z = np.array(model.predict(mesh.reshape(self.n_features, -1).T))
            Z = Z.reshape(mesh[0].shape)

            n_plots = self.n_features * (self.n_features - 1) // 2
            n_rows = int(n_plots ** 0.5)
            n_cols = n_plots // n_rows
            if n_rows * n_cols < n_plots:
                n_cols += 1

            for i in range(self.n_features):
                if type(self.data[0, i]) is not str:
                    for j in range(i + 1, self.n_features + 1):
                        if type(self.data[0, j]) is not str:
                            # Put the result into a color plot
                            row = k // n_cols
                            col = k % n_cols
                            ax[row, col].contourf(mesh[i][0],
                                         mesh[j][0],
                                         Z, alpha=0.5)
                            ax[row, col].scatter(self.data[:, i], self.data[:, j], c=self.targets)
                            ax[row, col].set_xlabel(self.data.columns[i])
                            ax[row, col].set_ylabel(self.data.columns[j])
                            k += 1

            img = BytesIO.BytesIO()
            plt.savefig(img, format='png')
            img.seek(0)
            img = b64encode(img.getvalue()).decode('utf-8')
            plt.clf()
            return img


class DataFromSklearn2(Dataset):  # this one is for make_regression() and make_classification()
    def __init__(self, dataset, normalize=False, data_type=2):  # works for up to 10 features and 10 targets
        self.data_type = data_type
        self.data, self.targets = dataset
        if len(self.targets.shape) == 1:
            self.targets = self.targets.reshape(-1, 1)

        self.target_names = ['Target_1', 'Target_2', 'Target_3', 'Target_4', 'Target_5', 'Target_6', 'Target_7',
                             'Target_8', 'Target_9', 'Target_10']
        self.feature_names = ['Feature_1', 'Feature_2', 'Feature_3', 'Feature_4', 'Feature_5', 'Feature_6',
                              'Feature_7', 'Feature_8', 'Feature_9', 'Feature_10']

        self.n_targets = len(self.targets[0])
        self.n_features = len(self.data[0])
        self.n_objects = len(self.data)
        if self.data_type == 1:
            self.n_targets = np.unique(self.targets).shape[0]

        self.minima = np.min(self.data, axis=0)
        self.maxima = np.max(self.data, axis=0)
        self.target_minima = np.min(self.targets, axis=0)
        self.target_maxima = np.max(self.targets, axis=0)

        if normalize:
            for i in range(self.n_features):
                self.data[:, i] = ((self.data[:, i] - self.minima[i]) / (self.maxima[i] - self.minima[i]))
            if self.data_type == 2:
                for i in range(self.n_targets):
                    self.targets[:, i] = ((self.targets[:, i] - self.target_minima[i]) /
                                          (self.target_maxima[i] - self.target_minima[i]))

        # clear the plots directory
        self.plt_dir = 'plots'
        files = os.listdir(self.plt_dir)
        for file in files:
            os.remove(self.plt_dir + '/' + file)
        self.plot_data()  # uncomment if you want plots of the data; they will be saved in plt_dir

    def __len__(self):
        return self.n_objects

    def __getitem__(self, idx):

        if torch.is_tensor(idx):
            idx = np.array(idx.tolist())

        if self.data_type == 1:
            target = self.targets[idx]
            target = np.array([target], dtype=int).reshape(-1, 1)
        else:
            target = self.targets[idx]
            target = np.array([target], dtype=int).reshape(-1, self.n_targets)
        dat = self.data[idx, :]
        dat = np.array([dat], dtype=float).reshape(-1, self.n_features)
        sample = {'data': dat, 'target': target}

        return sample

    # adding some extra functions

    def normalize(self, x):
        assert len(x) == self.n_features
        out = []
        for i, x in enumerate(x):
            mini = self.minima[i]
            maxi = self.maxima[i]
            out += [(x-mini)/(maxi-mini)]
        return out

    def denormalize(self, y):
        assert len(y) == self.n_targets
        out = []
        for i, y in enumerate(y):
            mini = self.target_minima[i]
            maxi = self.target_maxima[i]
            out += [y*(maxi-mini)+mini]
        return out

    def label_name(self, i):
        assert type(i) is int
        assert i < self.n_targets
        return self.target_names[i]

    def sort_data(self, column='Target'):
        """Sorts the labels of the dataset in ascending order and returns the sorted dataset."""

        if self.data_type == 1:
            if column == 'Target':
                idx = np.argsort(self.targets)
                self.targets = self.targets[idx]
                self.data = self.data[idx, :]
            else:
                idx = np.argsort(self.data[:, np.where(self.feature_names == column)])
                self.data = self.data[idx, :]
                self.targets = self.targets[idx]

        else:
            if column.__contains__('Target'):
                idx = np.argsort(self.targets[:, np.where(self.target_names == column)])
                self.targets = self.targets[idx]
                self.data = self.data[idx, :]
            else:
                idx = np.argsort(self.data[:, np.where(self.feature_names == column)])
                self.data = self.data[idx, :]
                self.targets = self.targets[idx]

    def plot_data(self):
        """Plots the data."""
        img = BytesIO.BytesIO()

        if self.data_type == 1:
            n_plots = self.n_features * (self.n_features - 1) // 2
            n_rows = int(n_plots**0.5)
            n_cols = n_plots // n_rows
            if n_rows * n_cols < n_plots:
                n_cols += 1
            fig, ax = plt.subplots(n_rows, n_cols)
            k = 0

            for i in range(self.n_features - 1):
                if type(self.data[0, i]) is not str:
                    for j in range(i + 1, self.n_features):
                        if type(self.data[0, j]) is not str:
                            row = k // n_cols
                            col = k % n_cols
                            ax[row, col].scatter(self.data[:, i], self.data[:, j], c=self.targets)
                            ax[row, col].xlabel(self.data.columns[i])
                            ax[row, col].ylabel(self.data.columns[j])
                            k += 1

        else:
            d = np.concatenate((self.data, self.targets), axis=1)
            c = self.feature_names + self.target_names
            # nothing to see here, just move along

            n_plots = (self.n_features + self.n_targets) * (self.n_features + self.n_targets - 1) // 2
            n_rows = int(n_plots**0.5)
            n_cols = n_plots // n_rows
            if n_rows * n_cols < n_plots:
                n_cols += 1
            fig, ax = plt.subplots(n_rows, n_cols)
            k = 0

            for i in range(self.n_features + self.n_targets - 1):
                if type(d[0, i]) is not str:
                    for j in range(i+1, self.n_features + self.n_targets):
                        if type(d[0, j]) is not str:
                            row = k // n_cols
                            col = k % n_cols
                            ax[row, col].scatter(d[:, i], d[:, j])
                            ax[row, col].set_xlabel(c[i])
                            ax[row, col].set_ylabel(c[j])
                            k += 1
        
        plt.savefig(img, format='png')
        img.seek(0)
        img = b64encode(img.getvalue()).decode('utf-8')
        requests.put(root_link + 'api/progress/', json={'progress': -1, 'plots': img, 'error_list': json.dumps([]), 'user_id': user_id, 'task_id': task_id})
        plt.clf()

    def plot_decision_boundary(self, model, epoch=0):
        if self.n_features < 2 and self.n_targets < 2:
            step = 0.01
            if self.normalization:
                inp = np.arange(-0.1, 1.1, step)
            else:
                mini, maxi = self.minima[0], self.maxima[0]
                inp = np.arange(mini, maxi, step)

            # Plot the decision boundary. For that, we will assign a color to each
            # point in the mesh.
            inp = np.array(inp)
            Z = np.array(model.predict(inp.reshape(self.n_features, -1).T))

            
            plt.plot(inp, Z)
            plt.scatter(self.data.loc[:, self.feature_names[0]], self.data.loc[:, self.target_names[0]])
            plt.xlabel(self.feature_names[0])
            plt.ylabel(self.target_names[0])
            img = BytesIO.BytesIO()
            plt.savefig(img, format='png')
            img.seek(0)
            img = b64encode(img.getvalue()).decode('utf-8')
            plt.clf()
            return img


class DataFromFunction(Dataset):  # this one is for regression on simple functions
    def __init__(self, inp, normalize=False):  # works for up to 10 features and 10 targets
        self.functions, self.n_objects, self.n_features, self.n_targets, lower, upper = inp
        if type(self.functions) is not list:
            self.functions = [self.functions]
        self.data = np.random.rand(self.n_objects, self.n_features) * (upper - lower) + lower

        self.targets = np.zeros((self.n_objects, self.n_targets))
        for i in range(self.n_targets):
            self.targets[:, i] = sum(self.functions[j](self.data[:, j]) for j in range(self.n_features))

        self.feature_names = ['x1', 'x2', 'x3', 'x4', 'x5', 'x6', 'x7', 'x8', 'x9', 'x10']
        self.target_names = ['y1', 'y2', 'y3', 'y4', 'y5', 'y6', 'y7', 'y8', 'y9', 'y10']

        self.minima = np.min(self.data, axis=0)
        self.maxima = np.max(self.data, axis=0)
        self.target_minima = np.min(self.targets, axis=0)
        self.target_maxima = np.max(self.targets, axis=0)

        if normalize:
            for i in range(self.n_features):
                self.data[:, i] = ((self.data[:, i] - self.minima[i]) / (self.maxima[i] - self.minima[i]))
                self.targets[:, i] = ((self.targets[:, i] - self.target_minima[i]) /
                                          (self.target_maxima[i] - self.target_minima[i]))

        # clear the plots directory
        self.plt_dir = 'plots'
        files = os.listdir(self.plt_dir)
        for file in files:
            os.remove(self.plt_dir + '/' + file)
        self.plot_data()  # uncomment if you want plots of the data; they will be saved in plt_dir

    def __len__(self):
        return self.n_objects

    def __getitem__(self, idx):

        if torch.is_tensor(idx):
            idx = np.array(idx.tolist())

        target = self.targets[idx]
        target = np.array([target], dtype=int).reshape(-1, self.n_targets)
        dat = self.data[idx, :]
        dat = np.array([dat], dtype=float).reshape(-1, self.n_features)
        sample = {'data': dat, 'target': target}

        return sample

    # adding some extra functions

    def normalize(self, x):
        assert len(x) == self.n_features
        out = []
        for i, x in enumerate(x):
            mini = self.minima[i]
            maxi = self.maxima[i]
            out += [(x-mini)/(maxi-mini)]
        return out

    def denormalize(self, y):
        assert len(y) == self.n_targets
        out = []
        for i, y in enumerate(y):
            mini = self.target_minima[i]
            maxi = self.target_maxima[i]
            out += [y*(maxi-mini)+mini]
        return out

    def label_name(self, i):
        assert type(i) is int
        assert i < self.n_targets
        return self.target_names[i]

    def sort_data(self, column='Target'):
        """Sorts the labels of the dataset in ascending order and returns the sorted dataset."""

        if column.__contains__('Target'):
            idx = np.argsort(self.targets[:, np.where(self.target_names == column)])
            self.targets = self.targets[idx]
            self.data = self.data[idx, :]
        else:
            idx = np.argsort(self.data[:, np.where(self.feature_names == column)])
            self.data = self.data[idx, :]
            self.targets = self.targets[idx]

    def plot_data(self):
        """Plots the data."""
        d = np.concatenate((self.data, self.targets), axis=1)
        c = self.feature_names + self.target_names
        # nothing to see here, just move along

        img = BytesIO.BytesIO()
        n_plots = (self.n_features + self.n_targets) * (self.n_features + self.n_targets - 1) // 2
        n_rows = int(n_plots**0.5)
        n_cols = n_plots // n_rows
        if n_rows * n_cols < n_plots:
            n_cols += 1

        for i in range(self.n_features + self.n_targets - 1):
            if type(d[0, i]) is not str:
                for j in range(i+1, self.n_features + self.n_targets):
                    if type(d[0, j]) is not str:
                        row = k // n_cols
                        col = k % n_cols
                        ax[row, col].scatter(d[:, i], d[:, j])
                        ax[row, col].xlabel(c[i])
                        ax[row, col].ylabel(c[j])
                        k += 1
        
        plt.savefig(img, format='png')
        img.seek(0)
        img = b64encode(img.getvalue()).decode('utf-8')
        requests.put(root_link + 'api/progress/', json={'progress': -1, 'plots': img, 'error_list': json.dumps([]), 'user_id': user_id, 'task_id': task_id})
        plt.clf()

    def plot_decision_boundary(self, model, epoch=0):
        if self.n_features < 2 and self.n_targets < 2:
                step = 0.01
                if self.normalization:
                    inp = np.arange(-0.1, 1.1, step)
                else:
                    mini, maxi = self.minima[0], self.maxima[0]
                    inp = np.arange(mini, maxi, step)

                # Plot the decision boundary. For that, we will assign a color to each
                # point in the mesh.
                inp = np.array(inp)
                Z = np.array(model.predict(inp.reshape(self.n_features, -1).T))

                
                plt.plot(inp, Z)
                plt.scatter(self.data.loc[:, self.feature_names[0]], self.data.loc[:, self.target_names[0]])
                plt.xlabel(self.feature_names[0])
                plt.ylabel(self.target_names[0])
                img = BytesIO.BytesIO()
                plt.savefig(img, format='png')
                img.seek(0)
                img = b64encode(img.getvalue()).decode('utf-8')
                plt.clf()
                return img
