import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware-auth';
import { devDB, isUsingDevDB } from '@/lib/dev-db';
import { signToken } from '@/lib/auth';

/**
 * DEV ONLY — promotes the current user to admin in the in-memory store.
 * Disabled when using a real Supabase instance.
 */
export async function POST(req: NextRequest) {
  if (!isUsingDevDB()) {
    return NextResponse.json(
      { message: 'This endpoint is only available in dev mode. Use SQL on Supabase to promote a user.' },
      { status: 403 }
    );
  }

  const { user, error } = requireAuth(req);
  if (error) return error;

  const updated = devDB.users.update(user!.sub, { role: 'admin' });
  if (!updated) return NextResponse.json({ message: 'User not found' }, { status: 404 });

  const { password_hash, ...safeUser } = updated;
  const token = signToken(safeUser as any);

  return NextResponse.json({
    message: 'You are now an admin!',
    user: safeUser,
    token,
  });
}
