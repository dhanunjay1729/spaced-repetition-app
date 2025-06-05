import React from 'react';
import { useParams, Link } from 'react-router-dom';

const StudySession = () => {
    const { deckId } = useParams();
    return (
        <div className="container mx-auto p-6">
            <div className="max-w-2xl mx-auto">
                <Link
                    to={`/deck/${deckId}`}
                    className="text-blue-600 hover:text-blue-700 mb-4 inline-block"
                >
                    ← Back to Deck
                </Link>
                <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                    <h1 className="text-3xl font-bold mb-4">Study Session</h1>
                    <p className="text-gray-600 mb-8">
                        Study session functionality coming tomorrow!
                    </p>
                    <p className="text-gray-500">
                        This is where you'll review cards using the spaced repetition algorithm.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default StudySession;