// A utility module for handling data storage in browser's 
// localStorage.

// localStorage utility functions

// localStorage can only store and remove whole values by key, not
// individual properties, so we need to manage the 
// data structure ourselves
const STORAGE_KEYS = {
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