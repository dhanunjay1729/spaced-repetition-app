import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

const Card = ({ card, onDelete }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => setIsFlipped(f => !f);

  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this card?')) {
      try {
        onDelete(card.id);
        toast('Card deleted', { icon: '🗑️' });
      } catch {
        toast.error('Failed to delete card!');
      }
    }
  };

  return (
    <div 
      className="w-full max-w-md mx-auto cursor-pointer bg-white rounded-xl shadow-lg hover:shadow-2xl transition p-8"
      onClick={handleFlip}
    >
      <div
        className={`rounded-lg min-h-[220px] flex items-center justify-center transition-all ${
          isFlipped ? 'bg-green-500' : 'bg-blue-500'
        }`}
      >
        <div className="text-center w-full">
          <p className="text-gray-100 text-sm mb-4">
            {isFlipped ? 'Answer' : 'Question'}
          </p>
          <p className="text-2xl font-semibold text-white break-words">
            {isFlipped ? card.answer : card.question}
          </p>
        </div>
      </div>
      <p className="text-center text-gray-500 text-sm mt-4">
        Click to {isFlipped ? 'see question' : 'reveal answer'}
      </p>
      <button 
        onClick={handleDelete} 
        className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
      >
        Delete Card
      </button>
    </div>
  );
};

export default Card;