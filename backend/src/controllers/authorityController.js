import Joi from 'joi';
import dayjs from 'dayjs';
import { pool } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HttpError } from '../utils/httpError.js';
import { createQrPayload, encodeQr } from '../services/qrService.js';
import { createNotification } from '../services/notificationService.js';

export const listLeaves = asyncHandler(async (_req, res) => {
  const [rows] = await pool.execute(
    `SELECT lr.id, s.name, s.college_id, lr.from_date, lr.to_date, lr.reason, lr.status,
            lr.emergency_extension_requested, lr.deputy_warden_note, lr.principal_note
     FROM leave_requests lr INNER JOIN students s ON s.id = lr.student_id
     ORDER BY lr.created_at DESC`
  );
  res.json(rows);
});

const createPassAndNotify = async (leaveRequestId, studentId) => {
  const payload = createQrPayload(studentId, leaveRequestId);
  await pool.execute(
    'INSERT INTO qr_passes (leave_request_id, student_id, qr_token, valid_from, valid_to) VALUES (?, ?, ?, ?, ?)',
    [leaveRequestId, studentId, payload.token, payload.validFrom, payload.validTo]
  );

  const [studentRows] = await pool.execute('SELECT parent_user_id FROM students WHERE id=?', [studentId]);
  await createNotification(studentRows[0].parent_user_id, 'Leave approved', `Leave #${leaveRequestId} approved.`);

  return encodeQr(payload);
};

export const deputyDecision = asyncHandler(async (req, res) => {
  const schema = Joi.object({ leaveRequestId: Joi.number().required(), action: Joi.string().valid('APPROVE', 'REJECT').required(), note: Joi.string().allow('') });
  const { leaveRequestId, action, note } = await schema.validateAsync(req.body);

  const [rows] = await pool.execute('SELECT id, student_id, status, from_date, to_date FROM leave_requests WHERE id=?', [leaveRequestId]);
  if (!rows.length) throw new HttpError(404, 'Leave request not found');
  const leave = rows[0];

  const days = dayjs(leave.to_date).diff(dayjs(leave.from_date), 'day') + 1;
  if (days > 15) {
    throw new HttpError(400, 'Leaves above 15 days must be decided by Principal');
  }

  if (action === 'APPROVE') {
    await pool.execute("UPDATE leave_requests SET status='APPROVED', deputy_warden_note=? WHERE id=?", [note, leaveRequestId]);
    const qrCodeDataUrl = await createPassAndNotify(leaveRequestId, leave.student_id);
    return res.json({ message: 'Approved', qrCodeDataUrl });
  }

  await pool.execute("UPDATE leave_requests SET status='REJECTED', deputy_warden_note=? WHERE id=?", [note, leaveRequestId]);
  res.json({ message: 'Rejected' });
});

export const principalDecision = asyncHandler(async (req, res) => {
  const schema = Joi.object({ leaveRequestId: Joi.number().required(), action: Joi.string().valid('APPROVE', 'REJECT').required(), note: Joi.string().allow('') });
  const { leaveRequestId, action, note } = await schema.validateAsync(req.body);

  const [rows] = await pool.execute('SELECT id, student_id FROM leave_requests WHERE id=?', [leaveRequestId]);
  if (!rows.length) throw new HttpError(404, 'Leave request not found');

  const nextStatus = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';
  await pool.execute('UPDATE leave_requests SET status=?, principal_note=? WHERE id=?', [nextStatus, note, leaveRequestId]);

  if (action === 'APPROVE') {
    const qrCodeDataUrl = await createPassAndNotify(leaveRequestId, rows[0].student_id);
    return res.json({ message: 'Principal approved leave', qrCodeDataUrl });
  }

  res.json({ message: 'Principal rejected leave' });
});

export const emergencyDecision = asyncHandler(async (req, res) => {
  const schema = Joi.object({ leaveRequestId: Joi.number().required(), action: Joi.string().valid('APPROVE', 'REJECT').required(), note: Joi.string().allow('') });
  const { leaveRequestId, action, note } = await schema.validateAsync(req.body);

  const [rows] = await pool.execute(
    'SELECT id, student_id, emergency_extension_requested FROM leave_requests WHERE id=?',
    [leaveRequestId]
  );
  if (!rows.length) throw new HttpError(404, 'Leave request not found');
  if (!rows[0].emergency_extension_requested) throw new HttpError(400, 'No emergency extension requested');

  const status = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';
  await pool.execute(
    'UPDATE leave_requests SET status=?, deputy_warden_note=CONCAT(IFNULL(deputy_warden_note,\'\'), ?), emergency_extension_requested=FALSE WHERE id=?',
    [`${status}`, ` | Emergency:${action}:${note}`, leaveRequestId]
  );

  res.json({ message: `Emergency extension ${action.toLowerCase()}d` });
});

export const gateLogs = asyncHandler(async (_req, res) => {
  const [rows] = await pool.execute('SELECT * FROM gate_logs ORDER BY created_at DESC LIMIT 500');
  res.json(rows);
});
