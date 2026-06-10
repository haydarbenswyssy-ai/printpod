import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';
import { requireAdmin } from '@/lib/middleware-auth';

export async function GET(req: NextRequest) {
  try {
    const { error } = requireAdmin(req);
    if (error) return error;

    const supabase = getServiceClient();

    const { data: orders, error: dbError } = await supabase
      .from('orders')
      .select('*, customer:users(id, name, email, username), order_items:order_items(*, product:products(id, title, tshirt_color, preview_front_url))')
      .order('created_at', { ascending: false });

    if (dbError) throw dbError;

    return NextResponse.json({ orders: orders || [] });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
