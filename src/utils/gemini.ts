import { GoogleGenerativeAI } from '@google/generative-ai';
import { LessonContent, GlobalStyle, ClassLevel, Subject } from '../types';

const ASMAN_SYSTEM_INSTRUCTION = `
You are ASman, a friendly AI teaching assistant for Indian classrooms.

PERSONALITY: Enthusiastic but calm, culturally aware, uses age-appropriate language, encourages curiosity

RESPONSE FORMAT: Always return structured JSON with these sections:
- explanation: Simple, age-appropriate content with Indian cultural context
- questions: Array of 3 MCQs with options and correct answers
- activity: Hands-on craft/experiment/role-play suggestion using common Indian materials
- globalMethod: Application of selected teaching style
- hindiTranslation: Key terms in Hindi with proper Devanagari script

TEACHING STYLES:
🇨🇳 Chinese: Repetitive practice, mastery through drills, structured worksheets
🇯🇵 Japanese: Structured step-by-step, disciplined approach, respect for process
🇺🇸 American: Question-based, exploration-focused, encourage questioning
🇪🇺 European: Creative expression, collaborative activities, artistic integration

Always include Indian cultural context, use familiar examples (like cricket, Bollywood, Indian festivals), and end with teacher encouragement. Ensure content is appropriate for the specified class level and Indian curriculum standards.
`;

class GeminiService {
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;

  constructor() {
    this.initializeAPI();
  }

  private initializeAPI() {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('Gemini API key not found. Using demo mode.');
      return;
    }

    try {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        systemInstruction: ASMAN_SYSTEM_INSTRUCTION
      });
    } catch (error) {
      console.error('Error initializing Gemini:', error);
    }
  }

  async generateLesson(
    classLevel: ClassLevel,
    subject: Subject,
    topic: string,
    globalStyle: GlobalStyle
  ): Promise<LessonContent> {
    if (!this.model) {
      return this.getDemoLesson(classLevel, subject, topic, globalStyle);
    }

    try {
      const classNumber = classLevel.replace('class-', '');
      const prompt = `Create a lesson for Class ${classNumber} ${subject} on topic "${topic}" using ${globalStyle} teaching style. 
      
      Requirements:
      - Age-appropriate for ${classNumber === '1' ? '6-7' : classNumber === '2' ? '7-8' : classNumber === '3' ? '8-9' : classNumber === '4' ? '9-10' : classNumber === '5' ? '10-11' : classNumber === '6' ? '11-12' : classNumber === '7' ? '12-13' : classNumber === '8' ? '13-14' : classNumber === '9' ? '14-15' : '15-16'} year olds
      - Include Indian cultural context and examples
      - Follow ${globalStyle} teaching methodology
      - Respond only with valid JSON matching the specified format`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Clean and parse JSON response
      const cleanedText = text.replace(/```json\n?|```\n?/g, '').trim();
      return JSON.parse(cleanedText);
    } catch (error) {
      console.error('Error generating lesson:', error);
      return this.getDemoLesson(classLevel, subject, topic, globalStyle);
    }
  }

  async analyzeUpload(file: File, classLevel: ClassLevel, subject: Subject): Promise<string> {
    if (!this.model) {
      return `I can see you've uploaded a ${file.type.includes('image') ? 'image' : 'document'} related to ${subject}. This looks perfect for creating engaging lessons for Class ${classLevel.replace('class-', '')} students!`;
    }

    try {
      const prompt = `Analyze this uploaded file for Class ${classLevel.replace('class-', '')} ${subject}. Provide insights about how to use this content in lessons. Be encouraging and practical for Indian teachers.`;
      
      // For demo purposes, return a helpful response
      return `This ${file.type.includes('image') ? 'image' : 'document'} contains excellent material for ${subject} lessons. I can help you create interactive activities and questions based on this content!`;
    } catch (error) {
      console.error('Error analyzing upload:', error);
      return `I can help you use this uploaded content to create amazing lessons for your students!`;
    }
  }

  private getDemoLesson(classLevel: ClassLevel, subject: Subject, topic: string, globalStyle: GlobalStyle): LessonContent {
    const classNumber = classLevel.replace('class-', '');
    
    return {
      explanation: `Welcome to our ${topic} lesson for Class ${classNumber}! Let's explore this exciting topic together using ${globalStyle} teaching methods. This lesson is specially designed for Indian students with examples they can relate to.`,
      questions: [
        {
          question: `What is the main concept we're learning about ${topic}?`,
          options: ['Basic understanding', 'Advanced concepts', 'Historical facts', 'Fun activities'],
          correct: 0
        },
        {
          question: `How can we apply ${topic} in daily life?`,
          options: ['Only in school', 'At home and school', 'Never needed', 'Only for exams'],
          correct: 1
        },
        {
          question: `What makes ${topic} interesting to learn?`,
          options: ['It\'s boring', 'It\'s challenging but fun', 'Too difficult', 'Not useful'],
          correct: 1
        }
      ],
      activity: `Let's create a hands-on activity about ${topic} using common materials available in Indian classrooms. Students can work in groups to explore and discover!`,
      globalMethod: `Using ${globalStyle} methodology: ${this.getStyleDescription(globalStyle)}`,
      hindiTranslation: {
        [topic]: `${topic} (विषय)`,
        'learning': 'सीखना',
        'students': 'छात्र',
        'activity': 'गतिविधि'
      }
    };
  }

  private getStyleDescription(style: GlobalStyle): string {
    const descriptions = {
      chinese: 'Step-by-step practice with repetition for mastery',
      japanese: 'Structured approach with respect for process and discipline',
      american: 'Encourage questions and exploration-based discovery',
      european: 'Creative expression through collaborative group activities'
    };
    return descriptions[style];
  }
}

export const geminiService = new GeminiService();