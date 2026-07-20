import { Response } from 'express';
import { resumeService } from '../services';
import { AuthRequest } from '../middleware';
import { uploadSingle } from '../utils';

export class ResumeController {
  async upload(req: AuthRequest, res: Response): Promise<void> {
    uploadSingle(req, res, async (err: any) => {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }

      if (!req.file) {
        res.status(400).json({ error: 'No file uploaded' });
        return;
      }

      try {
        const fileType = req.file.mimetype;
        const jobDescription = req.body.jobDescription || req.body.jobDescriptionText;
        const resume = await resumeService.uploadResume(
          req.userId!,
          req.file,
          fileType,
          jobDescription
        );
        res.status(201).json(resume);
      } catch (error: any) {
        res.status(error.statusCode || 500).json({ error: error.message });
      }
    });
  }

  async getUserResumes(req: AuthRequest, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const result = await resumeService.getUserResumes(req.userId!, page, limit);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  async getResumeById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const resume = await resumeService.getResumeById(id, req.userId!);
      res.status(200).json(resume);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  async deleteResume(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await resumeService.deleteResume(id, req.userId!);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  async scanResume(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { jobDescriptionId } = req.body;
      const scan = await resumeService.scanResume(id, req.userId!, jobDescriptionId);
      res.status(200).json(scan);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }
}

export default new ResumeController();
