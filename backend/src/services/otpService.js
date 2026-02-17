import dayjs from 'dayjs';
import { env } from '../config/env.js';

export const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();
export const otpExpiry = () => dayjs().add(env.otpTtlMinutes, 'minute').format('YYYY-MM-DD HH:mm:ss');

export const sendOtp = async (phone, otp) => {
  console.log(`[MOCK_SMS] OTP for ${phone}: ${otp}`);
};
