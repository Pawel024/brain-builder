import React, { useState, useEffect } from 'react';
import { Flex, Box, Button, Heading, TextField } from '@radix-ui/themes';
import { CheckCircledIcon, CrossCircledIcon } from '@radix-ui/react-icons';
import '@radix-ui/themes/styles.css';
import * as RadioGroup from '@radix-ui/react-radio-group';
import * as Progress from '@radix-ui/react-progress';
import './App.css';
import axios from 'axios';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import a11yDark from './a11y-dark';


const FeedbackForm = ({ questions, host, cookie }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [progress, setProgress] = useState(0);
  const [textInputValue, setTextInputValue] = useState("");
  const [selectedOption, setSelectedOption] = useState(null);
  const [feedback, setFeedback] = useState(Array(questions.length).fill(''));
  
  useEffect(() => {
    const timer = setTimeout(() => setProgress((currentQuestion+1)/(questions.length)*100-currentQuestion), 250);
    return () => clearTimeout(timer);
  }, [currentQuestion, questions.length]);

  useEffect(() => {
    setSelectedOption(null);
  }, [currentQuestion]);

  const handleOptionClick = (event) => {
    event.preventDefault();
  
    // save the answer in userAnswers
    let userAnswer;
    if (questions[currentQuestion].question_type === "text") {
      userAnswer = textInputValue;
    } else if (questions[currentQuestion].question_type === "rating") {
      userAnswer = selectedOption;
    }

    setFeedback((prevFeedback) => {
      const newFeedback = [...prevFeedback];
      newFeedback[currentQuestion] = userAnswer;
      return newFeedback;
    });
  
    const nextQuestion = currentQuestion + 1;
    if (nextQuestion < questions.length) {
      setCurrentQuestion(nextQuestion);
    } else {
      setIsFinished(true);
    }
  };

  useEffect(() => {
    if (isFinished) {
    axios.post(host + '/api/feedback', { feedback: feedback }, {headers: { 'X-CSRFToken': cookie }})
      .then(response => {
        console.log(response);
      })
      .catch(error => {
        console.error(error);
      });
    }
  }, [isFinished]);

  return (
    <Box style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: window.innerHeight-52, fontFamily: 'monospace', backgroundImage: 'linear-gradient(330deg, rgba(7,62,185, 0.15) 0%, rgba(7,185,130, 0.15) 100%)'}}>
      {isFinished ? (<Box style={{ boxShadow: '0 2px 8px var(--slate-a11)', borderRadius: "var(--radius-3)", width:window.innerWidth/3, padding: '30px 50px', background:"solid", backgroundColor:"white" }}>
          <Flex gap="1" direction="column" style={{ justifyContent: 'center', alignItems: 'center' }}>
            <Heading size='2' style={{ color: 'var(--slate-12)', marginBottom:25 }}>
              Thank you for your feedback!
            </Heading>
            <CheckCircledIcon color="green" width="30" height="30" />
          </Flex>
        </Box>
      ) : (<Box style={{ boxShadow: '0 2px 8px var(--slate-a11)', borderRadius: "var(--radius-3)", width:window.innerWidth/3, padding: '30px 50px', background:"solid", backgroundColor:"white" }}>
        <Flex gap="1" direction="column" style={{ justifyContent: 'center', alignItems: 'center' }}>
          <Progress.Root className="ProgressRoot" value={progress} style={{ marginBottom:5 }}>
            <Progress.Indicator
              className="ProgressIndicator"
              style={{ transform: `translateX(-${100 - progress}%)` }}
            />
          </Progress.Root>
          <Heading size='2' style={{ color: 'var(--slate-12)', marginBottom:25 }}>
              Question {currentQuestion + 1} of {questions.length}
          </Heading>
          <Box style={{ marginBottom:10 }}>
              <Heading size='5' style={{ color: 'var(--slate-12)', marginBottom:15 }}>
              {questions[currentQuestion].question}
              </Heading>
          </Box>
        </Flex>
        <form >
          <Flex gap="2" direction="column" style={{ justifyContent: 'center', alignItems: 'center' }}>
          {questions[currentQuestion].question_type === "text" ? (<TextField.Root> <TextField.Input color="gray" placeholder="Type your answer…" style={{ width:window.innerWidth/3.75 }} onChange={event => setTextInputValue(event.target.value)} onKeyDown={event => {
            if (event.key === 'Enter') {
              handleOptionClick(event);
            }}}/>
            </TextField.Root>
          ) : (
            <RadioGroup.Root className="RadioGroupRoot" defaultValue="default" aria-label="Multiple choice question" value={selectedOption !== null ? selectedOption.toString() : ''} onValueChange={setSelectedOption}>
              {questions[currentQuestion].options.map((option, index) => (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <RadioGroup.Item className="RadioGroupItem" value={index.toString()} key={index}>
                    <RadioGroup.Indicator className="RadioGroupIndicator" />
                  </RadioGroup.Item>
                  <label className="Label" htmlFor="r1">
                    {option.optionText}
                  </label>
                </div>
              ))}
            </RadioGroup.Root>
          )}
          <Button onClick={(event) => handleOptionClick(event)} style={{marginTop:20}}>Next</Button>
          </Flex>
        </form>
      </Box>
      )}
    </Box>
  );
};
  
function FeedbackApp({ host, cookie }) {

  // ------- WINDOW RESIZING -------

  function getWindowSize() {
    const {innerWidth, innerHeight} = window;
    return {innerWidth, innerHeight};
  }
  
  // eslint-disable-next-line no-unused-vars
  const [windowSize, setWindowSize] = useState(getWindowSize());

  // update window size when window is resized
  useEffect(() => {
    function handleWindowResize() {
      setWindowSize(getWindowSize());
    }

    window.addEventListener('resize', handleWindowResize);
    return () => {
      window.removeEventListener('resize', handleWindowResize);
    };
  }, []);


  // ------- ACTUAL FORM -------

  const [questions, setQuestions] = useState([
    {
      question: 'What overall score would you give this webtool?',
      options: [
        { optionText: '1', isCorrect: false },
        { optionText: '2', isCorrect: false },
        { optionText: '3', isCorrect: false },
        { optionText: '4', isCorrect: false },
        { optionText: '5', isCorrect: true },
      ],
      question_type: "rating",
    },
    {
      question: 'Were the explanations clear?',
      options: [
        { optionText: 'Yes, they were very clear', isCorrect: false },
        { optionText: 'They were ok', isCorrect: true },
        { optionText: 'There were some issues', isCorrect: false },
        { optionText: 'No, they were confusing', isCorrect: false },
      ],
      question_type: "rating",
    },
    {
      question: 'Did you experience any technical issues?',
      options: [
        { optionText: 'Yes, many', isCorrect: false },
        { optionText: 'Yes, some, but they were very annoying', isCorrect: false },
        { optionText: 'Yes, some, but it did not bother me', isCorrect: true },
        { optionText: 'No, everything ran smoothly', isCorrect: false },
      ],
      question_type: "rating",
    },
    {
      question: 'I experienced the following technical issues:',
      options: [ {optionText: '7', isCorrect: true }, ],
      question_type: "text",
    },
    {
      question: 'Do you think this tool would be a useful addition to the AI course?',
      options: [
        { optionText: 'Yes, the course needs this', isCorrect: false },
        { optionText: 'Yes, but with some modifications', isCorrect: false },
        { optionText: 'It could be helpful, but is not necessary', isCorrect: true },
        { optionText: 'The existing course material is enough for me', isCorrect: false },
      ],
      question_type: "rating",
    },
    {
      question: 'How could we improve this tool?',
      options: [ {optionText: '7', isCorrect: true }, ],
      question_type: "text",
    },
    {
      question: 'Do you want to see more dedicated tools like this one in other courses?',
      options: [
        { optionText: 'Yes, that would be very helpful', isCorrect: true },
        { optionText: 'Maybe', isCorrect: false },
        { optionText: 'No, I do not think I would use them', isCorrect: false },
      ],
      question_type: "rating",
    },
    {
      question: 'Anything else you would like to share?',
      options: [ {optionText: '7', isCorrect: true }, ],
      question_type: "text",
    },
  ]);

  useEffect(() => {
    setQuestions(questions.filter((question) => {
      return !(question.question === "");
    }));
  }, [questions]);

  return <FeedbackForm questions={questions} host={host} cookie={cookie} />;
}

export default FeedbackApp;