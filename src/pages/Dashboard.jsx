import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { auth } from '../firebase';
import useDecks from '../hooks/useDecks';
import { fetchCards } from '../utils/firestore';
import { getDueCards } from '../utils/spacedRepetition';
import ErrorMessage from '../components/ErrorMessage';
import { handleError } from '../utils/errorHandler';
import LoadingSpinner from '../components/LoadingSpinner';

const Dashboard = () => {
  const { decks, error, deleteDeck } = useDecks();
  const [allCards, setAllCards] = useState([]);
  const [loadingCards, setLoadingCards] = useState(true);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser?.displayName) setUserName(currentUser.displayName);
  }, []);

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

  const totalCards = allCards.length;
  const totalDecks = decks.length;

  const cardsDueToday = allCards.filter(card => {
    const nextReview = new Date(card.nextReview).toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];
    return nextReview === today;
  }).length;

  const handleDeleteDeck = async (deckId, e) => {
    try {
      e?.stopPropagation();
      if (!window.confirm('Delete this deck?')) return;
      await deleteDeck(deckId);
      toast.success('Deck deleted!', { icon: '🗑️' });
    } catch (err) {
      handleError(err, 'Dashboard - handleDeleteDeck');
      toast.error('Could not delete deck.');
    }
  };

  if (error) return <ErrorMessage message={error} />;
  if (loadingCards) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        <h1 className="text-4xl md:text-5xl font-extrabold text-center text-gray-800">
          Welcome, <span className="text-blue-600">{userName || 'Learner'}</span> 
        </h1>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { label: 'Total Decks', value: totalDecks, color: 'from-blue-400 to-blue-600' },
            { label: 'Total Cards', value: totalCards, color: 'from-green-400 to-green-600' },
            { label: 'Cards Due Today', value: cardsDueToday, color: 'from-red-400 to-red-600' }, // Updated to a lighter red
          ].map(stat => (
            <div
              key={stat.label}
              className={`rounded-2xl p-6 shadow-md bg-gradient-to-br ${stat.color} text-white`}
            >
              <h3 className="text-lg font-medium">{stat.label}</h3>
              <p className="text-5xl font-extrabold mt-2">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl p-6 shadow space-y-6">
          <h2 className="text-2xl font-bold text-gray-800">Quick Actions</h2>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/decks"
              className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition transform hover:scale-105"
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
                  className="flex items-center gap-2 bg-gray-100 rounded-xl px-4 py-2 shadow hover:shadow-md transition transform hover:scale-105"
                >
                  <Link
                    to={`/study/${deck.id}`}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition"
                  >
                    Study "{deck.name}"{' '}
                    <span className="ml-2 px-2 py-0.5 bg-white text-green-700 rounded-full text-xs font-bold">
                      {pendingCards}
                    </span>
                  </Link>
                  <button
                    onClick={e => handleDeleteDeck(deck.id, e)}
                    className="text-red-500 hover:text-red-700 text-sm"
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
          <div className="bg-white rounded-2xl p-6 shadow space-y-4">
            <h2 className="text-2xl font-bold text-gray-800">Recent Decks</h2>
            {decks.slice(0, 5).map(deck => {
              const deckCards = allCards.filter(card => card.deckId === deck.id).length;
              return (
                <Link
                  key={deck.id}
                  to={`/deck/${deck.id}`}
                  className="block p-4 rounded-xl bg-gray-50 border border-gray-200 hover:bg-gray-100 transition transform hover:scale-105 shadow-sm"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-800">{deck.name}</span>
                    <span className="text-sm text-gray-500">{deckCards} {deckCards === 1 ? 'card' : 'cards'}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
