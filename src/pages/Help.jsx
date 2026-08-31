// pages/Help.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ChevronDown, 
  ChevronUp, 
  Brain, 
  Clock, 
  BarChart2, 
  Star, 
  RefreshCw, 
  BookOpen, 
  Zap, 
  Sparkles,
  ArrowRight,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';

const Help = () => {
  const [openSection, setOpenSection] = useState('what-is-sr');

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  const Section = ({ id, title, icon: Icon, children }) => {
    const isOpen = openSection === id;
    return (
      <div 
        className={`glass rounded-2xl overflow-hidden mb-4 transition-all duration-300 ${
          isOpen ? 'ring-1 ring-brand-500/50 dark:ring-brand-400/30 shadow-brand-500/5' : 'hover:border-white/30 dark:hover:border-white/20'
        }`}
      >
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
      {/* Header section with badge */}
      <div className="mb-10 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20 mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Learn Faster & Retain Longer</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-3">
          How to Use <span className="text-gradient">SpacedRep</span>
        </h1>
        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl">
          Master any subject effortlessly with scientifically proven spaced repetition algorithms and AI-powered flashcards.
        </p>
      </div>

      {/* Sections Accordion */}
      <div className="space-y-4">
        {/* Section: What is SR */}
        <Section id="what-is-sr" title="What is Spaced Repetition?" icon={Brain}>
          <div className="space-y-4">
            <p>
              Spaced repetition is an evidence-based learning technique that presents information at smart, increasing intervals to cement knowledge into long-term memory. Instead of stressful cramming, you review material right at the moment you're about to forget it.
            </p>
            
            <div className="p-4 rounded-xl bg-brand-50/70 dark:bg-brand-500/10 border border-brand-200/60 dark:border-brand-500/20">
              <h4 className="font-semibold text-brand-900 dark:text-brand-300 mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-500" />
                Why it works:
              </h4>
              <ul className="grid sm:grid-cols-2 gap-2 text-sm text-brand-800 dark:text-brand-200">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-500"></span>
                  Strengthens memory consolidation
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-500"></span>
                  Reduces study time by up to 50%
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-500"></span>
                  Improves long-term retention
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-500"></span>
                  Prevents the Ebbinghaus forgetting curve
                </li>
              </ul>
            </div>

            <p>
              Our app uses the industry-standard <strong className="text-gray-900 dark:text-white">SuperMemo SM-2 algorithm</strong>, which computes optimal review intervals dynamically based on your recall quality.
            </p>
          </div>
        </Section>

        {/* Section: Getting Started */}
        <Section id="getting-started" title="Getting Started in 3 Steps" icon={BookOpen}>
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-surface-100/50 dark:bg-white/5 border border-gray-200/50 dark:border-white/5">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                <span className="flex items-center justify-center w-5 h-5 text-xs rounded-full bg-brand-500 text-white font-bold">1</span>
                Create a Deck
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                A deck is a topic collection of flashcards (e.g., <em>"JavaScript Basics"</em>, <em>"Medical Anatomy"</em>, <em>"GRE Vocabulary"</em>).
              </p>
            </div>

            <div className="p-4 rounded-xl bg-surface-100/50 dark:bg-white/5 border border-gray-200/50 dark:border-white/5">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                <span className="flex items-center justify-center w-5 h-5 text-xs rounded-full bg-brand-500 text-white font-bold">2</span>
                Add Cards (Manual or AI)
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Create cards manually or let our AI automatically generate high-yield cards from single keywords or textbook images. Keep questions specific and focused!
              </p>
            </div>

            <div className="p-4 rounded-xl bg-surface-100/50 dark:bg-white/5 border border-gray-200/50 dark:border-white/5">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                <span className="flex items-center justify-center w-5 h-5 text-xs rounded-full bg-brand-500 text-white font-bold">3</span>
                Daily Review Habit
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Open the app for just 5-10 minutes each day to review due cards. The algorithm ensures you never spend time on cards you already know thoroughly.
              </p>
            </div>
          </div>
        </Section>

        {/* Section: Rating System */}
        <Section id="rating-system" title="Recall Rating System (SM-2)" icon={Star}>
          <div className="space-y-4">
            <p>
              When reviewing a flashcard, flip to see the answer and honestly rate how well you remembered it:
            </p>

            <div className="grid sm:grid-cols-2 gap-3">
              {/* Rating 0 */}
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
                <span className="px-2.5 py-1 bg-red-500 text-white rounded-lg font-bold text-xs">0</span>
                <div>
                  <h4 className="font-semibold text-red-700 dark:text-red-300 text-sm">Again</h4>
                  <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">Complete blackout / Incorrect recall</p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">→ Resets interval to 1 day</p>
                </div>
              </div>

              {/* Rating 3 */}
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
                <span className="px-2.5 py-1 bg-amber-500 text-white rounded-lg font-bold text-xs">3</span>
                <div>
                  <h4 className="font-semibold text-amber-700 dark:text-amber-300 text-sm">Hard</h4>
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">Recalled with significant hesitation</p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">→ Shorter interval increase</p>
                </div>
              </div>

              {/* Rating 4 */}
              <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-start gap-3">
                <span className="px-2.5 py-1 bg-blue-500 text-white rounded-lg font-bold text-xs">4</span>
                <div>
                  <h4 className="font-semibold text-blue-700 dark:text-blue-300 text-sm">Good</h4>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">Recalled correctly with slight effort</p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">→ Normal interval progression</p>
                </div>
              </div>

              {/* Rating 5 */}
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-3">
                <span className="px-2.5 py-1 bg-emerald-500 text-white rounded-lg font-bold text-xs">5</span>
                <div>
                  <h4 className="font-semibold text-emerald-700 dark:text-emerald-300 text-sm">Easy</h4>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">Instant recall without any effort</p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">→ Maximum interval multiplier</p>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-surface-100 dark:bg-white/5 border border-gray-200/60 dark:border-white/10 text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-brand-500 shrink-0" />
              <span><strong>Pro Tip:</strong> Always be honest with your ratings! The algorithm works best when you accurately assess difficulty.</span>
            </div>
          </div>
        </Section>

        {/* Section: Intervals */}
        <Section id="intervals" title="Review Intervals Progression" icon={Clock}>
          <div className="space-y-4">
            <p>
              Review intervals expand exponentially as your recall improves:
            </p>

            <div className="p-4 rounded-xl bg-surface-100/50 dark:bg-white/5 border border-gray-200/50 dark:border-white/5 space-y-2.5 text-sm">
              <div className="flex justify-between items-center py-1 border-b border-gray-200/50 dark:border-white/5">
                <span className="text-gray-600 dark:text-gray-400">Brand New Card</span>
                <span className="font-mono text-xs px-2.5 py-1 rounded-md bg-white dark:bg-surface-800 text-brand-600 dark:text-brand-400 font-semibold shadow-xs">
                  → 1 Day
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-gray-200/50 dark:border-white/5">
                <span className="text-gray-600 dark:text-gray-400">1st Successful Review (Good)</span>
                <span className="font-mono text-xs px-2.5 py-1 rounded-md bg-white dark:bg-surface-800 text-brand-600 dark:text-brand-400 font-semibold shadow-xs">
                  → 6 Days
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-gray-200/50 dark:border-white/5">
                <span className="text-gray-600 dark:text-gray-400">2nd Successful Review (Good)</span>
                <span className="font-mono text-xs px-2.5 py-1 rounded-md bg-white dark:bg-surface-800 text-brand-600 dark:text-brand-400 font-semibold shadow-xs">
                  → ~15 Days
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-gray-200/50 dark:border-white/5">
                <span className="text-gray-600 dark:text-gray-400">3rd Successful Review (Good)</span>
                <span className="font-mono text-xs px-2.5 py-1 rounded-md bg-white dark:bg-surface-800 text-brand-600 dark:text-brand-400 font-semibold shadow-xs">
                  → ~37 Days
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-gray-600 dark:text-gray-400">4th Successful Review (Good)</span>
                <span className="font-mono text-xs px-2.5 py-1 rounded-md bg-white dark:bg-surface-800 text-brand-600 dark:text-brand-400 font-semibold shadow-xs">
                  → ~90+ Days
                </span>
              </div>
            </div>
          </div>
        </Section>

        {/* Section: AI Features */}
        <Section id="ai-features" title="AI-Powered Features" icon={Zap}>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
              <h4 className="font-semibold text-purple-900 dark:text-purple-300 text-sm mb-1.5 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-500" />
                AI Smart Flashcard Generation
              </h4>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                Provide any concept, topic, or keyword. Our AI understands context and formulates comprehensive question-and-answer pairs instantly.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-brand-500/10 border border-brand-500/20">
              <h4 className="font-semibold text-brand-900 dark:text-brand-300 text-sm mb-1.5 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-brand-500" />
                Vision & OCR Card Extraction
              </h4>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                Snap or upload pictures of textbooks, slides, or handwritten study notes. The AI automatically scans text and formats it into ready-to-study flashcards.
              </p>
            </div>
          </div>
        </Section>

        {/* Section: Progress & Stats */}
        <Section id="progress" title="Understanding Card States" icon={RefreshCw}>
          <div className="space-y-3">
            <p className="text-sm">Your deck progress tracks cards in 4 key phases:</p>
            <div className="grid sm:grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-3 p-2.5 rounded-lg bg-surface-100/60 dark:bg-white/5 border border-gray-200/50 dark:border-white/5">
                <div className="w-3 h-3 bg-gray-400 dark:bg-gray-500 rounded-full shrink-0"></div>
                <div>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">New: </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Cards never studied yet</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2.5 rounded-lg bg-surface-100/60 dark:bg-white/5 border border-gray-200/50 dark:border-white/5">
                <div className="w-3 h-3 bg-amber-500 rounded-full shrink-0"></div>
                <div>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">Due: </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Cards ready for review today</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2.5 rounded-lg bg-surface-100/60 dark:bg-white/5 border border-gray-200/50 dark:border-white/5">
                <div className="w-3 h-3 bg-blue-500 rounded-full shrink-0"></div>
                <div>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">Learning: </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Under 3 successful reviews</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2.5 rounded-lg bg-surface-100/60 dark:bg-white/5 border border-gray-200/50 dark:border-white/5">
                <div className="w-3 h-3 bg-emerald-500 rounded-full shrink-0"></div>
                <div>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">Learned: </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Retained in long-term memory</span>
                </div>
              </div>
            </div>
          </div>
        </Section>
      </div>

      {/* Call to action card */}
      <div className="mt-10 p-8 glass-elevated rounded-3xl border border-brand-500/30 text-center relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-600/10 via-purple-600/10 to-brand-600/10 dark:from-brand-500/20 dark:via-purple-500/20 dark:to-brand-500/20 pointer-events-none -z-10 group-hover:scale-105 transition-transform duration-500" />
        
        <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight">
          Ready to supercharge your memory?
        </h3>
        <p className="text-gray-600 dark:text-gray-300 max-w-lg mx-auto mb-6 text-sm sm:text-base">
          Start mastering your subjects faster and retain what you learn for good.
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
