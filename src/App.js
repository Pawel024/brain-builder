import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './App.css';
import { Theme, Flex, Box, Tabs, Heading, Grid, IconButton, Separator } from '@radix-ui/themes';
import * as Slider from '@radix-ui/react-slider';
import '@radix-ui/themes/styles.css';
import pic from "./tud_black_new.png";
import { Link, BrowserRouter as Router } from 'react-router-dom';
import CytoscapeComponent from 'react-cytoscapejs';
import { PlusIcon, MinusIcon } from '@radix-ui/react-icons';
import { styled } from '@stitches/react';
import * as Switch from '@radix-ui/react-switch';

const FloatingButton = styled(IconButton, {
  position: 'absolute',
  zIndex: 9999,
  borderRadius: 'var(--radius-3)',
  width: 33,
  height: 33,
  boxShadow: '0 2px 8px var(--slate-a11)'
});


function getWindowSize() {
  const {innerWidth, innerHeight} = window;
  return {innerWidth, innerHeight};
}

  
function useGenerateCytoElements(list = []) {
  const memoizedList = useMemo(() => list, [list]);
  const cElements = [];

  // Generate nodes
  memoizedList.forEach((nodesPerLayer, i) => {
    for (let j = 0; j < nodesPerLayer; j++) {
      const id = memoizedList.slice(0, i).reduce((acc, curr) => acc + curr, 0) + j;
      const label = `Node ${id}`;
      const hAvailable = window.innerHeight - 326;
      const wAvailable = 0.7 * (window.innerWidth * 0.97);
      const xDistBetweenNodes = wAvailable/memoizedList.length;
      const yDistBetweenNodes = hAvailable/Math.max(...memoizedList);
      const position = { x: Math.round((0.78 * window.innerWidth * 0.97) + (i-memoizedList.length) * xDistBetweenNodes), y: Math.round( 0.5 * (window.innerHeight-140) - 0.5*yDistBetweenNodes - 65 + (-nodesPerLayer) * 0.5 * yDistBetweenNodes + yDistBetweenNodes + j * yDistBetweenNodes) };
      cElements.push({ data: { id, label }, position });
    }
  });

  // Generate lines between nodes
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


function useGenerateCytoStyle(list = []) {
  const cStyle = [ // the base stylesheet for the graph
    {
      selector: 'node',
      style: {
        'background-color': '#666',
        'width': 180/Math.max(...list),
        'height': 180/Math.max(...list)
      }
    },

    {
      selector: 'edge',
      style: {
        'width': 1,
        'line-color': 'var(--slate-a10)',
        'curve-style': 'bezier'
      }
    }
  ];
  return cStyle;
}



function App() {
  const [windowSize, setWindowSize] = useState(getWindowSize());

  // update window size when window is resized
  useEffect(() => {
    function handleWindowResize() {
      setWindowSize(getWindowSize());
    }

    window.addEventListener('resize', handleWindowResize);
    return () => {
      window.removeEventListener('resize', handleWindowResize);
    };
  }, []);

  // make a list of nodes per layer that can be updated
  const [cytoLayers, setCytoLayers] = useState([1, 2, 3, 3, 24, 3, 3, 3, 2, 1]);

  // make a list of cytoscape elements that can be updated
  const cytoElements = useGenerateCytoElements(cytoLayers);
  const cytoStyle = useGenerateCytoStyle(cytoLayers);

  // function to add a node to a layer
  const addNode = useCallback((column) => {
    setCytoLayers(prevLayers => {
      const newLayers = [...prevLayers];
      newLayers[column] += 1;
      return newLayers;
    });
  }, []);

  // function to remove a node from a layer
  const removeNode = useCallback((column) => {
    setCytoLayers(prevLayers => {
      const newLayers = [...prevLayers];
      newLayers[column] -= 1;
      return newLayers;
    });
  }, []);

  // function to generate floating buttons
  function generateFloatingButtons(top, left, dist, layers, isItPlus) {
    const buttons = [];
    const icon = isItPlus ? <PlusIcon /> : <MinusIcon />;
    for (let i = 0; i < 10; i++) {
      const style = { top: top, left: left + i * dist };
      const button = (
        <div>
          <FloatingButton
            variant="outline"
            onClick = {isItPlus ? () => addNode(i) : () => removeNode(i)}
            style={{...style}}
            key={i}
          >
            {icon}
          </FloatingButton>
          {isItPlus && <div style={{ position: 'absolute', top: window.innerHeight - 258, left: left + i * dist + 16.5, transform: 'translateX(-50%)', fontSize: '14px', color: 'var(--cyan-12)', fontWeight: 'bold' }}>{layers[i]}</div>}
        </div>
      );
      buttons.push(button);
    }
    return buttons;
  }

  const [isMontyPythonLover, setIsMontyPythonLover] = useState(true);

  const MontyPythonSwitch = () => {
    return (
      <Switch.Root className="SwitchRoot" id="airplane-mode" checked={isMontyPythonLover} onClick={() => setIsMontyPythonLover(!isMontyPythonLover)}>
        <Switch.Thumb className="SwitchThumb" />
      </Switch.Root>
    )
  }

  const [iterations, setIterations] = useState(50);
  const [learningRate, setLearningRate] = useState(0.00001);

  const iterationsSlider = useMemo(() => {
    return (
      <Slider.Root
        className="SliderRoot"
        defaultValue={[iterations]}
        onValueChange={(value) => setIterations(value[0])}
        max={100}
        step={1}
        style={{ width: Math.round(0.16 * (window.innerWidth * 0.97)) }}
      >
        <Slider.Track className="SliderTrack" style={{ height: 3 }}>
          <Slider.Range className="SliderRange" />
        </Slider.Track>
        <Slider.Thumb className="SliderThumb" aria-label="Iterations" />
      </Slider.Root>
    );
  }, [iterations, setIterations]);

  const learningRateSlider = useMemo(() => {
    return (
      <Slider.Root
        className="SliderRoot"
        defaultValue={[50]}
        onValueChange={(value) => setLearningRate((10 ** Math.round(value[0] / -10)).toFixed(Math.round(value[0] / 10)))}
        max={100}
        step={10}
        style={{ width: Math.round(0.16 * (window.innerWidth * 0.97)) }}
      >
        <Slider.Track className="SliderTrack" style={{ height: 3 }}>
          <Slider.Range className="SliderRange" />
        </Slider.Track>
        <Slider.Thumb className="SliderThumb" aria-label="Iterations" />
      </Slider.Root>
    );
  }, [setLearningRate]);

  // actual content of the app
  return (
    <Router>
    <body class='light-theme' >
      <Theme accentColor="cyan" grayColor="slate" panelBackground="solid" radius="large" appearance='light'>
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
                    <CytoscapeComponent elements={cytoElements} stylesheet={cytoStyle} panningEnabled={false} autoungrabify={true} style={ { width: window.innerWidth*0.97, height: window.innerHeight-130, border: "solid", borderColor: "var(--slate-8)", borderRadius: "var(--radius-3)" } } />
                    
                    {generateFloatingButtons(window.innerHeight - 223, 0.08 * (window.innerWidth * 0.97) - 10, 0.7 * (window.innerWidth * 0.97)/cytoLayers.length, cytoLayers, true)}                    
                    {generateFloatingButtons(window.innerHeight - 178, 0.08 * (window.innerWidth * 0.97) - 10, 0.7 * (window.innerWidth * 0.97)/cytoLayers.length, cytoLayers, false)}

                  </Flex>
                </Box>
                
                <Separator orientation='vertical' style = {{ position:"absolute", top: Math.round(0.03 * (window.innerHeight-140)), left: Math.round(0.8 * (window.innerWidth * 0.97)), height: 0.96 * (window.innerHeight-140) }}/>

                <Box style={{ position:"absolute", top: 0.14 * (window.innerHeight-140), left: Math.round(0.82 * (window.innerWidth * 0.97)), alignItems: 'start', justifyContent: 'end', height: '100vh' }}>
                  {iterationsSlider}
                  <div style={{ position:"absolute", zIndex: 9999, top: -35, left: 0.08 * (window.innerWidth * 0.97), transform: 'translateX(-50%)', fontSize: '14px', color: 'var(--slate-11)', borderRadius: 'var(--radius-3)' }}>{iterations}</div>
                </Box>

                <Box style={{ position:"absolute", top: Math.round(0.30 * (window.innerHeight-140)), left: Math.round(0.82 * (window.innerWidth * 0.97)), alignItems: 'start', justifyContent: 'end', height: '100vh' }}>
                  {learningRateSlider}
                  <div style={{ position:"absolute", zIndex: 9999, top: -35, left: 0.08 * (window.innerWidth * 0.97), transform: 'translateX(-50%)', fontSize: '14px', color: 'var(--slate-11)', borderRadius: 'var(--radius-3)'}}>{learningRate}</div>
                </Box>
                
                <IconButton variant="solid" style={{ position: 'absolute', transform: 'translateX(-50%)', top: Math.round(0.9 * (window.innerHeight-140)), left: Math.round(0.9 * (window.innerWidth * 0.97)), borderRadius: 'var(--radius-3)', width: 150, height: 36, fontSize: 'var(--font-size-2)', fontWeight: 'bold' }}>
                  Start training!
                </IconButton>

              </Tabs.Content>

              <Tabs.Content value="stuff">
                <label className="Label" htmlFor="stuff" style={{ paddingRight: 15 }}>
                  stuff.
                </label>
              </Tabs.Content>

              <Tabs.Content value="settings">
                <Box style={{ display: 'flex', height: '100vh' }}>
                <form>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <label className="Label" htmlFor="monty-python-mode" style={{ paddingRight: 15 }}>
                      {isMontyPythonLover ? 'Monty Python lover' : 'Monty Python hater'}
                    </label>
                    <MontyPythonSwitch />
                  </div>
                </form>
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