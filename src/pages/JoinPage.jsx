import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { nanoid } from 'nanoid';

function JoinPage() {
  const [name, setName] = useState('');
  const navigate = useNavigate();

  const handleJoin = async () => {
    if (name.trim() !== '') {
      try {
        const participantId = nanoid();
        const sessionRef = doc(db, 'sessions', 'default-session');

        // Use setDoc with merge to add the new participant to the participants map
        await setDoc(sessionRef, {
          participants: {
            [participantId]: {
              name: name.trim(),
              disabled: false,
            },
          },
        }, { merge: true });

        // Navigate to the participant page with their new ID
        navigate(`/participant/${participantId}`);
      } catch (error) {
        console.error("Error joining session: ", error);
        // Optionally, show an error message to the user
      }
    }
  };

  return (
    <div className="join-page-container">
      <div className="card">
        <h1>First Click</h1>
        <p>Enter your name to join the game.</p>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your Name"
          onKeyPress={(e) => e.key === 'Enter' && handleJoin()}
        />
        <button onClick={handleJoin}>Join</button>
      </div>
    </div>
  );
}

export default JoinPage;
