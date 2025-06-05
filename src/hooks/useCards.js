import { useState, useEffect } from 'react';
import { loadCards, saveCards } from '../utils/localStorage';
import { createCard } from '../data/models';

// A custom hook that manages cards for a specific deck (if deckId is provided) or all cards
function useCards(deckId = null) {
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Load cards on mount or when deckId changes
    useEffect(() => {
        try {
            const allCards = loadCards();
            if (deckId) {
                setCards(allCards.filter(card => card.deckId === deckId));
            } else {
                setCards(allCards);
            }
        } catch (err) {
            setError("Failed to load cards.");
        } finally {
            setLoading(false);
        }
    }, [deckId]);

    // Save all cards whenever local cards change
    const saveAllCards = (updatedCards) => {
        try {
            const allCards = loadCards();
            if (deckId) {
                // Remove old cards for this deck and add updated ones
                const otherCards = allCards.filter(card => card.deckId !== deckId);
                saveCards([...otherCards, ...updatedCards]);
            } else {
                saveCards(updatedCards);
            }
        } catch (err) {
            setError("Failed to save cards.");
            throw err;
        }
    };

    // Add a new card
    const addCard = (cardData) => {
        try {
            const newCard = createCard(cardData);
            const updatedCards = [...cards, newCard];
            setCards(updatedCards);
            saveAllCards(updatedCards);
            return newCard;
        } catch (err) {
            setError("Failed to add card.");
            throw err;
        }
    };

    // Update a card
    const updateCard = (cardId, updates) => {
        try {
            const updatedCards = cards.map(card =>
                card.id === cardId ? { ...card, ...updates } : card
            );
            setCards(updatedCards);
            saveAllCards(updatedCards);
        } catch (err) {
            setError("Failed to update card.");
            throw err;
        }
    };

    // Delete a card
    const deleteCard = (cardId) => {
        try {
            const updatedCards = cards.filter(card => card.id !== cardId);
            setCards(updatedCards);
            saveAllCards(updatedCards);
        } catch (err) {
            setError("Failed to delete card.");
            throw err;
        }
    };

    return {
        cards,
        loading,
        error,
        addCard,
        updateCard,
        deleteCard
    };
}

export default useCards;