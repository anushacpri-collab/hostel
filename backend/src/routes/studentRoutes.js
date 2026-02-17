import { Router } from 'express';
import { applyLeave, completeProfile, getQr, myLeaves } from '../controllers/studentController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { ensureStudentUnlocked } from '../middleware/studentGate.js';

const router = Router();
router.use(authenticate, authorize('STUDENT'), ensureStudentUnlocked);
router.post('/profile/complete', completeProfile);
router.post('/leave/apply', applyLeave);
router.get('/leave', myLeaves);
router.get('/qr', getQr);

export default router;
