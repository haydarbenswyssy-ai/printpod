import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';
import { getAuthUser, requireAuth } from '@/lib/middleware-auth';
import { devDB, isUsingDevDB } from '@/lib/dev-db';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const status = url.searchParams.get('status') || 'approved';
    const category = url.searchParams.get('category');
    const search = url.searchParams.get('search');
    const seller_id = url.searchParams.get('seller_id');

    if (isUsingDevDB()) {
      let products = devDB.products.findAll({ status });
      if (category) products = products.filter((p) => p.category === category);
      if (search) products = products.filter((p) => p.title?.toLowerCase().includes(search.toLowerCase()));
      if (seller_id) products = products.filter((p) => p.seller_id === seller_id);

      // Attach seller info
      products = products.map((p: any) => {
        const seller = devDB.users.findOne({ id: p.seller_id });
        const { password_hash, ...safeSeller } = seller || {};
        return { ...p, seller: safeSeller };
      }).sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      return NextResponse.json({ products, total: products.length });
    }

    const supabase = getServiceClient();
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    let query = supabase
      .from('products')
      .select('*, seller:users(id, name, username, avatar_url)', { count: 'exact' })
      .eq('status', status)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (category) query = query.eq('category', category);
    if (search) query = query.ilike('title', `%${search}%`);
    if (seller_id) query = query.eq('seller_id', seller_id);

    const { data: products, count, error } = await query;
    if (error) throw error;

    return NextResponse.json({ products: products || [], total: count || 0 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, error } = requireAuth(req);
    if (error) return error;

    const body = await req.json();
    const basePrice = parseFloat(process.env.NEXT_PUBLIC_BASE_PRICE || '42');
    const sellingPrice = parseFloat(body.selling_price);

    if (sellingPrice <= basePrice) {
      return NextResponse.json(
        { message: `Selling price must be above base price (${basePrice.toFixed(3)} TND)` },
        { status: 400 }
      );
    }

    // Security: a seller can only submit 'draft' or 'pending'. Only an admin
    // may set any other status. This stops sellers self-approving products.
    const requestedStatus = body.status === 'draft' ? 'draft' : 'pending';
    const status = user!.role === 'admin' && body.status ? body.status : requestedStatus;

    const productData = {
      seller_id: user!.sub,
      title: body.title,
      description: body.description || '',
      tshirt_color: body.tshirt_color || 'white',
      design_front_url: body.design_front_url,
      design_back_url: body.design_back_url,
      preview_front_url: body.preview_front_url,
      preview_back_url: body.preview_back_url,
      base_price: basePrice,
      selling_price: sellingPrice,
      profit: sellingPrice - basePrice,
      category: body.category || 'Graphic Art',
      tags: body.tags || [],
      sizes: body.sizes || ['S', 'M', 'L', 'XL'],
      status,
    };

    if (isUsingDevDB()) {
      const product = devDB.products.insert(productData);
      // Upgrade user to seller if first product
      const u = devDB.users.findOne({ id: user!.sub });
      if (u && u.role === 'customer') {
        devDB.users.update(u.id, { role: 'seller' });
      }
      return NextResponse.json({ product }, { status: 201 });
    }

    // In Supabase, `profit` is a GENERATED ALWAYS column — it must NOT be in
    // the insert payload or the insert is rejected.
    const { profit, ...supabaseData } = productData;
    const supabase = getServiceClient();
    const { data, error: dbError } = await supabase.from('products').insert(supabaseData).select('*').single();
    if (dbError) throw dbError;
    await supabase.from('users').update({ role: 'seller' }).eq('id', user!.sub).eq('role', 'customer');
    return NextResponse.json({ product: data }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
