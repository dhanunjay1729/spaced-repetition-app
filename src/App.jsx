import React, { useState } from 'react';
import Header from './components/Header';
import DeckManager from './pages/DeckManager';

function App() {
    const [currentPage, setCurrentPage] = useState('decks');

    return (
        <div className="min-h-screen bg-gray-100">
            <Header />
            <main>
                {currentPage === 'decks' && <DeckManager />}
                {/* We'll add more pages later */}
            </main>
        </div>
    );
}

export default App;