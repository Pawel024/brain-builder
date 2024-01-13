import React from 'react';
import './App.css';
import { Theme, Box, Grid, Heading, IconButton } from '@radix-ui/themes';
import { Link } from 'react-router-dom';
import { HomeIcon } from '@radix-ui/react-icons';
import tu_delft_pic from "./tud_black_new.png";

function Introduction() {

    return (
    <Theme accentColor="cyan" grayColor="slate" panelBackground="solid" radius="large" appearance='light'>
        <Box py="2" style={{ backgroundColor: "var(--cyan-10)"}}>
        <Grid columns='3' mt='1'>
        <Box ml='3' style={{display:"flex"}}>  
            <Link to="/">
                <IconButton aria-label="navigate to home" width='auto' height='21' style={{ marginLeft: 'auto', color: 'inherit', textDecoration: 'none' }}>
                <HomeIcon color="white" width='auto' height='18' style={{ marginTop: 2 }} />
                </IconButton>
            </Link>
            </Box>
            <Link to={window.location.origin} style={{ textDecoration: 'none' }}>
            <Heading as='h1' align='center' size='6' style={{ color: 'var(--gray-1)', marginTop: 2, marginBottom: 0, textDecoration: 'none'}}>brAIn builder</Heading>
            </Link>
            <Box align='end' mr='3' >
            <Link to="https://www.tudelft.nl/en/" target="_blank" style={{ textDecoration: 'none'}}>
                <img src={tu_delft_pic} alt='Tu Delft Logo' width='auto' height='30'/>
            </Link>
            </Box>
        </Grid>
        </Box>
        <Box style={{ padding: '30px 300px' }}>
        <Heading as='h2' size='5' style={{ color: 'var(--slate-12)', marginBottom:7 }}>&gt;_Background Information About Neural Networks </Heading>
        <body style={{ textAlign:'justify' }}>
        <p>We are in the middle of an AI revolution: image recognition, large language models such as chatgpt and image generation are fundamentally changing the way we organize our lives, and learning to understand and work with these systems will soon become an indispensable skill.</p>
        <p>But what is an AI actually? And how does it work? An 'AI' is actually any system or machine which shows signs of 'intelligence'. It is a pretty vaguely defined term, so there are many different types of AI, some more complex than others.</p>
        <p>In this tutorial, we will help you build your very own <b>neural network</b>. This concept is the foundation of almost all the spectacular software that has popped up recently. It usually consists of layers containing multiple nodes: the layers are essentially short formulas involving one or more adjustable variables (called weights or biases). A good way to look at it is to view the network as a whole as a (sometimes very complicated) mathematical formula. In order to 'learn', the network uses an algorithm called <b>backpropagation</b>.</p>
        <p>Put simply, backpropagation works by using a datapoint to generate an output, which is then compared with the target value of that datapoint (this part is called the <b>forward pass</b>). The computer then computes the derivative of the total formula with respect to all the variables. This derivative tells us in which direction the error is increasing, so by adjusting all the variables a tiny bit in the other direction the error gets a little bit smaller every time this backpropagation is performed (this part is called the <b>backward pass</b>).</p>
        </body>
        </Box>
    </Theme>
    );
}

export default Introduction;