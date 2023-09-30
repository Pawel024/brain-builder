/**
 * This is the main component of the app.
 * It displays a header with a logo and a title, and a tabbed interface with three tabs.
 * The first tab displays a button that generates a random quote from a list of Monty Python quotes.
 * The second tab displays a message to take care of stuff.
 * The third tab displays a message to change your settings.
 * The component uses the @radix-ui/themes library for styling.
 * @returns {JSX.Element} The JSX element representing the App component.
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './App.css';
import { Theme, Button, Flex, Text, Box, Tabs, Heading, Grid } from '@radix-ui/themes';
// import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import '@radix-ui/themes/styles.css';
import pic from "./tud_black_new.png";
import { Link, BrowserRouter as Router } from 'react-router-dom';
import CytoscapeComponent from 'react-cytoscapejs';
import { PlusIcon, MinusIcon } from '@radix-ui/react-icons';
import { styled } from '@stitches/react';



function getWindowSize() {
  const {innerWidth, innerHeight} = window;
  return {innerWidth, innerHeight};
}

const FloatingButton = styled(Button, {
  position: 'fixed',
  zIndex: 9999,
  borderRadius: '50%',
  width: 40,
  height: 40,
  backgroundColor: 'var(--cyan-11)',
  color: 'white',
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
  '&:hover': {
    backgroundColor: 'var(--cyan-10)',
  },
});

function useGenerateCytoElements(list = []) {
  const memoizedList = useMemo(() => list, [list]);
  const cElements = [];

  // Generate nodes
  memoizedList.forEach((nodesPerLayer, i) => {
    for (let j = 0; j < nodesPerLayer; j++) {
      const id = memoizedList.slice(0, i).reduce((acc, curr) => acc + curr, 0) + j;
      const label = `Node ${id}`;
      const position = { x: 100 + i * 100, y: Math.round( 0.5 * (window.innerHeight-130) - 30 + (-nodesPerLayer) * 0.5 * 60) + 60 + j * 60 };
      cElements.push({ data: { id, label }, position });
    }
  });

  // Generate edges
  memoizedList.forEach((nodesPerLayer, i) => {
    for (let j = 0; j < nodesPerLayer; j++) {
      const source = memoizedList.slice(0, i).reduce((acc, curr) => acc + curr, 0) + j;
      for (let k = 0; k < memoizedList[i+1]; k++) {
        const target = memoizedList.slice(0, i+1).reduce((acc, curr) => acc + curr, 0) + k;
        if (target <= cElements.length) {
          cElements.push({ data: { source, target } });
        }
      }
    }
  });

  return cElements;
}

function App() {
  const [windowSize, setWindowSize] = useState(getWindowSize());
  const [cytoLayers, setCytoLayers] = useState([1, 2, 3, 3, 3, 3, 3, 3, 2, 1]);

  const cytoElements = useGenerateCytoElements(cytoLayers);

  const addNode = useCallback((column) => {
    setCytoLayers(prevLayers => {
      const newLayers = [...prevLayers];
      newLayers[column] += 1;
      return newLayers;
    });
  }, []);

  const removeNode = useCallback((column) => {
    setCytoLayers(prevLayers => {
      const newLayers = [...prevLayers];
      newLayers[column] -= 1;
      return newLayers;
    });
  }, []);

  useEffect(() => {
    function handleWindowResize() {
      setWindowSize(getWindowSize());
    }

    window.addEventListener('resize', handleWindowResize);
    return () => {
      window.removeEventListener('resize', handleWindowResize);
    };
  }, []);

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
    <body class='light-theme' >
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

            <Box px="4" pt="3" pb="0">
              <Tabs.Content value="home">
                <Box style={{ display: 'flex', alignItems: 'start', justifyContent: 'center', height: '100vh' }}>
                  <Flex direction="column" gap="2" height={'100vh'} style={{ alignItems: 'center', justifyContent: 'center'}}>
                    <CytoscapeComponent elements={cytoElements} stylesheet={cytoStyle} panningEnabled={false} style={ { width: window.innerWidth*0.97, height: window.innerHeight-130, border: "solid", borderColor: "var(--slate-8)", borderRadius: "var(--radius-3)" } } />
                    <FloatingButton onClick={ () => addNode(0) } style={{ top: 130, left: 90}}>
                      <PlusIcon />
                    </FloatingButton>
                    <FloatingButton onClick={ () => addNode(1) } style={{ top: 130, left: 190}}>
                      <PlusIcon />
                    </FloatingButton>
                    <FloatingButton onClick={ () => addNode(2) } style={{ top: 130, left: 290}}>
                      <PlusIcon />
                    </FloatingButton>
                    <FloatingButton onClick={ () => addNode(3) } style={{ top: 130, left: 390}}>
                      <PlusIcon />
                    </FloatingButton>
                    <FloatingButton onClick={ () => addNode(4) } style={{ top: 130, left: 490}}>
                      <PlusIcon />
                    </FloatingButton>
                    <FloatingButton onClick={ () => addNode(5) } style={{ top: 130, left: 590}}>
                      <PlusIcon />
                    </FloatingButton>
                    <FloatingButton onClick={ () => addNode(6) } style={{ top: 130, left: 690}}>
                      <PlusIcon />
                    </FloatingButton>
                    <FloatingButton onClick={ () => addNode(7) } style={{ top: 130, left: 790}}>
                      <PlusIcon />
                    </FloatingButton>
                    <FloatingButton onClick={ () => addNode(8) } style={{ top: 130, left: 890}}>
                      <PlusIcon />
                    </FloatingButton>
                    <FloatingButton onClick={ () => addNode(9) } style={{ top: 130, left: 990}}>
                      <PlusIcon />
                    </FloatingButton>


                    <FloatingButton onClick={ () => removeNode(0) } style={{ top: 640, left: 90}}>
                      <MinusIcon />
                    </FloatingButton>
                    <FloatingButton onClick={ () => removeNode(1) } style={{ top: 640, left: 190}}>
                      <MinusIcon />
                    </FloatingButton>
                    <FloatingButton onClick={ () => removeNode(2) } style={{ top: 640, left: 290}}>
                      <MinusIcon />
                    </FloatingButton>
                    <FloatingButton onClick={ () => removeNode(3) } style={{ top: 640, left: 390}}>
                      <MinusIcon />
                    </FloatingButton>
                    <FloatingButton onClick={ () => removeNode(4) } style={{ top: 640, left: 490}}>
                      <MinusIcon />
                    </FloatingButton>
                    <FloatingButton onClick={ () => removeNode(5) } style={{ top: 640, left: 590}}>
                      <MinusIcon />
                    </FloatingButton>
                    <FloatingButton onClick={ () => removeNode(6) } style={{ top: 640, left: 690}}>
                      <MinusIcon />
                    </FloatingButton>
                    <FloatingButton onClick={ () => removeNode(7) } style={{ top: 640, left: 790}}>
                      <MinusIcon />
                    </FloatingButton>
                    <FloatingButton onClick={ () => removeNode(8) } style={{ top: 640, left: 890}}>
                      <MinusIcon />
                    </FloatingButton>
                    <FloatingButton onClick={ () => removeNode(9) } style={{ top: 640, left: 990}}>
                      <MinusIcon />
                    </FloatingButton>

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

/*
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
*/

/*
const cytoElements = [
      { data: { id: '1', label: 'Node 1' }, position: { x: 100, y: 138 } },
      { data: { id: '2', label: 'Node 2' }, position: { x: 100, y: 213 } },
      { data: { id: '3', label: 'Node 3' }, position: { x: 200, y: 100 } },
      { data: { id: '4', label: 'Node 4' }, position: { x: 200, y: 175 } },
      { data: { id: '5', label: 'Node 5' }, position: { x: 200, y: 250 } },
      { data: { id: '6', label: 'Node 6' }, position: { x: 300, y: 138 } },
      { data: { id: '7', label: 'Node 7' }, position: { x: 300, y: 213 } },
      { data: { source: '1', target: '3'} },
      { data: { source: '1', target: '4'} },
      { data: { source: '1', target: '5'} },
      { data: { source: '2', target: '3'} },
      { data: { source: '2', target: '4'} },
      { data: { source: '2', target: '5'} },
      { data: { source: '3', target: '6'} },
      { data: { source: '4', target: '6'} },
      { data: { source: '5', target: '6'} },
      { data: { source: '3', target: '7'} },
      { data: { source: '4', target: '7'} },
      { data: { source: '5', target: '7'} }
  ];
*/