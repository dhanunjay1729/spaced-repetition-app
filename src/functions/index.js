// functions/index.js
const functions = require('firebase-functions');
const cors = require('cors')({ origin: true });
const fetch = require('node-fetch');

const OPENAI_API_KEY = functions.config().openai.key;

exports.generateWordDefinition = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).send({ error: 'Only POST requests are allowed' });
    }

    const { word } = req.body;
    if (!word) {
      return res.status(400).send({ error: 'Word is required' });
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini", // Update model here
          messages: [
            {
              role: "system",
              content: "You are a helpful English language tutor. Provide clear, concise definitions and example sentences suitable for language learners."
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
      res.status(200).send(data.choices[0].message.content);
    } catch (error) {
      console.error('Error generating word definition:', error);
      res.status(500).send({ error: 'Failed to generate word definition' });
    }
  });
});

// Alternative: Generate flashcard content with spaced repetition hints
exports.generateFlashcardContent = functions.https.onRequest(async (req, res) => {
  cors(req, res, async () => {
    if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { word, difficulty = 'intermediate' } = req.body;
    
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini", // Update model here
        messages: [
          {
            role: "system",
            content: `You are creating flashcard content for ${difficulty} English learners. Focus on practical usage and memory aids.`
          },
          {
            role: "user",
            content: `Create flashcard content for "${word}":
1. Front side: The word and a memory hint or mnemonic
2. Back side: Definition, usage notes, and a memorable example
3. Difficulty rating (1-5, where 1 is easiest)
4. Study tip for remembering this word

Format as JSON:
{
  "front": { "word": "...", "hint": "..." },
  "back": { "definition": "...", "usage": "...", "example": "..." },
  "difficulty": number,
  "studyTip": "..."
}`
          }
        ],
        temperature: 0.8,
        max_tokens: 300
      });

      const content = JSON.parse(completion.choices[0].message.content);
      res.status(200).json(content);
    } catch (error) {
      console.error('Error generating flashcard:', error);
      res.status(500).json({ error: 'Failed to generate flashcard content' });
    }
  });
});