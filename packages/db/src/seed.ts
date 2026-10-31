import { prisma } from './index'

async function main() {
  const user = await prisma.user.create({
    data: {
      email: 'test@gmail.com',
      name: 'testuser',
    },
  })

  console.log('created user:', user)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
