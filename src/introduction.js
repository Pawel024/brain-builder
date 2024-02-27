import React from 'react';
import './App.css';
import { Theme, Box, Grid, Heading, IconButton, Flex, Button } from '@radix-ui/themes';
import { Link } from 'react-router-dom';
import { HomeIcon } from '@radix-ui/react-icons';
import tu_delft_pic from "./tud_black_new.png";
import axios from 'axios';
import Slider from 'react-animated-slider';
import 'react-animated-slider/build/horizontal.css';
import slideContent from './slideContent';

class Introduction extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
          content: [],
          printedContent: '',
        }
    }

    typeWriter = (txt, speed=15, i=0) => {
        if (i < txt.length) {
          this.setState({ printedContent: this.state.printedContent + txt.charAt(i)})
          setTimeout(() => this.typeWriter(txt, speed, i + 1), speed);
        }
      };

    componentDidMount() {
        axios.get(window.location.origin + '/api/intros/?intro_id=' + this.props.introId)
        .then(response => {
        if (response.data.content[0] === '[') {
            this.setState({ content: JSON.parse(response.data.content) });
            console.log("Attempting to set the array")
        } else {
            this.typeWriter(response.data.content);  // this works
        }
        })
        .catch(error => {
        console.error('Introduction error:', error);
        this.typeWriter("There was an error loading the introduction.");
        });
    }

    render () { return(
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
            <Heading as='h1' align='center' size='6' style={{ color: 'var(--gray-1)', marginTop: 2, marginBottom: 0, textDecoration: 'none', fontFamily:'monospace, Courier New, Courier' }}>brAIn builder</Heading>
            </Link>
            <Box align='end' mr='3' >
            <Link to="https://www.tudelft.nl/en/" target="_blank" style={{ textDecoration: 'none'}}>
                <img src={tu_delft_pic} alt='Tu Delft Logo' width='auto' height='30'/>
            </Link>
            </Box>
        </Grid>
        </Box>
        <Flex direction="column">
        {this.props.taskId !== 0 && (
          <Flex direction="row" gap="2" >
          <Box style={{ flex: 2, overflow: 'auto', padding: '30px 300px', fontFamily:'monospace' }}>
            {this.state.content.length > 0 ? (
              this.state.content.map(([subtitle, text], index) => (
              <div key={index}>
                <Heading as='h2' size='5' style={{ color: 'var(--slate-12)', marginBottom:7 }}>&gt;_{subtitle} </Heading>
                <p>{text}</p>
              </div>
              ))
            ) : (
              <div style={{ textAlign:'justify', marginBottom: '20px' }}>
                <Heading as='h2' size='5' style={{ color: 'var(--slate-12)', marginBottom:7 }}>&gt;_Key Concepts </Heading>
                {this.state.printedContent}
              </div>
            )}
          </Box>
          <Slider>
          {slideContent.map((item, index) => (
            <div
              key={index}
            >
              <div className="center">
                <h1>{item.title}</h1>
                <p>{item.description}</p>
                <Button onClick={item.button.action}>{item.button.text}</Button>
              </div>
            </div>
          ))}
          </Slider>
          </Flex>
          )}
        </Flex>
    </Theme>
    )}
}

export default Introduction;