import { Router } from 'express';
import { validateScan } from '../controllers/watchmanController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = Router();
router.use(authenticate, authorize('WATCHMAN'));
router.post('/scan', validateScan);

export default router;
