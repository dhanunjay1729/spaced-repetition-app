// utils/firestore.js
import { collection, addDoc, getDocs, doc, deleteDoc, updateDoc, query, where } from "firebase/firestore";
import { db } from '../firebase.js';
import { handleError } from './errorHandler';

// Collection names (aligned with localStorage keys)
const DECKS_COLLECTION = "sra_decks";
const CARDS_COLLECTION = "sra_cards";

// Save a new deck
export const saveDeck = async (deckData) => {
  try {
    const docRef = await addDoc(collection(db, DECKS_COLLECTION), deckData);
    return { id: docRef.id, ...deckData };
  } catch (error) {
    handleError(error, 'saveDeck');
    throw error;
  }
};

// Load all decks
export const loadDecks = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, DECKS_COLLECTION));
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    handleError(error, 'loadDecks');
    throw error;
  }
};

// Delete a deck
export const deleteDeck = async (deckId) => {
  try {
    await deleteDoc(doc(db, DECKS_COLLECTION, deckId));
  } catch (error) {
    handleError(error, 'deleteDeck');
    throw error;
  }
};

// Save a new card with metadata support
export const saveCard = async (cardData) => {
  try {
    if (!cardData.nextReview || isNaN(new Date(cardData.nextReview).getTime())) {
      throw new Error('Invalid nextReview date');
    }
    
    // Ensure metadata is included if present
    const dataToSave = {
      ...cardData,
      metadata: cardData.metadata || {},
      createdAt: new Date().toISOString()
    };
    
    const docRef = await addDoc(collection(db, CARDS_COLLECTION), dataToSave);
    return { id: docRef.id, ...dataToSave };
  } catch (error) {
    handleError(error, 'firestore-saveCard');
    throw error;
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
    handleError(error, 'firestore-fetchCards');
    throw error;
  }
};

// Update an existing card with metadata support
export const updateCard = async (cardId, updatedData) => {
  try {
    if (!updatedData.nextReview || isNaN(new Date(updatedData.nextReview).getTime())) {
      throw new Error('Invalid nextReview date');
    }
    
    // Preserve existing metadata and merge with new metadata if provided
    const cardRef = doc(db, CARDS_COLLECTION, cardId);
    await updateDoc(cardRef, {
      ...updatedData,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    handleError(error, 'firestore-updateCard');
    throw error;
  }
};

// Delete a card
export const deleteCard = async (cardId) => {
  try {
    const cardRef = doc(db, CARDS_COLLECTION, cardId);
    await deleteDoc(cardRef);
  } catch (error) {
    handleError(error, 'firestore-deleteCard');
    throw error;
  }
};

// Get AI-generated cards count for analytics
export const getAIGeneratedCardsCount = async (deckId) => {
  try {
    const cardsQuery = deckId
      ? query(collection(db, CARDS_COLLECTION), where("deckId", "==", deckId))
      : collection(db, CARDS_COLLECTION);
    
    const querySnapshot = await getDocs(cardsQuery);
    const cards = querySnapshot.docs.map((doc) => doc.data());
    
    return cards.filter(card => card.metadata?.isAIGenerated).length;
  } catch (error) {
    handleError(error, 'getAIGeneratedCardsCount');
    return 0;
  }
};