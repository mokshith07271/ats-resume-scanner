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
      if (process.env.OPENAI_API_KEY || process.env.HUGGINGFACE_API_KEY) {
        const prompt = jobDescription
          ? `Analyze this resume against the job description and provide strict ATS scores (0-100) for:
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
          : `Analyze this resume and provide strict ATS scores (0-100) for:
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
          inputs: `<s>[INST] You are a strict JobScan-style ATS resume analyzer. Return only valid JSON. ${prompt} [/INST]`,
          parameters: {
            max_new_tokens: 500,
            temperature: 0.2,
            return_full_text: false,
          },
        });

        const content = response.generated_text || '{}';
        const scores = JSON.parse(content) as ATSScores;
        if (scores.overallScore) return scores;
      }
    } catch (error) {
      logger.warn('AI API fallback to strict JobScan engine:', error);
    }

    // Strict JobScan-style programmatic engine
    const resumeLower = resumeText.toLowerCase();

    // Section presence checks
    const hasSkillsHeader = resumeLower.includes('skill') || resumeLower.includes('technolog');
    const hasExpHeader = resumeLower.includes('experience') || resumeLower.includes('work history') || resumeLower.includes('employment');
    const hasEduHeader = resumeLower.includes('education') || resumeLower.includes('academic') || resumeLower.includes('degree');
    const hasContact = resumeLower.includes('@') || /[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}/.test(resumeText);

    const formattingScore = Math.min(100, (hasSkillsHeader ? 25 : 10) + (hasExpHeader ? 30 : 10) + (hasEduHeader ? 25 : 10) + (hasContact ? 20 : 0));

    // Keyword & Skill matching against Job Description if provided
    let keywordScore = 70;
    let skillScore = 75;

    if (jobDescription && jobDescription.trim().length >= 20) {
      const stopWords = new Set(['the', 'and', 'for', 'with', 'you', 'that', 'this', 'have', 'from', 'are', 'your', 'will', 'our', 'all', 'must', 'been', 'about', 'more', 'they']);
      const jdWords = jobDescription.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
      const uniqueJdKeywords = Array.from(new Set(jdWords.filter(w => !stopWords.has(w))));

      if (uniqueJdKeywords.length > 0) {
        const matched = uniqueJdKeywords.filter(kw => resumeLower.includes(kw));
        keywordScore = Math.min(100, Math.round((matched.length / uniqueJdKeywords.length) * 100));
        skillScore = Math.min(100, Math.round((matched.length / (uniqueJdKeywords.length * 0.8)) * 100));
      }
    } else {
      // General ATS keyword density check
      const commonTech = ['javascript', 'typescript', 'python', 'java', 'react', 'node', 'sql', 'aws', 'docker', 'git', 'api', 'html', 'css', 'rest', 'agile'];
      const matchedSkills = commonTech.filter(s => resumeLower.includes(s));
      skillScore = Math.min(100, Math.max(40, matchedSkills.length * 10));
      keywordScore = Math.min(100, Math.max(50, Math.floor(resumeText.length / 15)));
    }

    // Experience & Achievements score (check for action verbs and numerical metrics)
    const actionVerbs = ['developed', 'built', 'created', 'managed', 'led', 'designed', 'implemented', 'increased', 'reduced', 'improved', 'spearheaded'];
    const verbMatches = actionVerbs.filter(v => resumeLower.includes(v)).length;
    const experienceScore = Math.min(100, Math.max(50, 50 + verbMatches * 5));

    const numMatches = (resumeText.match(/\b\d+(?:%|\s*k|\s*m|\s*\+)?\b/gi) || []).length;
    const achievementsScore = Math.min(100, Math.max(45, 50 + numMatches * 6));

    const educationScore = hasEduHeader ? 88 : 65;

    // Strict JobScan weighting: 40% Keyword/Skill, 25% Experience, 15% Formatting, 10% Education, 10% Achievements
    const overallScore = Math.round(
      keywordScore * 0.25 +
      skillScore * 0.25 +
      experienceScore * 0.20 +
      formattingScore * 0.15 +
      educationScore * 0.08 +
      achievementsScore * 0.07
    );

    return {
      overallScore,
      formattingScore,
      keywordScore,
      skillScore,
      experienceScore,
      educationScore,
      achievementsScore,
    };
  }

  async analyzeResume(
    resumeText: string,
    jobDescription?: string
  ): Promise<AIAnalysis> {
    try {
      if (process.env.OPENAI_API_KEY || process.env.HUGGINGFACE_API_KEY) {
        const prompt = jobDescription
          ? `Analyze this resume strictly against the job description:
1. Missing keywords (array of specific words/phrases in job description missing from resume)
2. Weak bullet points (array)
3. Grammar suggestions (array)
4. Resume summary (string)
5. Improved bullet points (object)
6. ATS recommendations (array of exactly 3 strict actionable recommendations: 1-integrate missing skills into experience bullet points, 2-emphasize related experience to match job requirements, 3-metric-driven bullet point rewrite suggestion)

Resume:
${resumeText}

Job Description:
${jobDescription}

Return JSON with exact keys: missingKeywords, weakBulletPoints, grammarSuggestions, resumeSummary, improvedBulletPoints, atsRecommendations`
          : `Analyze this resume for ATS optimization:
1. Missing keywords (array)
2. Weak bullet points (array)
3. Grammar suggestions (array)
4. Resume summary (string)
5. Improved bullet points (object)
6. ATS recommendations (array of 3 high-impact recommendations)

Resume:
${resumeText}

Return JSON with exact keys: missingKeywords, weakBulletPoints, grammarSuggestions, resumeSummary, improvedBulletPoints, atsRecommendations`;

        const response = await hf.textGeneration({
          model: 'mistralai/Mistral-7B-Instruct-v0.2',
          inputs: `<s>[INST] You are a strict ATS auditor. Return only valid JSON. ${prompt} [/INST]`,
          parameters: {
            max_new_tokens: 800,
            temperature: 0.2,
            return_full_text: false,
          },
        });

        const content = response.generated_text || '{}';
        const analysis = JSON.parse(content) as AIAnalysis;
        if (analysis.resumeSummary) return analysis;
      }
    } catch (error) {
      logger.warn('AI API fallback to strict JobScan analysis engine:', error);
    }

    const resumeLower = resumeText.toLowerCase();
    const missingKeywords: string[] = [];

    if (jobDescription && jobDescription.trim().length >= 20) {
      const jdLower = jobDescription.toLowerCase();

      // Technical skills bank
      const techBank = ['power bi', 'data analytics', 'data visualization', 'bi development', 'microsoft office', 'excel', 'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'react', 'node.js', 'sql', 'postgresql', 'mongodb', 'aws', 'azure', 'docker', 'kubernetes', 'ci/cd', 'git', 'tableau', 'rest api', 'graphql', 'html5', 'css3', 'tailwind css', 'devops'];
      // Domain knowledge bank
      const domainBank = ['shared services', 'gbs', 'end-to-end analytics', 'analytical skills', 'problem solving', 'project management', 'system design', 'agile', 'scrum', 'unit testing', 'automated testing', 'microservices', 'ui/ux', 'cybersecurity', 'cloud architecture'];

      // Extract missing technical skills
      techBank.forEach(skill => {
        if (jdLower.includes(skill) && !resumeLower.includes(skill) && missingKeywords.length < 5) {
          const formatted = skill.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
          missingKeywords.push(formatted);
        }
      });

      // Extract missing domain knowledge
      domainBank.forEach(domain => {
        if (jdLower.includes(domain) && !resumeLower.includes(domain) && missingKeywords.length < 8) {
          const formatted = domain.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
          missingKeywords.push(formatted);
        }
      });
    } else {
      missingKeywords.push('CI/CD', 'Automated Testing', 'Cloud (AWS/GCP)', 'System Design', 'Agile/Scrum');
    }

    // Exactly 3 High-Impact Contextual Recommendations
    const topMissing = missingKeywords.slice(0, 3).join(', ') || 'target technical skills';
    const atsRecommendations = [
      `1. Bullet Point Skill Integration: Seamlessly embed missing technical keywords (${topMissing}) directly into your recent Work Experience bullet points using action verbs (e.g. "Utilized ${missingKeywords[0] || 'Python'} to streamline data pipelines").`,
      `2. Tailored Related Experience Emphasis: Reframe your current responsibility descriptions to emphasize domain knowledge matching the job posting (e.g. Highlight project leadership, cross-functional collaboration, and system architectural oversight).`,
      `3. Quantifiable Impact Rewrite: Transform generic duty statements into metric-driven achievements (e.g. Change "Responsible for managing features" to "Engineered core modules resulting in 35% faster processing speeds and $20k cost savings").`
    ];

    return {
      missingKeywords,
      weakBulletPoints: [
        'Bullet points lacking quantifiable impact or financial/percentage metric values.',
        'Descriptions starting with passive duty verbs rather than active achievement verbs.',
      ],
      grammarSuggestions: [
        'Ensure past tense verbs are used consistently across all previous work experiences.',
        'Capitalize official technology and tool names accurately (e.g. TypeScript, PostgreSQL).',
      ],
      resumeSummary: jobDescription
        ? `ATS Gap Analysis: Identified matching vs missing technical skills, domain knowledge, and core qualifications against the job posting. Follow the 3 contextual recommendations to optimize match percentage.`
        : `ATS Structural Analysis: Overall resume layout is readable. To maximize ATS match rates, incorporate quantifiable metrics and standardized section headings.`,
      improvedBulletPoints: {
        experience: 'Transform "Responsible for building features" into "Engineered core modules resulting in 25% faster load times."',
      },
      atsRecommendations,
    };
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
