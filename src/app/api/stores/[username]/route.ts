import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';

export async function GET(req: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  try {
    const { username } = await params;
    const supabase = getServiceClient();

    const { data: store, error } = await supabase
      .from('users')
      .select('id, name, username, avatar_url, bio, store_banner, store_name, created_at')
      .eq('username', username)
      .single();

    if (error || !store) {
      return NextResponse.json({ message: 'Store not found' }, { status: 404 });
    }

    const { data: products } = await supabase
      .from('products')
      .select('*')
      .eq('seller_id', store.id)
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    return NextResponse.json({ store, products: products || [] });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
