/* eslint-disable no-lone-blocks */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import './App.css';
import { Theme, Flex, Box, Heading, Grid, IconButton, Button } from '@radix-ui/themes';
import * as Slider from '@radix-ui/react-slider';
import '@radix-ui/themes/styles.css';
import tu_delft_pic from "./tud_black_new.png";
import { Link, BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { PlusIcon, MinusIcon, RocketIcon, HomeIcon, DrawingPinIcon, Pencil2Icon, Link2Icon } from '@radix-ui/react-icons';
import { styled } from '@stitches/react';
import axios from 'axios';
import BuildView from './buildView';
import BuildViewWithUpload from './customData';
import chroma from 'chroma-js';
import Readme from './readme';
import Introduction from './introduction';
import QuizApp from './quiz';
import CustomBlock from './customBlocks';
import Tutorial from './tutorial';
import FeedbackApp from './feedback';
import LinksPage from './links';


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
  width: 136,   
  height: 84,
  fontSize: 'var(--font-size-2)',
  fontWeight: '500',
  boxShadow: '0 1px 3px var(--slate-a11)'
});

// ------- COOKIE FUNCTION -------
function getCookie(name) {
  var value = "; " + document.cookie;
  var parts = value.split("; " + name + "=");
  if (parts.length === 2) return parts.pop().split(";").shift();
}

// ------- CYTOSCAPE FUNCTIONS -------

// function to generate cytoscape elements
export function generateCytoElements(list, apiData, isTraining, weights, biases) {
  const cElements = [];

  // Generate nodes
  list.forEach((nodesPerLayer, i) => {
    for (let j = 0; j < nodesPerLayer; j++) {
      const id = list.slice(0, i).reduce((acc, curr) => acc + curr, 0) + j;
      const label = `Node ${id}`;
      const wAvailable = 0.4 * (window.innerWidth * 0.97);
      const hAvailable = window.innerHeight - 326;
      const xDistBetweenNodes = wAvailable/Math.max(list.length-1, 1);
      const yDistBetweenNodes = hAvailable/Math.max(...list);
      const position = { x: Math.round((0.5 * window.innerWidth * 0.97) + (i-list.length+1) * xDistBetweenNodes), y: Math.round( 0.5 * (window.innerHeight-140) - 0.5*yDistBetweenNodes - 65 + (-nodesPerLayer) * 0.5 * yDistBetweenNodes + yDistBetweenNodes + j * yDistBetweenNodes) };
      cElements.push({ data: { id, label }, position });
    }
  });

  // Generate lines between nodes
  // let weights;
  let max;
  let min;
  let absMax;
  if (apiData && weights) {
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
          if (apiData && weights.length > 0 && isTraining !== 0) { 
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

  console.log('cElements before return:', cElements)
  return cElements;
}

// function to generate cytoscape style
export function generateCytoStyle(list = []) {
  const nodeSize = 180/Math.max(...list) < 90 ? 180/Math.max(...list) : 90;

  const cStyle = [ // the base stylesheet for the graph
    {
      selector: 'node',
      style: {
        'background-color': '#666',
        'width': nodeSize,
        'height': nodeSize,
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
    // disable both horizontal and vertical scrolling, cut off the overflow
    <Box style={{ overflow: 'hidden', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      <Box style={{ textAlign: 'center', color: 'white' }}>
        <Heading style={{ fontSize:90 }}>404</Heading>
        <p style={{ fontSize:90 }}>Page not found : ( </p>
      </Box>
      {isMontyPythonLover && <img src={require('./monty-python.jpeg')} alt="Monty Python" />}
    </Box>
  );
}


// ------- APP FUNCTION -------

function App() {

    // Setting the interval- and timing-related states
  const cancelTokenSourceRef = useRef(null);
  const intervalIdRef = useRef(null);
  const intervalTimestep = 1000;  // in milliseconds, the time between each progress check -> low values mean low latency but high server load
  const intervalTimeout = 60000;  // in milliseconds, the time to wait before ending the interval
  const pendingTime = 2000;  // in milliseconds, the time to wait when putting or posting a request -> set this close to 0 in production, but higher for debugging

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

  const loadData = (taskId, index, normalization) => {
    var userId = getCookie('user_id');
    var csrftoken = getCookie('csrftoken');

    normalization = false;  // TODO: make this an actual variable

    const dataData = {
      action: 0,
      user_id: userId,
      task_id: taskId,
      learning_rate: 0,
      epochs: 0,
      normalization: normalization, 
      activations_on: true,
      network_input: JSON.stringify([]),
      games_data: gamesData,
    };
    // first, set up the websocket
    const ws = new WebSocket(`wss://${window.location.host}/ws/${userId}/${taskId}/`);

    ws.onclose = () => {
      console.log('WebSocket connection closed');
    };

    ws.onopen = () => {
      console.log('WebSocket connection opened');

      // now, check if there is an entry in /api/backend:
      axios.get(window.location.origin + `/api/backend/?user_id=${userId}&task_id=${taskId}`, {
        headers: {
          'X-CSRFToken': csrftoken
        }
      }).then((response) => {
        if (response.data.length > 0) {
          // If the record exists, update it
          let pk = response.data[0].pk;
          axios.put(window.location.origin + `/api/backend/${pk}`, dataData, {
            headers: {
              'X-CSRFToken': csrftoken
            }, 
            timeout: pendingTime
          }).catch((error) => {
            console.log(error);
          });
        } else {
          // If the record does not exist, throw an error
          throw new Error('No Record in /api/backend');
        };
      }).catch((error) => {
        console.log(error);
        if (error.message === 'No Record in /api/backend' || error.code === 'ECONNABORTED') {
          // If the record doesn't exist or the GET times out, post a new record
          console.log('No record found, creating a new one'); 
          axios.post(window.location.origin + "/api/backend/", dataData, {
            headers: {
              'X-CSRFToken': csrftoken
            }, 
            timeout: pendingTime
          }).catch((error) => {
            console.log(error);
          })
        }
      });
    };
    let timeoutId = setTimeout(() => {
      ws.close();
      console.log('Failed to load data for challenge ' + taskId);
      alert("Failed to load data for challenge " + taskId + ". Try reloading the page, if the problem persists, please contact us.");
    }, intervalTimeout); // stop after n milliseconds

    ws.onmessage = function(event) {
      const data = JSON.parse(event.data);
      if (data.title === "data") { 

        setFeatureNames(prevFeatureNames => {
          const newFeatureNames = [...prevFeatureNames];
          newFeatureNames[index] = data.feature_names;
          return newFeatureNames;
        });

        setNObjects(prevNObjects => {
          const newNObjects = [...prevNObjects];
          newNObjects[index] = data.n_objects;
          return newNObjects;
        });

        // decompress and parse the images in 'plot'
        setInitPlots(prevInitPlots => {
          const newInitPlots = [...prevInitPlots];
          const binaryString = atob(data.plot);  // decode from base64 to binary string
          const bytes = new Uint8Array(binaryString.length);  // convert from binary string to byte array
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);  // now bytes contains the binary image data
          }
          const blob = new Blob([bytes.buffer], { type: 'image/jpeg' });
          const url = URL.createObjectURL(blob);
          // now images can be accessed with <img src={url} />
          newInitPlots[index] = url;
          return newInitPlots;
        });
        console.log(`Data for challenge ${taskId} loaded`)
        ws.close();
        clearTimeout(timeoutId);
      } else {
        console.log("Received unexpected message from backend: ", data);
      }
    };

    ws.onerror = function(event) {
      console.error('Error:', event);
    };
    };

  const fetchQueryResponse = (setApiData, setIsResponding, taskId, index) => {  // updates the apiData state with the response from the backend
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
    console.log("Response received")
  };

  let accuracyColor = 'var(--slate-11)';
  const [taskData, setTaskData] = useState([]);
  const [taskNames, setTaskNames] = useState({})
  const [taskIds, setTaskIds] = useState([]);
  const [customDataIds, setCustomDataIds] = useState([21]);
  const [gamesData, setGamesData] = useState([[]]);
  const [initPlots, setInitPlots] = useState([[]]);
  const [nInputs, setNInputs] = useState([]);
  const [nOutputs, setNOutputs] = useState([]);
  const [nObjects, setNObjects] = useState([]);
  const [maxEpochs, setMaxEpochs] = useState([]);
  const [maxLayers, setMaxLayers] = useState([]);
  const [maxNodes, setMaxNodes] = useState([]);
  const [normalization, setNormalization] = useState([true]);
  const [normalizationVisibility, setNormalizationVisibility] = useState([false]);
  const [afs, setAfs] = useState(Array(taskIds.length).fill(true));
  const [afVisibility, setAfVisibility] = useState([false]);
  const [iterationsSliderVisibility, setIterationsSliderVisibility] = useState([false]);
  const [lrSliderVisibility, setLRSliderVisibility] = useState([false]);
  const [imageVisibility, setImageVisibility] = useState([false]);
  const [cytoLayers, setCytoLayers] = useState([]);
  const [isTraining, setIsTraining] = useState([]);
  const [apiData, setApiData] = useState([]);
  const [accuracy, setAccuracy] = useState([]);
  const [isResponding, setIsResponding] = useState([]);
  // Setting default values for the network-related states
  const [progress, setProgress] = useState(-1);
  const [errorList, setErrorList] = useState([[], null]);
  const [featureNames, setFeatureNames] = useState([]);
  const [weights, setWeights] = useState([]);
  const [biases, setBiases] = useState([]);
  const [imgs, setImgs] = useState([[], [], []]);

  // this is for the quizzes
  const [quizIds, setQuizIds] = useState([]);
  const [quizData, setQuizData] = useState([]);

  // this is for the intros
  const [introIds, setIntroIds] = useState([]);
  const [introData, setIntroData] = useState([]);

  function setAf(index, value) {
    setAfs(prevAfs => {
      const newAfs = [...prevAfs];
      newAfs[index] = value;
      return newAfs;
    });
  };

  // ------- CYTOSCAPE EDITING -------
  const [loadedTasks, setLoadedTasks] = useState(false);
  useEffect(() => {
    axios.get('/api/all_tasks/')
      .then(response => {
        const currentTaskData = response.data;
        currentTaskData.sort((a, b) => a.task_id - b.task_id)// sort the taskData by taskIds
        setTaskData(currentTaskData);
        console.log(currentTaskData);
        
        const currentNInputs = [];
        const currentNOutputs = [];
        const currentMaxEpochs = [];
        const currentMaxLayers = [];
        const currentMaxNodes = [];
        const currentTaskIds = [];
        const currentWeights = [];
        const currentTaskNames = {};

        currentTaskData.forEach(entry => {
          currentNInputs.push(entry.n_inputs);
          currentNOutputs.push(entry.n_outputs);
          currentMaxEpochs.push(entry.max_epochs);
          currentMaxLayers.push(entry.max_layers);
          currentMaxNodes.push(entry.max_nodes);
          currentTaskIds.push(entry.task_id);
          currentWeights.push([]);
          currentTaskNames[entry.task_id] = entry.name;
        });

        setTaskIds(currentTaskIds);
        setGamesData(JSON.stringify(currentTaskData));
        setNInputs(currentNInputs);
        setNOutputs(currentNOutputs);
        setNObjects(currentTaskIds.map(() => 0));
        setMaxEpochs(currentMaxEpochs);
        setMaxLayers(currentMaxLayers);
        setMaxNodes(currentMaxNodes);
        setWeights(currentWeights);
        setTaskNames(currentTaskNames);
        setNormalizationVisibility(currentTaskData.map(entry => entry.normalization_visibility));
        setAfVisibility(currentTaskData.map(entry => entry.af_visibility));
        setIterationsSliderVisibility(currentTaskData.map(entry => entry.iterations_slider_visibility));
        setLRSliderVisibility(currentTaskData.map(entry => entry.lr_slider_visibility));
        setImageVisibility(currentTaskData.map(entry => entry.decision_boundary_visibility));
        setCytoLayers(currentTaskIds.map(() => []));
        setIsTraining(currentTaskIds.map(() => false));
        setApiData(currentTaskIds.map(() => null));
        setAccuracy(currentTaskIds.map(() => 0));
        setIsResponding(currentTaskIds.map(() => false));
        setProgress(currentTaskIds.map(() => 0));
        setErrorList(currentTaskIds.map(() => [[], null]));
        setFeatureNames(currentTaskIds.map(() => []));  // TODO: load these somewhere else
        setBiases(currentTaskIds.map(() => []));
        setImgs(currentTaskIds.map(() => []));
        setInitPlots(currentTaskIds.map(() => []));
        setLoadedTasks(true)
      })
      .catch(error => {
        console.error('Error fetching tasks:', error);
        const defaultTaskIds = [11, 12];
        setTaskIds(defaultTaskIds);
        setGamesData(JSON.stringify([{task_id: 11, n_inputs: 4, n_outputs: 3, type: 1, dataset: 'Clas2.csv'}, {task_id: 12, n_inputs: 4, n_outputs: 3, type: 1, dataset: 'load_iris()'}]));
        setNInputs(defaultTaskIds.map(() => 4));  // TODO: set a default value for this
        setNOutputs(defaultTaskIds.map(() => 3));  // TODO: set a default value for this
        setNObjects(defaultTaskIds.map(() => 0));
        setMaxEpochs(defaultTaskIds.map(() => 200));
        setMaxLayers(defaultTaskIds.map(() => 10));
        setMaxNodes(defaultTaskIds.map(() => 16));
        setCytoLayers(defaultTaskIds.map(() => []));
        setIsTraining(defaultTaskIds.map(() => false));
        setApiData(defaultTaskIds.map(() => null));
        setAccuracy(defaultTaskIds.map(() => 0));
        setIsResponding(defaultTaskIds.map(() => false));
        setProgress(defaultTaskIds.map(() => 0));
        setErrorList(defaultTaskIds.map(() => [[], null]));
        setFeatureNames(defaultTaskIds.map(() => []));  // TODO: load these somewhere else
        setWeights(defaultTaskIds.map(() => []));
        setBiases(defaultTaskIds.map(() => []));
        setImgs(defaultTaskIds.map(() => []));
        console.log("Setting default states instead.")
      });

    axios.get('/api/all_quizzes/')
      .then(response => {
        const currentQuizData = response.data;
        currentQuizData.sort((a, b) => a.quiz_id - b.quiz_id)// sort the quizData by quizIds
        setQuizData(currentQuizData);
        console.log(currentQuizData);
        
        const currentQuizIds = [];

        currentQuizData.forEach(entry => {
          currentQuizIds.push(entry.quiz_id);
        });
        setQuizIds(currentQuizIds);
      })
      .catch(error => {
        console.error('Error fetching quizzes:', error);
        const defaultQuizIds = [];
        setQuizIds(defaultQuizIds);
        console.log("Setting default states instead.")
      });

      axios.get('/api/all_intros/')
      .then(response => {
        const currentIntroData = response.data;
        currentIntroData.sort((a, b) => a.intro_id - b.intro_id)// sort the introData by introIds
        setIntroData(currentIntroData);
        console.log(currentIntroData);
        
        const currentIntroIds = [];

        currentIntroData.forEach(entry => {
          currentIntroIds.push(entry.intro_id);
        });
        setIntroIds(currentIntroIds);
      })
      .catch(error => {
        console.error('Error fetching intros:', error);
        const defaultIntroIds = [];
        setIntroIds(defaultIntroIds);
        console.log("Setting default states instead.")
      });

    /*
    axios.get('/api/all_intros/')
      .then(response => {
        const currentQuizData = response.data;
        currentQuizData.sort((a, b) => a.quiz_id - b.quiz_id)// sort the quizData by quizIds
        setQuizData(currentQuizData);
        console.log(currentQuizData);
        
        const currentQuizIds = [];

        currentQuizData.forEach(entry => {
          currentQuizIds.push(entry.quiz_id);
        });
        setQuizIds(currentQuizIds);
      })
      .catch(error => {
        console.error('Error fetching quizzes:', error);
        const defaultQuizIds = [];
        setQuizIds(defaultQuizIds);
        console.log("Setting default states instead.")
      });
    */

    
  setTimeout(() => alert("Welcome to brAIn bUIlder! This is a beta version, so please know that bugs are possible. We would love to hear your feedback. Have fun!"), 1000);
  

  }, []);
  
  useEffect(() => {  // TODO: figure out what this is doing and if it's necessary
    if (cytoLayers.every(subArray => subArray.length === 0)) {
      console.log("cytoLayers is empty, setting [4, 8, 8, 3]");
      // cytoLayers is empty, set it to a default value
      taskIds.forEach((taskId, index) => {
        localStorage.setItem(`cytoLayers${taskId}`, JSON.stringify([nInputs[index], nOutputs[index]]));
      });
    } else {
      // cytoLayers is not empty, proceed as usual
      cytoLayers.forEach((cytoLayer, index) => {
        localStorage.setItem(`cytoLayers${taskIds[index]}`, JSON.stringify(cytoLayer));
        setIsTraining(prevIsTraining => {
        const newIsTraining = [...prevIsTraining];
        newIsTraining[index] = 0;
        return newIsTraining;
      });
    });
    }
  }, [cytoLayers, taskIds, nInputs, nOutputs]);

  
  const loadLastCytoLayers = (setCytoLayers, apiData, setApiData, propertyName, taskId, index, nInputs, nOutputs) => {
    // Check localStorage for a saved setting
    const savedSetting = localStorage.getItem(propertyName);
    let goToStep2 = false;

    if (savedSetting && savedSetting !== '[]' && !JSON.parse(savedSetting).some(element => element === undefined)) {
        try {
            // If a saved setting is found, try to parse it from JSON
            const cytoLayersSetting = JSON.parse(savedSetting);
            // try to set the cytoLayers to the saved setting, if there is an error, set it to default
            setCytoLayers(prevCytoLayers => {
              const newCytoLayers = [...prevCytoLayers];
              console.log(nInputs)  // for debugging
              console.log("setting cytoLayers to saved setting"); 
              console.log(localStorage.getItem(propertyName));  // for debugging
              newCytoLayers[index] = cytoLayersSetting;
              console.log("saved setting:", cytoLayersSetting);
              // make the number of nodes in the first and last layer match the number of inputs and outputs
              newCytoLayers[index][0] = nInputs;  
              newCytoLayers[index][newCytoLayers[index].length - 1] = nOutputs;
              console.log("new setting: ", newCytoLayers)  // for debugging
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
            setApiData(prevApiData => {
              const newApiData = [...prevApiData];
              newApiData[index] = response.data[0];
              return newApiData;
            });
            console.log("apiData:");
            console.log(response.data[0]);
            if (typeof response.data[0] === 'undefined' || !response.data[0]["network_input"] || JSON.parse(response.data[0]["network_input"]).length === 0) {
              throw new Error('response.data[0] is undefined or network_input is empty');
            }
            setCytoLayers(prevCytoLayers => {
              const newCytoLayers = [...prevCytoLayers];
              newCytoLayers[index] = JSON.parse(response.data[0]["network_input"]);
              // make the number of nodes in the first and last layer match the number of inputs and outputs
              newCytoLayers[index][0] = nInputs;
              newCytoLayers[index][newCytoLayers[index].length - 1] = nOutputs;
              return newCytoLayers;
            });
      })
      .catch((error) => {
        console.log(error);
        console.log("setting cytoLayers to default");  // for debugging
            setCytoLayers(prevCytoLayers => {
              const newCytoLayers = [...prevCytoLayers];
              newCytoLayers[index] = [nInputs, nOutputs];
              return newCytoLayers;
            });
            console.log("done doing that, this is what cytoLayers are now: ", cytoLayers);
      });
    }
  };

  const [cytoElements, setCytoElements] = useState([]);
  const [cytoStyle, setCytoStyle] = useState([]);

  // Update the state when the dependencies change
  useEffect(() => {
    setCytoElements(taskIds.map((taskId, index) => {
      console.log("apiData:", apiData);
      console.log("weights:", weights);
      console.log(`cytoLayers[${index}] before running generateCytoElements:`, cytoLayers[index]);
      return generateCytoElements(cytoLayers[index], apiData[index], isTraining[index], weights[index], biases[index])
    }
    ));
  }, [taskIds, cytoLayers, apiData, isTraining, weights, biases]);

  useEffect(() => {
    setCytoStyle(taskIds.map((taskId, index) => 
      generateCytoStyle(cytoLayers[index])
    ));
  }, [taskIds, cytoLayers]);

  // function to add a layer
  const addLayer = useCallback((setCytoLayers, nOfOutputs, index, max_layers) => {
    setCytoLayers(prevLayers => {
      const newLayers = [...prevLayers];
      console.log("max_layers: ", max_layers);  // for debugging");
      if (newLayers[index].length < max_layers) {newLayers[index].push(nOfOutputs)};
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
  const addNode = useCallback((column, setCytoLayers, taskId, index, max_nodes) => {
    setCytoLayers(prevLayers => {
      const newLayers = [...prevLayers];
      newLayers[index][column] < max_nodes ? newLayers[index][column] += 1 : newLayers[index][column] = max_nodes;
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
    try {
      var nodeInput = Number(document.getElementById(taskId + "-input" + column).value)
    } catch (error) {
      console.log(`Error when getting nodeInput: ${error}`);
      console.log(`taskId + "-input" + column: ${taskId + "-input" + column}`);
    }
    if (nodeInput && Number.isInteger(nodeInput)) {
      if (nodeInput < 1) {
        nodeInput = 1;
      } else if (nodeInput > maxNodes[index]) {
        nodeInput = maxNodes[index];
      }
      try {
        setCytoLayers(prevLayers => {
          const newLayers = [...prevLayers];
          newLayers[index][column] = nodeInput;
          return newLayers;
        });
      } catch (error) {
        console.log(`Error when setting cytoLayers (maybe wrong type?): ${error}`);
      }
    } else {
      nodeInput = cytoLayers[index][column];
      console.log("Invalid input: ", nodeInput);
    }
    document.getElementById(taskId + "-input" + column).value = nodeInput;
  }, [maxNodes]);


  const cancelRequestRef = useRef(null);


  // ------- POST REQUEST -------
  const putRequest = (e, cytoLayers, apiData, setApiData, setAccuracy, setIsTraining, learningRate, iterations, taskId, index, nOfInputs, nOfOutputs, normalization, af) => {
    e.preventDefault();
    if (!learningRate) {learningRate = 0.01};  // set learning rate to default if it's undefined
    if (!iterations) {iterations = 50};  // set learning rate to default if it's undefined
    normalization = false;  // TODO: replace this with the actual normalization value
    if (taskId === 11){
      learningRate = 0.0005;
      normalization = false;
      af = false;
    }
    if (taskId === 12){
      normalization = false;
      af = false;
    }
    var userId = getCookie('user_id');
    var csrftoken = getCookie('csrftoken');

    setProgress(prevProgress => {
      const newProgress = [...prevProgress]; // create a copy of the old progress array
      newProgress[index] = 0; // update the specific element
      return newProgress; // return the new array
    });
    setErrorList(prevErrorList => {
      const newErrorList = [...prevErrorList];
      newErrorList[index] = [[], null];
      return newErrorList;
    });
    setWeights(prevWeights => {
      const newWeights = [...prevWeights];
      newWeights[index] = [];
      return newWeights;
    });
    setBiases(prevBiases => {
      const newBiases = [...prevBiases];
      newBiases[index] = [];
      return newBiases;
    });

    setImgs(prevImgs => {
      const newImgs = [...prevImgs];
      newImgs[index] = [];
      return newImgs;
    });

    {/*
    let flatdata = pako.deflate(jsondata, { to: 'string' });
    // let bs = Array.prototype.reduce.call(flatdata, (acc, byte) => acc + String.fromCharCode(byte), '');
    let b64s = btoa(flatdata);
    console.log("b64s: ", b64s);  // for debugging
    */}
    // make sure the cytoLayers have the right input and output nodes
    cytoLayers[0] = nOfInputs;
    cytoLayers[cytoLayers.length - 1] = nOfOutputs;
    const trainingData = {
      action: 1,
      user_id: userId,
      task_id: taskId,
      learning_rate: parseFloat(learningRate),
      epochs: iterations,
      normalization: normalization,
      activations_on: af,
      network_input: JSON.stringify(cytoLayers),
      games_data: gamesData,  
    };
    console.log("trainingData: ", trainingData);  // for debugging
    setApiData(prevApiData => {
      const newApiData = [...prevApiData];
      newApiData[index] = trainingData;
      return newApiData;
    });
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

    // first, set up the websocket
    if (ws && ws.readyState !== WebSocket.CLOSED) {
      ws.close();
    }    
    const ws = new WebSocket(`wss://${window.location.host}/ws/${userId}/${taskId}/`);

    ws.onclose = () => {
      console.log('WebSocket connection closed');
    };

    let timeoutId = null;

    ws.onerror = function(event) {
      console.error('Error:', event);
      cancelRequest();
      alert("A websocket error occurred. Please try again. If the problem persists, please contact us.");
    };

    ws.onopen = () => {
      console.log('WebSocket connection opened');

      axios.get(window.location.origin + `/api/backend/?user_id=${userId}&task_id=${taskId}`, {
        headers: {
          'X-CSRFToken': csrftoken
        },
        timeout: pendingTime
      }).then((response) => {
        if (response.data.length > 0) {
            // If the record exists, update it
            let pk = response.data[0].pk;
            axios.put(window.location.origin + `/api/backend/${pk}`, trainingData, {
              headers: {
                'X-CSRFToken': csrftoken
              }, 
              timeout: pendingTime
            }).catch((error) => {
                console.log(error);
                if (!axios.isCancel(error) && error.code !== 'ECONNABORTED') {
                  cancelRequest();
                  alert("An axios error occurred. Please try again. If the problem persists, please contact us.");
                }
          });
        } else {
            // If the record does not exist, throw an error
            throw new Error('No Record');
        }
      }).catch((error) => {
          console.log(error);
          if (axios.isCancel(error) || error.message === 'No Record' || error.code === 'ECONNABORTED') {
            console.log('No record found, creating a new one');
            axios.post(window.location.origin + "/api/backend/", trainingData, {
              headers: {
                'X-CSRFToken': csrftoken
              }, 
              timeout: pendingTime
            }).catch((error) => {
                console.log(error);
                if (!axios.isCancel(error) && error.code !== 'ECONNABORTED') {
                  cancelRequest();
                  alert("An axios error occurred. Please try again. If the problem persists, please contact us.");
                }
            })
          } else {
            cancelRequest();
            alert("An axios error occurred. Please try again. If the problem persists, please contact us.");
          }
      })

      timeoutId = setTimeout(() => {
        ws.close();
        setIsTraining(prevIsTraining => {
          const newIsTraining = [...prevIsTraining];
          newIsTraining[index] = 0;
          return newIsTraining;
        });
        console.log("Training failed")
        alert("Training failed. Please try again. If the problem persists, please contact us.");
      }, intervalTimeout); // stop after n milliseconds
    };

    ws.onmessage = function(event) {
      const data = JSON.parse(event.data);
      if (data.title === 'progress') {  // every 1%; includes progress, error_list, and network_weights

        if (JSON.stringify(data.progress) !== JSON.stringify(progress[index])) {
          setProgress(prevProgress => {
            const newProgress = [...prevProgress];
            newProgress[index] = data.progress;
            return newProgress;
          });

          if (data.progress >= 0.98 ) {
            ws.close();
            clearTimeout(timeoutId);
            setIsTraining(prevIsTraining => {
              const newIsTraining = [...prevIsTraining];
              newIsTraining[index] = 2;
              return newIsTraining;
            });
            console.log("Training finished")
          }

          // update the error list if it changed
          if (data.error_list[0].length !== errorList[index][0].length || data.error_list[1] !== errorList[index][1]) {
            console.log("updating error list");  // for debugging
            setErrorList(prevErrorList => {
              const newErrorList = [...prevErrorList];
              newErrorList[index] = data.error_list;
              return newErrorList;
            });
          }
          
          // update the weights if they changed 
          if (weights[index].length === 0 || data.network_weights[0][0] !== weights[index][0][0]) {
            setWeights(prevWeights => {
              const newWeights = [...prevWeights];
              newWeights[index] = data.network_weights;
              return newWeights;
            });
          }
        }
      } else if (data.title === 'update') {  // every 10%; includes network_biases and plots
        // update the biases if it changed
        if (data.network_biases.length !== biases[index].length) {
          setBiases(prevBiases => {
            const newBiases = [...prevBiases];
            newBiases[index] = data.network_biases;
            return newBiases;
          });
        }

        // decompress and parse the images in 'plots', but only if it's not empty or the same as the current imgs
        if (data.plot.length > 0 && data.plot.length !== imgs[index].length) {
          setImgs(prevImgs => {
            const newImgs = [...prevImgs];
            const binaryString = atob(data.plot);  // decode from base64 to binary string
            const bytes = new Uint8Array(binaryString.length);  // convert from binary string to byte array
            for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i);  // now bytes contains the binary image data
            }
            const blob = new Blob([bytes.buffer], { type: 'image/jpeg' });
            const url = URL.createObjectURL(blob);
            // now images can be accessed with <img src={url} />
            newImgs[index] = url
            return newImgs;
          });
        }
      }
    };

    function cancelRequest() {
      if (ws && ws.readyState === WebSocket.OPEN) {
        let message = {'title': 'cancel'};
        ws.send(JSON.stringify(message));
  
        ws.close();
      }
      clearTimeout(timeoutId);
      setIsTraining(prevIsTraining => {
        const newIsTraining = [...prevIsTraining];
        newIsTraining[index] = 0;
        return newIsTraining;
      });
      console.log("Training cancelled")
    };
    cancelRequestRef.current = cancelRequest;

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
            disabled={(isItPlus && cytoLayers[i] >= maxNodes[index]) | (!isItPlus && cytoLayers[i] < 2) | isTraining[index] === 1}
            onClick = {taskId !== 0 ? (isItPlus ? () => addNode(i, setCytoLayers, taskId, index, maxNodes[index]) : () => removeNode(i, setCytoLayers, taskId, index)) : () => {}}
            style={{...style}}
            key={i}
          >
            {icon}
          </FloatingButton>
          {isItPlus &&
          <form>
            {console.log(taskId + "-input" + i)}
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
            onBlur={(taskId !== 0 && isTraining[index] !== 1) ? () => setNodes(i, cytoLayers, setCytoLayers, taskId, index) : () => {}}
            onKeyDown={(event) => {
              if (event.key === "Enter" && taskId !== 0 && isTraining[index] !== 1) {
                event.preventDefault();
                setNodes(i, cytoLayers, setCytoLayers, taskId, index);
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
      networkData.network_input = JSON.stringify(values);
      networkData.action = 2;
      networkData.games_data = gamesData;
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
  const [iterations, setIterations] = useState(Array(taskIds.length).fill(100));
  const [learningRate, setLearningRate] = useState(Array(taskIds.length).fill(0.01));

  console.log("iterations: ", iterations);
  console.log("learningRate: ", learningRate);

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
        defaultValue={[null]} //maxEpochs[index] ? maxEpochs[index] / 4 : 25
        onValueChange={(value) => handleIterationChange(index, value)}
        max={maxEpochs[index] ? maxEpochs[index] / 2 : 50}
        step={0.5}
        style={{ width: Math.round(0.19 * (window.innerWidth * 0.97)) }}
        disabled={isTraining[index] === 1}
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
        defaultValue={[null]} //40
        onValueChange={(value) => handleLearningRateChange(index, value)}
        max={70}
        step={10}
        style={{ width: Math.round(0.19 * (window.innerWidth * 0.97)) }}
        disabled={isTraining[index] === 1}
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

  const tasksByLevel = taskIds.reduce((acc, taskId) => {
    const level = Math.floor(taskId / 10);
    const challenge = taskId % 10;
    if (!acc[level]) {
      acc[level] = [];
    }
    acc[level].push(challenge);
    return acc;
  }, {});

  const quizzesByLevel = quizIds.reduce((acc, quizId) => {
    const level = Math.floor(quizId / 10);
    const challenge = quizId % 10;
    if (!acc[level]) {
      acc[level] = [];
    }
    acc[level].push(challenge);
    return acc;
  }, {});

  const introsByLevel = introIds.reduce((acc, introId) => {
    const level = Math.floor(introId / 10);
    const challenge = introId % 10;
    if (!acc[level]) {
      acc[level] = [];
    }
    acc[level].push(challenge);
    return acc;
  }, {});


  const [levelNames, setLevelNames] = useState(["Regression", "Classification", "Hyperparameters", "Preprocessing"]);
  const [tutorialDescription, setTutorialDescription] = useState("This would normally be a task description, but we are in a tutorial, so instead you can read a few cool facts. Did you know that snails have teeth? Also, the shortest war in history lasted 38 minutes and bananas are technically berries.");

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
                <Box style={{ flex:1 }}/>
                <Link to={window.location.origin} style={{ flex:1, textDecoration: 'none' }}>
                <Heading as='h1' align='center' size='6' style={{ color: 'var(--gray-1)', marginTop: 2, marginBottom: 0, textDecoration: 'none', fontFamily:'monospace, Courier New, Courier' }}><b>brAIn builder</b></Heading>
                </Link>
                <Box align='end' mr='3' style={{ flex:1 }}>
                    <Link to="https://www.tudelft.nl/en/" target="_blank" style={{ textDecoration: 'none'}}>
                    <img src={tu_delft_pic} alt='Tu Delft Logo' width='auto' height='30'/>
                    </Link>
                </Box>
            </Grid>
            </Box>
            <Flex direction='row' gap='3' style={{padding:'10px 10px', alignItems: 'flex-start' }}>
            <Flex direction='column' gap='3' style={{ flex:1 }}>
              <Box style={{ border: "2px solid", borderColor: "var(--slate-8)", borderRadius: "var(--radius-3)", padding: '10px 24px' }}>
                <Heading as='h2' size='5' style={{ color: 'var(--slate-12)', marginBottom:10 }}>&gt;_Get Started</Heading>
                <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(136px, 136px))', gap: '15px', alignItems: 'start', justifyContent: 'start'}}>
                <Link to="tutorial" style={{ color: 'inherit', textDecoration: 'none' }}>
                    <ChallengeButton size="1" variant="outline">
                    <Flex gap="2" style={{ flexDirection: "column", alignItems: "center"}}>
                        <label>Tutorial</label>
                        <div><RocketIcon width="27" height="27" /></div>
                    </Flex>
                    </ChallengeButton>
                </Link>
                <Link to="custom11" style={{ color: 'inherit', textDecoration: 'none' }}>
                  <ChallengeButton size="1" variant="outline">
                    <Flex gap="2" style={{ flexDirection: "column", alignItems: "center"}}>
                      <label>The Perceptron 1</label>
                      <div><RocketIcon width="27" height="27" /></div>
                    </Flex>
                  </ChallengeButton>
                </Link>  
                </Box>
              </Box>
              {Object.entries(tasksByLevel).map(([level, challenges]) => (
                <Box key={level} style={{ border: "2px solid", borderColor: "var(--slate-8)", borderRadius: "var(--radius-3)", padding: '10px 24px' }}>
                  <Heading as='h2' size='5' style={{ color: 'var(--slate-12)', marginBottom:10 }}>&gt;_Level {level} - {levelNames[level-1]}</Heading>
                  <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(136px, 136px))', gap: '15px', alignItems: 'start', justifyContent: 'start'}}>
                    
                    {introsByLevel[level] && introsByLevel[level].map((intro, index) => (
                      <>
                      { introData.find(entry => entry.intro_id === 10*level+intro).visibility &&
                      <Link to={`introduction${level}${intro}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                      <ChallengeButton size="1" variant="outline">
                      <Flex gap="2" style={{ flexDirection: "column", alignItems: "center"}}>
                          <label>Key Concepts</label>
                          <div><DrawingPinIcon width="30" height="30" /></div>
                      </Flex>
                      </ChallengeButton>
                    </Link>
                      }
                      </>
                    ))}
                    {challenges.map((challenge, index) => (
                      <Link key={index} to={`challenge${level}${challenge}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                        <ChallengeButton size="1" variant="outline">
                          <Flex gap="2" style={{ flexDirection: "column", alignItems: "center"}}>
                            <label>{taskNames[`${level}${challenge}`]}</label>
                            <div><RocketIcon width="27" height="27" /></div>
                          </Flex>
                        </ChallengeButton>
                      </Link>
                    ))}

                    {/*challenges.map((challenge, index) => (
                      <Link key={index} to={`customData${level}${challenge}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                        <ChallengeButton size="1" variant="outline">
                          <Flex gap="2" style={{ flexDirection: "column", alignItems: "center"}}>
                            <label>{taskNames[`${level}${challenge}`]}</label>
                            <div><RocketIcon width="27" height="27" /></div>
                          </Flex>
                        </ChallengeButton>
                      </Link>
                    ))*/}

                    {quizzesByLevel[level] && quizzesByLevel[level].map((quiz, index) => (
                      <>
                      { quizData.find(entry => entry.quiz_id === 10*level+quiz).visibility &&
                      <Link to={`quiz${level}${quiz}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                        <ChallengeButton size="1" variant="outline">
                          <Flex gap="2" style={{ flexDirection: "column", alignItems: "center"}}>
                            <label>Quiz</label>
                            <div><Pencil2Icon width="27" height="27" /></div>
                          </Flex>
                        </ChallengeButton>
                      </Link>
                      }
                      </>
                    ))}
                  </Box>
                </Box>
              ))} 
              <Box style={{ border: "2px solid", borderColor: "var(--slate-8)", borderRadius: "var(--radius-3)", padding: '10px 24px' }}>
                <Heading as='h2' size='5' style={{ color: 'var(--slate-12)', marginBottom:10 }}>&gt;_Wrapping Up</Heading>
                <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(136px, 136px))', gap: '15px', alignItems: 'start', justifyContent: 'start'}}>
                  <Link to='feedback' style={{ color: 'inherit', textDecoration: 'none' }}>
                    <ChallengeButton size="1" variant="outline">
                      <Flex gap="2" style={{ flexDirection: "column", alignItems: "center"}}>
                        <label>Give Feedback</label>
                        <div><Pencil2Icon width="27" height="27" /></div>
                      </Flex>
                    </ChallengeButton>
                  </Link>
                <Link to='links' style={{ color: 'inherit', textDecoration: 'none' }}>
                  <ChallengeButton size="1" variant="outline">
                    <Flex gap="2" style={{ flexDirection: "column", alignItems: "center"}}>
                      <label>Useful Links</label>
                      <div><Link2Icon width="27" height="27" /></div>
                    </Flex>
                  </ChallengeButton>
                </Link>  
                </Box>
              </Box>
            </Flex>
            <Flex direction='column' gap='3' style={{ flex: 1 }}>
              <Box style={{ flex: 1, border: "2px solid", borderColor: "var(--slate-8)", borderRadius: "var(--radius-3)", padding: '10px 30px' }}>
                <Heading as='h2' size='5' style={{ color: 'var(--slate-12)', marginBottom:7 }}>&gt;_Readme</Heading>
                <Box>
                    <Readme file="README.md"/>
                </Box>
              </Box>
            </Flex>
            </Flex>
          </div>
          } />
          
          {introIds.map((introId, index) => (
            <>
            { introData[index].visibility &&
              <Route path={`/introduction${introId}`} element={
                <Introduction introId={introId}/>
              } />
            }
            </>
          ))}

          <Route path="/tutorial" element={
            <Tutorial
              nOfInputs={4}
              nOfOutputs={3}
              maxLayers={10}
              taskId={0}
              index={null}
              generateFloatingButtons={generateFloatingButtons}
              updateCytoLayers={null}
              loadLastCytoLayers={null}
              FloatingButton={FloatingButton}
              addLayer={null}
              removeLayer={null}
              iterations={null}
              setIterations={null}
              learningRate={null}
              setLearningRate={null}
              isTraining={0}
              setIsTraining={null}
              apiData={null}
              setApiData={null}
              taskData={null}
              setTaskData={null}
              putRequest={null}
              accuracy={null}
              setAccuracy={null}
              accuracyColor={accuracyColor}
              handleSubmit={null}
              isResponding={null}
              setIsResponding={null}
              progress={null}
              featureNames={null}
              errorList={null}
              img={null}
              loadData={null}
              normalization={null}
              normalizationVisibility={true}
              af={null}
              afVisibility={true}
              iterationsSliderVisibility={true}
              lrSliderVisibility={true}
              initPlot={null}
              setProgress={null}
              setErrorList={null}
              setWeights={null}
              setBiases={null}
            />
          }/>

          <Route path="/custom11" element={
            <CustomBlock
            host = {window.location.host}
            customId = {11}
            userId = {getCookie('user_id')}
            />
          } />

          {taskIds.map((taskId, index) => (
            <>
            <Route
              key={taskId}
              path={`/challenge${taskId}`}
              element={
                <>
                <BuildView
                  nOfInputs={nInputs[index]}
                  nOfOutputs={nOutputs[index]}
                  nOfObjects={nObjects[index]}
                  maxLayers={maxLayers[index]}
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
                  taskData={taskData}
                  setTaskData={setTaskData}
                  putRequest={putRequest}
                  accuracy={accuracy[index]}
                  setAccuracy={setAccuracy}
                  accuracyColor={accuracyColor}
                  handleSubmit={handleSubmit}
                  isResponding={isResponding[index]}
                  setIsResponding={setIsResponding}
                  progress={progress[index]}
                  featureNames={featureNames[index]}
                  errorList={errorList[index]}
                  weights={weights[index]}
                  biases={biases[index]}
                  img={imgs[index]}
                  initPlot={initPlots[index]}
                  loadData={loadData}
                  normalization={false}
                  normalizationVisibility={normalizationVisibility[index]}
                  af={afs[index]}
                  setAf={setAf}
                  afVisibility={afVisibility[index]}
                  iterationsSliderVisibility={iterationsSliderVisibility[index]}
                  lrSliderVisibility={lrSliderVisibility[index]}
                  imageVisibility={imageVisibility[index]}
                  setProgress={setProgress}
                  setErrorList={setErrorList}
                  setWeights={setWeights}
                  setBiases={setBiases}
                  cancelRequest={cancelRequestRef.current}
                />
                </>
              }
            />
            <Route
              key={taskId}
              path={`/customData${taskId}`}
              element={
                <>
                <BuildViewWithUpload
                  nOfInputs={nInputs[index]}
                  nOfOutputs={nOutputs[index]}
                  nOfObjects={nObjects[index]}
                  maxLayers={maxLayers[index]}
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
                  taskData={taskData}
                  setTaskData={setTaskData}
                  putRequest={putRequest}
                  accuracy={accuracy[index]}
                  setAccuracy={setAccuracy}
                  accuracyColor={accuracyColor}
                  handleSubmit={handleSubmit}
                  isResponding={isResponding[index]}
                  setIsResponding={setIsResponding}
                  progress={progress[index]}
                  featureNames={featureNames[index]}
                  errorList={errorList[index]}
                  weights={weights[index]}
                  biases={biases[index]}
                  img={imgs[index]}
                  initPlot={initPlots[index]}
                  loadData={loadData}
                  normalization={false}
                  normalizationVisibility={normalizationVisibility[index]}
                  af={afs[index]}
                  setAf={setAf}
                  afVisibility={afVisibility[index]}
                  iterationsSliderVisibility={iterationsSliderVisibility[index]}
                  lrSliderVisibility={lrSliderVisibility[index]}
                  imageVisibility={imageVisibility[index]}
                  setProgress={setProgress}
                  setErrorList={setErrorList}
                  setWeights={setWeights}
                  setBiases={setBiases}
                  cancelRequest={cancelRequestRef.current}
                />
                </>
              }
            />
            </>
          ))}
          {quizIds.map((quizId, index) => (
            <>
            { quizData[index].visibility &&
            <Route
            key={quizId}
            path={`/quiz${quizId}`}
            element={
              <div className="App">
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
                <QuizApp quizId={quizId} />
              </div>
            }/>
            }
            </>
          ))}

          <Route path={`/feedback`} element={
            <div className="App">
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
            <FeedbackApp host={window.location.origin} cookie={getCookie('csrftoken')} />
          </div>
          } />
          <Route path={`/links`} element={
            <LinksPage/>
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


/*
            <Box style={{ border: "2px solid", borderColor: "var(--slate-8)", borderRadius: "var(--radius-3)", padding: '10px 24px' }}>
                <Heading as='h2' size='5' style={{ color: 'var(--slate-12)', marginBottom:10 }}>&gt;_Get Started</Heading>
                <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '8px', alignItems: 'start', justifyContent: 'center'}}>
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
              <Box style={{ border: "2px solid", borderColor: "var(--slate-8)", borderRadius: "var(--radius-3)", padding: '10px 24px' }}>
                <Heading as='h2' size='5' style={{ color: 'var(--slate-12)', marginBottom:10 }}>&gt;_Level 1</Heading>
                <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '8px', alignItems: 'start', justifyContent: 'center'}}>
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
              <Box style={{ border: "2px solid", borderColor: "var(--slate-8)", borderRadius: "var(--radius-3)", padding: '10px 24px' }}>
                <Heading as='h2' size='5' style={{ color: 'var(--slate-12)', marginBottom:10 }}>&gt;_Level 2</Heading>
                <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '8px', alignItems: 'start', justifyContent: 'center'}}>
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
              <Box style={{ border: "2px solid", borderColor: "var(--slate-8)", borderRadius: "var(--radius-3)", padding: '10px 24px' }}>
                <Heading as='h2' size='5' style={{ color: 'var(--slate-12)', marginBottom:10 }}>&gt;_Level 3</Heading>
                <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '8px', alignItems: 'start', justifyContent: 'center'}}>
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
            */