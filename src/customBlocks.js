import React, { Component } from 'react';
import * as Slider from '@radix-ui/react-slider';
import './App.css';
import { Flex, Theme, Box, Grid, Heading, IconButton, Separator } from '@radix-ui/themes';
import { Link } from 'react-router-dom';
import { HomeIcon } from '@radix-ui/react-icons';
import tu_delft_pic from "./tud_black_new.png";


class CustomBlock extends Component {
    constructor(props) {
        super(props);
        this.state = {
            weight: 1,
            bias: 0,
            error: null,
            img: null,
        };
        this.ws = new WebSocket(`wss://${this.props.host}/custom/${this.props.userId}/${this.props.customId}/`);
    }

    componentDidMount() {
        this.ws.onclose = () => {
            console.log('WebSocket connection closed');
        };

        this.ws.onopen = () => {
            console.log('WebSocket connection opened');
            // send a message to the websocket to create a baseline plot
            this.ws.send(JSON.stringify({ title: 'initialize', a: 1, b: 0 }));
        }

        this.ws.onerror = (error) => {
            console.log('WebSocket error: ', error);
        }

        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log("Message", data.title, " received")
            if (data.title === 'plot') {
                const binaryString = atob(data.plot);  // decode from base64 to binary string
                const bytes = new Uint8Array(binaryString.length);  // convert from binary string to byte array
                for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);  // now bytes contains the binary image data
                }
                const blob = new Blob([bytes.buffer], { type: 'image/jpeg' });
                const url = URL.createObjectURL(blob);
                // now images can be accessed with <img src={url} />
                this.setState({ img: url });
                this.setState({ error: data.error[0] });
            }
        }
    }

    componentWillUnmount() {
        this.ws.close();
    }

    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    handleWeightChange = this.throttle((value) => {
        value = value[0] * Math.PI / 180;
        value = Math.tan(value);
        value = parseFloat(value.toFixed(3));
        this.setState({ weight: value });
        console.log("Weight changed to: " + value)  // for debugging
        // Send a message through the WebSocket
        const message = JSON.stringify({ title: 'weightChange', a: value, b: this.state.bias});
        this.ws.send(message);
    }, 100)

    handleBiasChange = this.throttle((value) => {
        this.setState({ bias: value[0] });
        // Send a message through the WebSocket
        const message = JSON.stringify({ title: 'biasChange', a: this.state.weight, b: value[0]});
        this.ws.send(message);
    }, 100)

    render() {
        const texts = {
            11: [
                ["Perceptrons",
                "The building block of a neural network is the 'perceptron': a simple model which takes a number of inputs, multiplies each with a weight and then adds a bias. When we visualize this, we get a simple linear function like the one on the right. Note that this is a simplified version of the perceptron: many variations exist."],
                ["Your Task",
                "Your task here is quite simple: try to change the parameters of the perceptron so the error reduces (and the correlation increases). This is actually just a linear regression, since the output of this simplified perceptron will always be linear. This tweaking of the parameters is the essence of training a neural network. The magic of neural networks is that they can do this themselves, as we will see in the next module."],
                ["The Data",
                "The data consists of points generated along a line, with some random noise added."],
            ]
        }

        return (
        <Theme accentColor="cyan" grayColor="slate" panelBackground="solid" radius="large" appearance='light'>
            <div className='App'>
            <Flex direction='column' gap='0'>
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
                <Heading as='h1' align='center' size='6' style={{ color: 'var(--gray-1)', marginTop: 2, marginBottom: 0, textDecoration: 'none', fontFamily:'monospace, Courier New, Courier' }}>brAIn builder</Heading>
                </Link>
                <Box align='end' mr='3' >
                <Link to="https://www.tudelft.nl/en/" target="_blank" style={{ textDecoration: 'none'}}>
                    <img src={tu_delft_pic} alt='Tu Delft Logo' width='auto' height='30'/>
                </Link>
            </Box>
            </Grid>
            </Box>

            <Box style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', fontFamily: 'monospace', height: window.innerHeight-52, width:'100vw' }}>
                <Flex direction='row' gap="0" style={{ height: window.innerHeight-52, width:'100vw', alignItems: 'center', justifyContent: 'center' }}>
                    <Box style={{ flex:1, display: 'flex', flexDirection: 'column', textAlign:'justify', alignItems: 'flex-start', justifyContent: 'center', height: window.innerHeight-52, padding:'30px 50px' }}>
                        {texts[this.props.customId].map(([subtitle, text], index) => (
                            <div key={index}>
                            <Heading as='h2' size='5' style={{ color: 'var(--slate-12)', marginBottom:7 }}>&gt;_{subtitle} </Heading>
                            <p>{text}</p>
                            </div>
                        ))}
                        {/*
                        <Heading as='h2' size='5' style={{ color: 'var(--slate-12)', marginBottom:7 }}>&gt;_Background </Heading>
                        <p>The nodes of a neural network are based on the perceptron: a simple model which takes a number of inputs x1, x2, etc., multiplies them with a weight w1, w2, etc. and then adds a bias w0. 
                            The result of this function is then put into an activation function: don’t worry too much about that for now, just know that it scales the result to a value between 0 and 1. 
                            This scaling helps the network learn more quickly, as we will show in Level 4. 
                            You might notice that a neuron is just a mathematical function then, and that is indeed correct: in fact, a whole neural network is just a big, complex function with many weights and biases. </p>
                        <Heading as='h2' size='5' style={{ color: 'var(--slate-12)', marginBottom:7 }}>&gt;_Your Task </Heading>
                        <p>Your task here is quite simple: try to set the parameters of a neuron in such a way that the function maps best matches the data. 
                            This is actually just a linear regression, since the output of a single neuron will always be linear. 
                            Therefore, we are simply fitting a line to the data. We will ignore the activation function for now, so you better understand how it works. </p>
                        <Heading as='h2' size='5' style={{ color: 'var(--slate-12)', marginBottom:7 }}>&gt;_The Data </Heading>
                        <p>The data is generated along a line, with some random noise added.</p>
                        */}
                    </Box>
                    <Separator orientation='vertical' style = {{ height: window.innerHeight-110 }}/>
                    {this.props.customId === 11 && (this.animation11())}
                </Flex>
            </Box>
            </Flex>
            </div>
        </Theme>
        );
    }

    animation11() {
        const weightSlider = (
            <Slider.Root
              className="SliderRoot"
              defaultValue={[45]}
              onValueChange={(value) => this.handleWeightChange(value)}
              min={-85}
              max={85}
              step={1}
              style={{ width: Math.round(0.16 * (window.innerWidth * 0.97)) }}
            >
              <Slider.Track className="SliderTrack" style={{ height: 3 }}>
                <Slider.Range className="SliderRange" />
              </Slider.Track>
              <Slider.Thumb className="SliderThumb" aria-label="Weight" />
            </Slider.Root>
          );
        
        const biasSlider = (
            <Slider.Root
              className="SliderRoot"
              defaultValue={[0]}
              onValueChange={(value) => this.handleBiasChange(value)}
              min={-5}
              max={5}
              step={0.01}
              style={{ width: Math.round(0.16 * (window.innerWidth * 0.97)) }}
            >
              <Slider.Track className="SliderTrack" style={{ height: 3 }}>
                <Slider.Range className="SliderRange" />
              </Slider.Track>
              <Slider.Thumb className="SliderThumb" aria-label="Weight" />
            </Slider.Root>
        );  

        return (
            <Box style={{ flex:1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: window.innerHeight-52, padding:'30px 50px' }}>
                <Flex direction='column' gap="0" style={{ alignItems: 'center', justifyContent: 'center' }}>
                <div className="weightSlider" style={{ marginTop:100 }}>
                    {weightSlider}
                </div>
                <div>Weight: {this.state.weight}</div>
                <div className="biasSlider" style={{ marginTop:20 }}>
                    {biasSlider}
                </div>
                <div>Bias: {this.state.bias}</div>
                <img src={this.state.img} alt="No plot available" style={{ height: window.innerHeight*0.6, marginBottom:20 }}/>
                <div>
                    {/* Drag the sliders to change the weight and bias of the perceptron. Try to minimize the error. */}
                    Current error: {this.state.error}
                </div>
                </Flex>
            </Box>
        );
    }
}

export default CustomBlock;
