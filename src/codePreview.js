// component to print the code with syntax highlighting below the building view

import React from 'react';
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

const steps = [
    {
        target: '.CodePreview',
        content: 'Here you can see the code that corresponds to the neural network you just built. You can copy and paste this code into your Python environment to train the model.',
        disableBeacon: true,
        placement: 'top',
    },
];

function CodePreview({ code }) {
    return (
        <Box style={{ 
            overflow: 'hidden', 
            width: window.innerWidth*0.97,
            height: window.innerHeight*0.97,
            justifyContent: 'center', 
            alignItems: 'center'
        }}>
            <Box style={{ position: 'relative', textAlign: 'center', color: 'white', backgroundColor: 'transparent', width: window.innerWidth*0.97, height: window.innerHeight*0.97, borderRadius: "var(--radius-3)" }}>
                <SyntaxHighlighter language="javascript" style={a11yDark}>
                    {code}
                </SyntaxHighlighter>
                <Box classname="torch" style={{ position: 'absolute', top: 14, left: 12, width: 100, height: 21 }}></Box>
            </Box>
        </Box>
    );
}

export default CodePreview;
