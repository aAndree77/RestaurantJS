const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function fixUserRoles() {
  try {
    console.log('🔧 Fixing user roles...')
    
    // Obține toți utilizatorii
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    })
    
    console.log(`\n📋 Found ${users.length} users:`)
    
    let updatedCount = 0
    for (const user of users) {
      console.log(`  - ${user.email}: ${user.role || 'NO ROLE'}`)
      
      // Dacă nu are rol setat, setează-l la "user"
      if (!user.role) {
        await prisma.user.update({
          where: { id: user.id },
          data: { role: 'user' }
        })
        console.log(`    ✅ Set role to 'user'`)
        updatedCount++
      }
    }
    
    console.log(`\n✅ Updated ${updatedCount} users to have 'user' role`)
    
    // Afișează toți adminii
    const admins = await prisma.admin.findMany({
      select: {
        email: true,
        name: true,
        role: true
      }
    })
    
    console.log('\n👑 All admins:')
    admins.forEach(a => {
      console.log(`  - ${a.email}: ${a.role}`)
    })
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixUserRoles()
