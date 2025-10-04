import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { nanoid } from 'nanoid';

function JoinPage() {
  const [name, setName] = useState('');
  const [team, setTeam] = useState(null); // 'alpha' or 'omega'
  const navigate = useNavigate();

  const handleJoin = async () => {
    if (name.trim() !== '' && team) {
      try {
        const participantId = nanoid();
        const sessionRef = doc(db, 'sessions', 'default-session');

        await setDoc(sessionRef, {
          participants: {
            [participantId]: {
              name: name.trim(),
              team: team,
              disabled: false,
            },
          },
        }, { merge: true });

        navigate(`/participant/${participantId}`);
      } catch (error) {
        console.error("Error joining session: ", error);
      }
    }
  };

  return (
    <div className="join-page-container">
      <div className="card">
        <h1>First Click</h1>
        <p>Enter your name and select your team to join.</p>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your Name"
        />
        <div className="team-selection-container">
          <div
            className={`team-card alpha ${team === 'alpha' ? 'selected' : ''}`}
            onClick={() => setTeam('alpha')}
          >
            <h2>Team Alpha</h2>
          </div>
          <div
            className={`team-card omega ${team === 'omega' ? 'selected' : ''}`}
            onClick={() => setTeam('omega')}
          >
            <h2>Team Omega</h2>
          </div>
        </div>
        <button onClick={handleJoin} disabled={!name.trim() || !team} onKeyPress={(e) => e.key === 'Enter' && handleJoin()}>
          Join Game
        </button>
      </div>
    </div>
  );
}

export default JoinPage;
