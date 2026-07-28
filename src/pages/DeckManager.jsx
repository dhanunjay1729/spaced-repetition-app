import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import ErrorMessage from '../components/ErrorMessage';
import useDecks from '../hooks/useDecks';
import { fetchCards } from '../utils/firestore';
import DeckForm from '../components/DeckForm';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';

const DeckManager = () => {
  const { decks, loading, error, addDeck, deleteDeck } = useDecks();
  const [showForm, setShowForm] = useState(false);
  const [cardCounts, setCardCounts] = useState({});
  const [loadingCards, setLoadingCards] = useState(true);

  useEffect(() => {
    const fetchCardCounts = async () => {
      try {
        const allCards = await fetchCards();
        const counts = decks.reduce((acc, deck) => {
          acc[deck.id] = allCards.filter(card => card.deckId === deck.id).length;
          return acc;
        }, {});
        setCardCounts(counts);
      } catch (err) {
        console.error('Error fetching card counts:', err);
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

  const handleDeleteDeck = (deckId) => {
    confirmAlert({
      title: 'Confirm Deck Deletion',
      message: 'Are you sure you want to delete this deck? All cards will be lost!',
      buttons: [
        {
          label: 'Yes',
          onClick: async () => {
            try {
              await deleteDeck(deckId); // Call the delete function
              toast.success('Deck deleted successfully!', { icon: '🗑️' });
            } catch (err) {
              console.error('Error deleting deck:', err);
              toast.error('Failed to delete deck!');
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <svg className="animate-spin h-8 w-8 text-brand-500 mr-3" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
        <span className="text-gray-500 dark:text-gray-400">Loading decks...</span>
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className="min-h-screen p-6">
      <div className="container mx-auto max-w-6xl">
        <div className="flex justify-between items-center mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white">My Decks</h1>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary text-sm"
            >
              + New Deck
            </button>
          )}
        </div>
        {showForm && (
          <div className="mb-8 animate-slide-up">
            <DeckForm
              onSubmit={handleCreateDeck}
              onCancel={() => setShowForm(false)}
            />
          </div>
        )}
        {decks.length === 0 ? (
          <div className="text-center py-16 glass-elevated rounded-2xl animate-fade-in">
            <div className="text-4xl mb-4">📚</div>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-lg">No decks yet. Create your first deck!</p>
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="text-brand-500 hover:text-brand-600 font-medium transition-colors"
              >
                Create a deck
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {decks.map((deck) => (
              <div
                key={deck.id}
                className="glass-elevated rounded-2xl p-6 hover:scale-[1.02] transition-all duration-200 animate-slide-up"
              >
                <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">{deck.name}</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">{deck.description || 'No description'}</p>
                {loadingCards ? (
                  <p className="text-gray-400 dark:text-gray-500 text-sm">Loading cards...</p>
                ) : (
                  <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">
                    {cardCounts[deck.id] || 0} {cardCounts[deck.id] === 1 ? 'card' : 'cards'}
                  </p>
                )}
                <div className="flex justify-between mt-5 pt-4 border-t border-gray-200/50 dark:border-white/10">
                  <Link
                    to={`/deck/${deck.id}`}
                    className="text-brand-500 hover:text-brand-600 font-medium text-sm transition-colors"
                  >
                    View Deck →
                  </Link>
                  <button
                    onClick={() => handleDeleteDeck(deck.id)}
                    className="text-red-400 hover:text-red-500 font-medium text-sm transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DeckManager;