import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create sample products
  const products = [
    {
      barcode: '1234567890123',
      name: 'Wireless Mouse',
      supplier: 'Logitech',
      warrantyMonths: 24
    },
    {
      barcode: '9876543210987',
      name: 'USB-C Cable',
      supplier: 'Anker',
      warrantyMonths: 12
    },
    {
      barcode: '5551234567890',
      name: 'Laptop Stand',
      supplier: 'Amazon Basics',
      warrantyMonths: 12
    },
    {
      barcode: '7778889990001',
      name: 'Mechanical Keyboard',
      supplier: 'Keychron',
      warrantyMonths: 36
    },
    {
      barcode: '1112223334445',
      name: 'Webcam HD',
      supplier: 'Logitech',
      warrantyMonths: 24
    }
  ]

  for (const product of products) {
    const created = await prisma.product.upsert({
      where: { barcode: product.barcode },
      update: {},
      create: product
    })
    console.log(`✅ Created product: ${created.name} (${created.barcode})`)
  }

  // Create sample user
  const user = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      email: 'demo@example.com',
      name: 'Demo User',
      role: 'admin'
    }
  })
  console.log(`✅ Created user: ${user.email}`)

  console.log('✨ Seeding complete!')
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
