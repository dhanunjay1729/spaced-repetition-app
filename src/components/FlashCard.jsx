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

  // Check if card is AI-generated
  const isAIGenerated = card.metadata?.isAIGenerated;

  // Format answer for display
  const formatAnswer = (answer) => {
    if (!answer) return '';
    
    // If it's AI-generated content with line breaks, format it nicely
    if (isAIGenerated && answer.includes('\n')) {
      return answer.split('\n').map((line, index) => {
        // Handle different sections
        if (line.startsWith('Definition:')) {
          return <p key={index} className="mb-3"><strong className="text-blue-600">Definition:</strong> {line.substring(11)}</p>;
        }
        if (line.startsWith('Part of Speech:')) {
          return <p key={index} className="mb-3"><strong className="text-green-600">Part of Speech:</strong> {line.substring(15)}</p>;
        }
        if (line.startsWith('Examples:')) {
          return <p key={index} className="mb-2"><strong className="text-purple-600">Examples:</strong></p>;
        }
        if (line.startsWith('Synonyms:')) {
          return <p key={index} className="mb-3"><strong className="text-orange-600">Synonyms:</strong> {line.substring(9)}</p>;
        }
        if (line.startsWith('Etymology:')) {
          return <p key={index} className="mb-3 text-sm italic text-gray-600"><strong>Etymology:</strong> {line.substring(10)}</p>;
        }
        // Numbered examples
        if (line.match(/^\d\./)) {
          return <li key={index} className="ml-6 mb-1 text-gray-700">{line.substring(3)}</li>;
        }
        // Empty lines
        if (line.trim() === '') {
          return null;
        }
        // Regular lines
        return <p key={index} className="mb-2">{line}</p>;
      });
    }
    
    // For non-AI generated content, just return as is
    return <p className="text-xl text-gray-800 text-center">{answer}</p>;
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
            <div className="bg-white rounded-lg shadow-xl p-8 h-full flex flex-col justify-center items-center relative">
              {isAIGenerated && (
                <div className="absolute top-4 right-4">
                  <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13 7H7v6h6V7z"/>
                      <path fillRule="evenodd" d="M7 2a1 1 0 012 0v1h2V2a1 1 0 112 0v1h2a2 2 0 012 2v2h1a1 1 0 110 2h-1v2h1a1 1 0 110 2h-1v2a2 2 0 01-2 2h-2v1a1 1 0 11-2 0v-1H9v1a1 1 0 11-2 0v-1H5a2 2 0 01-2-2v-2H2a1 1 0 110-2h1V9H2a1 1 0 010-2h1V5a2 2 0 012-2h2V2z" clipRule="evenodd"/>
                    </svg>
                    AI Enhanced
                  </span>
                </div>
              )}
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
            <div className="bg-white rounded-lg shadow-xl p-8 h-full overflow-y-auto">
              <h3 className="text-gray-500 text-sm uppercase tracking-wide mb-4 text-center">Answer</h3>
              <div className={isAIGenerated ? "text-left" : "flex items-center justify-center h-full"}>
                {formatAnswer(card.answer)}
              </div>
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