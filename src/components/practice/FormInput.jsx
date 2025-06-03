// src/components/practice/FormInput.jsx
import React, { useState } from 'react';

const FormInput = () => {
  const [text, setText] = useState('');

  return (
    <div className="p-4 bg-white rounded shadow">
      <input 
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="border p-2 rounded w-full mb-2"
        placeholder="Type something..."
      />
      <p>You typed: {text}</p>
    </div>
  );
};