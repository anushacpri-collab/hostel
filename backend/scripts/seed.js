import bcrypt from 'bcryptjs';
import { pool } from '../src/config/db.js';

const run = async () => {
  const password = await bcrypt.hash('Password@123', 10);
  await pool.execute("INSERT INTO users (role, phone, password_hash, is_active) VALUES ('DEPUTY_WARDEN', NULL, ?, TRUE)", [password]);
  await pool.execute("INSERT INTO users (role, phone, password_hash, is_active) VALUES ('PRINCIPAL', NULL, ?, TRUE)", [password]);
  await pool.execute("INSERT INTO users (role, phone, password_hash, is_active) VALUES ('WATCHMAN', NULL, ?, TRUE)", [password]);
  console.log('Seeded authority and watchman accounts with password Password@123');
  process.exit(0);
};

run();
