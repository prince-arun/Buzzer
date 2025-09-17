import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import JoinPage from './pages/JoinPage';
import ParticipantPage from './pages/ParticipantPage';
import AdminPage from './pages/AdminPage'; // This path is now correct
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<JoinPage />} />
        <Route path="/participant/:id" element={<ParticipantPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
