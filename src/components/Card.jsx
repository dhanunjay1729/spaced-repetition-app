import React, { useState } from 'react';

const Card = ({ question, answer }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div 
      className="w-full max-w-md mx-auto cursor-pointer"
      onClick={handleFlip}
    >
      <div
        className={`rounded-lg shadow-lg p-8 min-h-[300px] flex items-center justify-center transition-all hover:shadow-xl ${
          isFlipped ? 'bg-green-500' : 'bg-red-500'
        }`}
      >
        <div className="text-center">
          <p className="text-gray-100 text-sm mb-4">
            {isFlipped ? 'Answer' : 'Question'}
          </p>
          <p className="text-2xl font-semibold text-white">
            {isFlipped ? answer : question}
          </p>
        </div>
      </div>
      <p className="text-center text-gray-500 text-sm mt-4">
        Click to {isFlipped ? 'see question' : 'reveal answer'}
      </p>
    </div>
  );
};

export default Card;