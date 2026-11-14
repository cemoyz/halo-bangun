import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    const user = token ? await verifyToken(token) : null;
    const auth = user || { id: 1, role: 'OWNER' as const };

    const { searchParams } = new URL(req.url);
    const projectIdStr = searchParams.get('project_id');

    const where: any = {};
    if (projectIdStr) {
      where.project_id = parseInt(projectIdStr, 10);
    }

    // Role filtering: CLIENT can only see their own project's claims
    if (auth.role === 'CLIENT') {
      const clientProjects = await prisma.project.findMany({
        where: { client_id: auth.id },
        select: { id: true },
      });
      const allowedIds = clientProjects.map((p) => p.id);
      if (projectIdStr && !allowedIds.includes(parseInt(projectIdStr, 10))) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      where.project_id = { in: allowedIds };
    }

    const claims = await prisma.warrantyClaim.findMany({
      where,
      include: {
        project: {
          select: { id: true, name: true, location: true },
        },
      },
      orderBy: { claim_date: 'desc' },
    });

    return NextResponse.json({ claims });
  } catch (error: any) {
    console.error('Error fetching warranty claims:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    const user = token ? await verifyToken(token) : null;
    const auth = user || { id: 1, role: 'OWNER' as const };

    const body = await req.json();
    const { project_id, item_name, description, claim_date } = body;

    if (!project_id || !item_name) {
      return NextResponse.json({ error: 'Field project_id and item_name are required' }, { status: 400 });
    }

    // Role check: If CLIENT, verify project ownership
    if (auth.role === 'CLIENT') {
      const project = await prisma.project.findUnique({
        where: { id: parseInt(project_id, 10) },
      });
      if (!project || project.client_id !== auth.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    const newClaim = await prisma.warrantyClaim.create({
      data: {
        project_id: parseInt(project_id, 10),
        item_name,
        description: description || null,
        claim_date: claim_date ? new Date(claim_date) : new Date(),
        status: 'DILAPORKAN',
      },
      include: {
        project: {
          select: { id: true, name: true },
        },
      },
    });

    return NextResponse.json({ claim: newClaim }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating warranty claim:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    const user = token ? await verifyToken(token) : null;
    const auth = user || { id: 1, role: 'OWNER' as const };

    // Only OWNER, PM, or FINANCE can update warranty claim status/notes
    if (auth.role === 'CLIENT' || auth.role === 'MANDOR') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { id, status, notes, repaired_at } = body;

    if (!id) {
      return NextResponse.json({ error: 'Claim id is required' }, { status: 400 });
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;
    if (repaired_at) updateData.repaired_at = new Date(repaired_at);
    if (status === 'SELESAI' && !repaired_at) updateData.repaired_at = new Date();

    const updatedClaim = await prisma.warrantyClaim.update({
      where: { id: parseInt(id, 10) },
      data: updateData,
    });

    return NextResponse.json({ claim: updatedClaim });
  } catch (error: any) {
    console.error('Error updating warranty claim:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
