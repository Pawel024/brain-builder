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
import Introduction from './introduction';


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

const ChallengeButton = styled(Button, {
  width: 120,
  height: 80,
  fontSize: 'var(--font-size-2)',
  fontWeight: '500',
  boxShadow: '0 1px 3px var(--slate-a11)'
});

// ------- CSRF TOKEN -------
/*
function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      // Does this cookie string begin with the name we want?
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

const csrftoken = getCookie('csrftoken');

axios.defaults.headers.common['X-CSRFToken'] = csrftoken;
*/

// ------- COOKIE FUNCTION -------
function getCookie(name) {
  var value = "; " + document.cookie;
  var parts = value.split("; " + name + "=");
  if (parts.length === 2) return parts.pop().split(";").shift();
}

// ------- CYTOSCAPE FUNCTIONS -------

// function to generate cytoscape elements
function generateCytoElements(list, apiData, isTraining) {
  const cElements = [];

  // Generate nodes
  list.forEach((nodesPerLayer, i) => {
    for (let j = 0; j < nodesPerLayer; j++) {
      const id = list.slice(0, i).reduce((acc, curr) => acc + curr, 0) + j;
      const label = `Node ${id}`;
      const hAvailable = window.innerHeight - 326;
      const wAvailable = 0.7 * (window.innerWidth * 0.97);
      const xDistBetweenNodes = wAvailable/list.length;
      const yDistBetweenNodes = hAvailable/Math.max(...list);
      const position = { x: Math.round((0.78 * window.innerWidth * 0.97) + (i-list.length) * xDistBetweenNodes), y: Math.round( 0.5 * (window.innerHeight-140) - 0.5*yDistBetweenNodes - 65 + (-nodesPerLayer) * 0.5 * yDistBetweenNodes + yDistBetweenNodes + j * yDistBetweenNodes) };
      cElements.push({ data: { id, label }, position });
    }
  });

  // Generate lines between nodes
  let weights;
  let max;
  let min;
  let absMax;
  if (apiData && apiData["network_weights"]) {
    try {
      weights = JSON.parse(apiData["network_weights"]);
    } catch (error) {
      console.error("Error parsing JSON:", error);
    }
    try {
    max = weights.reduce((max, part) => Math.max(max, part.reduce((subMax, arr) => Math.max(subMax, ...arr.map(Number)), 0)), 0);
    min = weights.reduce((min, part) => Math.min(min, part.reduce((subMin, arr) => Math.min(subMin, ...arr.map(Number)), Infinity)), Infinity);
    absMax = Math.max(Math.abs(max), Math.abs(min));
    }
    catch (error) {
      console.error("Error processing max and min weights:", error);
    }
  }

  let cumulativeSums = list.reduce((acc, curr, i) => {
    acc[i] = (acc[i-1] || 0) + curr;
    return acc;
  }, []);

  list.forEach((nodesPerLayer, i) => {
    for (let j = 0; j < nodesPerLayer; j++) {
      let source;
      if (i > 0) {
        source = cumulativeSums[i-1] + j;
      } else {
        source = j;
      }
      for (let k = 0; k < list[i+1]; k++) {
        const target = cumulativeSums[i] + k;
        if (target <= cElements.length) {
          let weight = 5;
          if (apiData && apiData["network_weights"] && isTraining === 2) { 
            try {
              weight = parseFloat(weights[i][k][j])/absMax;
            }
            catch (error) {
              console.log(error);
            }
          }
          cElements.push({ data: { source, target, weight } });
        }
      }
    }
  });

  return cElements;
}

// function to generate cytoscape style
function generateCytoStyle(list = []) {
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
        'line-color': ele => ele.data('weight') !== 5 ? colorScale(ele.data('weight')).toString() : '#666',
        'width': ele => ele.data('weight') !== 5 ? Math.abs(ele.data('weight'))*2 : 1,
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
  
  // eslint-disable-next-line no-unused-vars
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

  // Define the functions to fetch API data
  const fetchTrainingData = (apiData, setApiData, setAccuracy, setIsTraining, taskId, index) => {
    var userId = getCookie('user_id');
    var csrftoken = getCookie('csrftoken');

    axios.get(window.location.origin + `/api/backend/?user_id=${userId}&task_id=${taskId}`, {
      headers: {
        'X-CSRFToken': csrftoken
      }
    })
      .then((response) => {
        setApiData(prevApiData => {
          const newApiData = [...prevApiData];
          newApiData[index] = response.data[0];
          return newApiData;
        });
        setAccuracy(prevAccuracy => {
          const newAccuracy = [...prevAccuracy];
          newAccuracy[index] = parseFloat(JSON.parse(response.data[0]["error_list"])[1]);
          return newAccuracy;
        });
        console.log(response.data[0]);
      })
      .catch((error) => {
        console.log(`Error fetching API data: ${error}`);
      });
    setTimeout(() => {
      setIsTraining(prevIsTraining => {
        const newIsTraining = [...prevIsTraining];
        newIsTraining[index] = 2;
        return newIsTraining;
      });
      console.log("Training finished")
    }, 1000);
  };

  const fetchQueryResponse = (setApiData, setIsResponding, taskId, index) => {
    var userId = getCookie('user_id');
    var csrftoken = getCookie('csrftoken');

    axios.get(window.location.origin + `/api/backend/?user_id=${userId}&task_id=${taskId}`, {
      headers: {
        'X-CSRFToken': csrftoken
      }
    })
      .then((response) => {
        setApiData(prevApiData => {
          const newApiData = [...prevApiData];
          newApiData[index] = response.data[0];
          return newApiData;
        });
        console.log(response.data[0]);
      })
      .catch((error) => {
        console.log(`Error fetching API data: ${error}`);
      });
    setIsResponding(prevIsResponding => {
        const newIsResponding = [...prevIsResponding];
        newIsResponding[index] = 2;
        return newIsResponding;
      });
    console.log("Training finished")
  };

  let accuracyColor = 'var(--slate-11)';

  // ------- CYTOSCAPE EDITING -------
  const taskIds = useMemo(() => [11, 12, 13], []);
  const [cytoLayers, setCytoLayers] = useState(taskIds.map(() => []));
  const [isTraining, setIsTraining] = useState(taskIds.map(() => false));
  const [apiData, setApiData] = useState(taskIds.map(() => null));
  const [accuracy, setAccuracy] = useState(taskIds.map(() => 0));
  const [isResponding, setIsResponding] = useState(taskIds.map(() => false));
  
  useEffect(() => {
    cytoLayers.forEach((cytoLayer, index) => {
      localStorage.setItem(`cytoLayers${taskIds[index]}`, JSON.stringify(cytoLayer));
      setIsTraining(prevIsTraining => {
        const newIsTraining = [...prevIsTraining];
        newIsTraining[index] = 0;
        return newIsTraining;
      });
    });
  }, [cytoLayers, taskIds]);

  
  const loadLastCytoLayers = (setCytoLayers, apiData, setApiData, propertyName, taskId, index) => {
    // Check localStorage for a saved setting
    const savedSetting = localStorage.getItem(propertyName);
    let goToStep2 = false;
  
    if (savedSetting && savedSetting !== '[]') {
        try {
            // If a saved setting is found, try to parse it from JSON
            const cytoLayersSetting = JSON.parse(savedSetting);
            // try to set the cytoLayers to the saved setting, if there is an error, set it to default
            setCytoLayers(prevCytoLayers => {
              const newCytoLayers = [...prevCytoLayers];
              newCytoLayers[index] = cytoLayersSetting;
              return newCytoLayers;
            });
        }
        catch (error) {
            console.log(error);
            goToStep2 = true;
        }
    }
    else {goToStep2 = true;};

    var userId = getCookie('user_id');
    var csrftoken = getCookie('csrftoken');

    if (goToStep2) {
      axios.get(window.location.origin + `/api/backend/?user_id=${userId}&task_id=${taskId}`, {
        headers: {
          'X-CSRFToken': csrftoken
        }
      })
      .then((response) => {
          try {
            setApiData(prevApiData => {
              const newApiData = [...prevApiData];
              newApiData[index] = response.data[0];
              return newApiData;
            });
            console.log("apiData:");
            console.log(response.data[0]);
            if (typeof response.data[0] === 'undefined') {
              throw new Error('response.data[0] is undefined');
            }
            setCytoLayers(prevCytoLayers => {
              const newCytoLayers = [...prevCytoLayers];
              newCytoLayers[index] = JSON.parse(response.data[0]["network_setup"]);
              return newCytoLayers;
            });
          }
          catch (error) {
            console.log(error);
            console.log("setting cytoLayers to default");
            setCytoLayers(prevCytoLayers => {
              const newCytoLayers = [...prevCytoLayers];
              newCytoLayers[index] = [4, 7, 7, 3];
              return newCytoLayers;
            });
            console.log("done doing that, this is what cytoLayers are now: ", cytoLayers);
          }
      })
      .catch((error) => {
        console.log(error);
      });
    }
  };

  const [cytoElements, setCytoElements] = useState([]);
  const [cytoStyle, setCytoStyle] = useState([]);

  // Update the state when the dependencies change
  useEffect(() => {
    setCytoElements(taskIds.map((taskId, index) => 
      generateCytoElements(cytoLayers[index], apiData[index], isTraining[index])
    ));
    console.log("cytoLayers:", cytoLayers);
  }, [taskIds, cytoLayers, apiData, isTraining]);

  useEffect(() => {
    setCytoStyle(taskIds.map((taskId, index) => 
      generateCytoStyle(cytoLayers[index])
    ));
  }, [taskIds, cytoLayers]);

  // function to add a layer
  const addLayer = useCallback((setCytoLayers, nOfOutputs, index) => {
    setCytoLayers(prevLayers => {
      const newLayers = [...prevLayers];
      if (newLayers[index].length < 10) {newLayers[index].push(nOfOutputs)};
      return newLayers;
    });
  }, []);

  // function to remove a layer
  const removeLayer = useCallback((setCytoLayers, index) => {
    setCytoLayers(prevLayers => {
      const newLayers = [...prevLayers];
      if (newLayers[index].length > 2) {newLayers[index].splice(-2, 1)}
      return newLayers;
    });
  }, []);

  // function to add a node to a layer
  const addNode = useCallback((column, setCytoLayers, taskId, index) => {
    setCytoLayers(prevLayers => {
      const newLayers = [...prevLayers];
      newLayers[index][column] < 16 ? newLayers[index][column] += 1 : newLayers[index][column] = 16;
      document.getElementById(taskId + "-input" + column).value = newLayers[index][column];
      return newLayers;
    });
  }, []);

  // function to remove a node from a layer
  const removeNode = useCallback((column, setCytoLayers, taskId, index) => {
    setCytoLayers(prevLayers => {
      const newLayers = [...prevLayers];
      newLayers[index][column] > 1 ? newLayers[index][column] -= 1 : newLayers[index][column] = 1;
      document.getElementById(taskId + "-input" + column).value = newLayers[index][column];
      return newLayers;
    });
  }, []);

  // function to set a custom number of nodes for a layer
  const setNodes = useCallback((column, cytoLayers, setCytoLayers, taskId, index) => {
    var nodeInput = Number(document.getElementById(taskId + "-input" + column).value)
    if (nodeInput && Number.isInteger(nodeInput)) {
      if (nodeInput < 1) {
        nodeInput = 1;
      } else if (nodeInput > 16) {
        nodeInput = 16;
      }
      setCytoLayers(prevLayers => {
        const newLayers = [...prevLayers];
        newLayers[index][column] = nodeInput;
        return newLayers;
      });
    } else {
      nodeInput = cytoLayers[index][column];
    }
    document.getElementById(taskId + "-input" + column).value = nodeInput;
  }, []);



  // ------- POST REQUEST -------
  const putRequest = (e, cytoLayers, apiData, setApiData, setAccuracy, setIsTraining, learningRate, iterations, taskId, index) => {
    e.preventDefault();
    var userId = getCookie('user_id');
    var csrftoken = getCookie('csrftoken');

    const progressData = {
      user_id: userId,
      task_id: taskId,
      progress: -1,
      error_list: JSON.stringify([]),
      plots: JSON.stringify([]),
    };
    axios.get(window.location.origin + `/api/progress/?user_id=${userId}&task_id=${taskId}`, {
      headers: {
        'X-CSRFToken': csrftoken
      }
    }).then((response) => {
      if (response.data.length > 0) {
          // If the record exists, update it
          let pk = response.data[0].pk;
          axios.put(window.location.origin + `/api/progress/${pk}`, progressData, {
            headers: {
              'X-CSRFToken': csrftoken
            }
          }).then((response) => {
              console.log(response.status);
              console.log(response.data[0]);
          }, (error) => {
              console.log(error);
          });
      } else {
          // If the record doesn't exist, create it
          axios.post(window.location.origin + "/api/progress/", progressData, {
            headers: {
              'X-CSRFToken': csrftoken
            }
          }).then((response) => {
              console.log(response.status);
              console.log(response.data[0]);
          }, (error) => {
              console.log(error);
          });
      }
    }, (error) => {
        console.log(error);
    });

    // Start the interval before making the PUT/POST request
    let intervalId = setInterval(() => {
      axios.get(window.location.origin + `/api/progress/?user_id=${userId}&task_id=${taskId}`, {
        headers: {
          'X-CSRFToken': csrftoken
        }
      }).then((response) => {
        //  fetchProgressData(response.data);  // we need to define fetchProgressData but also make sure it actually gets used
      }, (error) => {
        console.log(error);
      });
    }, 1000); // 1000 milliseconds = 1 second

    const trainingData = {
      action: 1,
      user_id: userId,
      task_id: taskId,
      learning_rate: learningRate,
      epochs: iterations,
      normalization: true, // 0 means no normalization, 1 means normalization
      network_setup: JSON.stringify(cytoLayers),
      network_weights: JSON.stringify([]),
      network_biases: JSON.stringify([]),
      nn_input: JSON.stringify([]),
      error_list: JSON.stringify([]),
    };
    setAccuracy(prevAccuracy => {
      const newAccuracy = [...prevAccuracy];
      newAccuracy[index] = null;
      return newAccuracy;
    });
    setIsTraining(prevIsTraining => {
      const newIsTraining = [...prevIsTraining];
      newIsTraining[index] = 1;
      return newIsTraining;
    });
    axios.get(window.location.origin + `/api/backend/?user_id=${userId}&task_id=${taskId}`, {
      headers: {
        'X-CSRFToken': csrftoken
      }
    }).then((response) => {
      if (response.data.length > 0) {
          // If the record exists, update it
          let pk = response.data[0].pk;
          axios.put(window.location.origin + `/api/backend/${pk}`, trainingData, {
            headers: {
              'X-CSRFToken': csrftoken
            }
          }).then((response) => {
              console.log(response.status);
              fetchTrainingData(apiData, setApiData, setAccuracy, setIsTraining, taskId, index);
          }, (error) => {
              console.log(error);
          }).finally(() => {
            // Stop the interval when the PUT/POST request is completed
            clearInterval(intervalId);
          });
      } else {
          // If the record doesn't exist, create it
          axios.post(window.location.origin + "/api/backend/", trainingData, {
            headers: {
              'X-CSRFToken': csrftoken
            }
          }).then((response) => {
              console.log(response.status);
              fetchTrainingData(apiData, setApiData, setAccuracy, setIsTraining, taskId, index);
          }, (error) => {
              console.log(error);
          });
      }
    }, (error) => {
        console.log(error);
    });
  };


  // ------- FLOATING BUTTONS -------

  // function to generate floating buttons
  function generateFloatingButtons(top, left, dist, isItPlus, nLayers, cytoLayers, setCytoLayers, taskId, index) {
    const buttons = [];
    const icon = isItPlus ? <PlusIcon /> : <MinusIcon />;
    for (let i = 1; i < nLayers-1; i++) {
      const style = { top: top, left: left + i * dist };
      const button = (
        <div>
          <FloatingButton
            variant="outline"
            disabled={(isItPlus && cytoLayers[i] >= 16) | (!isItPlus && cytoLayers[i] < 2)}
            onClick = {isItPlus ? () => addNode(i, setCytoLayers, taskId, index) : () => removeNode(i, setCytoLayers, taskId, index)}
            style={{...style}}
            key={i}
          >
            {icon}
          </FloatingButton>
          {isItPlus &&
          <form>
            <input
            id={taskId + "-input" + i}
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
              fontSize: 'var(--font-size-2)',
              color: 'var(--cyan-12)',
              fontWeight: 'bold'
            }}
            onBlur={() => setNodes(i, setCytoLayers, taskId, index)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                setNodes(i, setCytoLayers, taskId, index);
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

  const handleSubmit = (event, setIsResponding, setApiData, taskId, index) => {
  event.preventDefault();
  setIsResponding(prevIsResponding => {
    const newIsResponding = [...prevIsResponding];
    newIsResponding[index] = 1;
    return newIsResponding;
  });

  var userId = getCookie('user_id');
  var csrftoken = getCookie('csrftoken');

  axios.get(window.location.origin + `/api/backend/?user_id=${userId}&task_id=${taskId}`, {
    headers: {
      'X-CSRFToken': csrftoken
    }
  })
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
      axios.put(window.location.origin + `/api/backend/${networkData.pk}`, networkData, {
        headers: {
          'X-CSRFToken': csrftoken
        }
      })
        .then((response) => {
          console.log(response.status);
          fetchQueryResponse(setApiData, setIsResponding, taskId, index);
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
/*
  const [isMontyPythonLover, setIsMontyPythonLover] = useState(false);

  const MontyPythonSwitch = () => {
    return (
      <Switch.Root className="SwitchRoot" id="monty-python-switch" checked={isMontyPythonLover} onClick={() => setIsMontyPythonLover(!isMontyPythonLover)}>
        <Switch.Thumb className="SwitchThumb" />
      </Switch.Root>
    )
  }
*/


  // ------- SLIDERS -------

  // initialize an array to store the state for each slider
  const [iterations, setIterations] = useState(Array(taskIds.length).fill(200));
  const [learningRate, setLearningRate] = useState(Array(taskIds.length).fill(0.01));

  const handleIterationChange = (index, value) => {
    setIterations(prev => {
      const newIterations = [...prev];
      newIterations[index] = value[0] * 2;
      return newIterations;
    });
  };
  
  const handleLearningRateChange = (index, value) => {
    setLearningRate(prev => {
      const newLearningRates = [...prev];
      newLearningRates[index] = (10 ** ((value[0]/-20)-0.33)).toFixed(Math.round((value[0]+10) / 20));
      return newLearningRates;
    });
  };

  const iterationsSliders = taskIds.map((taskId, index) => {
    return (
      <Slider.Root
        key={index}
        className="SliderRoot"
        defaultValue={[iterations[index]]}
        onValueChange={(value) => handleIterationChange(index, value)}
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
  });

  const learningRateSliders = taskIds.map((challenge, index) => {
    return (
      <Slider.Root
        key={index}
        className="SliderRoot"
        defaultValue={[learningRate[index]]}
        onValueChange={(value) => handleLearningRateChange(index, value)}
        max={70}
        step={10}
        style={{ width: Math.round(0.16 * (window.innerWidth * 0.97)) }}
      >
        <Slider.Track className="SliderTrack" style={{ height: 3 }}>
          <Slider.Range className="SliderRange" />
        </Slider.Track>
        <Slider.Thumb className="SliderThumb" aria-label="Learning Rate" />
      </Slider.Root>
    );
  });


  const updateCytoLayers = (setCytoLayers, nOfInputs, nOfOutputs, index) => {
    setCytoLayers(prevCytoLayers => {
      const newCytoLayers = [...prevCytoLayers];
      newCytoLayers[index] = newCytoLayers[index].map((layer, i) => {
        if (i === 0) {
          return nOfInputs;
        } else if (i === newCytoLayers[index].length - 1) {
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
                <Heading as='h2' size='5' style={{ color: 'var(--slate-12)', marginBottom:10 }}>&gt;_Get Started</Heading>
                <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '15px', alignItems: 'start', justifyContent: 'center'}}>
                <Link to="introduction" style={{ color: 'inherit', textDecoration: 'none' }}>
                    <ChallengeButton size="1" variant="outline">
                    <Flex gap="2" style={{ flexDirection: "column", alignItems: "center"}}>
                        <label>Introduction</label>
                        <div><RocketIcon width="27" height="27" /></div>
                    </Flex>
                    </ChallengeButton>
                </Link>
                <Link to="tutorial" style={{ color: 'inherit', textDecoration: 'none' }}>
                    <ChallengeButton size="1" variant="outline">
                    <Flex gap="2" style={{ flexDirection: "column", alignItems: "center"}}>
                        <label>Tutorial</label>
                        <div><RocketIcon width="27" height="27" /></div>
                    </Flex>
                    </ChallengeButton>
                </Link>
                </Box>
              </Box>
              <Box style={{ border: "solid", borderColor: "var(--slate-8)", borderRadius: "var(--radius-3)", padding: '10px 24px' }}>
                <Heading as='h2' size='5' style={{ color: 'var(--slate-12)', marginBottom:10 }}>&gt;_Level 1</Heading>
                <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '15px', alignItems: 'start', justifyContent: 'center'}}>
                <Link to="challenge11" style={{ color: 'inherit', textDecoration: 'none' }}>
                    <ChallengeButton size="1" variant="outline">
                    <Flex gap="2" style={{ flexDirection: "column", alignItems: "center"}}>
                        <label>Challenge 1</label>
                        <div><RocketIcon width="27" height="27" /></div>
                    </Flex>
                    </ChallengeButton>
                </Link>
                <Link to="challenge12" style={{ color: 'inherit', textDecoration: 'none' }}>
                    <ChallengeButton size="1" variant="outline">
                    <Flex gap="2" style={{ flexDirection: "column", alignItems: "center"}}> 
                        <label>Challenge 2</label>
                        <div><RocketIcon width="27" height="27" /></div>
                    </Flex>
                    </ChallengeButton>
                </Link>
                <Link to="challenge13" style={{ color: 'inherit', textDecoration: 'none' }}>
                    <ChallengeButton size="1" variant="outline">
                    <Flex gap="2" style={{ flexDirection: "column", alignItems: "center"}}>
                        <label>Challenge 3</label>
                        <div><RocketIcon width="27" height="27" /></div>
                    </Flex>
                    </ChallengeButton>
                </Link>
                </Box>
              </Box>
              <Box style={{ border: "solid", borderColor: "var(--slate-8)", borderRadius: "var(--radius-3)", padding: '10px 24px' }}>
                <Heading as='h2' size='5' style={{ color: 'var(--slate-12)', marginBottom:10 }}>&gt;_Level 2</Heading>
                <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '15px', alignItems: 'start', justifyContent: 'center'}}>
                <Link to="challenge11" style={{ color: 'inherit', textDecoration: 'none' }}>
                    <ChallengeButton size="1" variant="outline">
                    <Flex gap="2" style={{ flexDirection: "column", alignItems: "center"}}>
                        <label>Challenge 1</label>
                        <div><RocketIcon width="27" height="27" /></div>
                    </Flex>
                    </ChallengeButton>
                </Link>
                <Link to="challenge12" style={{ color: 'inherit', textDecoration: 'none' }}>
                    <ChallengeButton size="1" variant="outline">
                    <Flex gap="2" style={{ flexDirection: "column", alignItems: "center"}}>
                        <label>Challenge 2</label>
                        <div><RocketIcon width="27" height="27" /></div>
                    </Flex>
                    </ChallengeButton>
                </Link>
                <Link to="challenge13" style={{ color: 'inherit', textDecoration: 'none' }}>
                    <ChallengeButton size="1" variant="outline">
                    <Flex gap="2" style={{ flexDirection: "column", alignItems: "center"}}>
                        <label>Challenge 3</label>
                        <div><RocketIcon width="27" height="27" /></div>
                    </Flex>
                    </ChallengeButton>
                </Link>
                </Box>
              </Box>
              <Box style={{ border: "solid", borderColor: "var(--slate-8)", borderRadius: "var(--radius-3)", padding: '10px 24px' }}>
                <Heading as='h2' size='5' style={{ color: 'var(--slate-12)', marginBottom:10 }}>&gt;_Level 3</Heading>
                <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '15px', alignItems: 'start', justifyContent: 'center'}}>
                <Link to="challenge11" style={{ color: 'inherit', textDecoration: 'none' }}>
                    <ChallengeButton size="1" variant="outline">
                    <Flex gap="2" style={{ flexDirection: "column", alignItems: "center"}}>
                        <label>Challenge 1</label>
                        <div><RocketIcon width="27" height="27" /></div>
                    </Flex>
                    </ChallengeButton>
                </Link>
                <Link to="challenge12" style={{ color: 'inherit', textDecoration: 'none' }}>
                    <ChallengeButton size="1" variant="outline">
                    <Flex gap="2" style={{ flexDirection: "column", alignItems: "center"}}>
                        <label>Challenge 2</label>
                        <div><RocketIcon width="27" height="27" /></div>
                    </Flex>
                    </ChallengeButton>
                </Link>
                <Link to="challenge13" style={{ color: 'inherit', textDecoration: 'none' }}>
                    <ChallengeButton size="1" variant="outline">
                    <Flex gap="2" style={{ flexDirection: "column", alignItems: "center"}}>
                        <label>Challenge 3</label>
                        <div><RocketIcon width="27" height="27" /></div>
                    </Flex>
                    </ChallengeButton>
                </Link>
                </Box>
              </Box>


            {/* NOTE THAT THE 3 LEVELS ARE NOT YET INDEPENDENT AT ALL!!!!!! */}


            </Flex>
            <Box style={{ flex: 1, border: "solid", borderColor: "var(--slate-8)", borderRadius: "var(--radius-3)", padding: '10px 24px' }}>
            <Heading as='h2' size='5' style={{ color: 'var(--slate-12)', marginBottom:7 }}>&gt;_Readme</Heading>
            <Box>
                <Readme />
            </Box>
            </Box>
            </Flex>
          </div>
          } />
          <Route path="/introduction" element={
            <Introduction/>
          } />
          {taskIds.map((taskId, index) => (
            <Route
              key={taskId}
              path={`/challenge${taskId}`}
              element={
                <BuildView
                  nOfInputs={4}
                  nOfOutputs={3}
                  maxLayers={10}
                  taskId={taskId}
                  index={index}
                  cytoElements={cytoElements[index]}
                  cytoStyle={cytoStyle[index]}
                  generateFloatingButtons={generateFloatingButtons}
                  cytoLayers={cytoLayers[index]}
                  setCytoLayers={setCytoLayers}
                  updateCytoLayers={updateCytoLayers}
                  loadLastCytoLayers={loadLastCytoLayers}
                  FloatingButton={FloatingButton}
                  addLayer={addLayer}
                  removeLayer={removeLayer}
                  iterationsSlider={iterationsSliders[index]}
                  iterations={iterations[index]}
                  setIterations={setIterations}
                  learningRateSlider={learningRateSliders[index]}
                  learningRate={learningRate[index]}
                  setLearningRate={setLearningRate}
                  isTraining={isTraining[index]}
                  setIsTraining={setIsTraining}
                  apiData={apiData[index]}
                  setApiData={setApiData}
                  putRequest={putRequest}
                  accuracy={accuracy[index]}
                  setAccuracy={setAccuracy}
                  accuracyColor={accuracyColor}
                  handleSubmit={handleSubmit}
                  isResponding={isResponding[index]}
                  setIsResponding={setIsResponding}
                />
              }
            />
          ))}
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
