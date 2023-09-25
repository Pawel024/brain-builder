import React, { useState } from 'react';
import './App.css';
import { Theme, Button, Flex, Text, Box, Tabs } from '@radix-ui/themes';
import '@radix-ui/themes/styles.css';

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
    <body class='dark-theme'>
      <Theme accentColor="tomato" grayColor="olive" panelBackground="translucent" radius="large" appearance='dark'>
        <Tabs.Root defaultValue="monty">
          <Tabs.List size="2">
            <Tabs.Trigger value="monty">Monty Python Quotes</Tabs.Trigger>
            <Tabs.Trigger value="stuff">Stuff</Tabs.Trigger>
            <Tabs.Trigger value="settings">Settings</Tabs.Trigger>
          </Tabs.List>

          <Box px="4" pt="3" pb="2">
            <Tabs.Content value="monty">
            <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
              <Flex direction="column" gap="2" height={'100vh'} style={{alignItems: 'center', justifyContent: 'center'}}>
                <div className='Click-me-button'>
                  <Button onClick={generateMessage} variant='soft' size="3" gap="2">
                    <Text size="5">
                      Click me!
                    </Text>
                  </Button>
                </div>
                <div className='Click-me-text'>
                  {isLoading ? (
                    <div className="Progress-bar-outside">
                      <div className="Progress-bar-inside" style={{ width: `${progress}%` }}></div>
                    </div>
                  ) : (
                      <Text gap="2" style={{textAlign:'center'}}>
                        {message}
                      </Text>
                  )}
                </div>
              </Flex>
            </Box>
            </Tabs.Content>

            <Tabs.Content value="stuff">
              <Text size="2">Access and update your documents.</Text>
            </Tabs.Content>

            <Tabs.Content value="settings">
              <Text size="2">Edit your profile or update contact information.</Text>
            </Tabs.Content>
          </Box>
        </Tabs.Root>
      </Theme>
    </body>
  );
}

export default App;