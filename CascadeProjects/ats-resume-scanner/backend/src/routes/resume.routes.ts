import { Router } from 'express';
import { resumeController } from '../controllers';
import { authenticate } from '../middleware';

const router = Router();

router.post('/upload', authenticate, resumeController.upload);
router.get('/', authenticate, resumeController.getUserResumes);
router.get('/:id', authenticate, resumeController.getResumeById);
router.delete('/:id', authenticate, resumeController.deleteResume);
router.post('/:id/scan', authenticate, resumeController.scanResume);

export default router;
