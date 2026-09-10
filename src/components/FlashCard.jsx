import React, { useState, useEffect } from 'react';
import AIService from '../utils/aiService';

// FlashCard component — handles single card display, flip, hint, and FSRS rating.
// FSRS rating values: Again=1, Hard=2, Good=3, Easy=4
const Flashcard = ({ card, onRate }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [hint, setHint] = useState('');
  const [loadingHint, setLoadingHint] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  const [timeTaken, setTimeTaken] = useState(0);
  const [hintUsed, setHintUsed] = useState(false);

  useEffect(() => {
    setIsFlipped(false);
    setShowRating(false);
    setHint('');
    setHintUsed(false);
    setStartTime(Date.now());
  }, [card.id]);

  const handleFlip = () => {
    setIsFlipped(true);
    setTimeTaken(Date.now() - startTime);
    setTimeout(() => setShowRating(true), 300);
  };

  const handleRate = (rating) => {
    onRate(rating);
    setIsFlipped(false);
    setShowRating(false);
  };

  const handleHint = async () => {
    setLoadingHint(true);
    setHintUsed(true);
    try {
      const hintResponse = await AIService.generateHint(card.question);
      setHint(hintResponse);
    } catch (error) {
      console.error('Failed to fetch hint:', error);
      setHint('Unable to fetch a hint at the moment. Please try again later.');
    } finally {
      setLoadingHint(false);
    }
  };

  const isAIGenerated = card.metadata?.isAIGenerated;

  const formatAnswer = (answer) => {
    if (!answer) return '';
    const lines = answer.split('\n');
    return lines.map((line, index) => {
      if (line.trim() === '') return <br key={index} />;
      if (isAIGenerated) {
        if (line.startsWith('Definition:')) {
          return <div key={index} className="mb-2"><strong className="text-brand-500">Definition:</strong> {line.substring(11)}</div>;
        }
        if (line.startsWith('Examples:')) {
          return <div key={index} className="mb-2"><strong className="text-purple-500">Examples:</strong></div>;
        }
        if (line.match(/^[\d-•*]\s*\.?\s*/)) {
          return <div key={index} className="mb-1 ml-4">{line}</div>;
        }
      }
      return <div key={index} className="mb-1">{line}</div>;
    });
  };

  const formatQuestion = (question) => {
    if (!question) return '';
    const lines = question.split('\n');
    return lines.map((line, index) => (
      line.trim() === '' ? <br key={index} /> : <div key={index}>{line}</div>
    ));
  };

  // Honest review constraints (unchanged logic, updated to FSRS rating values):
  // Using a hint caps max rating at Hard (2)
  // Taking >15s caps max rating at Good (3)
  const isGoodDisabled = hintUsed;
  const isEasyDisabled = hintUsed || timeTaken > 15000;

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
                  <button onClick={handleFlip} className="btn-primary text-sm sm:text-base">
                    Show Answer
                  </button>
                  <button onClick={handleHint} className="btn-secondary text-sm sm:text-base" disabled={loadingHint}>
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

      {/* Rating buttons — FSRS: Again=1, Hard=2, Good=3, Easy=4 */}
      {showRating && (
        <div className="mt-6 sm:mt-8 space-y-4 animate-slide-up">
          <p className="text-center text-gray-500 dark:text-gray-400 mb-3 sm:mb-4 text-sm sm:text-base">How well did you remember?</p>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">

            <button onClick={() => handleRate(1)}
              className="px-4 py-3 sm:px-6 sm:py-4 bg-red-500/90 hover:bg-red-600 text-white font-medium rounded-xl transition-all active:scale-[0.97]">
              <span className="block text-base sm:text-lg">Again</span>
              <span className="block text-xs sm:text-sm opacity-70">Didn't remember</span>
            </button>

            <button onClick={() => handleRate(2)}
              className="px-4 py-3 sm:px-6 sm:py-4 bg-orange-500/90 hover:bg-orange-600 text-white font-medium rounded-xl transition-all active:scale-[0.97]">
              <span className="block text-base sm:text-lg">Hard</span>
              <span className="block text-xs sm:text-sm opacity-70">Difficult recall</span>
            </button>

            <button onClick={() => handleRate(3)}
              disabled={isGoodDisabled}
              className={`px-4 py-3 sm:px-6 sm:py-4 text-white font-medium rounded-xl transition-all active:scale-[0.97] ${
                isGoodDisabled ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed' : 'bg-brand-500/90 hover:bg-brand-600'
              }`}>
              <span className="block text-base sm:text-lg">Good</span>
              <span className="block text-xs sm:text-sm opacity-70">
                {isGoodDisabled ? 'Disabled (Hint used)' : 'Recalled with effort'}
              </span>
            </button>

            <button onClick={() => handleRate(4)}
              disabled={isEasyDisabled}
              className={`px-4 py-3 sm:px-6 sm:py-4 text-white font-medium rounded-xl transition-all active:scale-[0.97] ${
                isEasyDisabled ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed' : 'bg-emerald-500/90 hover:bg-emerald-600'
              }`}>
              <span className="block text-base sm:text-lg">Easy</span>
              <span className="block text-xs sm:text-sm opacity-70">
                {hintUsed ? 'Disabled (Hint used)' : timeTaken > 15000 ? 'Disabled (>15s)' : 'Perfect recall'}
              </span>
            </button>

          </div>
        </div>
      )}
    </div>
  );
};

export default Flashcard;
