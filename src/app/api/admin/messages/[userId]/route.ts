import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';
import { requireAdmin } from '@/lib/middleware-auth';

// GET — full thread with one user; opening it marks user messages as read.
export async function GET(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const { userId } = await params;
    const { error } = requireAdmin(req);
    if (error) return error;

    const supabase = getServiceClient();

    const [{ data: messages, error: dbError }, { data: threadUser }] = await Promise.all([
      supabase.from('messages').select('*').eq('user_id', userId).order('created_at', { ascending: true }),
      supabase.from('users').select('id, name, username, email, avatar_url').eq('id', userId).single(),
    ]);

    if (dbError) throw dbError;

    await supabase
      .from('messages')
      .update({ read_by_admin: true })
      .eq('user_id', userId)
      .eq('sender_role', 'user')
      .eq('read_by_admin', false);

    return NextResponse.json({ messages: messages || [], user: threadUser });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// POST — admin replies in a user's thread.
export async function POST(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const { userId } = await params;
    const { error } = requireAdmin(req);
    if (error) return error;

    const { body } = await req.json();
    const text = (body || '').trim();
    if (!text) return NextResponse.json({ message: 'Message cannot be empty' }, { status: 400 });
    if (text.length > 2000) return NextResponse.json({ message: 'Message too long (max 2000 chars)' }, { status: 400 });

    const supabase = getServiceClient();
    const { data: message, error: dbError } = await supabase
      .from('messages')
      .insert({ user_id: userId, sender_role: 'admin', body: text })
      .select('*')
      .single();

    if (dbError) throw dbError;

    return NextResponse.json({ message }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
