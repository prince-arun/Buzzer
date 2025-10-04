
import React, { useState, useEffect } from 'react';
import { doc, onSnapshot, updateDoc, serverTimestamp, deleteField, increment } from 'firebase/firestore';
import { db } from '../firebase';
import Sidebar from './admin/Sidebar';
import './admin/Admin.css';
import { FiUsers, FiZap, FiAward, FiLock, FiUnlock, FiPlus, FiMinus } from 'react-icons/fi';
import { FaCrown } from 'react-icons/fa';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

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
    enabledTimestamp: null,
    scores: { alpha: 0, omega: 0 }
  });

  useEffect(() => {
    const sessionRef = doc(db, 'sessions', 'default-session');
    const unsubscribe = onSnapshot(sessionRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setSessionState({
          ...data,
          scores: data.scores || { alpha: 0, omega: 0 } // Ensure scores object exists
        });
      } else {
        setSessionState({
          participants: {}, clicks: {}, buttonEnabled: false, sessionLocked: false, enabledTimestamp: null, scores: { alpha: 0, omega: 0 }
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
  const handleUpdateScore = (team, amount) => {
    const sessionRef = doc(db, 'sessions', 'default-session');
    updateDoc(sessionRef, {
      [`scores.${team}`]: increment(amount)
    });
  };

  // --- Data Processing ---
  const sortedClicks = Object.entries(sessionState.clicks || {})
    .map(([id, clickTimestamp]) => {
      let speed = null;
      if (
        sessionState.enabledTimestamp &&
        typeof sessionState.enabledTimestamp.toMillis === 'function' &&
        clickTimestamp &&
        typeof clickTimestamp.toMillis === 'function'
      ) {
        speed = (clickTimestamp.toMillis() - sessionState.enabledTimestamp.toMillis()) / 1000;
      }
      return { id, speed, team: sessionState.participants[id]?.team };
    })
    .filter(click => click.speed !== null && click.speed >= 0)
    .sort((a, b) => a.speed - b.speed);

  const fastestClick = sortedClicks.length > 0 ? `${sortedClicks[0].speed.toFixed(3)}s` : 'N/A';

  const chartData = {
    labels: ['Team Alpha', 'Team Omega'],
    datasets: [
      {
        label: 'Scores',
        data: [sessionState.scores.alpha, sessionState.scores.omega],
        backgroundColor: [
          'rgba(255, 7, 58, 0.6)',
          'rgba(5, 150, 105, 0.6)',
        ],
        borderColor: [
          'rgba(255, 7, 58, 1)',
          'rgba(5, 150, 105, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Team Scores',
        color: '#dcdcdc'
      },
    },
    scales: {
        y: {
            beginAtZero: true,
            ticks: {
                color: '#dcdcdc'
            },
            grid: {
                color: 'rgba(255, 255, 255, 0.1)'
            }
        },
        x: {
            ticks: {
                color: '#dcdcdc'
            },
            grid: {
                display: false
            }
        }
    }
  };

  const getLeadingTeam = () => {
    if (sessionState.scores.alpha > sessionState.scores.omega) {
      return { team: 'alpha', message: 'Team Alpha is winning!' };
    }
    if (sessionState.scores.omega > sessionState.scores.alpha) {
      return { team: 'omega', message: 'Team Omega is winning!' };
    }
    return { team: 'tie', message: 'Scores are tied!' };
  };

  const leadingTeam = getLeadingTeam();

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
              <thead><tr><th>Rank</th><th>Name</th><th>Team</th><th>Time</th></tr></thead>
              <tbody>
                {sortedClicks.map((click, index) => (
                  <tr key={click.id} className={index === 0 ? 'winner' : ''}>
                    <td>{index + 1}{index === 0 && <FaCrown className='winner-badge'/>}</td>
                    <td>{sessionState.participants[click.id]?.name || 'Unknown'}</td>
                    <td className={`team-cell team-${click.team}`}>{click.team || 'N/A'}</td>
                    <td className='speed'>+{click.speed.toFixed(3)}s</td>
                  </tr>
                ))}
                 {sortedClicks.length === 0 && <tr><td colSpan="4">No clicks recorded yet.</td></tr>}
              </tbody>
            </table>
          </div>

          <div className="content-card">
             <div className="score-management-container">
                <h2>Score Management</h2>
                <div className={`leading-team-indicator ${leadingTeam.team}`}>
                  {leadingTeam.message}
                </div>
                <div className="score-chart">
                    <Bar options={chartOptions} data={chartData} />
                </div>
                <div className="score-controls">
                    <div className="score-team">
                        <h3>Team Alpha: {sessionState.scores.alpha}</h3>
                        <div>
                            <button onClick={() => handleUpdateScore('alpha', 1)} className="button-score"><FiPlus/></button>
                            <button onClick={() => handleUpdateScore('alpha', -1)} className="button-score"><FiMinus/></button>
                        </div>
                    </div>
                    <div className="score-team">
                        <h3>Team Omega: {sessionState.scores.omega}</h3>
                        <div>
                            <button onClick={() => handleUpdateScore('omega', 1)} className="button-score"><FiPlus/></button>
                            <button onClick={() => handleUpdateScore('omega', -1)} className="button-score"><FiMinus/></button>
                        </div>
                    </div>
                </div>
            </div>
          </div>
        </div>

         <div className="content-grid">
            <div className="content-card">
                <h2>Game Controls</h2>
                <div className="game-controls">
                    <button onClick={handleEnableButton} disabled={sessionState.buttonEnabled} className="button-main">Enable Button</button>
                    <button onClick={handleDisableButton} disabled={!sessionState.buttonEnabled} className="button-secondary">Disable Button</button>
                    <button onClick={sessionState.sessionLocked ? handleUnlockSession : handleLockSession} className="button-secondary">{sessionState.sessionLocked ? 'Unlock Session' : 'Lock Session'}</button>
                    <button onClick={handleResetGame} className="button-remove">Reset Game</button>
                </div>
            </div>
             <div className="content-card">
                <h2>Participants</h2>
                 {Object.entries(sessionState.participants || {}).map(([id, participant]) => (
                    <div key={id} className="participant-list-item">
                        <span className={`participant-name ${participant.disabled ? 'disabled' : ''}`}>{participant.name} <span className={`team-badge team-${participant.team}`}>{participant.team}</span></span>
                        <div className="participant-actions">
                            <button onClick={() => handleToggleDisableParticipant(id)} className="button-disable">{participant.disabled ? 'Enable' : 'Disable'}</button>
                            <button onClick={() => handleRemoveParticipant(id)} className="button-remove">Remove</button>
                        </div>
                    </div>
                ))}
                {Object.keys(sessionState.participants || {}).length === 0 && <p>No participants have joined yet.</p>}
            </div>
         </div>
      </main>
    </div>
  );
}

export default AdminPage;
