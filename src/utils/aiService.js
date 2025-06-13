// utils/aiService.js
import { auth } from '../firebase';

class AIService {
  constructor() {
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY;

    console.log('AI Service initialized:');
    console.log('API key present:', !!this.apiKey);
    console.log('API key starts with sk-:', this.apiKey?.startsWith('sk-'));
  }

  async processUserQuery(input) {
  try {
    if (!this.apiKey) {
      throw new Error('API key is missing');
    }

    console.log('Using OpenAI API for adaptive learning aid generation');

    const model = import.meta.env.VITE_OPENAI_MODEL || "gpt-4o";

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
            content: `
You are an advanced educational AI assistant for a spaced-repetition learning app.
For any user input, decide what is most helpful:

- If the input is a single word → Provide a JSON object with:
  {
    "definition": "...",
    "partOfSpeech": "...",
    "examples": [...],
    "synonyms": [...],
    "etymology": "..."
  }

- If the input is a question → Provide a concise and clear explanation in *plain text*. **Do not use LaTeX or markdown formatting.**
Use this style for formulas: "The formula for the area of a square is: Area = s²".
Write formulas inline using superscripts or subscripts only if absolutely necessary, otherwise use plain text.

- If the input looks like a sentence in a non-English language → Translate to English and provide example usage.

- If the input appears to be code → Provide an explanation of what the code does.

Do NOT use \\( \\), \\[ \\], \`\`\`, or dollar signs ($) or ** for math or code formatting or any other formatting. I repeat don not use them. And no need of bold text.
`
          },
          {
            role: "user",
            content: input
          }
        ],
        temperature: 0.6,
        max_tokens: 5000
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'OpenAI API error');
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    let result;
    try {
      let cleanContent = content;
      result = JSON.parse(cleanContent);
    } catch (e) {
      result = content.trim();
    }

    return {
      input,
      output: result,
      generatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('AI Service Error:', error);
    throw error;
  }
}


  async generateHint(question) {
    try {
      if (!this.apiKey) {
        throw new Error('API key is missing');
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
      throw error;
    }
  }

  /**
   * Extract text from an image
   * @param {File} imageFile - The image file to process
   * @returns {Promise<string>} Extracted text from the image
   */
  async extractTextFromImage(imageFile) {
    try {
      if (!this.apiKey) throw new Error('API key is missing');

      const SUPPORTED_FORMATS = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
      if (!SUPPORTED_FORMATS.includes(imageFile.type)) {
        throw new Error('Unsupported image format. Please upload PNG, JPG, JPEG, WEBP, or GIF.');
      }

      console.log(`Using GPT-4o Vision to extract text from the image of type ${imageFile.type}`);

      // Read the file as base64
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]); // Get only base64 part
        reader.onerror = reject;
        reader.readAsDataURL(imageFile);
      });

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: "Extract all visible text from this image. Only return the plain text, no explanation." },
                {
                  type: "image_url",
                  image_url: {
                  url: `data:${imageFile.type};base64,${base64}`
            }
}

              ]
            }
          ],
          temperature: 0,
          max_tokens: 2500
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'OpenAI Vision API error');
      }

      const data = await response.json();
      const extractedText = data.choices[0]?.message?.content?.trim();
      console.log('Extracted text:', extractedText);
      return extractedText;
    } catch (error) {
      console.error('Failed to extract text from image:', error);
      throw error;
    }
  }


}

export default new AIService();
