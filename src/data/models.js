// Data models for the application

// Card model
export const createCard = ({
  question,
  answer,
  deckId
}) => ({
  id: Date.now().toString(), // Simple ID generation
  question,
  answer,
  deckId,
  createdAt: new Date().toISOString(),
  // SM-2 algorithm properties
  interval: 0,
  repetitions: 0,
  easeFactor: 2.5,
  nextReview: new Date().toISOString(),
  lastReviewed: null
});

// Deck model
export const createDeck = ({ name, description = '' }) => ({
  id: Date.now().toString(),
  name,
  description,
  createdAt: new Date().toISOString(),
  cardCount: 0
});

// Study session model
export const createStudySession = ({ deckId }) => ({
  id: Date.now().toString(),
  deckId,
  startedAt: new Date().toISOString(),
  completedAt: null,
  cardsStudied: 0,
  correctAnswers: 0
});