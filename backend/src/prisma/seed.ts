import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create users
  const passwordHash = await bcrypt.hash('Admin@1234', 12);

  const rahul = await prisma.user.upsert({
    where: { email: 'rahul.mehta@pharmatech.in' },
    update: {},
    create: {
      email: 'rahul.mehta@pharmatech.in',
      passwordHash,
      name: 'Rahul Mehta',
      role: 'QA_MANAGER',
      department: 'Quality Assurance',
    },
  });

  await prisma.user.upsert({
    where: { email: 'priya.sharma@pharmatech.in' },
    update: {},
    create: {
      email: 'priya.sharma@pharmatech.in',
      passwordHash,
      name: 'Priya Sharma',
      role: 'WAREHOUSE_MANAGER',
      department: 'Warehouse',
    },
  });

  await prisma.user.upsert({
    where: { email: 'admin@pharmatech.in' },
    update: {},
    create: {
      email: 'admin@pharmatech.in',
      passwordHash,
      name: 'Admin User',
      role: 'ADMIN',
      department: 'IT',
    },
  });

  // Create a vendor
  const cipla = await prisma.vendor.upsert({
    where: { vendorCode: 'VEN-001' },
    update: {},
    create: {
      vendorCode: 'VEN-001',
      companyName: 'Cipla Ltd.',
      category: 'API_AND_FDF',
      drugLicenseNo: 'MH-DL-001234',
      gmpCertification: 'WHO-GMP',
      qaRating: 'A+',
      qaPassRatePct: 98.5,
      status: 'APPROVED',
    },
  });

  // Create sensors
  const sensorData = [
    { sensorId: 'CR-A-01', name: 'Cold Room A - Sensor 1', location: 'Cold Room A', siteCode: 'MH-SITE-01', minSpecC: 2, maxSpecC: 8 },
    { sensorId: 'CR-B-01', name: 'Cold Room B - Sensor 1', location: 'Cold Room B', siteCode: 'MH-SITE-01', minSpecC: 2, maxSpecC: 8 },
    { sensorId: 'VH-01', name: 'Vehicle - Sensor 1', location: 'Vehicle', siteCode: 'MH-SITE-01', minSpecC: 2, maxSpecC: 8 },
  ];

  for (const s of sensorData) {
    await prisma.sensor.upsert({ where: { sensorId: s.sensorId }, update: {}, create: s });
  }

  console.log('Seed completed');
  console.log('Users: rahul.mehta@pharmatech.in, priya.sharma@pharmatech.in, admin@pharmatech.in');
  console.log('Password: Admin@1234');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
