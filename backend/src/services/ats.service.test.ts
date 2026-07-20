import { ATSService } from './ats.service';
import { openai } from '../config/openai';

jest.mock('../config/openai');

describe('ATSService', () => {
  let atsService: ATSService;

  beforeEach(() => {
    atsService = new ATSService();
    jest.clearAllMocks();
  });

  describe('calculateATSScore', () => {
    it('should calculate ATS score for resume', () => {
      const resumeData = {
        skills: ['JavaScript', 'React', 'Node.js'],
        experience: [{ title: 'Software Engineer', company: 'Tech Corp' }],
        education: [{ degree: 'BS Computer Science', school: 'University' }]
      };

      const jobKeywords = ['JavaScript', 'React', 'TypeScript', 'Node.js'];

      const result = atsService.calculateATSScore(resumeData, jobKeywords);

      expect(result).toHaveProperty('overallScore');
      expect(result).toHaveProperty('formattingScore');
      expect(result).toHaveProperty('keywordScore');
      expect(result).toHaveProperty('skillScore');
      expect(result.overallScore).toBeGreaterThanOrEqual(0);
      expect(result.overallScore).toBeLessThanOrEqual(100);
    });
  });

  describe('analyzeResume', () => {
    it('should analyze resume with AI', async () => {
      const resumeData = {
        name: 'John Doe',
        skills: ['JavaScript', 'React'],
        experience: 'Software Engineer at Tech Corp'
      };

      (openai.chat.completions.create as jest.Mock).mockResolvedValue({
        choices: [{
          message: {
            content: JSON.stringify({
              missingKeywords: ['TypeScript'],
              weakBulletPoints: ['Improved performance'],
              grammarSuggestions: ['Use active voice']
            })
          }
        }]
      });

      const result = await atsService.analyzeResume(resumeData);

      expect(result).toHaveProperty('missingKeywords');
      expect(result).toHaveProperty('weakBulletPoints');
      expect(result).toHaveProperty('grammarSuggestions');
    });
  });

  describe('rewriteSection', () => {
    it('should rewrite resume section', async () => {
      const section = 'summary';
      const content = 'Experienced software engineer';

      (openai.chat.completions.create as jest.Mock).mockResolvedValue({
        choices: [{
          message: {
            content: JSON.stringify({
              rewritten: 'Results-driven software engineer with proven track record',
              improvements: ['Added action verbs', 'More impactful language']
            })
          }
        }]
      });

      const result = await atsService.rewriteSection(section, content);

      expect(result).toHaveProperty('rewritten');
      expect(result).toHaveProperty('improvements');
    });
  });
});
