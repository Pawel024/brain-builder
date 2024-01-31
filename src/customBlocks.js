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
            // this.ws.send(JSON.stringify({ title: 'plot', a: 1, b: 0 }));
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
            }
        }
    }

    componentWillUnmount() {
        this.ws.close();
    }

    handleWeightChange = (value) => {
        console.log("Weight changed to: " + value)  // for debugging
        const radians = value * Math.PI / 180;
        const slope = Math.tan(radians);
        this.setState({ weight: slope });
        // Send a message through the WebSocket
        const message = JSON.stringify({ title: 'weightChange', a: slope, b: this.state.bias});
        this.ws.send(message);
    }

    handleBiasChange = (value) => {
        this.setState({ bias: value });
        // Send a message through the WebSocket
        const message = JSON.stringify({ title: 'biasChange', a: this.state.weight, b: value});
        this.ws.send(message);
    }

    render() {

        const weightSlider = (
            <Slider.Root
              className="SliderRoot"
              defaultValue={[45]}
              onValueCommit={(value) => this.handleWeightChange(value)}
              min={0}
              max={90}
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
              onValueCommit={(value) => this.handleBiasChange(value)}
              min={-5}
              max={5}
              step={0.1}
              style={{ width: Math.round(0.16 * (window.innerWidth * 0.97)) }}
            >
              <Slider.Track className="SliderTrack" style={{ height: 3 }}>
                <Slider.Range className="SliderRange" />
              </Slider.Track>
              <Slider.Thumb className="SliderThumb" aria-label="Weight" />
            </Slider.Root>
        );  

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
            {this.props.customId === 11 && (
                <Flex direction='row' gap="0" style={{ height: window.innerHeight-52, width:'100vw', alignItems: 'center', justifyContent: 'center' }}>
                    <Box style={{ flex:1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: window.innerHeight-52, padding:'30px 50px' }}>
                        <Flex direction='column' gap="2" style={{ alignItems: 'center', justifyContent: 'center' }}>
                        <div className="weightSlider">
                            {weightSlider}
                        </div>
                        <div>Weight: {this.state.weight}</div>
                        <div className="biasSlider" style={{ marginTop:20 }}>
                            {biasSlider}
                        </div>
                        <div>Bias: {this.state.bias}</div>
                        <img src={this.state.img} alt="No plot available" style={{ marginTop:20 }}/>
                        </Flex>
                    </Box>
                    <Separator orientation='vertical' style = {{ height: window.innerHeight-110 }}/>
                    <Box style={{ flex:1, display: 'flex', flexDirection: 'column', textAlign:'justify', alignItems: 'flex-start', justifyContent: 'center', height: window.innerHeight-52, padding:'30px 50px' }}>
                        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Vitae elementum curabitur vitae nunc sed. Consectetur purus ut faucibus pulvinar elementum integer enim. Diam quis enim lobortis scelerisque fermentum dui. Sed egestas egestas fringilla phasellus faucibus scelerisque eleifend donec. Consectetur adipiscing elit ut aliquam purus sit. At erat pellentesque adipiscing commodo. Aliquam etiam erat velit scelerisque in. Sem viverra aliquet eget sit amet tellus cras adipiscing enim. Sed viverra tellus in hac. Eros donec ac odio tempor orci dapibus. Facilisi cras fermentum odio eu feugiat. Ut eu sem integer vitae justo eget.</p>
                    </Box>
                </Flex>
            )}

            {/* Add more custom blocks later */}
            </Box>
            </Flex>
            </div>
        </Theme>
        );
    }
}

export default CustomBlock;
