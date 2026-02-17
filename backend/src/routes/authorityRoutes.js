import { Router } from 'express';
import { deputyDecision, gateLogs, listLeaves, principalDecision } from '../controllers/authorityController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = Router();
router.get('/leaves', authenticate, authorize('DEPUTY_WARDEN', 'PRINCIPAL'), listLeaves);
router.post('/deputy/decision', authenticate, authorize('DEPUTY_WARDEN'), deputyDecision);
router.post('/principal/decision', authenticate, authorize('PRINCIPAL'), principalDecision);
router.get('/gate-logs', authenticate, authorize('DEPUTY_WARDEN', 'PRINCIPAL'), gateLogs);

export default router;
