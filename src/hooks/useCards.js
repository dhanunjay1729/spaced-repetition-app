import { useState, useEffect } from 'react';
import { loadCards, saveCards } from '../utils/localStorage';
import { createCard } from '../data/models';

//a custom hook that manages cards for a specific deck(if deckId is provided) 
// or all cards
// this hook manages the state of cards, including loading, adding, updating, 
// and deleting cards it also handles saving cards to localStorage and 
// updating the card count in the associated deck
function useCards(deckId = null) {
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(true);

    // Load cards on mount
    useEffect(() => {
        const allCards = loadCards();
        if (deckId) {
            setCards(allCards.filter(card => card.deckId === deckId));
        } else {
            setCards(allCards);
        }
        setLoading(false);
    }, [deckId]);

    // Save all cards whenever local cards change
    const saveAllCards = (updatedCards) => {
        const allCards = loadCards();
        if (deckId) {
            // Remove old cards for this deck and add updated ones
            const otherCards = allCards.filter(card => card.deckId !== deckId);
            saveCards([...otherCards, ...updatedCards]);
        } else {
            saveCards(updatedCards);
        }
    };

    // Add a new card
    const addCard = (cardData) => {
        const newCard = createCard(cardData);
        const updatedCards = [...cards, newCard];
        //updates the react state, react will re-render the component
        // and the new card will be displayed
        setCards(updatedCards);
        // Save all cards to localStorage
        saveAllCards(updatedCards);
        // Update deck card count
        updateDeckCardCount(cardData.deckId, 1);
        // Return the new card for immediate use if needed 
        return newCard;
    };

    // Update a card
    const updateCard = (cardId, updates) => {
        const updatedCards = cards.map(card =>
            card.id === cardId ? { ...card, ...updates } : card
        );
        setCards(updatedCards);
        saveAllCards(updatedCards);
    };

    // Delete a card
    const deleteCard = (cardId) => {
        const cardToDelete = cards.find(c => c.id === cardId);
        const updatedCards = cards.filter(card => card.id !== cardId);
        setCards(updatedCards);
        saveAllCards(updatedCards);
        // Update deck card count
        if (cardToDelete) {
            updateDeckCardCount(cardToDelete.deckId, -1);
        }
    };

    // Helper function to update deck card count
    const updateDeckCardCount = (deckId, change) => {
        const decks = JSON.parse(localStorage.getItem('sra_decks') || '[]');
        const deckIndex = decks.findIndex(d => d.id === deckId);
        if (deckIndex !== -1) {
            decks[deckIndex].cardCount = (decks[deckIndex].cardCount || 0) + change;
            localStorage.setItem('sra_decks', JSON.stringify(decks));
        }
    };

    // we reuturn multiple things from this hook so that any 
    // component that uses this hook can access them
    // this is a common pattern in custom hooks
    // we return the cards, loading state, and functions to add, update, and delete cards
    // this allows components to use this hook to manage cards without needing to know the implementation details
    return {
        cards,
        loading,
        addCard,
        updateCard,
        deleteCard
    };
}

export default useCards;