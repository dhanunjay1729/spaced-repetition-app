//the Dashboard component serves as the main landing page for the
// application, providing an overview of the user's decks and cards,
//along with quick access to manage decks and start studying.
import React, { useState, useEffect } from 'react';
// react-router-dom is used for navigation between different pages
//without reloading the page.
import { Link } from 'react-router-dom';
// react-hot-toast is used for displaying toast notifications
import { toast } from 'react-hot-toast';
// firebase is used to access the authentication module
import { auth } from '../firebase'; // Import Firebase auth to get the user's name
//the hooks folder contains custom react hooks-reusable functions that 
//let us share logic between components`
import useDecks from '../hooks/useDecks';
//the utils folder contains utility functions that are not tied to 
// react, but help with general tasks like data fetching or 
// local storage management
import { fetchCards } from '../utils/firestore'; // Import Firestore-based fetchCards
import { getDueCards } from '../utils/spacedRepetition';
import ErrorMessage from '../components/ErrorMessage';
import { handleError } from '../utils/errorHandler'; // Import centralized error handler
import LoadingSpinner from '../components/LoadingSpinner'; // Importing the LoadingSpinner component

const Dashboard = () => {
  const { decks, error, deleteDeck } = useDecks();
  const [allCards, setAllCards] = useState([]);
  const [loadingCards, setLoadingCards] = useState(true);
  const [userName, setUserName] = useState('');

  // Fetch the user's name from Firebase Auth
  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser && currentUser.displayName) {
      setUserName(currentUser.displayName);
    }
  }, []);

  // Fetch all cards from Firestore
  useEffect(() => {
    const fetchAllCards = async () => {
      try {
        const cards = await fetchCards();
        setAllCards(cards);
      } catch (err) {
        handleError(err, 'Dashboard - fetchAllCards');
      } finally {
        setLoadingCards(false);
      }
    };
    fetchAllCards();
  }, []);

  // Calculate statistics
  const totalCards = allCards.length;
  const totalDecks = decks.length;

  // Cards due today
  const cardsDueToday = allCards.filter(card => {
    const nextReviewDate = new Date(card.nextReview).toISOString().split('T')[0];
    const todayDate = new Date().toISOString().split('T')[0];
    return nextReviewDate === todayDate;
  }).length;

  // Deck deletion handler
  const handleDeleteDeck = async (deckId, event) => {
    try {
      event?.stopPropagation();
      const confirmDelete = window.confirm('Are you sure you want to delete this deck?');
      if (!confirmDelete) return;

      await deleteDeck(deckId);
      toast.success('Deck deleted successfully!', { icon: '🗑️' });
    } catch (err) {
      handleError(err, 'Dashboard - handleDeleteDeck');
      toast.error('Failed to delete deck. Please try again.');
    }
  };

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (loadingCards) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 p-6">
      <div className="container mx-auto max-w-6xl">
        <h1 className="text-5xl font-bold text-center text-gray-800 mb-12">
          Welcome, {userName || 'User'}!
        </h1>

        {/* Statistics Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gradient-to-r from-blue-500 to-blue-700 text-white p-8 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold">Total Decks</h3>
            <p className="text-5xl font-bold">{totalDecks}</p>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-green-700 text-white p-8 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold">Total Cards</h3>
            <p className="text-5xl font-bold">{totalCards}</p>
          </div>
          <div className="bg-gradient-to-r from-orange-500 to-orange-700 text-white p-8 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold">Cards Due Today</h3>
            <p className="text-5xl font-bold">{cardsDueToday}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-8 rounded-lg shadow-lg mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Quick Actions</h2>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/decks"
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg shadow hover:bg-blue-700 transition transform hover:scale-105"
            >
              Manage Decks
            </Link>
            {decks.map(deck => {
              const deckCards = allCards.filter(card => card.deckId === deck.id);
              const dueCards = getDueCards(deckCards);
              const newCards = deckCards.filter(card => card.repetitions === 0);
              const pendingCards = [...new Set([...dueCards, ...newCards].map(c => c.id))].length;

              return (
                <div
                  key={deck.id}
                  className="flex items-center gap-2 bg-gray-50 rounded-lg px-4 py-2 shadow hover:shadow-md transition transform hover:scale-105"
                >
                  <Link
                    to={`/study/${deck.id}`}
                    className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                  >
                    <span>Study "{deck.name}"</span>
                    <span className="bg-white text-green-600 px-2 py-1 rounded-full text-xs font-bold">
                      {pendingCards} Pending
                    </span>
                  </Link>
                  <button
                    onClick={e => handleDeleteDeck(deck.id, e)}
                    className="text-red-600 hover:underline ml-2"
                    title="Delete deck"
                  >
                    Delete
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Decks */}
        {decks.length > 0 && (
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Recent Decks</h2>
            <div className="space-y-4">
              {decks.slice(0, 5).map(deck => {
                const deckCards = allCards.filter(card => card.deckId === deck.id);
                const cardCount = deckCards.length;

                return (
                  <Link
                    key={deck.id}
                    to={`/deck/${deck.id}`}
                    className="block p-6 border border-gray-200 rounded-lg hover:bg-gray-100 transition transform hover:scale-105 shadow-sm"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-lg text-gray-800">{deck.name}</span>
                      <span className="text-sm text-gray-500">{cardCount} {cardCount === 1 ? 'card' : 'cards'}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;