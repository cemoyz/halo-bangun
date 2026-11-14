import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    const user = token ? await verifyToken(token) : null;

    if (!user || (user.role !== 'FINANCE' && user.role !== 'OWNER')) {
      return NextResponse.json(
        { success: false, error: 'Hanya Finance Admin atau Direktur yang dapat mengatur alokasi finansial proyek' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      projectId,
      realCost,
      netProfit,
      taxAmount,
      zakatAmount,
      operationalAmount,
      mitigationFund,
      businessDevFund,
      debtReceivableNotes,
    } = body;

    if (!projectId) {
      return NextResponse.json({ success: false, error: 'Project ID wajib diisi' }, { status: 400 });
    }

    const pId = Number(projectId);

    const allocation = await prisma.projectFinancialAllocation.upsert({
      where: { project_id: pId },
      update: {
        real_cost: parseFloat(realCost) || 0,
        net_profit: parseFloat(netProfit) || 0,
        tax_amount: parseFloat(taxAmount) || 0,
        zakat_amount: parseFloat(zakatAmount) || 0,
        operational_amount: parseFloat(operationalAmount) || 0,
        mitigation_fund: parseFloat(mitigationFund) || 0,
        business_dev_fund: parseFloat(businessDevFund) || 0,
        debt_receivable_notes: debtReceivableNotes || '',
      },
      create: {
        project_id: pId,
        real_cost: parseFloat(realCost) || 0,
        net_profit: parseFloat(netProfit) || 0,
        tax_amount: parseFloat(taxAmount) || 0,
        zakat_amount: parseFloat(zakatAmount) || 0,
        operational_amount: parseFloat(operationalAmount) || 0,
        mitigation_fund: parseFloat(mitigationFund) || 0,
        business_dev_fund: parseFloat(businessDevFund) || 0,
        debt_receivable_notes: debtReceivableNotes || '',
      },
      include: { project: true },
    });

    return NextResponse.json({
      success: true,
      message: 'Alokasi keuangan proyek (FR-18) berhasil dihitung dan disimpan!',
      allocation,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

