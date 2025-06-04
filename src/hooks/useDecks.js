import { useState, useEffect } from 'react';
import { loadDecks, saveDecks } from '../utils/localStorage';
import { createDeck } from '../data/models';


// A custom React hook for managing decks
// What does it do?
// 1. Loads decks from localStorage on mount
// 2. Saves decks to localStorage whenever they change
// 3. Provides functions to add, update, and delete decks
function useDecks() {
    const [decks, setDecks] = useState([]);
    const [loading, setLoading] = useState(true);

    // Load decks on mount
    useEffect(() => {
        const loadedDecks = loadDecks();
        setDecks(loadedDecks);
        setLoading(false);
    }, []);

    // Save decks whenever they change
    useEffect(() => {
        if (!loading) {
            saveDecks(decks);
        }
    }, [decks, loading]);

    // Add a new deck
    const addDeck = (deckData) => {
        const newDeck = createDeck(deckData);
        setDecks([...decks, newDeck]);
        return newDeck;
    };

    // Update a deck
    const updateDeck = (deckId, updates) => {
        setDecks(
            decks.map(deck =>
                deck.id === deckId ? { ...deck, ...updates } : deck
            )
        );
    };

    // Delete a deck
    const deleteDeck = (deckId) => {
        setDecks(decks.filter(deck => deck.id !== deckId));
    };

    return {
        decks,
        loading,
        addDeck,
        updateDeck,
        deleteDeck
    };
}

export default useDecks;