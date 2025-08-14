import React, { useState, useEffect } from 'react';

const TRAINS = [
  { name: 'Northwest Railways', interval: 58 },
  { name: 'Sim Rail Grade', interval: 63 },
  { name: 'ES Super Sim', interval: 58 },
  { name: 'LM Grade 23', interval: 26 },
  { name: 'Llama Line 350', interval: 27 },
  { name: 'Quail QP1', interval: 18 },
  { name: 'Flying Sim', interval: 12 },
  { name: 'Simeo Plus B', interval: 8 }
];

function TrainSchedule() {
  const [trainStates, setTrainStates] = useState(() => {
    const initialState = {};
    TRAINS.forEach(train => {
      initialState[train.name] = {
        sent: false,
        timeRemaining: 0
      };
    });
    return initialState;
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setTrainStates(prevStates => {
        const newStates = { ...prevStates };
        Object.keys(newStates).forEach(trainName => {
          if (newStates[trainName].sent && newStates[trainName].timeRemaining > 0) {
            newStates[trainName].timeRemaining -= 10; // Reduce by 10 seconds
            if (newStates[trainName].timeRemaining <= 0) {
              newStates[trainName].sent = false;
              newStates[trainName].timeRemaining = 0;
            }
          }
        });
        return newStates;
      });
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const sendTrain = (trainName, intervalMinutes) => {
    setTrainStates(prevStates => ({
      ...prevStates,
      [trainName]: {
        sent: true,
        timeRemaining: intervalMinutes * 60 // Convert minutes to seconds
      }
    }));
  };

  const resetTrain = (trainName) => {
    setTrainStates(prevStates => ({
      ...prevStates,
      [trainName]: {
        sent: false,
        timeRemaining: 0
      }
    }));
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Sort trains: unsent trains by interval (highest to lowest), then sent trains by time remaining (lowest to highest)
  const sortedTrains = [...TRAINS].sort((a, b) => {
    const stateA = trainStates[a.name] || { sent: false, timeRemaining: 0 };
    const stateB = trainStates[b.name] || { sent: false, timeRemaining: 0 };
    
    // If both are sent or both are unsent, sort accordingly
    if (stateA.sent === stateB.sent) {
      if (stateA.sent) {
        // Both sent: sort by time remaining (lowest to highest)
        return stateA.timeRemaining - stateB.timeRemaining;
      } else {
        // Both unsent: sort by interval (highest to lowest)
        return b.interval - a.interval;
      }
    }
    
    // Unsent trains come before sent trains
    return stateA.sent ? 1 : -1;
  });

  // Split trains into two columns
  const leftColumn = sortedTrains.slice(0, 4);
  const rightColumn = sortedTrains.slice(4, 8);

  const renderTrain = (train) => {
    const state = trainStates[train.name] || { sent: false, timeRemaining: 0 };
    return (
      <div 
        key={train.name} 
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '8px',
          padding: '5px',
          backgroundColor: state.sent ? '#ffcccc' : '#ccffcc',
          cursor: 'pointer'
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          resetTrain(train.name);
        }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 'bold', color: '#666' }}>{train.name}</div>
          <div style={{ fontSize: '0.8em', color: '#666' }}>
            Every {train.interval} minutes
          </div>
        </div>
        <div style={{ marginLeft: '10px' }}>
          {state.sent ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.8em', color: '#666' }}>Next in:</div>
              <div style={{ fontWeight: 'bold' }}>{formatTime(state.timeRemaining)}</div>
            </div>
          ) : (
            <button 
              onClick={() => sendTrain(train.name, train.interval)}
              style={{
                padding: '5px 10px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                cursor: 'pointer'
              }}
            >
              Send
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{ 
      border: '2px solid #333', 
      paddingTop: '10px',
      paddingLeft: '10px',
      paddingRight: '10px',
      minWidth: '600px'
    }}>
      <div style={{ fontSize: '1.2em', fontWeight: 'bold', marginBottom: '10px' }}>
        Train Schedule
      </div>
      <div style={{ display: 'flex', gap: '20px' }}>
        <div style={{ flex: 1 }}>
          {leftColumn.map(renderTrain)}
        </div>
        <div style={{ flex: 1 }}>
          {rightColumn.map(renderTrain)}
        </div>
      </div>
    </div>
  );
}

export default TrainSchedule;
