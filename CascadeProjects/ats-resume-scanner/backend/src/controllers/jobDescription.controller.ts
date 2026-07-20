import { Response } from 'express';
import { jobDescriptionService } from '../services';
import { AuthRequest } from '../middleware';

export class JobDescriptionController {
  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const jobDescription = await jobDescriptionService.createJobDescription(
        req.userId!,
        req.body
      );
      res.status(201).json(jobDescription);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  async getUserJobDescriptions(req: AuthRequest, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const result = await jobDescriptionService.getUserJobDescriptions(
        req.userId!,
        page,
        limit
      );
      res.status(200).json(result);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  async getById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const jobDescription = await jobDescriptionService.getJobDescriptionById(
        id,
        req.userId!
      );
      res.status(200).json(jobDescription);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const jobDescription = await jobDescriptionService.updateJobDescription(
        id,
        req.userId!,
        req.body
      );
      res.status(200).json(jobDescription);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await jobDescriptionService.deleteJobDescription(id, req.userId!);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }
}

export default new JobDescriptionController();
