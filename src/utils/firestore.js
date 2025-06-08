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
    handleError(error, 'firestore-saveCard'); // Use centralized error handler
    throw error; // Re-throw the error for further handling if needed
  }
};

// Load all cards for a specific deck
export const fetchCards = async (deckId) => {
  try {
    const cardsQuery = deckId
      ? query(collection(db, CARDS_COLLECTION), where("deckId", "==", deckId))
      : collection(db, CARDS_COLLECTION);
    const querySnapshot = await getDocs(cardsQuery);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    handleError(error, 'firestore-fetchCards'); // Use centralized error handler
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
    handleError(error, 'firestore-updateCard'); // Use centralized error handler
    throw error;
  }
};

// Delete a card
export const deleteCard = async (cardId) => {
  try {
    const cardRef = doc(db, CARDS_COLLECTION, cardId);
    await deleteDoc(cardRef);
  } catch (error) {
    handleError(error, 'firestore-deleteCard'); // Use centralized error handler
    throw error;
  }
};

