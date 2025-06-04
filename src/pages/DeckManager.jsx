import React, { useState } from 'react';
import useDecks from '../hooks/useDecks';
import DeckPreview from '../components/DeckPreview';
import DeckForm from '../components/DeckForm';

const DeckManager = () => {
    const { decks, loading, addDeck, deleteDeck } = useDecks();
    const [showForm, setShowForm] = useState(false);

    const handleCreateDeck = (deckData) => {
        addDeck(deckData);
        setShowForm(false);
    };

    const handleDeleteDeck = (deckId) => {
        if (window.confirm('Are you sure you want to delete this deck?')) {
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
                <div className="text-center py-12">
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
                    {decks.map((deck) => (
                        <div key={deck.id} className="relative group">
                            <DeckPreview
                                name={deck.name}
                                cardCount={deck.cardCount || 0}
                                dueCount={0}
                            />
                            <button
                                onClick={() => handleDeleteDeck(deck.id)}
                                className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Delete deck"
                            >
                                <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DeckManager;