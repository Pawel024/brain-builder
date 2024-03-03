import React from 'react';
import { Box, Heading } from '@radix-ui/themes';


/**
 * Renders a component for displaying a 404 page.
 *
 * @returns {JSX.Element} The JSX element representing the 404 page.
 */
function NotFound() {
    const isMontyPythonLover = true; // Replace with your condition

    return (
        // disable both horizontal and vertical scrolling, cut off the overflow
        <Box style={{ overflow: 'hidden', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <Box style={{ textAlign: 'center', color: 'white', zIndex: 999 }}>
                <Heading style={{ fontSize:90 }}>404</Heading>
                <p style={{ fontSize:90 }}>Page not found : ( </p>
            </Box>
            {isMontyPythonLover && <img src={require('./monty-python.jpeg')} alt="Monty Python" />}
        </Box>
    );
}

export default NotFound;