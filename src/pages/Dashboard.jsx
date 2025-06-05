//the Dashboard component serves as the main landing page for the
// application, providing an overview of the user's decks and cards,
//along with quick access to manage decks and start studying.
import React from 'react';
// react-router-dom is used for navigation between different pages
//without reloading the page.
import { Link } from 'react-router-dom';
//the hooks folder contains custom react hooks-reusable functions that 
//let us share logic between components`
import useDecks from '../hooks/useDecks';
//the utils folder contains utility functions that are not tied to 
// react, but help with general tasks like data fetching or 
// local storage management
import { loadCards } from '../utils/localStorage';

const Dashboard = () => {
    //an array of decks is fetched from the custom hook useDecks
    const { decks } = useDecks();
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

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
            {/* Statistics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">Total Decks</h3>
                    <p className="text-3xl font-bold text-blue-600">{totalDecks}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">Total Cards</h3>
                    <p className="text-3xl font-bold text-green-600">{totalCards}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">Due Today</h3>
                    <p className="text-3xl font-bold text-orange-600">{cardsDueToday}</p>
                </div>
            </div>
            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
                <div className="flex flex-wrap gap-4">
                    <Link
                        to="/decks"
                        className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
                    >
                        Manage Decks
                    </Link>
                    {totalDecks > 0 && (
                        <Link
                            to={`/study/${decks[0].id}`}
                            className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700"
                        >
                            Start Studying
                        </Link>
                    )}
                </div>
            </div>
            {/* Recent Decks */}
            {decks.length > 0 && (
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Recent Decks</h2>
                    <div className="space-y-3">
                        {decks.slice(0, 5).map(deck => (
                            <Link
                                key={deck.id}
                                to={`/deck/${deck.id}`}
                                className="block p-3 border rounded hover:bg-gray-50 transition"
                            >
                                <div className="flex justify-between items-center">
                                    <span className="font-medium">{deck.name}</span>
                                    <span className="text-gray-500">{deck.cardCount || 0} cards</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;