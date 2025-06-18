import { RATING_OPTIONS } from '../data/models';
import { addDays, startOfDay } from 'date-fns';

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
  console.log('Calculating SM-2 for card:', card, 'Quality:', quality);

  let { interval, repetitions, easeFactor } = card;

  // Adjust ease factor (EF)
  const newEaseFactor = Math.max(
    1.3,
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  );

  let newInterval;
  let newRepetitions;

  if (quality < 3) {
    // Forgot → Reset repetitions and review tomorrow
    newInterval = 1;
    newRepetitions = 0;
  } else {
    // Remembered → Apply SM2 spacing
    if (repetitions === 0) {
      newInterval = 1; // First review → 1 day later
    } else if (repetitions === 1) {
      newInterval = 6; // Second review → 6 days later
    } else {
      // Use the updated ease factor when calculating the next interval
      newInterval = Math.round(interval * newEaseFactor); // Subsequent reviews → EF growth
    }
    newRepetitions = repetitions + 1;
  }

  // Always set nextReview to start of day for consistency
  const nextReviewDate = startOfDay(addDays(new Date(), newInterval));

  const updatedCard = {
    interval: newInterval,
    repetitions: newRepetitions,
    easeFactor: newEaseFactor,
    nextReview: nextReviewDate.toISOString(),
    lastReviewed: new Date().toISOString()
  };

  console.log('Updated card properties:', updatedCard);
  return updatedCard;
};

/**
 * Get cards due for review
 * @param {Array} cards - All cards
 * @returns {Array} Cards due for review
 */
export const getDueCards = (cards) => {
  const now = new Date();

  return cards.filter(card => {
    const reviewDate = new Date(card.nextReview);
    return reviewDate <= now; // Include cards due up to now
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
