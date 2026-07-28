import React from 'react';
import { getCardsByStatus } from '../utils/spacedRepetition';

const StudyProgress = ({ cards }) => {
  const cardsByStatus = getCardsByStatus(cards);
  const totalCards = cards.length;

  // Calculate progress based on learned cards
  const learnedCards = cardsByStatus.learned.length;
  const progress = totalCards > 0 ? (learnedCards / totalCards) * 100 : 0;

  return (
    <div className="glass-elevated rounded-2xl p-6">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Study Progress</h3>
      
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-2">
          <span>Progress</span>
          <span>{Math.round(progress)}% Mastered</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-white/10 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      
      {/* Status breakdown */}
      <div className="grid grid-cols-2 gap-4 mb-2">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-gray-400 dark:bg-gray-500 rounded-full mr-2" />
          <span className="text-sm text-gray-600 dark:text-gray-300">New: {cardsByStatus.new.length}</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-orange-500 rounded-full mr-2" />
          <span className="text-sm text-gray-600 dark:text-gray-300">Due: {cardsByStatus.due.length}</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-brand-500 rounded-full mr-2" />
          <span className="text-sm text-gray-600 dark:text-gray-300">Learning: {cardsByStatus.learning.length}</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-emerald-500 rounded-full mr-2" />
          <span className="text-sm text-gray-600 dark:text-gray-300">Learned: {learnedCards}</span>
        </div>
      </div>
    </div>
  );
};

export default StudyProgress;