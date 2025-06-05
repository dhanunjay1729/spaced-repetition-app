import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useDecks from '../hooks/useDecks';
import DeckForm from '../components/DeckForm';

const DeckManager = () => {
    const navigate = useNavigate();
    const { decks, loading, addDeck, deleteDeck } = useDecks();
    const [showForm, setShowForm] = useState(false);

    const handleCreateDeck = (deckData) => {
        const newDeck = addDeck(deckData);
        setShowForm(false);
        // Navigate to the new deck
        navigate(`/deck/${newDeck.id}`);
    };

    const handleDeleteDeck = (deckId, event) => {
        event.stopPropagation(); // Prevent navigation when clicking delete
        if (window.confirm('Are you sure you want to delete this deck? All cards will be lost!')) {
            // Delete associated cards
            const allCards = JSON.parse(localStorage.getItem('sra_cards') || '[]');
            const remainingCards = allCards.filter(card => card.deckId !== deckId);
            localStorage.setItem('sra_cards', JSON.stringify(remainingCards));
            // Delete deck
            deleteDeck(deckId);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <p className="text-gray-500">Loading decks...</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">My Decks</h1>
                {!showForm && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
                    >
                        + New Deck
                    </button>
                )}
            </div>
            {showForm && (
                <div className="mb-8">
                    <DeckForm
                        onSubmit={handleCreateDeck}
                        onCancel={() => setShowForm(false)}
                    />
                </div>
            )}
            {decks.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow-md">
                    <p className="text-gray-500 mb-4">No decks yet. Create your first deck!</p>
                    {!showForm && (
                        <button
                            onClick={() => setShowForm(true)}
                            className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                            Create a deck
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {decks.map(deck => (
                        <Link
                            key={deck.id}
                            to={`/deck/${deck.id}`}
                            className="relative group"
                        >
                            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                                <h3 className="text-xl font-semibold mb-2">{deck.name}</h3>
                                <div className="text-gray-600">
                                    <p className="text-sm mb-1">{deck.description || 'No description'}</p>
                                    <p className="font-medium">{deck.cardCount || 0} cards</p>
                                </div>
                            </div>
                            <button
                                onClick={(e) => handleDeleteDeck(deck.id, e)}
                                className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded opacity-0 group-hover:opacity-100 transition"
                                title="Delete deck"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};
export default DeckManager;