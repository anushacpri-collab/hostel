import { verifyToken } from '../services/authService.js';
import { HttpError } from '../utils/httpError.js';

export const authenticate = (req, _res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) throw new HttpError(401, 'Unauthorized');

  const token = authHeader.split(' ')[1];
  req.user = verifyToken(token);
  next();
};

export const authorize = (...roles) => (req, _res, next) => {
  if (!roles.includes(req.user.role)) throw new HttpError(403, 'Forbidden');
  next();
};
