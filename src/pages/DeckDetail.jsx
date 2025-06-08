import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import styles
import useDecks from '../hooks/useDecks';
import useCards from '../hooks/useCards';
import CardForm from '../components/CardForm';
import ErrorMessage from '../components/ErrorMessage';
import StudyProgress from '../components/StudyProgress';
import { createCard } from '../data/models'; // Import the createCard function

const DeckDetail = () => {
    const { deckId } = useParams();
    const { decks } = useDecks();
    const { cards, error, addCard, updateCard, deleteCard } = useCards(deckId); // Updated destructuring

    const [showForm, setShowForm] = useState(false);
    const [editingCard, setEditingCard] = useState(null);
    const [flippedCards, setFlippedCards] = useState({});
    console.log('Initial flippedCards state:', flippedCards); // Debugging

    const deck = decks.find(d => d.id === deckId);

    if (error) {
        return <ErrorMessage message={error} />;
    }

    const handleFlipCard = (cardId) => {
        console.log('Before flip:', flippedCards); // Debugging
        setFlippedCards((prev) => {
            const updatedState = {
                ...prev,
                [cardId]: !prev[cardId], // Toggle flipped state for the card
            };
            console.log('After flip:', updatedState); // Debugging
            return updatedState;
        });
    };

    const handleCreateCard = (cardData) => {
        try {
            const newCard = createCard({ ...cardData, deckId }); // Use createCard to initialize all properties
            console.log('Creating card with the following properties:', newCard); // Log all properties
            addCard(newCard); // Save the card to Firestore
            setShowForm(false);
            toast.success('Card added!');
        } catch (err) {
            toast.error('Failed to add card!');
        }
    };

    const handleUpdateCard = (cardData) => {
        try {
            if (!cardData.nextReview || isNaN(new Date(cardData.nextReview).getTime())) {
                throw new Error('Invalid nextReview date');
            }
            updateCard(cardData.id, cardData);
            setShowForm(false);
            setEditingCard(null);
            toast.success('Card updated!');
        } catch (err) {
            toast.error('Failed to update card!');
        }
    };

    const handleDeleteCard = (cardId) => {
        confirmAlert({
            title: 'Confirm Card Deletion',
            message: 'Are you sure you want to delete this card?',
            buttons: [
                {
                    label: 'Yes',
                    onClick: async () => {
                        try {
                            deleteCard(cardId);
                            toast('Card deleted', { icon: '🗑️' });
                        } catch (err) {
                            toast.error('Failed to delete card!');
                        }
                    },
                },
                {
                    label: 'No',
                    onClick: () => toast('Deletion canceled'),
                },
            ],
        });
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
                    <h1 className="text-4xl font-extrabold mb-1 text-gray-800">{deck.name}</h1>
                    {deck.description && (
                        <p className="text-lg text-gray-600 mb-1">{deck.description}</p>
                    )}
                    <p className="text-sm text-gray-500">
                        {cards.length} {cards.length === 1 ? 'card' : 'cards'}
                    </p>
                </div>
                <div className="flex gap-3">
                    {cards.length > 0 && (
                        <Link
                            to={`/study/${deckId}`}
                            className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-700 text-white font-medium rounded-lg shadow hover:shadow-lg transition"
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
                            className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-700 text-white font-medium rounded-lg shadow hover:shadow-lg transition"
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
                        className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-700 text-white font-medium rounded-lg hover:shadow-lg transition"
                    >
                        Create your first card
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {cards.map(card => {
                        console.log('Rendering card:', card.id, 'Flipped state:', flippedCards[card.id]); // Debugging
                        return (
                            <div
                                key={card.id}
                                onClick={() => {
                                    console.log('Card clicked:', card.id); // Debugging
                                    handleFlipCard(card.id);
                                }}
                                className={`relative p-6 rounded-xl shadow-lg hover:shadow-2xl transition flex flex-col items-center cursor-pointer ${
                                    flippedCards[card.id] ? 'bg-green-100' : 'bg-red-100'
                                }`}
                            >
                                {/* Delete Button */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation(); // Prevent triggering the flip when clicking delete
                                        handleDeleteCard(card.id);
                                    }}
                                    className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center text-white bg-gray-400 rounded-full hover:bg-red-500 transition"
                                    title="Delete Card"
                                >
                                    ×
                                </button>

                                {/* Card Content */}
                                {flippedCards[card.id] ? (
                                    <p className="text-gray-600 mb-2">A: {card.answer}</p>
                                ) : (
                                    <>
                                        <h3 className="font-semibold text-gray-800 mb-2 text-lg">
                                            Q: {card.question}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            Next Review: <span className="font-medium">{new Date(card.nextReview).toLocaleString()}</span>
                                        </p>
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default DeckDetail;