// hooks/useCards.js
import { useState, useEffect } from "react";
import { saveCard, fetchCards, deleteCard as firestoreDeleteCard, updateCard as firestoreUpdateCard } from "../utils/firestore";
import { handleError } from '../utils/errorHandler';
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from '../contexts/AuthContext';

// A custom hook that manages cards for a specific deck (if deckId is provided) or all cards
function useCards(deckId = null) {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated, userId } = useAuth();

  // Load cards on mount or when deckId/user changes
  useEffect(() => {
    const fetchCardsData = async () => {
      // Only fetch if user is authenticated
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
  }, [deckId, isAuthenticated, userId]); // Re-fetch when deck, auth state, or user changes

  // Add a new card
  const addCard = async (cardData) => {
    if (!isAuthenticated) {
      setError("Please log in to add cards.");
      return;
    }

    try {
      const newCard = await saveCard(cardData);
      setCards([...cards, newCard]);
    } catch (err) {
      handleError(err, 'useCards - addCard');
      setError("Failed to add card.");
    }
  };

  // Delete a card
  const deleteCard = async (cardId) => {
    if (!isAuthenticated) {
      setError("Please log in to delete cards.");
      return;
    }

    try {
      console.log(`Deleting card with ID: ${cardId}`); // Debugging
      await firestoreDeleteCard(cardId);
      setCards(cards.filter((card) => card.id !== cardId));
    } catch (err) {
      handleError(err, 'useCards - deleteCard');
      setError("Failed to delete card.");
    }
  };

  // Update a card
  const updateCard = async (cardId, updatedData) => {
    if (!isAuthenticated) {
      setError("Please log in to update cards.");
      return;
    }

    try {
      console.log('Updating card with ID:', cardId, 'Data:', updatedData); // Debugging
      if (!updatedData.nextReview || isNaN(new Date(updatedData.nextReview).getTime())) {
        throw new Error('Invalid nextReview date');
      }
      
      // Use the firestore update function which now includes user verification
      await firestoreUpdateCard(cardId, updatedData);
      console.log('Card updated successfully:', cardId); // Debugging
      
      // Update local state
      setCards(prevCards => {
        return prevCards.map(card =>
          card.id === cardId ? { ...card, ...updatedData } : card
        );
      });
    } catch (error) {
      console.error('Error updating card:', error); // Debugging
      handleError(error, 'useCards - updateCard');
      setError("Failed to update card.");
      throw error;
    }
  };

  return { cards, loading, error, addCard, deleteCard, updateCard };
}

export default useCards;