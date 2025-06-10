import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import aiService from '../utils/aiService';

const CardForm = ({ onSubmit, onCancel, initialData }) => {
  const [formData, setFormData] = useState(
    initialData || { question: '', answer: '' }
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiGenerated, setAiGenerated] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Reset AI generated flag if user manually edits
    if (aiGenerated) {
      setAiGenerated(false);
    }
  };

  const handleAIGenerate = async () => {
    const word = formData.question.trim();
    
    if (!word) {
      toast.error('Please enter a word first');
      return;
    }

    // Check if it's a single word or short phrase
    if (word.split(' ').length > 3) {
      toast.error('AI generation works best with single words or short phrases');
      return;
    }

    setIsGenerating(true);
    try {
      const aiData = await aiService.generateWordDefinition(word);
      
      // Format the answer with AI-generated content
      const formattedAnswer = `
Definition: ${aiData.definition}

Part of Speech: ${aiData.partOfSpeech}

Examples:
${aiData.examples.map((ex, i) => `${i + 1}. ${ex}`).join('\n')}

${aiData.synonyms && aiData.synonyms.length > 0 ? `Synonyms: ${aiData.synonyms.join(', ')}` : ''}

${aiData.etymology ? `Etymology: ${aiData.etymology}` : ''}
      `.trim();

      setFormData({
        ...formData,
        question: `${word} (${aiData.partOfSpeech})`,
        answer: formattedAnswer
      });
      
      setAiGenerated(true);
      toast.success('AI content generated successfully!');
    } catch (error) {
      toast.error('Failed to generate AI content');
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      const nextReview = initialData?.nextReview || new Date().toISOString();
      const cardData = {
        ...formData,
        nextReview,
        metadata: aiGenerated ? { isAIGenerated: true, generatedAt: new Date().toISOString() } : {}
      };

      if (initialData) {
        onSubmit({ ...cardData, id: initialData.id });
        toast.success('Card updated!');
      } else {
        onSubmit(cardData);
        toast.success('Card created!');
      }
    } catch (err) {
      toast.error('Failed to save card!');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block mb-1 font-medium">Question</label>
        <div className="flex gap-2">
          <input
            type="text"
            name="question"
            value={formData.question}
            onChange={handleChange}
            className="flex-1 border rounded px-3 py-2"
            placeholder="Enter a word or question"
            required
          />
          <button
            type="button"
            onClick={handleAIGenerate}
            disabled={isGenerating}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-purple-400 flex items-center gap-2"
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Generating...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                AI Generate
              </>
            )}
          </button>
        </div>
        {aiGenerated && (
          <p className="text-sm text-purple-600 mt-1">✨ AI-generated content</p>
        )}
      </div>
      
      <div>
        <label className="block mb-1 font-medium">Answer</label>
        <textarea
          name="answer"
          value={formData.answer}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2"
          rows="8"
          required
        />
      </div>
      
      <div className="flex gap-4">
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {initialData ? 'Update Card' : 'Add Card'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default CardForm;