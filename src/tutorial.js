import React from 'react';
import BuildView from './buildView';
import './App.css';

function Tutorial({ nOfInputs, nOfOutputs, maxLayers, taskDescription, cytoElements, cytoStyle, generateFloatingButtons, cytoLayers, setCytoLayers, updateCytoLayers, loadLastCytoLayers, FloatingButton, addLayer, removeLayer, iterationsSlider, iterations, setIterations, learningRateSlider, learningRate, setLearningRate, isTraining, setIsTraining, apiData, setApiData, postRequest, accuracy, setAccuracy, accuracyColor, handleSubmit, isResponding, setIsResponding, MontyPythonSwitch }) {
  return (
    <div>
        {/*<BuildView
            currentGameNumber={0} 
            nOfInputs={nOfInputs}
            nOfOutputs={nOfOutputs}
            maxLayers={maxLayers}
            taskDescription={taskDescription}
            cytoElements={tutorialCytoElements}
            cytoStyle={tutorialCytoStyle}
            generateFloatingButtons={generateFloatingButtons}
            cytoLayers={tutorialCytoLayers}
            setCytoLayers={setCytoLayers}
            updateCytoLayers={updateCytoLayers}
            loadLastCytoLayers={loadLastCytoLayers}
            FloatingButton={FloatingButton}
            addLayer={addLayer}
            removeLayer={removeLayer}
            iterationsSlider={tutorialIterationsSlider}
            iterations={iterations}
            setIterations={setIterations}
            learningRateSlider={tutorialLearningRateSlider}
            learningRate={learningRate}
            setLearningRate={setLearningRate}
            isTraining={isTraining}
            setIsTraining={setIsTraining}
            apiData={apiData}
            setApiData={setApiData}
            postRequest={postRequest}
            accuracy={accuracy}
            setAccuracy={setAccuracy}
            accuracyColor={accuracyColor}
            handleSubmit={handleSubmit}
            isResponding={isResponding}
            setIsResponding={setIsResponding}
            MontyPythonSwitch={MontyPythonSwitch}
  />*/}
    </div>
  );
}

export default Tutorial;