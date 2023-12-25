import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './App.css';
import { Theme, Flex, Box, Tabs, Heading, Grid, IconButton, Separator, Button } from '@radix-ui/themes';
import * as Slider from '@radix-ui/react-slider';
import * as Form from '@radix-ui/react-form';
import '@radix-ui/themes/styles.css';
import tu_delft_pic from "./tud_black_new.png";
import { Link, BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import CytoscapeComponent from 'react-cytoscapejs';
import { PlusIcon, MinusIcon, PlayIcon, InfoCircledIcon, ChevronLeftIcon, ChevronRightIcon, RocketIcon } from '@radix-ui/react-icons';
import { styled } from '@stitches/react';
import * as Switch from '@radix-ui/react-switch';
import axios from 'axios';


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


// ------- 404 PAGE -------

function NotFound() {
  return (
    <div>
      <h1>404</h1>
      <p>Page not found</p>
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

  console.log(window.location.origin);

  // ------- API EXPONENTIAL BACKOFF LISTENER -------
  const [apiData, setApiData] = useState(null);
  const [isTraining, setIsTraining] = useState(0); // 0 means no model exists, 1 means model is training, 2 means model is trained
  const [isResponding, setIsResponding] = useState(0); // 0 means no response, 1 means response is pending, 2 means response is received
  const [accuracy, setAccuracy] = useState(null);

  // Define the API endpoint
  const apiEndpoint = window.location.origin + "api/students";

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
    let data;
    axios.get(window.location.origin + "api/students/?limit=1")
      .then((response) => {
        // check if there is anything in the data
        if (response.data.length === 0) {
          data = [4, 10, 10, 10, 3]
        }
        else {
          data = response.data[0];
        }
        console.log(data);
        setApiData(data);
        setCytoLayers(JSON.parse(data["network_setup"]));
      })
      .catch((error) => {
        console.log(error);
      });
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
    axios.put(window.location.origin + "api/students/1", trainingData).then((response) => {
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
    axios.get(window.location.origin + "api/students/?limit=1")
      .then((response) => {
        const studentData = response.data[0];
        const formData = new FormData(event.target);
        const values = Array.from(formData.values()).map((value) => Number(value));
        console.log("values");
        console.log(values);
        studentData.nn_input = JSON.stringify(values);
        studentData.action = 2;
        console.log("updated student data");
        console.log(studentData);
        axios.put(window.location.origin + "api/students/1", studentData)
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
                <Box align='start' ml='3' >
                  <Link to="https://www.tudelft.nl/en/" target="_blank" style={{ textDecoration: 'none' }}>
                    <img src={tu_delft_pic} alt='Tu Delft Logo' width='auto' height='30' />
                  </Link>
                </Box>
                <Link to="https://brain-builder-f6e4dc8afc4d.herokuapp.com/" style={{ textDecoration: 'none' }}>
                  <Heading as='h1' align='center' size='6' style={{ color: 'var(--gray-1)', marginTop: 2, marginBottom: 0, textDecoration: 'none'}}>brAIn builder</Heading>
                </Link>
                <Box></Box>
              </Grid>
            </Box>
            <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '20px', alignItems: 'start', justifyContent: 'center', height: '100vh', padding: '20px' }}>
              <Link to="building" style={{ color: 'inherit', textDecoration: 'none' }}>
                <Button variant="outline" size="1" style={{ width: 100, height: 100, fontSize: 'var(--font-size-2)', fontWeight: "500" }}>
                  <Flex gap="2" style={{flexDirection: "column", alignItems: "center"}}>
                    <label>Game 1</label>
                    <div><RocketIcon width="35" height="35" /></div>
                  </Flex>
                </Button>
              </Link>
              <Link to="building" style={{ color: 'inherit', textDecoration: 'none' }}>
                <Button variant="outline" size="1" style={{ width: 100, height: 100, fontSize: 'var(--font-size-2)', fontWeight: "500" }}>
                  <Flex gap="2" style={{flexDirection: "column", alignItems: "center"}}>
                    <label>Game 2</label>
                    <div><RocketIcon width="35" height="35" /></div>
                  </Flex>
                </Button>
              </Link>
              <Link to="building" style={{ color: 'inherit', textDecoration: 'none' }}>
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
          <Route path="/building" element={
          <div>
            <Box py="2" style={{ backgroundColor: "var(--cyan-10)"}}>
              <Grid columns='3' mt='1'>
                <Box align='start' ml='3' >
                  <Link to="https://www.tudelft.nl/en/" target="_blank" style={{ textDecoration: 'none' }}>
                    <img src={tu_delft_pic} alt='Tu Delft Logo' width='auto' height='30' />
                  </Link>
                </Box>
                <Link to="https://brain-builder-f6e4dc8afc4d.herokuapp.com/" style={{ textDecoration: 'none' }}>
                  <Heading as='h1' align='center' size='6' style={{ color: 'var(--gray-1)', marginTop: 2, marginBottom: 0, textDecoration: 'none'}}>brAIn builder</Heading>
                </Link>
                <Box></Box>
              </Grid>
            </Box>
            
            

            <Tabs.Root defaultValue="building">

              <Tabs.List size="2">
                <Tabs.Trigger value="building" >Build</Tabs.Trigger>
                <Tabs.Trigger value="stuff">Test</Tabs.Trigger>
                <Tabs.Trigger value="settings">Settings</Tabs.Trigger>
              </Tabs.List>

              <Box px="4" pt="3" pb="0">
              <Tabs.Content value="building">
                <Box style={{ display: 'flex', alignItems: 'start', justifyContent: 'center', height: '100vh' }}>
                  <Flex direction="column" gap="2" height={'100vh'} style={{ alignItems: 'center', justifyContent: 'center'}}>
                    <CytoscapeComponent elements={cytoElements} stylesheet={cytoStyle} panningEnabled={false} autoungrabify={true} style={ { width: window.innerWidth*0.97, height: window.innerHeight-120, border: "solid", borderColor: "var(--slate-8)", borderRadius: "var(--radius-3)" } } />
                    
                    {console.log(cytoLayers.length)}
                    {generateFloatingButtons(window.innerHeight - 223, 0.08 * (window.innerWidth * 0.97) - 10, 0.7 * (window.innerWidth * 0.97)/cytoLayers.length, cytoLayers, true, cytoLayers.length)}                    
                    {generateFloatingButtons(window.innerHeight - 178, 0.08 * (window.innerWidth * 0.97) - 10, 0.7 * (window.innerWidth * 0.97)/cytoLayers.length, cytoLayers, false, cytoLayers.length)}

                    <FloatingButton
                      variant="outline"
                      onClick = {addLayer}
                      size="0"
                      style={{top: window.innerHeight*0.285, 
                              left: window.innerWidth*0.74, 
                              position: 'absolute',
                              zIndex: 9999,
                              borderRadius: 'var(--radius-5)',
                              width: 35,
                              height: 60,
                              boxShadow: '0 2px 8px var(--slate-a11)'}}
                    >
                      {<ChevronRightIcon 
                      style={{height: 30, width: 30}}
                      /> }
                    </FloatingButton>

                    <FloatingButton
                      variant="outline"
                      onClick = {removeLayer}
                      size="0"
                      style= {{ top: window.innerHeight*0.285, 
                                left: window.innerWidth*0.71,
                                position: 'absolute',
                                zIndex: 9999,
                                borderRadius: 'var(--radius-5)',
                                width: 35,
                                height: 60,
                                boxShadow: '0 2px 8px var(--slate-a11)'
                              }}
                    >
                      {<ChevronLeftIcon 
                      style={{height: 30, width: 30}}
                      />}
                    </FloatingButton>


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
                
                <Box style={{ position:"absolute", top: Math.round(0.50 * (window.innerHeight-140)), left: Math.round(0.82 * (window.innerWidth * 0.97)), alignItems: 'start', justifyContent: 'end', height: '100vh' }}>
                  <div id="api-data" style={{ color: accuracyColor }}>
                    {isTraining===2 ? (
                      <pre>Accuracy: {(parseFloat(JSON.parse(apiData["error_list"])[1])*100).toFixed(2)}%</pre>
                    ) : (isTraining===1 ? (
                      <pre>Training...</pre>
                    ) : (
                      <div></div>
                    )
                    )}
                  </div>
                </Box>

                <IconButton onClick={postRequest} variant="solid" style={{ position: 'absolute', transform: 'translateX(-50%)', top: Math.round(0.9 * (window.innerHeight-140)), left: Math.round(0.9 * (window.innerWidth * 0.97)), borderRadius: 'var(--radius-3)', width: 150, height: 36, fontSize: 'var(--font-size-2)', fontWeight: "500" }}>
                  <Flex direction="horizontal" gap="2" style={{alignItems: "center"}}>
                    <PlayIcon width="18" height="18" />Start training!
                  </Flex>
                </IconButton>

              </Tabs.Content>
            
              <Tabs.Content value="stuff">
                <Flex direction="column" gap="2">
                
                <Form.Root className="FormRoot" onSubmit={handleSubmit}>
                  <Form.Field className="FormField" name="s-m_axis">
                    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                      <Form.Label className="FormLabel">Semi-Major Axis [km]</Form.Label>
                      <Form.Message className="FormMessage" match="valueMissing">
                        Please enter the semi-major axis
                      </Form.Message>
                      <Form.Message className="FormMessage" match="typeMismatch">
                        Please provide a valid semi-major axis
                      </Form.Message>
                    </div>
                    <Form.Control asChild>
                      <input className="FormInput" type="number" required />
                    </Form.Control>
                  </Form.Field>

                  <Form.Field className="FormField" name="inclination">
                    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                      <Form.Label className="FormLabel">Inclination [degrees]</Form.Label>
                      <Form.Message className="FormMessage" match="valueMissing">
                        Please enter the inclination
                      </Form.Message>
                      <Form.Message className="FormMessage" match="typeMismatch">
                        Please provide a valid inclination
                      </Form.Message>
                    </div>
                    <Form.Control asChild>
                      <input className="FormInput" type="number" required />
                    </Form.Control>
                  </Form.Field>

                  <Form.Field className="FormField" name="expected_life">
                    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                      <Form.Label className="FormLabel">Expected Life [years]</Form.Label>
                      <Form.Message className="FormMessage" match="valueMissing">
                        Please enter the expected life
                      </Form.Message>
                      <Form.Message className="FormMessage" match="typeMismatch">
                        Please provide a valid expected life
                      </Form.Message>
                    </div>
                    <Form.Control asChild>
                      <input className="FormInput" type="number" required />
                    </Form.Control>
                  </Form.Field>

                  <Form.Field className="FormField" name="launch_mass">
                    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                      <Form.Label className="FormLabel">Launch Mass [kg]</Form.Label>
                      <Form.Message className="FormMessage" match="valueMissing">
                        Please enter the launch mass
                      </Form.Message>
                      <Form.Message className="FormMessage" match="typeMismatch">
                        Please provide a valid launch mass
                      </Form.Message>
                    </div>
                    <Form.Control asChild>
                      <input className="FormInput" type="number" required />
                    </Form.Control>
                  </Form.Field>

                  <Form.Submit asChild>
                    <button className="FormButton" style={{ marginTop: 10 }}>
                      Post query
                    </button>
                  </Form.Submit>
                </Form.Root>
                
                <div id="query-response">
                    {isResponding===2 ? (
                      <pre>Output: {apiData["nn_input"]}</pre>
                    ) : (isResponding===1 ? (
                      <pre>Getting your reply...</pre>
                    ) : (
                      <div></div>
                    )
                    )}
                  </div>
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
          </div>
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
