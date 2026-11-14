import { NextRequest, NextResponse } from 'next/server';
import { getAllLandingContent } from '@/lib/landingContent';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const contents = await getAllLandingContent();
    return NextResponse.json({ success: true, data: contents });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

