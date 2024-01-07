import React from 'react'
import './App.css';
import { Flex, Box, Tabs, Heading, Grid, IconButton, Separator } from '@radix-ui/themes';
import * as Form from '@radix-ui/react-form';
import '@radix-ui/themes/styles.css';
import tu_delft_pic from "./tud_black_new.png";
import color_scale_pic from "./color_scale_2.png";
import { Link } from 'react-router-dom';
import CytoscapeComponent from 'react-cytoscapejs';
import { PlayIcon, ChevronLeftIcon, ChevronRightIcon, HomeIcon } from '@radix-ui/react-icons';
import Joyride from 'react-joyride';
import { useNavigate } from 'react-router-dom';

function BuildingWrapper(props) {
  const navigate = useNavigate();

  return <Building {...props} navigate={navigate} />;
}
class Building extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
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

  componentDidMount() {
    this.props.loadLastCytoLayers(this.props.setCytoLayers, this.props.apiData, this.props.setApiData, 'cytoLayers' + this.props.currentGameNumber);
    this.props.updateCytoLayers(this.props.setCytoLayers, this.props.nOfInputs, this.props.nOfOutputs);
    if (this.props.currentGameNumber === 0) {
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
      
      

      <Tabs.Root defaultValue="building">

        <Tabs.List size="2">
          <Tabs.Trigger value="building" >Build</Tabs.Trigger>
          <Tabs.Trigger value="stuff">Test</Tabs.Trigger>
          <Tabs.Trigger value="settings">Settings</Tabs.Trigger>
        </Tabs.List>

        <Box px="4" pt="3" pb="0">
        <Tabs.Content value="building">
          <Box style={{ display: 'flex', alignItems: 'start', justifyContent: 'center', height: '100vh' }}>
            <div className='cytoscape'style={{top: 5, left: 3, position: 'absolute', width: window.innerWidth*0.78, height: window.innerHeight-125}}></div>
            <Flex direction="column" gap="2" height={'100vh'} style={{ alignItems: 'center', justifyContent: 'center'}}>
              <CytoscapeComponent elements={this.props.cytoElements} stylesheet={this.props.cytoStyle} panningEnabled={false} autoungrabify={true} style={ { width: window.innerWidth*0.97, height: window.innerHeight-120, border: "solid", borderColor: "var(--slate-8)", borderRadius: "var(--radius-3)" } } />
              
              <img src={color_scale_pic} alt='Color scale from purple for negative to red for positive' width='20' height='auto' style={{ position: 'absolute', top: 15, left: 15 }}/>

              {this.props.generateFloatingButtons(window.innerHeight - 223, 0.08 * (window.innerWidth * 0.97) - 10, 0.7 * (window.innerWidth * 0.97)/this.props.cytoLayers.length, true, this.props.cytoLayers.length, this.props.cytoLayers, this.props.setCytoLayers, this.props.currentGameNumber)}                    
              {this.props.generateFloatingButtons(window.innerHeight - 178, 0.08 * (window.innerWidth * 0.97) - 10, 0.7 * (window.innerWidth * 0.97)/this.props.cytoLayers.length, false, this.props.cytoLayers.length, this.props.cytoLayers, this.props.setCytoLayers, this.props.currentGameNumber)}

              <this.props.FloatingButton
                variant="outline"
                onClick = {() => this.props.addLayer(this.props.setCytoLayers, this.props.nOfOutputs)}
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
                onClick = {() => this.props.removeLayer(this.props.setCytoLayers)}
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

          <Box style={{ position:"absolute", top: 0.14 * (window.innerHeight-140), left: Math.round(0.82 * (window.innerWidth * 0.97)), alignItems: 'start', justifyContent: 'end', height: '100vh' }}>
            <div className="iterationsSlider">
              {this.props.iterationsSlider}
            </div>
            <div style={{ position:"absolute", zIndex: 9999, top: -35, left: 0.08 * (window.innerWidth * 0.97), transform: 'translateX(-50%)', fontSize: '14px', color: 'var(--slate-11)', whiteSpace: 'nowrap' }}>Epochs: {this.props.iterations}</div>
          </Box>

          <Box style={{ position:"absolute", top: Math.round(0.30 * (window.innerHeight-140)), left: Math.round(0.82 * (window.innerWidth * 0.97)), alignItems: 'start', justifyContent: 'end', height: '100vh' }}>
            <div className="learningRateSlider">
              {this.props.learningRateSlider}
            </div>
            <div style={{ position:"absolute", zIndex: 9999, top: -35, left: 0.08 * (window.innerWidth * 0.97), transform: 'translateX(-50%)', fontSize: '14px', color: 'var(--slate-11)', whiteSpace: 'nowrap' }}>Learning rate: {this.props.learningRate}</div>
          </Box>
          
          <Box style={{ position:"absolute", top: Math.round(0.50 * (window.innerHeight-140)), left: Math.round(0.82 * (window.innerWidth * 0.97)), alignItems: 'start', justifyContent: 'end', height: '100vh' }}>
            <div id="/api-data" style={{ color: this.props.accuracyColor }}>
              {this.props.isTraining===2 ? (
                <pre>Accuracy: {(parseFloat(JSON.parse(this.props.apiData["error_list"])[1])*100).toFixed(2)}%</pre>
              ) : (this.props.isTraining===1 ? (
                <pre>Training...</pre>
              ) : (
                <div>
                  {this.props.taskDescription}
                </div>
              )
              )}
            </div>
          </Box>

          <IconButton onClick={(event) => this.props.postRequest(event, this.props.cytoLayers, this.props.apiData, this.props.setApiData, this.props.setAccuracy, this.props.setIsTraining, this.props.learningRate, this.props.iterations)} variant="solid" style={{ position: 'absolute', transform: 'translateX(-50%)', top: Math.round(0.9 * (window.innerHeight-140)), left: Math.round(0.9 * (window.innerWidth * 0.97)), borderRadius: 'var(--radius-3)', width: 150, height: 36, fontSize: 'var(--font-size-2)', fontWeight: "500" }}>
            <Flex direction="horizontal" gap="2" style={{alignItems: "center"}}>
              <PlayIcon width="18" height="18" />Start training!
            </Flex>
          </IconButton>

        </Tabs.Content>
      
        <Tabs.Content value="stuff">
          <Flex direction="column" gap="2">
          
          <Form.Root className="FormRoot" onSubmit={(event) => this.props.handleSubmit(event, this.props.setIsResponding, this.props.setApiData)}>
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
              {this.props.isResponding===2 ? (
                <pre>Output: {this.props.apiData["nn_input"]}</pre>
              ) : (this.props.isResponding===1 ? (
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
              <this.props.MontyPythonSwitch />
            </div>
          </form>
          </Box>
        </Tabs.Content>
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
    </div>
  )}
}

export default BuildingWrapper;

/*
tooltipComponent={(props) => <CustomTooltip {...props} steps={this.state.steps} />}
*/

/*
class Game1 extends Building {
    render() {
      const inputs = 5;
      const outputs = 10;
  
      return (
        <div>
          <h1>Game1</h1>
          {super.render({ inputs, outputs })}
        </div>
      );
    }
  }
  
  class Game2 extends Building {
    render() {
      const inputs = 10;
      const outputs = 20;
  
      return (
        <div>
          <h1>Game2</h1>
          {super.render({ inputs, outputs })}
        </div>
      );
    }
  }
  
  class Game3 extends Building {
    render() {
      const inputs = 15;
      const outputs = 30;
  
      return (
        <div>
          <h1>Game3</h1>
          {super.render({ inputs, outputs })}
        </div>
      );
    }
  }
  */