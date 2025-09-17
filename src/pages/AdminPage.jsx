
import React, { useState, useEffect } from 'react';
import { doc, onSnapshot, updateDoc, serverTimestamp, deleteField } from 'firebase/firestore';
import { db } from '../firebase';
import Sidebar from './admin/Sidebar';
import './admin/Admin.css';
import { FiUsers, FiZap, FiAward, FiLock, FiUnlock } from 'react-icons/fi';
import { FaCrown } from 'react-icons/fa';

// Stat Card Component
const StatCard = ({ icon, color, title, value }) => (
  <div className="stat-card">
    <div className="stat-card-icon" style={{ backgroundColor: color }}>{icon}</div>
    <div className="stat-card-info">
      <h3>{value}</h3>
      <p>{title}</p>
    </div>
  </div>
);

function AdminPage() {
  const [sessionState, setSessionState] = useState({
    participants: {},
    clicks: {},
    buttonEnabled: false,
    sessionLocked: false,
    enabledTimestamp: null
  });

  useEffect(() => {
    const sessionRef = doc(db, 'sessions', 'default-session');
    const unsubscribe = onSnapshot(sessionRef, (doc) => {
      if (doc.exists()) {
        setSessionState(doc.data());
      } else {
        setSessionState({
          participants: {}, clicks: {}, buttonEnabled: false, sessionLocked: false, enabledTimestamp: null
        });
      }
    });
    return () => unsubscribe();
  }, []);

  // --- Handler Functions ---
  const handleEnableButton = () => updateDoc(doc(db, 'sessions', 'default-session'), { buttonEnabled: true, enabledTimestamp: serverTimestamp() });
  const handleDisableButton = () => updateDoc(doc(db, 'sessions', 'default-session'), { buttonEnabled: false });
  const handleResetGame = () => updateDoc(doc(db, 'sessions', 'default-session'), { clicks: {}, buttonEnabled: false, enabledTimestamp: null });
  const handleLockSession = () => updateDoc(doc(db, 'sessions', 'default-session'), { sessionLocked: true });
  const handleUnlockSession = () => updateDoc(doc(db, 'sessions', 'default-session'), { sessionLocked: false });
  const handleToggleDisableParticipant = (id) => updateDoc(doc(db, 'sessions', 'default-session'), { [`participants.${id}.disabled`]: !sessionState.participants[id]?.disabled });
  const handleRemoveParticipant = (id) => updateDoc(doc(db, 'sessions', 'default-session'), { [`participants.${id}`]: deleteField(), [`clicks.${id}`]: deleteField() });

  // --- Data Processing ---
  const sortedClicks = Object.entries(sessionState.clicks || {})
    .map(([id, clickTimestamp]) => {
      let speed = null;
      // Robust validation to prevent crash from malformed data
      if (
        sessionState.enabledTimestamp &&
        typeof sessionState.enabledTimestamp.toMillis === 'function' &&
        clickTimestamp && // Check if clickTimestamp exists
        typeof clickTimestamp.toMillis === 'function' // Check for the required method
      ) {
        speed = (clickTimestamp.toMillis() - sessionState.enabledTimestamp.toMillis()) / 1000;
      }
      return { id, speed };
    })
    .filter(click => click.speed !== null && click.speed >= 0)
    .sort((a, b) => a.speed - b.speed);

  const fastestClick = sortedClicks.length > 0 ? `${sortedClicks[0].speed.toFixed(3)}s` : 'N/A';

  return (
    <div className="admin-dashboard-container">
      <Sidebar />
      <main className="admin-main-content">
        <header className="admin-header">
          <h1>Admin Dashboard</h1>
          <p>Welcome back! Manage your "First Click" game session here.</p>
        </header>

        <div className="stat-cards-container">
          <StatCard icon={<FiUsers />} color="#4A55E1" title="Total Participants" value={Object.keys(sessionState.participants || {}).length} />
          <StatCard icon={<FiZap />} color="#38B2AC" title="Total Clicks" value={Object.keys(sessionState.clicks || {}).length} />
          <StatCard icon={<FiAward />} color="#ED8936" title="Fastest Click" value={fastestClick} />
          <StatCard icon={sessionState.sessionLocked ? <FiLock /> : <FiUnlock />} color="#E53E3E" title="Session Status" value={sessionState.sessionLocked ? 'Locked' : 'Open'} />
        </div>

        <div className="content-grid">
          <div className="content-card">
            <h2>Results</h2>
            <table className="data-table">
              <thead><tr><th>Rank</th><th>Name</th><th>Time</th></tr></thead>
              <tbody>
                {sortedClicks.map((click, index) => (
                  <tr key={click.id} className={index === 0 ? 'winner' : ''}>
                    <td>{index + 1}{index === 0 && <FaCrown className='winner-badge'/>}</td>
                    <td>{sessionState.participants[click.id]?.name || 'Unknown'}</td>
                    <td className='speed'>+{click.speed.toFixed(3)}s</td>
                  </tr>
                ))}
                 {sortedClicks.length === 0 && <tr><td colSpan="3">No clicks recorded yet.</td></tr>}
              </tbody>
            </table>
          </div>

          <div className="content-card">
            <div style={{marginBottom: '2rem'}}>
                <h2>Game Controls</h2>
                <div className="game-controls">
                    <button onClick={handleEnableButton} disabled={sessionState.buttonEnabled} className="button-main">Enable Button</button>
                    <button onClick={handleDisableButton} disabled={!sessionState.buttonEnabled} className="button-secondary">Disable Button</button>
                    <button onClick={sessionState.sessionLocked ? handleUnlockSession : handleLockSession} className="button-secondary">{sessionState.sessionLocked ? 'Unlock Session' : 'Lock Session'}</button>
                    <button onClick={handleResetGame} className="button-remove">Reset Game</button>
                </div>
            </div>
            <div>
                <h2>Participants</h2>
                 {Object.entries(sessionState.participants || {}).map(([id, participant]) => (
                    <div key={id} className="participant-list-item">
                        <span className={`participant-name ${participant.disabled ? 'disabled' : ''}`}>{participant.name}</span>
                        <div className="participant-actions">
                            <button onClick={() => handleToggleDisableParticipant(id)} className="button-disable">{participant.disabled ? 'Enable' : 'Disable'}</button>
                            <button onClick={() => handleRemoveParticipant(id)} className="button-remove">Remove</button>
                        </div>
                    </div>
                ))}
                {Object.keys(sessionState.participants || {}).length === 0 && <p>No participants have joined yet.</p>}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminPage;
