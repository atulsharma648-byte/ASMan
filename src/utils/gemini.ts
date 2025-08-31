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

const GLOBAL_VERSION_INSTRUCTION = `
You are ASman, creating ENHANCED global lesson content for Indian classrooms.

ENHANCED GLOBAL APPROACH: Provide comprehensive international perspectives including:
- Cross-cultural examples from different countries and regions
- Global best practices and international standards
- Real-world case studies from various cultures
- Comparative analysis showing different approaches worldwide
- International applications and connections

CONTENT LENGTH: 500-800 words with rich detail and multiple perspectives
STRUCTURE: Use clear headings, subheadings, bullet points for excellent readability
TONE: Educational yet engaging, maintaining cultural sensitivity

Always maintain the same JSON format but with significantly expanded content that showcases global perspectives while remaining relevant to Indian students.
`;

class GeminiService {
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;
  private globalModel: any = null;

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
      this.globalModel = this.genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        systemInstruction: GLOBAL_VERSION_INSTRUCTION
      });
    } catch (error) {
      console.error('Error initializing Gemini:', error);
    }
  }

  async generateLesson(
    classLevel: ClassLevel,
    subject: Subject,
    topic: string,
    globalStyle: GlobalStyle,
    isGlobalVersion: boolean = false
  ): Promise<LessonContent> {
    const modelToUse = isGlobalVersion ? this.globalModel : this.model;
    
    if (!modelToUse) {
      return this.getDemoLesson(classLevel, subject, topic, globalStyle, isGlobalVersion);
    }

    try {
      const classNumber = classLevel.replace('class-', '');
      const contentLength = isGlobalVersion ? '500-800 words' : '300-500 words';
      const versionType = isGlobalVersion ? 'GLOBAL VERSION with international perspectives' : 'STANDARD METHOD';
      
      const prompt = `Create a ${versionType} lesson for Class ${classNumber} ${subject} on topic "${topic}" using ${globalStyle} teaching style.
      
      Requirements:
      - Content length: ${contentLength}
      - Age-appropriate for ${this.getAgeRange(classNumber)} year olds
      - Include Indian cultural context and examples
      - Follow ${globalStyle} teaching methodology
      ${isGlobalVersion ? `
      - ENHANCED GLOBAL CONTENT: Include international perspectives, cross-cultural examples, global best practices
      - Multiple country examples and comparative analysis
      - Real-world case studies from various regions
      - International applications and connections` : ''}
      - Use clear headings and bullet points for readability
      - Respond only with valid JSON matching the specified format`;

      const result = await modelToUse.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Clean and parse JSON response
      const cleanedText = text.replace(/```json\n?|```\n?/g, '').trim();
      return JSON.parse(cleanedText);
    } catch (error) {
      console.error('Error generating lesson:', error);
      return this.getDemoLesson(classLevel, subject, topic, globalStyle, isGlobalVersion);
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

  private getAgeRange(classNumber: string): string {
    const ageMap: Record<string, string> = {
      '1': '6-7', '2': '7-8', '3': '8-9', '4': '9-10', '5': '10-11',
      '6': '11-12', '7': '12-13', '8': '13-14', '9': '14-15', '10': '15-16'
    };
    return ageMap[classNumber] || '6-16';
  }

  private getDemoLesson(
    classLevel: ClassLevel, 
    subject: Subject, 
    topic: string, 
    globalStyle: GlobalStyle,
    isGlobalVersion: boolean = false
  ): LessonContent {
    const classNumber = classLevel.replace('class-', '');
    const baseContent = isGlobalVersion ? 'Enhanced Global Version: ' : '';
    
    return {
      explanation: `${baseContent}Welcome to our ${topic} lesson for Class ${classNumber}! Let's explore this exciting topic together using ${globalStyle} teaching methods. This lesson is specially designed for Indian students with examples they can relate to.${isGlobalVersion ? '\n\n## International Perspectives\n\nAround the world, students learn about ' + topic + ' in fascinating ways:\n\n• **China**: Emphasizes systematic practice and repetition\n• **Japan**: Focuses on detailed observation and respect for process\n• **USA**: Encourages questioning and hands-on exploration\n• **Europe**: Integrates creative expression and collaborative learning\n\n## Global Best Practices\n\nInternational research shows that effective ' + topic + ' education includes:\n• Multi-sensory learning approaches\n• Cultural context integration\n• Real-world applications\n• Student-centered discovery' : ''}`,
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
          question: isGlobalVersion ? `How do students in other countries learn about ${topic}?` : `What makes ${topic} interesting to learn?`,
          options: isGlobalVersion ? ['Same as India', 'Different methods worldwide', 'Only in English', 'Not taught elsewhere'] : ['It\'s boring', 'It\'s challenging but fun', 'Too difficult', 'Not useful'],
          correct: isGlobalVersion ? 1 : 1
        }
      ],
      activity: `${isGlobalVersion ? 'Global Activity: ' : ''}Let's create a hands-on activity about ${topic} using common materials available in Indian classrooms. Students can work in groups to explore and discover!${isGlobalVersion ? ' This activity is inspired by international teaching methods and can be adapted using techniques from different countries.' : ''}`,
      globalMethod: `Using ${globalStyle} methodology: ${this.getStyleDescription(globalStyle)}${isGlobalVersion ? '\n\nThis approach has been successfully implemented in schools worldwide and adapted for Indian classroom contexts.' : ''}`,
      hindiTranslation: {
        [topic]: `${topic} (विषय)`,
        'learning': 'सीखना',
        'students': 'छात्र',
        'activity': 'गतिविधि',
        ...(isGlobalVersion && {
          'global': 'वैश्विक',
          'international': 'अंतर्राष्ट्रीय',
          'culture': 'संस्कृति'
        })
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