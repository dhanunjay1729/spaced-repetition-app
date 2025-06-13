// hooks/useDecks.js
import { useState, useEffect } from "react";
import { saveDeck, loadDecks, deleteDeck as firestoreDeleteDeck } from "../utils/firestore";
import { handleError } from '../utils/errorHandler';
import { useAuth } from '../contexts/AuthContext';

// A custom React hook for managing decks
function useDecks() {
  const [decks, setDecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated, userId } = useAuth();

  // Load decks on mount and when user changes
  useEffect(() => {
    const fetchDecks = async () => {
      // Only fetch if user is authenticated
      if (!isAuthenticated || !userId) {
        setDecks([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const loadedDecks = await loadDecks();
        setDecks(loadedDecks);
      } catch (err) {
        handleError(err, 'useDecks - loadDecks');
        if (err.message === 'No authenticated user found') {
          setError("Please log in to view your decks.");
        } else {
          setError("Failed to load decks.");
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchDecks();
  }, [isAuthenticated, userId]); // Re-fetch when user changes

  // Add a new deck
  const addDeck = async (deckData) => {
    if (!isAuthenticated) {
      setError("Please log in to create decks.");
      return;
    }

    try {
      const newDeck = await saveDeck(deckData);
      setDecks([...decks, newDeck]);
    } catch (error) {
      handleError(error, 'useDecks-addDeck');
      setError("Failed to add deck.");
    }
  };

  // Delete a deck
  const deleteDeck = async (deckId) => {
    if (!isAuthenticated) {
      setError("Please log in to delete decks.");
      return;
    }

    try {
      await firestoreDeleteDeck(deckId);
      setDecks(decks.filter((deck) => deck.id !== deckId));
    } catch (error) {
      handleError(error, 'useDecks-removeDeck');
      setError("Failed to delete deck.");
    }
  };

  return { decks, loading, error, addDeck, deleteDeck };
}

export default useDecks;