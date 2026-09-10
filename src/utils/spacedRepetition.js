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
export const getDueCards = (cards) => {
  const now = new Date();
  return cards.filter(card => {
    const dueDate = new Date(card.due ?? card.nextReview);
    return dueDate <= now;
  });
};

// ─── Card Status Grouping ──────────────────────────────────────────────────
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
