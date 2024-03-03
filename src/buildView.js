import React from 'react'
import './App.css';
import { Theme, Flex, Box, Tabs, Heading, Grid, IconButton, Separator, Checkbox, Text, Button } from '@radix-ui/themes';
import * as Form from '@radix-ui/react-form';
import horizontalCss from './horizontalSlides.css';
import '@radix-ui/themes/styles.css';
import tu_delft_pic from "./tud_black_new.png";
import color_scale_pic from "./color_scale_2.png";
import Slider from 'react-animated-slider';
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
import { interpolate } from 'chroma-js';
import { PrismAsync } from 'react-syntax-highlighter';

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
      description: [['title', 'some text'], ['another title', 'some more text, actually this is gonna be such a super duper long paragraph of text cause I wanna see how it behaves when the box overflows, are we there yet? Is this enough? ']],
      printedDescription: '',
      runTutorial: false,
      currentSlide: 0,
      activeTab: 'building',
      steps: [
        {
          target: '.buildBody',
          content: 'Welcome to the Building View! This is where you can build and test your own neural networks.',
          placement: 'center',
        },
        {
          target: '.cytoscape',
          content: 'This is the neural network you will be building. You can add and remove layers with the buttons on the right. You can also use the + and - buttons below the network to add or remove nodes.',
        },
        {
          target: '.iterationsSlider',
          content: 'This is the slider to adjust the number of epochs. Put simply: the more epochs, the more your network will learn. But be careful, too many epochs can lead to overfitting!',
        },
        {
          target: '.learningRateSlider',
          content: 'This is the slider to adjust the learning rate. Put simply: the lower the learning rate, the less the network will adjust itself at every step.',
        },
        // Add more steps as needed
      ],
    };
  }
  shortDescription = 'Please reload the page to load the task description';

  handleTabChange = (value) => {
    this.setState({ activeTab: value });
    console.log("Tab changed to " + value) // for debugging
  };

  typeWriter = (txt, speed=15, i=0) => {
    if (i < txt.length) {
      this.setState({ printedDescription: this.state.printedDescription + txt.charAt(i)})
      setTimeout(() => this.typeWriter(txt, speed, i + 1), speed);
    }
  };

  componentDidMount() {
    axios.get(window.location.origin + '/api/tasks/?task_id=' + this.props.taskId)
    .then(response => {
      this.shortDescription = response.data.short_description;
      if (response.data.description[0] === '[') {
        this.setState({ description: JSON.parse(response.data.description) });
        console.log("Attempting to set the array")
      } else {
        if (response.data.description[0] === '*') {
          this.typeWriter(response.data.description);  // this works
        } else {
          console.log("Attempting to convert to array")
          this.createDescriptionList(response.data.description);
        }
      }
      this.continueComponentDidMount();
    })
    .catch(error => {
      console.error('Task description error:', error);
      this.typeWriter("There was an error loading the task description. Please try reloading the paper or contact us");
      this.continueComponentDidMount();
    });
  }

  continueComponentDidMount = () => {
    if (this.props.taskId === 0) {
      console.log("Running tutorial")
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
    else {
    this.props.loadData(this.props.taskId, this.props.index)  // let the backend load the data, then set the images and feature names
    this.props.loadLastCytoLayers(this.props.setCytoLayers, this.props.apiData, this.props.setApiData, 'cytoLayers' + this.props.taskId, this.props.taskId, this.props.index, this.props.nOfInputs, this.props.nOfOutputs);
    this.props.updateCytoLayers(this.props.setCytoLayers, this.props.nOfInputs, this.props.nOfOutputs, this.props.index);
    }
  }

  chartRef = React.createRef();
  chartInstance = null;

  componentDidUpdate(prevProps) {
    if (this.cy) {this.cy.resize();console.log("Resizing cytoscape");} // this seems to do nothing
    if (this.props.taskId !== 0 && this.chartRef.current) {
      const ctx = this.chartRef.current.getContext('2d');

      if (this.chartInstance && (JSON.stringify(this.props.errorList[0].slice(0, prevProps.errorList[0].length)) === JSON.stringify(prevProps.errorList[0]) && this.props.errorList[0].length > prevProps.errorList[0].length)) {
        // Update the chart if the error list has changed and is longer than before
        console.log("Updating chart")
        this.chartInstance.data.labels = this.props.errorList[0].map((_, i) => i + 1);
        this.chartInstance.data.datasets[0].data = this.props.errorList[0];
        this.chartInstance.update();
      } else {
        // Destroy the old chart if a different error list was received and a chart exists
        if (JSON.stringify(this.props.errorList[0].slice(0, prevProps.errorList[0].length)) !== JSON.stringify(prevProps.errorList[0])) {
          // If an old chart exists, destroy it
          if (this.chartInstance) {
            console.log("Destroying old chart")
            this.chartInstance.destroy();
            this.chartInstance = null;
          }
        } 
      }
      // Create a new chart if there is no chart
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
            },
            responsive: false,
            maintainAspectRatio: false,
          }  
        });
      }
    }
  }

  componentWillUnmount() {
    if (this.props.isTraining === 1) {
      this.props.cancelRequest();
    }
  }

  handleJoyrideCallback = (data) => {
    const { action, status } = data;

    if (action === 'skip' || status === 'finished') {
      this.props.navigate('/');
    }
  }

  createDescriptionList = (jsonText) => {
    try {
      const sanitizedJson = jsonText.replace(/<\/?[^>]+(>|$)/g, "")
        .replace(/&/g, "&amp;")
        .replace(/%/g, "&#37;")
        .replace(/#/g, "&#35;")
        .replace(/!/g, "&#33;")
        .replace(/\?/g, "&#63;")
        .replace(/'/g, "&#39;")
        .replace(/"/g, "&quot;");
      const splitText = sanitizedJson.split('\n ');
      const descriptionList = splitText.map(subText => {
        const [subtitle, ...paragraphs] = subText.split('\n');
        const formattedParagraphs = paragraphs.map(paragraph => 
          paragraph.replace(/\*([^*]+)\*/g, '<b>$1</b>')  // bold
          .replace(/_([^_]+)_/g, '<i>$1</i>') // italic
        );
        return [subtitle, ...formattedParagraphs];
      });
      // this.setState({ description: descriptionList }, this.createJoyrideSteps);
      this.setState({ description: descriptionList });
    } catch (error) {
      console.error('Error parsing JSON or formatting description:', error);
    }
  }

  createJoyrideSteps = () => {
    /*
    console.log("Creating new steps: ", this.state.description)
    const stepList = this.state.description.map(([subtitle, ...paragraphs], index) => ({
      target: '.buildBody',
      content: `<h2>${subtitle}</h2> ${paragraphs.map(paragraph => `<p>${paragraph}</p>`).join(' ')}`,
      placement: 'center',
    }));
    console.log("These are the first 3 steps now: ", stepList.slice(0, 3))
    this.setState({ steps: stepList });
    */
  }

  goToSlide = (index) => {
    this.setState({ currentSlide: index });
    console.log("Going to slide " + index)
  };
  

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
          <Heading as='h1' align='center' size='6' style={{ color: 'var(--gray-1)', marginTop: 2, marginBottom: 0, textDecoration: 'none', fontFamily:'monospace, Courier New, Courier' }}>brAIn builder</Heading>
          </Link>
          <Box align='end' mr='3' >
            <Link to="https://www.tudelft.nl/en/" target="_blank" style={{ textDecoration: 'none'}}>
              <img src={tu_delft_pic} alt='Tu Delft Logo' width='auto' height='30'/>
            </Link>
          </Box>
        </Grid>
      </Box>

      <Tabs.Root defaultValue="building" style={{ fontFamily:'monospace' }}>

        <Tabs.List size="2">
          <Tabs.Trigger value="task" onValueChange={this.handleTabChange} >Background Info </Tabs.Trigger>
          <Tabs.Trigger value="building" onValueChange={this.handleTabChange} >Build</Tabs.Trigger>
          <Tabs.Trigger value="stuff" onValueChange={this.handleTabChange} >Result</Tabs.Trigger>
          {/*<Tabs.Trigger value="settings">Settings</Tabs.Trigger>*/}
        </Tabs.List>

        <Box px="4" pt="3" pb="0">
        <Tabs.Content value="task">
          {this.props.taskId !== 0 && (
            <Flex direction="row" gap="2" style={{ overflow: 'auto', fontFamily:'monospace', width: '100%', height: window.innerHeight-72 }}>
              <Box style={{ flexBasis: '60%' }}>
              {this.state.description.length > 0 ? (  
                console.log("Description: ", this.state.description),
                console.log("Current slide: ", this.state.currentSlide),            
                <Flex direction='column' gap='2' style={{ padding: '20px 10px', display: 'flex', justifyContent:"center", alignItems:"center" }}>
                  {/*
                  <Flex direction="column" gap="2" style={{ flexbasis:'30%', justifyContent:"center", alignItems:"center", width:"100%" }}>
                    {this.state.description.map(([subtitle, text], index) => (
                      <Button variant="outline" style={{ width:"100%"}} pressed={this.state.currentSlide === index} onClick={() => this.goToSlide(index)}>{subtitle}</Button>
                    ))}
                  </Flex>
                  */}
                  <Flex style={{ flexbasis:'100%', marginBottom: 0, width:'100%' }}>
                    <Slider key={this.state.currentSlide} classNames={horizontalCss} infinite={false} slideIndex={this.state.currentSlide}
                      previousButton={
                        <ChevronLeftIcon
                          style={{ color: 'var(--slate-9)', width:64, height:64 }}
                          onClick={() => {
                            const prevSlide = this.state.currentSlide - 1;
                            if (prevSlide >= 0) {
                              this.setState({ currentSlide: prevSlide });
                            }
                        }}/>}
                      nextButton={
                        <ChevronRightIcon
                          style={{ color: 'var(--slate-9)', width:64, height:64 }}
                          onClick={() => {
                            const nextSlide = this.state.currentSlide + 1;
                            if (nextSlide < this.state.description.length) {
                              this.setState({ currentSlide: nextSlide });
                            }
                        }}/>}
                    >
                      {this.state.description.map(([subtitle, ...paragraphs], index) => (
                        <div key={index} className="slide-container">
                          <div className="slide-content">
                            <Heading as='h2' size='5' style={{ color: 'var(--slate-12)', marginBottom:7, textAlign:"center" }}>&gt;_{subtitle} </Heading>
                            {paragraphs.map((paragraph, pIndex) => (
                              <p key={pIndex} dangerouslySetInnerHTML={{ __html: paragraph }}></p>
                            ))}
                          </div>
                        </div>
                      ))}
                    </Slider>
                  </Flex>
                </Flex>
              ) : (
                <Box style={{ textAlign:'justify', padding: '20px 300px' }}>
                  <Heading as='h2' size='5' style={{ color: 'var(--slate-12)', marginBottom:7 }}>&gt;_Your Task </Heading>
                  {this.state.printedDescription}
                </Box>
              )}
              </Box>
              <Separator orientation='vertical' style = {{ height: window.innerHeight-130, position: 'absolute', left: window.innerWidth * 0.6, bottom: (window.innerHeight-52) * 0.5, transform: `translateY(${(window.innerHeight - 110) / 2}px)` }}/>
              <Box style={{ flexBasis: '40%', display: 'flex', justifyContent:"center", alignItems:"center", padding: "0px 30px" }}>
                <img src={this.props.initPlot} alt='No data available' width='auto' height='auto' style={{ maxWidth: '100%', maxHeight: '100%' }} onLoad={() => {}}/>
              </Box>
          </Flex>)}
        {/*
          <Flex direction="row" gap="2" >
          <Box style={{ flex: 2, overflow: 'auto', padding: '20px 300px', fontFamily:'monospace' }}>
            {this.state.description.length > 0 ? (
              this.state.description.map(([subtitle, ...paragraphs], index) => (
              <div key={index}>
                <Heading as='h2' size='5' style={{ color: 'var(--slate-12)', marginBottom:7 }}>&gt;_{subtitle} </Heading>
                {paragraphs.map((paragraph, pIndex) => (
                  <p key={pIndex} dangerouslySetInnerHTML={{ __html: paragraph }}></p>
                ))}
              </div>
              ))
            ) : (
              <div style={{ textAlign:'justify', marginBottom: '20px' }}>
                <Heading as='h2' size='5' style={{ color: 'var(--slate-12)', marginBottom:7 }}>&gt;_Task Description </Heading>
                {this.state.printedDescription}
              </div>
            )}
          </Box>
          <Separator orientation='vertical' style = {{ height: window.innerHeight-110 }}/>
            <Box style={{ flex: 1, padding: '20px 20px' }}>
              	//
                <Heading as='h2' size='5' style={{ color: 'var(--slate-12)', marginTop: 20, marginBottom:7 }}>&gt;_The Dataset</Heading>	
                <div style={{ textAlign:'justify' }}>
                  This dataset contains {this.props.nOfObjects}, each with {this.props.nOfInputs} features. There are {this.props.nOfOutputs} targets. The features are: {this.props.featureNames.join(', ')}.
                </div>
                //
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 20 }}>
                  <img src={this.props.initPlot} alt='No data available' width='auto' height='auto' style={{ maxWidth: '100%', maxHeight: '100%' }} onLoad={() => {}}/>
                </div>
            </Box>
          </Flex>
        */}
        </Tabs.Content>
        <Tabs.Content value="building">          
          <Box style={{ display: 'flex', flex: 3, height: '100vh' }}>
            <div className='cytoscape'style={{top: 5, left: 3, position: 'absolute', width: window.innerWidth*0.65, height: window.innerHeight-130}}></div>
            <Flex direction="column" gap="2" height={'100vh'}>
              <CytoscapeComponent elements={this.props.cytoElements} stylesheet={this.props.cytoStyle} panningEnabled={false} autoungrabify={true} style={ { width: window.innerWidth*0.97, height: window.innerHeight-120, border: "solid", borderColor: "var(--slate-8)", borderRadius: "var(--radius-3)" } } onCy={(cy) => {this.cy = cy;}}/>
              
              <img src={color_scale_pic} alt='Color scale from purple for negative to red for positive' width='20' height='auto' style={{ position: 'absolute', top: 15, left: 15 }}/>

              {((this.props.imageVisibility && this.props.img && this.props.img !== '' && this.props.isTraining===1) &&
                <Flex direction="column" gap="1" style={{ position: 'absolute', bottom: window.innerHeight*0.2, left: window.innerWidth*0.45 }}>
                <img src={this.props.img} alt={`No plots yet`} onLoad={() => {}/*URL.revokeObjectURL(this.props.img)*/} style={{ height: '200px', width: 'auto' }}/>
                {this.props.taskId === 11 && (
                  <Flex direction="column" gap="0">
                  <p>Weight: {this.props.weights[0]}</p>
                  <p>Bias: {this.props.biases[0]}</p>
                  </Flex>
                )}
                </Flex>
              )}

              {this.props.generateFloatingButtons(window.innerHeight - 223, 0.1 * (window.innerWidth * 0.97) - 16.5, 0.4 * (window.innerWidth * 0.97)/Math.max(this.props.cytoLayers.length-1,1), true, this.props.cytoLayers.length, this.props.cytoLayers, this.props.setCytoLayers, this.props.taskId, this.props.index)}                    
              {this.props.generateFloatingButtons(window.innerHeight - 178, 0.1 * (window.innerWidth * 0.97) - 16.5, 0.4 * (window.innerWidth * 0.97)/Math.max(this.props.cytoLayers.length-1,1), false, this.props.cytoLayers.length, this.props.cytoLayers, this.props.setCytoLayers, this.props.taskId, this.props.index)}

              <this.props.FloatingButton
                variant="outline"
                onClick = {this.props.taskId !== 0 ? () => this.props.addLayer(this.props.setCytoLayers, this.props.nOfOutputs, this.props.index, this.props.maxLayers) : () => {}}
                size="0"
                disabled={this.props.cytoLayers.length>this.props.maxLayers-1 || this.props.isTraining===1}
                style={{top: window.innerHeight*0.285, 
                        left: window.innerWidth*0.60, 
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
                onClick = {this.props.taskId !== 0 ? () => this.props.removeLayer(this.props.setCytoLayers, this.props.index) : () => {}}
                size="0"
                disabled={this.props.cytoLayers.length<3 || this.props.isTraining===1}
                style= {{ top: window.innerHeight*0.285, 
                          left: window.innerWidth*0.56,
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
          
          <Separator orientation='vertical' style = {{ position:"absolute", top: Math.round(0.03 * (window.innerHeight-140)), left: Math.round(0.67 * (window.innerWidth * 0.97)), height: 0.96 * (window.innerHeight-140) }}/>

          <Box style={{ flex: 1 }}>

          {this.props.iterationsSliderVisibility ? (<Box style={{ position:"absolute", top: 0.14 * (window.innerHeight-140), left: Math.round(0.74 * (window.innerWidth * 0.97)), alignItems: 'start', justifyContent: 'end', fontFamily:'monospace'  }}>
            <div className="iterationsSlider">
              {this.props.iterationsSlider}
            </div>
            <div style={{ position:"absolute", zIndex: 9999, top: -30, left: 0.095 * (window.innerWidth * 0.97), transform: 'translateX(-50%)', fontSize: '14px', color: 'var(--slate-11)', whiteSpace: 'nowrap' }}>Epochs: {this.props.iterations}</div>
          </Box>) : (<div></div>)}

          {this.props.lrSliderVisibility ? (<Box style={{ position:"absolute", top: Math.round(0.26 * (window.innerHeight-140)), left: Math.round(0.74 * (window.innerWidth * 0.97)), alignItems: 'start', justifyContent: 'end', fontFamily:'monospace'  }}>
            <div className="learningRateSlider">
              {this.props.learningRateSlider}
            </div>
            <div style={{ position:"absolute", zIndex: 9999, top: -30, left: 0.095 * (window.innerWidth * 0.97), transform: 'translateX(-50%)', fontSize: '14px', color: 'var(--slate-11)', whiteSpace: 'nowrap' }}>Learning rate: {this.props.learningRate}</div>
          </Box>) : (<div></div>)}
          
          {this.props.normalizationVisibility ? (
          <Text as="label" size="2">
            <Flex style={{ position:"absolute", top: Math.round(0.4 * (window.innerHeight-140)-20), left: Math.round(0.7 * (window.innerWidth * 0.97)), width: Math.round(0.27 * (window.innerWidth * 0.97)), justifyContent:"flex-start", alignItems:"flex-start"}} gap="2">          
              <Checkbox disabled = { this.props.isTraining===1 } />
              Normalize training data
            </Flex>
          </Text>):(<div></div>)}

          {this.props.afVisibility ? (
          <Text as="label" size="2">
            <Flex style={{ position:"absolute", top: Math.round(0.4 * (window.innerHeight-140)-20), left: Math.round(0.7 * (window.innerWidth * 0.97)), width: Math.round(0.27 * (window.innerWidth * 0.97)), justifyContent:"flex-start", alignItems:"flex-start"}} gap="2">          
              <Checkbox disabled = { this.props.isTraining===1 } onChange={ (event) => {this.props.setAf(this.props.index, event.target.checked)}} checked={this.props.af} />
              Enable activation functions
            </Flex>
          </Text>):(<div></div>)}

          {/* make the position of the box shift down if normalization is true */}
          <Box style={{ position:"absolute", top: Math.round(0.4 * (window.innerHeight-140)) + ((this.props.normalizationVisibility || this.props.afVisibility) ? 30 : 0), left: Math.round(0.7 * (window.innerWidth * 0.97)), alignItems: 'center', justifyContent: 'start', height: '100vh', fontSize: '14px', color: 'var(--slate-11)' }}>
            <div id="/api-data">
              {this.props.isTraining===2 ? (
                <Flex direction='column' >
                  {this.shortDescription}
                  {(this.props.taskId < 20 &&
                  <div style={{ color: this.props.accuracyColor, fontFamily:'monospace' }}><b>R^2: {parseFloat(this.props.errorList[1]).toFixed(2)}</b></div>
                  )}
                  {(this.props.taskId >= 20 &&
                  <div style={{ color: this.props.accuracyColor, fontFamily:'monospace' }}><b>Accuracy: {(parseFloat(this.props.errorList[1])*100).toFixed(2)}%</b></div>
                  )}
                  <canvas ref={this.chartRef} id="myChart" style={{ width: Math.round(0.27 * (window.innerWidth * 0.97)), height: Math.round(0.4 * (window.innerHeight-140)), marginTop:10 }}></canvas>
                </Flex>
              ) : (this.props.isTraining===1 ? (
                <Flex direction= 'column'>
                  <div style={{ fontFamily:'monospace' }}><b>Training... </b></div>
                  <div style={{ fontFamily:'monospace' }}><b>Progress: {Math.round((parseFloat(this.props.progress))*100)}%</b></div>
                  <canvas ref={this.chartRef} id="myChart" style={{ display: this.state.activeTab === 'building' ? 'block' : 'none', width: Math.round(0.27 * (window.innerWidth * 0.97)), height: Math.round(0.35 * (window.innerHeight-140)), marginTop:10 }}></canvas>
                </Flex>
              ) : (
                <div style={{ textAlign:'justify', width: Math.round(0.27 * (window.innerWidth * 0.97)), fontFamily:'monospace' }}>
                  {this.shortDescription}
                </div>
              ))}
            </div>
          </Box>
          {console.log("this.props.isTraining: ", this.props.isTraining)}
          {console.log("type of isTraining: ", typeof(this.props.isTraining))}
          <IconButton
            onClick={
              this.props.taskId !== 0 ? (this.props.isTraining === 1 ? () => {this.props.cancelRequest(this.props.taskId, this.props.index)} : 
              (event) => this.props.putRequest(event, this.props.cytoLayers, this.props.apiData, this.props.setApiData, this.props.setAccuracy, this.props.setIsTraining, this.props.learningRate, this.props.iterations, this.props.taskId, this.props.index, this.props.nOfInputs, this.props.nOfOutputs, this.props.normalization, this.props.af) 
              ) : () => {}
            }
            variant="solid"
            style={{ position: 'absolute', transform: 'translateX(-50%)', top: Math.round(0.92 * (window.innerHeight-140)), left: Math.round(0.835 * (window.innerWidth * 0.97)), borderRadius: 'var(--radius-3)', width: Math.round(0.12 * (window.innerWidth * 0.97)), height: 36, fontSize: 'var(--font-size-2)', fontWeight: "500" }}
            disabled = { (this.props.iterationsSliderVisibility && !this.props.iterations) || (this.props.lrSliderVisibility && !this.props.learningRate) }>
              <Flex direction="horizontal" gap="2" style={{alignItems: "center", fontFamily:'monospace' }}>
                {this.props.isTraining === 1 ? "Cancel" : (<><PlayIcon width="18" height="18" />Start training!</>)}
              </Flex>
          </IconButton>
          </Box>

        </Tabs.Content>
      
        <Tabs.Content value="stuff">
        {this.props.taskId !== 0 && (
          <Flex direction="row" gap = "3" style={{ display: 'flex' }}>
            <Box style={{ flexBasis: '50%', justifyContent: 'center', alignItems: 'center' }}>
              <Flex direction="column" gap="2" style={{ flex: 1 }}>
              
              {/* This will render the form with the feature names received from the backend, if it exists */}
              <Form.Root className="FormRoot" onSubmit={this.props.taskId !== 0 ? (event) => this.props.handleSubmit(event, this.props.setIsResponding, this.props.setApiData, this.props.taskId, this.props.index) : () => {}} style={{ fontFamily:'monospace' }}>
                {this.props.featureNames.length > 0 && this.props.featureNames.map((featureName, index) => (
                  <Form.Field className="FormField" name={featureName} key={index}>
                    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                      <Form.Label className="FormLabel">{featureName}</Form.Label>
                      <Form.Message className="FormMessage" match="valueMissing">
                        Please enter the {featureName}
                      </Form.Message>
                      <Form.Message className="FormMessage" match="typeMismatch">
                        Please provide a valid number.
                      </Form.Message>
                    </div>
                    <Form.Control asChild>
                      <input className="FormInput" type="text" pattern="^-?[0-9]*[.,]?[0-9]+" required />
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
            </Box>
            <Box style={{ flexBasis: '50%', justifyContent: 'center', alignItems: 'center' }}>
              {/* This will render the images, if they exist */}
              <Flex direction="column" gap="2">
                {this.props.img ? (
                  <img src={this.props.img} alt={`No plots yet`} onLoad={() => {}/*URL.revokeObjectURL(this.props.img)*/}/>
                ) : (
                  <div>No image available. Try reloading the page? If this problem persists, please contact us.</div>
                )}
              {/* TODO: Turn this into a pretty animation */}
              </Flex>
            </Box>
          </Flex>
        )}
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
        disableCloseOnEsc={false}
        disableScrolling={true}
        callback={this.handleJoyrideCallback}
        locale={{ last: 'Finish' }}
      />
      </Theme>
    </div>
  )}
}

export default BuildingWrapper;