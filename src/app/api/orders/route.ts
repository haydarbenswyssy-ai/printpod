import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';
import { requireAuth } from '@/lib/middleware-auth';

export async function GET(req: NextRequest) {
  try {
    const { user, error } = requireAuth(req);
    if (error) return error;

    const supabase = getServiceClient();

    const { data: orders, error: dbError } = await supabase
      .from('orders')
      .select('*, order_items:order_items(*, product:products(id, title, preview_front_url, tshirt_color))')
      .eq('customer_id', user!.sub)
      .order('created_at', { ascending: false });

    if (dbError) throw dbError;

    return NextResponse.json({ orders: orders || [] });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, error } = requireAuth(req);
    if (error) return error;

    const supabase = getServiceClient();
    const body = await req.json();

    const { items, shipping, payment_method } = body;

    if (!items?.length || !shipping) {
      return NextResponse.json({ message: 'Items and shipping address are required' }, { status: 400 });
    }

    // Calculate total
    let total = 0;
    for (const item of items) {
      const { data: product } = await supabase
        .from('products')
        .select('selling_price, status')
        .eq('id', item.product_id)
        .single();

      if (!product || product.status !== 'approved') {
        return NextResponse.json({ message: `Product ${item.product_id} is not available` }, { status: 400 });
      }
      total += product.selling_price * item.quantity;
    }

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_id: user!.sub,
        total_amount: total,
        payment_method: payment_method || 'cod',
        shipping_name: shipping.full_name,
        shipping_phone: shipping.phone,
        shipping_address1: shipping.address_line1,
        shipping_address2: shipping.address_line2 || null,
        shipping_city: shipping.city,
        shipping_state: shipping.state,
        shipping_zip: shipping.zip_code,
        shipping_country: shipping.country || 'US',
      })
      .select('*')
      .single();

    if (orderError) throw orderError;

    // Insert order items with design URLs
    const orderItems = [];
    for (const item of items) {
      const { data: product } = await supabase
        .from('products')
        .select('selling_price, design_front_url, design_back_url')
        .eq('id', item.product_id)
        .single();

      orderItems.push({
        order_id: order.id,
        product_id: item.product_id,
        size: item.size,
        quantity: item.quantity,
        unit_price: product!.selling_price,
        design_front_url: product!.design_front_url,
        design_back_url: product!.design_back_url,
      });
    }

    await supabase.from('order_items').insert(orderItems);

    return NextResponse.json({ order }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
