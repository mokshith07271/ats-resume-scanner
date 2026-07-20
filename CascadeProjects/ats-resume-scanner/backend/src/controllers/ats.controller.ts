import { Response } from 'express';
import { atsService } from '../services';
import { AuthRequest } from '../middleware';

export class ATSController {
  async rewriteSection(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { section, currentText, jobDescription } = req.body;
      const rewritten = await atsService.rewriteSection(
        section,
        currentText,
        jobDescription
      );
      res.status(200).json({ rewritten });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async generateInterviewQuestions(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { resumeText, jobDescription, difficulty } = req.body;
      const questions = await atsService.generateInterviewQuestions(
        resumeText,
        jobDescription,
        difficulty
      );
      res.status(200).json({ questions });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async generateCoverLetter(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { resumeText, jobDescription, userName } = req.body;
      const coverLetter = await atsService.generateCoverLetter(
        resumeText,
        jobDescription,
        userName
      );
      res.status(200).json({ coverLetter });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async generateCareerSuggestions(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { resumeText, skills } = req.body;
      const suggestions = await atsService.generateCareerSuggestions(resumeText, skills);
      res.status(200).json({ suggestions });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async compareResumes(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { resumeAText, resumeBText } = req.body;
      const comparison = await atsService.compareResumes(resumeAText, resumeBText);
      res.status(200).json(comparison);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}

export default new ATSController();
