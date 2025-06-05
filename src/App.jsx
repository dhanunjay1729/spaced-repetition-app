//this file defines app's main layout and routing structure
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import DeckManager from './pages/DeckManager';
import DeckDetail from './pages/DeckDetail';
import StudySession from './pages/StudySession';
import Dashboard from './pages/Dashboard';

function App() {
    return (
        <div className="min-h-screen bg-gray-100">
            <Header />
            <main>
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/decks" element={<DeckManager />} />
                    <Route path="/deck/:deckId" element={<DeckDetail />} />
                    <Route path="/study/:deckId" element={<StudySession />} />
                </Routes>
            </main>
        </div>
    );
}

export default App;