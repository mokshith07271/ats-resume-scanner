import { Router } from 'express';
import { body } from 'express-validator';
import { authController } from '../controllers';
import { authenticate } from '../middleware';
import { validateRequest } from '../middleware';

const router = Router();

router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  validateRequest,
  authController.register
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password required'),
  ],
  validateRequest,
  authController.login
);

router.post(
  '/google',
  [body('idToken').notEmpty().withMessage('ID token required')],
  validateRequest,
  authController.googleLogin
);

router.get('/profile', authenticate, authController.getProfile);

router.put(
  '/profile',
  authenticate,
  [body('name').optional().isString(), body('photo').optional().isString()],
  validateRequest,
  authController.updateProfile
);

router.put(
  '/change-password',
  authenticate,
  [
    body('currentPassword').notEmpty().withMessage('Current password required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
  ],
  validateRequest,
  authController.changePassword
);

router.delete('/account', authenticate, authController.deleteAccount);

export default router;
