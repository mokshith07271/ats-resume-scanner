import hf from '../config/openai';
import { logger } from '../config';

export interface ATSScores {
  overallScore: number;
  formattingScore: number;
  keywordScore: number;
  skillScore: number;
  experienceScore: number;
  educationScore: number;
  achievementsScore: number;
}

export interface AIAnalysis {
  missingKeywords: string[];
  weakBulletPoints: string[];
  grammarSuggestions: string[];
  resumeSummary: string;
  improvedBulletPoints: any;
  atsRecommendations: string[];
}

export class ATSService {
  async calculateATSScore(
    resumeText: string,
    jobDescription?: string
  ): Promise<ATSScores> {
    try {
      const prompt = jobDescription
        ? `Analyze this resume against the job description and provide ATS scores (0-100) for:
1. Overall Score
2. Formatting Score
3. Keyword Score
4. Skill Score
5. Experience Score
6. Education Score
7. Achievements Score

Resume:
${resumeText}

Job Description:
${jobDescription}

Return JSON with these exact keys: overallScore, formattingScore, keywordScore, skillScore, experienceScore, educationScore, achievementsScore`
        : `Analyze this resume and provide ATS scores (0-100) for:
1. Overall Score
2. Formatting Score
3. Keyword Score
4. Skill Score
5. Experience Score
6. Education Score
7. Achievements Score

Resume:
${resumeText}

Return JSON with these exact keys: overallScore, formattingScore, keywordScore, skillScore, experienceScore, educationScore, achievementsScore`;

      const response = await hf.textGeneration({
        model: 'mistralai/Mistral-7B-Instruct-v0.2',
        inputs: `<s>[INST] You are an expert ATS resume analyzer. Return only valid JSON. ${prompt} [/INST]`,
        parameters: {
          max_new_tokens: 500,
          temperature: 0.3,
          return_full_text: false,
        },
      });

      const content = response.generated_text || '{}';
      const scores = JSON.parse(content) as ATSScores;

      return scores;
    } catch (error) {
      logger.error('ATS scoring error:', error);
      // Return default scores if AI fails
      return {
        overallScore: 50,
        formattingScore: 50,
        keywordScore: 50,
        skillScore: 50,
        experienceScore: 50,
        educationScore: 50,
        achievementsScore: 50,
      };
    }
  }

  async analyzeResume(
    resumeText: string,
    jobDescription?: string
  ): Promise<AIAnalysis> {
    try {
      const prompt = jobDescription
        ? `Analyze this resume against the job description and provide:
1. Missing keywords (array)
2. Weak bullet points (array)
3. Grammar suggestions (array)
4. Resume summary (string)
5. Improved bullet points (object with sections)
6. ATS recommendations (array)

Resume:
${resumeText}

Job Description:
${jobDescription}

Return JSON with these exact keys: missingKeywords, weakBulletPoints, grammarSuggestions, resumeSummary, improvedBulletPoints, atsRecommendations`
        : `Analyze this resume and provide:
1. Missing keywords (array)
2. Weak bullet points (array)
3. Grammar suggestions (array)
4. Resume summary (string)
5. Improved bullet points (object with sections)
6. ATS recommendations (array)

Resume:
${resumeText}

Return JSON with these exact keys: missingKeywords, weakBulletPoints, grammarSuggestions, resumeSummary, improvedBulletPoints, atsRecommendations`;

      const response = await hf.textGeneration({
        model: 'mistralai/Mistral-7B-Instruct-v0.2',
        inputs: `<s>[INST] You are an expert resume analyzer. Return only valid JSON. ${prompt} [/INST]`,
        parameters: {
          max_new_tokens: 800,
          temperature: 0.3,
          return_full_text: false,
        },
      });

      const content = response.generated_text || '{}';
      const analysis = JSON.parse(content) as AIAnalysis;

      return analysis;
    } catch (error) {
      logger.error('Resume analysis error:', error);
      return {
        missingKeywords: [],
        weakBulletPoints: [],
        grammarSuggestions: [],
        resumeSummary: '',
        improvedBulletPoints: {},
        atsRecommendations: [],
      };
    }
  }

  async rewriteSection(
    section: string,
    currentText: string,
    jobDescription?: string
  ): Promise<string> {
    try {
      const prompt = jobDescription
        ? `Rewrite this ${section} section of a resume to better match the job description. Make it more impactful and ATS-friendly.

Current ${section}:
${currentText}

Job Description:
${jobDescription}

Provide the improved ${section} text only.`
        : `Rewrite this ${section} section of a resume to make it more impactful and ATS-friendly.

Current ${section}:
${currentText}

Provide the improved ${section} text only.`;

      const response = await hf.textGeneration({
        model: 'mistralai/Mistral-7B-Instruct-v0.2',
        inputs: `<s>[INST] You are an expert resume writer. Provide only the rewritten text. ${prompt} [/INST]`,
        parameters: {
          max_new_tokens: 300,
          temperature: 0.7,
          return_full_text: false,
        },
      });

      return response.generated_text || currentText;
    } catch (error) {
      logger.error('Resume rewrite error:', error);
      return currentText;
    }
  }

  async calculateSemanticMatch(
    resumeText: string,
    jobDescription: string
  ): Promise<{
    matchPercentage: number;
    matchReasons: string[];
    missingSkills: string[];
    matchingSkills: string[];
  }> {
    try {
      const prompt = `Calculate the semantic match between this resume and job description.

Resume:
${resumeText}

Job Description:
${jobDescription}

Provide:
1. Match percentage (0-100)
2. Match reasons (array of strings)
3. Missing skills (array of strings)
4. Matching skills (array of strings)

Return JSON with these exact keys: matchPercentage, matchReasons, missingSkills, matchingSkills`;

      const response = await hf.textGeneration({
        model: 'mistralai/Mistral-7B-Instruct-v0.2',
        inputs: `<s>[INST] You are an expert in semantic matching. Return only valid JSON. ${prompt} [/INST]`,
        parameters: {
          max_new_tokens: 500,
          temperature: 0.3,
          return_full_text: false,
        },
      });

      const content = response.generated_text || '{}';
      const match = JSON.parse(content);

      return match;
    } catch (error) {
      logger.error('Semantic matching error:', error);
      return {
        matchPercentage: 50,
        matchReasons: [],
        missingSkills: [],
        matchingSkills: [],
      };
    }
  }

  async generateInterviewQuestions(
    resumeText: string,
    jobDescription: string,
    difficulty: 'Easy' | 'Medium' | 'Hard' = 'Medium'
  ): Promise<Array<{ question: string; category: string; suggestedAnswer: string }>> {
    try {
      const prompt = `Generate ${difficulty} interview questions based on this resume and job description.

Resume:
${resumeText}

Job Description:
${jobDescription}

Generate 5-10 questions with:
1. Question text
2. Category (e.g., Technical, Behavioral, Experience)
3. Suggested answer

Return JSON array with these exact keys: question, category, suggestedAnswer`;

      const response = await hf.textGeneration({
        model: 'mistralai/Mistral-7B-Instruct-v0.2',
        inputs: `<s>[INST] You are an expert interviewer. Return only valid JSON array. ${prompt} [/INST]`,
        parameters: {
          max_new_tokens: 1000,
          temperature: 0.5,
          return_full_text: false,
        },
      });

      const content = response.generated_text || '[]';
      const questions = JSON.parse(content);

      return questions;
    } catch (error) {
      logger.error('Interview question generation error:', error);
      return [];
    }
  }

  async generateCoverLetter(
    resumeText: string,
    jobDescription: string,
    userName?: string
  ): Promise<string> {
    try {
      const prompt = `Generate a professional cover letter based on this resume and job description.

Resume:
${resumeText}

Job Description:
${jobDescription}

Applicant Name: ${userName || 'Applicant'}

Generate a compelling, professional cover letter.`;

      const response = await hf.textGeneration({
        model: 'mistralai/Mistral-7B-Instruct-v0.2',
        inputs: `<s>[INST] You are an expert cover letter writer. ${prompt} [/INST]`,
        parameters: {
          max_new_tokens: 800,
          temperature: 0.7,
          return_full_text: false,
        },
      });

      return response.generated_text || '';
    } catch (error) {
      logger.error('Cover letter generation error:', error);
      return '';
    }
  }

  async generateCareerSuggestions(
    resumeText: string,
    skills: string[]
  ): Promise<
    Array<{
      type: 'Course' | 'Skill' | 'Certification' | 'Project';
      title: string;
      description: string;
      url?: string;
      priority: number;
    }>
  > {
    try {
      const prompt = `Based on this resume and skills, suggest career improvements.

Resume:
${resumeText}

Current Skills:
${skills.join(', ')}

Provide suggestions for:
1. Courses to take
2. Skills to learn
3. Certifications to obtain
4. Projects to build

Each suggestion should have:
- type (Course, Skill, Certification, or Project)
- title
- description
- priority (1-5, 5 being highest)

Return JSON array with these exact keys: type, title, description, priority`;

      const response = await hf.textGeneration({
        model: 'mistralai/Mistral-7B-Instruct-v0.2',
        inputs: `<s>[INST] You are a career advisor. Return only valid JSON array. ${prompt} [/INST]`,
        parameters: {
          max_new_tokens: 1000,
          temperature: 0.5,
          return_full_text: false,
        },
      });

      const content = response.generated_text || '[]';
      const suggestions = JSON.parse(content);

      return suggestions;
    } catch (error) {
      logger.error('Career suggestions generation error:', error);
      return [];
    }
  }

  async compareResumes(
    resumeAText: string,
    resumeBText: string
  ): Promise<{
    improvements: string[];
    scoreDifference: number;
    analysis: string;
  }> {
    try {
      const prompt = `Compare these two resumes and highlight improvements in Resume B over Resume A.

Resume A:
${resumeAText}

Resume B:
${resumeBText}

Provide:
1. Improvements in Resume B (array of strings)
2. Estimated score difference (number)
3. Detailed analysis (string)

Return JSON with these exact keys: improvements, scoreDifference, analysis`;

      const response = await hf.textGeneration({
        model: 'mistralai/Mistral-7B-Instruct-v0.2',
        inputs: `<s>[INST] You are an expert resume reviewer. Return only valid JSON. ${prompt} [/INST]`,
        parameters: {
          max_new_tokens: 800,
          temperature: 0.3,
          return_full_text: false,
        },
      });

      const content = response.generated_text || '{}';
      const comparison = JSON.parse(content);

      return comparison;
    } catch (error) {
      logger.error('Resume comparison error:', error);
      return {
        improvements: [],
        scoreDifference: 0,
        analysis: '',
      };
    }
  }
}

export const atsService = new ATSService();
export default atsService;
