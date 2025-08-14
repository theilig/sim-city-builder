import React, { useState, useEffect } from 'react';

const TRAINS = [
  { name: 'Northwest Railways', interval: 58, earnings: 167 },
  { name: 'Sim Rail Grade', interval: 63, earnings: 254 },
  { name: 'ES Super Sim', interval: 58, earnings: 185 },
  { name: 'LM Grade 23', interval: 26, earnings: 102 },
  { name: 'Llama Line 350', interval: 27, earnings: 141 },
  { name: 'Quail QP1', interval: 18, earnings: 59 },
  { name: 'Flying Sim', interval: 12, earnings: 52 },
  { name: 'Simeo Plus B', interval: 8, earnings: 30 }
];

function TrainSchedule() {
  const [trainStates, setTrainStates] = useState(() => {
    const initialState = {};
    TRAINS.forEach(train => {
      initialState[train.name] = {
        sent: false,
        endTime: 0
      };
    });
    return initialState;
  });

  const [sendHistory, setSendHistory] = useState([]);
  const [, forceUpdate] = useState({});

  useEffect(() => {
    const interval = setInterval(() => {
      // Force re-render to update timers
      forceUpdate({});
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const sendTrain = (trainName, intervalMinutes) => {
    const train = TRAINS.find(t => t.name === trainName);
    const now = Date.now();
    
    setTrainStates(prevStates => ({
      ...prevStates,
      [trainName]: {
        sent: true,
        endTime: now + (intervalMinutes * 60 * 1000) // Convert minutes to milliseconds
      }
    }));
    
    // Record send in history
    setSendHistory(prevHistory => [...prevHistory, {
      trainName,
      earnings: train.earnings,
      timestamp: now
    }]);
  };

  const resetTrain = (trainName) => {
    setTrainStates(prevStates => ({
      ...prevStates,
      [trainName]: {
        sent: false,
        endTime: 0
      }
    }));
  };

  const resetEarningsTracking = () => {
    const now = Date.now();
    const newSendHistory = [];
    
    TRAINS.forEach(train => {
      const state = trainStates[train.name] || { sent: false, endTime: 0 };
      const isSent = state.sent && state.endTime > now;
      
      if (isSent) {
        // Train is currently running - add prorated earnings for remaining time
        const remainingMinutes = (state.endTime - now) / (60 * 1000);
        const proratedEarnings = (remainingMinutes / train.interval) * train.earnings;
        
        // Add the prorated earnings as if earned at the end of the current run
        newSendHistory.push({
          trainName: train.name,
          earnings: proratedEarnings,
          timestamp: state.endTime
        });
        
        // Then add subsequent full runs starting from when this one completes
        let nextSendTime = state.endTime + (train.interval * 60 * 1000);
        newSendHistory.push({
          trainName: train.name,
          earnings: train.earnings,
          timestamp: nextSendTime
        });
      }
      // Note: Unsent trains are NOT added to sendHistory
      // They only affect max calculation, not actual earnings
    });
    
    setSendHistory(newSendHistory);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Calculate actual earnings per minute based on send history (last 60 minutes)
  const now = Date.now();
  
  // Calculate theoretical maximum earnings per minute if all trains sent optimally from start
  // Assumes 1 minute to send initial batch, then sent immediately when available
  const sessionStartTime = sendHistory[0]?.timestamp || now;
  const minutesElapsed = Math.max(1, (now - sessionStartTime) / (60 * 1000));
  
  let maxEarningsPerMinute;
  
  if (sendHistory.length === 0) {
    // Fresh page load - show potential if all trains sent in next minute
    maxEarningsPerMinute = TRAINS.reduce((total, train) => total + train.earnings, 0);
  } else {
    // Calculate sustainable earning rate: initial burst + continuous cycling
    const initialBurst = TRAINS.reduce((total, train) => total + train.earnings, 0); // 990
    const cycleRate = TRAINS.reduce((total, train) => total + (train.earnings / train.interval), 0); // 30.6 per minute
    
    if (minutesElapsed <= 1) {
      maxEarningsPerMinute = initialBurst; // Show the 990 potential
    } else {
      // Total theoretical earnings: 990 initial + continuous earning at cycle rate
      // At time T: 990 + T * 30.6, so average per minute = (990 + T * 30.6) / T
      const totalEarnings = initialBurst + (minutesElapsed * cycleRate);
      maxEarningsPerMinute = totalEarnings / minutesElapsed;
    }
  }
  
  const oneHourAgo = now - (60 * 60 * 1000);
  const recentSends = sendHistory.filter(send => send.timestamp >= oneHourAgo);
  const totalEarnings = recentSends.reduce((total, send) => total + send.earnings, 0);
  const actualMinutesElapsed = Math.max(1, (now - (sendHistory[0]?.timestamp || now)) / (60 * 1000));
  const actualEarningsPerMinute = sendHistory.length > 0 ? totalEarnings / Math.min(60, actualMinutesElapsed) : 0;

  // Sort trains: unsent trains by interval (highest to lowest), then sent trains by time remaining (lowest to highest)
  const sortedTrains = [...TRAINS].sort((a, b) => {
    const stateA = trainStates[a.name] || { sent: false, endTime: 0 };
    const stateB = trainStates[b.name] || { sent: false, endTime: 0 };
    
    // Check if trains are actually still sent (endTime hasn't passed)
    const isSentA = stateA.sent && stateA.endTime > now;
    const isSentB = stateB.sent && stateB.endTime > now;
    
    // If both are sent or both are unsent, sort accordingly
    if (isSentA === isSentB) {
      if (isSentA) {
        // Both sent: sort by time remaining (lowest to highest)
        const remainingA = stateA.endTime - now;
        const remainingB = stateB.endTime - now;
        return remainingA - remainingB;
      } else {
        // Both unsent: sort by interval (highest to lowest)
        return b.interval - a.interval;
      }
    }
    
    // Unsent trains come before sent trains
    return isSentA ? 1 : -1;
  });

  // Split trains into two columns
  const leftColumn = sortedTrains.slice(0, 4);
  const rightColumn = sortedTrains.slice(4, 8);

  const renderTrain = (train) => {
    const state = trainStates[train.name] || { sent: false, endTime: 0 };
    
    // Calculate if train is actually still sent and remaining time
    const isSent = state.sent && state.endTime > now;
    const remainingTime = isSent ? Math.max(0, Math.ceil((state.endTime - now) / 1000)) : 0;
    return (
      <div 
        key={train.name} 
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '8px',
          padding: '5px',
          backgroundColor: isSent ? '#ffcccc' : '#ccffcc',
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
            Every {train.interval} minutes • Earns {train.earnings}
          </div>
        </div>
        <div style={{ marginLeft: '10px' }}>
          {isSent ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.8em', color: '#666' }}>Next in:</div>
              <div style={{ fontWeight: 'bold' }}>{formatTime(remainingTime)}</div>
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
      <div style={{ marginTop: '10px', fontSize: '0.9em', color: '#666', display: 'flex', gap: '20px' }}>
        <div 
          style={{ cursor: 'pointer' }}
          onContextMenu={(e) => {
            e.preventDefault();
            resetEarningsTracking();
          }}
        >
          Max per minute: {maxEarningsPerMinute.toFixed(1)}
        </div>
        <div 
          style={{ cursor: 'pointer' }}
          onContextMenu={(e) => {
            e.preventDefault();
            resetEarningsTracking();
          }}
        >
          Actual per minute: {actualEarningsPerMinute.toFixed(1)}
        </div>
      </div>
    </div>
  );
}

export default TrainSchedule;
