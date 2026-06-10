import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './auth';

export function getAuthUser(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  return verifyToken(authHeader.split(' ')[1]);
}

export function requireAuth(req: NextRequest) {
  const user = getAuthUser(req);
  if (!user) {
    return { user: null, error: NextResponse.json({ message: 'Unauthorized' }, { status: 401 }) };
  }
  return { user, error: null };
}

export function requireAdmin(req: NextRequest) {
  const { user, error } = requireAuth(req);
  if (error) return { user: null, error };
  if (user!.role !== 'admin') {
    return { user: null, error: NextResponse.json({ message: 'Forbidden' }, { status: 403 }) };
  }
  return { user, error: null };
}
