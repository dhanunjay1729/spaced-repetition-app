import React from 'react';
import Header from './components/Header';
import Card from './components/Card';
import DeckPreview from './components/DeckPreview';

function App() {
  // Sample data for testing
  const sampleCard = {
    question: "What is the time complexity of binary search?",
    answer: "O(log n)"
  };

  const sampleDecks = [
    { name: "Arrays", cardCount: 25, dueCount: 5 },
    { name: "Trees", cardCount: 30, dueCount: 8 },
    { name: "Graphs", cardCount: 20, dueCount: 3 }
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      
      <main className="container mx-auto p-6">
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Sample Card</h2>
          <Card 
            question={sampleCard.question} 
            answer={sampleCard.answer} 
          />
        </section>

        <section>
          <h2 className="text-3xl font-bold mb-6">Your Decks</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sampleDecks.map((deck, index) => (
              <DeckPreview 
                key={index}
                name={deck.name}
                cardCount={deck.cardCount}
                dueCount={deck.dueCount}
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;