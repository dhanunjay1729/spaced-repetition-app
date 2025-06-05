//the Dashboard component serves as the main landing page for the
// application, providing an overview of the user's decks and cards,
//along with quick access to manage decks and start studying.
import React from 'react';
// react-router-dom is used for navigation between different pages
//without reloading the page.
import { Link } from 'react-router-dom';
// react-hot-toast is used for displaying toast notifications
import { toast } from 'react-hot-toast';
//the hooks folder contains custom react hooks-reusable functions that 
//let us share logic between components`
import useDecks from '../hooks/useDecks';
//the utils folder contains utility functions that are not tied to 
// react, but help with general tasks like data fetching or 
// local storage management
import { loadCards } from '../utils/localStorage';
import { getDueCards } from '../utils/spacedRepetition';
import ErrorMessage from '../components/ErrorMessage';

const Dashboard = () => {
    //an array of decks is fetched from the custom hook useDecks
    const { decks, error, deleteDeck } = useDecks();
    //an array of all cards is fetched from the utility function loadCards
    const allCards = loadCards();

    // Calculate statistics
    const totalCards = allCards.length;
    const totalDecks = decks.length;

    // Cards due today (simplified for now)
    const cardsDueToday = allCards.filter(card => {
        //new Date() creates a new instance of date object with the 
        // current date and time
        const nextReview = new Date(card.nextReview);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return nextReview <= today;
    }).length;

    // Deck deletion handler
    const handleDeleteDeck = (deckId, event) => {
        event.stopPropagation();
        if (window.confirm('Are you sure you want to delete this deck?')) {
            try {
                deleteDeck(deckId);
                toast('Deck deleted', { icon: '🗑️' });
            } catch {
                toast.error('Failed to delete deck!');
            }
        }
    };

    if (error) {
        return <ErrorMessage message={error} />;
    }

    return (
        <div className="container mx-auto p-6 max-w-6xl">
            <h1 className="text-3xl font-bold mb-10">Dashboard</h1>
            {/* Statistics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
                <div className="bg-white p-8 rounded-xl shadow-lg">
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">Total Decks</h3>
                    <p className="text-3xl font-bold text-blue-600">{totalDecks}</p>
                </div>
                <div className="bg-white p-8 rounded-xl shadow-lg">
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">Total Cards</h3>
                    <p className="text-3xl font-bold text-green-600">{totalCards}</p>
                </div>
                <div className="bg-white p-8 rounded-xl shadow-lg">
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">Due Today</h3>
                    <p className="text-3xl font-bold text-orange-600">{cardsDueToday}</p>
                </div>
            </div>
            {/* Quick Actions */}
            <div className="bg-white p-8 rounded-xl shadow-lg mb-10">
                <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
                <div className="flex flex-wrap gap-4">
                    <Link
                        to="/decks"
                        className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg shadow hover:bg-blue-700 transition"
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
                                const pendingCount = [...new Set([...dueCards, ...newCards].map(c => c.id))].length;

                                return (
                                    <div key={deck.id} className="flex items-center gap-2 bg-gray-50 rounded-lg px-4 py-2 shadow hover:shadow-md transition">
                                        <Link
                                            to={`/study/${deck.id}`}
                                            className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                                        >
                                            <span>Study "{deck.name}"</span>
                                            <span className="bg-white text-green-600 px-2 py-1 rounded-full text-xs font-bold">
                                                {pendingCount} Pending
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
                    <h2 className="text-xl font-semibold mb-4">Recent Decks</h2>
                    <div className="space-y-3">
                        {decks.slice(0, 5).map(deck => {
                            // Dynamically calculate the number of cards for this deck
                            const deckCards = allCards.filter(card => card.deckId === deck.id);
                            const cardCount = deckCards.length;

                            return (
                                <Link
                                    key={deck.id}
                                    to={`/deck/${deck.id}`}
                                    className="block p-4 border rounded-lg hover:bg-gray-50 transition"
                                >
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium">{deck.name}</span>
                                        <span className="text-gray-500">{cardCount} {cardCount === 1 ? 'card' : 'cards'}</span>
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