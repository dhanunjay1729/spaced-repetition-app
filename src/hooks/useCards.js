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
        setCards(loadedCards);
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
    if (!isAuthenticated) { setError("Please log in to add cards."); return; }
    try {
      const newCard = await saveCard(cardData);
      setCards([...cards, newCard]);
    } catch (err) {
      handleError(err, 'useCards - addCard');
      setError("Failed to add card.");
    }
  };

  const deleteCard = async (cardId) => {
    if (!isAuthenticated) { setError("Please log in to delete cards."); return; }
    try {
      await firestoreDeleteCard(cardId);
      setCards(cards.filter(card => card.id !== cardId));
    } catch (err) {
      handleError(err, 'useCards - deleteCard');
      setError("Failed to delete card.");
    }
  };

  // Update a card — accepts FSRS fields (due, stability, difficulty, etc.)
  const updateCard = async (cardId, updatedData) => {
    if (!isAuthenticated) { setError("Please log in to update cards."); return; }
    try {
      // Validate due date (FSRS) or nextReview (legacy SM-2)
      const dateToCheck = updatedData.due ?? updatedData.nextReview;
      if (!dateToCheck || isNaN(new Date(dateToCheck).getTime())) {
        throw new Error('Invalid due/nextReview date');
      }
      await firestoreUpdateCard(cardId, updatedData);
      setCards(prevCards =>
        prevCards.map(card => card.id === cardId ? { ...card, ...updatedData } : card)
      );
    } catch (err) {
      handleError(err, 'useCards - updateCard');
      setError("Failed to update card.");
      throw err;
    }
  };

  return { cards, loading, error, addCard, deleteCard, updateCard };
}

export default useCards;
