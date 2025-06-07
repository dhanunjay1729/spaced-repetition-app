
import { toast } from 'react-hot-toast';

/**
 * Centralized error handler
 * @param {Error} error - The error object
 * @param {string} context - Context of the error (e.g., "DeckManager", "Dashboard")
 */
export const handleError = (error, context) => {
    console.error(`Error in ${context}:`, error); // Log error with context
    toast.error(`An error occurred in ${context}. Please try again.`); // Show user-friendly error message
};

