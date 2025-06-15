// utils/aiService.js
import { auth } from '../firebase';

class AIService {
  constructor() {
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    console.log('API key present:', !!this.apiKey);
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
You are an advanced AI assistant integrated into a spaced-repetition learning app. Your primary goal is to help users learn efficiently by providing clear, accurate, and concise information. Analyze the input and adapt your response based on its type. Follow these general guidelines:

- PLAIN TEXT, NO FORMATTING IS NEEDED, NOT EVEN BOLD LETTERS.
- If the input is a **medical term**, provide a detailed explanation including its definition, symptoms, causes, diagnosis, treatment, and any helpful memory tips.
- If the input is a **vocabulary word**, provide a definition, part of speech, examples, synonyms, and etymology in a structured format.
- If the input is a **technical or hardware term**, explain its purpose, key features, use cases, and troubleshooting tips if applicable.
- If the input is a **general question**, provide a clear and complete answer in plain text, including examples or context if necessary.
- If the input is a **non-English sentence**, translate it into English and explain its literal meaning if it differs.
- If the input is a **code snippet**, explain what the code does, break down key concepts, and mention common use cases.
- If the input is an **image**, extract all visible text and return it as plain text without additional explanation.

General Principles:
- Always prioritize clarity, accuracy, and relevance.
- Avoid verbose or overly technical explanations unless explicitly requested.
- Do not use conversational phrases or chat-like language.
- Ensure responses are user-friendly, professional, and suitable for learners of all levels.
- If the input is ambiguous, ask clarifying questions to better understand the user's intent.

Your role is to act as a knowledgeable and adaptive assistant, helping users learn effectively by providing structured, professional, and concise information.`
          },
          {
            role: "user",
            content: input
          }
        ],
        temperature: 0.4,
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
          max_tokens: 3000
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
