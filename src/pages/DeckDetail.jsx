import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import useDecks from '../hooks/useDecks';
import useCards from '../hooks/useCards';
import CardForm from '../components/CardForm';
import ErrorMessage from '../components/ErrorMessage';
import LoadingSpinner from '../components/LoadingSpinner';
import StudyProgress from '../components/StudyProgress';
import ForgettingCurve from '../components/ForgettingCurve';
import { createCard } from '../data/models';

// FSRS state labels for the card badge
const STATE_LABELS = { 0: 'New', 1: 'Learning', 2: 'Review', 3: 'Relearning' };
const STATE_COLORS = {
  0: 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300',
  1: 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300',
  2: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300',
  3: 'bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-300',
};

const DeckDetail = () => {
  const { deckId } = useParams();
  const { decks, loading: loadingDecks, error: deckError } = useDecks();
  const { cards, loading: loadingCards, error, addCard, updateCard, deleteCard } = useCards(deckId);

  const [showForm, setShowForm] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  // Track which card is expanded (showing forgetting curve)
  const [expandedCard, setExpandedCard] = useState(null);

  const deck = decks.find(d => d.id === deckId);

  if (error || deckError) return <ErrorMessage message={error || deckError} />;
  if (loadingDecks || loadingCards) return <LoadingSpinner />;

  const handleToggleExpand = (cardId) => {
    setExpandedCard(prev => prev === cardId ? null : cardId);
  };

  const handleCreateCard = async (cardData) => {
    const newCard = createCard({ ...cardData, deckId });
    await addCard(newCard);
    setShowForm(false);
  };

  const handleUpdateCard = async (cardData) => {
    const { id, ...updatedData } = cardData;
    await updateCard(id, updatedData);
    setShowForm(false);
    setEditingCard(null);
  };

  const handleDeleteCard = (cardId) => {
    confirmAlert({
      title: 'Confirm Card Deletion',
      message: 'Are you sure you want to delete this card?',
      buttons: [
        {
          label: 'Yes',
          onClick: async () => {
            try {
              await deleteCard(cardId);
              toast.success('Card deleted successfully!', { icon: '🗑️' });
            } catch {
              toast.error('Failed to delete card!');
            }
          },
          className: 'confirm-yes-button',
        },
        { label: 'No', onClick: () => toast('Deletion canceled') },
      ],
    });
  };

  const handleEditCard = (card) => {
    setEditingCard(card);
    setShowForm(true);
  };

  if (!deck) return <ErrorMessage message="Deck not found." />;

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      {/* Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-fade-in">
        <div>
          <Link to="/decks" className="text-brand-500 hover:text-brand-600 mb-2 inline-block transition-colors text-sm font-medium">
            ← Back to Decks
          </Link>
          <h1 className="text-4xl font-extrabold mb-1 text-gray-800 dark:text-white">{deck.name}</h1>
          {deck.description && (
            <p className="text-lg text-gray-500 dark:text-gray-400 mb-1">{deck.description}</p>
          )}
          <p className="text-sm text-gray-400 dark:text-gray-500">
            {cards.length} {cards.length === 1 ? 'card' : 'cards'}
          </p>
        </div>
        <div className="flex gap-3">
          {cards.length > 0 && (
            <Link
              to={`/study/${deckId}`}
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-medium rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-xl transition-all active:scale-[0.98]"
            >
              Study Now
            </Link>
          )}
          {!showForm && (
            <button onClick={() => { setShowForm(true); setEditingCard(null); }} className="btn-primary text-sm">
              + Add Card
            </button>
          )}
        </div>
      </div>

      {/* Study Progress */}
      {cards.length > 0 && (
        <div className="mb-8">
          <StudyProgress cards={cards} />
        </div>
      )}

      {/* Card Form */}
      {showForm && (
        <div className="mb-8 animate-slide-up">
          <CardForm
            key={editingCard?.id ?? 'new'}
            onSubmit={editingCard ? handleUpdateCard : handleCreateCard}
            onCancel={() => { setShowForm(false); setEditingCard(null); }}
            initialData={editingCard}
          />
        </div>
      )}

      {/* Cards Grid */}
      {!showForm && cards.length === 0 ? (
        <div className="text-center py-16 glass-elevated rounded-2xl animate-fade-in">
          <div className="text-4xl mb-4">🃏</div>
          <p className="text-gray-500 dark:text-gray-400 mb-4 text-lg">No cards in this deck yet.</p>
          <button onClick={() => setShowForm(true)} className="btn-primary text-sm">
            Create your first card
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {cards.map(card => {
            const isExpanded = expandedCard === card.id;
            const stateKey = card.state ?? 0;
            const dueDate = card.due ?? card.nextReview;
            const isDue = dueDate && new Date(dueDate) <= new Date();

            return (
              <div
                key={card.id}
                className={`glass-elevated rounded-2xl overflow-hidden transition-all duration-300 ${
                  isExpanded ? 'ring-1 ring-brand-500/40' : ''
                }`}
              >
                {/* Card header row — click to expand/collapse */}
                <div
                  className="flex items-center gap-3 p-5 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  onClick={() => handleToggleExpand(card.id)}
                >
                  {/* FSRS state badge */}
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${STATE_COLORS[stateKey]}`}>
                    {STATE_LABELS[stateKey]}
                  </span>

                  {/* Question / Answer preview */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 dark:text-white text-sm truncate">
                      {card.question}
                    </p>
                    {!isExpanded && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                        {card.answer}
                      </p>
                    )}
                  </div>

                  {/* Due indicator */}
                  <div className="shrink-0 text-right">
                    {isDue ? (
                      <span className="text-xs font-medium text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded-full">Due</span>
                    ) : dueDate ? (
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {new Date(dueDate).toLocaleDateString()}
                      </span>
                    ) : null}
                  </div>

                  {/* Expand arrow */}
                  <span className="text-gray-400 dark:text-gray-500 text-xs shrink-0 ml-1">
                    {isExpanded ? '▲' : '▼'}
                  </span>

                  {/* Edit / Delete buttons */}
                  <div className="flex gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => handleEditCard(card)}
                      className="w-7 h-7 flex items-center justify-center text-gray-400 bg-gray-100 dark:bg-white/10 rounded-full hover:bg-brand-100 hover:text-brand-500 dark:hover:bg-brand-500/20 transition-all text-xs"
                      title="Edit Card"
                    >
                      ✎
                    </button>
                    <button
                      onClick={() => handleDeleteCard(card.id)}
                      className="w-7 h-7 flex items-center justify-center text-gray-400 bg-gray-100 dark:bg-white/10 rounded-full hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-500/20 transition-all text-sm"
                      title="Delete Card"
                    >
                      ×
                    </button>
                  </div>
                </div>

                {/* Expanded panel: answer + forgetting curve */}
                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-gray-100 dark:border-white/5 animate-fade-in space-y-4">
                    {/* Answer */}
                    <div className="pt-4">
                      <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">Answer</p>
                      <p className="text-gray-700 dark:text-gray-200 text-sm leading-relaxed">{card.answer}</p>
                    </div>

                    {/* FSRS stats row */}
                    <div className="grid grid-cols-4 gap-2 text-center">
                      {[
                        { label: 'Reviews', value: card.reps ?? card.repetitions ?? 0 },
                        { label: 'Lapses', value: card.lapses ?? 0 },
                        { label: 'Stability', value: card.stability ? `${card.stability.toFixed(1)}d` : '—' },
                        { label: 'Difficulty', value: card.difficulty ? card.difficulty.toFixed(1) : '—' },
                      ].map(({ label, value }) => (
                        <div key={label} className="glass rounded-lg p-2">
                          <div className="font-bold text-sm text-gray-800 dark:text-white">{value}</div>
                          <div className="text-[10px] text-gray-400 dark:text-gray-500">{label}</div>
                        </div>
                      ))}
                    </div>

                    {/* Forgetting Curve Chart */}
                    <ForgettingCurve card={card} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DeckDetail;
