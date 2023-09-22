import React, { useState } from 'react';

function App() {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const messages = [
    'Strange women lying in ponds distributing swords is no basis for a system of government.',
    'What makes you think she is a witch?',
    'Nobody expects the Spanish Inquisition!',
    'Look, you stupid bastard, you’ve got no arms left!',
    'I fart in your general direction!',
    'Tis but a scratch!'
  ];

  const generateMessage = () => {
    setIsLoading(true);
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(progress => progress + 10);
    }, 200);
    setTimeout(() => {
      clearInterval(interval);
      const randomIndex = Math.floor(Math.random() * messages.length);
      setMessage(messages[randomIndex]);
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <div style={{ textAlign: 'center', backgroundColor: 'lightgray', height: '30vh', width: '90vh', borderRadius: '10px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80%' }}>
          <button onClick={generateMessage} style={{ backgroundColor: 'darkred', color: 'white', fontSize: '24px', textAlign: 'center', transition: 'background-color 0.5s ease', padding: '10px 20px', borderRadius: '5px', marginBottom: '20px', marginTop: '40px' }}>
            Click me!
          </button>
          {isLoading ? (
            <div style={{ width: '80%', height: '30px', borderRadius: '5px', backgroundColor: 'white' }}>
              <div style={{ width: `${progress}%`, height: '100%', backgroundColor: 'darkred', borderRadius: '5px' }}></div>
            </div>
          ) : (
            <div style={{ color: 'black', fontFamily: 'Arial', fontSize: '18px', textAlign: 'center', fontWeight: 'bold' }}>
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;