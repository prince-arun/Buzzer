import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, onSnapshot, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

function ParticipantPage() {
  const { id } = useParams();
  const [sessionState, setSessionState] = useState(null); // Null indicates initial loading state

  useEffect(() => {
    const sessionRef = doc(db, 'sessions', 'default-session');
    const unsubscribe = onSnapshot(sessionRef, (doc) => {
      setSessionState(doc.exists() ? doc.data() : {}); // If doc doesn't exist, set empty object
    });
    return () => unsubscribe();
  }, [id]);

  const handleButtonClick = async () => {
    const participant = sessionState?.participants?.[id];
    const buttonEnabled = sessionState?.buttonEnabled || false;
    const clicked = sessionState?.clicks?.[id] ? true : false;

    if (buttonEnabled && !clicked && participant && !participant.disabled) {
      try {
        const sessionRef = doc(db, 'sessions', 'default-session');
        await updateDoc(sessionRef, { 
            [`clicks.${id}`]: serverTimestamp(),
            buttonEnabled: false 
        });
      } catch (error) {
        console.error("Error recording click: ", error);
      }
    }
  };

  // --- Intelligent Render Logic ---
  const renderContent = () => {
    // 1. LOADING STATE: Wait for the first data snapshot to arrive.
    if (sessionState === null) {
      return <h1>Loading...</h1>;
    }

    const participant = sessionState.participants?.[id];
    const buttonEnabled = sessionState.buttonEnabled || false;
    const clicked = sessionState.clicks?.[id] ? true : false;
    const roundOver = sessionState.clicks && Object.keys(sessionState.clicks).length > 0;

    // 2. REMOVED STATE: Check for removal *after* loading is complete.
    // This is only true if the participants object exists, but the user's id is not in it.
    if (sessionState.participants && !participant) {
       return <h1>You have been removed from the session.</h1>;
    }

    // From here, we can assume the participant exists.

    // 3. DISABLED STATE
    if (participant?.disabled) {
      return <h1>Your participation has been disabled by the host.</h1>;
    }

    // 4. CLICKED STATE
    if (clicked) {
      return <h1>You clicked!</h1>;
    }

    if (roundOver) {
        return <h1>The button has been clicked! Waiting for next round.</h1>;
    }

    // 5. ACTIVE BUTTON STATE
    if (buttonEnabled) {
      return (
        <button onClick={handleButtonClick} className="press-button">
          Press Me!
        </button>
      );
    }

    // 6. WAITING STATE (Default)
    return (
      <div className="waiting-message">
        <h1>Wait for the button...</h1>
        <p>Hi, {participant?.name || 'participant'}! The host will enable the button soon.</p>
      </div>
    );
  };

  return (
    <div className="participant-page-container">
      <div className="card participant-card">
        {renderContent()}
      </div>
    </div>
  );
}

export default ParticipantPage;
