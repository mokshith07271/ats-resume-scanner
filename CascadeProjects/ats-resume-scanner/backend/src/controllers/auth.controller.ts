import { Request, Response } from 'express';
import { authService } from '../services';
import { AuthRequest } from '../middleware';

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, name } = req.body;
      const result = await authService.registerWithEmail(email, password, name);
      res.status(201).json(result);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      const result = await authService.loginWithEmail(email, password);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  async googleLogin(req: Request, res: Response): Promise<void> {
    try {
      const { idToken } = req.body;
      const result = await authService.loginWithGoogle(idToken);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  async getProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const user = await authService.getUserById(req.userId!);
      res.status(200).json(user);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  async updateProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { name, photo } = req.body;
      const user = await authService.updateUser(req.userId!, { name, photo });
      res.status(200).json(user);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }
}

export default new AuthController();
