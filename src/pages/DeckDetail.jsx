import React, { useState, useEffect } from 'react';
//useParams is used to access the dynamic part of the URL
//useNavigate is used to programmatically navigate to a different route
//Link is used to create links that navigate to different routes in the app
import { useParams, Link, useNavigate } from 'react-router-dom';
//custom hooks used to fetch decks and cards data
import useDecks from '../hooks/useDecks';
import useCards from '../hooks/useCards';
import CardForm from '../components/CardForm';
import Card from '../components/Card';

const DeckDetail = () => {
    // the current deckId is extracted from the URL parameters
    const { deckId } = useParams();
    // useNavigate is used to programmatically navigate to a different route
    const navigate = useNavigate();
    //all decks from the custom hook useDecks
    const { decks } = useDecks();
    const { cards, loading, addCard, updateCard, deleteCard } = useCards(deckId);
    const [showForm, setShowForm] = useState(false);
    const [editingCard, setEditingCard] = useState(null);
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'preview'

    // Find current deck
    const deck = decks.find(d => d.id === deckId);

    useEffect(() => {
        // If no deck is found, navigate to decks list
        if (!loading && !deck) {
            navigate('/decks');
        }
    }, [deck, loading, navigate]);

    const handleCreateCard = (cardData) => {
        addCard({ ...cardData, deckId });
        setShowForm(false);
    };

    const handleUpdateCard = (cardData) => {
        if (editingCard) {
            updateCard(editingCard.id, cardData);
            setEditingCard(null);
            setShowForm(false);
        }
    };

    const handleDeleteCard = (cardId) => {
        if (window.confirm('Are you sure you want to delete this card?')) {
            deleteCard(cardId);
        }
    };

    const handleEditCard = (card) => {
        setEditingCard(card);
        setShowForm(true);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <p className="text-gray-500">Loading...</p>
            </div>
        );
    }

    if (!deck) return null;

    return (
        <div className="container mx-auto p-6">
            {/* Header */}
            <div className="mb-8">
                <Link
                    to="/decks"
                    className="text-blue-600 hover:text-blue-700 mb-4 inline-block"
                >
                    ← Back to Decks
                </Link>
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">{deck.name}</h1>
                        {deck.description && (
                            <p className="text-gray-600">{deck.description}</p>
                        )}
                        <p className="text-sm text-gray-500 mt-2">
                            {cards.length} {cards.length === 1 ? 'card' : 'cards'}
                        </p>
                    </div>
                    <div className="flex gap-4">
                        {cards.length > 0 && (
                            <Link
                                to={`/study/${deckId}`}
                                className="px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700"
                            >
                                Study Now
                            </Link>
                        )}
                        {!showForm && (
                            <button
                                onClick={() => {
                                    setEditingCard(null);
                                    setShowForm(true);
                                }}
                                className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
                            >
                                + Add Card
                            </button>
                        )}
                    </div>
                </div>
            </div>
            {/* View Mode Toggle */}
            {cards.length > 0 && !showForm && (
                <div className="mb-6 flex gap-2">
                    <button
                        onClick={() => setViewMode('list')}
                        className={`px-4 py-2 rounded-lg transition ${
                            viewMode === 'list'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        List View
                    </button>
                    <button
                        onClick={() => setViewMode('preview')}
                        className={`px-4 py-2 rounded-lg transition ${
                            viewMode === 'preview'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        Preview Cards
                    </button>
                </div>
            )}
            {/* Card Form */}
            {showForm && (
                <div className="mb-8">
                    <CardForm
                        onSubmit={editingCard ? handleUpdateCard : handleCreateCard}
                        onCancel={() => {
                            setShowForm(false);
                            setEditingCard(null);
                        }}
                        initialData={editingCard}
                    />
                </div>
            )}
            {/* Cards Display */}
            {!showForm && cards.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow-md">
                    <p className="text-gray-500 mb-4">No cards in this deck yet.</p>
                    <button
                        onClick={() => setShowForm(true)}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                        Create your first card
                    </button>
                </div>
            ) : (
                <>
                    {viewMode === 'list' ? (
                        <div className="space-y-4">
                            {cards.map(card => (
                                <div
                                    key={card.id}
                                    className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition"
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-800 mb-2">
                                                Q: {card.question}
                                            </h3>
                                            <p className="text-gray-600">A: {card.answer}</p>
                                        </div>
                                        <div className="flex gap-2 ml-4">
                                            <button
                                                onClick={() => handleEditCard(card)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                                                title="Edit card"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13l6.293-6.293a1 1 0 011.414 0l1.586 1.586a1 1 0 010 1.414L12 17H9v-3z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => handleDeleteCard(card.id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded"
                                                title="Delete card"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {cards.map(card => (
                                <Card
                                    key={card.id}
                                    question={card.question}
                                    answer={card.answer}
                                />
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default DeckDetail;