import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import useCards from '../hooks/useCards';
import Flashcard from '../components/FlashCard';
import { calculateSM2, getDueCards } from '../utils/spacedRepetition';
import ErrorMessage from '../components/ErrorMessage';

const StudySession = () => {
  const { deckId } = useParams();
  const { cards, updateCard, loading, error } = useCards(deckId);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionCards, setSessionCards] = useState([]);
  const [sessionStats, setSessionStats] = useState({
    total: 0,
    completed: 0,
    correct: 0,
    ratings: { 0: 0, 3: 0, 4: 0, 5: 0 }
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
      const updated = calculateSM2(card, rating);
      updateCard(card.id, updated);

      setSessionStats(prev => ({
        ...prev,
        completed: prev.completed + 1,
        correct: rating >= 3 ? prev.correct + 1 : prev.correct,
        ratings: { ...prev.ratings, [rating]: (prev.ratings[rating] || 0) + 1 }
      }));

      toast.success('Progress saved!');

      if (currentIndex + 1 < sessionCards.length) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setSessionComplete(true);
        toast.success('Study session complete! 🎉');
      }
    } catch {
      toast.error('Failed to save progress!');
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (sessionComplete) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Session Complete!</h2>
        <p className="mb-4">
          You answered {sessionStats.completed} cards. Correct: {sessionStats.correct}
        </p>
        <Link
          to={`/deck/${deckId}`}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Back to Deck
        </Link>
      </div>
    );
  }

  if (!sessionCards.length) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">No cards due for review in this deck.</p>
        <Link
          to={`/deck/${deckId}`}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Back to Deck
        </Link>
      </div>
    );
  }

  const card = sessionCards[currentIndex];

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Study Session</h1>
        <span className="text-gray-600">
          Card {currentIndex + 1} of {sessionCards.length}
        </span>
      </div>
      <Flashcard card={card} onRate={handleRate} />
      <div className="mt-8 text-center">
        <Link
          to={`/deck/${deckId}`}
          className="text-blue-600 hover:text-blue-700"
        >
          Cancel Session
        </Link>
      </div>
    </div>
  );
};

export default StudySession;