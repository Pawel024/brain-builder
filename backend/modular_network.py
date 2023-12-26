import torch
from matplotlib import pyplot as plt


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
        if activation == 'Sigmoid':
            return torch.nn.functional.sigmoid(x)
        elif activation == 'ReLu':
            return torch.nn.functional.relu(x)
        elif activation == 'Softmax':
            return torch.nn.functional.softmax(x)
        elif activation == 'Log_Softmax':
            return torch.nn.functional.log_softmax(x, dim=1)
        else:
            return x

    def forward(self, x):  # feed data through the network; pay attention to the right name!
        for i in range(len(self.layers)):
            x = self.select_activation(self.layers[i](x), self.input[i+1][2])
        return x

    def train_network(self, epochs, training_set, test_set, optimizer):
        errors = []
        for epoch in range(epochs):
            for data in training_set:
                X, y = data['data'], data['label']
                self.zero_grad()  # start the gradients at zero

                assert torch.is_tensor(X)
                output = self(X.float().view(-1, self.input[0][0])) # use -1!
                y = y.long().view(-1)
                loss = torch.nn.functional.nll_loss(output, y)
                loss.backward()  # backpropagation done for us, thanks PyTorch!
                optimizer.step()  # adjust the weights and biases
            # print("Loss in epoch", epoch + 1, ": ", loss)  # loss should decrease over time

            if epoch % (epochs // 100 if epochs >= 100 else 1) == 0:
                with torch.no_grad():
                    correct, total = 0, 0
                    for data in training_set:
                        X, y = data['data'], data['label']
                        output = self(X.float().view(-1, self.input[0][0]))
                        for idx, i in enumerate(output):
                            if torch.argmax(i) == y[idx]:
                                correct += 1
                            total += 1

                if epoch % (epochs // 10 if epochs >= 10 else 1) == 0:
                    print("Accuracy on training set after epoch ", epoch, ": ", round(100 * correct / total, 1), "%")
                error = round(100 * (1 - correct / total), 2)
                errors += [error]

        with torch.no_grad():
            correct, total = 0, 0
            for data in test_set:
                X, y = data['data'], data['label']
                output = self(X.float().view(-1, self.input[0][0]))
                for idx, i in enumerate(output):
                    if torch.argmax(i) == y[idx]:
                        correct += 1
                    total += 1
        print("Accuracy on test set: ", round(correct / total, 3)*100, "%")

        return errors, round(correct / total, 3)

    """
        # plot the error
        plt.plot(errors)
        plt.xlabel("% of Iterations")
        plt.ylabel("% of errors")
        plt.ylim(0, 100)
        plt.text(30, 70, str('Accuracy on test set: ' + str(round(correct / total, 3)*100) + '%'))
        plt.show()
    """
