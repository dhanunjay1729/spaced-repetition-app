import React from 'react';
import { getCardsByStatus } from '../utils/spacedRepetition';

const StudyProgress = ({ cards }) => {
  const cardsByStatus = getCardsByStatus(cards);
  const totalCards = cards.length;

  // Calculate progress based on learned cards
  const learnedCards = cardsByStatus.learned.length;
  const progress = totalCards > 0 ? (learnedCards / totalCards) * 100 : 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4">Study Progress</h3>
      
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Progress</span>
          <span>{Math.round(progress)}% Mastered</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-green-500 h-full transition-all duration-300"
            style={{ width: `${progress}%` }}
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
          <span className="text-sm text-gray-600">Learned: {learnedCards}</span>
        </div>
      </div>
    </div>
  );
};

export default StudyProgress;