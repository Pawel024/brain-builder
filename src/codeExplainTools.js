function layersToCode(nodes, learningRate, epochs, type, af=true, optimizer='SGD', lossFunction='NLLLoss') {
    // Takes a list of numbers of nodes per layer, e.g. [2, 3, 1], and some more parameters of the network, and returns the pytorch code to create the model.
    let activations = Array(nodes.length-1).fill('Sigmoid');
    if (type === 1) {
        lossFunction = 'NLLLoss';
        activations[nodes.length-2] = 'LogSoftmax';
    } else {
        lossFunction = 'MSELoss';
        activations[nodes.length-2] = '';
    }
    let code = "import torch\n\n";
    code += `def train_nn(X_train, y_train):\n\n`;
    code += `    # Define the model\n`;
    code += "    model = torch.nn.Sequential(\n";
    for (let i = 0; i < nodes.length - 1; i++) {
        code += `        torch.nn.Linear(${nodes[i]}, ${nodes[i+1]}),\n`;
        if (af && activations[i] !== '') {
            code += `        torch.nn.${activations[i]}(),\n`;
        }
    }
    code += "        )\n\n";
    code += `    # Define the optimizer and loss function\n`;
    code += `    optimizer = torch.optim.${optimizer}(model.parameters(), lr=${learningRate})\n`;
    code += `    loss_fn = torch.nn.${lossFunction}()\n\n`;
    code += `    # Train the network\n`;
    code += `    for epoch in range(${epochs}):\n\n`;
    code += `        # Forward pass\n`;
    code += `        y_pred = model(X_train)\n\n`;
    code += `        # Compute and print loss\n`;
    code += `        loss = loss_fn(y_pred, y_train)\n`;
    code += `        if epoch % (${epochs}/10) == 0:\n`;
    code += `            print('Epoch ', epoch, '; loss = ', round(loss.item(), 3))\n\n`;
    code += `        # Backpropagate the loss\n`;
    code += `        optimizer.zero_grad()\n`;
    code += `        loss.backward()\n`;
    code += `        optimizer.step()\n\n`;
    code += `    return model\n`;
    return code;
}


export default layersToCode;