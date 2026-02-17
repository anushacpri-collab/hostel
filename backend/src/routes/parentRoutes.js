import { Router } from 'express';
import { linkedStudents, requestEmergencyExtension } from '../controllers/parentController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = Router();
router.use(authenticate, authorize('PARENT'));
router.get('/students', linkedStudents);
router.post('/emergency-extension', requestEmergencyExtension);

export default router;
