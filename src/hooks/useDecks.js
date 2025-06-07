import { useState, useEffect } from "react";
import { saveDeck, loadDecks, deleteDeck } from "../utils/firestore";

// A custom React hook for managing decks
function useDecks() {
  const [decks, setDecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load decks on mount
  useEffect(() => {
    const fetchDecks = async () => {
      try {
        const loadedDecks = await loadDecks();
        setDecks(loadedDecks);
      } catch (err) {
        handleError(err, 'useDecks - loadDecks');
        setError("Failed to load decks.");
} finally {
        setLoading(false);
      }
    };
    fetchDecks();
  }, []);

  // Add a new deck
  const addDeck = async (deckData) => {
    try {
      const newDeck = await saveDeck(deckData);
      setDecks([...decks, newDeck]);
    } catch (err) {
      setError("Failed to add deck.");
    }
  };

  // Delete a deck
  const removeDeck = async (deckId) => {
    try {
      await deleteDeck(deckId);
      setDecks(decks.filter((deck) => deck.id !== deckId));
    } catch (err) {
      setError("Failed to delete deck.");
    }
  };

  return { decks, loading, error, addDeck, removeDeck };
}

export default useDecks;