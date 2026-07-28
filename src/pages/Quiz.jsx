import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import AIService from '../utils/aiService';
import { saveDeck } from '../utils/firestore';
import { saveCard } from '../utils/firestore';
import LoadingSpinner from '../components/LoadingSpinner';

const Quiz = () => {
  const navigate = useNavigate();

  // Phase management: 'input' → 'quiz' → 'results'
  const [phase, setPhase] = useState('input');

  // Phase 1: Input state
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [loading, setLoading] = useState(false);

  // Phase 2: Quiz state
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({}); // { index: { selected: value, isCorrect: bool } }
  const [submitted, setSubmitted] = useState(false); // For the current question

  // Phase 3: Results state
  const [keepState, setKeepState] = useState({}); // { index: true/false }
  const [saving, setSaving] = useState(false);

  // ─── Phase 1: Generate Quiz ────────────────────────────────────────
  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error('Please enter a topic');
      return;
    }

    setLoading(true);
    try {
      const quiz = await AIService.generateQuiz(topic.trim(), difficulty);
      setQuestions(quiz);
      setCurrentQ(0);
      setAnswers({});
      setSubmitted(false);

      // Default all questions to "keep"
      const defaults = {};
      quiz.forEach((_, i) => { defaults[i] = true; });
      setKeepState(defaults);

      setPhase('quiz');
      toast.success(`Generated ${quiz.length} questions!`);
    } catch (error) {
      console.error('Quiz generation failed:', error);
      toast.error('Failed to generate quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ─── Phase 2: Quiz Interaction ─────────────────────────────────────
  const handleSelectMCQ = (optionIndex) => {
    if (submitted) return; // Can't change after submitting
    setAnswers(prev => ({
      ...prev,
      [currentQ]: { selected: optionIndex, isCorrect: null }
    }));
  };

  const handleFillBlank = (value) => {
    if (submitted) return;
    setAnswers(prev => ({
      ...prev,
      [currentQ]: { selected: value, isCorrect: null }
    }));
  };

  const handleSubmitAnswer = () => {
    const q = questions[currentQ];
    const userAnswer = answers[currentQ];

    if (userAnswer === undefined || userAnswer.selected === '' || userAnswer.selected === undefined || userAnswer.selected === null) {
      toast.error('Please select or type an answer first');
      return;
    }

    let isCorrect;
    if (q.type === 'mcq') {
      isCorrect = userAnswer.selected === q.correctIndex;
    } else {
      // Fill in the blank — case-insensitive comparison
      isCorrect = userAnswer.selected.trim().toLowerCase() === q.answer.trim().toLowerCase();
    }

    setAnswers(prev => ({
      ...prev,
      [currentQ]: { ...prev[currentQ], isCorrect }
    }));
    setSubmitted(true);
  };

  const handleNext = () => {
    if (currentQ + 1 < questions.length) {
      setCurrentQ(currentQ + 1);
      setSubmitted(false);
    } else {
      setPhase('results');
    }
  };

  // ─── Phase 3: Save kept cards ──────────────────────────────────────
  const handleSaveToDecks = async () => {
    const keptQuestions = questions.filter((_, i) => keepState[i]);

    if (keptQuestions.length === 0) {
      toast.error('No questions selected to save');
      return;
    }

    setSaving(true);
    try {
      // Create a new deck for this quiz
      const newDeck = await saveDeck({
        name: `Quiz: ${topic}`,
        description: `AI-generated ${difficulty} quiz on ${topic} (${keptQuestions.length} cards)`,
        cardCount: keptQuestions.length,
      });

      // Convert each kept question into a flashcard
      const cardPromises = keptQuestions.map((q) => {
        let question, answer;

        if (q.type === 'mcq') {
          question = q.question;
          answer = q.options[q.correctIndex];
        } else {
          question = q.question;
          answer = q.answer;
        }

        return saveCard({
          deckId: newDeck.id,
          question,
          answer,
          interval: 0,
          repetitions: 0,
          easeFactor: 2.5,
          nextReview: new Date().toISOString(),
          lastReviewed: null,
          metadata: {
            isAIGenerated: true,
            quizTopic: topic,
            questionType: q.type,
          },
        });
      });

      await Promise.all(cardPromises);
      toast.success(`Saved ${keptQuestions.length} cards to "${newDeck.name}"!`);
      navigate(`/deck/${newDeck.id}`);
    } catch (error) {
      console.error('Error saving quiz cards:', error);
      toast.error('Failed to save cards. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // ─── Calculate Score ───────────────────────────────────────────────
  const getScore = () => {
    let correct = 0;
    questions.forEach((_, i) => {
      if (answers[i]?.isCorrect) correct++;
    });
    return correct;
  };

  // ════════════════════════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════════════════════════

  // ─── Phase 1: Topic Input ──────────────────────────────────────────
  if (phase === 'input') {
    return (
      <div className="container mx-auto p-6 max-w-xl">
        <h1 className="text-3xl font-bold mb-2 text-center">AI Quiz Generator</h1>
        <p className="text-gray-500 text-center mb-8">
          Enter any topic. We'll generate a mixed-format quiz, then let you curate which questions become flashcards.
        </p>

        <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Topic</label>
            <input
              id="quiz-topic-input"
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Binary Search Trees, Thermodynamics, React Hooks..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
            <div className="grid grid-cols-3 gap-3">
              {['easy', 'medium', 'hard'].map((level) => (
                <button
                  key={level}
                  id={`quiz-difficulty-${level}`}
                  onClick={() => setDifficulty(level)}
                  className={`py-2.5 px-4 rounded-lg font-medium capitalize transition-all ${
                    difficulty === level
                      ? level === 'easy'
                        ? 'bg-green-500 text-white shadow-md'
                        : level === 'medium'
                        ? 'bg-orange-500 text-white shadow-md'
                        : 'bg-red-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <button
            id="quiz-generate-btn"
            onClick={handleGenerate}
            disabled={loading || !topic.trim()}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-lg hover:from-blue-700 hover:to-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-lg"
          >
            {loading ? 'Generating Quiz...' : 'Generate Quiz'}
          </button>
        </div>

        {loading && (
          <div className="mt-8 text-center">
            <LoadingSpinner />
            <p className="text-gray-500 mt-4">Our AI professor is crafting your quiz...</p>
          </div>
        )}
      </div>
    );
  }

  // ─── Phase 2: Taking the Quiz ──────────────────────────────────────
  if (phase === 'quiz') {
    const q = questions[currentQ];
    const userAnswer = answers[currentQ];

    return (
      <div className="container mx-auto p-6 max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-500 font-medium">
              Question {currentQ + 1} of {questions.length}
            </span>
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
              q.type === 'mcq'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-purple-100 text-purple-700'
            }`}>
              {q.type === 'mcq' ? 'Multiple Choice' : 'Fill in the Blank'}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-6">{q.question}</h2>

          {/* MCQ Options */}
          {q.type === 'mcq' && (
            <div className="space-y-3">
              {q.options.map((opt, idx) => {
                let btnClass = 'border-2 border-gray-200 bg-gray-50 hover:border-blue-400 hover:bg-blue-50';

                if (userAnswer?.selected === idx && !submitted) {
                  btnClass = 'border-2 border-blue-500 bg-blue-50 ring-2 ring-blue-200';
                }

                if (submitted) {
                  if (idx === q.correctIndex) {
                    btnClass = 'border-2 border-green-500 bg-green-50';
                  } else if (userAnswer?.selected === idx && !userAnswer?.isCorrect) {
                    btnClass = 'border-2 border-red-500 bg-red-50';
                  } else {
                    btnClass = 'border-2 border-gray-200 bg-gray-50 opacity-60';
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectMCQ(idx)}
                    disabled={submitted}
                    className={`w-full text-left p-4 rounded-lg transition-all ${btnClass}`}
                  >
                    <span className="font-medium text-gray-400 mr-3">
                      {String.fromCharCode(65 + idx)}.
                    </span>
                    <span className="text-gray-800">{opt}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Fill in the Blank */}
          {q.type === 'fill_blank' && (
            <div>
              <input
                type="text"
                placeholder="Type your answer..."
                value={userAnswer?.selected || ''}
                onChange={(e) => handleFillBlank(e.target.value)}
                disabled={submitted}
                className={`w-full px-4 py-3 border-2 rounded-lg text-lg focus:outline-none transition-all ${
                  submitted
                    ? userAnswer?.isCorrect
                      ? 'border-green-500 bg-green-50'
                      : 'border-red-500 bg-red-50'
                    : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                }`}
                onKeyDown={(e) => e.key === 'Enter' && !submitted && handleSubmitAnswer()}
              />
              {submitted && !userAnswer?.isCorrect && (
                <p className="mt-3 text-green-700 font-medium">
                  Correct answer: <span className="font-bold">{q.answer}</span>
                </p>
              )}
            </div>
          )}

          {/* Feedback after submit */}
          {submitted && (
            <div className={`mt-5 p-3 rounded-lg text-center font-semibold ${
              userAnswer?.isCorrect
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {userAnswer?.isCorrect ? '✅ Correct!' : '❌ Incorrect'}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex justify-end gap-3">
          {!submitted ? (
            <button
              id="quiz-submit-answer"
              onClick={handleSubmitAnswer}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
            >
              Submit Answer
            </button>
          ) : (
            <button
              id="quiz-next-question"
              onClick={handleNext}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition"
            >
              {currentQ + 1 < questions.length ? 'Next Question →' : 'View Results →'}
            </button>
          )}
        </div>
      </div>
    );
  }

  // ─── Phase 3: Results + Curation ───────────────────────────────────
  if (phase === 'results') {
    const score = getScore();
    const percentage = Math.round((score / questions.length) * 100);

    return (
      <div className="container mx-auto p-6 max-w-2xl">
        {/* Score Summary */}
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 text-center mb-6">
          <h1 className="text-3xl font-bold mb-2">Quiz Complete!</h1>
          <p className="text-gray-500 mb-6">Topic: {topic} ({difficulty})</p>

          <div className={`inline-block text-6xl font-bold mb-2 ${
            percentage >= 70 ? 'text-green-600' : percentage >= 40 ? 'text-orange-500' : 'text-red-500'
          }`}>
            {percentage}%
          </div>
          <p className="text-gray-600 text-lg">{score} of {questions.length} correct</p>
        </div>

        {/* Curation Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
          <h2 className="text-xl font-bold mb-2">Curate Your Flashcards</h2>
          <p className="text-gray-500 text-sm mb-6">
            Toggle questions you want to keep. Kept questions become flashcards in a new deck with spaced repetition scheduling.
          </p>

          <div className="space-y-3">
            {questions.map((q, i) => {
              const wasCorrect = answers[i]?.isCorrect;
              return (
                <div
                  key={i}
                  className={`flex items-start gap-3 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                    keepState[i]
                      ? 'border-blue-300 bg-blue-50'
                      : 'border-gray-200 bg-gray-50 opacity-60'
                  }`}
                  onClick={() => setKeepState(prev => ({ ...prev, [i]: !prev[i] }))}
                >
                  {/* Toggle */}
                  <div className={`mt-1 w-5 h-5 rounded flex-shrink-0 flex items-center justify-center border-2 ${
                    keepState[i] ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-300'
                  }`}>
                    {keepState[i] && <span className="text-xs">✓</span>}
                  </div>

                  {/* Question details */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 font-medium truncate">{q.question}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        q.type === 'mcq' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'
                      }`}>
                        {q.type === 'mcq' ? 'MCQ' : 'Fill Blank'}
                      </span>
                      <span className={`text-xs ${wasCorrect ? 'text-green-600' : 'text-red-500'}`}>
                        {wasCorrect ? '✅ Correct' : '❌ Incorrect'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Save Button */}
          <div className="mt-6 flex gap-3">
            <button
              id="quiz-save-cards"
              onClick={handleSaveToDecks}
              disabled={saving || Object.values(keepState).every(v => !v)}
              className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-lg hover:from-blue-700 hover:to-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving
                ? 'Saving...'
                : `Save ${Object.values(keepState).filter(Boolean).length} Cards to Deck`}
            </button>
            <button
              onClick={() => { setPhase('input'); setTopic(''); }}
              className="px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition"
            >
              New Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default Quiz;
