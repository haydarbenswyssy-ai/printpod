import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';
import { comparePassword, signToken } from '@/lib/auth';
import { devDB, isUsingDevDB } from '@/lib/dev-db';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
    }

    // === DEV MODE ===
    if (isUsingDevDB()) {
      const user = devDB.users.findOne({ email });
      if (!user || !comparePassword(password, user.password_hash)) {
        return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
      }
      const { password_hash, ...safeUser } = user;
      const token = signToken(safeUser as any);
      return NextResponse.json({ user: safeUser, token });
    }

    // === PROD MODE ===
    const supabase = getServiceClient();
    const { data: user, error } = await supabase.from('users').select('*').eq('email', email).single();
    if (error || !user) return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });

    if (!comparePassword(password, user.password_hash)) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const { password_hash, ...safeUser } = user;
    const token = signToken(safeUser);
    return NextResponse.json({ user: safeUser, token });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'Internal server error' }, { status: 500 });
  }
}
