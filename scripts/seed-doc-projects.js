const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- Memulai Seeding Dokumen & Proyek dari Folder doc/ ---');

  // Fix sequences first
  const tables = ['projects', 'addendums', 'payments', 's_curve_progress', 'payrolls', 'daily_reports', 'users', 'warranty_claims'];
  for (const t of tables) {
    try {
      await prisma.$executeRawUnsafe(`SELECT setval(pg_get_serial_sequence('${t}', 'id'), COALESCE(max(id), 0) + 1, false) FROM ${t};`);
    } catch (e) {}
  }

  // 1. Client Dr. Bambang Hari Priyambodo
  const clientBambang = await prisma.user.upsert({
    where: { email: 'bambang@gmail.com' },
    update: { name: 'Bpk. Dr. Bambang Hari Priyambodo' },
    create: {
      email: 'bambang@gmail.com',
      password: 'password123',
      name: 'Bpk. Dr. Bambang Hari Priyambodo',
      role: 'CLIENT',
    },
  });
  console.log('Client Bambang ready:', clientBambang.name);

  // 2. Client Bapak Eko Yuwono & Ibu Sri Mahargiantie
  const clientEko = await prisma.user.upsert({
    where: { email: 'ekoyuwono@gmail.com' },
    update: { name: 'Bpk. Eko Yuwono & Ibu Sri Mahargiantie' },
    create: {
      email: 'ekoyuwono@gmail.com',
      password: 'password123',
      name: 'Bpk. Eko Yuwono & Ibu Sri Mahargiantie',
      role: 'CLIENT',
    },
  });
  console.log('Client Eko ready:', clientEko.name);

  // 3. Proyek: Renovasi Rumah 1 Lantai Bapak Bambang
  let projectBambang = await prisma.project.findFirst({
    where: { name: { contains: 'Bambang' } },
  });

  if (!projectBambang) {
    projectBambang = await prisma.project.create({
      data: {
        name: 'Renovasi Rumah 1 (Satu) Lantai Bapak Dr. Bambang',
        category: 'RENOVASI',
        location: 'Sariharjo, Kec. Ngaglik, Kab. Sleman - Daerah Istimewa Yogyakarta',
        contract_value: 90548686,
        status: 'ONGOING',
        client_id: clientBambang.id,
        pm_id: 3, // Dimas Pratama
        bast_unlocked: false,
        startDate: new Date('2026-10-27'),
        targetCompletionDate: new Date('2026-12-10'),
      },
    });
    console.log('Project Bambang created ID:', projectBambang.id);
  } else {
    await prisma.project.update({
      where: { id: projectBambang.id },
      data: {
        contract_value: 90548686,
        client_id: clientBambang.id,
      },
    });
    console.log('Project Bambang updated ID:', projectBambang.id);
  }

  // S-Curve Bambang (6 Minggu)
  await prisma.sCurveProgress.deleteMany({ where: { project_id: projectBambang.id } });
  const scurveData = [
    { week_number: 1, planned_cost: 10526284, planned_percentage: 11.63, actual_cost: 10526284, actual_percentage: 11.63, cumulative_planned: 11.63, cumulative_actual: 11.63, status: 'Completed' },
    { week_number: 2, planned_cost: 15215799, planned_percentage: 16.80, actual_cost: 15215799, actual_percentage: 16.80, cumulative_planned: 28.43, cumulative_actual: 28.43, status: 'Completed' },
    { week_number: 3, planned_cost: 12408389, planned_percentage: 13.70, actual_cost: 12408389, actual_percentage: 13.70, cumulative_planned: 42.13, cumulative_actual: 42.13, status: 'Completed' },
    { week_number: 4, planned_cost: 28056637, planned_percentage: 30.99, actual_cost: 28056637, actual_percentage: 30.99, cumulative_planned: 73.12, cumulative_actual: 73.12, status: 'Completed' },
    { week_number: 5, planned_cost: 17928640, planned_percentage: 19.80, actual_cost: 17928640, actual_percentage: 19.80, cumulative_planned: 92.92, cumulative_actual: 92.92, status: 'In Progress' },
    { week_number: 6, planned_cost: 6412937, planned_percentage: 7.08, actual_cost: 0, actual_percentage: 0.00, cumulative_planned: 100.00, cumulative_actual: 92.92, status: 'On Hold' },
  ];
  for (const item of scurveData) {
    await prisma.sCurveProgress.create({
      data: {
        project_id: projectBambang.id,
        ...item,
      },
    });
  }
  console.log('S-Curve Bambang seeded (6 weeks)');

  // Addendum Bambang
  await prisma.addendum.deleteMany({ where: { project_id: projectBambang.id } });
  await prisma.addendum.create({
    data: {
      project_id: projectBambang.id,
      description: 'Addendum 1: Tambah Kurang Renovasi Rumah 1 Lantai - Pekerjaan tambah plesteran acian, perbaikan instalasi pipa air kotor, penambahan titik lampu teras belakang, dan penggantian material keramik dinding.',
      cost_difference: 12219996,
      status: 'APPROVED',
    },
  });

  // Termin Pembayaran Bambang (SPKPR)
  await prisma.payment.deleteMany({ where: { project_id: projectBambang.id } });
  await prisma.payment.createMany({
    data: [
      {
        project_id: projectBambang.id,
        termin_number: 1,
        termin_name: 'DP 30% Saat Penandatanganan SPKPR',
        percentage: 30,
        amount: 27164605,
        due_date: new Date('2026-10-27'),
        status: 'PAID',
        paid_at: new Date('2026-10-28'),
        proof_url: 'https://i.ibb.co.com/84XfL5g8/proof-dp-bambang.jpg',
        receipt_url: 'https://i.ibb.co.com/39665L1r/kwitansi-dp-bambang.jpg',
        notes: 'Pelunasan Uang Muka SPKPR Proyek Renovasi Bambang',
      },
      {
        project_id: projectBambang.id,
        termin_number: 2,
        termin_name: 'Termin I (Progres Fisik 50%)',
        percentage: 30,
        amount: 27164605,
        due_date: new Date('2026-11-15'),
        status: 'PAID',
        paid_at: new Date('2026-11-16'),
        proof_url: 'https://i.ibb.co.com/4gS1wZ6X/proof-termin1-bambang.jpg',
        receipt_url: 'https://i.ibb.co.com/QvYg0KqF/kwitansi-termin1-bambang.jpg',
        notes: 'Sesuai Verifikasi BAP Progres Lapangan Minggu ke-3 (42.13%)',
      },
      {
        project_id: projectBambang.id,
        termin_number: 3,
        termin_name: 'Termin II (Progres Fisik 75%)',
        percentage: 20,
        amount: 18109737,
        due_date: new Date('2026-11-28'),
        status: 'PENDING_VERIFICATION',
        proof_url: 'https://i.ibb.co.com/LhB27zJ0/transfer-termin2.jpg',
        notes: 'Bukti transfer diunggah klien, menunggu verifikasi finance',
      },
      {
        project_id: projectBambang.id,
        termin_number: 4,
        termin_name: 'Termin III / Pelunasan 100% & BAST',
        percentage: 20,
        amount: 18109739,
        due_date: new Date('2026-12-10'),
        status: 'UNPAID',
        notes: 'Pelunasan sebelum penerbitan dokumen BAST & Masa Garansi 60 Hari',
      },
    ],
  });
  console.log('Termin Bambang seeded (4 termin)');

  // 4. Proyek: Pembangunan Paviliun & Ruang Penjaga Eko Yuwono
  let projectEko = await prisma.project.findFirst({
    where: { name: { contains: 'Eko Yuwono' } },
  });

  if (!projectEko) {
    projectEko = await prisma.project.create({
      data: {
        name: 'Pembangunan 4 Unit Paviliun & 1 Ruang Penjaga Eko Yuwono',
        category: 'PEMBANGUNAN',
        location: 'Santan Gg. V No. 57 RT 009 RW 029 Santan, Kalongan, Maguwoharjo, Sleman – DIY',
        contract_value: 385000000,
        status: 'COMPLETED',
        client_id: clientEko.id,
        pm_id: 3,
        bast_unlocked: true, // Proyek selesai dan lunas, BAST resmi terbuka!
        startDate: new Date('2024-01-05'),
        targetCompletionDate: new Date('2024-03-18'),
      },
    });
    console.log('Project Eko Yuwono created ID:', projectEko.id);
  }

  // Warranty Claims (Form Perbaikan Bangunan Eko Yuwono)
  await prisma.warrantyClaim.deleteMany({ where: { project_id: projectEko.id } });
  await prisma.warrantyClaim.createMany({
    data: [
      {
        project_id: projectEko.id,
        claim_date: new Date('2024-03-25'),
        item_name: 'Pengecatan ulang retak rambut plesteran dinding kamar penjaga',
        description: 'Ditemukan retak rambut pasca pengeringan acian pada sisi barat ruang penjaga.',
        status: 'SELESAI',
        repaired_at: new Date('2024-03-27'),
        notes: 'Telah diperbaiki oleh tim tukang Halo Bangun, finishing cat Jotun Jotaplast warna White.',
      },
      {
        project_id: projectEko.id,
        claim_date: new Date('2024-04-02'),
        item_name: 'Perbaikan kemiringan buangan air floor drain & nat toilet unit 2',
        description: 'Air agak menggenang saat mandi di sudut dekat pintu shower paviliun unit 2.',
        status: 'SELESAI',
        repaired_at: new Date('2024-04-04'),
        notes: 'Nat dibongkar sedikit dan slope dinaikkan 5mm ke arah floor drain, air mengalir lancar.',
      },
      {
        project_id: projectEko.id,
        claim_date: new Date('2024-04-20'),
        item_name: 'Penyetelan engsel dan kunci silinder pintu utama paviliun unit 4',
        description: 'Pintu agak seret saat ditutup pada waktu siang hari karena muai kayu.',
        status: 'SELESAI',
        repaired_at: new Date('2024-04-21'),
        notes: 'Ketam halus 1.5mm pada bagian bawah dan pelumasan silinder kunci Dekkson.',
      },
    ],
  });
  console.log('Warranty Claims Eko Yuwono seeded (3 items)');

  // 5. Authentic PT AIG Slip Gaji Seed
  await prisma.payroll.deleteMany({
    where: { period: 'November 2026' },
  });

  const sukirno = await prisma.user.findFirst({ where: { email: 'mandor@halobangun.id' } });
  const dimas = await prisma.user.findFirst({ where: { email: 'pm@halobangun.id' } });

  if (sukirno) {
    const breakdownMandor = {
      nik: 'AIG-2024-089',
      job_title: 'Mandor Lapangan Proyek',
      company_name: 'PT. AULIA INDOLAND GRUP',
      period: 'November 2026',
      bank_account: 'Bank Mandiri - 137-00-1928374-1 (Sukirno)',
      earnings: {
        base_salary: 4500000,
        allowance_jabatan: 750000,
        meal_allowance: 650000,
        transport_allowance: 400000,
        tenure_allowance: 200000,
        education_allowance: 0,
        functional_allowance: 0,
        overtime: 350000,
        other_allowance: 200000,
        bonus: 500000,
        total_gross: 7550000,
      },
      deductions: {
        late_deduction: 0,
        pph21: 125000,
        bpjs_tk: 85000,
        bpjs_kes: 45000,
        loan_installment: 0,
        cash_bon: 200000,
        other_deduction: 0,
        social_fund: 20000,
        total_deduction: 475000,
      },
      net_salary: 7075000,
      terbilang: 'Tujuh Juta Tujuh Puluh Lima Ribu Rupiah',
      signature_place: 'Yogyakarta',
      signature_date: '28 November 2026',
    };

    await prisma.payroll.create({
      data: {
        user_id: sukirno.id,
        project_id: projectBambang.id,
        period: 'November 2026',
        base_salary: 4500000,
        operational_allowance: 1750000,
        bonus: 500000,
        total_amount: 7075000,
        breakdown: breakdownMandor,
        status: 'PAID',
        paid_date: new Date('2026-11-28'),
      },
    });
    console.log('Slip Gaji Sukirno (Mandor) seeded with PT AIG breakdown');
  }

  if (dimas) {
    const breakdownPM = {
      nik: 'AIG-2023-014',
      job_title: 'Project Manager & Site Engineer',
      company_name: 'PT. AULIA INDOLAND GRUP',
      period: 'November 2026',
      bank_account: 'Bank BCA - 869-123-9871 (Dimas Pratama)',
      earnings: {
        base_salary: 6500000,
        allowance_jabatan: 1500000,
        meal_allowance: 750000,
        transport_allowance: 500000,
        tenure_allowance: 300000,
        education_allowance: 250000,
        functional_allowance: 500000,
        overtime: 0,
        other_allowance: 300000,
        bonus: 1000000,
        total_gross: 11600000,
      },
      deductions: {
        late_deduction: 0,
        pph21: 280000,
        bpjs_tk: 140000,
        bpjs_kes: 65000,
        loan_installment: 0,
        cash_bon: 0,
        other_deduction: 0,
        social_fund: 25000,
        total_deduction: 510000,
      },
      net_salary: 11090000,
      terbilang: 'Sebelas Juta Sembilan Puluh Ribu Rupiah',
      signature_place: 'Yogyakarta',
      signature_date: '28 November 2026',
    };

    await prisma.payroll.create({
      data: {
        user_id: dimas.id,
        project_id: projectBambang.id,
        period: 'November 2026',
        base_salary: 6500000,
        operational_allowance: 2750000,
        bonus: 1000000,
        total_amount: 11090000,
        breakdown: breakdownPM,
        status: 'PAID',
        paid_date: new Date('2026-11-28'),
      },
    });
    console.log('Slip Gaji Dimas (PM) seeded with PT AIG breakdown');
  }

  console.log('--- Seeding Selesai Sukses! ---');
}

main()
  .catch((e) => {
    console.error('Error seeding doc projects:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
