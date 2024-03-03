import React from 'react';
import './App.css';
import { Theme, Box, Grid, Heading, IconButton, Flex, Button, Separator } from '@radix-ui/themes';
import { ChevronDownIcon, ChevronRightIcon } from '@radix-ui/react-icons';
import { Link } from 'react-router-dom';
import { HomeIcon } from '@radix-ui/react-icons';
import tu_delft_pic from "./tud_black_new.png";
import axios from 'axios';
import Slider from 'react-animated-slider';
import horizontalCss from './horizontalSlides.css';

class Introduction extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
          content: [],
          showContent: [],
          printedContent: '',
          currentSlide: 0,
        }
    }

    goToSlide = (index) => {
      this.setState({ currentSlide: index });
      console.log("Going to slide " + index)
    };

    handleShowContent = (index, expand) => {
      if (expand) {
        //set showContent[index] to true hence expand the content
        this.setState({ showContent: this.state.showContent.map((value, i) => i === index ? true : false) });
      } else {
        //set showContent[index] to false hence collapse the content
        this.setState({ showContent: this.state.showContent.map((value, i) => i === index ? false : value) });
      }
    };

    typeWriter = (txt, speed=15, i=0) => {
        if (i < txt.length) {
          this.setState({ printedContent: this.state.printedContent + txt.charAt(i)})
          setTimeout(() => this.typeWriter(txt, speed, i + 1), speed);
        }
      };

    componentDidMount() {
        axios.get(window.location.origin + '/api/intros/?intro_id=' + this.props.introId)
        .then(response => {
        if (response.data.content[0] === '[') {
            this.setState({ content: JSON.parse(response.data.content), showContent: Array(JSON.parse(response.data.content).length).fill(false) });
            console.log("Attempting to set the array")
            const urlParams = new URLSearchParams(window.location.search);
            const openBox = urlParams.get('section');
            if (openBox !== null) {
              this.handleShowContent(parseInt(openBox), true);
            }
        } else {
            this.typeWriter(response.data.content);  // this works
        }
        })
        .catch(error => {
        console.error('Introduction error:', error);
        this.typeWriter("There was an error loading the introduction.");
        });
    }

    render () { return(
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
        {console.log(this.state.showContent)}
        {this.props.taskId !== 0 && (
          <Box style={{ overflow: 'auto', fontFamily:'monospace', width: '100%', height: window.innerHeight-52, padding: '30px 300px' }}>
            {this.state.content.length > 0 ? (
              <Flex direction="column" gap="3" style={{ width: '100%', height: '100%'}}>
                {this.state.content.map(([subtitle, text], index) => (
                  <Box style={{ border: "2px solid", borderColor: "var(--slate-8)", borderRadius: "var(--radius-3)", padding: '10px 24px', textAlign: 'justify', backgroundColor: this.state.showContent[index] ? 'transparent' : 'var(--slate-3)', cursor: 'pointer' }}
                    onClick={this.state.showContent[index] ? () => this.handleShowContent(index, false) : () => this.handleShowContent(index, true)}
                  >
                    <Flex direction="column" style={{textAlign: 'justify'}}>
                      <Heading as='h2' size='5' style={{ color: 'var(--slate-12)', marginBottom:7, textAlign: 'start' }}>&gt;_{subtitle} </Heading>
                      { this.state.showContent[index] && (<p>{text}</p>)}
                    </Flex>
                  </Box>
                ))}
              </Flex>
            ) : (
              <div style={{ textAlign:'justify' }}>
                <Heading as='h2' size='5' style={{ color: 'var(--slate-12)', marginBottom:7 }}>&gt;_Key Concepts </Heading>
                {this.state.printedContent}
              </div>
            )}
          </Box>
        )}
    </Theme>
    )}
}

export default Introduction;


/*
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
        {this.props.taskId !== 0 && (
          <Box style={{ overflow: 'auto', fontFamily:'monospace', width: '100%', height: window.innerHeight-52, padding: '30px 0px' }}>
            {this.state.content.length > 0 ? (
              <>
              <Flex direction="row" gap="2" style={{ height: '100%'}}>
              <Box style={{ flexBasis: '67%', display: 'flex', justifyContent:"center", alignItems:"center" }}>
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
                      if (nextSlide < this.state.content.length) {
                        this.setState({ currentSlide: nextSlide });
                      }
                  }}/>}
              >
                {this.state.content.map(([subtitle, text], index) => (
                  <div key={index} className="slide-container">
                    <div className="slide-content">
                      <Heading as='h2' size='5' style={{ color: 'var(--slate-12)', marginBottom:7, textAlign:"center" }}>&gt;_{subtitle} </Heading>
                      <p>{text}</p>
                    </div>
                  </div>
                ))}
              </Slider>
              </Box>
              <Box style={{ flexBasis: '33%', padding: '0px 90px', display: 'flex', justifyContent:"center", alignItems:"center" }}>
                <Flex direction="column" gap="2" style={{ justifyContent:"center", alignItems:"center", width:"100%" }}>
                  {this.state.content.map(([subtitle, text], index) => (
                    <Button variant="outline" style={{ width:"100%"}} pressed={this.state.currentSlide === index} onClick={() => this.goToSlide(index)}>{subtitle}</Button>
                  ))}
                </Flex>
              </Box>
              </Flex>
              <Separator orientation='vertical' style = {{ height: window.innerHeight-110, position: 'absolute', left: window.innerWidth * 0.67, bottom: (window.innerHeight-52) * 0.5, transform: `translateY(${(window.innerHeight - 110) / 2}px)` }}/>
              </>
            ) : (
              <div style={{ textAlign:'justify', marginBottom: '20px', padding: '0px 300px' }}>
                <Heading as='h2' size='5' style={{ color: 'var(--slate-12)', marginBottom:7 }}>&gt;_Key Concepts </Heading>
                {this.state.printedContent}
              </div>
            )}
          </Box>
        )}
    </Theme>
*/