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
  const { decks, loading: loadingDecks, error: deckError, updateDeck } = useDecks();
  const { cards, loading: loadingCards, error, addCard, updateCard, deleteCard, reorderCards } = useCards(deckId);

  const [showForm, setShowForm] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  // Track which card is expanded (showing forgetting curve)
  const [expandedCard, setExpandedCard] = useState(null);
  const [isEditingDeck, setIsEditingDeck] = useState(false);
  const [deckName, setDeckName] = useState('');
  const [deckDescription, setDeckDescription] = useState('');
  const [draggedCardIndex, setDraggedCardIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  const deck = decks.find(d => d.id === deckId);

  if (error || deckError) return <ErrorMessage message={error || deckError} />;
  if (loadingDecks || loadingCards) return <LoadingSpinner />;

  const handleStartEditDeck = () => {
    setDeckName(deck?.name || '');
    setDeckDescription(deck?.description || '');
    setIsEditingDeck(true);
  };

  const handleSaveDeckInfo = async (e) => {
    e.preventDefault();
    if (!deckName.trim()) {
      return toast.error('Deck name is required!');
    }
    try {
      await updateDeck(deckId, {
        name: deckName.trim(),
        description: deckDescription.trim(),
      });
      setIsEditingDeck(false);
      toast.success('Deck updated successfully!');
    } catch {
      toast.error('Failed to update deck!');
    }
  };

  const handleToggleExpand = (cardId) => {
    setExpandedCard(prev => prev === cardId ? null : cardId);
  };

  const handleCreateCard = async (cardData) => {
    const newCard = createCard({ ...cardData, deckId, order: cards.length });
    await addCard(newCard);
    setShowForm(false);
  };

  const handleMoveCard = async (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= cards.length || fromIndex === toIndex) return;
    const newCards = [...cards];
    const [movedCard] = newCards.splice(fromIndex, 1);
    newCards.splice(toIndex, 0, movedCard);
    try {
      await reorderCards(newCards);
      toast.success('Card order updated!', { id: 'card-reorder' });
    } catch {
      toast.error('Failed to save card order!');
    }
  };

  const handleDragStart = (e, index) => {
    setDraggedCardIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedCardIndex === null || draggedCardIndex === index) return;
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = (index) => {
    if (dragOverIndex === index) {
      setDragOverIndex(null);
    }
  };

  const handleDrop = async (e, targetIndex) => {
    e.preventDefault();
    setDragOverIndex(null);
    if (draggedCardIndex === null || draggedCardIndex === targetIndex) return;
    const from = draggedCardIndex;
    setDraggedCardIndex(null);
    await handleMoveCard(from, targetIndex);
  };

  const handleDragEnd = () => {
    setDraggedCardIndex(null);
    setDragOverIndex(null);
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
        <div className="flex-1">
          <Link to="/decks" className="text-brand-500 hover:text-brand-600 mb-2 inline-block transition-colors text-sm font-medium">
            ← Back to Decks
          </Link>
          {isEditingDeck ? (
            <form onSubmit={handleSaveDeckInfo} className="glass p-4 rounded-xl space-y-3 max-w-lg mb-2">
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Deck Name</label>
                <input
                  type="text"
                  value={deckName}
                  onChange={(e) => setDeckName(e.target.value)}
                  className="input-field text-lg font-bold"
                  placeholder="Deck Name"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Description</label>
                <textarea
                  value={deckDescription}
                  onChange={(e) => setDeckDescription(e.target.value)}
                  className="input-field text-sm min-h-[60px]"
                  placeholder="Optional description..."
                />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="btn-primary text-xs py-1.5 px-3">
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingDeck(false)}
                  className="btn-secondary text-xs py-1.5 px-3"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <h1 className="text-4xl font-extrabold mb-1 text-gray-800 dark:text-white">{deck.name}</h1>
                <button
                  onClick={handleStartEditDeck}
                  className="text-gray-400 hover:text-brand-500 dark:hover:text-brand-400 transition-colors p-1 text-lg"
                  title="Edit Deck Name"
                  aria-label="Edit Deck Name"
                >
                  ✎
                </button>
              </div>
              {deck.description && (
                <p className="text-lg text-gray-500 dark:text-gray-400 mb-1">{deck.description}</p>
              )}
            </>
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
          {cards.length > 1 && (
            <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500 px-1">
              <span>Drag cards or use ↑ / ↓ buttons to rearrange in your preferred order.</span>
              <span>{cards.length} cards</span>
            </div>
          )}
          {cards.map((card, index) => {
            const isExpanded = expandedCard === card.id;
            const stateKey = card.state ?? 0;
            const dueDate = card.due ?? card.nextReview;
            const isDue = dueDate && new Date(dueDate) <= new Date();
            const isBeingDragged = draggedCardIndex === index;
            const isDropTarget = dragOverIndex === index;

            return (
              <div
                key={card.id}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragLeave={() => handleDragLeave(index)}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
                className={`glass-elevated rounded-2xl overflow-hidden transition-all duration-200 ${
                  isExpanded ? 'ring-1 ring-brand-500/40' : ''
                } ${isDropTarget ? 'ring-2 ring-brand-500 shadow-lg scale-[1.01]' : ''} ${
                  isBeingDragged ? 'opacity-40' : ''
                }`}
              >
                {/* Card header row — click to expand/collapse */}
                <div
                  className="flex items-center gap-3 p-5 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  onClick={() => handleToggleExpand(card.id)}
                >
                  {/* Drag Handle */}
                  <div
                    draggable={true}
                    onDragStart={(e) => handleDragStart(e, index)}
                    onClick={(e) => e.stopPropagation()}
                    className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 px-1 py-1 -ml-1 rounded flex items-center shrink-0"
                    title="Drag to rearrange card"
                    aria-label="Drag to rearrange card"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <circle cx="9" cy="6" r="1.5" />
                      <circle cx="15" cy="6" r="1.5" />
                      <circle cx="9" cy="12" r="1.5" />
                      <circle cx="15" cy="12" r="1.5" />
                      <circle cx="9" cy="18" r="1.5" />
                      <circle cx="15" cy="18" r="1.5" />
                    </svg>
                  </div>

                  {/* FSRS state badge */}
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${STATE_COLORS[stateKey]}`}>
                    {STATE_LABELS[stateKey]}
                  </span>

                  {/* Question / Answer preview */}
                  <div className="flex-1 min-w-0 flex items-center gap-3">
                    {card.questionImage && (
                      <img
                        src={card.questionImage}
                        alt="Question attachment preview"
                        className="w-8 h-8 rounded-lg object-cover border border-gray-200 dark:border-white/10 shrink-0"
                        title="Contains question image"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-gray-800 dark:text-white text-sm truncate">
                        {card.question}
                      </p>
                      {!isExpanded && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                          {card.answer}
                        </p>
                      )}
                    </div>
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

                  {/* Reorder and Edit / Delete buttons */}
                  <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => handleMoveCard(index, index - 1)}
                      disabled={index === 0}
                      className="w-7 h-7 flex items-center justify-center text-gray-400 bg-gray-100 dark:bg-white/10 rounded-full hover:bg-brand-100 hover:text-brand-500 dark:hover:bg-brand-500/20 disabled:opacity-20 disabled:pointer-events-none transition-all text-xs"
                      title="Move Up"
                      aria-label="Move Card Up"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => handleMoveCard(index, index + 1)}
                      disabled={index === cards.length - 1}
                      className="w-7 h-7 flex items-center justify-center text-gray-400 bg-gray-100 dark:bg-white/10 rounded-full hover:bg-brand-100 hover:text-brand-500 dark:hover:bg-brand-500/20 disabled:opacity-20 disabled:pointer-events-none transition-all text-xs"
                      title="Move Down"
                      aria-label="Move Card Down"
                    >
                      ↓
                    </button>
                    <button
                      onClick={() => handleEditCard(card)}
                      className="w-7 h-7 flex items-center justify-center text-gray-400 bg-gray-100 dark:bg-white/10 rounded-full hover:bg-brand-100 hover:text-brand-500 dark:hover:bg-brand-500/20 transition-all text-xs ml-1"
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
                    {/* Full Question (multiline support) */}
                    <div className="pt-3">
                      <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">Full Question</p>
                      <p className="text-gray-800 dark:text-gray-100 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                        {card.question}
                      </p>
                    </div>

                    {/* Question Image if present */}
                    {card.questionImage && (
                      <div>
                        <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1.5">Question Image</p>
                        <div className="inline-block border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden bg-black/5 dark:bg-white/5 p-1">
                          <img
                            src={card.questionImage}
                            alt="Question attachment"
                            className="max-h-64 max-w-full rounded-lg object-contain"
                          />
                        </div>
                      </div>
                    )}

                    {/* Answer */}
                    <div className="pt-2">
                      <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">Answer</p>
                      <p className="text-gray-700 dark:text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">{card.answer}</p>
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
