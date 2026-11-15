// hooks/useDecks.js
import { useState, useEffect } from "react";
import { saveDeck, loadDecks, deleteDeck as firestoreDeleteDeck, updateDeck as firestoreUpdateDeck } from "../utils/firestore";
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
      throw new Error("Please log in to create decks.");
    }

    const newDeck = await saveDeck(deckData);
    setDecks(prevDecks => [...prevDecks, newDeck]);
    return newDeck;
  };

  // Update an existing deck
  const updateDeck = async (deckId, updatedData) => {
    if (!isAuthenticated) {
      throw new Error("Please log in to update decks.");
    }

    await firestoreUpdateDeck(deckId, updatedData);
    setDecks(prevDecks =>
      prevDecks.map(deck => deck.id === deckId ? { ...deck, ...updatedData } : deck)
    );
  };

  // Delete a deck
  const deleteDeck = async (deckId) => {
    if (!isAuthenticated) {
      throw new Error("Please log in to delete decks.");
    }

    await firestoreDeleteDeck(deckId);
    setDecks(prevDecks => prevDecks.filter(deck => deck.id !== deckId));
  };

  return { decks, loading, error, addDeck, updateDeck, deleteDeck };
}

export default useDecks;
