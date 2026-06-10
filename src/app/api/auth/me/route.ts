import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';
import { verifyToken } from '@/lib/auth';
import { devDB, isUsingDevDB } from '@/lib/dev-db';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(authHeader.split(' ')[1]);
    if (!payload) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    if (isUsingDevDB()) {
      const user = devDB.users.findOne({ id: payload.sub });
      if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 });
      const { password_hash, ...safeUser } = user;
      return NextResponse.json({ user: safeUser });
    }

    const supabase = getServiceClient();
    const { data: user } = await supabase
      .from('users')
      .select('id, email, name, username, role, avatar_url, bio, store_banner, store_name, created_at')
      .eq('id', payload.sub)
      .single();

    if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 });
    return NextResponse.json({ user });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'Internal server error' }, { status: 500 });
  }
}
