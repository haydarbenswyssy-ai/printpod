import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';
import { requireAuth } from '@/lib/middleware-auth';

const TABLE_MISSING_HINT =
  'Messages table not found. Run the messages CREATE TABLE from src/lib/database.sql in the Supabase SQL editor.';

// GET — the current user's support thread with the admin.
export async function GET(req: NextRequest) {
  try {
    const { user, error } = requireAuth(req);
    if (error) return error;

    const supabase = getServiceClient();

    const { data: messages, error: dbError } = await supabase
      .from('messages')
      .select('*')
      .eq('user_id', user!.sub)
      .order('created_at', { ascending: true });

    if (dbError) {
      if (dbError.code === '42P01') return NextResponse.json({ message: TABLE_MISSING_HINT }, { status: 500 });
      throw dbError;
    }

    // Opening the thread marks admin replies as read.
    await supabase
      .from('messages')
      .update({ read_by_user: true })
      .eq('user_id', user!.sub)
      .eq('sender_role', 'admin')
      .eq('read_by_user', false);

    return NextResponse.json({ messages: messages || [] });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// POST — send a message to the admin.
export async function POST(req: NextRequest) {
  try {
    const { user, error } = requireAuth(req);
    if (error) return error;

    const { body } = await req.json();
    const text = (body || '').trim();
    if (!text) return NextResponse.json({ message: 'Message cannot be empty' }, { status: 400 });
    if (text.length > 2000) return NextResponse.json({ message: 'Message too long (max 2000 chars)' }, { status: 400 });

    const supabase = getServiceClient();
    const { data: message, error: dbError } = await supabase
      .from('messages')
      .insert({ user_id: user!.sub, sender_role: 'user', body: text })
      .select('*')
      .single();

    if (dbError) {
      if (dbError.code === '42P01') return NextResponse.json({ message: TABLE_MISSING_HINT }, { status: 500 });
      throw dbError;
    }

    return NextResponse.json({ message }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
