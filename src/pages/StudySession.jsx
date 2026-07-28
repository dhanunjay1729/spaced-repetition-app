import React, { useState, useEffect } from 'react';
// useParams is a hook from react-router-dom to access the URL parameters(route params).
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
// useCards is a custom hook that manages the state and logic for fetching and updating cards.
import useCards from '../hooks/useCards';
// Flashcard is a component that displays a single flashcard with options to rate it.
import Flashcard from '../components/FlashCard';
// calculateSM2 is a utility function that calculates the next review 
// date and other properties based on the SM2 algorithm.
//// getDueCards is a utility function that filters cards to find 
// those due for review.
import { calculateSM2, getDueCards } from '../utils/spacedRepetition';
// ErrorMessage is a component that displays error messages to the user.
import ErrorMessage from '../components/ErrorMessage';
import LoadingSpinner from '../components/LoadingSpinner';

const StudySession = () => {
  // useParams hook retrieves the deckId from the URL parameters.
  const { deckId } = useParams();
  const { cards, updateCard, loading, error } = useCards(deckId);

  // tracks the index of the current card being studied,
  const [currentIndex, setCurrentIndex] = useState(0);
  // sessionCards holds the cards due for review in the current session,
  const [sessionCards, setSessionCards] = useState([]);
  // sessionStats holds statistics about the current study session,
  const [sessionStats, setSessionStats] = useState({
    total: 0,
    completed: 0,
    correct: 0,
    ratings: { 0: 0, 3: 0, 4: 0, 5: 0 }
  });
  // a boolean state to track if the session is complete,
  const [sessionComplete, setSessionComplete] = useState(false);

  useEffect(() => {
    // runs whenever cards or loading state changes.
    if (!loading && cards.length > 0) {
      const due = getDueCards(cards);
      setSessionCards(due);
      setSessionStats({
        total: due.length,
        completed: 0,
        correct: 0,
        ratings: { 0: 0, 3: 0, 4: 0, 5: 0 }
      });
      setCurrentIndex(0);
      setSessionComplete(false);
    }
  }, [cards, loading]);

  if (error) {
    return <ErrorMessage message={error} />;
  }

  const handleRate = (rating) => {
    if (sessionComplete) return;
    const card = sessionCards[currentIndex];
    try {
        console.log('Original card data:', card); // Debugging
        const updated = calculateSM2(card, rating);
        console.log('Updated card data:', updated); // Debugging
        updateCard(card.id, updated);

        // Update session stats
        setSessionStats(prev => ({
            ...prev,
            completed: prev.completed + 1,
            correct: rating >= 3 ? prev.correct + 1 : prev.correct,
            ratings: { ...prev.ratings, [rating]: (prev.ratings[rating] || 0) + 1 }
        }));

        // Update sessionCards to reflect the updated card
        setSessionCards(prevCards => {
            return prevCards.map(c =>
                c.id === card.id ? { ...c, ...updated } : c
            );
        });

        toast.success('Progress saved!');

        if (currentIndex + 1 < sessionCards.length) {
            setCurrentIndex(currentIndex + 1);
        } else {
            setSessionComplete(true);
            toast.success('Study session complete! 🎉');
        }
    } catch (error) {
        console.error('Error saving progress:', error); // Debugging
        toast.error('Failed to save progress!');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (sessionComplete) {
    const percentage = sessionStats.total > 0 ? Math.round((sessionStats.correct / sessionStats.total) * 100) : 0;
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="glass-elevated rounded-2xl p-8 max-w-md w-full text-center animate-scale-in">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Session Complete!</h2>
          <div className={`text-5xl font-extrabold my-4 ${percentage >= 70 ? 'text-emerald-500' : percentage >= 40 ? 'text-orange-500' : 'text-red-500'}`}>
            {percentage}%
          </div>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {sessionStats.correct} of {sessionStats.completed} cards recalled correctly
          </p>
          <Link
            to={`/deck/${deckId}`}
            className="btn-primary inline-block"
          >
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
          <Link
            to={`/deck/${deckId}`}
            className="btn-primary inline-block"
          >
            Back to Deck
          </Link>
        </div>
      </div>
    );
  }

  const card = sessionCards[currentIndex];

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      {/* Progress header */}
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