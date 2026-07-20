import { Response } from 'express';
import { userRepository, resumeRepository, scanRepository } from '../repositories';
import { AuthRequest } from '../middleware';

export class AdminController {
  async getStats(_req: AuthRequest, res: Response): Promise<void> {
    try {
      const userCount = await userRepository.count();
      const resumeCount = await resumeRepository.count();
      const scanCount = await scanRepository.count();
      const avgScore = await scanRepository.getAverageScore();

      res.status(200).json({
        totalUsers: userCount,
        totalResumes: resumeCount,
        totalScans: scanCount,
        averageScore: avgScore || 0,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getAllUsers(req: AuthRequest, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const users = await userRepository.findAllPaginated(page, limit);
      res.status(200).json(users);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateUserRole(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { role } = req.body;
      const user = await userRepository.update(id, { role });
      res.status(200).json(user);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}

export default new AdminController();
