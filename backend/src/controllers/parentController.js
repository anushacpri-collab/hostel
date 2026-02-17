import Joi from 'joi';
import { pool } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const linkedStudents = asyncHandler(async (req, res) => {
  const [rows] = await pool.execute(
    `SELECT s.college_id, s.name, s.department, s.profile_completed
     FROM students s WHERE s.parent_user_id = ?`,
    [req.user.id]
  );
  res.json(rows);
});

export const requestEmergencyExtension = asyncHandler(async (req, res) => {
  const schema = Joi.object({ leaveRequestId: Joi.number().required() });
  const { leaveRequestId } = await schema.validateAsync(req.body);

  await pool.execute('UPDATE leave_requests SET emergency_extension_requested=TRUE WHERE id=?', [leaveRequestId]);
  res.json({ message: 'Emergency extension requested' });
});
