import React from 'react';
import './App.css';
import { Theme, Box, Grid, Heading, IconButton, Flex } from '@radix-ui/themes';
import { Link } from 'react-router-dom';
import { HomeIcon, PlayIcon } from '@radix-ui/react-icons';
import tu_delft_pic from "./tud_black_new.png";
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { solarizedlight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { toHaveStyle } from '@testing-library/jest-dom/matchers';

class NotebookView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            notebook: null,
            currentCell: 0,
        };
        this.ws = new WebSocket(`wss://${this.props.host}/nb/${this.props.userId}/${this.props.notebookId}/`);
    }

    componentDidMount() {
        let notebookUrl 

        notebookUrl = 'https://raw.githubusercontent.com/Pawel024/brain-builder/laurens/notebooks/' + this.props.notebookId + '.ipynb'  // TODO: change the repo

        axios.get(notebookUrl)
            .then(response => this.setState({ notebook: response.data }))
            .catch(error => {
                console.error('Error loading notebook:', error);
            });

        this.ws.onclose = () => {
            console.log('WebSocket connection closed');
        };

        this.ws.onopen = () => {
            console.log('WebSocket connection opened');
        }

        this.ws.onerror = (error) => {
            console.log('WebSocket error: ', error);
        }

        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log("Message", data.title, " received")
            // TODO: handle the message
        }
    }

    componentWillUnmount() {
        this.ws.close();
    }

    handleClick = (index) => {
        console.log("Clicked cell", index);
        {/*
        if (this.ws.readyState === this.ws.OPEN && this.state.notebook) {
            this.setState({ currentCell: index });
            const data = {
                code: this.state.notebook.cells[index].source.join(''),
                cell: index,
            };
            try {this.ws.send(JSON.stringify(data));}
            catch (error) {console.error('Error sending message:', error);}
        }
        */}
    }

    render() {
        return(
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
                <div className="notebook-view">
                    {this.state.notebook === null && <div>Loading...</div>}
                    {this.state.notebook !== null && console.log(this.state.notebook)}
                    {this.state.notebook !== null && this.state.notebook.cells.map((cell, index) => {
                    if (cell.cell_type === 'markdown') {
                        return <MarkdownCell key={index} cell={cell} style={{ margin: '10px' }} />;
                    } else if (cell.cell_type === 'code') {
                        return <CodeCell key={index} cell={cell} handleClick={this.handleClick(index)} style={{ margin: '10px' }} />;
                    }
                    // Handle other cell types...
                    })}
                </div>
            </Theme>
        )
    }
}

class MarkdownCell extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isEditing: false,
            content: this.props.source.join(''),
            newContent: this.props.source.join(''),
        };
    }

    handleClick = () => {
        this.setState({ isEditing: true });
    }

    handleChange = (event) => {
        this.setState({ newContent: event.target.value });
    }

    handleBlur = () => {
        this.setState({ isEditing: false });
    }

    handleKeyDown = (event) => {
        if (event.key === "Enter" && this.state.isEditing) {
            event.preventDefault();
            this.setState({ isEditing: false, content: this.state.newContent });
        }
    }

    render() {
        return (
            <div className="markdown-cell" onClick={this.handleClick} >
            {this.state.isEditing ? (
                <textarea value={this.state.content} onChange={this.handleChange} onBlur={this.handleBlur} onKeyDown={this.handleKeyDown} />
            ) : (
                <ReactMarkdown>{this.state.content}</ReactMarkdown>
            )}
            </div>
        );
    }
}

class CodeCell extends React.Component {

    render() {
        const { cell } = this.props;
        const source = cell.source.join('');

        return (
            <Flex direction="row" gap="2" >
            <div className="code-cell">
                <PlayButton onClick={this.props.handleClick} />
                <SyntaxHighlighter language="python" style={solarizedlight}>
                    {source}
                </SyntaxHighlighter>
            </div>
            </Flex>
        );
    }
}

class PlayButton extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <button onClick={this.props.onClick}><PlayIcon width="10" height="10" /></button>
        );
    }
}

export default NotebookView;