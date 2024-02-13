import React from 'react';
import './App.css';
import { Theme, Box, Grid, Heading, IconButton, Flex } from '@radix-ui/themes';
import { Link } from 'react-router-dom';
import { HomeIcon } from '@radix-ui/react-icons';
import tu_delft_pic from "./tud_black_new.png";
import axios from 'axios';

class Introduction extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
          description: [],
          printedDescription: '',
        }
    }

    componentDidMount() {
        axios.get(window.location.origin + '/api/intros/?intro_id=' + this.props.introId)
        .then(response => {
        this.shortDescription = response.data.short_description;
        if (response.data.description[0] === '[') {
            this.setState({ description: JSON.parse(response.data.description) });
            console.log("Attempting to set the array")
        } else {
            this.typeWriter(response.data.description);  // this works
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
          <Flex direction="row" gap="2" >
          <Box style={{ flex: 2, overflow: 'auto', padding: '30px 300px', fontFamily:'monospace' }}>
            {this.state.description.length > 0 ? (
              this.state.description.map(([subtitle, text], index) => (
              <div key={index}>
                <Heading as='h2' size='5' style={{ color: 'var(--slate-12)', marginBottom:7 }}>&gt;_{subtitle} </Heading>
                <p>{text}</p>
              </div>
              ))
            ) : (
              <div style={{ textAlign:'justify', marginBottom: '20px' }}>
                <Heading as='h2' size='5' style={{ color: 'var(--slate-12)', marginBottom:7 }}>&gt;_Key Concepts </Heading>
                {this.state.printedDescription}
              </div>
            )}
          </Box>
          </Flex>
          )}
    </Theme>
    )}
}

export default Introduction;