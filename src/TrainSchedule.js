import React, { useState, useEffect } from 'react';

const TRAINS = [
  { name: 'Northwest Railways', interval: 58 },
  { name: 'sim rail grade', interval: 63 },
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

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ 
      border: '2px solid #333', 
      padding: '10px', 
      backgroundColor: 'lightblue',
      minWidth: '300px'
    }}>
      <div style={{ fontSize: '1.2em', fontWeight: 'bold', marginBottom: '10px' }}>
        Train Schedule
      </div>
      {TRAINS.map(train => {
        const state = trainStates[train.name];
        return (
          <div key={train.name} style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '8px',
            padding: '5px',
            backgroundColor: state.sent ? '#ffcccc' : '#ccffcc'
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 'bold' }}>{train.name}</div>
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
      })}
    </div>
  );
}

export default TrainSchedule;
