import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';
import { requireAuth } from '@/lib/middleware-auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = getServiceClient();

    const { data: product, error } = await supabase
      .from('products')
      .select('*, seller:users(id, name, username, avatar_url, bio, store_name)')
      .eq('id', id)
      .single();

    if (error || !product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { user, error } = requireAuth(req);
    if (error) return error;

    const supabase = getServiceClient();
    const body = await req.json();

    const { data: existing } = await supabase
      .from('products')
      .select('seller_id')
      .eq('id', id)
      .single();

    if (!existing || (existing.seller_id !== user!.sub && user!.role !== 'admin')) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { data: product, error: dbError } = await supabase
      .from('products')
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*')
      .single();

    if (dbError) throw dbError;

    return NextResponse.json({ product });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
