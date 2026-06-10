import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';
import { requireAuth } from '@/lib/middleware-auth';
import { isUsingDevDB } from '@/lib/dev-db';
import { v4 as uuidv4 } from 'uuid';

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(req: NextRequest) {
  try {
    const { user, error } = requireAuth(req);
    if (error) return error;

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const bucket = (formData.get('bucket') as string) || 'designs';

    if (!file) return NextResponse.json({ message: 'No file provided' }, { status: 400 });
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ message: 'Only PNG, JPEG, and WebP images are allowed' }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ message: 'File size must be under 5MB' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();

    // === DEV MODE: return a data URL (image stays in-memory via Base64) ===
    if (isUsingDevDB()) {
      const base64 = Buffer.from(arrayBuffer).toString('base64');
      const dataUrl = `data:${file.type};base64,${base64}`;
      return NextResponse.json({ url: dataUrl, path: `dev-${uuidv4()}` });
    }

    // === PROD MODE: upload to Supabase storage ===
    const supabase = getServiceClient();
    const ext = file.name.split('.').pop();
    const fileName = `${user!.sub}/${uuidv4()}.${ext}`;
    const buffer = Buffer.from(arrayBuffer);

    const { data, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, buffer, { contentType: file.type, cacheControl: '3600' });

    if (uploadError) throw uploadError;
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path);
    return NextResponse.json({ url: urlData.publicUrl, path: data.path });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
