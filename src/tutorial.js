import React, { useEffect, useState } from 'react';
import BuildView from './buildView';
import './App.css';

function Tutorial({ nOfInputs, nOfOutputs, cytoElements, cytoStyle, generateFloatingButtons, cytoLayers, setCytoLayers, updateCytoLayers, loadLastCytoLayers, FloatingButton, addLayer, removeLayer, iterationsSlider, iterations, setIterations, learningRateSlider, learningRate, setLearningRate, isTraining, setIsTraining, apiData, setApiData, postRequest, accuracy, setAccuracy, accuracyColor, handleSubmit, isResponding, setIsResponding, MontyPythonSwitch }) {
  return (
        <BuildView
            currentGameNumber={0} 
            nOfInputs={nOfInputs}
            nOfOutputs={nOfOutputs}
            cytoElements={cytoElements}
            cytoStyle={cytoStyle}
            generateFloatingButtons={generateFloatingButtons}
            cytoLayers={cytoLayers}
            setCytoLayers={setCytoLayers}
            updateCytoLayers={updateCytoLayers}
            loadLastCytoLayers={loadLastCytoLayers}
            FloatingButton={FloatingButton}
            addLayer={addLayer}
            removeLayer={removeLayer}
            iterationsSlider={iterationsSlider}
            iterations={iterations}
            setIterations={setIterations}
            learningRateSlider={learningRateSlider}
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
          />
  );
}

export default Tutorial;