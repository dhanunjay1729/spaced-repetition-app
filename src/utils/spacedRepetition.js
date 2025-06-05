import { RATING_OPTIONS } from '../data/models';

/**
 * SM-2 Algorithm Implementation
 * Based on: https://en.wikipedia.org/wiki/SuperMemo#Description_of_SM-2_algorithm
 */

/**
 * Calculate the next review interval and ease factor
 * @param {Object} card - The card being reviewed
 * @param {number} quality - Quality of recall (0-5)
 * @returns {Object} Updated card properties
 */
export const calculateSM2 = (card, quality) => {
  // Copy current values
  let { interval, repetitions, easeFactor } = card;
  
  // Calculate new ease factor
  // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  const newEaseFactor = Math.max(
    1.3, 
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  );
  
  // Calculate next interval
  let newInterval;
  let newRepetitions;
  
  if (quality < 3) {
    // If quality is less than 3, restart learning
    newInterval = 1;
    newRepetitions = 0;
  } else {
    // Calculate based on previous values
    if (repetitions === 0) {
      newInterval = 1;
    } else if (repetitions === 1) {
      newInterval = 6;
    } else {
      newInterval = Math.round(interval * easeFactor);
    }
    newRepetitions = repetitions + 1;
  }
  
  // Calculate next review date
  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);
  
  return {
    interval: newInterval,
    repetitions: newRepetitions,
    easeFactor: newEaseFactor,
    nextReview: nextReviewDate.toISOString(),
    lastReviewed: new Date().toISOString()
  };
};

/**
 * Get cards due for review
 * @param {Array} cards - All cards
 * @returns {Array} Cards due for review
 */
export const getDueCards = (cards) => {
  const now = new Date();
  now.setHours(23, 59, 59, 999); // Include all cards due today
  
  return cards.filter(card => {
    const reviewDate = new Date(card.nextReview);
    return reviewDate <= now;
  });
};

/**
 * Get cards by their learning status
 * @param {Array} cards - All cards
 * @returns {Object} Cards grouped by status
 */
export const getCardsByStatus = (cards) => {
  const now = new Date();
  
  return cards.reduce((acc, card) => {
    const reviewDate = new Date(card.nextReview);
    
    if (card.repetitions === 0) {
      acc.new.push(card);
    } else if (reviewDate <= now) {
      acc.due.push(card);
    } else if (card.repetitions < 3) {
      acc.learning.push(card);
    } else {
      acc.learned.push(card);
    }
    
    return acc;
  }, { new: [], due: [], learning: [], learned: [] });
};

/**
 * Format interval for display
 * @param {number} interval - Interval in days
 * @returns {string} Human-readable interval
 */
export const formatInterval = (interval) => {
  if (interval === 0) return 'Now';
  if (interval === 1) return 'Tomorrow';
  if (interval < 7) return `${interval} days`;
  if (interval < 30) return `${Math.round(interval / 7)} weeks`;
  if (interval < 365) return `${Math.round(interval / 30)} months`;
  return `${Math.round(interval / 365)} years`;
};

/**
 * Get rating button config
 * @returns {Array} Rating button configurations
 */
export const getRatingButtons = () => [
  { 
    rating: RATING_OPTIONS.AGAIN, 
    label: 'Again', 
    color: 'red',
    description: 'Complete blackout'
  },
  { 
    rating: RATING_OPTIONS.HARD, 
    label: 'Hard', 
    color: 'orange',
    description: 'Difficult recall'
  },
  { 
    rating: RATING_OPTIONS.GOOD, 
    label: 'Good', 
    color: 'blue',
    description: 'Correct with effort'
  },
  { 
    rating: RATING_OPTIONS.EASY, 
    label: 'Easy', 
    color: 'green',
    description: 'Perfect recall'
  }
];