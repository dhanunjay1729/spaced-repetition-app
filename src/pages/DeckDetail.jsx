import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import useDecks from '../hooks/useDecks';
import useCards from '../hooks/useCards';
import CardForm from '../components/CardForm';
import ErrorMessage from '../components/ErrorMessage';
import StudyProgress from '../components/StudyProgress';
import Card from '../components/Card';

const DeckDetail = () => {
    const { deckId } = useParams();
    const { decks } = useDecks();
    const { cards, error, addCard, updateCard, deleteCard } = useCards(deckId);

    const [showForm, setShowForm] = useState(false);
    const [editingCard, setEditingCard] = useState(null);
    const [viewMode, setViewMode] = useState('list');

    const deck = decks.find(d => d.id === deckId);

    if (error) {
        return <ErrorMessage message={error} />;
    }

    const handleCreateCard = (cardData) => {
        try {
            addCard({ ...cardData, deckId });
            setShowForm(false);
            toast.success('Card added!');
        } catch (err) {
            toast.error('Failed to add card!');
        }
    };

    const handleUpdateCard = (cardData) => {
        try {
            updateCard(cardData.id, cardData);
            setShowForm(false);
            setEditingCard(null);
            toast.success('Card updated!');
        } catch (err) {
            toast.error('Failed to update card!');
        }
    };

    const handleDeleteCard = (cardId) => {
        if (window.confirm('Are you sure you want to delete this card?')) {
            try {
                deleteCard(cardId);
                toast('Card deleted', { icon: '🗑️' });
            } catch (err) {
                toast.error('Failed to delete card!');
            }
        }
    };

    const handleEditCard = (card) => {
        setEditingCard(card);
        setShowForm(true);
    };

    if (!deck) {
        return <ErrorMessage message="Deck not found." />;
    }

    return (
        <div className="container mx-auto p-6 max-w-5xl">
            {/* Header */}
            <div className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <Link
                        to="/decks"
                        className="text-blue-600 hover:text-blue-700 mb-2 inline-block"
                    >
                        ← Back to Decks
                    </Link>
                    <h1 className="text-3xl font-bold mb-1">{deck.name}</h1>
                    {deck.description && (
                        <p className="text-gray-600 mb-1">{deck.description}</p>
                    )}
                    <p className="text-sm text-gray-500">
                        {cards.length} {cards.length === 1 ? 'card' : 'cards'}
                    </p>
                </div>
                <div className="flex gap-3">
                    {cards.length > 0 && (
                        <Link
                            to={`/study/${deckId}`}
                            className="px-6 py-2 bg-green-600 text-white font-medium rounded-lg shadow hover:bg-green-700 transition"
                        >
                            Study Now
                        </Link>
                    )}
                    {!showForm && (
                        <button
                            onClick={() => {
                                setShowForm(true);
                                setEditingCard(null);
                            }}
                            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg shadow hover:bg-blue-700 transition"
                        >
                            + Add Card
                        </button>
                    )}
                </div>
            </div>
            {/* Study Progress */}
            {cards.length > 0 && (
                <div className="mb-8">
                    <StudyProgress cards={cards} />
                </div>
            )}
            {/* View Mode Toggle */}
            {cards.length > 0 && !showForm && (
                <div className="mb-8 flex gap-2">
                    <button
                        onClick={() => setViewMode('list')}
                        className={`px-4 py-2 rounded-lg transition font-medium ${
                            viewMode === 'list'
                                ? 'bg-blue-600 text-white shadow'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        List View
                    </button>
                    <button
                        onClick={() => setViewMode('preview')}
                        className={`px-4 py-2 rounded-lg transition font-medium ${
                            viewMode === 'preview'
                                ? 'bg-blue-600 text-white shadow'
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
                <div className="text-center py-16 bg-white rounded-lg shadow-lg">
                    <p className="text-gray-500 mb-4 text-lg">No cards in this deck yet.</p>
                    <button
                        onClick={() => setShowForm(true)}
                        className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
                    >
                        Create your first card
                    </button>
                </div>
            ) : (
                <>
                    {viewMode === 'list' ? (
                        <div className="space-y-6">
                            {cards.map(card => (
                                <div
                                    key={card.id}
                                    className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition flex flex-col md:flex-row md:items-center md:justify-between"
                                >
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-800 mb-2 text-lg">
                                            Q: {card.question}
                                        </h3>
                                        <p className="text-gray-600 mb-2">A: {card.answer}</p>
                                        <p className="text-sm text-gray-500">
                                            Next Review: <span className="font-medium">{new Date(card.nextReview).toLocaleString()}</span>
                                        </p>
                                    </div>
                                    <div className="flex gap-2 mt-4 md:mt-0 ml-0 md:ml-4">
                                        <button
                                            onClick={() => handleEditCard(card)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                                            title="Edit card"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13l6.293-6.293a1 1 0 011.414 0l1.586 1.586a1 1 0 010 1.414L12 17H9v-3z" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => handleDeleteCard(card.id)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                                            title="Delete card"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {cards.map(card => (
                                <div
                                    key={card.id}
                                    className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition flex flex-col items-center"
                                >
                                    <h3 className="font-semibold text-gray-800 mb-2 text-lg">
                                        Q: {card.question}
                                    </h3>
                                    <p className="text-gray-600 mb-2">A: {card.answer}</p>
                                    <p className="text-sm text-gray-500">
                                        Next Review: <span className="font-medium">{new Date(card.nextReview).toLocaleString()}</span>
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default DeckDetail;