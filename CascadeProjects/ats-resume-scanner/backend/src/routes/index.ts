import { Router } from 'express';
import authRoutes from './auth.routes';
import resumeRoutes from './resume.routes';
import jobDescriptionRoutes from './jobDescription.routes';
import atsRoutes from './ats.routes';
import adminRoutes from './admin.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/resumes', resumeRoutes);
router.use('/job-descriptions', jobDescriptionRoutes);
router.use('/ats', atsRoutes);
router.use('/admin', adminRoutes);

router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
