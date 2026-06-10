import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';
import { hashPassword, signToken } from '@/lib/auth';
import { devDB, isUsingDevDB } from '@/lib/dev-db';

export async function POST(req: NextRequest) {
  try {
    const { email, password, name, username } = await req.json();

    if (!email || !password || !name || !username) {
      return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ message: 'Password must be at least 6 characters' }, { status: 400 });
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return NextResponse.json({ message: 'Username can only contain letters, numbers, and underscores' }, { status: 400 });
    }

    // === DEV MODE: use in-memory DB ===
    if (isUsingDevDB()) {
      if (devDB.users.findOne({ email })) {
        return NextResponse.json({ message: 'Email already registered' }, { status: 409 });
      }
      if (devDB.users.findOne({ username })) {
        return NextResponse.json({ message: 'Username already taken' }, { status: 409 });
      }
      const password_hash = hashPassword(password);
      const user = devDB.users.insert({
        email, password_hash, name, username, role: 'customer',
      });
      const { password_hash: _, ...safeUser } = user;
      const token = signToken(safeUser as any);
      return NextResponse.json({ user: safeUser, token }, { status: 201 });
    }

    // === PROD MODE: use Supabase ===
    const supabase = getServiceClient();
    const { data: existingEmail } = await supabase.from('users').select('id').eq('email', email).single();
    if (existingEmail) return NextResponse.json({ message: 'Email already registered' }, { status: 409 });

    const { data: existingUsername } = await supabase.from('users').select('id').eq('username', username).single();
    if (existingUsername) return NextResponse.json({ message: 'Username already taken' }, { status: 409 });

    const password_hash = hashPassword(password);
    const { data: user, error } = await supabase
      .from('users')
      .insert({ email, password_hash, name, username, role: 'customer' })
      .select('id, email, name, username, role, avatar_url, bio, store_banner, store_name, created_at')
      .single();

    if (error) throw error;
    const token = signToken(user);
    return NextResponse.json({ user, token }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'Internal server error' }, { status: 500 });
  }
}
