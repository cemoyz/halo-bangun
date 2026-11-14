const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Sync Postgres sequence to avoid P2002 duplicate key constraint
  try {
    await prisma.$executeRawUnsafe(`
      SELECT setval(pg_get_serial_sequence('project_financial_allocations', 'id'), COALESCE(max(id), 0) + 1, false) 
      FROM project_financial_allocations;
    `);
    console.log('Sequence reset successful');
  } catch (err) {
    console.warn('Sequence reset warning:', err.message);
  }

  const data = [
    {
      project_id: 5,
      real_cost: 145000000,
      net_profit: 41820400,
      tax_amount: 1950000,
      zakat_amount: 1045510,
      operational_amount: 15000000,
      mitigation_fund: 5000000,
      business_dev_fund: 18824890,
      debt_receivable_notes: 'Retensi termin terakhir 10% dibayarkan pasca BAST'
    },
    {
      project_id: 6,
      real_cost: 71200000,
      net_profit: 19348686,
      tax_amount: 905486,
      zakat_amount: 483717,
      operational_amount: 6000000,
      mitigation_fund: 2000000,
      business_dev_fund: 9959483,
      debt_receivable_notes: 'Termin II (75%) menunggu konfirmasi mutasi bank'
    },
    {
      project_id: 7,
      real_cost: 298000000,
      net_profit: 87000000,
      tax_amount: 3850000,
      zakat_amount: 2175000,
      operational_amount: 25000000,
      mitigation_fund: 10000000,
      business_dev_fund: 45975000,
      debt_receivable_notes: 'Lunas 100%, seluruh kwitansi dan BAST diterbitkan'
    }
  ];

  for (const d of data) {
    const existing = await prisma.projectFinancialAllocation.findUnique({ where: { project_id: d.project_id } });
    if (!existing) {
      await prisma.projectFinancialAllocation.create({ data: d });
      console.log('Created allocation for project', d.project_id);
    }
  }

  // Also ensure Project 4 has pm_id: 3 (Dimas Pratama) and Project 5 has pm_id: 9 (Arizal) or 3
  await prisma.project.update({ where: { id: 4 }, data: { pm_id: 3 } });
  console.log('Updated project 4 with pm_id 3');

  await prisma.$disconnect();
}

main().catch(console.error);
