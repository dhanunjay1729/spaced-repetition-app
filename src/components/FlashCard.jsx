import React, { useState, useEffect } from 'react';
import AIService from '../utils/aiService'; // Import AIService for generating hints

//the flashcard data, including the question, answer, and metadata
const Flashcard = ({ card, onRate }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [hint, setHint] = useState(''); // State to store the hint
  const [loadingHint, setLoadingHint] = useState(false); // State to track hint loading
  const [startTime, setStartTime] = useState(Date.now());
  const [timeTaken, setTimeTaken] = useState(0);
  const [hintUsed, setHintUsed] = useState(false);

  // Reset state when card changes (when a new card is loaded)
  useEffect(() => {
    setIsFlipped(false);
    setShowRating(false);
    setHint(''); // Clear the hint when a new card is loaded
    setHintUsed(false);
    setStartTime(Date.now());
  }, [card.id]);

  const handleFlip = () => {
    setIsFlipped(true);
    setTimeTaken(Date.now() - startTime); // Record how long user thought before flipping
    // Show rating buttons after a short delay
    setTimeout(() => setShowRating(true), 300);
  };

  const handleRate = (rating) => {
    onRate(rating);
    setIsFlipped(false);
    setShowRating(false);
  };

  const handleHint = async () => {
    setLoadingHint(true); // Show loading state for the hint
    setHintUsed(true); // Penalize score ceiling for using a hint
    try {
      const hintResponse = await AIService.generateHint(card.question); // Fetch hint using AI
      setHint(hintResponse); // Set the hint
    } catch (error) {
      console.error('Failed to fetch hint:', error);
      setHint('Unable to fetch a hint at the moment. Please try again later.');
    } finally {
      setLoadingHint(false); // Hide loading state
    }
  };

  // Check if card is AI-generated
  const isAIGenerated = card.metadata?.isAIGenerated;

  // Format answer for display - preserving original formatting
  const formatAnswer = (answer) => {
    if (!answer) return '';

    // Split by newlines and preserve empty lines
    const lines = answer.split('\n');
    
    return lines.map((line, index) => {
      // Check if it's an empty line
      if (line.trim() === '') {
        return <br key={index} />;
      }
      
      // Check for special formatted lines (AI-generated content)
      if (isAIGenerated) {
        if (line.startsWith('Definition:')) {
          return (
            <div key={index} className="mb-2">
              <strong className="text-brand-500">Definition:</strong> {line.substring(11)}
            </div>
          );
        }
        if (line.startsWith('Examples:')) {
          return (
            <div key={index} className="mb-2">
              <strong className="text-purple-500">Examples:</strong>
            </div>
          );
        }
        // Handle bullet points or numbered lists
        if (line.match(/^[\d-•*]\s*\.?\s*/)) {
          return <div key={index} className="mb-1 ml-4">{line}</div>;
        }
      }
      
      // Default line rendering
      return <div key={index} className="mb-1">{line}</div>;
    });
  };

  // Format question with line breaks preserved
  const formatQuestion = (question) => {
    if (!question) return '';
    
    const lines = question.split('\n');
    return lines.map((line, index) => (
      line.trim() === '' ? <br key={index} /> : <div key={index}>{line}</div>
    ));
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 max-w-full sm:max-w-2xl mx-auto">
      <div className="perspective-1000">
        <div
          className={`relative w-full h-96 sm:h-96 md:h-[28rem] transition-all duration-500 transform-style-preserve-3d ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* Front of card (Question) */}
          <div className="absolute inset-0 w-full h-full backface-hidden">
            <div className="glass-elevated rounded-2xl p-4 sm:p-6 md:p-8 h-full flex flex-col justify-center relative overflow-y-auto">
              {isAIGenerated && (
                <div className="absolute top-2 right-2 sm:top-4 sm:right-4">
                  <span className="bg-brand-100 dark:bg-brand-500/20 text-brand-700 dark:text-brand-300 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                    AI Enhanced
                  </span>
                </div>
              )}
              <h3 className="text-gray-400 dark:text-gray-500 text-sm uppercase tracking-wide mb-4 text-center font-medium">Question</h3>
              <div className="text-base sm:text-lg md:text-xl text-gray-800 dark:text-gray-100 text-center flex-grow flex items-center justify-center">
                <div className="w-full">{formatQuestion(card.question)}</div>
              </div>
              {!isFlipped && (
                <div className="mt-6 flex flex-col items-center gap-3">
                  <button
                    onClick={handleFlip}
                    className="btn-primary text-sm sm:text-base"
                  >
                    Show Answer
                  </button>
                  <button
                    onClick={handleHint}
                    className="btn-secondary text-sm sm:text-base"
                    disabled={loadingHint}
                  >
                    {loadingHint ? 'Loading Hint...' : 'Show Hint'}
                  </button>
                </div>
              )}
              {hint && (
                <div className="mt-4 p-3 sm:p-4 glass rounded-xl max-h-32 overflow-y-auto">
                  <h4 className="text-gray-500 dark:text-gray-400 text-sm uppercase tracking-wide mb-2 font-medium">Hint</h4>
                  <p className="text-gray-800 dark:text-gray-200 text-sm sm:text-base">{hint}</p>
                </div>
              )}
            </div>
          </div>

          {/* Back of card (Answer) */}
          <div className="absolute inset-0 w-full h-full rotate-y-180 backface-hidden">
            <div className="glass-elevated rounded-2xl p-4 sm:p-6 md:p-8 h-full overflow-y-auto">
              <h3 className="text-gray-400 dark:text-gray-500 text-sm uppercase tracking-wide mb-4 text-center font-medium">Answer</h3>
              <div className={`text-base sm:text-lg md:text-xl text-gray-800 dark:text-gray-100 ${isAIGenerated ? 'text-left' : 'text-center'}`}>
                {formatAnswer(card.answer)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rating buttons */}
      {showRating && (
        <div className="mt-6 sm:mt-8 space-y-4 animate-slide-up">
          <p className="text-center text-gray-500 dark:text-gray-400 mb-3 sm:mb-4 text-sm sm:text-base">How well did you remember?</p>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <button
              onClick={() => handleRate(0)}
              className="px-4 py-3 sm:px-6 sm:py-4 bg-red-500/90 hover:bg-red-600 text-white font-medium rounded-xl transition-all active:scale-[0.97]"
            >
              <span className="block text-base sm:text-lg">Again</span>
              <span className="block text-xs sm:text-sm opacity-70">Didn't remember</span>
            </button>
            <button
              onClick={() => handleRate(3)}
              className="px-4 py-3 sm:px-6 sm:py-4 bg-orange-500/90 hover:bg-orange-600 text-white font-medium rounded-xl transition-all active:scale-[0.97]"
            >
              <span className="block text-base sm:text-lg">Hard</span>
              <span className="block text-xs sm:text-sm opacity-70">Difficult recall</span>
            </button>
            <button
              onClick={() => handleRate(4)}
              disabled={hintUsed}
              className={`px-4 py-3 sm:px-6 sm:py-4 text-white font-medium rounded-xl transition-all active:scale-[0.97] ${hintUsed ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed' : 'bg-brand-500/90 hover:bg-brand-600'}`}
            >
              <span className="block text-base sm:text-lg">Good</span>
              <span className="block text-xs sm:text-sm opacity-70">
                {hintUsed ? 'Disabled (Hint used)' : 'Recalled with effort'}
              </span>
            </button>
            <button
              onClick={() => handleRate(5)}
              disabled={hintUsed || timeTaken > 15000}
              className={`px-4 py-3 sm:px-6 sm:py-4 text-white font-medium rounded-xl transition-all active:scale-[0.97] ${hintUsed || timeTaken > 15000 ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed' : 'bg-emerald-500/90 hover:bg-emerald-600'}`}
            >
              <span className="block text-base sm:text-lg">Easy</span>
              <span className="block text-xs sm:text-sm opacity-70">
                {hintUsed ? 'Disabled (Hint used)' : (timeTaken > 15000 ? 'Disabled (>15s thought)' : 'Perfect recall')}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Flashcard;