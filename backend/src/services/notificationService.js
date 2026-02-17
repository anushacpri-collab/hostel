import { pool } from '../config/db.js';

export const createNotification = async (userId, title, body) => {
  await pool.execute(
    'INSERT INTO notifications (user_id, title, body) VALUES (?, ?, ?)',
    [userId, title, body]
  );
};
