import Joi from 'joi';
import { pool } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HttpError } from '../utils/httpError.js';
import { generateOtp, otpExpiry, sendOtp } from '../services/otpService.js';
import { signToken, comparePassword, hashPassword } from '../services/authService.js';

export const registerStudent = asyncHandler(async (req, res) => {
  const schema = Joi.object({
    collegeId: Joi.string().required(),
    name: Joi.string().required(),
    department: Joi.string().required(),
    parentPhone: Joi.string().required(),
    password: Joi.string().min(6).required()
  });
  const body = await schema.validateAsync(req.body);

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [existingStudent] = await conn.execute('SELECT id FROM students WHERE college_id=? LIMIT 1', [body.collegeId]);
    if (existingStudent.length) throw new HttpError(409, 'College ID already registered');

    const [existingParent] = await conn.execute("SELECT id, role FROM users WHERE phone=? LIMIT 1", [body.parentPhone]);

    let parentUserId;
    if (existingParent.length) {
      if (existingParent[0].role !== 'PARENT') {
        throw new HttpError(409, 'Phone number is already linked with a non-parent account');
      }
      parentUserId = existingParent[0].id;
    } else {
      const [parentInsert] = await conn.execute(
        "INSERT INTO users (role, phone, is_active) VALUES ('PARENT', ?, FALSE)",
        [body.parentPhone]
      );
      parentUserId = parentInsert.insertId;
    }

    const [studentUserInsert] = await conn.execute(
      "INSERT INTO users (role, password_hash, is_active) VALUES ('STUDENT', ?, FALSE)",
      [await hashPassword(body.password)]
    );

    await conn.execute(
      `INSERT INTO students (user_id, college_id, name, department, parent_user_id, account_locked)
       VALUES (?, ?, ?, ?, ?, TRUE)`,
      [studentUserInsert.insertId, body.collegeId, body.name, body.department, parentUserId]
    );

    const otp = generateOtp();
    await conn.execute(
      'INSERT INTO parent_otps (parent_user_id, otp_code, expires_at) VALUES (?, ?, ?)',
      [parentUserId, otp, otpExpiry()]
    );

    await conn.commit();
    await sendOtp(body.parentPhone, otp);

    res.status(201).json({ message: 'Student registered. Parent verification required to unlock account.' });
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
});

export const loginStudent = asyncHandler(async (req, res) => {
  const schema = Joi.object({ collegeId: Joi.string().required(), password: Joi.string().required() });
  const { collegeId, password } = await schema.validateAsync(req.body);

  const [rows] = await pool.execute(
    `SELECT u.id, u.password_hash, u.is_active, s.account_locked
     FROM students s INNER JOIN users u ON u.id = s.user_id WHERE s.college_id=? LIMIT 1`,
    [collegeId]
  );

  if (!rows.length) throw new HttpError(401, 'Invalid credentials');
  const student = rows[0];
  const ok = await comparePassword(password, student.password_hash);
  if (!ok) throw new HttpError(401, 'Invalid credentials');

  if (!student.is_active || student.account_locked) {
    return res.status(423).json({ message: 'Account locked until parent OTP verification' });
  }

  const token = signToken({ id: student.id, role: 'STUDENT' });
  res.json({ token });
});

export const loginParentPhone = asyncHandler(async (req, res) => {
  const schema = Joi.object({ phone: Joi.string().required() });
  const { phone } = await schema.validateAsync(req.body);

  const [rows] = await pool.execute("SELECT id FROM users WHERE role='PARENT' AND phone=?", [phone]);
  if (!rows.length) throw new HttpError(404, 'Parent not found');

  const otp = generateOtp();
  await pool.execute('INSERT INTO parent_otps (parent_user_id, otp_code, expires_at) VALUES (?, ?, ?)', [
    rows[0].id,
    otp,
    otpExpiry()
  ]);

  await sendOtp(phone, otp);
  res.json({ message: 'OTP sent' });
});

export const verifyParentOtp = asyncHandler(async (req, res) => {
  const schema = Joi.object({ phone: Joi.string().required(), otp: Joi.string().length(6).required() });
  const { phone, otp } = await schema.validateAsync(req.body);

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [parents] = await conn.execute("SELECT id FROM users WHERE role='PARENT' AND phone=?", [phone]);
    if (!parents.length) throw new HttpError(404, 'Parent not found');
    const parentId = parents[0].id;

    const [otpRows] = await conn.execute(
      `SELECT id FROM parent_otps
       WHERE parent_user_id=? AND otp_code=? AND verified=FALSE AND expires_at > NOW()
       ORDER BY id DESC LIMIT 1`,
      [parentId, otp]
    );
    if (!otpRows.length) throw new HttpError(400, 'Invalid/expired OTP');

    await conn.execute('UPDATE parent_otps SET verified=TRUE WHERE id=?', [otpRows[0].id]);
    await conn.execute('UPDATE users SET is_active=TRUE WHERE id=?', [parentId]);

    const [students] = await conn.execute('SELECT user_id FROM students WHERE parent_user_id=?', [parentId]);
    for (const s of students) {
      await conn.execute('UPDATE users SET is_active=TRUE WHERE id=?', [s.user_id]);
      await conn.execute('UPDATE students SET account_locked=FALSE WHERE user_id=?', [s.user_id]);
    }

    await conn.commit();
    const token = signToken({ id: parentId, role: 'PARENT' });
    res.json({ token, message: 'Parent and student accounts activated' });
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});

export const loginStaff = asyncHandler(async (req, res) => {
  const schema = Joi.object({
    role: Joi.string().valid('DEPUTY_WARDEN', 'PRINCIPAL', 'WATCHMAN').required(),
    password: Joi.string().required()
  });
  const { role, password } = await schema.validateAsync(req.body);

  const [rows] = await pool.execute(
    'SELECT id, password_hash, is_active FROM users WHERE role=? ORDER BY id ASC LIMIT 1',
    [role]
  );
  if (!rows.length) throw new HttpError(404, `${role} user not found. Run seed script.`);

  const user = rows[0];
  if (!user.password_hash || !(await comparePassword(password, user.password_hash))) {
    throw new HttpError(401, 'Invalid credentials');
  }
  if (!user.is_active) throw new HttpError(403, 'Account inactive');

  const token = signToken({ id: user.id, role });
  res.json({ token, role });
});
