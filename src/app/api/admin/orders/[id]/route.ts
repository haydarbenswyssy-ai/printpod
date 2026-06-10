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

    const { data: order, error: dbError } = await supabase
      .from('orders')
      .update({ status: body.status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*')
      .single();

    if (dbError) throw dbError;

    return NextResponse.json({ order });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
