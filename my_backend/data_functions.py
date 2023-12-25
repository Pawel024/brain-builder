# import os
import numpy as np
import pandas as pd
# from skimage import io, transform
import torch
# from torchvision import transforms, utils
from torch.utils.data import Dataset, DataLoader

class DataFromExcel(Dataset):
    """Create a dataset from a CSV file with column labels in the first row.
    data_type can be one of the following integers:
    - 0: default; targets in first column, data in next columns
    - 1: image classification
    - 2: finding features in images
    """

    def __init__(self, csv_file_path, img_dir=None, transform=None, data_type=None):
        """
        Arguments:
            csv_file_path (string): Path to the csv file with annotations.
            img_dir (string): Path to the directory with all the images.
            transform (callable, optional): Optional transform to be applied on a sample.
        """
        self.data = pd.read_csv(csv_file_path)
        self.data_parameters = {'n_objects': len(self.data), 'n_features': len(self.data.columns) - 1,
                                'labels': ('Communications', 'Earth Observation', 'Navigation'),
                                'features': ('Semi-Major Axis [km]', 'Inclination [degrees]',
                                             'Expected Lifetime [years]', 'Launch Mass [kg]'),
                                'features_min': (315.5, 0, 0.5, 1),
                                'features_max': (37794.5, 99.4, 20, 7075)}
        self.img_dir = img_dir
        self.transform = transform
        self.type = data_type

    def __len__(self):
        return self.data_parameters['n_objects']

    def normalise_input(self, inp):
        out = []
        for i, x in enumerate(inp):
            mini = self.data_parameters['features_min'][i]
            maxi = self.data_parameters['features_max'][i]
            out += [(x-mini)/(maxi-mini)]
        return out

    def label_name(self, i):
        return self.data_parameters['labels'][i]

    def __getitem__(self, idx):
        if torch.is_tensor(idx):
            idx = np.array(idx.tolist())

        # insert missing block here

        label = self.data.iloc[idx, 0]
        label = np.array([label], dtype=float).reshape(-1, 1)
        data = self.data.iloc[idx, 1:self.data_parameters['n_features'] + 1]
        data = np.array([data], dtype=float).reshape(-1, self.data_parameters['n_features'])
        sample = {'data': data, 'label': label}

        if self.transform:
            sample = self.transform(sample)

        return sample

"""
        if self.type == 1:
            label = self.data.iloc[idx, 0]
            label = np.array([label], dtype=float).reshape(-1, 1)
            img_name = os.path.join(self.img_dir,
                                    self.data.iloc[idx, 1])
            image = io.imread(img_name)
            sample = {'image': image, 'label': label}

        elif self.type == 2:
            img_name = os.path.join(self.img_dir,
                                    self.data.iloc[idx, 0])
            image = io.imread(img_name)
            data = self.data.iloc[idx, 1:self.n_features+1]
            data = np.array([data], dtype=float).reshape(-1, self.n_features)
            sample = {'image': image, 'data': data}
        else:
"""
