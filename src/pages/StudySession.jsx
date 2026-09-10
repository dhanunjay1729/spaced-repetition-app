import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import useCards from '../hooks/useCards';
import Flashcard from '../components/FlashCard';
import { updateCardWithFSRS, getDueCards } from '../utils/spacedRepetition';
import ErrorMessage from '../components/ErrorMessage';
import LoadingSpinner from '../components/LoadingSpinner';

const StudySession = () => {
  const { deckId } = useParams();
  const { cards, updateCard, loading, error } = useCards(deckId);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionCards, setSessionCards] = useState([]);
  const [sessionStats, setSessionStats] = useState({
    total: 0,
    completed: 0,
    correct: 0,
    // FSRS rating distribution: Again=1, Hard=2, Good=3, Easy=4
    ratings: { 1: 0, 2: 0, 3: 0, 4: 0 }
  });
  const [sessionComplete, setSessionComplete] = useState(false);

  useEffect(() => {
    if (!loading && cards.length > 0) {
      const due = getDueCards(cards);
      setSessionCards(due);
      setSessionStats({
        total: due.length,
        completed: 0,
        correct: 0,
        ratings: { 1: 0, 2: 0, 3: 0, 4: 0 }
      });
      setCurrentIndex(0);
      setSessionComplete(false);
    }
  }, [cards, loading]);

  if (error) return <ErrorMessage message={error} />;

  const handleRate = (rating) => {
    if (sessionComplete) return;
    const card = sessionCards[currentIndex];
    try {
      // Apply FSRS-6 scheduling (rating: 1=Again, 2=Hard, 3=Good, 4=Easy)
      const updated = updateCardWithFSRS(card, rating);
      updateCard(card.id, updated);

      setSessionStats(prev => ({
        ...prev,
        completed: prev.completed + 1,
        // ratings >= 3 (Good/Easy) count as "correct"
        correct: rating >= 3 ? prev.correct + 1 : prev.correct,
        ratings: { ...prev.ratings, [rating]: (prev.ratings[rating] || 0) + 1 }
      }));

      setSessionCards(prevCards =>
        prevCards.map(c => c.id === card.id ? { ...c, ...updated } : c)
      );

      toast.success('Progress saved!');

      if (currentIndex + 1 < sessionCards.length) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setSessionComplete(true);
        toast.success('Study session complete! 🎉');
      }
    } catch (err) {
      console.error('Error saving progress:', err);
      toast.error('Failed to save progress!');
    }
  };

  if (loading) return <LoadingSpinner />;

  if (sessionComplete) {
    const percentage = sessionStats.total > 0
      ? Math.round((sessionStats.correct / sessionStats.total) * 100)
      : 0;

    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="glass-elevated rounded-2xl p-8 max-w-md w-full text-center animate-scale-in">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Session Complete!</h2>
          <div className={`text-5xl font-extrabold my-4 ${percentage >= 70 ? 'text-emerald-500' : percentage >= 40 ? 'text-orange-500' : 'text-red-500'}`}>
            {percentage}%
          </div>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {sessionStats.correct} of {sessionStats.completed} cards recalled correctly
          </p>
          {/* Rating breakdown */}
          <div className="grid grid-cols-4 gap-2 mb-6 text-xs">
            {[
              { label: 'Again', key: 1, color: 'text-red-500' },
              { label: 'Hard',  key: 2, color: 'text-orange-500' },
              { label: 'Good',  key: 3, color: 'text-blue-500' },
              { label: 'Easy',  key: 4, color: 'text-emerald-500' },
            ].map(({ label, key, color }) => (
              <div key={key} className="glass rounded-lg p-2 text-center">
                <div className={`font-bold text-lg ${color}`}>{sessionStats.ratings[key] || 0}</div>
                <div className="text-gray-500 dark:text-gray-400">{label}</div>
              </div>
            ))}
          </div>
          <Link to={`/deck/${deckId}`} className="btn-primary inline-block">
            Back to Deck
          </Link>
        </div>
      </div>
    );
  }

  if (!sessionCards.length) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="glass-elevated rounded-2xl p-8 max-w-md w-full text-center animate-fade-in">
          <div className="text-4xl mb-4">✅</div>
          <p className="text-gray-500 dark:text-gray-400 mb-6 text-lg">No cards due for review in this deck.</p>
          <Link to={`/deck/${deckId}`} className="btn-primary inline-block">
            Back to Deck
          </Link>
        </div>
      </div>
    );
  }

  const card = sessionCards[currentIndex];

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="mb-6 flex justify-between items-center animate-fade-in">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Study Session</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            {currentIndex + 1} / {sessionCards.length}
          </span>
          <div className="w-24 bg-gray-200 dark:bg-white/10 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-brand-500 to-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / sessionCards.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <Flashcard card={card} onRate={handleRate} />

      <div className="mt-8 text-center">
        <Link
          to={`/deck/${deckId}`}
          className="text-gray-400 dark:text-gray-500 hover:text-red-400 dark:hover:text-red-400 transition-colors text-sm"
        >
          Cancel Session
        </Link>
      </div>
    </div>
  );
};

export default StudySession;
