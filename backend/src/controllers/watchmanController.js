import Joi from 'joi';
import dayjs from 'dayjs';
import { pool } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const extractToken = (raw) => {
  try {
    const parsed = JSON.parse(raw);
    return parsed.token || raw;
  } catch {
    return raw;
  }
};

export const validateScan = asyncHandler(async (req, res) => {
  const schema = Joi.object({ qrToken: Joi.string().required(), action: Joi.string().valid('EXIT', 'ENTRY').required() });
  const { qrToken, action } = await schema.validateAsync(req.body);
  const token = extractToken(qrToken);

  const [rows] = await pool.execute(
    `SELECT id, valid_from, valid_to, used_exit, used_entry
     FROM qr_passes WHERE qr_token=?`,
    [token]
  );

  let result = 'ALLOWED';
  let reason = null;

  if (!rows.length) {
    result = 'DENIED';
    reason = 'Invalid token';
  } else {
    const pass = rows[0];
    const now = dayjs();

    if (now.isBefore(dayjs(pass.valid_from)) || now.isAfter(dayjs(pass.valid_to))) {
      result = 'DENIED';
      reason = 'QR expired/outside leave window';
    } else if (action === 'EXIT' && pass.used_exit) {
      result = 'DENIED';
      reason = 'Exit already used';
    } else if (action === 'ENTRY' && !pass.used_exit) {
      result = 'DENIED';
      reason = 'Exit not used yet';
    } else if (action === 'ENTRY' && pass.used_entry) {
      result = 'DENIED';
      reason = 'Entry already used';
    }

    if (result === 'ALLOWED') {
      if (action === 'EXIT') await pool.execute('UPDATE qr_passes SET used_exit=TRUE WHERE id=?', [pass.id]);
      if (action === 'ENTRY') await pool.execute('UPDATE qr_passes SET used_entry=TRUE WHERE id=?', [pass.id]);
    }

    await pool.execute(
      'INSERT INTO gate_logs (qr_pass_id, watchman_user_id, action, result, reason) VALUES (?, ?, ?, ?, ?)',
      [pass.id, req.user.id, action, result, reason]
    );
  }

  res.json({ result, reason });
});
