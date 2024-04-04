// component to print the code with syntax highlighting below the building view
import React, { useEffect } from 'react';
import { useState } from 'react';
import Joyride from 'react-joyride';
import { Box } from '@radix-ui/themes';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import a11yDark from './a11y-dark';

/**
 * Renders a component for displaying the code with syntax highlighting.
 *
 * @param {Object} props The properties of the component.
 * @param {string} props.code The code to display.
 * @returns {JSX.Element} The JSX element representing the code preview.
 */

function CodePreview({ code, level }) {
    const [run, setRun] = useState(false);
    const [steps, setSteps] = useState([
        {
            target: '#allparts',
            content: "This is an example of how you would train this neural network using PyTorch. We'll walk you through the most important parts of the code. \nIf any concepts are unclear, have a look at the 'Key Concepts' modules.",
            disableBeacon: true,
            placement: 'top',
        },
        {
            target: '#part3',
            content: 'This where you define the structure of the network. Notice that the outputs of one layer are the inputs of the next layer. \nIn your own code, make sure to use an appropriate activation function after the last layer.',
            disableBeacon: true,
            placement: 'top',
        },
        {
            target: '#part4',
            content: "'SGD' indicates we are using stochastic gradient descent to make the network learn. The 'lr' variable is the learning rate. \nYou can also see the loss function we use - negative log likelihood loss, which is built into PyTorch. In its place, you can use another function, such as the cross entropy loss (nn.CrossEntropyLoss).",
            disableBeacon: true,
            placement: 'top',
        },
        {
            target: '#part5',
            content: "With everything initialized, we can train the network using the number of epochs you specified.",
            disableBeacon: true,
            placement: 'top',
        },
        {
            target: '#part7',
            content: 'We compute the loss by comparing the predictions with the target values. \nWe then print the loss every 10% of the epochs, to see the progress. Ideally, this should decrease over time.',
            disableBeacon: true,
            placement: 'top',
        },
        {
            target: '#part8',
            content: "Now we let PyTorch do the backpropagation, and take a small step in the direction that reduces the loss. \nIn your own code, make sure to set the gradients to zero before each iteration with 'zero_grad()'.",
            disableBeacon: true,
            placement: 'top',
        },
        {
            target: '#part9',
            content: 'Finally, the code returns the trained model. You can now use this model to make predictions on new data.',
            disableBeacon: true,
            placement: 'top',
        },
        // Add more steps as needed
    ]);

    useEffect(() => {
        // change the loss function in part 4 of the steps based on the level
        setSteps((prevSteps) => {
            const newSteps = [...prevSteps];
            if (level === 1) {
                newSteps[2].content = "'SGD' indicates we are using stochastic gradient descent to make the network learn. The 'lr' variable is the learning rate. \nYou can also see the loss function we use - mean squared error, which is built into PyTorch.";
            } else if (level === 2) {
                newSteps[2].content = "'SGD' indicates we are using stochastic gradient descent to make the network learn. The 'lr' variable is the learning rate. \nYou can also see the loss function we use - negative log likelihood loss, which is built into PyTorch. In its place, you can use another function, such as the cross entropy loss (torch.nn.CrossEntropyLoss).";
            }
            return newSteps;
        });
    }, [level, steps]);

    // Split the code into parts
    const parts = code.split('\n\n'); // Split by two newlines

    return (
        <div>
            <Box id='allparts' style={{ 
                overflow: 'hidden', 
                width: window.innerWidth*0.97,
                height: window.innerHeight*0.97,
                justifyContent: 'center', 
                alignItems: 'center'
            }}>
                <Box style={{ 
                    position: 'relative', 
                    textAlign: 'center', 
                    color: 'white', 
                    backgroundColor: 'transparent', 
                    width: window.innerWidth*0.97, 
                    height: window.innerHeight*0.97, 
                    borderRadius: "var(--radius-3)" 
                }}>
                    {parts.map((part, index) => (
                        <Box id={`part${index+1}`} key={index} style={{ position: 'relative', display:'block' }}>
                            <SyntaxHighlighter language="python" style={a11yDark} customStyle={{ margin: '0', borderRadius: '0' }}>
                                {part}
                            </SyntaxHighlighter>
                        </Box>
                    ))}
                    <Box classname="torch" style={{ position: 'absolute', top: 14, left: 12, width: 100, height: 21 }}></Box>
                </Box>
            </Box>
            <Joyride
                steps={steps}
                run={true}
                continuous={true}
                scrollToFirstStep={true}
                showProgress={false}
                showSkipButton={true}
                styles={{
                    options: {
                        zIndex: 10000,
                    }
                }}
                locale={{ last: 'Finish' }}
            />
        </div>
    );
}
export default CodePreview;
