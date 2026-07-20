import { Router } from 'express';
import { body } from 'express-validator';
import { jobDescriptionController } from '../controllers';
import { authenticate } from '../middleware';
import { validateRequest } from '../middleware';

const router = Router();

router.post(
  '/',
  authenticate,
  [
    body('title').notEmpty().withMessage('Title required'),
    body('description').notEmpty().withMessage('Description required'),
  ],
  validateRequest,
  jobDescriptionController.create
);

router.get('/', authenticate, jobDescriptionController.getUserJobDescriptions);
router.get('/:id', authenticate, jobDescriptionController.getById);
router.put('/:id', authenticate, jobDescriptionController.update);
router.delete('/:id', authenticate, jobDescriptionController.delete);

export default router;
