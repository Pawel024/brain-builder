import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import './App.css';

function Readme() {
  const [readme, setReadme] = useState('');

  useEffect(() => {
    axios.get('https://raw.githubusercontent.com/pawel024/brain-builder/django_app/README.md')
      .then(response => {
        setReadme(response.data);
      });
  }, []);

  return (
    <div className='readme'> {/* Adjust the font size here */}
      <ReactMarkdown children={readme} />
    </div>
  );
}

export default Readme;