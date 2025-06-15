// pages/Help.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp, Brain, Clock, BarChart, Star, RefreshCw, BookOpen, Zap } from 'lucide-react';

const Help = () => {
  const [openSection, setOpenSection] = useState('what-is-sr');

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  const Section = ({ id, title, icon: Icon, children }) => (
    <div className="mb-4 bg-white rounded-lg shadow-md overflow-hidden">
      <button
        onClick={() => toggleSection(id)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
        </div>
        {openSection === id ? (
          <ChevronUp className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </button>
      {openSection === id && (
        <div className="px-6 py-4 border-t border-gray-200">
          {children}
        </div>
      )}
    </div>
  );

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">How to Use SpacedRep</h1>
        <p className="text-lg text-gray-600">
          Master any subject with scientifically-proven spaced repetition learning
        </p>
      </div>

      <Section id="what-is-sr" title="What is Spaced Repetition?" icon={Brain}>
        <div className="prose max-w-none">
          <p className="mb-4 text-gray-700">
            Spaced repetition is a learning technique that presents information at increasing intervals 
            to move knowledge from short-term to long-term memory. Instead of cramming, you review 
            material just before you're about to forget it.
          </p>
          
          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <h4 className="font-semibold text-blue-900 mb-2">Why it works:</h4>
            <ul className="list-disc list-inside text-blue-800 space-y-1">
              <li>Strengthens memory consolidation</li>
              <li>Reduces study time by up to 50%</li>
              <li>Improves long-term retention</li>
              <li>Prevents the forgetting curve</li>
            </ul>
          </div>

          <p className="text-gray-700">
            Our app uses the <strong>SM-2 algorithm</strong>, which calculates optimal review intervals 
            based on how well you remember each card.
          </p>
        </div>
      </Section>

      <Section id="getting-started" title="Getting Started" icon={BookOpen}>
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">1. Create a Deck</h3>
            <p className="text-gray-700 mb-2">
              A deck is a collection of related flashcards. For example:
            </p>
            <ul className="list-disc list-inside text-gray-600 ml-4 space-y-1">
              <li>English Vocabulary</li>
              <li>Medical Terms</li>
              <li>Historical Dates</li>
              <li>Programming Concepts</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-800 mb-2">2. Add Cards</h3>
            <p className="text-gray-700 mb-2">
              Each card has a question (front) and answer (back). Keep them:
            </p>
            <ul className="list-disc list-inside text-gray-600 ml-4 space-y-1">
              <li><strong>Simple:</strong> One concept per card</li>
              <li><strong>Clear:</strong> Unambiguous questions</li>
              <li><strong>Specific:</strong> Precise answers</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-800 mb-2">3. Study Daily</h3>
            <p className="text-gray-700">
              Review cards when they're due. The app automatically schedules reviews 
              based on your performance.
            </p>
          </div>
        </div>
      </Section>

      <Section id="rating-system" title="Rating System Explained" icon={Star}>
        <div className="space-y-4">
          <p className="text-gray-700">
            After seeing the answer, rate how well you recalled it:
          </p>

          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
              <span className="px-3 py-1 bg-red-600 text-white rounded font-semibold">0</span>
              <div>
                <h4 className="font-semibold text-red-900">Again</h4>
                <p className="text-red-800 text-sm">Complete blackout - couldn't recall at all</p>
                <p className="text-red-700 text-xs mt-1">→ Card resets to 1 day interval</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
              <span className="px-3 py-1 bg-orange-600 text-white rounded font-semibold">3</span>
              <div>
                <h4 className="font-semibold text-orange-900">Hard</h4>
                <p className="text-orange-800 text-sm">Recalled with significant difficulty</p>
                <p className="text-orange-700 text-xs mt-1">→ Shorter interval increase</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
              <span className="px-3 py-1 bg-blue-600 text-white rounded font-semibold">4</span>
              <div>
                <h4 className="font-semibold text-blue-900">Good</h4>
                <p className="text-blue-800 text-sm">Recalled correctly with some effort</p>
                <p className="text-blue-700 text-xs mt-1">→ Normal interval increase</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
              <span className="px-3 py-1 bg-green-600 text-white rounded font-semibold">5</span>
              <div>
                <h4 className="font-semibold text-green-900">Easy</h4>
                <p className="text-green-800 text-sm">Instant recall, no effort needed</p>
                <p className="text-green-700 text-xs mt-1">→ Maximum interval increase</p>
              </div>
            </div>
          </div>

          <div className="mt-4 p-4 bg-gray-100 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>Tip:</strong> Be honest with your ratings. The algorithm works best when 
              you accurately assess your recall difficulty.
            </p>
          </div>
        </div>
      </Section>

      <Section id="intervals" title="Review Intervals" icon={Clock}>
        <div className="space-y-4">
          <p className="text-gray-700">
            The app automatically calculates when you should review each card:
          </p>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-3">Typical Progression:</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">New card</span>
                <span className="font-mono text-sm bg-white px-2 py-1 rounded">→ 1 day</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">First review (Good)</span>
                <span className="font-mono text-sm bg-white px-2 py-1 rounded">→ 6 days</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Second review (Good)</span>
                <span className="font-mono text-sm bg-white px-2 py-1 rounded">→ ~15 days</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Third review (Good)</span>
                <span className="font-mono text-sm bg-white px-2 py-1 rounded">→ ~37 days</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Fourth review (Good)</span>
                <span className="font-mono text-sm bg-white px-2 py-1 rounded">→ ~92 days</span>
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-600">
            Intervals adjust based on your performance. Cards you find difficult appear more 
            frequently, while easy cards have longer intervals.
          </p>
        </div>
      </Section>

      <Section id="study-tips" title="Study Tips" icon={BarChart}>
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Daily Practice</h4>
            <p className="text-gray-700">
              Study for 10-20 minutes daily rather than long sessions. Consistency is key!
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Card Creation Best Practices</h4>
            <ul className="list-disc list-inside text-gray-600 ml-4 space-y-1">
              <li>Use images when possible - visual memory is powerful</li>
              <li>Break complex topics into multiple simple cards</li>
              <li>Use personal examples and mnemonics</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-800 mb-2">During Reviews</h4>
            <ul className="list-disc list-inside text-gray-600 ml-4 space-y-1">
              <li>Say the answer out loud before revealing</li>
              <li>Don't skip cards - work through all due cards</li>
              <li>Review in a quiet, focused environment</li>
              <li>If unsure, rate "Hard" rather than "Good"</li>
            </ul>
          </div>

          <div className="p-4 bg-yellow-50 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Remember:</strong> The goal isn't to get through cards quickly, but to 
              genuinely learn and retain the information long-term.
            </p>
          </div>
        </div>
      </Section>

      <Section id="progress" title="Understanding Your Progress" icon={RefreshCw}>
        <div className="space-y-4">
          <p className="text-gray-700">
            The dashboard shows your learning progress:
          </p>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
              <div>
                <span className="font-semibold text-gray-800">New:</span>
                <span className="text-gray-600 ml-2">Cards you haven't studied yet</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
              <div>
                <span className="font-semibold text-gray-800">Due:</span>
                <span className="text-gray-600 ml-2">Cards ready for review today</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
              <div>
                <span className="font-semibold text-gray-800">Learning:</span>
                <span className="text-gray-600 ml-2">Recently introduced cards (less than 3 reviews)</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <div>
                <span className="font-semibold text-gray-800">Learned:</span>
                <span className="text-gray-600 ml-2">Well-memorized cards with longer intervals</span>
              </div>
            </div>
          </div>

          <p className="text-gray-700 mt-4">
            As you consistently review cards, you'll see them move from "New" → "Learning" → "Learned", 
            indicating successful long-term memorization.
          </p>
        </div>
      </Section>

      <Section id="ai-features" title="AI-Powered Features" icon={Zap}>
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">AI-Generated Flashcards</h4>
            <p className="text-gray-700">
              Save time by letting AI generate flashcards for you. Simply provide a word or question, and the AI will automatically understand the context—whether it's a new vocabulary word, a medical term, or a complex question—and create a detailed card with definitions, examples, and more.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Text Extraction from Images</h4>
            <p className="text-gray-700">
              Add cards effortlessly by uploading an image. The AI extracts text from the image and intelligently uses it as the card's content, making it easy to digitize handwritten or printed notes without requiring manual input.
            </p>
          </div>
        </div>
      </Section>

      <div className="mt-8 p-6 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-lg">
        <h3 className="text-xl font-bold mb-2">Ready to Start Learning?</h3>
        <p className="mb-4">
          Create your first deck and experience the power of spaced repetition!
        </p>
        <Link 
          to="/decks" 
          className="inline-block px-6 py-2 bg-white text-blue-700 font-semibold rounded-lg hover:bg-gray-100 transition"
        >
          Create Your First Deck
        </Link>
      </div>
    </div>
  );
};

export default Help;