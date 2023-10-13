import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './App.css';
import { Theme, Flex, Box, Tabs, Heading, Grid, IconButton, Separator, Callout } from '@radix-ui/themes';
import * as Slider from '@radix-ui/react-slider';
import '@radix-ui/themes/styles.css';
import tu_delft_pic from "./tud_black_new.png";
import monty_python_pic from "./monty-python.jpeg";
import { Link, BrowserRouter as Router } from 'react-router-dom';
import CytoscapeComponent from 'react-cytoscapejs';
import { PlusIcon, MinusIcon, PlayIcon, InfoCircledIcon } from '@radix-ui/react-icons';
import { styled } from '@stitches/react';
import * as Switch from '@radix-ui/react-switch';
import axios from "axios";


// ------- STYLED COMPONENTS -------

const FloatingButton = styled(IconButton, {
  position: 'absolute',
  zIndex: 9999,
  borderRadius: 'var(--radius-3)',
  width: 33,
  height: 33,
  boxShadow: '0 2px 8px var(--slate-a11)'
});



// ------- CYTOSCAPE FUNCTIONS -------

// function to generate cytoscape elements
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


// function to generate cytoscape style
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

// ------- APP FUNCTION -------

function App() {

  // ------- WINDOW RESIZING -------

  function getWindowSize() {
    const {innerWidth, innerHeight} = window;
    return {innerWidth, innerHeight};
  }
  
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



  // ------- CYTOSCAPE EDITING -------

  // make a list of nodes per layer that can be updated
  const [cytoLayers, setCytoLayers] = useState([1, 2, 3, 3, 16, 3, 3, 3, 2, 1]);

  // make a list of cytoscape elements that can be updated
  const cytoElements = useGenerateCytoElements(cytoLayers);
  const cytoStyle = useGenerateCytoStyle(cytoLayers);

  // function to add a node to a layer
  const addNode = useCallback((column) => {
    setCytoLayers(prevLayers => {
      const newLayers = [...prevLayers];
      newLayers[column] < 16 ? newLayers[column] += 1 : newLayers[column] = 16;
      document.getElementById("input" + column).value = newLayers[column];
      return newLayers;
    });
  }, []);

  // function to remove a node from a layer
  const removeNode = useCallback((column) => {
    setCytoLayers(prevLayers => {
      const newLayers = [...prevLayers];
      newLayers[column] > 1 ? newLayers[column] -= 1 : newLayers[column] = 1;
      document.getElementById("input" + column).value = newLayers[column];
      return newLayers;
    });
  }, []);

  // function to set a custom number of nodes for a layer
  const setNodes = useCallback((column) => {
    var nodeInput = Number(document.getElementById("input" + column).value)
    if (nodeInput && Number.isInteger(nodeInput)) {
      if (nodeInput < 1) {
        nodeInput = 1;
      } else if (nodeInput > 16) {
        nodeInput = 16;
      }
      setCytoLayers(prevLayers => {
        const newLayers = [...prevLayers];
        newLayers[column] = nodeInput;
        return newLayers;
      });
    } else {
      nodeInput = cytoLayers[column];
    }
    document.getElementById("input" + column).value = nodeInput;
  }, [cytoLayers]);



  // ------- POST REQUEST -------
  const postRequest = (e) => {
    e.preventDefault();
    const trainingData = {
      learning_rate: learningRate,
      epochs: iterations,
      network_setup: JSON.stringify(cytoLayers),
      nn_input: JSON.stringify([]),
      action: 1,
      error_list: JSON.stringify([]),
    };
    axios.put("http://127.0.0.1:8000/api/students/1", trainingData).then((response) => {
      console.log(response.status, response.data.token);
    });
  };


  // ------- FLOATING BUTTONS -------

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
            disabled={(isItPlus && cytoLayers[i] >= 16) | (!isItPlus && cytoLayers[i] < 2)}
            onClick = {isItPlus ? () => addNode(i) : () => removeNode(i)}
            style={{...style}}
            key={i}
          >
            {icon}
          </FloatingButton>
          {isItPlus &&
          <form>
            <input
            id={"input" + i}
            type="text"
            defaultValue={layers[i]}
            style={{
              border: 'none',
              width: 0.02 * (window.innerWidth * 0.97),
              textAlign: 'center',
              position: 'absolute',
              top: window.innerHeight - 258,
              left: left + i * dist + 16.5,
              transform: 'translateX(-50%)',
              fontSize: '14px',
              color: 'var(--cyan-12)',
              fontWeight: 'bold'
            }}
            onBlur={() => setNodes(i)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                setNodes(i);
              }
            }}
            />
          </form>
          }
        </div>
      );
      buttons.push(button);
    }
    return buttons;
  }



  // ------- SWITCHES -------

  const [isMontyPythonLover, setIsMontyPythonLover] = useState(false);

  const MontyPythonSwitch = () => {
    return (
      <Switch.Root className="SwitchRoot" id="airplane-mode" checked={isMontyPythonLover} onClick={() => setIsMontyPythonLover(!isMontyPythonLover)}>
        <Switch.Thumb className="SwitchThumb" />
      </Switch.Root>
    )
  }



  // ------- SLIDERS -------

  // initiate iterations and learning rate as variables with a useState hook
  const [iterations, setIterations] = useState(50);
  const [learningRate, setLearningRate] = useState(0.00001);

  // create a slider for iterations
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

  // create a slider for learning rate
  const learningRateSlider = useMemo(() => {
    return (
      <Slider.Root id="learningRateSlider"
        className="SliderRoot"
        defaultValue={[Math.round(-10*Math.log10(learningRate))]}
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
  }, [learningRate, setLearningRate]);




  // ------- RETURN THE APP CONTENT -------
  return (
    <Router>
    <body class='light-theme' >
      <Theme accentColor="cyan" grayColor="slate" panelBackground="solid" radius="large" appearance='light'>
        
        <Box py="2" style={{ backgroundColor: "var(--cyan-10)"}}>
          <Grid columns='3' mt='1'>
            <Box align='start' ml='3' >
              <Link to="https://www.tudelft.nl/en/" target="_blank" style={{ textDecoration: 'none' }}>
                <img src={tu_delft_pic} alt='Tu Delft Logo' width='auto' height='30' />
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
              <Tabs.Trigger value="home" >Home</Tabs.Trigger>
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
                
                <IconButton onClick={postRequest} variant="solid" style={{ position: 'absolute', transform: 'translateX(-50%)', top: Math.round(0.9 * (window.innerHeight-140)), left: Math.round(0.9 * (window.innerWidth * 0.97)), borderRadius: 'var(--radius-3)', width: 150, height: 36, fontSize: 'var(--font-size-2)', fontWeight: "500" }}>
                  <Flex direction="horizontal" gap="2" style={{alignItems: "center"}}>
                    <PlayIcon width="18" height="18" />Start training!
                  </Flex>
                </IconButton>

              </Tabs.Content>



              <Tabs.Content value="stuff">
                <Flex direction="column" gap="2">
                <label className="Label" htmlFor="stuff" style={{ paddingRight: 15 }}>
                  {isMontyPythonLover ?
                  "stuff." :
                  <Callout.Root>
                    <Callout.Icon>
                      <InfoCircledIcon />
                    </Callout.Icon>
                    <Callout.Text>
                      You have to be a Monty Python lover to see the stuff. Turn on Monty Python lover mode in the settings.
                    </Callout.Text>
                  </Callout.Root>
                  }
                </label>
                {isMontyPythonLover && <img src={monty_python_pic} alt="Monty Python"/>}
                </Flex>
              </Tabs.Content>



              <Tabs.Content value="settings">
                <Box style={{ display: 'flex', height: '100vh' }}>
                <form>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <label className="Label" htmlFor="monty-python-mode" style={{ paddingRight: 15 }}>
                      Monty Python lover mode
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