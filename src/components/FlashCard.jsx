import React, { useState, useEffect } from 'react';

const Flashcard = ({ card, onRate }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showRating, setShowRating] = useState(false);

  // Reset state when card changes
  useEffect(() => {
    setIsFlipped(false);
    setShowRating(false);
  }, [card.id]);

  const handleFlip = () => {
    setIsFlipped(true);
    // Show rating buttons after a short delay
    setTimeout(() => setShowRating(true), 300);
  };

  const handleRate = (rating) => {
    onRate(rating);
    setIsFlipped(false);
    setShowRating(false);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="perspective-1000">
        <div
          className={`relative w-full h-96 transition-all duration-500 transform-style-preserve-3d ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* Front of card (Question) */}
          <div className="absolute inset-0 w-full h-full backface-hidden">
            <div className="bg-white rounded-lg shadow-xl p-8 h-full flex flex-col justify-center items-center">
              <h3 className="text-gray-500 text-sm uppercase tracking-wide mb-4">Question</h3>
              <p className="text-xl text-gray-800 text-center">{card.question}</p>
              {!isFlipped && (
                <button
                  onClick={handleFlip}
                  className="mt-8 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
                >
                  Show Answer
                </button>
              )}
            </div>
          </div>

          {/* Back of card (Answer) */}
          <div className="absolute inset-0 w-full h-full rotate-y-180 backface-hidden">
            <div className="bg-white rounded-lg shadow-xl p-8 h-full flex flex-col justify-center items-center">
              <h3 className="text-gray-500 text-sm uppercase tracking-wide mb-4">Answer</h3>
              <p className="text-xl text-gray-800 text-center mb-8">{card.answer}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Rating buttons */}
      {showRating && (
        <div className="mt-8 space-y-4">
          <p className="text-center text-gray-600 mb-4">How well did you remember?</p>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleRate(0)}
              className="px-6 py-4 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition"
            >
              <span className="block text-lg">Again</span>
              <span className="block text-sm opacity-80">Didn't remember</span>
            </button>
            <button
              onClick={() => handleRate(3)}
              className="px-6 py-4 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 transition"
            >
              <span className="block text-lg">Hard</span>
              <span className="block text-sm opacity-80">Difficult recall</span>
            </button>
            <button
              onClick={() => handleRate(4)}
              className="px-6 py-4 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition"
            >
              <span className="block text-lg">Good</span>
              <span className="block text-sm opacity-80">Recalled with effort</span>
            </button>
            <button
              onClick={() => handleRate(5)}
              className="px-6 py-4 bg-green-500 text-white font-medium rounded-lg hover:bg-green-600 transition"
            >
              <span className="block text-lg">Easy</span>
              <span className="block text-sm opacity-80">Perfect recall</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Flashcard;