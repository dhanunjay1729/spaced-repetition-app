import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import useDecks from '../hooks/useDecks';
import useCards from '../hooks/useCards';
import Flashcard from '../components/FlashCard';
import { calculateSM2, getDueCards, formatInterval } from '../utils/spacedRepetition';
//import { createSession } from '../data/models';

const StudySession = () => {
  const { deckId } = useParams();
  const navigate = useNavigate();
  const { decks } = useDecks();
  const { cards, updateCard, loading } = useCards(deckId);
  console.log("All cards for this deck:", cards);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionCards, setSessionCards] = useState([]);
  const [sessionStats, setSessionStats] = useState({
    total: 0,
    completed: 0,
    correct: 0,
    ratings: { 0: 0, 3: 0, 4: 0, 5: 0 }
  });
  const [sessionComplete, setSessionComplete] = useState(false);

  // Get current deck
  const deck = decks.find(d => d.id === deckId);

  // Initialize session
  useEffect(() => {
    if (!loading && cards.length > 0) {
      const dueCards = getDueCards(cards);
      const newCards = cards.filter(card => card.repetitions === 0);
      const cardMap = {};
      [...dueCards, ...newCards].forEach(card => {
        cardMap[card.id] = card;
      });
      const studyCards = Object.values(cardMap);
      const shuffled = [...studyCards].sort(() => Math.random() - 0.5);
      setSessionCards(shuffled);
        console.log("Session cards:", shuffled);
      setSessionStats({
        total: shuffled.length,
        completed: 0,
        correct: 0,
        ratings: { 0: 0, 3: 0, 4: 0, 5: 0 }
      });
      setCurrentIndex(0);
      setSessionComplete(false);
    } else if (!loading) {
      setSessionCards([]);
    }
  }, [deckId, loading]);

  const handleRate = (rating) => {
    const currentCard = sessionCards[currentIndex];
    
    // Calculate new SM-2 values
    const updates = calculateSM2(currentCard, rating);
    
    // Update card in database
    updateCard(currentCard.id, updates);
    
    // Update session stats
    setSessionStats(prev => ({
      ...prev,
      completed: prev.completed + 1,
      correct: rating >= 3 ? prev.correct + 1 : prev.correct,
      ratings: {
        ...prev.ratings,
        [rating]: prev.ratings[rating] + 1
      }
    }));
    
    // Move to next card or complete session
    if (currentIndex < sessionCards.length - 1) {
      setCurrentIndex(idx => idx + 1);
    } else {
      setSessionComplete(true);
    }
    console.log("Current index:", currentIndex, "Session cards:", sessionCards);
  };

  const handleContinue = () => {
    navigate(`/deck/${deckId}`);
  };

  // Loading state
  if (!deck) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  // No cards state
  if (sessionCards.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <div className="max-w-2xl mx-auto">
          <Link
            to={`/deck/${deckId}`}
            className="text-blue-600 hover:text-blue-700 mb-4 inline-block"
          >
            ← Back to Deck
          </Link>
          
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">No Cards to Study</h2>
            <p className="text-gray-600 mb-4">
              This deck doesn't have any cards yet. Add some cards to start studying!
            </p>
            <Link
              to={`/deck/${deckId}`}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Go to deck
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Session complete state
  if (sessionComplete) {
    const accuracy = Math.round((sessionStats.correct / sessionStats.total) * 100);
    
    return (
      <div className="container mx-auto p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-3xl font-bold text-center mb-8">Session Complete! 🎉</h2>
            
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="text-center">
                <p className="text-gray-600 text-sm">Cards Studied</p>
                <p className="text-3xl font-bold text-blue-600">{sessionStats.total}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-600 text-sm">Accuracy</p>
                <p className="text-3xl font-bold text-green-600">{accuracy}%</p>
              </div>
            </div>
            
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">Rating Breakdown</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-red-600">Again</span>
                  <span className="font-medium">{sessionStats.ratings[0]}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-orange-600">Hard</span>
                  <span className="font-medium">{sessionStats.ratings[3]}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-blue-600">Good</span>
                  <span className="font-medium">{sessionStats.ratings[4]}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-green-600">Easy</span>
                  <span className="font-medium">{sessionStats.ratings[5]}</span>
                </div>
              </div>
            </div>
            
            <button
              onClick={handleContinue}
              className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Study session
  const currentCard = sessionCards[currentIndex];
  const progress = ((currentIndex + 1) / sessionCards.length) * 100;

  console.log("Rendering, sessionCards:", sessionCards, "currentIndex:", currentIndex);

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <Link
              to={`/deck/${deckId}`}
              className="text-gray-600 hover:text-gray-800"
            >
              ← Exit Session
            </Link>
            <h1 className="text-2xl font-bold">{deck.name}</h1>
            <div className="text-gray-600">
              {currentIndex + 1} / {sessionCards.length}
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        
        {/* Card display */}
        <Flashcard 
          card={currentCard} 
          onRate={handleRate}
          isLastCard={currentIndex === sessionCards.length - 1}
        />
        
        {/* Card info */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          {currentCard.repetitions > 0 && (
            <p>
              Last reviewed: {new Date(currentCard.lastReviewed).toLocaleDateString()}
              {' • '}
              Next interval: {formatInterval(currentCard.interval)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudySession;