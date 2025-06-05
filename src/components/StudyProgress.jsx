import React from 'react';
import { getCardsByStatus, formatInterval } from '../utils/spacedRepetition';

const StudyProgress = ({ cards }) => {
  const cardsByStatus = getCardsByStatus(cards);
  const totalCards = cards.length;

  // Calculate percentages
  const percentages = {
    new: totalCards > 0 ? (cardsByStatus.new.length / totalCards) * 100 : 0,
    learning: totalCards > 0 ? (cardsByStatus.learning.length / totalCards) * 100 : 0,
    learned: totalCards > 0 ? (cardsByStatus.learned.length / totalCards) * 100 : 0,
    due: totalCards > 0 ? (cardsByStatus.due.length / totalCards) * 100 : 0
  };

  // Calculate next review date
  const getNextReviewDate = () => {
    const futureCards = cards.filter(card => {
      const reviewDate = new Date(card.nextReview);
      return reviewDate > new Date() && card.repetitions > 0;
    });

    if (futureCards.length === 0) return null;

    const nextCard = futureCards.reduce((earliest, card) => {
      const cardDate = new Date(card.nextReview);
      const earliestDate = new Date(earliest.nextReview);
      return cardDate < earliestDate ? card : earliest;
    });

    return nextCard;
  };

  const nextReviewCard = getNextReviewDate();

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4">Study Progress</h3>
      
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Progress</span>
          <span>{Math.round(percentages.learned)}% Mastered</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 flex overflow-hidden">
          <div 
            className="bg-green-500 h-full transition-all duration-300"
            style={{ width: `${percentages.learned}%` }}
            title="Learned"
          />
          <div 
            className="bg-blue-500 h-full transition-all duration-300"
            style={{ width: `${percentages.learning}%` }}
            title="Learning"
          />
          <div 
            className="bg-orange-500 h-full transition-all duration-300"
            style={{ width: `${percentages.due}%` }}
            title="Due"
          />
          <div 
            className="bg-gray-400 h-full transition-all duration-300"
            style={{ width: `${percentages.new}%` }}
            title="New"
          />
        </div>
      </div>
      
      {/* Status breakdown */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-gray-400 rounded-full mr-2" />
          <span className="text-sm text-gray-600">New: {cardsByStatus.new.length}</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-orange-500 rounded-full mr-2" />
          <span className="text-sm text-gray-600">Due: {cardsByStatus.due.length}</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-blue-500 rounded-full mr-2" />
          <span className="text-sm text-gray-600">Learning: {cardsByStatus.learning.length}</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-500 rounded-full mr-2" />
          <span className="text-sm text-gray-600">Learned: {cardsByStatus.learned.length}</span>
        </div>
      </div>
      
      {/* Next review info */}
      {nextReviewCard && (
        <div className="border-t pt-4">
          <p className="text-sm text-gray-600">
            Next review in{' '}
            <span className="font-medium text-gray-800">
              {formatInterval(nextReviewCard.interval)}
            </span>
          </p>
        </div>
      )}
    </div>
  );
};

export default StudyProgress;