import { v4 as uuidv4 } from 'uuid';
import QRCode from 'qrcode';
import dayjs from 'dayjs';
import { env } from '../config/env.js';

export const createQrPayload = (studentId, leaveRequestId) => {
  const token = uuidv4();
  const validFrom = dayjs().format('YYYY-MM-DD HH:mm:ss');
  const validTo = dayjs().add(env.qrTtlMinutes, 'minute').format('YYYY-MM-DD HH:mm:ss');
  return { token, studentId, leaveRequestId, validFrom, validTo };
};

export const encodeQr = async (payload) => {
  const text = JSON.stringify(payload);
  return QRCode.toDataURL(text, { margin: 1, width: 300 });
};
