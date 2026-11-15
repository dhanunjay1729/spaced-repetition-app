// hooks/useCards.js
import { useState, useEffect } from "react";
import { saveCard, fetchCards, deleteCard as firestoreDeleteCard, updateCard as firestoreUpdateCard } from "../utils/firestore";
import { handleError } from '../utils/errorHandler';
import { useAuth } from '../contexts/AuthContext';

// A custom hook that manages cards for a specific deck (if deckId is provided) or all cards
function useCards(deckId = null) {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated, userId } = useAuth();

  useEffect(() => {
    const fetchCardsData = async () => {
      if (!isAuthenticated || !userId) {
        setCards([]);
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const loadedCards = await fetchCards(deckId);
        const sortedCards = [...loadedCards].sort((a, b) => {
          const orderA = typeof a.order === 'number' ? a.order : Infinity;
          const orderB = typeof b.order === 'number' ? b.order : Infinity;
          if (orderA !== orderB) return orderA - orderB;
          const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return timeA - timeB;
        });
        setCards(sortedCards);
      } catch (err) {
        handleError(err, 'useCards - fetchCardsData');
        if (err.message === 'No authenticated user found') {
          setError("Please log in to view your cards.");
        } else {
          setError("Failed to load cards.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchCardsData();
  }, [deckId, isAuthenticated, userId]);

  const addCard = async (cardData) => {
    if (!isAuthenticated) throw new Error("Please log in to add cards.");
    const newCard = await saveCard(cardData);
    setCards(prevCards => [...prevCards, newCard]);
    return newCard;
  };

  const deleteCard = async (cardId) => {
    if (!isAuthenticated) throw new Error("Please log in to delete cards.");
    await firestoreDeleteCard(cardId);
    setCards(prevCards => prevCards.filter(card => card.id !== cardId));
  };

  // Update a card — accepts FSRS fields (due, stability, difficulty, etc.) or partial edits
  const updateCard = async (cardId, updatedData) => {
    if (!isAuthenticated) throw new Error("Please log in to update cards.");
    if (updatedData.due !== undefined || updatedData.nextReview !== undefined) {
      const dateToCheck = updatedData.due ?? updatedData.nextReview;
      if (!dateToCheck || isNaN(new Date(dateToCheck).getTime())) {
        throw new Error('Invalid due/nextReview date');
      }
    }
    await firestoreUpdateCard(cardId, updatedData);
    setCards(prevCards =>
      prevCards.map(card => card.id === cardId ? { ...card, ...updatedData } : card)
    );
  };

  // Reorder cards in a deck and persist order indices
  const reorderCards = async (newOrderedCards) => {
    if (!isAuthenticated) throw new Error("Please log in to reorder cards.");
    const updated = newOrderedCards.map((card, index) => ({
      ...card,
      order: index
    }));
    setCards(updated);

    try {
      const updatePromises = updated.map((card) =>
        firestoreUpdateCard(card.id, { order: card.order })
      );
      await Promise.all(updatePromises);
    } catch (err) {
      handleError(err, 'useCards - reorderCards');
      throw err;
    }
  };

  return { cards, loading, error, addCard, deleteCard, updateCard, reorderCards };
}

export default useCards;
