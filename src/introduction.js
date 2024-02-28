import React from 'react';
import './App.css';
import { Theme, Box, Grid, Heading, IconButton, Flex, Button } from '@radix-ui/themes';
import { ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons';
import { Link } from 'react-router-dom';
import { HomeIcon } from '@radix-ui/react-icons';
import tu_delft_pic from "./tud_black_new.png";
import axios from 'axios';
import Slider from 'react-animated-slider';
import horizontalCss from './horizontalSlides.css';

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
        {this.props.taskId !== 0 && (
          <Box style={{ overflow: 'auto', fontFamily:'monospace', width: '100%', height: window.innerHeight-52, padding: '30px 0px' }}>
            {this.state.content.length > 0 ? (
              <Flex direction="row" gap="2" style={{ height: '100vh'}}>
              <Box style={{ flex:2 }}>
              <Slider classNames={horizontalCss} previousButton={<ChevronLeftIcon style={{ color: 'var(--slate-9)', width:64, height:64 }}/>} nextButton={<ChevronRightIcon style={{ color: 'var(--slate-9)', width:64, height:64 }}/>}>
                {this.state.content.map(([subtitle, text], index) => (
                  <div key={index} className="slide-container">
                    <div className="slide-content">
                      <Heading as='h2' size='5' style={{ color: 'var(--slate-12)', marginBottom:7, textAlign:"center" }}>&gt;_{subtitle} </Heading>
                      <p>{text}</p>
                  </div>
                  </div>
                ))}
              </Slider>
              </Box>
              <Box style={{ flex:1, padding: '0px 60px', justifyContent:"center", alignItems:"center" }}>
                <Flex direction="column" gap="2" style={{ justifyContent:"center", alignItems:"center" }}>
                  {this.state.content.map(([subtitle, text], index) => (
                    <Button variant="outline">{subtitle}</Button>
                  ))}
                </Flex>
              </Box>
              </Flex>
            ) : (
              <div style={{ textAlign:'justify', marginBottom: '20px', padding: '0px 300px' }}>
                <Heading as='h2' size='5' style={{ color: 'var(--slate-12)', marginBottom:7 }}>&gt;_Key Concepts </Heading>
                {this.state.printedContent}
              </div>
            )}
          </Box>
        )}
    </Theme>
    )}
}

export default Introduction;