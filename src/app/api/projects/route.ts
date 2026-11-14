import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    const user = token ? await verifyToken(token) : null;

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Role-based visibility
    let whereCondition: any = {};
    if (user.role === 'PM') {
      whereCondition = { pm_id: user.id };
    } else if (user.role === 'CLIENT') {
      whereCondition = { client_id: user.id };
    }

    const projects = await prisma.project.findMany({
      where: whereCondition,
      include: {
        client: { select: { id: true, name: true, email: true, phone: true } },
        pm: { select: { id: true, name: true, email: true, phone: true } },
        sCurveProgress: { orderBy: { week_number: 'desc' }, take: 1 },
        documents: user.role === 'PM' || user.role === 'MANDOR'
          ? { where: { doc_type: { not: 'SPKPR' } } } // Strict PM restriction: no SPKPR
          : true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, projects });
  } catch (error: any) {
    console.error('Error fetching projects:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    const user = token ? await verifyToken(token) : null;

    // Only OWNER can onboard new projects
    if (!user || user.role !== 'OWNER') {
      return NextResponse.json(
        { success: false, error: 'Hanya Direktur / Owner yang memiliki wewenang membuat proyek baru' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      name,
      category = 'PEMBANGUNAN',
      location,
      clientId,
      newClientName,
      newClientEmail,
      newClientPhone,
      pmId,
      contractValue,
      dpAmount,
      cctvUrl,
      startDate,
      targetCompletionDate,
      // 5 Mandatory Onboarding Files:
      spkprUrl,
      desainUrl,
      rabUrl,
      rencanaKerjaUrl,
      dpReceiptUrl,
    } = body;

    if (!name || !location || !contractValue) {
      return NextResponse.json(
        { success: false, error: 'Nama proyek, lokasi, dan nilai kontrak wajib diisi' },
        { status: 400 }
      );
    }

    // Determine or create client
    let finalClientId: number | null = clientId ? Number(clientId) : null;
    if (!finalClientId && newClientEmail && newClientName) {
      // Check if user already exists
      let clientUser = await prisma.user.findUnique({
        where: { email: newClientEmail },
      });
      if (!clientUser) {
        const bcrypt = require('bcryptjs');
        const defaultPassword = await bcrypt.hash('password123', 10);
        clientUser = await prisma.user.create({
          data: {
            name: newClientName,
            email: newClientEmail,
            phone: newClientPhone || '',
            password: defaultPassword,
            role: 'CLIENT',
            designation: 'Klien Proyek',
          },
        });
      }
      finalClientId = clientUser.id;
    }

    const numericContractValue = parseFloat(contractValue) || 0;
    const numericDpAmount = parseFloat(dpAmount) || numericContractValue * 0.3;

    // Create Project
    const project = await prisma.project.create({
      data: {
        name,
        category: category as any,
        location,
        client_id: finalClientId,
        pm_id: pmId ? Number(pmId) : null,
        status: 'ONGOING',
        contract_value: numericContractValue,
        cctv_url: cctvUrl || '',
        bast_unlocked: false,
        startDate: startDate ? new Date(startDate) : new Date(),
        targetCompletionDate: targetCompletionDate ? new Date(targetCompletionDate) : null,
      },
    });

    // Create 4 initial project documents
    const documentsToCreate: any[] = [];
    if (spkprUrl) {
      documentsToCreate.push({
        project_id: project.id,
        doc_type: 'SPKPR',
        title: `SPKPR Resmi - ${project.name}`,
        file_url: spkprUrl,
        is_locked: false,
      });
    }
    if (desainUrl) {
      documentsToCreate.push({
        project_id: project.id,
        doc_type: 'DESAIN_ARS',
        title: `Desain Arsitektur & DED - ${project.name}`,
        file_url: desainUrl,
        is_locked: false,
      });
    }
    if (rabUrl) {
      documentsToCreate.push({
        project_id: project.id,
        doc_type: 'RAB',
        title: `RAB Mengikat - ${project.name}`,
        file_url: rabUrl,
        is_locked: false,
      });
    }
    if (rencanaKerjaUrl) {
      documentsToCreate.push({
        project_id: project.id,
        doc_type: 'RENCANA_KERJA',
        title: `Rencana Kerja Utama & Time Schedule`,
        file_url: rencanaKerjaUrl,
        is_locked: false,
      });
    }

    if (documentsToCreate.length > 0) {
      await prisma.projectDocument.createMany({
        data: documentsToCreate,
      });
    }

    // Create Initial Payment (Termin 1 / DP)
    await prisma.payment.create({
      data: {
        project_id: project.id,
        termin_name: 'Termin 1 (Uang Muka / DP 30%)',
        amount: numericDpAmount,
        status: dpReceiptUrl ? 'PAID' : 'PENDING_VERIFICATION',
        paid_at: dpReceiptUrl ? new Date() : null,
        proof_url: dpReceiptUrl || null,
        receipt_url: dpReceiptUrl || null,
        notes: 'Pembayaran DP inisiasi proyek via Wizard Onboarding Owner.',
      },
    });

    // Create Initial Kurva S Week 1
    await prisma.sCurveProgress.create({
      data: {
        project_id: project.id,
        week_number: 1,
        planned_percentage: 5.0,
        actual_percentage: 5.0,
      },
    });

    // Create Initial Financial Allocation draft
    await prisma.projectFinancialAllocation.create({
      data: {
        project_id: project.id,
        real_cost: 0,
        net_profit: numericContractValue * 0.15,
        tax_amount: numericContractValue * 0.02,
        zakat_amount: (numericContractValue * 0.15) * 0.025,
        operational_amount: numericContractValue * 0.05,
        mitigation_fund: numericContractValue * 0.02,
        business_dev_fund: numericContractValue * 0.02,
        debt_receivable_notes: `Piutang sisa kontrak Rp ${(numericContractValue - numericDpAmount).toLocaleString('id-ID')}`,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Proyek baru berhasil dibuat dan dokumen onboarding telah disinkronkan ke PM, Klien, dan Finance',
      project,
    });
  } catch (error: any) {
    console.error('Error creating project:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

