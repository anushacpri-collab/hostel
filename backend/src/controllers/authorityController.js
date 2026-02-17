import Joi from 'joi';
import { pool } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { createQrPayload, encodeQr } from '../services/qrService.js';
import { createNotification } from '../services/notificationService.js';

export const listLeaves = asyncHandler(async (_req, res) => {
  const [rows] = await pool.execute(
    `SELECT lr.id, s.name, s.college_id, lr.from_date, lr.to_date, lr.reason, lr.status
     FROM leave_requests lr INNER JOIN students s ON s.id = lr.student_id
     ORDER BY lr.created_at DESC`
  );
  res.json(rows);
});

export const deputyDecision = asyncHandler(async (req, res) => {
  const schema = Joi.object({ leaveRequestId: Joi.number().required(), action: Joi.string().valid('APPROVE', 'REJECT').required(), note: Joi.string().allow('') });
  const { leaveRequestId, action, note } = await schema.validateAsync(req.body);

  if (action === 'APPROVE') {
    await pool.execute("UPDATE leave_requests SET status='APPROVED', deputy_warden_note=? WHERE id=?", [note, leaveRequestId]);

    const [leaves] = await pool.execute('SELECT student_id FROM leave_requests WHERE id=?', [leaveRequestId]);
    const studentId = leaves[0].student_id;
    const payload = createQrPayload(studentId, leaveRequestId);
    await pool.execute(
      'INSERT INTO qr_passes (leave_request_id, student_id, qr_token, valid_from, valid_to) VALUES (?, ?, ?, ?, ?)',
      [leaveRequestId, studentId, payload.token, payload.validFrom, payload.validTo]
    );

    const [studentRows] = await pool.execute('SELECT parent_user_id FROM students WHERE id=?', [studentId]);
    await createNotification(studentRows[0].parent_user_id, 'Leave approved', `Leave #${leaveRequestId} approved.`);

    return res.json({ message: 'Approved', qrCodeDataUrl: await encodeQr(payload) });
  }

  await pool.execute("UPDATE leave_requests SET status='REJECTED', deputy_warden_note=? WHERE id=?", [note, leaveRequestId]);
  res.json({ message: 'Rejected' });
});

export const principalDecision = asyncHandler(async (req, res) => {
  const schema = Joi.object({ leaveRequestId: Joi.number().required(), action: Joi.string().valid('APPROVE', 'REJECT').required(), note: Joi.string().allow('') });
  const { leaveRequestId, action, note } = await schema.validateAsync(req.body);

  const nextStatus = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';
  await pool.execute('UPDATE leave_requests SET status=?, principal_note=? WHERE id=?', [nextStatus, note, leaveRequestId]);
  res.json({ message: `Principal ${nextStatus.toLowerCase()} leave` });
});

export const gateLogs = asyncHandler(async (_req, res) => {
  const [rows] = await pool.execute('SELECT * FROM gate_logs ORDER BY created_at DESC LIMIT 500');
  res.json(rows);
});
