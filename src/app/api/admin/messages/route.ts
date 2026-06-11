import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';
import { requireAdmin } from '@/lib/middleware-auth';

// GET — list all conversations: one row per user with the latest message
// and the number of unread (user-sent) messages.
export async function GET(req: NextRequest) {
  try {
    const { error } = requireAdmin(req);
    if (error) return error;

    const supabase = getServiceClient();

    const { data: messages, error: dbError } = await supabase
      .from('messages')
      .select('*, user:users(id, name, username, email, avatar_url)')
      .order('created_at', { ascending: false })
      .limit(1000);

    if (dbError) {
      if (dbError.code === '42P01') {
        return NextResponse.json({ conversations: [], hint: 'Messages table missing — run the SQL from database.sql' });
      }
      throw dbError;
    }

    const byUser = new Map<string, any>();
    for (const m of messages || []) {
      const existing = byUser.get(m.user_id);
      if (!existing) {
        byUser.set(m.user_id, {
          user: m.user,
          user_id: m.user_id,
          last_message: m.body,
          last_sender: m.sender_role,
          last_at: m.created_at,
          unread: m.sender_role === 'user' && !m.read_by_admin ? 1 : 0,
        });
      } else if (m.sender_role === 'user' && !m.read_by_admin) {
        existing.unread += 1;
      }
    }

    return NextResponse.json({ conversations: [...byUser.values()] });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
