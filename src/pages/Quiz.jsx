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
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  // Phase 3: Results state
  const [keepState, setKeepState] = useState({});
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
    if (submitted) return;
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
      const newDeck = await saveDeck({
        name: `Quiz: ${topic}`,
        description: `AI-generated ${difficulty} quiz on ${topic} (${keptQuestions.length} cards)`,
        cardCount: keptQuestions.length,
      });

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
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">AI Quiz Generator</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Enter any topic. We'll generate a mixed-format quiz, then let you curate which questions become flashcards.
          </p>
        </div>

        <div className="glass-elevated rounded-2xl p-6 space-y-6 animate-slide-up">
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Topic</label>
            <input
              id="quiz-topic-input"
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Binary Search Trees, Thermodynamics, React Hooks..."
              className="input-field text-lg"
              onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Difficulty</label>
            <div className="grid grid-cols-3 gap-3">
              {['easy', 'medium', 'hard'].map((level) => (
                <button
                  key={level}
                  id={`quiz-difficulty-${level}`}
                  onClick={() => setDifficulty(level)}
                  className={`py-2.5 px-4 rounded-xl font-medium capitalize transition-all active:scale-[0.97] ${
                    difficulty === level
                      ? level === 'easy'
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                        : level === 'medium'
                        ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25'
                        : 'bg-red-500 text-white shadow-lg shadow-red-500/25'
                      : 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/15'
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
            className="w-full btn-primary text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Generating Quiz...' : 'Generate Quiz'}
          </button>
        </div>

        {loading && (
          <div className="mt-8 text-center animate-fade-in">
            <LoadingSpinner />
            <p className="text-gray-500 dark:text-gray-400 mt-4">Our AI professor is crafting your quiz...</p>
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
        <div className="mb-6 animate-fade-in">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
              Question {currentQ + 1} of {questions.length}
            </span>
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
              q.type === 'mcq'
                ? 'bg-brand-100 dark:bg-brand-500/20 text-brand-700 dark:text-brand-300'
                : 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300'
            }`}>
              {q.type === 'mcq' ? 'Multiple Choice' : 'Fill in the Blank'}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-white/10 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-brand-500 to-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="glass-elevated rounded-2xl p-6 sm:p-8 animate-scale-in">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-white mb-6">{q.question}</h2>

          {/* MCQ Options */}
          {q.type === 'mcq' && (
            <div className="space-y-3">
              {q.options.map((opt, idx) => {
                let btnClass = 'border-2 border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 hover:border-brand-400 dark:hover:border-brand-400 hover:bg-brand-50 dark:hover:bg-brand-500/10';

                if (userAnswer?.selected === idx && !submitted) {
                  btnClass = 'border-2 border-brand-500 bg-brand-50 dark:bg-brand-500/10 ring-2 ring-brand-200 dark:ring-brand-500/30';
                }

                if (submitted) {
                  if (idx === q.correctIndex) {
                    btnClass = 'border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10';
                  } else if (userAnswer?.selected === idx && !userAnswer?.isCorrect) {
                    btnClass = 'border-2 border-red-500 bg-red-50 dark:bg-red-500/10';
                  } else {
                    btnClass = 'border-2 border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-white/5 opacity-50';
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectMCQ(idx)}
                    disabled={submitted}
                    className={`w-full text-left p-4 rounded-xl transition-all ${btnClass}`}
                  >
                    <span className="font-medium text-gray-400 dark:text-gray-500 mr-3">
                      {String.fromCharCode(65 + idx)}.
                    </span>
                    <span className="text-gray-800 dark:text-gray-100">{opt}</span>
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
                className={`input-field text-lg ${
                  submitted
                    ? userAnswer?.isCorrect
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10'
                      : 'border-red-500 bg-red-50 dark:bg-red-500/10'
                    : ''
                }`}
                onKeyDown={(e) => e.key === 'Enter' && !submitted && handleSubmitAnswer()}
              />
              {submitted && !userAnswer?.isCorrect && (
                <p className="mt-3 text-emerald-600 dark:text-emerald-400 font-medium">
                  Correct answer: <span className="font-bold">{q.answer}</span>
                </p>
              )}
            </div>
          )}

          {/* Feedback after submit */}
          {submitted && (
            <div className={`mt-5 p-3 rounded-xl text-center font-semibold ${
              userAnswer?.isCorrect
                ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300'
                : 'bg-red-100 dark:bg-red-500/20 text-red-800 dark:text-red-300'
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
              className="btn-primary"
            >
              Submit Answer
            </button>
          ) : (
            <button
              id="quiz-next-question"
              onClick={handleNext}
              className="btn-primary"
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
        <div className="glass-elevated rounded-2xl p-6 sm:p-8 text-center mb-6 animate-scale-in">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Quiz Complete!</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Topic: {topic} ({difficulty})</p>

          <div className={`inline-block text-6xl font-extrabold mb-2 ${
            percentage >= 70 ? 'text-emerald-500' : percentage >= 40 ? 'text-orange-500' : 'text-red-500'
          }`}>
            {percentage}%
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-lg">{score} of {questions.length} correct</p>
        </div>

        {/* Curation Section */}
        <div className="glass-elevated rounded-2xl p-6 sm:p-8 animate-slide-up">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Curate Your Flashcards</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
            Toggle questions you want to keep. Kept questions become flashcards in a new deck with spaced repetition scheduling.
          </p>

          <div className="space-y-3">
            {questions.map((q, i) => {
              const wasCorrect = answers[i]?.isCorrect;
              return (
                <div
                  key={i}
                  className={`flex items-start gap-3 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                    keepState[i]
                      ? 'border-brand-300 dark:border-brand-500/40 bg-brand-50/50 dark:bg-brand-500/10'
                      : 'border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 opacity-50'
                  }`}
                  onClick={() => setKeepState(prev => ({ ...prev, [i]: !prev[i] }))}
                >
                  {/* Toggle */}
                  <div className={`mt-1 w-5 h-5 rounded flex-shrink-0 flex items-center justify-center border-2 transition-all ${
                    keepState[i] ? 'bg-brand-500 border-brand-500 text-white' : 'border-gray-300 dark:border-gray-600'
                  }`}>
                    {keepState[i] && <span className="text-xs">✓</span>}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 dark:text-gray-100 font-medium truncate">{q.question}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        q.type === 'mcq' ? 'bg-brand-100 dark:bg-brand-500/20 text-brand-600 dark:text-brand-300' : 'bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-300'
                      }`}>
                        {q.type === 'mcq' ? 'MCQ' : 'Fill Blank'}
                      </span>
                      <span className={`text-xs ${wasCorrect ? 'text-emerald-500' : 'text-red-500'}`}>
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
              className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving
                ? 'Saving...'
                : `Save ${Object.values(keepState).filter(Boolean).length} Cards to Deck`}
            </button>
            <button
              onClick={() => { setPhase('input'); setTopic(''); }}
              className="btn-secondary"
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
