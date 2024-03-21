function layerListToCode(layers, learningRate, epochs, optimizer, lossFunction) {
    // Takes a list of numbers of nodes per layer, e.g. [2, 3, 1], and some more parameters of the network, and returns the pytorch code to create the model.
    let code = "import torch\nimport torch.nn as nn\n\n";
    code += "class Net(nn.Module):\n";
    code += "    def __init__(self):\n";
    code += "        super(Net, self).__init__()\n";
    for (let i = 0; i < layers.length - 1; i++) {
        code += `        self.fc${i} = nn.Linear(${layers[i]}, ${layers[i+1]})\n`;
    }
    code += "\n    def forward(self, x):\n";
    for (let i = 0; i < layers.length - 1; i++) {
        code += `        x = torch.relu(self.fc${i}(x))\n`;
    }
    code += "        return x\n\n";
    code += `model = Net()\n`;
    code += `optimizer = torch.optim.${optimizer}(model.parameters(), lr=${learningRate})\n`;
    code += `loss_fn = nn.${lossFunction}()\n`;
    code += `for epoch in range(${epochs}):\n`;
    code += "    # Training code here\n";
    return code;
}

console.log(layerListToCode([2, 3, 1], 0.01, 100, 'SGD', 'MSELoss'));