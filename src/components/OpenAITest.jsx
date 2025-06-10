import React, { useState, useRef } from 'react';
import AIService from '../utils/aiService';

const OpenAITest = () => {
  const [word, setWord] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!word.trim()) {
      setError('Please enter a word');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await AIService.generateWordDefinition(word.trim());
      setResult(response);
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setWord('');
    setResult(null);
    setError(null);
    inputRef.current.focus();
  };

  return (
    <div className="p-4 max-w-lg mx-auto">
      <form onSubmit={handleSubmit} className="mb-4 flex gap-2">
        <input
          type="text"
          value={word}
          onChange={(e) => setWord(e.target.value)}
          placeholder="Enter a word"
          className="border border-gray-400 rounded p-2 flex-1"
          ref={inputRef}
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !word.trim()}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Get Definition'}
        </button>
        {word && !loading && (
          <button
            type="button"
            onClick={handleClear}
            className="bg-gray-300 text-gray-700 px-2 rounded hover:bg-gray-400"
          >
            Clear
          </button>
        )}
      </form>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      {result && (
        <div className="border p-4 rounded bg-gray-50">
          <h2 className="text-xl font-bold mb-2 capitalize">{result.word}</h2>
          <p><strong>Definition:</strong> {result.definition}</p>
          <p><strong>Part of Speech:</strong> {result.partOfSpeech}</p>

          <div className="mt-2">
            <strong>Examples:</strong>
            <ul className="list-disc pl-5 space-y-1">
              {result.examples.map((example, i) => (
                <li key={i}>{example}</li>
              ))}
            </ul>
          </div>

          {result.synonyms && result.synonyms.length > 0 && (
            <p className="mt-2"><strong>Synonyms:</strong> {result.synonyms.join(', ')}</p>
          )}
          {result.etymology && (
            <p className="mt-2"><strong>Etymology:</strong> {result.etymology}</p>
          )}
          <p className="mt-2 text-xs text-gray-500">Generated at: {new Date(result.generatedAt).toLocaleString()}</p>
        </div>
      )}
    </div>
  );
};

export default OpenAITest;
