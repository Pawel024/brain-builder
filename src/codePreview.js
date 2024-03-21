// component to print the code with syntax highlighting below the building view

import React from 'react';
import { Box, Heading } from '@radix-ui/themes';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import a11yDark from './a11y-dark';

/**
 * Renders a component for displaying the code with syntax highlighting.
 *
 * @param {Object} props The properties of the component.
 * @param {string} props.code The code to display.
 * @returns {JSX.Element} The JSX element representing the code preview.
 */

function CodePreview({ code }) {
    return (
        <Box style={{ 
            overflow: 'hidden', 
            width: '100vw',
            height: '100vh',
            justifyContent: 'center', 
            alignItems: 'center'
        }}>
            <Box style={{ textAlign: 'center', color: 'white', backgroundColor: 'transparent' }}>
                <SyntaxHighlighter language="javascript" style={a11yDark}>
                    {code}
                </SyntaxHighlighter>
            </Box>
        </Box>
    );
}

export default CodePreview;
