import { pool } from '../config/db.js';
import { HttpError } from '../utils/httpError.js';

export const ensureStudentUnlocked = async (req, _res, next) => {
  const [rows] = await pool.execute(
    `SELECT s.account_locked, s.profile_completed, u.is_active
     FROM students s
     INNER JOIN users u ON u.id = s.user_id
     WHERE s.user_id = ?`,
    [req.user.id]
  );

  if (!rows.length) throw new HttpError(404, 'Student not found');
  const student = rows[0];

  if (!student.is_active || student.account_locked) {
    throw new HttpError(423, 'Parent verification pending. Student account is locked');
  }

  next();
};
