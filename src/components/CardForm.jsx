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
    <form onSubmit={handleSubmit} className="glass-elevated rounded-2xl p-6 space-y-4">
      <div>
        <label className="block mb-1 font-medium text-gray-700 dark:text-gray-200 text-sm">Question</label>
        <div className="flex gap-2">
          <input
            type="text"
            name="question"
            value={formData.question}
            onChange={handleChange}
            className="flex-1 input-field"
            placeholder="Enter a word or question"
            required
            maxLength={MAX_QUESTION_LENGTH}
          />
          <button
            type="button"
            onClick={handleAIGenerate}
            disabled={isGenerating}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-brand-500 text-white rounded-xl font-medium hover:from-purple-600 hover:to-brand-600 disabled:opacity-50 transition-all active:scale-[0.97] text-sm whitespace-nowrap"
          >
            {isGenerating ? 'Generating...' : '✨ AI Generate'}
          </button>
        </div>
      </div>

      <div>
        <label className="block mb-1 font-medium text-gray-700 dark:text-gray-200 text-sm">Answer</label>
        <textarea
          name="answer"
          value={formData.answer}
          onChange={handleChange}
          className="input-field min-h-[200px] sm:min-h-[300px]"
          rows="8"
          required
        />
        <input
          type="file"
          accept="image/*"
          onChange={handleImageToText}
          className="mt-2 text-sm text-gray-500 dark:text-gray-400 file:mr-3 file:py-1.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-brand-50 file:dark:bg-brand-500/20 file:text-brand-600 file:dark:text-brand-300 file:cursor-pointer hover:file:bg-brand-100 dark:hover:file:bg-brand-500/30 file:transition-colors"
        />
        {isExtracting && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Extracting text...</p>}
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          className="btn-primary text-sm"
        >
          {initialData ? 'Update Card' : 'Add Card'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary text-sm"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default CardForm;
