import { useState, useEffect } from 'react';
import { loadDecks, saveDecks } from '../utils/localStorage';
import { createDeck } from '../data/models';

// A custom React hook for managing decks
function useDecks() {
    const [decks, setDecks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Load decks on mount
    useEffect(() => {
        try {
            const loadedDecks = loadDecks();
            setDecks(loadedDecks);
        } catch (err) {
            setError("Failed to load decks.");
        } finally {
            setLoading(false);
        }
    }, []);

    // Save decks whenever they change
    useEffect(() => {
        if (!loading) {
            try {
                saveDecks(decks);
            } catch (err) {
                setError("Failed to save decks.");
            }
        }
    }, [decks, loading]);

    // Add a new deck
    const addDeck = (deckData) => {
        try {
            const newDeck = createDeck(deckData);
            const updatedDecks = [...decks, newDeck];
            setDecks(updatedDecks);
            saveDecks(updatedDecks);
            return newDeck;
        } catch (err) {
            setError("Failed to add deck.");
            throw err;
        }
    };

    // Update a deck
    const updateDeck = (deckId, updates) => {
        try {
            setDecks(
                decks.map(deck =>
                    deck.id === deckId ? { ...deck, ...updates } : deck
                )
            );
        } catch (err) {
            setError("Failed to update deck.");
        }
    };

    // Delete a deck
    const deleteDeck = (deckId) => {
        try {
            setDecks(decks.filter(deck => deck.id !== deckId));
        } catch (err) {
            setError("Failed to delete deck.");
        }
    };

    return {
        decks,
        loading,
        error,
        addDeck,
        updateDeck,
        deleteDeck
    };
}

export default useDecks;