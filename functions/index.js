const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// This initializes the Gemini SDK using the API key stored in Firebase environment variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

exports.processUserQuery = onCall(async (request) => {
  // Security rule: Only logged in users can call this API!
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be logged in to use AI features.');
  }

  const { input } = request.data;
  if (!input) throw new HttpsError('invalid-argument', 'Input is required.');

  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: `You are an advanced AI assistant integrated into a spaced-repetition learning app. Your primary goal is to help users learn efficiently by providing clear, accurate, and concise information. Analyze the input and adapt your response based on its type. Follow these general guidelines:

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
- If the input is ambiguous, ask clarifying questions to better understand the user's intent.`
    });

    const result = await model.generateContent(input);
    const text = result.response.text();
    
    // Attempt to parse as JSON in case it returns structured JSON
    let parsedResult;
    try {
      parsedResult = JSON.parse(text);
    } catch (e) {
      parsedResult = text.trim();
    }

    return { output: parsedResult };
  } catch (error) {
    console.error('Gemini Error:', error);
    throw new HttpsError('internal', 'Failed to generate content. Make sure GEMINI_API_KEY is set in functions/.env');
  }
});

exports.generateHint = onCall(async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'User must be logged in.');
  
  const { question } = request.data;
  if (!question) throw new HttpsError('invalid-argument', 'Question is required.');

  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: "You are a helpful assistant that provides hints for flashcards. For a given question, provide a concise and helpful hint that guides the user toward the answer without revealing it directly."
    });

    const result = await model.generateContent(`Provide a hint for the question: "${question}"`);
    return { hint: result.response.text().trim() };
  } catch (error) {
    console.error('Gemini Error:', error);
    throw new HttpsError('internal', 'Failed to generate hint');
  }
});

exports.extractTextFromImage = onCall(async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'User must be logged in.');
  
  const { base64Data, mimeType } = request.data;
  if (!base64Data || !mimeType) throw new HttpsError('invalid-argument', 'Image data is required.');

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent([
      "Extract all visible text from this image. Only return the plain text, no explanation.",
      {
        inlineData: {
          data: base64Data,
          mimeType: mimeType
        }
      }
    ]);
    return { text: result.response.text().trim() };
  } catch (error) {
    console.error('Gemini Vision Error:', error);
    throw new HttpsError('internal', 'Failed to extract text');
  }
});
