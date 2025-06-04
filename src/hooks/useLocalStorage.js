/**Normally, when you use useState, your data is lost if you refresh the
 *  *  page. With this hook, your data is saved in localStorage, so 
 * it persists even after a refresh or browser restart. */

import { useState, useEffect } from 'react';

//custom react hook for localStorage
// This hook allows you to use localStorage in a React component
// It provides a way to get and set values in localStorage, with automatic updates
// A custom hook is a reusable function that uses React hooks(useState, useEffect) internally

//when you use this hook in a componenet, it:
// 1. Initializes the state with a value from localStorage(initial value) or a default value
// 2. Updates localStorage whenever the state changes
// 3. Returns the current state and a function to update it.
function useLocalStorage(key, initialValue) {
    // Get initial value from localStorage or use the provided initial value
    const [storedValue, setStoredValue] = useState(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error(`Error loading localStorage key "${key}":`, error);
            return initialValue;
        }
    });

    // Update localStorage when the state changes
    useEffect(() => {
        try {
            //local storage only accepts strings, so we need to stringify the value
            window.localStorage.setItem(key, JSON.stringify(storedValue));
        } catch (error) {
            console.error(`Error saving localStorage key "${key}":`, error);
        }
    }, [key, storedValue]);

    return [storedValue, setStoredValue];
}

export default useLocalStorage;