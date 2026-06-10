import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';
import { requireAdmin } from '@/lib/middleware-auth';

export async function GET(req: NextRequest) {
  try {
    const { error } = requireAdmin(req);
    if (error) return error;

    const supabase = getServiceClient();

    const [users, products, orders, pendingProducts] = await Promise.all([
      supabase.from('users').select('id', { count: 'exact', head: true }),
      supabase.from('products').select('id', { count: 'exact', head: true }),
      supabase.from('orders').select('id, total_amount', { count: 'exact' }),
      supabase.from('products').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    ]);

    const totalRevenue = orders.data?.reduce((sum, o) => sum + parseFloat(String(o.total_amount)), 0) || 0;

    return NextResponse.json({
      stats: {
        totalUsers: users.count || 0,
        totalProducts: products.count || 0,
        totalOrders: orders.count || 0,
        pendingApprovals: pendingProducts.count || 0,
        totalRevenue,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
