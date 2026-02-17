import { Router } from 'express';
import { loginParentPhone, loginStudent, registerStudent, verifyParentOtp } from '../controllers/authController.js';

const router = Router();
router.post('/student/register', registerStudent);
router.post('/student/login', loginStudent);
router.post('/parent/login-phone', loginParentPhone);
router.post('/parent/verify-otp', verifyParentOtp);

export default router;
