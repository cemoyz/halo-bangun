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

    // Fallback for development if cookie is not set: default to OWNER so dev preview works
    const auth = user || { id: 1, role: 'OWNER' as const, name: 'Bpk. Arga Pramudya' };

    // Role check: Mandor cannot access documents
    if (auth.role === 'MANDOR') {
      return NextResponse.json({ success: false, error: 'Mandor tidak memiliki hak akses ke dokumen resmi SPK & BAST' }, { status: 403 });
    }

    // Client only sees their own projects
    let projectWhere: any = {};
    if (auth.role === 'CLIENT') {
      projectWhere.client_id = auth.id;
    }

    const projects = await prisma.project.findMany({
      where: projectWhere,
      include: {
        client: { select: { id: true, name: true, email: true } },
        pm: { select: { id: true, name: true } },
        warrantyClaims: {
          orderBy: { claim_date: 'desc' },
        },
      },
      orderBy: { id: 'desc' },
    });

    // Payrolls: Client cannot see payrolls; others can
    let payrolls: any[] = [];
    if (auth.role !== 'CLIENT') {
      let payrollWhere: any = {};
      if (auth.role === 'PM') {
        payrollWhere.user_id = auth.id;
      }
      payrolls = await prisma.payroll.findMany({
        where: payrollWhere,
        include: {
          user: { select: { id: true, name: true, role: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    // Employees for slip generator
    let employees: any[] = [];
    if (auth.role === 'FINANCE' || auth.role === 'OWNER') {
      employees = await prisma.user.findMany({
        where: { role: { in: ['MANDOR', 'PM', 'FINANCE', 'OWNER'] } },
        select: { id: true, name: true, role: true },
        orderBy: { name: 'asc' },
      });
    }

    return NextResponse.json({
      success: true,
      projects,
      payrolls,
      employees,
      currentUserRole: auth.role,
      currentUserId: auth.id,
    });
  } catch (error: any) {
    console.error('Error fetching documents data:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
