import React from 'react';

const DeckPreview = ({ name, cardCount, dueCount }) => {
  return (
    <div className="relative bg-gray-900 rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all cursor-pointer transform hover:-translate-y-2 hover:scale-105">
      {/* Glow Effect */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 opacity-20 blur-lg"></div>

      {/* Content */}
      <div className="relative z-10">
        <h3 className="text-3xl font-bold text-white mb-4">{name}</h3>
        <div className="flex justify-between items-center text-gray-300">
          <span className="text-lg">{cardCount} cards</span>
          <span className="text-pink-400 font-semibold text-lg">{dueCount} due</span>
        </div>
      </div>
    </div>
  );
};

export default DeckPreview;