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

    // PM and MANDOR are strictly PROHIBITED from viewing financial payments & termins
    if (['PM', 'MANDOR'].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: 'Akses modul Termin Pembayaran & Kwitansi dilarang untuk role Pengawas (PM) & Mandor' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const projectIdParam = searchParams.get('projectId');

    // Fetch allowed projects based on role
    let allowedProjects: any[] = [];
    if (user.role === 'CLIENT') {
      allowedProjects = await prisma.project.findMany({
        where: { client_id: user.id },
        select: {
          id: true,
          name: true,
          contract_value: true,
          status: true,
          location: true,
          bast_unlocked: true,
        },
        orderBy: { id: 'asc' },
      });
      if (allowedProjects.length === 0) {
        return NextResponse.json({
          success: true,
          projects: [],
          project: null,
          payments: [],
          financialSummary: null,
        });
      }
    } else {
      allowedProjects = await prisma.project.findMany({
        select: {
          id: true,
          name: true,
          contract_value: true,
          status: true,
          location: true,
          bast_unlocked: true,
          client: { select: { id: true, name: true, phone: true } },
          pm: { select: { id: true, name: true, phone: true } },
        },
        orderBy: { id: 'asc' },
      });
    }

    const targetProjectId = projectIdParam
      ? parseInt(projectIdParam, 10)
      : allowedProjects[0]?.id;

    if (!targetProjectId) {
      return NextResponse.json({
        success: true,
        projects: allowedProjects,
        project: null,
        payments: [],
        financialSummary: null,
      });
    }

    // Check client permission
    if (user.role === 'CLIENT' && !allowedProjects.some((p) => p.id === targetProjectId)) {
      return NextResponse.json(
        { success: false, error: 'Anda tidak memiliki hak akses untuk proyek ini' },
        { status: 403 }
      );
    }

    const project = await prisma.project.findUnique({
      where: { id: targetProjectId },
      include: {
        client: { select: { id: true, name: true, phone: true, email: true } },
        pm: { select: { id: true, name: true, phone: true } },
        sCurveProgress: {
          orderBy: { week_number: 'desc' },
          take: 1,
        },
        addendums: {
          where: { status: 'APPROVED' },
          select: { cost_difference: true },
        },
        payments: {
          orderBy: [{ termin_number: 'asc' }, { createdAt: 'asc' }],
        },
      },
    });

    if (!project) {
      return NextResponse.json({ success: false, error: 'Proyek tidak ditemukan' }, { status: 404 });
    }

    // Calculate total approved addendums
    const addendumTotal = project.addendums.reduce((sum, a) => sum + (a.cost_difference || 0), 0);
    const contractVal = Number(project.contract_value) || 0;
    const finalContractTotal = contractVal + addendumTotal;

    // Financial calculations
    const payments = project.payments;
    const totalPaid = payments
      .filter((p) => p.status === 'PAID')
      .reduce((sum, p) => sum + p.amount, 0);

    const totalPending = payments
      .filter((p) => p.status === 'PENDING_VERIFICATION')
      .reduce((sum, p) => sum + p.amount, 0);

    const totalRemaining = Math.max(0, finalContractTotal - totalPaid);
    const paymentProgress = finalContractTotal > 0 ? parseFloat(((totalPaid / finalContractTotal) * 100).toFixed(1)) : 0;
    const allPaid = payments.length > 0 && payments.every((p) => p.status === 'PAID');
    const latestSCurve = project.sCurveProgress[0]?.cumulative_actual || project.sCurveProgress[0]?.actual_percentage || 0;
    const isBastUnlocked = project.bast_unlocked || (allPaid && latestSCurve >= 100);

    const financialSummary = {
      baseContractValue: contractVal,
      addendumTotal,
      finalContractTotal,
      totalPaid,
      totalPending,
      totalRemaining,
      paymentProgress,
      allPaid,
      latestSCurve,
      isBastUnlocked,
      totalTermins: payments.length,
      paidTerminsCount: payments.filter((p) => p.status === 'PAID').length,
    };

    return NextResponse.json({
      success: true,
      projects: allowedProjects,
      project: {
        id: project.id,
        name: project.name,
        location: project.location,
        contract_value: contractVal,
        status: project.status,
        bast_unlocked: project.bast_unlocked,
        client: project.client,
        pm: project.pm,
      },
      payments,
      financialSummary,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: Create new termin (Finance / Owner)
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    const user = token ? await verifyToken(token) : null;

    if (!user || (user.role !== 'FINANCE' && user.role !== 'OWNER')) {
      return NextResponse.json(
        { success: false, error: 'Hanya Finance Admin atau Direktur yang dapat menerbitkan termin tagihan baru' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { projectId, terminName, percentage, amount, dueDate, notes } = body;

    if (!projectId || !terminName) {
      return NextResponse.json(
        { success: false, error: 'ID Proyek dan Nama Termin wajib diisi' },
        { status: 400 }
      );
    }

    const pId = Number(projectId);
    const project = await prisma.project.findUnique({
      where: { id: pId },
      include: {
        addendums: { where: { status: 'APPROVED' }, select: { cost_difference: true } },
        payments: { orderBy: { termin_number: 'desc' }, take: 1 },
      },
    });

    if (!project) {
      return NextResponse.json({ success: false, error: 'Proyek tidak ditemukan' }, { status: 404 });
    }

    const addendumTotal = project.addendums.reduce((sum, a) => sum + (a.cost_difference || 0), 0);
    const finalContract = (Number(project.contract_value) || 0) + addendumTotal;

    const pct = parseFloat(percentage) || 0;
    const calculatedAmount = amount ? parseFloat(amount) : Math.round((pct / 100) * finalContract);
    const nextTerminNumber = (project.payments[0]?.termin_number || 0) + 1;

    const payment = await prisma.payment.create({
      data: {
        project_id: pId,
        termin_number: nextTerminNumber,
        termin_name: terminName,
        percentage: pct,
        amount: calculatedAmount,
        status: 'UNPAID',
        due_date: dueDate ? new Date(dueDate) : null,
        notes: notes || '',
      },
    });

    return NextResponse.json({
      success: true,
      message: `Tagihan ${terminName} berhasil diterbitkan (Nominal: Rp ${new Intl.NumberFormat('id-ID').format(calculatedAmount)})`,
      payment,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PATCH: Update payment status (Upload Proof, Verify Paid + Receipt, Reject, Update Termin)
export async function PATCH(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    const user = token ? await verifyToken(token) : null;

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // PM & Mandor forbidden
    if (['PM', 'MANDOR'].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: 'Role Anda tidak memiliki akses ke modul pembayaran' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { paymentId, proofUrl, receiptUrl, rejectionReason, action, terminName, amount, percentage, dueDate, notes } = body;

    if (!paymentId) {
      return NextResponse.json({ success: false, error: 'Payment ID wajib disertakan' }, { status: 400 });
    }

    const payment = await prisma.payment.findUnique({
      where: { id: Number(paymentId) },
      include: {
        project: {
          include: {
            sCurveProgress: { orderBy: { week_number: 'desc' }, take: 1 },
            payments: true,
          },
        },
      },
    });

    if (!payment) {
      return NextResponse.json({ success: false, error: 'Data pembayaran tidak ditemukan' }, { status: 404 });
    }

    // ACTION 1: CLIENT UPLOADS TRANSFER PROOF
    if (action === 'upload_proof') {
      if (user.role !== 'CLIENT' && user.role !== 'OWNER') {
        return NextResponse.json(
          { success: false, error: 'Hanya Klien atau Owner yang dapat mengunggah bukti bayar' },
          { status: 403 }
        );
      }

      if (!proofUrl) {
        return NextResponse.json({ success: false, error: 'URL bukti transfer wajib disertakan' }, { status: 400 });
      }

      const updated = await prisma.payment.update({
        where: { id: payment.id },
        data: {
          proof_url: proofUrl,
          status: 'PENDING_VERIFICATION',
          rejection_reason: null, // Clear any previous rejection
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Bukti transfer berhasil diunggah! Finance Admin akan segera memverifikasi pembayaran Anda.',
        payment: updated,
      });
    }

    // ACTION 2: FINANCE VERIFIES PAYMENT & PUBLISHES OFFICIAL RECEIPT
    if (action === 'verify_paid') {
      if (user.role !== 'FINANCE' && user.role !== 'OWNER') {
        return NextResponse.json(
          { success: false, error: 'Hanya Finance Admin atau Direktur yang berwenang memverifikasi pembayaran' },
          { status: 403 }
        );
      }

      const officialReceipt = receiptUrl || payment.receipt_url || '/main-assets/docs/Kwitansi-Resmi-DP-HaloBangun.pdf';

      const updated = await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'PAID',
          paid_at: new Date(),
          receipt_url: officialReceipt,
          rejection_reason: null,
        },
      });

      // Check Automatic BAST & Garansi Unlock Condition:
      // Condition: S-Curve >= 100% AND ALL payments are PAID
      const allPayments = await prisma.payment.findMany({
        where: { project_id: payment.project_id },
      });
      const allPaid = allPayments.every((p) => p.status === 'PAID');
      const latestSCurve = payment.project.sCurveProgress[0]?.cumulative_actual || payment.project.sCurveProgress[0]?.actual_percentage || 0;

      let bastUnlocked = false;
      if (allPaid && latestSCurve >= 100) {
        await prisma.project.update({
          where: { id: payment.project_id },
          data: { bast_unlocked: true, status: 'COMPLETED' },
        });

        // Unlock BAST & Garansi documents
        await prisma.projectDocument.updateMany({
          where: {
            project_id: payment.project_id,
            doc_type: { in: ['BAST', 'GARANSI'] },
          },
          data: { is_locked: false },
        });

        bastUnlocked = true;
      }

      return NextResponse.json({
        success: true,
        message: `Pembayaran ${payment.termin_name} berhasil diverifikasi lunas (PAID) dan kwitansi resmi telah diterbitkan!`,
        payment: updated,
        bastUnlocked,
      });
    }

    // ACTION 3: FINANCE REJECTS TRANSFER PROOF
    if (action === 'reject_proof') {
      if (user.role !== 'FINANCE' && user.role !== 'OWNER') {
        return NextResponse.json(
          { success: false, error: 'Hanya Finance Admin atau Direktur yang dapat menolak bukti bayar' },
          { status: 403 }
        );
      }

      const reason = rejectionReason || 'Bukti transfer tidak terbaca / nominal tidak sesuai tagihan.';

      const updated = await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'REJECTED',
          rejection_reason: reason,
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Bukti transfer ditolak. Klien akan menerima catatan untuk mengunggah ulang bukti yang valid.',
        payment: updated,
      });
    }

    // ACTION 4: EDIT TERMIN DATA (FINANCE / OWNER)
    if (action === 'update_termin') {
      if (user.role !== 'FINANCE' && user.role !== 'OWNER') {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
      }

      const updated = await prisma.payment.update({
        where: { id: payment.id },
        data: {
          termin_name: terminName ?? payment.termin_name,
          amount: amount !== undefined ? parseFloat(amount) : payment.amount,
          percentage: percentage !== undefined ? parseFloat(percentage) : payment.percentage,
          due_date: dueDate ? new Date(dueDate) : payment.due_date,
          notes: notes ?? payment.notes,
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Informasi termin berhasil diperbarui',
        payment: updated,
      });
    }

    return NextResponse.json({ success: false, error: 'Aksi tidak dikenali' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE: Delete termin (Finance / Owner, only if not PAID)
export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    const user = token ? await verifyToken(token) : null;

    if (!user || (user.role !== 'FINANCE' && user.role !== 'OWNER')) {
      return NextResponse.json(
        { success: false, error: 'Hanya Finance Admin atau Direktur yang dapat menghapus termin' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID Tagihan wajib disertakan' }, { status: 400 });
    }

    const payment = await prisma.payment.findUnique({ where: { id: Number(id) } });
    if (!payment) {
      return NextResponse.json({ success: false, error: 'Tagihan tidak ditemukan' }, { status: 404 });
    }

    if (payment.status === 'PAID') {
      return NextResponse.json(
        { success: false, error: 'Tagihan yang sudah berstatus LUNAS (PAID) tidak dapat dihapus' },
        { status: 400 }
      );
    }

    await prisma.payment.delete({ where: { id: payment.id } });

    return NextResponse.json({
      success: true,
      message: `Tagihan ${payment.termin_name} berhasil dihapus`,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
