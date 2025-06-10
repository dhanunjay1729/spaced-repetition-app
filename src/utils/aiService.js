// utils/aiService.js
import { auth } from '../firebase';

class AIService {
  constructor() {
    // Check if we should use mock data or real API
    this.useMockData = import.meta.env.VITE_USE_MOCK_AI === 'true';
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    
    // Debug logging
    console.log('AI Service initialized:');
    console.log('Mock mode:', this.useMockData);
    console.log('API key present:', !!this.apiKey);
    console.log('API key starts with sk-:', this.apiKey?.startsWith('sk-'));
  }

  async generateWordDefinition(word) {
    try {
      // If no API key or mock mode is enabled, use mock data
      if (!this.apiKey || this.useMockData) {
        console.log('Using mock data for AI generation');
        return this.getMockResponse(word);
      }

      // Otherwise, use real OpenAI API
      console.log('Using OpenAI API for generation');
      
      const model = import.meta.env.VITE_OPENAI_MODEL || "gpt-4o";
      console.log('Using model:', model);
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: "system",
              content: "You are a helpful English language tutor. Provide clear, concise definitions and example sentences suitable for language learners. Always respond in JSON format."
            },
            {
              role: "user",
              content: `For the word "${word}", provide:
1. A clear, simple definition (max 50 words)
2. The part of speech (noun, verb, adjective, etc.)
3. Three example sentences showing different uses of the word
4. Common synonyms (if applicable)
5. Etymology or interesting fact about the word (optional, max 30 words)

Format the response as JSON with the following structure:
{
  "definition": "...",
  "partOfSpeech": "...",
  "examples": ["sentence1", "sentence2", "sentence3"],
  "synonyms": ["synonym1", "synonym2"],
  "etymology": "..."
}`
            }
          ],
          temperature: 0.7,
          max_tokens: 400
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'OpenAI API error');
      }

      const data = await response.json();
      
      // Log the model used in the response
      console.log('Response from model:', data.model);
      console.log('Usage:', data.usage);
      
      const content = data.choices[0].message.content;
      
      // Parse the JSON response
      let parsedContent;
      try {
        // Remove markdown code blocks if present
        let cleanContent = content;
        if (content.includes('```json')) {
          cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        } else if (content.includes('```')) {
          cleanContent = content.replace(/```\n?/g, '').trim();
        }
        
        parsedContent = JSON.parse(cleanContent);
      } catch (e) {
        console.error('Failed to parse AI response:', content);
        throw new Error('Invalid response format from AI');
      }
      
      return {
        word,
        ...parsedContent,
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('AI Service Error:', error);
      
      // If there's an error, fall back to mock data
      console.log('Error occurred, falling back to mock data');
      return this.getMockResponse(word);
    }
  }

  // Mock responses for testing
  getMockResponse(word) {
    const mockData = {
      'hello': {
        definition: "A greeting used when meeting someone or answering the phone",
        partOfSpeech: "interjection",
        examples: [
          "Hello, how are you today?",
          "She said hello to everyone at the party.",
          "Hello! Is anyone there?"
        ],
        synonyms: ["hi", "hey", "greetings", "good day"],
        etymology: "From Old English 'hāl' meaning 'healthy' or 'whole'"
      },
      'learn': {
        definition: "To gain knowledge or skill by studying, practicing, or being taught",
        partOfSpeech: "verb",
        examples: [
          "Children learn to read at school.",
          "I want to learn how to play the guitar.",
          "She learned from her mistakes."
        ],
        synonyms: ["study", "understand", "master", "acquire"],
        etymology: "From Old English 'leornian', related to German 'lernen'"
      },
      'computer': {
        definition: "An electronic device that processes data and performs calculations according to programmed instructions",
        partOfSpeech: "noun",
        examples: [
          "She works on her computer all day.",
          "The computer crashed and lost all my files.",
          "Modern computers are incredibly powerful."
        ],
        synonyms: ["PC", "laptop", "machine", "device"],
        etymology: "From Latin 'computare' meaning 'to calculate'"
      },
      'language': {
        definition: "A system of communication used by a particular country or community",
        partOfSpeech: "noun",
        examples: [
          "English is the most widely spoken language in the world.",
          "She's learning a new language for her trip.",
          "Body language can convey emotions without words."
        ],
        synonyms: ["tongue", "dialect", "speech", "vernacular"],
        etymology: "From Latin 'lingua' meaning 'tongue'"
      }
    };

    // If we have a mock for this word, use it
    if (mockData[word.toLowerCase()]) {
      return {
        word,
        ...mockData[word.toLowerCase()],
        generatedAt: new Date().toISOString()
      };
    }

    // Otherwise, generate a generic response
    return {
      word,
      definition: `The word "${word}" means [this would be generated by AI in production]`,
      partOfSpeech: "noun/verb/adjective",
      examples: [
        `Here's an example sentence with ${word}.`,
        `Another way to use ${word} in context.`,
        `${word} can also be used like this.`
      ],
      synonyms: ["synonym1", "synonym2", "synonym3"],
      etymology: "Etymology information would be provided by AI",
      generatedAt: new Date().toISOString()
    };
  }
}

export default new AIService();