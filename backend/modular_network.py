"""
This module contains the class BuildNetwork, which is used to construct a neural network,
based on the inputs passed on in building.py.
For now, all networks are fully connected and consist of linear layers with one of the following activations:
ReLu, Sigmoid, Softmax, Log_Softmax, or None.
"""

# Improvements:
# Idea: look into replacing the for loops in training with the torch loss functions
# Idea: look into different loss methods
# Idea: look into reinforcement learning
# Idea: look into different options for layers, e.g. convolutional layers
# Idea: look into different options for activations, e.g. tanh, leaky ReLu, ELU, SELU, etc.
# Idea: look into different options for optimizers, e.g. Adam, Adagrad, RMSProp, etc.

import torch

class BuildNetwork(torch.nn.Module):
    def __init__(self, inp):
        """
        inp: should be a list with elements of the following structure:
        [number_of_nodes, layer_type, activation, bias]
        number_of_nodes (int): specifies amount of nodes in the layer
        layer_type (str): currently only 'Linear' is supported
        activation (str): 'ReLu', 'Sigmoid', 'Softmax' 'Log-Softmax', or None
        bias (bool): True by default
        """
        super().__init__()  # runs the initialisation of nn.Module

        self.input = inp
        self.layers = torch.nn.ModuleList([])  # not sure if the ModuleList makes any difference tbh

        # define network
        # self.fc1 = torch.nn.Linear(input nodes, output nodes)  # layers are automatically constructed as W*x + b
        for i in range(len(inp)-1):
            self.layers += [self.select_layer(self.input[i+1][1], self.input[i][0], self.input[i+1][0], self.input[i+1][3])]

        print("Network structure: ", self.layers)

    def select_layer(self, layer_name, input_nodes, output_nodes, bias=True):
        if layer_name == 'Abc':  # still has to be expanded
            pass
        else:
            return torch.nn.Linear(input_nodes, output_nodes, bias=bias)

    def select_activation(self, x, activation):
        if torch.isnan(torch.tensor(x)).any() or torch.isinf(torch.tensor(x)).any():
            print("NaN after layer", x)
        if activation == 'Sigmoid':
            return torch.sigmoid(x)
        elif activation == 'ReLu':
            return torch.nn.functional.relu(x)
        elif activation == 'Softmax':
            return torch.nn.functional.softmax(x, dim=-1)
        elif activation == 'Log_Softmax':
            return torch.nn.functional.log_softmax(x, dim=-1)
        else:
            # cap the weights at 100 to prevent overflow
            parameters = list(self.parameters())
            for p in parameters:
                p.data = torch.clamp(p.data, -100, 100)
            x.data = torch.clamp(x.data, -1000, 1000)
            return x

    def forward(self, x):  # feed data through the network; pay attention to the right name!
        for i in range(len(self.layers)):
            x = self.select_activation(self.layers[i](x), self.input[i+1][2])
        if torch.isnan(torch.tensor(x)).any() or torch.isinf(torch.tensor(x)).any():
            print("NaN after activation", x)
            parameters = list(self.parameters())
            print(parameters)
        return x

    def predict(self, data, typ=1):
        if typ == 1: # classification
            with torch.no_grad():
                predictions = []
                for datapoint in data:
                    if not torch.is_tensor(datapoint):
                        datapoint = torch.tensor(datapoint, dtype=torch.float32)
                    predictions += [torch.argmax(self(datapoint.float().view(-1, self.input[0][0]))).item()]
                return predictions
        elif typ == 2:  # regression
            with torch.no_grad():
                predictions = []
                for datapoint in data:
                    if not torch.is_tensor(datapoint):
                        datapoint = torch.tensor(datapoint, dtype=torch.float32)
                    predictions += self(datapoint.float().view(-1, self.input[0][0])).tolist()
                return predictions

    def train_epoch(self, data, optimizer, typ=1):
        for datapoint in data:
            X, y = datapoint['data'], datapoint['target']
            self.zero_grad()  # start the gradients at zero

            assert torch.is_tensor(X)
            output = self(X.float().view(-1, self.input[0][0]))  # use -1!
            if typ == 2:  # regression
                y = y.float().view(-1, self.input[-1][0])
                loss = torch.nn.functional.mse_loss(output, y)
            else:  # classification
                y = y.long().view(-1)
                loss = torch.nn.functional.nll_loss(output, y)
            loss.backward()  # backpropagation done for us, thanks PyTorch!
            optimizer.step()  # adjust the weights and biases
    
    def test(self, data, typ=1, acc=False):
        accuracy = None
        with torch.no_grad():
            ys, mse, correct, total = torch.tensor([]), 0, 0, 0
            for datapoint in data:
                X, y = datapoint['data'], datapoint['target']
                output = self(X.float().view(-1, self.input[0][0]))
                if typ == 2:  # regression
                    for idx, out in enumerate(output):
                        assert torch.isnan(torch.tensor(out)).any() == False, "NaN in output"
                        mse += torch.square(out - y[idx].float()).mean().item()
                        ys = torch.cat((ys, y[idx].flatten()), dim=0)
                        total += 1
                else:  # classification
                    for idx, out in enumerate(output):
                        if torch.argmax(out) == y[idx]:
                            correct += 1
                        total += 1
                    
        if typ == 2:
            error = mse / total
            if acc:
                y_var = torch.var(ys).item()
                if y_var <= 1*10**(-6):
                    y_var = 1*10**(-6)
                accuracy = 1 - error / y_var
                print("R^2 on test set: ", accuracy)
        
        else:
            error = round((1 - correct / total), 3)
            if acc:
                accuracy = 1 - error
                print("Accuracy on test set: ", accuracy * 100, "%")

        return error, accuracy


"""  # previous training function:

    def train_network(self, epochs, training_set, test_set, optimizer, typ=1, dat=None, pk=None, task_id=None, user_id=None, root_link=None):
        errors = []
        for epoch in range(epochs):
            for data in training_set:
                X, y = data['data'], data['target']
                self.zero_grad()  # start the gradients at zero

                assert torch.is_tensor(X)
                output = self(X.float().view(-1, self.input[0][0]))  # use -1!
                if typ == 2:  # regression
                    y = y.float().view(-1, self.input[-1][0])
                    loss = torch.nn.functional.mse_loss(output, y)
                else:  # classification
                    y = y.long().view(-1)
                    loss = torch.nn.functional.nll_loss(output, y)
                loss.backward()  # backpropagation done for us, thanks PyTorch!
                optimizer.step()  # adjust the weights and biases
            # print("Loss in epoch", epoch + 1, ": ", loss)  # loss should decrease over time

            if epoch % (epochs // 100 if epochs >= 100 else 1) == 0:
                with torch.no_grad():
                    mse, correct, total = torch.tensor([self.input[-1][0]*[0.]]), 0, 0
                    for data in training_set:
                        X, y = data['data'], data['target']
                        output = self(X.float().view(-1, self.input[0][0]))
                        if typ == 2:  # regression
                            for idx, out in enumerate(output):
                                mse += torch.square(out - y[idx].float())
                                total += 1
                        else:  # classification
                            for idx, out in enumerate(output):
                                if torch.argmax(out) == y[idx]:
                                    correct += 1
                                total += 1

                if epoch % (epochs // 10 if epochs >= 10 else 1) == 0:
                    dat.plot_decision_boundary(self)

                    # now send a progress update to the frontend
                    d = {
                        'user_id': user_id,
                        'task_id': int(task_id),
                        'progress': round(epoch / epochs, 2),
                        'feature_names': json.dumps([x.replace('_', ' ') for x in dat.feature_names]),
                        'plots': json.dumps([]),
                        # 'plots': dat.plot_decision_boundary(self, return_plots=True)  # TODO: add a return_plots option to plot_decision_boundary
                        'error_list': errors
                    }

                    if pk is not None:
                        requests.put(root_link + f"api/progress/{pk}", data=d)
                    elif not requests.get(root_link + f"/api/progress/?user_id={user_id}&task_id={task_id}").json():
                        requests.post(root_link + f"/api/progress/", data=d)


                if typ == 2:
                    error = torch.mean(mse / total)
                    error = error.item()
                    if epoch % (epochs // 10 if epochs >= 10 else 1) == 0:
                        print("Error on training set after epoch ", epoch, ": ", error)
        
                else:
                    error = round((1 - correct / total), 2)
                    if epoch % (epochs // 10 if epochs >= 10 else 1) == 0:
                        print("Accuracy on training set after epoch ", epoch, ": ", round(100 * correct / total, 1), "%")
                errors += [error]
                

        with torch.no_grad():
            ys, mse, correct, total = torch.tensor([]), torch.tensor([self.input[-1][0]*[0.]]), 0, 0
            for data in test_set:
                X, y = data['data'], data['target']
                output = self(X.float().view(-1, self.input[0][0]))
                if typ == 2:  # regression
                    for idx, out in enumerate(output):
                        mse += torch.square(out - y[idx].float())
                        ys = torch.cat((ys, y[idx]), dim=0)
                else:  # classification
                    for idx, out in enumerate(output):
                        if torch.argmax(out) == y[idx]:
                            correct += 1
                        total += 1
        
        dat.plot_decision_boundary(self)
        
        if typ == 2:
            accuracy = torch.mean(1 - mse / torch.sum(torch.square(ys - torch.mean(ys, dim=0)), dim=0))
            if torch.sum(torch.square(ys - torch.mean(ys, dim=0))) == 0:
                accuracy = torch.mean(1 - mse / 1*10**(-6))
            accuracy = accuracy.item()
            print("R^2 on test set: ", accuracy)

        else:
            accuracy = round(correct / total, 3)
            print("Accuracy on test set: ", accuracy * 100, "%")

        return errors, accuracy
"""
