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
                            await deleteCard(cardId); // Call the delete function
                            toast.success('Card deleted successfully!', { icon: '🗑️' });
                        } catch (err) {
                            toast.error('Failed to delete card!');
                        }
                    },
                    className: 'confirm-yes-button', // Use the custom CSS class for the "Yes" button
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
            <div className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-fade-in">
                <div>
                    <Link
                        to="/decks"
                        className="text-brand-500 hover:text-brand-600 mb-2 inline-block transition-colors text-sm font-medium"
                    >
                        ← Back to Decks
                    </Link>
                    <h1 className="text-4xl font-extrabold mb-1 text-gray-800 dark:text-white">{deck.name}</h1>
                    {deck.description && (
                        <p className="text-lg text-gray-500 dark:text-gray-400 mb-1">{deck.description}</p>
                    )}
                    <p className="text-sm text-gray-400 dark:text-gray-500">
                        {cards.length} {cards.length === 1 ? 'card' : 'cards'}
                    </p>
                </div>
                <div className="flex gap-3">
                    {cards.length > 0 && (
                        <Link
                            to={`/study/${deckId}`}
                            className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-medium rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-xl transition-all active:scale-[0.98]"
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
                            className="btn-primary text-sm"
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
                <div className="mb-8 animate-slide-up">
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
                <div className="text-center py-16 glass-elevated rounded-2xl animate-fade-in">
                    <div className="text-4xl mb-4">🃏</div>
                    <p className="text-gray-500 dark:text-gray-400 mb-4 text-lg">No cards in this deck yet.</p>
                    <button
                        onClick={() => setShowForm(true)}
                        className="btn-primary text-sm"
                    >
                        Create your first card
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {cards.map(card => {
                        console.log('Rendering card:', card.id, 'Flipped state:', flippedCards[card.id]); // Debugging
                        return (
                            <div
                                key={card.id}
                                onClick={() => {
                                    console.log('Card clicked:', card.id); // Debugging
                                    handleFlipCard(card.id);
                                }}
                                className={`relative p-6 rounded-2xl transition-all duration-200 flex flex-col items-center cursor-pointer hover:scale-[1.02] ${
                                    flippedCards[card.id]
                                        ? 'glass-elevated border-emerald-300/50 dark:border-emerald-500/30'
                                        : 'glass-elevated'
                                }`}
                            >
                                {/* Delete Button */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation(); // Prevent triggering the flip when clicking delete
                                        handleDeleteCard(card.id);
                                    }}
                                    className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-white/10 rounded-full hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-500/20 dark:hover:text-red-400 transition-all text-sm"
                                    title="Delete Card"
                                >
                                    ×
                                </button>

                                {/* Card Content */}
                                {flippedCards[card.id] ? (
                                    <p className="text-gray-600 dark:text-gray-300 mb-2 text-center">A: {card.answer}</p>
                                ) : (
                                    <>
                                        <h3 className="font-semibold text-gray-800 dark:text-white mb-2 text-lg text-center">
                                            Q: {card.question}
                                        </h3>
                                        <p className="text-xs text-gray-400 dark:text-gray-500">
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