import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import aiService from '../utils/aiService';

const MAX_QUESTION_LENGTH = 1000;

const CardForm = ({ onSubmit, onCancel, initialData }) => {
  const [formData, setFormData] = useState(initialData || { question: '', answer: '' });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [aiGenerated, setAiGenerated] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (aiGenerated) setAiGenerated(false);
  };

  const handleAIGenerate = async () => {
    const input = formData.question.trim();

    if (!input) return toast.error('Please enter a word or question first');
    if (input.length > MAX_QUESTION_LENGTH) return toast.error(`Input too long. Maximum ${MAX_QUESTION_LENGTH} characters allowed.`);

    setIsGenerating(true);
    try {
      const result = await aiService.processUserQuery(input);

      let formattedAnswer = '';
      if (typeof result.output === 'object') {
        formattedAnswer = `
Definition: ${result.output.definition || ''}

Part of Speech: ${result.output.partOfSpeech || ''}

Examples:
${(result.output.examples || []).map((ex, i) => `${i + 1}. ${ex}`).join('\n')}

${result.output.synonyms?.length ? `Synonyms: ${result.output.synonyms.join(', ')}` : ''}

${result.output.etymology ? `Etymology: ${result.output.etymology}` : ''}
        `.trim();
      } else {
        formattedAnswer = result.output;
      }

      setFormData({
        ...formData,
        answer: formattedAnswer,
      });

      setAiGenerated(true);
      toast.success('AI response generated!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate AI content');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImageToText = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsExtracting(true);
    try {
      const text = await aiService.extractTextFromImage(file);
      setFormData({ ...formData, answer: text });
      toast.success('Text extracted from image!');
    } catch (err) {
      console.error(err);
      toast.error('Image text extraction failed');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.question.trim().length === 0) {
      return toast.error('Question is required');
    }
    if (formData.question.length > MAX_QUESTION_LENGTH) {
      return toast.error(`Question too long. Maximum ${MAX_QUESTION_LENGTH} characters allowed.`);
    }

    const nextReview = initialData?.nextReview || new Date().toISOString();
    onSubmit({
      ...formData,
      nextReview,
      metadata: aiGenerated ? { isAIGenerated: true, generatedAt: new Date().toISOString() } : {},
      id: initialData?.id,
    });
    toast.success(initialData ? 'Card updated!' : 'Card created!');
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
            maxLength={MAX_QUESTION_LENGTH}
          />
          <button
            type="button"
            onClick={handleAIGenerate}
            disabled={isGenerating}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-purple-400 flex items-center gap-2"
          >
            {isGenerating ? 'Generating...' : 'AI Generate'}
          </button>
        </div>
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
        <input
          type="file"
          accept="image/*"
          onChange={handleImageToText}
          className="mt-2 text-sm text-gray-500"
        />
        {isExtracting && <p className="text-sm text-gray-500 mt-1">Extracting text...</p>}
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
