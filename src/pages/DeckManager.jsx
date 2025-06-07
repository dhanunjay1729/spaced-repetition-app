import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import ErrorMessage from '../components/ErrorMessage';
import useDecks from '../hooks/useDecks';
import { fetchCards } from '../utils/firestore'; // Import Firestore-based fetchCards
import DeckForm from '../components/DeckForm';

const DeckManager = () => {
    const { decks, loading, error, addDeck, removeDeck } = useDecks();
    const [showForm, setShowForm] = useState(false);
    const [cardCounts, setCardCounts] = useState({}); // State to store card counts for each deck
    const [loadingCards, setLoadingCards] = useState(true); // State for loading card counts

    // Fetch card counts for all decks
    useEffect(() => {
        const fetchCardCounts = async () => {
            try {
                const allCards = await fetchCards(); // Fetch all cards once
                const counts = decks.reduce((acc, deck) => {
                    acc[deck.id] = allCards.filter(card => card.deckId === deck.id).length;
                    return acc;
                }, {});
                setCardCounts(counts);
            } catch (err) {
                handleError(err, 'DeckManager - fetchCardCounts');
            } finally {
                setLoadingCards(false);
            }
        };

        if (decks.length > 0) {
            fetchCardCounts();
        }
    }, [decks]);

    const handleCreateDeck = async (deckData) => {
        try {
            await addDeck(deckData);
            setShowForm(false);
            toast.success('Deck created!');
        } catch (err) {
            toast.error('Failed to create deck!');
        }
    };

    const handleDeleteDeck = async (deckId) => {
        if (window.confirm('Are you sure you want to delete this deck? All cards will be lost!')) {
            try {
                await removeDeck(deckId);
                toast.success('Deck deleted!');
            } catch (err) {
                toast.error('Failed to delete deck!');
            }
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <svg className="animate-spin h-8 w-8 text-gray-600 mr-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                <span className="text-gray-500">Loading decks...</span>
            </div>
        );
    }

    if (error) {
        return <ErrorMessage message={error} />;
    }

    return (
        <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">My Decks</h1>
                {!showForm && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
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
                    {decks.map((deck) => (
                        <div key={deck.id} className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-xl font-semibold mb-2">{deck.name}</h3>
                            <p className="text-gray-500 mb-4">{deck.description || 'No description'}</p>
                            {loadingCards ? (
                                <p className="text-gray-400">Loading cards...</p>
                            ) : (
                                <p className="text-gray-700">
                                    {cardCounts[deck.id] || 0} {cardCounts[deck.id] === 1 ? 'card' : 'cards'}
                                </p>
                            )}
                            <div className="flex justify-between mt-4">
                                <Link
                                    to={`/deck/${deck.id}`}
                                    className="text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    View Deck
                                </Link>
                                <button
                                    onClick={() => handleDeleteDeck(deck.id)}
                                    className="text-red-600 hover:text-red-700 font-medium"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DeckManager;