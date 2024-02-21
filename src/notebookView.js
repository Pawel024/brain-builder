import React from 'react';
import './App.css';
import { Theme, Box, Grid, Heading, IconButton, Flex } from '@radix-ui/themes';
import { Link } from 'react-router-dom';
import { HomeIcon } from '@radix-ui/react-icons';
import tu_delft_pic from "./tud_black_new.png";
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { solarizedlight } from 'react-syntax-highlighter/dist/esm/styles/prism';

class NotebookView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            notebook: null,
        };
    }

    componentDidMount() {
        if (this.props.notebookId === 'Test') {
            fetch('Test.ipynb')
                // store the notebook 'Test.ipynb' in the notebook state as a JSON object
                .then(response => response.json())
                .then(data => this.setState({ notebook: data }));
        } else {
            // Replace this URL with the URL of the notebook file
            const notebookUrl = window.location.origin + '/nb/' + this.props.notebookId;

            axios.get(notebookUrl)
                .then(response => {
                    this.setState({ notebook: response.data });
                })
                .catch(error => {
                    console.error('Notebook loading error:', error);
                });
            }
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
                    {this.state.notebook !== null && this.state.notebook.cells.map((cell, index) => {
                    if (cell.cell_type === 'markdown') {
                        return <MarkdownCell key={index} cell={cell} />;
                    } else if (cell.cell_type === 'code') {
                        return <CodeCell key={index} cell={cell} />;
                    }
                    // Handle other cell types...
                    })}
                </div>
            </Theme>
        )
    }
}

class MarkdownCell extends React.Component {
    render() {
        const { cell } = this.props;
        const source = cell.source.join('');

        return (
            <div className="markdown-cell">
                <ReactMarkdown>{source}</ReactMarkdown>
            </div>
        );
    }
}

class CodeCell extends React.Component {
    render() {
        const { cell } = this.props;
        const source = cell.source.join('');

        return (
            <div className="code-cell">
                <SyntaxHighlighter language="python" style={solarizedlight}>
                    {source}
                </SyntaxHighlighter>
            </div>
        );
    }
}

export default NotebookView;