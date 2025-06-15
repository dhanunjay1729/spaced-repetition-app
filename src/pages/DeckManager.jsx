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
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 p-6">
      <div className="container mx-auto max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">My Decks</h1>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg shadow hover:bg-blue-700 transition transform hover:scale-105"
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
              <div
                key={deck.id}
                className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition transform hover:scale-105"
              >
                <h3 className="text-xl font-semibold mb-2 text-gray-800">{deck.name}</h3>
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
    </div>
  );
};

export default DeckManager;