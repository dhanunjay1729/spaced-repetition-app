import { useState, useEffect } from "react";
import { saveCard, fetchCards, deleteCard as firestoreDeleteCard } from "../utils/firestore"; // Updated import
import { handleError } from '../utils/errorHandler'; // Import centralized error handler

// A custom hook that manages cards for a specific deck (if deckId is provided) or all cards
function useCards(deckId = null) {
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Load cards on mount or when deckId changes
    useEffect(() => {
        const fetchCardsData = async () => {
            try {
                const loadedCards = await fetchCards(deckId); // Updated function name
                setCards(loadedCards);
            } catch (err) {
                handleError(err, 'useCards - fetchCardsData');
                setError("Failed to load cards.");
            } finally {
                setLoading(false);
            }
        };
        fetchCardsData();
    }, [deckId]);

    // Add a new card
    const addCard = async (cardData) => {
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
        try {
            console.log(`Deleting card with ID: ${cardId}`); // Debugging
            await firestoreDeleteCard(cardId);
            setCards(cards.filter((card) => card.id !== cardId));
        } catch (err) {
            handleError(err, 'useCards - deleteCard');
            setError("Failed to delete card.");
        }
    };

    return { cards, loading, error, addCard, deleteCard };
}

export default useCards;