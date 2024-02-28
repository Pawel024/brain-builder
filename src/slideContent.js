const slideContent = [
    {
      title: 'Slide 1',
      description: 'This is the first slide.',
      button: {
        text: 'Click me',
        action: () => {
          console.log('Button from slide 1 clicked');
          // Add your action here
        },
      },
    },
    {
      title: 'Slide 2',
      description: 'This is the second slide.',
      button: {
        text: 'Click me',
        action: () => {
          console.log('Button from slide 2 clicked');
          // Add your action here
        },
      },
    },
    // more slides...
  ];

export default slideContent;