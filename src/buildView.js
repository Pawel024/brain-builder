import React from 'react'
import './App.css';
import { Theme, Flex, Box, Tabs, Heading, Grid, IconButton, Separator, Checkbox } from '@radix-ui/themes';
import * as Form from '@radix-ui/react-form';
import '@radix-ui/themes/styles.css';
import tu_delft_pic from "./tud_black_new.png";
import color_scale_pic from "./color_scale_2.png";
import { Link } from 'react-router-dom';
import CytoscapeComponent from 'react-cytoscapejs';
import { PlayIcon, ChevronLeftIcon, ChevronRightIcon, HomeIcon } from '@radix-ui/react-icons';
import Joyride from 'react-joyride';
import { useNavigate } from 'react-router-dom';
import { 
  Chart, 
  CategoryScale, 
  LinearScale, 
  LineController, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import axios from 'axios';

function BuildingWrapper(props) {
  const navigate = useNavigate();

  return <Building {...props} navigate={navigate} />;
}

{/*
// ------- EVENTSOURCE -------
// this listens to the backend and updates the progress, error list, data plots and feature names
function ProgressComponent(setProgress, setFeatureNames) {
  const [errorList, setErrorList] = useState([]);
  const [dataPlots, setDataPlots] = useState([]);

  useEffect(() => {
    const source = new EventSource('/progress');

    source.onmessage = function(event) {
      const progress = JSON.parse(event.data);
      const errorList = JSON.parse(event.data);
      const featureNames = JSON.parse(event.data);
      
      // COMMENT THESE OUT
      const dataPlots = JSON.parse(event.data["dataplots"]).map(base64String => {  
        const binaryString = atob(base64String);  // decode from base64 to binary string
        const bytes = new Uint8Array(binaryString.length);  // convert from binary string to byte array
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);  // now bytes contains the binary image data
        }
        const blob = new Blob([bytes.buffer], { type: 'image/jpeg' });
        const url = URL.createObjectURL(blob);
        // now images can be accessed with <img src={url} />
        return url;
      })
      setDataPlots(dataPlots);
    // END OF COMMENT

      setProgress(progress);
      setErrorList(errorList);
      setFeatureNames(featureNames);
    };

    source.onerror = function(event) {
      if (source.readyState === EventSource.CLOSED) {
        console.log("SSE connection was lost. Attempting to reconnect...");
        source = new EventSource('/progress');
      }
    };

    // Clean up the event source when the component is unmounted
    return () => {
      source.close();
    };
  }, []);

  return null;
}
*/}

Chart.register(
  CategoryScale, 
  LinearScale, 
  LineController, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend
);
class Building extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      printedDescription: '',
      runTutorial: false,
      steps: [
        {
          target: '.buildBody',
          content: 'Welcome to the Building View! This is where you can build and test your own neural networks. The next sections will contain challenges for you to solve with these tools, so make sure you pay attention! You can always come back to this tutorial if you need to refresh your memory.',
          placement: 'center',
        },
        {
          target: '.cytoscape',
          content: 'This is the neural network you will be building. You can add and remove layers with the buttons on the right. You can also use the + and - buttons below the network to add or remove nodes. Note: the number of nodes in the first and last layers are fixed! They correspond to the size of the input and output vectors respectively.',
        },
        {
          target: '.iterationsSlider',
          content: 'This is the slider to adjust the number of epochs.',
        },
        {
          target: '.learningRateSlider',
          content: 'This is the slider to adjust the learning rate.',
        },
        // Add more steps as needed
      ],
    };
  }

  typeWriter = (txt, speed=15, i=0) => {
    if (i < txt.length) {
      this.setState({ printedDescription: this.state.printedDescription + txt.charAt(i)})
      setTimeout(() => this.typeWriter(txt, speed, i + 1), speed);
    }
  };

  componentDidMount() {
    this.props.loadData(this.props.taskId, this.props.index)  // let the backend load the data, then set the images and feature names
    this.props.loadLastCytoLayers(this.props.setCytoLayers, this.props.apiData, this.props.setApiData, 'cytoLayers' + this.props.taskId, this.props.taskId, this.props.index, this.props.nOfInputs, this.props.nOfOutputs);
    this.props.updateCytoLayers(this.props.setCytoLayers, this.props.nOfInputs, this.props.nOfOutputs, this.props.index);
    if (this.props.taskId === 0) {
      this.setState({ runTutorial: true }, () => {
        // Delay the click on the beacon until after the Joyride component has been rendered
        setTimeout(() => {
          const beacon = document.querySelector('.react-joyride__beacon');
  
          if (beacon) {
            beacon.click();
          }
        }, 0);
      });
    }

    axios.get(window.location.origin + '/api/tasks/?task_id=' + this.props.taskId)
    .then(response => {
      this.typeWriter(response.data.description);
    })
    .catch(error => {
      console.error('Task description error:', error);
    });
  }

  chartRef = React.createRef();
  chartInstance = null;

  componentDidUpdate(prevProps) {
    if (this.chartRef.current) {
      const ctx = this.chartRef.current.getContext('2d');

      if (this.chartInstance && (this.props.errorList[0].slice(0, prevProps.errorList[0].length) === prevProps.errorList[0] && this.props.errorList[0].length !== prevProps.errorList[0].length)) {
        // Update the chart if the error list has changed and is longer than before
        console.log("Updating chart")
        this.chartInstance.data.labels = this.props.errorList[0].map((_, i) => i + 1);
        this.chartInstance.data.datasets[0].data = this.props.errorList[0];
        this.chartInstance.update();
      } else {
        // Destroy the old chart if a different error list was received and a chart exists
        if (this.props.errorList[0].slice(0, prevProps.errorList[0].length) !== prevProps.errorList[0]) {
          // If an old chart exists, destroy it
          if (this.chartInstance) {
            console.log("Destroying old chart")
            this.chartInstance.destroy();
          }
        } 
        // Create a new chart if there is no chart now
        if (this.chartInstance === null) {
          // create a new chart
          console.log("Creating new chart")
          this.chartInstance = new Chart(ctx, {
            type: 'line',
            data: {
              labels: this.props.errorList[0].map((_, i) => i + 1), // Generate labels based on error array length
              datasets: [{
                  label: 'Errors',
                  data: this.props.errorList[0],
                  borderColor: 'rgba(7, 151, 185, 1)',
                  backgroundColor: 'rgba(7, 151, 185, 0.2)',
              }]
            },
            options: {
              scales: {
                  y: {
                      beginAtZero: true
                  }
              },
              animation: {
                duration: 1000 // general animation time
              }
            }  
          });
        }
      }
    }
  }

  handleJoyrideCallback = (data) => {
    const { action, status } = data;

    if (action === 'skip' || status === 'finished') {
      this.props.navigate('/');
    }
  }

  

  render() {

    return(
    <div className='buildBody'>
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
            <Heading as='h1' align='center' size='6' style={{ color: 'var(--gray-1)', marginTop: 2, marginBottom: 0, textDecoration: 'none'}}>brAIn builder</Heading>
          </Link>
          <Box align='end' mr='3' >
            <Link to="https://www.tudelft.nl/en/" target="_blank" style={{ textDecoration: 'none'}}>
              <img src={tu_delft_pic} alt='Tu Delft Logo' width='auto' height='30'/>
            </Link>
          </Box>
        </Grid>
      </Box>

      <Tabs.Root defaultValue={this.props.taskId === 0 ? "building" : "task"} style={{ fontFamily:'monospace' }}>

        <Tabs.List size="2">
          <Tabs.Trigger value="task" >Your Task</Tabs.Trigger>
          <Tabs.Trigger value="building" >Build</Tabs.Trigger>
          <Tabs.Trigger value="stuff">Test</Tabs.Trigger>
          {/*<Tabs.Trigger value="settings">Settings</Tabs.Trigger>*/}
        </Tabs.List>

        <Box px="4" pt="3" pb="0">
        <Tabs.Content value="task">
          <Box style={{ padding: '20px 300px', fontFamily:'monospace' }}>
          <Heading as='h2' size='5' style={{ color: 'var(--slate-12)', marginBottom:7 }}>&gt;_Task Description </Heading>
          <div style={{ textAlign:'justify' }}>{this.state.printedDescription}</div>
          {/* a little below this, plot the dataset */}
          {this.props.initPlot && (
            <>
              <Heading as='h2' size='5' style={{ color: 'var(--slate-12)', marginTop: 20, marginBottom:7 }}>&gt;_The Dataset</Heading>	
              <div style={{ textAlign:'justify' }}>
                This dataset contains {this.props.nOfObjects}, each with {this.props.nOfInputs} features. There are {this.props.nOfOutputs} targets. The features are: {this.props.featureNames.join(', ')}.
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 20 }}></div>
              {console.log("this.props.initPlot", this.props.initPlot)}
              <img src={this.props.initPlot} alt='No data available' width='auto' height='auto' style={{ maxWidth: '100%', maxHeight: '100%' }}/>
            </>
          )}
          </Box>
        </Tabs.Content>
        <Tabs.Content value="building">
          <Box style={{ display: 'flex', alignItems: 'start', justifyContent: 'center', height: '100vh' }}>
            <div className='cytoscape'style={{top: 5, left: 3, position: 'absolute', width: window.innerWidth*0.77, height: window.innerHeight-130}}></div>
            <Flex direction="column" gap="2" height={'100vh'} style={{ alignItems: 'center', justifyContent: 'center'}}>
              <CytoscapeComponent elements={this.props.cytoElements} stylesheet={this.props.cytoStyle} panningEnabled={false} autoungrabify={true} style={ { width: window.innerWidth*0.97, height: window.innerHeight-120, border: "solid", borderColor: "var(--slate-8)", borderRadius: "var(--radius-3)" } } />
              
              <img src={color_scale_pic} alt='Color scale from purple for negative to red for positive' width='20' height='auto' style={{ position: 'absolute', top: 15, left: 15 }}/>

              {this.props.generateFloatingButtons(window.innerHeight - 223, 0.08 * (window.innerWidth * 0.97) - 10, 0.7 * (window.innerWidth * 0.97)/this.props.cytoLayers.length, true, this.props.cytoLayers.length, this.props.cytoLayers, this.props.setCytoLayers, this.props.taskId, this.props.index)}                    
              {this.props.generateFloatingButtons(window.innerHeight - 178, 0.08 * (window.innerWidth * 0.97) - 10, 0.7 * (window.innerWidth * 0.97)/this.props.cytoLayers.length, false, this.props.cytoLayers.length, this.props.cytoLayers, this.props.setCytoLayers, this.props.taskId, this.props.index)}

              <this.props.FloatingButton
                variant="outline"
                onClick = {() => this.props.addLayer(this.props.setCytoLayers, this.props.nOfOutputs, this.props.index, this.props.maxLayers)}
                size="0"
                disabled={this.props.cytoLayers.length>this.props.maxLayers-1}
                style={{top: window.innerHeight*0.285, 
                        left: window.innerWidth*0.74, 
                        position: 'absolute',
                        zIndex: 9999,
                        borderRadius: 'var(--radius-5)',
                        width: 35,
                        height: 60,
                        boxShadow: '0 2px 8px var(--slate-a11)'
                }}
              >
                {<ChevronRightIcon 
                style={{height: 30, width: 30}}
                /> }
              </this.props.FloatingButton>

              <this.props.FloatingButton
                variant="outline"
                onClick = {() => this.props.removeLayer(this.props.setCytoLayers, this.props.index)}
                size="0"
                disabled={this.props.cytoLayers.length<3}
                style= {{ top: window.innerHeight*0.285, 
                          left: window.innerWidth*0.70,
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
              </this.props.FloatingButton>


            </Flex>
          </Box>
          
          <Separator orientation='vertical' style = {{ position:"absolute", top: Math.round(0.03 * (window.innerHeight-140)), left: Math.round(0.8 * (window.innerWidth * 0.97)), height: 0.96 * (window.innerHeight-140) }}/>

          <Box style={{ position:"absolute", top: 0.14 * (window.innerHeight-140), left: Math.round(0.82 * (window.innerWidth * 0.97)), alignItems: 'start', justifyContent: 'end', height: '100vh', fontFamily:'monospace'  }}>
            <div className="iterationsSlider">
              {this.props.iterationsSlider}
            </div>
            <div style={{ position:"absolute", zIndex: 9999, top: -30, left: 0.08 * (window.innerWidth * 0.97), transform: 'translateX(-50%)', fontSize: '14px', color: 'var(--slate-11)', whiteSpace: 'nowrap' }}>Epochs: {this.props.iterations}</div>
          </Box>

          <Box style={{ position:"absolute", top: Math.round(0.26 * (window.innerHeight-140)), left: Math.round(0.82 * (window.innerWidth * 0.97)), alignItems: 'start', justifyContent: 'end', height: '100vh', fontFamily:'monospace'  }}>
            <div className="learningRateSlider">
              {this.props.learningRateSlider}
            </div>
            <div style={{ position:"absolute", zIndex: 9999, top: -30, left: 0.08 * (window.innerWidth * 0.97), transform: 'translateX(-50%)', fontSize: '14px', color: 'var(--slate-11)', whiteSpace: 'nowrap' }}>Learning rate: {this.props.learningRate}</div>
          </Box>
          
          {this.props.taskData[this.props.index]['normalization'] ? (<Checkbox style={{ position:"absolute", top: Math.round(0.4 * (window.innerHeight-140)), left: Math.round(0.82 * (window.innerWidth * 0.97))}}>Normalize training data</Checkbox>):(<div></div>)}

          {/* make the position of the box shift down if normalization is true */}
          <Box style={{ position:"absolute", top: Math.round(0.4 * (window.innerHeight-140)) + (this.props.taskData[this.props.index]['normalization'] ? 50 : 0), left: Math.round(0.82 * (window.innerWidth * 0.97)), alignItems: 'start', justifyContent: 'end', height: '100vh', fontSize: '14px', color: 'var(--slate-11)' }}>
            <div id="/api-data">
              {this.props.isTraining===2 ? (
                <Flex direction='column' >
                  <div style={{ color: this.props.accuracyColor, fontFamily:'monospace' }}><b>Accuracy: {(parseFloat(this.props.errorList[1])*100).toFixed(2)}%</b></div>
                  <canvas ref={this.chartRef} id="myChart" style={{ width: Math.round(0.16 * (window.innerWidth * 0.97)), height: Math.round(0.35 * (window.innerHeight-140)), marginTop:20 }}></canvas>
                </Flex>
              ) : (this.props.isTraining===1 ? (
                <Flex direction= 'column'>
                  <div style={{ fontFamily:'monospace' }}><b>Training: </b></div>
                  <div style={{ fontFamily:'monospace' }}><b>Progress: {(parseFloat(this.state.progress)).toFixed(2)}%</b></div>
                  <canvas ref={this.chartRef} id="myChart" style={{ width: Math.round(0.16 * (window.innerWidth * 0.97)), height: Math.round(0.35 * (window.innerHeight-140)), marginTop:20 }}></canvas>
                </Flex>
              ) : (
                <div style={{ textAlign:'justify', width: Math.round(0.16 * (window.innerWidth * 0.97)), fontFamily:'monospace' }}>
                  {this.props.taskDescription}
                </div>
              )
              )}
            </div>
          </Box>

          <IconButton onClick={(event) => this.props.putRequest(event, this.props.cytoLayers, this.props.apiData, this.props.setApiData, this.props.setAccuracy, this.props.setIsTraining, this.props.learningRate, this.props.iterations, this.props.taskId, this.props.index, this.props.nOfInputs, this.props.nOfOutputs)} variant="solid" style={{ position: 'absolute', transform: 'translateX(-50%)', top: Math.round(0.9 * (window.innerHeight-140)), left: Math.round(0.9 * (window.innerWidth * 0.97)), borderRadius: 'var(--radius-3)', width: Math.round(0.16 * (window.innerWidth * 0.97)), height: 36, fontSize: 'var(--font-size-2)', fontWeight: "500" }}>
            <Flex direction="horizontal" gap="2" style={{alignItems: "center", fontFamily:'monospace' }}>
              <PlayIcon width="18" height="18" />Start training!
            </Flex>
          </IconButton>

        </Tabs.Content>
      
        <Tabs.Content value="stuff">
          <Flex direction="row" gap = "2">
            <Flex direction="column" gap="2">
            
            {/* This will render the form with the feature names received from the backend, if it exists */}
            <Form.Root className="FormRoot" onSubmit={(event) => this.props.handleSubmit(event, this.props.setIsResponding, this.props.setApiData, this.props.taskId, this.props.index)} style={{ fontFamily:'monospace' }}>
              {this.props.featureNames.length > 0 && this.props.featureNames.map((featureName, index) => (
                <Form.Field className="FormField" name={featureName} key={index}>
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                    <Form.Label className="FormLabel">{featureName}</Form.Label>
                    <Form.Message className="FormMessage" match="valueMissing">
                      Please enter the {featureName}
                    </Form.Message>
                    <Form.Message className="FormMessage" match="typeMismatch">
                      Please provide a valid {featureName}
                    </Form.Message>
                  </div>
                  <Form.Control asChild>
                    <input className="FormInput" type="number" required />
                  </Form.Control>
                </Form.Field>
              ))}
              {this.props.featureNames.length > 0 &&
              <Form.Submit asChild>
                <button className="FormButton" style={{ marginTop: 10 }}>
                  Predict!
                </button>
              </Form.Submit>}
            </Form.Root>
            
            {/*  // This is the old form
            <Form.Root className="FormRoot" onSubmit={(event) => this.props.handleSubmit(event, this.props.setIsResponding, this.props.setApiData, this.props.taskId, this.props.index)} style={{ fontFamily:'monospace' }}>
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
                  Predict!
                </button>
              </Form.Submit>
            </Form.Root>
            */}
            
            <div id="query-response" style={{ fontFamily:'monospace' }}>
                {this.props.isResponding===2 ? (
                  <div>Output: {this.props.apiData["network_input"]}</div>
                ) : (this.props.isResponding===1 ? (
                  <div>Getting your reply...</div>
                ) : (
                  <div></div>
                )
                )}
              </div>
            </Flex>
            
            {/* This will render the images, if they exist */}
            <Flex direction="column" gap="2">
              {this.props.imgs.length > 0 ? (
                this.props.imgs.map((img, index) => (
                  <img key={index} src={img} alt={`Image ${index}`} />
                ))
              ) : (
                <div>No data loaded. Try reloading the page? If this problem persists, please contact us.</div>
              )}
            {/* TODO: Only print last image, maybe add button to print all or smth */}
            </Flex>
          </Flex>
        </Tabs.Content>



        {/*<Tabs.Content value="settings">
          <Box style={{ display: 'flex', height: '100vh' }}>
          <form>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <label className="Label" htmlFor="monty-python-mode" style={{ paddingRight: 15 }}>
                Monty Python lover mode
              </label>
              <this.props.MontyPythonSwitch />
            </div>
          </form>
          </Box>
        </Tabs.Content>*/}
        </Box>
        </Tabs.Root>

      <Joyride
        steps={this.state.steps}
        run={this.state.runTutorial}
        continuous={true}
        disableOverlayClose={true}
        disableCloseOnEsc={true}
        disableScrolling={true}
        callback={this.handleJoyrideCallback}
        locale={{ last: 'Finish' }}
      />
      </Theme>
    </div>
  )}
}

export default BuildingWrapper;