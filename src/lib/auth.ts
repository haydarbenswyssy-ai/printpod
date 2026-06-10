import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from './types';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 12);
}

export function comparePassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

export function signToken(user: Pick<User, 'id' | 'email' | 'role' | 'username'>): string {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role, username: user.username },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyToken(token: string): { sub: string; email: string; role: string; username: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { sub: string; email: string; role: string; username: string };
  } catch {
    return null;
  }
}
