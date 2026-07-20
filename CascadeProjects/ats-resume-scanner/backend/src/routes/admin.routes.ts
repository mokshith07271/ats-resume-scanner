import { Router } from 'express';
import { adminController } from '../controllers';
import { authenticate, authorizeAdmin } from '../middleware';

const router = Router();

router.get('/stats', authenticate, authorizeAdmin, adminController.getStats);
router.get('/users', authenticate, authorizeAdmin, adminController.getAllUsers);
router.put('/users/:id/role', authenticate, authorizeAdmin, adminController.updateUserRole);

export default router;
