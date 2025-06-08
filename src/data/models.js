// Generate unique IDs
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Deck model
export const createDeck = (data) => {
  return {
    id: generateId(),
    name: data.name || '',
    description: data.description || '',
    cardCount: 0,
    createdAt: new Date().toISOString(),
    lastStudied: null
  };
};

// Card model with SM-2 algorithm properties
export const createCard = (data) => {
  return {
    deckId: data.deckId,
    question: data.question || '',
    answer: data.answer || '',
    // SM-2 Algorithm properties
    interval: 0,        // Days until next review
    repetitions: 0,     // Number of successful repetitions
    easeFactor: 2.5,    // Difficulty factor (starts at 2.5)
    nextReview: new Date().toISOString(), // Next review date
    lastReviewed: null, // Last review date
    createdAt: new Date().toISOString()
  };
};

// Study session model
export const createSession = (deckId) => {
  return {
    id: generateId(),
    deckId: deckId,
    startTime: new Date().toISOString(),
    endTime: null,
    cardsStudied: 0,
    cardsCorrect: 0,
    completed: false
  };
};

// Rating options for SM-2
export const RATING_OPTIONS = {
  AGAIN: 0,   // Complete blackout
  HARD: 3,    // Difficult but recalled
  GOOD: 4,    // Recalled with some effort
  EASY: 5     // Perfect recall
};