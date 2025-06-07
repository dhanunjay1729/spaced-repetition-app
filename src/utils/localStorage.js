// A utility module for handling data storage in browser's 
// localStorage.

// localStorage utility functions

// localStorage can only store and remove whole values by key, not
// individual properties, so we need to manage the 
// data structure ourselves
const STORAGE_KEYS = {
    DECKS: 'sra_decks',
    CARDS: 'sra_cards',
    SESSIONS: 'sra_sessions',
    SETTINGS: 'sra_settings'
};

// Generic localStorage functions
export const saveToStorage = (key, data) => {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error('Error saving to localStorage:', error);
        return false;
    }
};

export const loadFromStorage = (key, defaultValue = null) => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error('Error loading from localStorage:', error);
        return defaultValue;
    }
};

export const removeFromStorage = (key) => {
    try {
        localStorage.removeItem(key);
        return true;
    } catch (error) {
        console.error('Error removing from localStorage:', error);
        return false;
    }
};

// Deck-specific functions
export const saveDecks = (decks) => {
    return saveToStorage(STORAGE_KEYS.DECKS, decks);
};

export const loadDecks = () => {
    return loadFromStorage(STORAGE_KEYS.DECKS, []);
};

// Card-specific functions
export const saveCards = (cards) => {
    return saveToStorage(STORAGE_KEYS.CARDS, cards);
};

export const fetchCards = () => {
    return loadFromStorage(STORAGE_KEYS.CARDS, []);
};

// Get cards for a specific deck
export const getCardsByDeckId = (deckId) => {
    const allCards = fetchCards();
    return allCards.filter(card => card.deckId === deckId);
};

// Update a single card
export const updateCard = (cardId, updates) => {
    const cards = fetchCards();
    const index = cards.findIndex(card => card.id === cardId);
    if (index !== -1) {
        cards[index] = { ...cards[index], ...updates };
        saveCards(cards);
        return cards[index];
    }
    return null;
};