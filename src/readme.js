import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import './App.css';

function Readme(file) {
  const [readme, setReadme] = useState('');

  useEffect(() => {
    axios.get(`https://raw.githubusercontent.com/pawel024/brain-builder/django_app/${file.totring()}`)
      .then(response => {
        setReadme(response.data);
      });
  }, [file]);

  return (
    <div className='readme'>
      <ReactMarkdown children={readme} />
    </div>
  );
}

export default Readme;