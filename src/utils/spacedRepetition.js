// utils/spacedRepetition.js
// FSRS-6 replaces SM-2 as the scheduling engine.
// FSRS is the algorithm Anki adopted as its default in October 2023.
// It tracks Stability (S), Difficulty (D), and Retrievability (R) per card,
// achieving ~4% recall prediction error vs SM-2's ~14% on 100M+ real reviews.

import { createEmptyCard, fsrs, Rating, State } from 'ts-fsrs';

// ─── Scheduler Instance ────────────────────────────────────────────────────
// Uses research-backed default parameters. Per-user optimization can be added
// later once a user has 400+ reviews in reviewLogs.
const scheduler = fsrs();

// ─── Rating Map ────────────────────────────────────────────────────────────
// Maps UI button labels to FSRS Rating enum values.
// FSRS: Again=1, Hard=2, Good=3, Easy=4
export const RATING_OPTIONS = {
  AGAIN: Rating.Again, // 1 — complete blackout
  HARD:  Rating.Hard,  // 2 — recalled with difficulty
  GOOD:  Rating.Good,  // 3 — recalled with effort
  EASY:  Rating.Easy,  // 4 — perfect recall
};

// ─── Create a brand-new FSRS card ─────────────────────────────────────────
/**
 * Returns FSRS initial state fields to merge into a card before saving.
 * Call this when creating any new card (manual or AI-generated).
 */
export const createFSRSCard = () => {
  const empty = createEmptyCard(new Date());
  return {
    stability:      empty.stability,
    difficulty:     empty.difficulty,
    elapsed_days:   empty.elapsed_days,
    scheduled_days: empty.scheduled_days,
    reps:           empty.reps,
    lapses:         empty.lapses,
    state:          empty.state,
    last_review:    empty.last_review ?? null,
    due:            new Date().toISOString(),
    nextReview:     new Date().toISOString(),
  };
};

// ─── Apply a rating to a card ──────────────────────────────────────────────
/**
 * Schedules the next review using FSRS-6 given the current card state.
 * @param {Object} card   - Card from Firestore (has stability, difficulty, state, etc.)
 * @param {number} rating - RATING_OPTIONS.AGAIN / HARD / GOOD / EASY
 * @param {Date}   now    - Optional: override current time (default: new Date())
 * @returns {Object} Updated fields to merge into the card in Firestore
 */
export const updateCardWithFSRS = (card, rating, now = new Date()) => {
  const fsrsCard = {
    due:            card.due ? new Date(card.due) : now,
    stability:      card.stability   ?? 0,
    difficulty:     card.difficulty  ?? 0,
    elapsed_days:   card.elapsed_days  ?? 0,
    scheduled_days: card.scheduled_days ?? 0,
    reps:           card.reps    ?? 0,
    lapses:         card.lapses  ?? 0,
    state:          card.state   ?? State.New,
    last_review:    card.last_review ? new Date(card.last_review) : null,
  };

  const { card: next } = scheduler.next(fsrsCard, now, rating);

  return {
    stability:      next.stability,
    difficulty:     next.difficulty,
    elapsed_days:   next.elapsed_days,
    scheduled_days: next.scheduled_days,
    reps:           next.reps,
    lapses:         next.lapses,
    state:          next.state,
    last_review:    now.toISOString(),
    due:            next.due.toISOString(),
    nextReview:     next.due.toISOString(),
    lastReviewed:   now.toISOString(),
  };
};

/**
 * Preview all 4 rating outcomes without committing.
 * Useful for showing the user what interval each rating would result in.
 */
export const previewFSRSRatings = (card, now = new Date()) => {
  const fsrsCard = {
    due:            card.due ? new Date(card.due) : now,
    stability:      card.stability   ?? 0,
    difficulty:     card.difficulty  ?? 0,
    elapsed_days:   card.elapsed_days  ?? 0,
    scheduled_days: card.scheduled_days ?? 0,
    reps:           card.reps    ?? 0,
    lapses:         card.lapses  ?? 0,
    state:          card.state   ?? State.New,
    last_review:    card.last_review ? new Date(card.last_review) : null,
  };
  return scheduler.repeat(fsrsCard, now);
};

// ─── Due Cards ────────────────────────────────────────────────────────────
/**
 * Returns cards whose next review is at or before now.
 * Works for both FSRS cards (due field) and legacy SM-2 cards (nextReview field).
 */
export const getDueCards = (cards) => {
  const now = new Date();
  return cards.filter(card => {
    const dueDate = new Date(card.due ?? card.nextReview);
    return dueDate <= now;
  });
};

// ─── Card Status Grouping ──────────────────────────────────────────────────
/**
 * Groups cards into New / Due / Learning / Learned.
 * Maps FSRS State enum to display labels. Backward-compatible with old SM-2 cards.
 */
export const getCardsByStatus = (cards) => {
  const now = new Date();

  return cards.reduce((acc, card) => {
    const dueDate = new Date(card.due ?? card.nextReview);
    const isDue = dueDate <= now;

    // FSRS state-based classification
    if (card.state === State.New || card.state === 0) {
      acc.new.push(card);
    } else if (card.state === State.Learning || card.state === State.Relearning || card.state === 1 || card.state === 3) {
      isDue ? acc.due.push(card) : acc.learning.push(card);
    } else if (card.state === State.Review || card.state === 2) {
      if (isDue) {
        acc.due.push(card);
      } else if ((card.reps ?? 0) < 3) {
        acc.learning.push(card);
      } else {
        acc.learned.push(card);
      }
    } else {
      // Legacy SM-2 card fallback
      const repetitions = card.repetitions ?? 0;
      if (repetitions === 0) {
        acc.new.push(card);
      } else if (isDue) {
        acc.due.push(card);
      } else if (repetitions < 3) {
        acc.learning.push(card);
      } else {
        acc.learned.push(card);
      }
    }
    return acc;
  }, { new: [], due: [], learning: [], learned: [] });
};

// ─── Retention / Forgetting Curve ─────────────────────────────────────────
/**
 * Computes the FSRS-6 power-law forgetting curve for a card.
 * Formula: R(t) = (1 + factor * t/S)^(-w20)
 * where factor = 0.9^(-1/w20) - 1, ensuring R = 90% when t = S (days).
 *
 * @param {number} stabilityDays - Card's current stability in days
 * @param {number} totalDays     - How far out to plot (default: 3× stability, min 30 days)
 * @param {number} w20           - FSRS-6 shape parameter (default: 0.1542)
 * @returns {Array<{day: number, retention: number}>}
 */
export const generateForgettingCurve = (stabilityDays, totalDays = null, w20 = 0.1542) => {
  const S = Math.max(stabilityDays ?? 1, 0.1);
  const plotDays = totalDays ?? Math.max(S * 3, 30);
  const factor = Math.pow(0.9, -1 / w20) - 1;
  const points = [];

  const step = plotDays / 60;
  for (let t = 0; t <= plotDays; t += step) {
    const R = Math.pow(1 + factor * (t / S), -w20);
    points.push({
      day: parseFloat(t.toFixed(1)),
      retention: Math.max(0, Math.round(R * 100)),
    });
  }
  return points;
};

/**
 * Returns current retention % for a card based on how long ago it was last reviewed.
 */
export const getCurrentRetention = (card) => {
  if (!card.stability || !card.last_review) return 100;
  const S = card.stability;
  const lastReview = new Date(card.last_review);
  const elapsedDays = (Date.now() - lastReview.getTime()) / (1000 * 60 * 60 * 24);
  const w20 = 0.1542;
  const factor = Math.pow(0.9, -1 / w20) - 1;
  const R = Math.pow(1 + factor * (elapsedDays / S), -w20);
  return Math.max(0, Math.round(R * 100));
};

// ─── Interval Formatting ───────────────────────────────────────────────────
export const formatInterval = (days) => {
  if (!days || days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  if (days < 7) return `${days} days`;
  if (days < 30) return `${Math.round(days / 7)} weeks`;
  if (days < 365) return `${Math.round(days / 30)} months`;
  return `${Math.round(days / 365)} years`;
};

// ─── Rating Button Config ──────────────────────────────────────────────────
export const getRatingButtons = () => [
  { rating: RATING_OPTIONS.AGAIN, label: 'Again', color: 'red',    description: 'Complete blackout' },
  { rating: RATING_OPTIONS.HARD,  label: 'Hard',  color: 'orange', description: 'Difficult recall' },
  { rating: RATING_OPTIONS.GOOD,  label: 'Good',  color: 'blue',   description: 'Correct with effort' },
  { rating: RATING_OPTIONS.EASY,  label: 'Easy',  color: 'green',  description: 'Perfect recall' },
];


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
      newInterval = Math.round(interval * newEaseFactor);  // Subsequent reviews → EF growth
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
