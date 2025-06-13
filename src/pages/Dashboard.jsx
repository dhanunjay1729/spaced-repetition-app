//the Dashboard component serves as the main landing page for the
// application, providing an overview of the user's decks and cards,
//along with quick access to manage decks and start studying.
import React, { useState, useEffect } from 'react';
// react-router-dom is used for navigation between different pages
//without reloading the page.
import { Link } from 'react-router-dom';
// react-hot-toast is used for displaying toast notifications
import { toast } from 'react-hot-toast';
// firebase is used to access the authentication module
import { auth } from '../firebase'; // Import Firebase auth to get the user's name
//the hooks folder contains custom react hooks-reusable functions that 
//let us share logic between components`
import useDecks from '../hooks/useDecks';
//the utils folder contains utility functions that are not tied to 
// react, but help with general tasks like data fetching or 
// local storage management
import { fetchCards } from '../utils/firestore'; // Import Firestore-based fetchCards
import { getDueCards } from '../utils/spacedRepetition';
import ErrorMessage from '../components/ErrorMessage';
import { handleError } from '../utils/errorHandler'; // Import centralized error handler
import LoadingSpinner from '../components/LoadingSpinner'; // Importing the LoadingSpinner component

const Dashboard = () => {
    // Fetch decks using the useDecks hook
    const { decks, error, deleteDeck } = useDecks();

    // State for all cards
    const [allCards, setAllCards] = useState([]);
    const [loadingCards, setLoadingCards] = useState(true);
    const [userName, setUserName] = useState(''); // State to store the user's name

    // Fetch the user's name from Firebase Auth
    useEffect(() => {
        const currentUser = auth.currentUser;
        if (currentUser && currentUser.displayName) {
            setUserName(currentUser.displayName);
        }
    }, []);

    // Fetch all cards from Firestore
    useEffect(() => {
        const fetchAllCards = async () => {
            try {
                const cards = await fetchCards(); // Fetch all cards
                console.log('Fetched cards:', cards); // Debugging
                setAllCards(cards);
            } catch (err) {
                handleError(err, 'Dashboard - fetchAllCards');
            } finally {
                setLoadingCards(false);
            }
        };
        fetchAllCards();
    }, []);

    // Calculate statistics
    const totalCards = allCards.length;
    const totalDecks = decks.length;

    // Cards due today
    const cardsDueToday = allCards.filter(card => {
        const nextReviewDate = new Date(card.nextReview).toISOString().split('T')[0]; // Extract date
        const todayDate = new Date().toISOString().split('T')[0]; // Extract today's date
        console.log(`Card ID: ${card.id}, Next Review: ${nextReviewDate}, Today: ${todayDate}`); // Debugging
        return nextReviewDate === todayDate; // Compare dates
    }).length;

    // Deck deletion handler
    const handleDeleteDeck = async (deckId, event) => {
        try {
            event?.stopPropagation(); // Ensure event is passed
            const confirmDelete = window.confirm('Are you sure you want to delete this deck?');
            if (!confirmDelete) return;

            await deleteDeck(deckId);
            toast.success('Deck deleted successfully!', { icon: '🗑️' });
        } catch (err) {
            handleError(err, 'Dashboard - handleDeleteDeck');
            toast.error('Failed to delete deck. Please try again.');
        }
    };

    if (error) {
        return <ErrorMessage message={error} />;
    }

    if (loadingCards) {
        return <LoadingSpinner />;
    }

    return (
        <div className="container mx-auto p-6 max-w-6xl">
            <h1 className="text-4xl font-extrabold mb-10 text-center text-gray-800">
                Welcome to Your Dashboard{userName ? `, ${userName}` : ''}
            </h1>
            {/* Statistics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
                <div className="bg-gradient-to-r from-blue-500 to-blue-700 p-8 rounded-xl shadow-lg text-white">
                    <h3 className="text-lg font-semibold mb-2">Total Decks</h3>
                    <p className="text-4xl font-bold">{totalDecks}</p>
                </div>
                <div className="bg-gradient-to-r from-green-500 to-green-700 p-8 rounded-xl shadow-lg text-white">
                    <h3 className="text-lg font-semibold mb-2">Total Cards</h3>
                    <p className="text-4xl font-bold">{totalCards}</p>
                </div>
                <div className="bg-gradient-to-r from-orange-500 to-orange-700 p-8 rounded-xl shadow-lg text-white">
                    <h3 className="text-lg font-semibold mb-2">Due Today</h3>
                    <p className="text-4xl font-bold">{cardsDueToday}</p>
                </div>
            </div>
            {/* Quick Actions */}
            <div className="bg-white p-8 rounded-xl shadow-lg mb-10">
                <h2 className="text-2xl font-semibold mb-6 text-gray-800">Quick Actions</h2>
                <div className="flex flex-wrap gap-4">
                    <Link
                        to="/decks"
                        className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg shadow hover:bg-blue-700 transition transform hover:scale-105"
                    >
                        Manage Decks
                    </Link>
                    {decks.length > 0 && (
                        <div className="flex flex-wrap gap-4">
                            {decks.map(deck => {
                                // Get all cards for this deck
                                const deckCards = allCards.filter(card => card.deckId === deck.id);
                                // Count due and new cards
                                const dueCards = getDueCards(deckCards);
                                const newCards = deckCards.filter(card => card.repetitions === 0);
                                const pendingCards = [...new Set([...dueCards, ...newCards].map(c => c.id))].length;
                                console.log(`Deck ID: ${deck.id}, Due Cards: ${dueCards.length}, New Cards: ${newCards.length}, Pending Count: ${pendingCards}`); // Debugging

                                return (
                                    <div
                                        key={deck.id}
                                        className="flex items-center gap-2 bg-gray-50 rounded-lg px-4 py-2 shadow hover:shadow-md transition transform hover:scale-105"
                                    >
                                        <Link
                                            to={`/study/${deck.id}`}
                                            className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                                        >
                                            <span>Study "{deck.name}"</span>
                                            <span className="bg-white text-green-600 px-2 py-1 rounded-full text-xs font-bold">
                                                {pendingCards} Pending
                                            </span>
                                        </Link>
                                        <button
                                            onClick={e => handleDeleteDeck(deck.id, e)}
                                            className="text-red-600 hover:underline ml-2"
                                            title="Delete deck"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
            {/* Recent Decks */}
            {decks.length > 0 && (
                <div className="bg-white p-8 rounded-xl shadow-lg">
                    <h2 className="text-2xl font-semibold mb-6 text-gray-800">Recent Decks</h2>
                    <div className="space-y-4">
                        {decks.slice(0, 5).map(deck => {
                            const deckCards = allCards.filter(card => card.deckId === deck.id);
                            const cardCount = deckCards.length;

                            return (
                                <Link
                                    key={deck.id}
                                    to={`/deck/${deck.id}`}
                                    className="block p-6 border border-gray-200 rounded-lg hover:bg-gray-100 transition transform hover:scale-105 shadow-sm"
                                >
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium text-lg text-gray-800">{deck.name}</span>
                                        <span className="text-sm text-gray-500">{cardCount} {cardCount === 1 ? 'card' : 'cards'}</span>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;