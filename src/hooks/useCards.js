import { useState, useEffect } from "react";
import { saveCard, fetchCards, deleteCard as firestoreDeleteCard, updateCard as firestoreUpdateCard } from "../utils/firestore";
import { handleError } from '../utils/errorHandler';
import { doc, updateDoc } from "firebase/firestore"; // Import doc and updateDoc
import { db } from "../firebase"; // Import Firestore instance

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
            setCards([...cards, newCard]); // Add the card with Firestore document ID
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

    // Update a card
    const updateCard = async (cardId, updatedData) => {
        try {
            console.log('Updating card with ID:', cardId, 'Data:', updatedData); // Debugging
            if (!updatedData.nextReview || isNaN(new Date(updatedData.nextReview).getTime())) {
                throw new Error('Invalid nextReview date');
            }
            const cardRef = doc(db, "sra_cards", cardId); // Create document reference
            await updateDoc(cardRef, updatedData); // Update document
            console.log('Card updated successfully:', cardId); // Debugging

            // Update local state
            setCards(prevCards => {
                return prevCards.map(card =>
                    card.id === cardId ? { ...card, ...updatedData } : card
                );
            });
        } catch (error) {
            console.error('Error updating card:', error); // Debugging
            throw error;
        }
    };

    return { cards, loading, error, addCard, deleteCard, updateCard };
}

export default useCards;