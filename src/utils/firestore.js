import { collection, addDoc, getDocs, doc, deleteDoc, updateDoc, query, where } from "firebase/firestore";
import { db } from '../firebase.js'; // Correct relative path
import { handleError } from './errorHandler'; // Import centralized error handler

// Collection names (aligned with localStorage keys)
const DECKS_COLLECTION = "sra_decks";
const CARDS_COLLECTION = "sra_cards";

// Save a new deck
export const saveDeck = async (deckData) => {
  try {
    const docRef = await addDoc(collection(db, DECKS_COLLECTION), deckData);
    return { id: docRef.id, ...deckData };
  } catch (error) {
    handleError(error, 'saveDeck'); // Use centralized error handler
    throw error;
  }
};

// Load all decks
export const loadDecks = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, DECKS_COLLECTION));
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    handleError(error, 'loadDecks'); // Use centralized error handler
    throw error;
  }
};

// Delete a deck
export const deleteDeck = async (deckId) => {
  try {
    await deleteDoc(doc(db, DECKS_COLLECTION, deckId));
  } catch (error) {
    handleError(error, 'deleteDeck'); // Use centralized error handler
    throw error;
  }
};

// Save a new card
export const saveCard = async (cardData) => {
  try {
    if (!cardData.nextReview || isNaN(new Date(cardData.nextReview).getTime())) {
      throw new Error('Invalid nextReview date');
    }
    const docRef = await addDoc(collection(db, CARDS_COLLECTION), cardData);
    return { id: docRef.id, ...cardData };
  } catch (error) {
    console.error('Error saving card:', error);
    throw error;
  }
};

// Load all cards for a specific deck
export const fetchCards = async (deckId) => {
  try {
    console.log('Loading cards for deckId:', deckId); // Debugging
    const cardsQuery = deckId
      ? query(collection(db, CARDS_COLLECTION), where("deckId", "==", deckId))
      : collection(db, CARDS_COLLECTION); // Load all cards if deckId is not provided
    const querySnapshot = await getDocs(cardsQuery);
    const cards = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    console.log('Loaded cards:', cards); // Debugging
    return cards;
  } catch (error) {
    handleError(error, 'firestore-fetchCards'); // Use centralized error handler
    throw error;
  }
};

// Delete a card
export const deleteCard = async (cardId) => {
  try {
    console.log(`Attempting to delete card with ID: ${cardId}`); // Debugging
    const cardRef = doc(db, CARDS_COLLECTION, cardId);
    console.log(`Card reference:`, cardRef); // Debugging
    await deleteDoc(cardRef);
    console.log(`Card with ID: ${cardId} deleted successfully.`); // Debugging
  } catch (error) {
    console.error("Error deleting card:", error); // Debugging
    throw error;
  }
};

// Update an existing card
export const updateCard = async (cardId, updatedData) => {
  try {
    if (!updatedData.nextReview || isNaN(new Date(updatedData.nextReview).getTime())) {
      throw new Error('Invalid nextReview date');
    }
    const cardRef = doc(db, CARDS_COLLECTION, cardId);
    await updateDoc(cardRef, updatedData);
  } catch (error) {
    console.error('Error updating card:', error);
    throw error;
  }
};

