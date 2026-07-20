import { Router } from 'express';
import { body } from 'express-validator';
import { atsController } from '../controllers';
import { authenticate } from '../middleware';
import { validateRequest } from '../middleware';

const router = Router();

router.post(
  '/rewrite',
  authenticate,
  [
    body('section').notEmpty().withMessage('Section required'),
    body('currentText').notEmpty().withMessage('Current text required'),
  ],
  validateRequest,
  atsController.rewriteSection
);

router.post(
  '/interview-questions',
  authenticate,
  [
    body('resumeText').notEmpty().withMessage('Resume text required'),
    body('jobDescription').notEmpty().withMessage('Job description required'),
  ],
  validateRequest,
  atsController.generateInterviewQuestions
);

router.post(
  '/cover-letter',
  authenticate,
  [
    body('resumeText').notEmpty().withMessage('Resume text required'),
    body('jobDescription').notEmpty().withMessage('Job description required'),
  ],
  validateRequest,
  atsController.generateCoverLetter
);

router.post(
  '/career-suggestions',
  authenticate,
  [
    body('resumeText').notEmpty().withMessage('Resume text required'),
    body('skills').isArray().withMessage('Skills must be an array'),
  ],
  validateRequest,
  atsController.generateCareerSuggestions
);

router.post(
  '/compare',
  authenticate,
  [
    body('resumeAText').notEmpty().withMessage('Resume A text required'),
    body('resumeBText').notEmpty().withMessage('Resume B text required'),
  ],
  validateRequest,
  atsController.compareResumes
);

export default router;
