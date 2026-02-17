import Joi from 'joi';
import dayjs from 'dayjs';
import { pool } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HttpError } from '../utils/httpError.js';
import { createNotification } from '../services/notificationService.js';

export const completeProfile = asyncHandler(async (req, res) => {
  await pool.execute('UPDATE students SET profile_completed=TRUE WHERE user_id=?', [req.user.id]);
  res.json({ message: 'Profile completed' });
});

export const applyLeave = asyncHandler(async (req, res) => {
  const schema = Joi.object({ fromDate: Joi.date().required(), toDate: Joi.date().required(), reason: Joi.string().required() });
  const { fromDate, toDate, reason } = await schema.validateAsync(req.body);

  const [students] = await pool.execute('SELECT id, parent_user_id FROM students WHERE user_id=?', [req.user.id]);
  if (!students.length) throw new HttpError(404, 'Student not found');
  const student = students[0];

  const days = dayjs(toDate).diff(dayjs(fromDate), 'day') + 1;
  const status = days > 15 ? 'PENDING_PRINCIPAL' : 'PENDING_DW';

  const [result] = await pool.execute(
    'INSERT INTO leave_requests (student_id, from_date, to_date, reason, status) VALUES (?, ?, ?, ?, ?)',
    [student.id, fromDate, toDate, reason, status]
  );

  await createNotification(student.parent_user_id, 'Leave application submitted', `Request #${result.insertId} submitted.`);

  res.status(201).json({ id: result.insertId, status });
});

export const myLeaves = asyncHandler(async (req, res) => {
  const [rows] = await pool.execute(
    `SELECT lr.* FROM leave_requests lr
     INNER JOIN students s ON s.id = lr.student_id WHERE s.user_id=? ORDER BY lr.created_at DESC`,
    [req.user.id]
  );
  res.json(rows);
});

export const getQr = asyncHandler(async (req, res) => {
  const [rows] = await pool.execute(
    `SELECT qp.qr_token, qp.valid_from, qp.valid_to FROM qr_passes qp
     INNER JOIN students s ON s.id = qp.student_id
     WHERE s.user_id=? ORDER BY qp.id DESC LIMIT 1`,
    [req.user.id]
  );
  if (!rows.length) throw new HttpError(404, 'No active QR pass');
  res.json(rows[0]);
});
