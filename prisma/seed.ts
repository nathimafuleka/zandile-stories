import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  console.log('📝 Creating roles...')
  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: {
      name: 'admin',
    },
  })
  console.log('✅ Admin role created:', adminRole.id)

  const userRole = await prisma.role.upsert({
    where: { name: 'user' },
    update: {},
    create: {
      name: 'user',
    },
  })
  console.log('✅ User role created:', userRole.id)

  console.log('👤 Creating default admin account...')
  const hashedPassword = await bcrypt.hash('Mafuleka55', 10)
  
  const admin = await prisma.admin.upsert({
    where: { email: 'admim@zandilem.co.za' },
    update: {},
    create: {
      name: 'Zandile Mafuleka',
      email: 'admim@zandilem.co.za',
      password: hashedPassword,
      roleId: adminRole.id,
    },
  })
  console.log('✅ Admin account created:', admin.email)
  console.log('   Email: admim@zandilem.co.za')
  console.log('   ⚠️  Please change this password after first login!')

  console.log('\n✨ Seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
