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
        <Box style={{ 
            overflow: 'hidden', 
            backgroundImage: `url(${isMontyPythonLover ? require('./monty-python.jpeg') : ''})`, // Set the image as the background
            backgroundSize: 'cover', // Cover the entire area
            backgroundPosition: 'top left', // Align the image to the top left
        }}>
            <Box style={{ 
                position: 'fixed', 
                top: 0, 
                left: 0, 
                width: '100vw', 
                height: '100vh', 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'center', 
                alignItems: 'center', 
                zIndex: 999 
            }}>
                <Box style={{ textAlign: 'center', color: 'white' }}>
                    <Heading style={{ fontSize:90 }}>404</Heading>
                    <p style={{ fontSize:48 }}>Page not found : ( </p>
                </Box>
            </Box>
        </Box>
    );
}

export default NotFound;