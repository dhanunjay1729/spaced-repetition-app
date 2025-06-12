// utils/aiService.js
import { auth } from '../firebase';

class AIService {
  constructor() {
    this.useMockData = import.meta.env.VITE_USE_MOCK_AI === 'true';
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY;

    console.log('AI Service initialized:');
    console.log('Mock mode:', this.useMockData);
    console.log('API key present:', !!this.apiKey);
    console.log('API key starts with sk-:', this.apiKey?.startsWith('sk-'));
  }

  async generateWordDefinition(word) {
    try {
      if (!this.apiKey || this.useMockData) {
        console.log('Using mock data for AI generation');
        return this.getMockResponse(word);
      }

      console.log('Using OpenAI API for generation');

      const model = import.meta.env.VITE_OPENAI_MODEL || "gpt-4o-mini";
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
              content: `You are a helpful multilingual language tutor. 
For any given word, detect the language of the word and provide a definition in clear English. 
Provide three example sentences in the same language as the word to help the learner understand usage in context. 
Also include synonyms (if applicable) and a brief etymology if available. 
Always respond in pure JSON format without markdown.

Here is the required structure:

{
  "definition": "...", // Clear English definition (max 50 words)
  "partOfSpeech": "...", // e.g., noun, verb, adjective
  "examples": ["sentence1", "sentence2", "sentence3"], // Example sentences in the word's original language
  "synonyms": ["synonym1", "synonym2"],  // in the word's language
  "etymology": "..." // optional, max 30 words
}`
            },
            {
              role: "user",
              content: `Generate the entry for the word: "${word}"`
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

      console.log('Response from model:', data.model);
      console.log('Usage:', data.usage);

      const content = data.choices[0].message.content;

      let parsedContent;
      try {
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
      console.log('Error occurred, falling back to mock data');
      return this.getMockResponse(word);
    }
  }

  // New function to generate a hint for a flashcard
  async generateHint(question) {
    try {
      if (!this.apiKey || this.useMockData) {
        console.log('Using mock data for hint generation');
        return `Hint: This is a mock hint for the question "${question}".`;
      }

      console.log('Using OpenAI API to generate a hint');

      const model = import.meta.env.VITE_OPENAI_MODEL || "gpt-4o-mini";

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
              content: `You are a helpful assistant that provides hints for flashcards. 
For a given question, provide a concise and helpful hint that guides the user toward the answer without revealing it directly.`
            },
            {
              role: "user",
              content: `Provide a hint for the question: "${question}"`
            }
          ],
          temperature: 0.7,
          max_tokens: 100
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'OpenAI API error');
      }

      const data = await response.json();
      const hint = data.choices[0].message.content.trim();

      console.log('Generated hint:', hint);

      return hint;
    } catch (error) {
      console.error('Failed to generate hint:', error);
      return 'Unable to generate a hint at the moment. Please try again later.';
    }
  }
}

export default new AIService();
