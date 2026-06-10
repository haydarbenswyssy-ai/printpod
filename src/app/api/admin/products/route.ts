import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';
import { requireAdmin } from '@/lib/middleware-auth';

export async function GET(req: NextRequest) {
  try {
    const { error } = requireAdmin(req);
    if (error) return error;

    const supabase = getServiceClient();
    const url = new URL(req.url);
    const status = url.searchParams.get('status');

    let query = supabase
      .from('products')
      .select('*, seller:users(id, name, username, avatar_url)')
      .order('created_at', { ascending: false });

    if (status) query = query.eq('status', status);

    const { data: products, error: dbError } = await query;
    if (dbError) throw dbError;

    return NextResponse.json({ products: products || [] });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
