import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';
import { requireAdmin } from '@/lib/middleware-auth';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { error } = requireAdmin(req);
    if (error) return error;

    const supabase = getServiceClient();
    const body = await req.json();

    const { data: product, error: dbError } = await supabase
      .from('products')
      .update({ status: body.status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*, seller:users(id, name, username)')
      .single();

    if (dbError) throw dbError;

    return NextResponse.json({ product });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
