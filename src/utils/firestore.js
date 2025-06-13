// utils/firestore.js
import { collection, addDoc, getDocs, doc, deleteDoc, updateDoc, query, where } from "firebase/firestore";
import { db, getCurrentUserId } from '../firebase.js';
import { handleError } from './errorHandler';

// Collection names (aligned with localStorage keys)
const DECKS_COLLECTION = "sra_decks";
const CARDS_COLLECTION = "sra_cards";

// Save a new deck
export const saveDeck = async (deckData) => {
  try {
    const userId = getCurrentUserId();
    const dataWithUser = {
      ...deckData,
      userId,
      createdAt: new Date().toISOString()
    };
    const docRef = await addDoc(collection(db, DECKS_COLLECTION), dataWithUser);
    return { id: docRef.id, ...dataWithUser };
  } catch (error) {
    handleError(error, 'saveDeck');
    throw error;
  }
};

// Load all decks for current user
export const loadDecks = async () => {
  try {
    const userId = getCurrentUserId();
    const q = query(collection(db, DECKS_COLLECTION), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    handleError(error, 'loadDecks');
    throw error;
  }
};

// Delete a deck
export const deleteDeck = async (deckId) => {
  try {
    const userId = getCurrentUserId();
    // First verify the deck belongs to the current user
    const deckDoc = await getDocs(query(collection(db, DECKS_COLLECTION), 
      where("userId", "==", userId), 
      where("__name__", "==", deckId)));
    
    if (deckDoc.empty) {
      throw new Error('Deck not found or access denied');
    }
    
    await deleteDoc(doc(db, DECKS_COLLECTION, deckId));
    
    // Also delete all cards in this deck
    const cardsQuery = query(collection(db, CARDS_COLLECTION), 
      where("deckId", "==", deckId),
      where("userId", "==", userId));
    const cardsSnapshot = await getDocs(cardsQuery);
    
    const deletePromises = cardsSnapshot.docs.map(cardDoc => 
      deleteDoc(doc(db, CARDS_COLLECTION, cardDoc.id))
    );
    await Promise.all(deletePromises);
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
    
    const userId = getCurrentUserId();
    
    // Ensure metadata is included if present
    const dataToSave = {
      ...cardData,
      userId,
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

// Load all cards for a specific deck (with user verification)
export const fetchCards = async (deckId) => {
  try {
    const userId = getCurrentUserId();
    
    const cardsQuery = deckId
      ? query(collection(db, CARDS_COLLECTION), 
          where("deckId", "==", deckId),
          where("userId", "==", userId))
      : query(collection(db, CARDS_COLLECTION), 
          where("userId", "==", userId));
    
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
    
    const userId = getCurrentUserId();
    
    // Verify the card belongs to the current user
    const cardQuery = query(collection(db, CARDS_COLLECTION), 
      where("userId", "==", userId),
      where("__name__", "==", cardId));
    const cardSnapshot = await getDocs(cardQuery);
    
    if (cardSnapshot.empty) {
      throw new Error('Card not found or access denied');
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
    const userId = getCurrentUserId();
    
    // Verify the card belongs to the current user
    const cardQuery = query(collection(db, CARDS_COLLECTION), 
      where("userId", "==", userId),
      where("__name__", "==", cardId));
    const cardSnapshot = await getDocs(cardQuery);
    
    if (cardSnapshot.empty) {
      throw new Error('Card not found or access denied');
    }
    
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
    const userId = getCurrentUserId();
    
    const cardsQuery = deckId
      ? query(collection(db, CARDS_COLLECTION), 
          where("deckId", "==", deckId),
          where("userId", "==", userId))
      : query(collection(db, CARDS_COLLECTION), 
          where("userId", "==", userId));
    
    const querySnapshot = await getDocs(cardsQuery);
    const cards = querySnapshot.docs.map((doc) => doc.data());
    
    return cards.filter(card => card.metadata?.isAIGenerated).length;
  } catch (error) {
    handleError(error, 'getAIGeneratedCardsCount');
    return 0;
  }
};