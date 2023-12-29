import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './App.css';
import { Theme, Flex, Box, Heading, Grid, IconButton, Button } from '@radix-ui/themes';
import * as Slider from '@radix-ui/react-slider';
import '@radix-ui/themes/styles.css';
import tu_delft_pic from "./tud_black_new.png";
import { Link, BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { PlusIcon, MinusIcon, RocketIcon } from '@radix-ui/react-icons';
import { styled } from '@stitches/react';
import * as Switch from '@radix-ui/react-switch';
import axios from 'axios';
import BuildView from './buildView';
import chroma from 'chroma-js';


const colorScale = chroma.scale(['#006383', '#348399', '#59a5b0', '#82c6c7', '#dddddd', '#efa19a', '#e36a61', '#c03b33', '#8a2111']).domain([-1, -0.75, -0.5, -0.25, 0, 0.25, 0.52, 0.75, 1]);


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
          const weight = Math.random() * 2 - 1;  
          cElements.push({ data: { source, target, weight } });
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
        'line-color': ele => colorScale(ele.data('weight')).toString(),
        'width': ele => Math.abs(ele.data('weight'))*2,
        'curve-style': 'bezier'
      }
    }
  ];
  return cStyle;
}


// ------- 404 PAGE -------

function NotFound() {
  return (
    <div>
      <h1>404</h1>
      <p>Page not found</p>
      <img src={require('./monty-python.jpeg')} alt="Monty Python" />
    </div>
  );
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

  const [apiData, setApiData] = useState(null);
  const [isTraining, setIsTraining] = useState(0); // 0 means no model exists, 1 means model is training, 2 means model is trained
  const [isResponding, setIsResponding] = useState(0); // 0 means no response, 1 means response is pending, 2 means response is received
  const [accuracy, setAccuracy] = useState(null);

  // Define the API endpoint
  const apiEndpoint = window.location.origin + "/api/backend";

  // Define the functions to fetch API data
  const fetchTrainingData = () => {
    axios.get(apiEndpoint)
      .then((response) => {
        setApiData(response.data[0]);
        setAccuracy(parseFloat(JSON.parse(apiData["error_list"])[1]))
        console.log(response.data[0]);
      })
      .catch((error) => {
        console.log(`Error fetching API data: ${error}`);
      });
    setIsTraining(2);
    console.log("Training finished")
  };

  const fetchQueryResponse = () => {
    axios.get(apiEndpoint)
      .then((response) => {
        setApiData(response.data[0]);
        console.log(response.data[0]);
      })
      .catch((error) => {
        console.log(`Error fetching API data: ${error}`);
      });
    setIsResponding(2);
    console.log("Training finished")
  };

  let accuracyColor = 'var(--slate-11)';

  // ------- CYTOSCAPE EDITING -------

  const [cytoLayers, setCytoLayers] = useState([]);
  useEffect(() => {
    localStorage.setItem('cytoLayers', JSON.stringify(cytoLayers));
  }, [cytoLayers]);

  useEffect(() => {
    // Check localStorage for a saved setting
    const savedSetting = localStorage.getItem('cytoLayersSetting');
  
    if (savedSetting) {
      // If a saved setting is found, parse it from JSON
      const cytoLayersSetting = JSON.parse(savedSetting);
  
      // Apply the setting to the CytoLayers
      setCytoLayers(cytoLayersSetting);
    } else {
        axios.get(window.location.origin + "/api/backend/?limit=1")
        .then((response) => {
            // check if there is anything in the data
            if (response.data.length === 0) {
                setCytoLayers([4, 7, 7, 3])
            }
            else {
                setApiData(response.data[0]);
                setCytoLayers(JSON.parse(apiData["network_setup"]));
            }
        })
        .catch((error) => {
            console.log(error);
        });
    }
  }, []);
  

  // make a list of cytoscape elements that can be updated
  const cytoElements = useGenerateCytoElements(cytoLayers);
  const cytoStyle = useGenerateCytoStyle(cytoLayers);

  // function to add a layer
  const addLayer = useCallback((column) => {
    setCytoLayers(prevLayers => {
      const newLayers = [...prevLayers];
      if (newLayers.length < 10) {newLayers.push(1)};
      return newLayers;
    });
  }, []);

  // function to remove a layer
  const removeLayer = useCallback((column) => {
    setCytoLayers(prevLayers => {
      const newLayers = [...prevLayers];
      if (newLayers.length > 2) {newLayers.pop()}
      return newLayers;
    });
  }, []);

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
    setAccuracy(null);
    setIsTraining(1);
    axios.put(window.location.origin + "/api/backend/1", trainingData).then((response) => {
      console.log(response.status);
      fetchTrainingData();
    });
  };


  // ------- FLOATING BUTTONS -------

  // function to generate floating buttons
  function generateFloatingButtons(top, left, dist, layers, isItPlus, nLayers) {
    const buttons = [];
    const icon = isItPlus ? <PlusIcon /> : <MinusIcon />;
    for (let i = 0; i < nLayers; i++) {
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

  // ------- FORMS -------
  const [formValues, setFormValues] = useState([]);

  const handleSubmit = (event) => {
    event.preventDefault();
    setIsResponding(1);
    axios.get(window.location.origin + "/api/backend/?limit=1")
      .then((response) => {
        const networkData = response.data[0];
        const formData = new FormData(event.target);
        const values = Array.from(formData.values()).map((value) => Number(value));
        console.log("values");
        console.log(values);
        networkData.nn_input = JSON.stringify(values);
        networkData.action = 2;
        console.log("updated network data");
        console.log(networkData);
        axios.put(window.location.origin + "/api/backend/1", networkData)
          .then((response) => {
            console.log(response.status);
            fetchQueryResponse();
          })
          .catch((error) => {
            console.log(error);
          });
      })
      .catch((error) => {
        console.log(error);
      });
  };



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
  const [iterations, setIterations] = useState(200);
  const [learningRate, setLearningRate] = useState(0.01);

  // create a slider for iterations
  const iterationsSlider = useMemo(() => {
    return (
      <Slider.Root
        className="SliderRoot"
        defaultValue={[iterations]}
        onValueChange={(value) => setIterations(value[0]*2)}
        max={100}
        step={0.5}
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
        defaultValue={[30]}
        onValueChange={(value) => setLearningRate((10 ** ((value[0]/-20)-0.33)).toFixed(Math.round((value[0]+10) / 20)))}
        max={70}
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


  const updateCytoLayers = (setCytoLayersMethod, n_of_inputs, n_of_outputs) => {
    setCytoLayersMethod(prevCytoLayers => {
      const newCytoLayers = prevCytoLayers.map((layer, index) => {
        if (index === 0) {
          return n_of_inputs;
        } else if (index === prevCytoLayers.length - 1) {
          return n_of_outputs;
        } else {
          return layer;
        }
      });

      return newCytoLayers;
    });
  };


  // ------- RETURN THE APP CONTENT -------
  return (
    <body class='light-theme' >
      <Theme accentColor="cyan" grayColor="slate" panelBackground="solid" radius="large" appearance='light'>
      <Router>
        <Routes>
          <Route path="/" element={
          <div>
            <Box py="2" style={{ backgroundColor: "var(--cyan-10)"}}>
              <Grid columns='3' mt='1'>
                <Box/>
                <Link to={window.location.origin} style={{ textDecoration: 'none' }}>
                  <Heading as='h1' align='center' size='6' style={{ color: 'var(--gray-1)', marginTop: 2, marginBottom: 0, textDecoration: 'none'}}>brAIn builder</Heading>
                </Link>
                <Box align='end' mr='3' >
                    <Link to="https://www.tudelft.nl/en/" target="_blank" style={{ textDecoration: 'none'}}>
                    <img src={tu_delft_pic} alt='Tu Delft Logo' width='auto' height='30'/>
                    </Link>
                </Box>
              </Grid>
            </Box>
            <Heading as='h2' size='6' style={{ color: 'var(--gray-12)', marginLeft: 20, marginTop: 30 , marginBottom: 10 }}>&gt; Games</Heading>
            <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '20px', alignItems: 'start', justifyContent: 'center', height: '100vh', marginLeft: 20 }}>
              <Link to="game1" style={{ color: 'inherit', textDecoration: 'none' }}>
                <Button variant="outline" size="1" style={{ width: 100, height: 100, fontSize: 'var(--font-size-2)', fontWeight: "500" }}>
                  <Flex gap="2" style={{flexDirection: "column", alignItems: "center"}}>
                    <label>Game 1</label>
                    <div><RocketIcon width="35" height="35" /></div>
                  </Flex>
                </Button>
              </Link>
              <Link to="game2" style={{ color: 'inherit', textDecoration: 'none' }}>
                <Button variant="outline" size="1" style={{ width: 100, height: 100, fontSize: 'var(--font-size-2)', fontWeight: "500" }}>
                  <Flex gap="2" style={{flexDirection: "column", alignItems: "center"}}>
                    <label>Game 2</label>
                    <div><RocketIcon width="35" height="35" /></div>
                  </Flex>
                </Button>
              </Link>
              <Link to="game3" style={{ color: 'inherit', textDecoration: 'none' }}>
                <Button variant="outline" size="1" style={{ width: 100, height: 100, fontSize: 'var(--font-size-2)', fontWeight: "500" }}>
                  <Flex gap="2" style={{flexDirection: "column", alignItems: "center"}}>
                    <label>Game 3</label>
                    <div><RocketIcon width="35" height="35" /></div>
                  </Flex>
                </Button>
              </Link>
            </Box>
          </div>
          } />
          <Route path="/game1" element={
            <BuildView
            currentGame={"game1"} 
            n_of_inputs={4}
            n_of_outputs={3}
            cytoElements={cytoElements}
            cytoStyle={cytoStyle}
            generateFloatingButtons={generateFloatingButtons}
            cytoLayers={cytoLayers}
            setCytoLayers={setCytoLayers}
            updateCytoLayers={updateCytoLayers}
            FloatingButton={FloatingButton}
            addLayer={addLayer}
            removeLayer={removeLayer}
            iterationsSlider={iterationsSlider}
            iterations={iterations}
            learningRateSlider={learningRateSlider}
            learningRate={learningRate}
            isTraining={isTraining}
            apiData={apiData}
            postRequest={postRequest}
            accuracyColor={accuracyColor}
            handleSubmit={handleSubmit}
            isResponding={isResponding}
            MontyPythonSwitch={MontyPythonSwitch}
          />
          } />
          <Route path="/game2" element={
            <BuildView
            currentGame={"game2"} 
            n_of_inputs={2}
            n_of_outputs={5}
            cytoElements={cytoElements}
            cytoStyle={cytoStyle}
            generateFloatingButtons={generateFloatingButtons}
            cytoLayers={cytoLayers}
            setCytoLayers={setCytoLayers}
            updateCytoLayers={updateCytoLayers}
            FloatingButton={FloatingButton}
            addLayer={addLayer}
            removeLayer={removeLayer}
            iterationsSlider={iterationsSlider}
            iterations={iterations}
            learningRateSlider={learningRateSlider}
            learningRate={learningRate}
            isTraining={isTraining}
            apiData={apiData}
            postRequest={postRequest}
            accuracyColor={accuracyColor}
            handleSubmit={handleSubmit}
            isResponding={isResponding}
            MontyPythonSwitch={MontyPythonSwitch}
          />
          } />
          <Route path="/game3" element={
            <BuildView
            currentGame={"game3"} 
            n_of_inputs={10}
            n_of_outputs={1}
            cytoElements={cytoElements}
            cytoStyle={cytoStyle}
            generateFloatingButtons={generateFloatingButtons}
            cytoLayers={cytoLayers}
            setCytoLayers={setCytoLayers}
            updateCytoLayers={updateCytoLayers}
            FloatingButton={FloatingButton}
            addLayer={addLayer}
            removeLayer={removeLayer}
            iterationsSlider={iterationsSlider}
            iterations={iterations}
            learningRateSlider={learningRateSlider}
            learningRate={learningRate}
            isTraining={isTraining}
            apiData={apiData}
            postRequest={postRequest}
            accuracyColor={accuracyColor}
            handleSubmit={handleSubmit}
            isResponding={isResponding}
            MontyPythonSwitch={MontyPythonSwitch}
          />
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
      </Theme>
    </body>
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
