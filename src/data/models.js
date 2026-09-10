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

// Card model with FSRS-6 algorithm properties
// FSRS replaced SM-2 as the scheduling engine (Anki adopted it Oct 2023).
// Fields: stability (memory strength in days), difficulty (1-10 scale),
//         state (New/Learning/Review/Relearning), reps, lapses, due.
export const createCard = (data) => {
  const now = new Date().toISOString();
  return {
    deckId: data.deckId,
    question: data.question || '',
    answer: data.answer || '',
    // FSRS-6 memory state fields
    stability:      0,      // Memory stability in days (grows with each review)
    difficulty:     0,      // Inherent card difficulty 1-10 (0 = not yet set)
    elapsed_days:   0,
    scheduled_days: 0,
    reps:           0,      // Total review count
    lapses:         0,      // Times forgotten (Again pressed)
    state:          0,      // 0=New, 1=Learning, 2=Review, 3=Relearning
    last_review:    null,
    due:            now,    // ISO string: when this card is next due
    nextReview:     now,    // Alias kept for UI components
    createdAt:      now,
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

// Rating options — FSRS uses 1/2/3/4 (Again/Hard/Good/Easy)
export const RATING_OPTIONS = {
  AGAIN: 1,
  HARD:  2,
  GOOD:  3,
  EASY:  4,
};
