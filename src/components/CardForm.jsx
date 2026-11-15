import React, { useState, useRef } from 'react';
import { toast } from 'react-hot-toast';
import aiService from '../utils/aiService';
import { compressImage } from '../utils/imageUtils';

const MAX_QUESTION_LENGTH = 1000;

const CardForm = ({ onSubmit, onCancel, initialData }) => {
  const [formData, setFormData] = useState({
    question: initialData?.question || '',
    answer: initialData?.answer || '',
    questionImage: initialData?.questionImage || null,
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [showImageUrlInput, setShowImageUrlInput] = useState(false);
  const [imageUrlValue, setImageUrlValue] = useState('');
  const [aiGenerated, setAiGenerated] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const savingRef = useRef(false);
  const questionFileInputRef = useRef(null);

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

  const handleQuestionImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingImage(true);
    try {
      const compressedDataUrl = await compressImage(file);
      setFormData(prev => ({ ...prev, questionImage: compressedDataUrl }));
      toast.success('Image added to question!');
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to process image');
    } finally {
      setIsProcessingImage(false);
      if (questionFileInputRef.current) {
        questionFileInputRef.current.value = '';
      }
    }
  };

  const handleApplyImageUrl = (e) => {
    e.preventDefault();
    const url = imageUrlValue.trim();
    if (!url) return;
    setFormData(prev => ({ ...prev, questionImage: url }));
    setImageUrlValue('');
    setShowImageUrlInput(false);
    toast.success('Image URL added!');
  };

  const handleRemoveQuestionImage = () => {
    setFormData(prev => ({ ...prev, questionImage: null }));
    toast('Image removed');
  };

  const handleQuestionPaste = async (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          e.preventDefault();
          setIsProcessingImage(true);
          try {
            const compressed = await compressImage(file);
            setFormData(prev => ({ ...prev, questionImage: compressed }));
            toast.success('Image pasted into question!');
          } catch {
            toast.error('Failed to paste image');
          } finally {
            setIsProcessingImage(false);
          }
          break;
        }
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (savingRef.current || isGenerating || isExtracting || isProcessingImage) return;

    if (formData.question.trim().length === 0) {
      return toast.error('Question is required');
    }
    if (formData.question.length > MAX_QUESTION_LENGTH) {
      return toast.error(`Question too long. Maximum ${MAX_QUESTION_LENGTH} characters allowed.`);
    }

    savingRef.current = true;
    setIsSaving(true);
    try {
      const nextReview = initialData?.nextReview || new Date().toISOString();
      await onSubmit({
        ...formData,
        ...(initialData?.id ? { id: initialData.id } : {}),
        questionImage: formData.questionImage || null,
        nextReview,
        metadata: {
          ...initialData?.metadata,
          ...(aiGenerated ? { isAIGenerated: true, generatedAt: new Date().toISOString() } : {}),
        },
      });
      toast.success(initialData ? 'Card updated!' : 'Card created!');
    } catch {
      toast.error('Failed to save card!');
    } finally {
      savingRef.current = false;
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="glass-elevated rounded-2xl p-6" aria-busy={isSaving}>
      <fieldset disabled={isSaving} className="space-y-4">
      <div>
        <label className="block mb-1 font-medium text-gray-700 dark:text-gray-200 text-sm">Question</label>
        <div className="flex gap-2">
          <input
            type="text"
            name="question"
            value={formData.question}
            onChange={handleChange}
            onPaste={handleQuestionPaste}
            className="flex-1 input-field"
            placeholder="Enter a word or question (or paste an image with Ctrl+V)"
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

        {/* Question Image Attachment Controls */}
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <input
            type="file"
            ref={questionFileInputRef}
            accept="image/*"
            onChange={handleQuestionImageUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => questionFileInputRef.current?.click()}
            disabled={isProcessingImage}
            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/20 text-gray-700 dark:text-gray-200 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            📷 {isProcessingImage ? 'Processing...' : 'Attach Image'}
          </button>
          <button
            type="button"
            onClick={() => setShowImageUrlInput(!showImageUrlInput)}
            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/20 text-gray-700 dark:text-gray-200 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            🔗 {showImageUrlInput ? 'Hide URL input' : 'Image URL'}
          </button>
        </div>

        {/* Optional Image URL Input Field */}
        {showImageUrlInput && (
          <div className="mt-2 flex gap-2 animate-fade-in">
            <input
              type="url"
              value={imageUrlValue}
              onChange={(e) => setImageUrlValue(e.target.value)}
              placeholder="Paste image URL (https://...)"
              className="input-field text-xs py-1.5 flex-1"
            />
            <button
              type="button"
              onClick={handleApplyImageUrl}
              className="btn-primary text-xs py-1.5 px-3"
            >
              Add URL
            </button>
          </div>
        )}

        {/* Question Image Preview */}
        {formData.questionImage && (
          <div className="mt-3 relative inline-block group animate-fade-in">
            <p className="text-[11px] font-medium text-gray-400 dark:text-gray-500 mb-1">Question Image Attached:</p>
            <div className="relative inline-block border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden bg-black/5 dark:bg-white/5 p-1">
              <img
                src={formData.questionImage}
                alt="Question attachment preview"
                className="max-h-36 max-w-xs object-contain rounded-lg"
              />
              <button
                type="button"
                onClick={handleRemoveQuestionImage}
                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-lg transition-transform hover:scale-110"
                title="Remove image"
                aria-label="Remove question image"
              >
                ✕
              </button>
            </div>
          </div>
        )}
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
          disabled={isGenerating || isExtracting}
          className="btn-primary text-sm"
        >
          {isSaving ? 'Saving...' : initialData ? 'Update Card' : 'Add Card'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary text-sm"
        >
          Cancel
        </button>
      </div>
      </fieldset>
    </form>
  );
};

export default CardForm;
