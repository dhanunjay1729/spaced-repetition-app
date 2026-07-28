// utils/aiService.js
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from '../firebase';

class AIService {
  constructor() {
    this.functions = getFunctions(app);
  }

  async processUserQuery(input) {
    try {
      console.log('Calling secure Firebase function for content generation...');
      const processQuery = httpsCallable(this.functions, 'processUserQuery');
      
      const response = await processQuery({ input });
      const result = response.data.output;

      return {
        input,
        output: result,
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('AI Service Error (processUserQuery):', error);
      throw error;
    }
  }

  async generateHint(question) {
    try {
      console.log('Calling secure Firebase function to generate a hint...');
      const getHint = httpsCallable(this.functions, 'generateHint');
      
      const response = await getHint({ question });
      const hint = response.data.hint;

      console.log('Generated hint successfully');
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
      const SUPPORTED_FORMATS = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
      if (!SUPPORTED_FORMATS.includes(imageFile.type)) {
        throw new Error('Unsupported image format. Please upload PNG, JPG, JPEG, WEBP, or GIF.');
      }

      console.log(`Calling secure Firebase function to extract text from image of type ${imageFile.type}`);

      // Read the file as base64
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]); // Get only base64 part
        reader.onerror = reject;
        reader.readAsDataURL(imageFile);
      });

      const extractText = httpsCallable(this.functions, 'extractTextFromImage');
      const response = await extractText({
        base64Data: base64,
        mimeType: imageFile.type
      });

      const extractedText = response.data.text;
      console.log('Extracted text successfully');
      return extractedText;
    } catch (error) {
      console.error('Failed to extract text from image:', error);
      throw error;
    }
  }

  /**
   * Generate a mixed-format quiz on a given topic
   * @param {string} topic - The topic to generate a quiz for
   * @param {string} difficulty - easy, medium, or hard
   * @returns {Promise<Array>} Array of quiz question objects
   */
  async generateQuiz(topic, difficulty = 'medium') {
    try {
      console.log(`Generating ${difficulty} quiz on: ${topic}`);
      const genQuiz = httpsCallable(this.functions, 'generateQuiz');

      const response = await genQuiz({ topic, difficulty });
      console.log('Quiz generated successfully');
      return response.data.quiz;
    } catch (error) {
      console.error('Failed to generate quiz:', error);
      throw error;
    }
  }
}

export default new AIService();
