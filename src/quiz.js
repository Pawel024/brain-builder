import React, { useState, useEffect } from 'react';
import { Flex, Box, Button, Heading } from '@radix-ui/themes';
import { CheckCircledIcon, CrossCircledIcon } from '@radix-ui/react-icons';
import '@radix-ui/themes/styles.css';
import * as RadioGroup from '@radix-ui/react-radio-group';
import * as Progress from '@radix-ui/react-progress';
import './App.css';
import axios from 'axios';

const Quiz = ({ questions }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [isQuizFinished, setIsQuizFinished] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [userAnswers, setUserAnswers] = useState([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setProgress((currentQuestion+1)/(questions.length)*100-currentQuestion), 250);
    return () => clearTimeout(timer);
  }, [currentQuestion, questions.length]);

  useEffect(() => {
    if (isQuizFinished) {
      setTimeout(() => {
        setIsQuizFinished(false);
        setScore(0);
        setCurrentQuestion(0);
        setUserAnswers([]);
      }, 5000);
    }
  }, [isQuizFinished, score]);

  useEffect(() => {
    setSelectedAnswer(null);
  }, [currentQuestion]);

  const handleAnswerOptionClick = (event) => {
    event.preventDefault();
  
    const isCorrect = questions[currentQuestion].answers[selectedAnswer].isCorrect;
    if (isCorrect) {
      setScore((prevScore) => prevScore + 1);
    }

    // save the answer in userAnswers
    setUserAnswers((prevUserAnswers) => [
      ...prevUserAnswers,
      { selectedAnswer: questions[currentQuestion].answers[selectedAnswer].answerText, isCorrect },
    ]);
  
    const nextQuestion = currentQuestion + 1;
    if (nextQuestion < questions.length) {
      setCurrentQuestion(nextQuestion);
    } else {
      setIsQuizFinished(true);
    }
  };

  const ScoreScreen = ({ score }) => (
    <Box style={{ boxShadow: '0 2px 8px var(--slate-a11)', borderRadius: "var(--radius-3)", padding: '30px 50px', background:"solid", backgroundColor:"white" }}>
      <Flex gap="1" direction="column" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <Heading size='5' style={{ color: 'var(--slate-12)', marginBottom:20 }}>
            Quiz Finished!
        </Heading>
        <Box style={{ marginBottom:10 }}>
            <Heading size='3' style={{ color: 'var(--slate-12)', marginBottom:20 }}>
            Your score is: {score}
            </Heading>
        </Box>
        <Box>
          <Heading size='3' style={{ color: 'var(--slate-12)', marginBottom:20 }}>
            Your answers:
          </Heading>
          {userAnswers.map((answer, index) => (
            <p key={index}>
              Question {index + 1}: {answer.selectedAnswer} {answer.isCorrect ? (<CheckCircledIcon color='green'/>) : (<CrossCircledIcon color='red'/>)}
            </p>
          ))}
        </Box>
      </Flex>
    </Box>
  );

  return (
    <Box style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'monospace', backgroundImage: 'linear-gradient(330deg, rgba(7,62,185, 0.15) 0%, rgba(7,185,130, 0.15) 100%)'}}>
    {isQuizFinished ? <ScoreScreen score={score} /> : (
      <Box style={{ boxShadow: '0 2px 8px var(--slate-a11)', borderRadius: "var(--radius-3)", padding: '30px 50px', background:"solid", backgroundColor:"white" }}>
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
        <form>
          <Flex gap="2" direction="column" style={{ justifyContent: 'center', alignItems: 'center' }}>
          <RadioGroup.Root className="RadioGroupRoot" defaultValue="default" aria-label="View density" value={selectedAnswer !== null ? selectedAnswer.toString() : ''} onValueChange={setSelectedAnswer}>
            {questions[currentQuestion].answers.map((answer, index) => (
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <RadioGroup.Item className="RadioGroupItem" value={index.toString()} key={index} id="r1">
                  <RadioGroup.Indicator className="RadioGroupIndicator" />
                </RadioGroup.Item>
                <label className="Label" htmlFor="r1">
                  {answer.answerText}
                </label>
              </div>
            ))}
          </RadioGroup.Root>
          <Button onClick={(event) => handleAnswerOptionClick(event)} style={{marginTop:20}}>Next</Button>
          </Flex>
        </form>
      </Box>
    )}
    </Box>
  );
};
  
function QuizApp() {
  const [questions, setQuestions] = useState([
    {
      question: 'What is the capital of France?',
      answers: [
        { answerText: 'Paris', isCorrect: true },
        { answerText: 'London', isCorrect: false },
        { answerText: 'Berlin', isCorrect: false },
        { answerText: 'Madrid', isCorrect: false },
      ],
    },
    {
      question: 'Who is CEO of Tesla?',
      answers: [
        { answerText: 'Jeff Bezos', isCorrect: false },
        { answerText: 'Elon Musk', isCorrect: true },
        { answerText: 'Bill Gates', isCorrect: false },
        { answerText: 'Tony Stark', isCorrect: false },
      ],
    },
    {
      question: 'The iPhone was created by which company?',
      answers: [
        { answerText: 'Apple', isCorrect: true },
        { answerText: 'Intel', isCorrect: false },
        { answerText: 'Amazon', isCorrect: false },
        { answerText: 'Microsoft', isCorrect: false },
      ],
    },
    {
      question: 'How many Harry Potter books are there?',
      answers: [
        { answerText: '1', isCorrect: false },
        { answerText: '4', isCorrect: false },
        { answerText: '6', isCorrect: false },
        { answerText: '7', isCorrect: true },
      ],
    },
  ]);

  useEffect(() => {
    axios.get(window.location.origin + '/api/quizzes/?quiz_id=11')
    .then(response => {
      setQuestions(response.data.questions);
  })
    .catch(error => console.log(error));
  }, []);
  return <Quiz questions={questions} />;
}

export default QuizApp;