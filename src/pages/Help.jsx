// pages/Help.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ChevronDown, ChevronUp, Brain, Clock, BarChart2, Star,
  RefreshCw, BookOpen, Zap, Sparkles, ArrowRight,
  CheckCircle2, HelpCircle, Target, TrendingUp, Activity
} from 'lucide-react';

const Help = () => {
  const [openSection, setOpenSection] = useState('what-is-sr');
  const toggleSection = (section) => setOpenSection(openSection === section ? null : section);

  const Section = ({ id, title, icon: Icon, children }) => {
    const isOpen = openSection === id;
    return (
      <div className={`glass rounded-2xl overflow-hidden mb-4 transition-all duration-300 ${
        isOpen ? 'ring-1 ring-brand-500/50 dark:ring-brand-400/30 shadow-brand-500/5' : 'hover:border-white/30 dark:hover:border-white/20'
      }`}>
        <button
          onClick={() => toggleSection(id)}
          className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-black/5 dark:hover:bg-white/5 transition-colors group"
        >
          <div className="flex items-center gap-3.5">
            <div className={`p-2 rounded-xl transition-colors ${
              isOpen
                ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400'
                : 'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 group-hover:text-brand-500'
            }`}>
              <Icon className="w-5 h-5" />
            </div>
            <h2 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
              {title}
            </h2>
          </div>
          <div className="text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
            {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        </button>
        {isOpen && (
          <div className="px-6 py-5 border-t border-gray-100 dark:border-white/5 text-gray-600 dark:text-gray-300 animate-fade-in text-sm sm:text-base leading-relaxed">
            {children}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl animate-fade-in">
      {/* Header */}
      <div className="mb-10 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20 mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Learn Faster &amp; Retain Longer</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-3">
          How to Use <span className="text-gradient">SpacedRep</span>
        </h1>
        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl">
          Master any subject with FSRS-6 scheduling, live memory retention curves, and AI-powered learning tools.
        </p>
      </div>

      <div className="space-y-4">

        {/* Section: What is SR */}
        <Section id="what-is-sr" title="What is Spaced Repetition?" icon={Brain}>
          <div className="space-y-4">
            <p>
              Spaced repetition is an evidence-based learning technique that presents information at smart, increasing intervals to cement knowledge into long-term memory. Instead of cramming, you review material right at the moment you're about to forget it.
            </p>
            <div className="p-4 rounded-xl bg-brand-50/70 dark:bg-brand-500/10 border border-brand-200/60 dark:border-brand-500/20">
              <h4 className="font-semibold text-brand-900 dark:text-brand-300 mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-500" /> Why it works:
              </h4>
              <ul className="grid sm:grid-cols-2 gap-2 text-sm text-brand-800 dark:text-brand-200">
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-brand-500"></span>Strengthens memory consolidation</li>
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-brand-500"></span>Reduces study time by up to 50%</li>
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-brand-500"></span>Improves long-term retention</li>
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-brand-500"></span>Prevents the Ebbinghaus forgetting curve</li>
              </ul>
            </div>
            <p>
              SpacedRep uses the <strong className="text-gray-900 dark:text-white">FSRS-6 algorithm</strong> — the same algorithm Anki adopted as its default in 2023 — which is provably more accurate than the traditional SM-2 approach.
            </p>
          </div>
        </Section>

        {/* Section: FSRS Algorithm */}
        <Section id="fsrs-algorithm" title="FSRS-6 Scheduling Algorithm" icon={TrendingUp}>
          <div className="space-y-4">
            <p>
              SpacedRep uses <strong className="text-gray-900 dark:text-white">FSRS-6</strong> (Free Spaced Repetition Scheduler), replacing the older SM-2 algorithm used by most flashcard apps. FSRS was adopted by Anki as its official default in October 2023.
            </p>

            <div className="grid sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-brand-50/70 dark:bg-brand-500/10 border border-brand-200/60 dark:border-brand-500/20 text-center">
                <div className="text-2xl font-extrabold text-brand-600 dark:text-brand-400">~4%</div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">FSRS recall prediction error</div>
              </div>
              <div className="p-3 rounded-xl bg-red-50/70 dark:bg-red-500/10 border border-red-200/60 dark:border-red-500/20 text-center">
                <div className="text-2xl font-extrabold text-red-500">~14%</div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">SM-2 recall prediction error</div>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-500/10 border border-emerald-200/60 dark:border-emerald-500/20 text-center">
                <div className="text-2xl font-extrabold text-emerald-500">−30%</div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Fewer daily reviews needed</div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-surface-100/50 dark:bg-white/5 border border-gray-200/50 dark:border-white/5 space-y-2 text-sm">
              <h4 className="font-semibold text-gray-900 dark:text-white">FSRS tracks 3 values per card:</h4>
              <div className="space-y-1.5">
                <div className="flex gap-2"><span className="font-mono text-brand-500 w-24 shrink-0">Stability (S)</span><span className="text-gray-600 dark:text-gray-300">Days until your recall drops to 90% — grows with each successful review</span></div>
                <div className="flex gap-2"><span className="font-mono text-purple-500 w-24 shrink-0">Difficulty (D)</span><span className="text-gray-600 dark:text-gray-300">Inherent card complexity (1–10). FSRS mean-reverts this to avoid "ease hell"</span></div>
                <div className="flex gap-2"><span className="font-mono text-emerald-500 w-24 shrink-0">Retrievability</span><span className="text-gray-600 dark:text-gray-300">Current probability you can recall the card right now (shown as % in the curve)</span></div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 flex gap-2">
              <HelpCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span><strong>"Ease hell"</strong> is a problem in SM-2 where pressing Hard/Again repeatedly permanently locks a card at very short intervals. FSRS solves this by slowly reverting card difficulty toward its natural level.</span>
            </div>
          </div>
        </Section>

        {/* Section: Forgetting Curve */}
        <Section id="forgetting-curve" title="Live Forgetting Curve (Per Card)" icon={Activity}>
          <div className="space-y-4">
            <p>
              Every card in your deck shows a live <strong className="text-gray-900 dark:text-white">memory retention curve</strong> — updated in real time based on your review history. Click any card in a deck to expand it and see the curve.
            </p>
            <div className="p-4 rounded-xl bg-surface-100/50 dark:bg-white/5 border border-gray-200/50 dark:border-white/5 space-y-2 text-sm">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">What the chart shows:</h4>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2"><span className="w-6 h-0.5 bg-brand-500 inline-block rounded"></span><span>The decay curve — how your memory fades over time for this specific card</span></div>
                <div className="flex items-center gap-2"><span className="w-6 h-0.5 border-t-2 border-dashed border-emerald-500 inline-block"></span><span>90% target retention threshold — FSRS schedules reviews to hit this</span></div>
                <div className="flex items-center gap-2"><span className="w-6 h-0.5 border-t-2 border-dashed border-amber-500 inline-block"></span><span><strong>Now</strong> — your live position on the curve (retention % shown in header)</span></div>
                <div className="flex items-center gap-2"><span className="w-6 h-0.5 border-t-2 border-dashed border-purple-500 inline-block"></span><span><strong>Due</strong> — when FSRS has scheduled your next review</span></div>
              </div>
            </div>
            <p className="text-sm">
              The formula is <code className="bg-gray-100 dark:bg-white/10 px-1.5 py-0.5 rounded font-mono text-xs">R(t) = (1 + factor·t/S)^(−w₂₀)</code>, a power-law that fits real memory data better than the simple exponential decay most apps assume.
            </p>
          </div>
        </Section>

        {/* Section: Getting Started */}
        <Section id="getting-started" title="Getting Started in 3 Steps" icon={BookOpen}>
          <div className="space-y-4">
            {[
              { n: 1, title: 'Create a Deck', desc: 'A deck is a topic collection of flashcards (e.g. "JavaScript Basics", "Medical Anatomy", "GRE Vocabulary").' },
              { n: 2, title: 'Add Cards (Manual or AI)', desc: 'Create cards manually or use the AI Quiz Generator to auto-generate a mixed quiz, pick what you got wrong, and save those as a deck instantly.' },
              { n: 3, title: 'Daily Review Habit', desc: 'Open the app for just 5-10 minutes each day. FSRS ensures you only review cards that are genuinely about to fall below 90% retention.' },
            ].map(({ n, title, desc }) => (
              <div key={n} className="p-4 rounded-xl bg-surface-100/50 dark:bg-white/5 border border-gray-200/50 dark:border-white/5">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                  <span className="flex items-center justify-center w-5 h-5 text-xs rounded-full bg-brand-500 text-white font-bold">{n}</span>
                  {title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{desc}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Section: Rating System */}
        <Section id="rating-system" title="Recall Rating System (FSRS)" icon={Star}>
          <div className="space-y-4">
            <p>When reviewing a flashcard, flip to see the answer and honestly rate how well you remembered it:</p>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { rating: 1, label: 'Again', color: 'red', desc: 'Complete blackout / Incorrect recall', effect: '→ Resets to short interval, difficulty increases slightly' },
                { rating: 2, label: 'Hard',  color: 'amber', desc: 'Recalled with significant hesitation', effect: '→ Small interval increase, difficulty increases' },
                { rating: 3, label: 'Good',  color: 'blue', desc: 'Recalled correctly with some effort', effect: '→ Normal interval growth based on stability' },
                { rating: 4, label: 'Easy',  color: 'emerald', desc: 'Instant recall without effort', effect: '→ Large interval multiplier, difficulty decreases' },
              ].map(({ rating, label, color, desc, effect }) => (
                <div key={rating} className={`p-3.5 rounded-xl bg-${color}-500/10 border border-${color}-500/20 flex items-start gap-3`}>
                  <span className={`px-2.5 py-1 bg-${color}-500 text-white rounded-lg font-bold text-xs shrink-0`}>{rating}</span>
                  <div>
                    <h4 className={`font-semibold text-${color}-700 dark:text-${color}-300 text-sm`}>{label}</h4>
                    <p className={`text-xs text-${color}-600 dark:text-${color}-400 mt-0.5`}>{desc}</p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">{effect}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3 rounded-xl bg-surface-100 dark:bg-white/5 border border-gray-200/60 dark:border-white/10 text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-brand-500 shrink-0" />
              <span><strong>Honest Review Constraints:</strong> Using an AI hint disables Good &amp; Easy. Taking &gt;15 seconds disables Easy. This keeps FSRS intervals mathematically honest.</span>
            </div>
          </div>
        </Section>

        {/* Section: AI Features */}
        <Section id="ai-features" title="AI-Powered Features" icon={Zap}>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
              <h4 className="font-semibold text-purple-900 dark:text-purple-300 text-sm mb-1.5 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-500" /> AI Smart Flashcard Generation
              </h4>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                Provide any concept, topic, or keyword. Our AI formulates comprehensive Q&amp;A pairs instantly.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-brand-500/10 border border-brand-500/20">
              <h4 className="font-semibold text-brand-900 dark:text-brand-300 text-sm mb-1.5 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-brand-500" /> Vision &amp; OCR Card Extraction
              </h4>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                Upload photos of textbooks, slides, or handwritten notes. AI scans and formats them into flashcards.
              </p>
            </div>

            <div className="sm:col-span-2 p-5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <h4 className="font-semibold text-emerald-900 dark:text-emerald-300 text-base mb-2 flex items-center gap-2">
                <Target className="w-5 h-5 text-emerald-500" /> AI Quiz Generator
              </h4>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                Enter any topic and difficulty to generate a mixed-format quiz (MCQ &amp; Fill-in-the-Blank). After the quiz, pick the questions you struggled with and save them as a new FSRS-scheduled deck.
              </p>
              <div className="flex items-center gap-2 text-xs font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 p-2 rounded-lg inline-block">
                <CheckCircle2 className="w-4 h-4" />
                <span><strong>Semantic grading:</strong> Fill-in-blank answers are graded by AI — "cell division" is accepted for "mitosis" when contextually correct.</span>
              </div>
            </div>
          </div>
        </Section>

        {/* Section: Card States */}
        <Section id="progress" title="Understanding Card States" icon={RefreshCw}>
          <div className="space-y-3">
            <p className="text-sm">Cards move through 4 states tracked by the FSRS algorithm:</p>
            <div className="grid sm:grid-cols-2 gap-2 text-sm">
              {[
                { color: 'bg-gray-400 dark:bg-gray-500', label: 'New', desc: 'Never studied — will appear in your next session' },
                { color: 'bg-blue-500', label: 'Learning', desc: 'Studied but still consolidating into memory' },
                { color: 'bg-orange-500', label: 'Due', desc: 'Ready for review — retention is approaching 90%' },
                { color: 'bg-emerald-500', label: 'Review', desc: 'In long-term memory — interval measured in weeks/months' },
              ].map(({ color, label, desc }) => (
                <div key={label} className="flex items-center gap-3 p-2.5 rounded-lg bg-surface-100/60 dark:bg-white/5 border border-gray-200/50 dark:border-white/5">
                  <div className={`w-3 h-3 ${color} rounded-full shrink-0`}></div>
                  <div>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">{label}: </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Section>

      </div>

      {/* Call to action */}
      <div className="mt-10 p-8 glass-elevated rounded-3xl border border-brand-500/30 text-center relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-600/10 via-purple-600/10 to-brand-600/10 dark:from-brand-500/20 dark:via-purple-500/20 dark:to-brand-500/20 pointer-events-none -z-10 group-hover:scale-105 transition-transform duration-500" />
        <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight">
          Ready to supercharge your memory?
        </h3>
        <p className="text-gray-600 dark:text-gray-300 max-w-lg mx-auto mb-6 text-sm sm:text-base">
          Start mastering subjects faster with FSRS-6 scheduling and retain what you learn for good.
        </p>
        <Link
          to="/login"
          className="inline-flex items-center gap-2 btn-primary glow text-base px-8 py-3.5 shadow-lg transform active:scale-95 transition-all"
        >
          <span>Create Your First Deck</span>
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </div>
  );
};

export default Help;
