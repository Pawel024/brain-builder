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
import Tutorial from './tutorial';
import chroma from 'chroma-js';
import Readme from './readme';


const colorScale = chroma.scale(['#49329b', '#5e5cc2', '#8386d8', '#afb0e1', '#dddddd', '#e3a692', '#d37254', '#b64124', '#8f0500']).domain([-1, -0.75, -0.5, -0.25, 0, 0.25, 0.52, 0.75, 1]);


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
function useGenerateCytoElements(list = [], apiData) {
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
          const weight = 5;
          try {
            weight = parseFloat(JSON.parse(this.props.apiData["network_weights"])[i][j][k]);
          } catch (error) {}
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
  const isMontyPythonLover = true; // Replace with your condition

  return (
    <div>
      <h1>404</h1>
      <p>Page not found : ( </p>
      {isMontyPythonLover && <img src={require('./monty-python.jpeg')} alt="Monty Python" />}
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

  const [apiData1, setApiData1] = useState(null);
  const [isTraining1, setIsTraining1] = useState(0); // 0 means no model exists, 1 means model is training, 2 means model is trained
  const [isResponding1, setIsResponding1] = useState(0); // 0 means no response, 1 means response is pending, 2 means response is received
  const [accuracy1, setAccuracy1] = useState(null);

  const [apiData2, setApiData2] = useState(null);
  const [isTraining2, setIsTraining2] = useState(0); // 0 means no model exists, 1 means model is training, 2 means model is trained
  const [isResponding2, setIsResponding2] = useState(0); // 0 means no response, 1 means response is pending, 2 means response is received
  const [accuracy2, setAccuracy2] = useState(null);

  const [apiData3, setApiData3] = useState(null);
  const [isTraining3, setIsTraining3] = useState(0); // 0 means no model exists, 1 means model is training, 2 means model is trained
  const [isResponding3, setIsResponding3] = useState(0); // 0 means no response, 1 means response is pending, 2 means response is received
  const [accuracy3, setAccuracy3] = useState(null);

  // Define the API endpoint
  const apiEndpoint = window.location.origin + "/api/backend/?limit=1";

  // Define the functions to fetch API data
  const fetchTrainingData = (apiData, setApiData, setAccuracy, setIsTraining) => {
    axios.get(apiEndpoint)
      .then((response) => {
        setApiData(response.data[0]);
        setAccuracy(parseFloat(JSON.parse(response.data[0]["error_list"])[1]))
        console.log(response.data[0]);
      })
      .catch((error) => {
        console.log(`Error fetching API data: ${error}`);
      });
    setIsTraining1(2);
    console.log("Training finished")
  };

  const fetchQueryResponse = (setApiData, setIsResponding) => {
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

  const [cytoLayers1, setCytoLayers1] = useState([]);
  useEffect(() => {
    localStorage.setItem('cytoLayers1', JSON.stringify(cytoLayers1));
  }, [cytoLayers1]);

  const [cytoLayers2, setCytoLayers2] = useState([]);
  useEffect(() => {
    localStorage.setItem('cytoLayers2', JSON.stringify(cytoLayers2));
  }, [cytoLayers2]);

  const [cytoLayers3, setCytoLayers3] = useState([]);
  useEffect(() => {
    localStorage.setItem('cytoLayers3', JSON.stringify(cytoLayers3));
  }, [cytoLayers3]);

  
  const loadLastCytoLayers = (setCytoLayers, apiData, setApiData, propertyName) => {
    // Check localStorage for a saved setting
    const savedSetting = localStorage.getItem(propertyName);
    let goToStep2 = false;
  
    if (savedSetting && savedSetting !== '[]') {
        try {
            // If a saved setting is found, try to parse it from JSON
            const cytoLayersSetting = JSON.parse(savedSetting);
            // try to set the cytoLayers to the saved setting, if there is an error, set it to default
            setCytoLayers(cytoLayersSetting);
        }
        catch (error) {
            console.log(error);
            goToStep2 = true;
        }
    }
    else {goToStep2 = true;};

    if (goToStep2) {
        axios.get(window.location.origin + "/api/backend/?limit=1")
        .then((response) => {
            try {
                setApiData(response.data[0]);
                console.log("apiData:");
                console.log(response.data[0]);
                setCytoLayers(JSON.parse(response.data[0]["network_setup"]));
            }
            catch (error) {
                setCytoLayers([4, 7, 7, 3]);
                console.log(error);
            }
        })
        .catch((error) => {
            console.log(error);
        });
    }
  };
  
  /*
  useEffect(() => {
    loadLastCytoLayers(setCytoLayers1, apiData1, setApiData1, 'cytoLayers1');
  }, [apiData1]);
  
  useEffect(() => {
    loadLastCytoLayers(setCytoLayers2, apiData2, setApiData2, 'cytoLayers2');
  }, [apiData2]);

  useEffect(() => {
    loadLastCytoLayers(setCytoLayers3, apiData3, setApiData3, 'cytoLayers3');
  }, [apiData3]);
  */

  const cytoElements1 = useGenerateCytoElements(cytoLayers1, apiData1);
  const cytoStyle1 = useGenerateCytoStyle(cytoLayers1);

  const cytoElements2 = useGenerateCytoElements(cytoLayers2, apiData2);
  const cytoStyle2 = useGenerateCytoStyle(cytoLayers2);

  const cytoElements3 = useGenerateCytoElements(cytoLayers3, apiData3);
  const cytoStyle3 = useGenerateCytoStyle(cytoLayers3);

  // function to add a layer
  const addLayer = useCallback((setCytoLayers, nOfOutputs) => {
    setCytoLayers(prevLayers => {
      const newLayers = [...prevLayers];
      if (newLayers.length < 10) {newLayers.push(nOfOutputs)};
      return newLayers;
    });
  }, []);

  // function to remove a layer
  const removeLayer = useCallback((setCytoLayers) => {
    setCytoLayers(prevLayers => {
      const newLayers = [...prevLayers];
      if (newLayers.length > 2) {newLayers.splice(-2, 1)}
      return newLayers;
    });
  }, []);

  // function to add a node to a layer
  const addNode = useCallback((column, setCytoLayers, currentGameNumber) => {
    setCytoLayers(prevLayers => {
      const newLayers = [...prevLayers];
      newLayers[column] < 16 ? newLayers[column] += 1 : newLayers[column] = 16;
      document.getElementById(currentGameNumber + "-input" + column).value = newLayers[column];
      return newLayers;
    });
  }, []);

  // function to remove a node from a layer
  const removeNode = useCallback((column, setCytoLayers, currentGameNumber) => {
    setCytoLayers(prevLayers => {
      const newLayers = [...prevLayers];
      newLayers[column] > 1 ? newLayers[column] -= 1 : newLayers[column] = 1;
      document.getElementById(currentGameNumber + "-input" + column).value = newLayers[column];
      return newLayers;
    });
  }, []);

  // function to set a custom number of nodes for a layer
  const setNodes = useCallback((column, setCytoLayers, currentGameNumber) => {
    var nodeInput = Number(document.getElementById(currentGameNumber + "-input" + column).value)
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
      nodeInput = cytoLayers1[column];
    }
    document.getElementById(currentGameNumber + "-input" + column).value = nodeInput;
  }, [cytoLayers1]);



  // ------- POST REQUEST -------
  const postRequest = (e, cytoLayers, apiData, setApiData, setAccuracy, setIsTraining, learningRate, iterations) => {
    e.preventDefault();
    console.log("learningRate:");
    console.log(learningRate);
    const trainingData = {
      learning_rate: learningRate,
      epochs: iterations,
      network_setup: JSON.stringify(cytoLayers),
      network_weights: JSON.stringify([]),
      network_biases: JSON.stringify([]),
      nn_input: JSON.stringify([]),
      action: 1,
      error_list: JSON.stringify([]),
    };
    setAccuracy(null);
    setIsTraining(1);
    axios.put(window.location.origin + "/api/backend/1", trainingData).then((response) => {
      console.log(response.status);
      fetchTrainingData(apiData, setApiData, setAccuracy, setIsTraining);
    });
  };


  // ------- FLOATING BUTTONS -------

  // function to generate floating buttons
  function generateFloatingButtons(top, left, dist, isItPlus, nLayers, cytoLayers, setCytoLayers, currentGameNumber) {
    const buttons = [];
    const icon = isItPlus ? <PlusIcon /> : <MinusIcon />;
    for (let i = 1; i < nLayers-1; i++) {
      const style = { top: top, left: left + i * dist };
      const button = (
        <div>
          <FloatingButton
            variant="outline"
            disabled={(isItPlus && cytoLayers[i] >= 16) | (!isItPlus && cytoLayers1[i] < 2)}
            onClick = {isItPlus ? () => addNode(i, setCytoLayers, currentGameNumber) : () => removeNode(i, setCytoLayers, currentGameNumber)}
            style={{...style}}
            key={i}
          >
            {icon}
          </FloatingButton>
          {isItPlus &&
          <form>
            <input
            id={currentGameNumber + "-input" + i}
            type="text"
            defaultValue={cytoLayers[i]}
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
            onBlur={() => setNodes(i, setCytoLayers, currentGameNumber)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                setNodes(i, setCytoLayers, currentGameNumber);
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

  const handleSubmit = (event, setIsResponding, setApiData) => {
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
            fetchQueryResponse(setApiData, setIsResponding);
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
      <Switch.Root className="SwitchRoot" id="monty-python-switch" checked={isMontyPythonLover} onClick={() => setIsMontyPythonLover(!isMontyPythonLover)}>
        <Switch.Thumb className="SwitchThumb" />
      </Switch.Root>
    )
  }



  // ------- SLIDERS -------

  // initiate iterations and learning rate as variables with a useState hook
  const [iterations1, setIterations1] = useState(200);
  const [learningRate1, setLearningRate1] = useState(0.01);

  const [iterations2, setIterations2] = useState(200);
  const [learningRate2, setLearningRate2] = useState(0.01);

  const [iterations3, setIterations3] = useState(200);
  const [learningRate3, setLearningRate3] = useState(0.01);

  // create a slider for iterations for each game
  const iterationsSlider1 = useMemo(() => {
    return (
      <Slider.Root
        className="SliderRoot"
        defaultValue={[iterations1]}
        onValueChange={(value) => setIterations1(value[0]*2)}
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
  }, [iterations1, setIterations1]);

  const iterationsSlider2 = useMemo(() => {
    return (
      <Slider.Root
        className="SliderRoot"
        defaultValue={[iterations2]}
        onValueChange={(value) => setIterations2(value[0]*2)}
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
  }, [iterations2, setIterations2]);

  const iterationsSlider3 = useMemo(() => {
    return (
      <Slider.Root
        className="SliderRoot"
        defaultValue={[iterations3]}
        onValueChange={(value) => setIterations3(value[0]*2)}
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
  }, [iterations3, setIterations3]);


  // create a slider for learning rate
  const learningRateSlider1 = useMemo(() => {
    return (
      <Slider.Root id="learningRateSlider1"
        className="SliderRoot"
        defaultValue={[30]}
        onValueChange={(value) => setLearningRate1((10 ** ((value[0]/-20)-0.33)).toFixed(Math.round((value[0]+10) / 20)))}
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
  }, []);

  const learningRateSlider2 = useMemo(() => {
    return (
      <Slider.Root id="learningRateSlider2"
        className="SliderRoot"
        defaultValue={[30]}
        onValueChange={(value) => setLearningRate2((10 ** ((value[0]/-20)-0.33)).toFixed(Math.round((value[0]+10) / 20)))}
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
  }, []);

  const learningRateSlider3 = useMemo(() => {
    return (
      <Slider.Root id="learningRateSlider3"
        className="SliderRoot"
        defaultValue={[30]}
        onValueChange={(value) => setLearningRate3((10 ** ((value[0]/-20)-0.33)).toFixed(Math.round((value[0]+10) / 20)))}
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
  }, []);


  const updateCytoLayers = (setCytoLayers, nOfInputs, nOfOutputs) => {
    setCytoLayers(prevCytoLayers => {
      const newCytoLayers = prevCytoLayers.map((layer, index) => {
        if (index === 0) {
          return nOfInputs;
        } else if (index === prevCytoLayers.length - 1) {
          return nOfOutputs;
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
            <Flex direction='row' gap='3' style={{padding:'10px 10px', alignItems: 'flex-start'}}>
            <Flex direction='column' gap='3' style={{ flex: 1 }}>
              <Box style={{ border: "solid", borderColor: "var(--slate-8)", borderRadius: "var(--radius-3)", padding: '10px 24px' }}>
                <Heading as='h2' size='5' style={{ color: 'var(--slate-12)', marginBottom:7 }}>&gt; Get Started</Heading>
                <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '12px', alignItems: 'start', justifyContent: 'center'}}>
                <Link to="tutorial" style={{ color: 'inherit', textDecoration: 'none' }}>
                    <Button variant="outline" size="1" style={{ width: 100, height: 100, fontSize: 'var(--font-size-2)', fontWeight: "500" }}>
                    <Flex gap="2" style={{ color:'var(--cyan-11)', flexDirection: "column", alignItems: "center"}}>
                        <label>Tutorial</label>
                        <div><RocketIcon width="35" height="35" /></div>
                    </Flex>
                    </Button>
                </Link>
                </Box>
              </Box>
              <Box style={{ border: "solid", borderColor: "var(--slate-8)", borderRadius: "var(--radius-3)", padding: '10px 24px' }}>
                <Heading as='h2' size='5' style={{ color: 'var(--slate-12)', marginBottom:7 }}>&gt; Level 1</Heading>
                <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '12px', alignItems: 'start', justifyContent: 'center'}}>
                <Link to="challenge1" style={{ color: 'inherit', textDecoration: 'none' }}>
                    <Button variant="outline" size="1" style={{ width: 100, height: 100, fontSize: 'var(--font-size-2)', fontWeight: "500" }}>
                    <Flex gap="2" style={{ color:'var(--cyan-11)', flexDirection: "column", alignItems: "center"}}>
                        <label>Challenge 1</label>
                        <div><RocketIcon width="35" height="35" /></div>
                    </Flex>
                    </Button>
                </Link>
                <Link to="challenge2" style={{ color: 'inherit', textDecoration: 'none' }}>
                    <Button variant="outline" size="1" style={{ width: 100, height: 100, fontSize: 'var(--font-size-2)', fontWeight: "500" }}>
                    <Flex gap="2" style={{ color:'var(--cyan-11)', flexDirection: "column", alignItems: "center"}}>
                        <label>Challenge 2</label>
                        <div><RocketIcon width="35" height="35" /></div>
                    </Flex>
                    </Button>
                </Link>
                <Link to="challenge3" style={{ color: 'inherit', textDecoration: 'none' }}>
                    <Button variant="outline" size="1" style={{ width: 100, height: 100, fontSize: 'var(--font-size-2)', fontWeight: "500" }}>
                    <Flex gap="2" style={{ color:'var(--cyan-11)', flexDirection: "column", alignItems: "center"}}>
                        <label>Challenge 3</label>
                        <div><RocketIcon width="35" height="35" /></div>
                    </Flex>
                    </Button>
                </Link>
                </Box>
              </Box>
              <Box style={{ border: "solid", borderColor: "var(--slate-8)", borderRadius: "var(--radius-3)", padding: '10px 24px' }}>
                <Heading as='h2' size='5' style={{ color: 'var(--slate-12)', marginBottom:7 }}>&gt; Level 2</Heading>
                <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '12px', alignItems: 'start', justifyContent: 'center'}}>
                <Link to="challenge1" style={{ color: 'inherit', textDecoration: 'none' }}>
                    <Button variant="outline" size="1" style={{ width: 100, height: 100, fontSize: 'var(--font-size-2)', fontWeight: "500" }}>
                    <Flex gap="2" style={{ color:'var(--cyan-11)', flexDirection: "column", alignItems: "center"}}>
                        <label>Challenge 1</label>
                        <div><RocketIcon width="35" height="35" /></div>
                    </Flex>
                    </Button>
                </Link>
                <Link to="challenge2" style={{ color: 'inherit', textDecoration: 'none' }}>
                    <Button variant="outline" size="1" style={{ width: 100, height: 100, fontSize: 'var(--font-size-2)', fontWeight: "500" }}>

                    <Flex gap="2" style={{ color:'var(--cyan-11)', flexDirection: "column", alignItems: "center"}}>
                        <label>Challenge 2</label>
                        <div><RocketIcon width="35" height="35" /></div>
                    </Flex>
                    </Button>
                </Link>
                <Link to="challenge3" style={{ color: 'inherit', textDecoration: 'none' }}>
                    <Button variant="outline" size="1" style={{ width: 100, height: 100, fontSize: 'var(--font-size-2)', fontWeight: "500" }}>
                    <Flex gap="2" style={{ color:'var(--cyan-11)', flexDirection: "column", alignItems: "center"}}>
                        <label>Challenge 3</label>
                        <div><RocketIcon width="35" height="35" /></div>
                    </Flex>
                    </Button>
                </Link>
                </Box>
              </Box>
              <Box style={{ border: "solid", borderColor: "var(--slate-8)", borderRadius: "var(--radius-3)", padding: '10px 24px' }}>
                <Heading as='h2' size='5' style={{ color: 'var(--slate-12)', marginBottom:7 }}>&gt; Level 3</Heading>
                <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '12px', alignItems: 'start', justifyContent: 'center'}}>
                <Link to="challenge1" style={{ color: 'inherit', textDecoration: 'none' }}>
                    <Button variant="outline" size="1" style={{ width: 100, height: 100, fontSize: 'var(--font-size-2)', fontWeight: "500" }}>
                    <Flex gap="2" style={{ color:'var(--cyan-11)', flexDirection: "column", alignItems: "center"}}>
                        <label>Challenge 1</label>
                        <div><RocketIcon width="35" height="35" /></div>
                    </Flex>
                    </Button>
                </Link>
                <Link to="challenge2" style={{ color: 'inherit', textDecoration: 'none' }}>
                    <Button variant="outline" size="1" style={{ width: 100, height: 100, fontSize: 'var(--font-size-2)', fontWeight: "500" }}>
                    <Flex gap="2" style={{ color:'var(--cyan-11)', flexDirection: "column", alignItems: "center"}}>
                        <label>Challenge 2</label>
                        <div><RocketIcon width="35" height="35" /></div>
                    </Flex>
                    </Button>
                </Link>
                <Link to="challenge3" style={{ color: 'inherit', textDecoration: 'none' }}>
                    <Button variant="outline" size="1" style={{ width: 100, height: 100, fontSize: 'var(--font-size-2)', fontWeight: "500" }}>
                    <Flex gap="2" style={{ color:'var(--cyan-11)', flexDirection: "column", alignItems: "center"}}>
                        <label>Challenge 3</label>
                        <div><RocketIcon width="35" height="35" /></div>
                    </Flex>
                    </Button>
                </Link>
                </Box>
              </Box>


            {/* NOTE THAT THE 3 LEVELS ARE NOT YET INDEPENDENT AT ALL!!!!!! */}


            </Flex>
            <Box style={{ flex: 1, border: "solid", borderColor: "var(--slate-8)", borderRadius: "var(--radius-3)", padding: '10px 24px' }}>
            <Heading as='h2' size='5' style={{ color: 'var(--slate-12)', marginBottom:7 }}>&gt; Readme</Heading>
            <Box>
                <Readme />
            </Box>
            </Box>
            </Flex>
          </div>
          } />
          <Route path="/tutorial" element={
            <Tutorial 
            nOfInputs={4}
            nOfOutputs={3}
            maxLayers={10}
            cytoElements={cytoElements1}
            cytoStyle={cytoStyle1}
            generateFloatingButtons={generateFloatingButtons}
            cytoLayers={cytoLayers1}
            setCytoLayers={setCytoLayers1}
            updateCytoLayers={updateCytoLayers}
            loadLastCytoLayers={loadLastCytoLayers}
            FloatingButton={FloatingButton}
            addLayer={addLayer}
            removeLayer={removeLayer}
            iterationsSlider={iterationsSlider1}
            iterations={iterations1}
            setIterations={setIterations1}
            learningRateSlider={learningRateSlider1}
            learningRate={learningRate1}
            setLearningRate={setLearningRate1}
            isTraining={isTraining1}
            setIsTraining={setIsTraining1}
            apiData={apiData1}
            setApiData={setApiData1}
            postRequest={postRequest}
            accuracy={accuracy1}
            setAccuracy={setAccuracy1}
            accuracyColor={accuracyColor}
            handleSubmit={handleSubmit}
            isResponding={isResponding1}
            setIsResponding={setIsResponding1}
            MontyPythonSwitch={MontyPythonSwitch}
          />
          } />
          <Route path="/challenge1" element={
            <BuildView
            currentGameNumber={1} 
            nOfInputs={4}
            nOfOutputs={3}
            maxLayers={10}
            cytoElements={cytoElements1}
            cytoStyle={cytoStyle1}
            generateFloatingButtons={generateFloatingButtons}
            cytoLayers={cytoLayers1}
            setCytoLayers={setCytoLayers1}
            updateCytoLayers={updateCytoLayers}
            loadLastCytoLayers={loadLastCytoLayers}
            FloatingButton={FloatingButton}
            addLayer={addLayer}
            removeLayer={removeLayer}
            iterationsSlider={iterationsSlider1}
            iterations={iterations1}
            setIterations={setIterations1}
            learningRateSlider={learningRateSlider1}
            learningRate={learningRate1}
            setLearningRate={setLearningRate1}
            isTraining={isTraining1}
            setIsTraining={setIsTraining1}
            apiData={apiData1}
            setApiData={setApiData1}
            postRequest={postRequest}
            accuracy={accuracy1}
            setAccuracy={setAccuracy1}
            accuracyColor={accuracyColor}
            handleSubmit={handleSubmit}
            isResponding={isResponding1}
            setIsResponding={setIsResponding1}
            MontyPythonSwitch={MontyPythonSwitch}
          />
          } />
          <Route path="/challenge2" element={
            <BuildView
            currentGameNumber={2} 
            nOfInputs={2}
            nOfOutputs={5}
            maxLayers={10}
            cytoElements={cytoElements2}
            cytoStyle={cytoStyle2}
            generateFloatingButtons={generateFloatingButtons}
            cytoLayers={cytoLayers2}
            setCytoLayers={setCytoLayers2}
            updateCytoLayers={updateCytoLayers}
            loadLastCytoLayers={loadLastCytoLayers}
            FloatingButton={FloatingButton}
            addLayer={addLayer}
            removeLayer={removeLayer}
            iterationsSlider={iterationsSlider2}
            iterations={iterations2}
            setIterations={setIterations2}
            learningRateSlider={learningRateSlider2}
            learningRate={learningRate2}
            setLearningRate={setLearningRate2}
            isTraining={isTraining2}
            setIsTraining={setIsTraining2}
            apiData={apiData2}
            setApiData={setApiData2}
            postRequest={postRequest}
            accuracy={accuracy2}
            setAccuracy={setAccuracy2}
            accuracyColor={accuracyColor}
            handleSubmit={handleSubmit}
            isResponding={isResponding2}
            setIsResponding={setIsResponding2}
            MontyPythonSwitch={MontyPythonSwitch}
          />
          } />
          <Route path="/challenge3" element={
            <BuildView
            currentGameNumber={3} 
            nOfInputs={10}
            nOfOutputs={1}
            maxLayers={10}
            cytoElements={cytoElements3}
            cytoStyle={cytoStyle3}
            generateFloatingButtons={generateFloatingButtons}
            cytoLayers={cytoLayers3}
            setCytoLayers={setCytoLayers3}
            updateCytoLayers={updateCytoLayers}
            loadLastCytoLayers={loadLastCytoLayers}
            FloatingButton={FloatingButton}
            addLayer={addLayer}
            removeLayer={removeLayer}
            iterationsSlider={iterationsSlider3}
            setIterations={setIterations3}
            iterations={iterations3}
            learningRateSlider={learningRateSlider3}
            learningRate={learningRate3}
            setLearningRate={setLearningRate3}
            isTraining={isTraining3}
            setIsTraining={setIsTraining3}
            apiData={apiData3}
            setApiData={setApiData3}
            postRequest={postRequest}
            accuracy={accuracy3}
            setAccuracy={setAccuracy3}
            accuracyColor={accuracyColor}
            handleSubmit={handleSubmit}
            isResponding={isResponding3}
            setIsResponding={setIsResponding3}
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
