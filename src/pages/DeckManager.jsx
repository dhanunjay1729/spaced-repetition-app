import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import ErrorMessage from '../components/ErrorMessage';
import useDecks from '../hooks/useDecks';
import DeckForm from '../components/DeckForm';
import { loadCards } from '../utils/localStorage'; // Import function to load cards

const DeckManager = () => {
    const navigate = useNavigate();
    const { decks, loading, error, addDeck, deleteDeck } = useDecks();
    const [showForm, setShowForm] = useState(false);

    const handleCreateDeck = (deckData) => {
        try {
            const newDeck = addDeck(deckData);
            setShowForm(false);
            toast.success('Deck created!');
            navigate(`/deck/${newDeck.id}`);
        } catch (err) {
            toast.error('Failed to create deck!');
        }
    };

    const handleDeleteDeck = (deckId, event) => {
        event.stopPropagation();
        if (window.confirm('Are you sure you want to delete this deck? All cards will be lost!')) {
            try {
                // Delete associated cards
                const allCards = JSON.parse(localStorage.getItem('sra_cards') || '[]');
                const remainingCards = allCards.filter(card => card.deckId !== deckId);
                localStorage.setItem('sra_cards', JSON.stringify(remainingCards));
                // Delete deck
                deleteDeck(deckId);
                toast('Deck deleted', { icon: '🗑️' });
            } catch (err) {
                toast.error('Failed to delete deck!');
            }
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <svg className="animate-spin h-8 w-8 text-slate-600 mr-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                <span className="text-gray-500">Loading decks...</span>
            </div>
        );
    }

    if (error) {
        return <ErrorMessage message={error} />;
    }

    // Load all cards from localStorage
    const allCards = loadCards();

    return (
        <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">My Decks</h1>
                {!showForm && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="px-6 py-2 bg-slate-600 text-white font-medium rounded-lg hover:bg-slate-700 transition"
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
                            className="text-slate-600 hover:text-slate-700 font-medium"
                        >
                            Create a deck
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {decks.map(deck => {
                        // Calculate the number of cards dynamically
                        const cardCount = allCards.filter(card => card.deckId === deck.id).length;

                        return (
                            <Link
                                key={deck.id}
                                to={`/deck/${deck.id}`}
                                className="relative group"
                            >
                                <div className="bg-gradient-to-r from-slate-500 to-gray-500 text-white rounded-lg shadow-md p-6 hover:shadow-xl transition transform hover:scale-105">
                                    <h3 className="text-xl font-semibold mb-2">{deck.name}</h3>
                                    <div className="text-gray-200">
                                        <p className="text-sm mb-1">{deck.description || 'No description'}</p>
                                        <p className="font-medium">{cardCount} {cardCount === 1 ? 'card' : 'cards'}</p>
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
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default DeckManager;