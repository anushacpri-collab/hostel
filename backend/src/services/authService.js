import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { env } from '../config/env.js';

export const hashPassword = (password) => bcrypt.hash(password, 10);
export const comparePassword = (password, hash) => bcrypt.compare(password, hash);

export const signToken = (payload) =>
  jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn });

export const verifyToken = (token) => jwt.verify(token, env.jwtSecret);
