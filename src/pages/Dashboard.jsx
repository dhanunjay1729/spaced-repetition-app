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
import { confirmAlert } from 'react-confirm-alert';

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

  const handleDeleteDeck = (deckId, e) => {
    e?.stopPropagation(); // Prevent event bubbling

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
              handleError(err, 'Dashboard - handleDeleteDeck');
              toast.error('Failed to delete deck!');
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

  if (error) return <ErrorMessage message={error} />;
  if (loadingCards) return <LoadingSpinner />;

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-10">

        {/* Hero greeting */}
        <div className="text-center animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 dark:text-white">
            Welcome, <span className="text-gradient">{userName || 'Learner'}</span>
          </h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">Your learning dashboard at a glance.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 animate-slide-up">
          {[
            { label: 'Total Decks', value: totalDecks, icon: '📚', gradient: 'from-brand-500 to-brand-700' },
            { label: 'Total Cards', value: totalCards, icon: '🃏', gradient: 'from-emerald-500 to-teal-700' },
            { label: 'Due Today', value: cardsDueToday, icon: '🔥', gradient: 'from-rose-500 to-pink-700' },
          ].map(stat => (
            <div
              key={stat.label}
              className={`glass-elevated rounded-2xl p-6 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-10 dark:opacity-20 group-hover:opacity-20 dark:group-hover:opacity-30 transition-opacity`} />
              <div className="relative">
                <span className="text-2xl">{stat.icon}</span>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-2">{stat.label}</h3>
                <p className="text-4xl font-extrabold text-gray-800 dark:text-white mt-1">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="glass-elevated rounded-2xl p-6 space-y-5 animate-slide-up">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Quick Actions</h2>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/decks"
              className="btn-primary text-sm"
            >
              Manage Decks
            </Link>
            <Link
              to="/quiz"
              className="btn-secondary text-sm"
            >
              🧠 AI Quiz
            </Link>
            {decks.map(deck => {
              const deckCards = allCards.filter(card => card.deckId === deck.id);
              const dueCards = getDueCards(deckCards);
              const newCards = deckCards.filter(card => card.repetitions === 0);
              const pendingCards = [...new Set([...dueCards, ...newCards].map(c => c.id))].length;

              return (
                <div
                  key={deck.id}
                  className="flex items-center gap-2 glass rounded-xl px-4 py-2 hover:scale-[1.02] transition-transform duration-200"
                >
                  <Link
                    to={`/study/${deck.id}`}
                    className="px-4 py-2 bg-emerald-500/90 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors text-sm"
                  >
                    Study "{deck.name}"{' '}
                    <span className="ml-1 px-2 py-0.5 bg-white/20 rounded-full text-xs font-bold">
                      {pendingCards}
                    </span>
                  </Link>
                  <button
                    onClick={e => handleDeleteDeck(deck.id, e)}
                    className="text-red-400 hover:text-red-500 text-sm transition-colors"
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
          <div className="glass-elevated rounded-2xl p-6 space-y-4 animate-slide-up">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Recent Decks</h2>
            {decks.slice(0, 5).map(deck => {
              const deckCards = allCards.filter(card => card.deckId === deck.id).length;
              return (
                <Link
                  key={deck.id}
                  to={`/deck/${deck.id}`}
                  className="block p-4 rounded-xl glass hover:scale-[1.01] transition-all duration-200"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-800 dark:text-gray-100">{deck.name}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{deckCards} {deckCards === 1 ? 'card' : 'cards'}</span>
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
