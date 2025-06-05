import React from 'react';
import { Link } from 'react-router-dom';

const DeckPreview = ({ deck }) => {
    if (!deck) {
        return (
            <div className="p-4 bg-red-100 text-red-700 rounded">
                Deck not found.
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition">
            <h2 className="text-xl font-bold mb-2">{deck.name}</h2>
            {deck.description && (
                <p className="text-gray-600 mb-2">{deck.description}</p>
            )}
            <p className="text-gray-500 text-sm mb-4">
                {deck.cardCount || 0} {deck.cardCount === 1 ? 'card' : 'cards'}
            </p>
            <Link
                to={`/deck/${deck.id}`}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
                View Deck
            </Link>
        </div>
    );
};

export default DeckPreview;