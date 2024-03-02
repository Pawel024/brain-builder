import React from 'react';
import './App.css';
import { Theme, Box, Grid, Heading, IconButton } from '@radix-ui/themes';
import { Link } from 'react-router-dom';
import { HomeIcon } from '@radix-ui/react-icons';
import tu_delft_pic from "./tud_black_new.png";
import Readme from './readme';

function LinksPage () {
    return(
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
        <Box style={{ overflow: 'auto', fontFamily:'monospace', width: '100%', height: window.innerHeight-52, padding: '30px 300px' }}>
            <Box style={{ flex: 1, border: "2px solid", borderColor: "var(--slate-8)", borderRadius: "var(--radius-3)", padding: '10px 30px' }}>
                <Heading as='h2' size='5' style={{ color: 'var(--slate-12)', marginBottom:7 }}>&gt;_Useful Links</Heading>
                <Readme file="Links.md"/>
            </Box>
        </Box>
    </Theme>
    )
}

export default LinksPage;