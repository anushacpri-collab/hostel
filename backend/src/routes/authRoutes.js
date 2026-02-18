import { Router } from 'express';
import { loginParentPhone, loginStaff, loginStudent, registerStudent, verifyParentOtp } from '../controllers/authController.js';

const router = Router();
router.post('/student/register', registerStudent);
router.post('/student/login', loginStudent);
router.post('/parent/login-phone', loginParentPhone);
router.post('/parent/verify-otp', verifyParentOtp);
router.post('/staff/login', loginStaff);

export default router;
