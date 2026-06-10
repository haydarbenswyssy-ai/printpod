import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';
import { requireAdmin } from '@/lib/middleware-auth';

export async function GET(req: NextRequest) {
  try {
    const { error } = requireAdmin(req);
    if (error) return error;

    const supabase = getServiceClient();

    const { data: users, error: dbError } = await supabase
      .from('users')
      .select('id, email, name, username, role, avatar_url, created_at')
      .order('created_at', { ascending: false });

    if (dbError) throw dbError;

    return NextResponse.json({ users: users || [] });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
