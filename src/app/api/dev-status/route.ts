import { NextResponse } from 'next/server';
import { isUsingDevDB } from '@/lib/dev-db';

export async function GET() {
  return NextResponse.json({ devMode: isUsingDevDB() });
}
