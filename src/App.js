/**
 * This is the main component of the app.
 * It displays a header with a logo and a title, and a tabbed interface with three tabs.
 * The first tab displays a button that generates a random quote from a list of Monty Python quotes.
 * The second tab displays a message to take care of stuff.
 * The third tab displays a message to change your settings.
 * The component uses the @radix-ui/themes library for styling.
 * @returns {JSX.Element} The JSX element representing the App component.
 */
import React, { useState, useEffect } from 'react';
import './App.css';
import { Theme, Button, Flex, Text, Box, Tabs, Heading, Grid, Separator, DropdownMenu, IconButton } from '@radix-ui/themes';
// import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import '@radix-ui/themes/styles.css';
import pic from "./tud_black_new.png";
import { Link, BrowserRouter as Router } from 'react-router-dom';
import CytoscapeComponent from 'react-cytoscapejs';

function App() {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const [windowSize, setWindowSize] = useState(getWindowSize());

  function getWindowSize() {
    const {innerWidth, innerHeight} = window;
    return {innerWidth, innerHeight};
  }

  useEffect(() => {
    function handleWindowResize() {
      setWindowSize(getWindowSize());
    }

    window.addEventListener('resize', handleWindowResize);
    return () => {
      window.removeEventListener('resize', handleWindowResize);
    };
  }, []);  
  
  const cytoElements = [
      { data: { id: '1', label: 'Node 1' }, position: { x: 100, y: 100 } },
      { data: { id: '2', label: 'Node 2' }, position: { x: 100, y: 180 } },
      { data: { id: '3', label: 'Node 3' }, position: { x: 200, y: 100 } },
      { data: { id: '4', label: 'Node 4' }, position: { x: 200, y: 175 } },
      { data: { id: '5', label: 'Node 5' }, position: { x: 200, y: 250 } },
      { data: { source: '1', target: '4'} },
      { data: { source: '2', target: '3'} },
      { data: { source: '1', target: '5'} },
      { data: { source: '2', target: '5'} }
  ];

  const cytoStyle = [ // the stylesheet for the graph
    {
      selector: 'node',
      style: {
        'background-color': '#666'
      }
    },

    {
      selector: 'edge',
      style: {
        'width': 3,
        'line-color': '#ccc',
        'target-arrow-color': '#ccc',
        'curve-style': 'bezier'
      }
    }
  ];

  return (
    <Router>
    <body class='light-theme'>
      <Theme accentColor="cyan" grayColor="slate" panelBackground="translucent" radius="large" appearance='light'>
        <Box py="2" style={{ backgroundColor: "var(--cyan-10)"}}>
          <Grid columns='3' mt='1'>
            <Box align='start' ml='3' >
              <Link to="https://www.tudelft.nl/en/" target="_blank" style={{ textDecoration: 'none' }}>
                <img src={pic} alt='Tu Delft Logo' width='auto' height='30' />
              </Link>
            </Box>
            <Link to="https://test-app-brain-builder-3dfb98072440.herokuapp.com/" style={{ textDecoration: 'none' }}>
              <Heading as='h1' align='center' size='6' style={{ color: 'var(--gray-1)', marginTop: 2, marginBottom: 0, textDecoration: 'none'}}>brAIn builder</Heading>
            </Link>
            <Box></Box>
          </Grid>
        </Box>

        <Flex direction="column" gap="0" css={{ height: '100vh' }}>
          <Tabs.Root defaultValue="home">
            <Tabs.List size="2">
              <Tabs.Trigger value="home">Home</Tabs.Trigger>
              <Tabs.Trigger value="stuff">Stuff</Tabs.Trigger>
              <Tabs.Trigger value="settings">Settings</Tabs.Trigger>
            </Tabs.List>

            <Box align="center" px="3" pt="3" pb="3">
              <Tabs.Content value="home">
                <Box style={{ display: 'flex', height: '100%' }}>
                  <CytoscapeComponent elements={cytoElements} stylesheet={cytoStyle} style={{ border: "solid", borderColor: "var(--slate-8)", borderRadius: "var(--radius-4)", height: 0.82*windowSize.innerHeight, width: "100%", margin: "auto" }} />
                </Box>
              </Tabs.Content>

              <Tabs.Content value="stuff">
                <Box style={{ display: 'flex', height: '100vh' }}>
                  <Flex direction="column" gap="2">
                    <Text size="2">Take care of stuff.</Text>
                  </Flex>
                </Box>
              </Tabs.Content>

              <Tabs.Content value="settings">
                <Box style={{ display: 'flex', height: '100vh' }}>
                  <Flex direction="column" gap="2">
                    <Text size="2">Change your settings.</Text>
                  </Flex>
                </Box>
              </Tabs.Content>
            </Box>
          </Tabs.Root>
        </Flex>
      </Theme>
    </body>
    </Router>
  );
}

export default App;

/*
<DropdownMenu.Root>
  <DropdownMenu.Trigger>
  <Box align='start' ml='3' >
    <IconButton size="1" mt="2" variant="solid">
      <DotsHorizontalIcon />
    </IconButton>
  </Box>
  </DropdownMenu.Trigger>
  <DropdownMenu.Content>
    <DropdownMenu.Item shortcut="⌘ E">Edit</DropdownMenu.Item>
    <DropdownMenu.Item shortcut="⌘ D">Duplicate</DropdownMenu.Item>
    <DropdownMenu.Separator />
    <DropdownMenu.Item shortcut="⌘ N">Archive</DropdownMenu.Item>

    <DropdownMenu.Sub>
      <DropdownMenu.SubTrigger>More</DropdownMenu.SubTrigger>
      <DropdownMenu.SubContent>
        <DropdownMenu.Item>Move to project…</DropdownMenu.Item>
        <DropdownMenu.Item>Move to folder…</DropdownMenu.Item>

        <DropdownMenu.Separator />
        <DropdownMenu.Item>Advanced options…</DropdownMenu.Item>
      </DropdownMenu.SubContent>
    </DropdownMenu.Sub>

    <DropdownMenu.Separator />
    <DropdownMenu.Item>Share</DropdownMenu.Item>
    <DropdownMenu.Item>Add to favorites</DropdownMenu.Item>
    <DropdownMenu.Separator />
    <DropdownMenu.Item shortcut="⌘ ⌫" color="red">
      Delete
    </DropdownMenu.Item>
  </DropdownMenu.Content>
</DropdownMenu.Root>
*/

/*
<div className='Click-me-button'>
  <Button onClick={generateMessage} variant='surface' size="3" gap="2">
    <Text size="5">
      Click me!
    </Text>
  </Button>
</div>
<div className='Click-me-text'>
  {isLoading ? (
    <div className="Progress-bar-outside">
      <div className="Progress-bar-inside" style={{ width: `${progress}%` }}></div>
    </div>
  ) : (
      <Text gap="2" style={{textAlign:'center'}}>
        {message}
      </Text>
  )}
</div>
*/

/*
const messages = [
    'Strange women lying in ponds distributing swords is no basis for a system of government.',
    'What makes you think she is a witch?',
    'Nobody expects the Spanish Inquisition!',
    'Look, you stupid bastard, you’ve got no arms left!',
    'I fart in your general direction!',
    'Tis but a scratch!'
  ];
*/

/*
const generateMessage = () => {
  setIsLoading(true);
  setProgress(0);
  const interval = setInterval(() => {
    setProgress(progress => progress + 10);
  }, 200);
  setTimeout(() => {
    clearInterval(interval);
    const randomIndex = Math.floor(Math.random() * messages.length);
    setMessage(messages[randomIndex]);
    setIsLoading(false);
  }, 2000);
};
*/