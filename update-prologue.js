const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function updatePrologueChapters() {
  try {
    // Update all chapters where order is 1 (first chapter/prologue)
    const result = await prisma.chapter.updateMany({
      where: {
        order: 1
      },
      data: {
        isLocked: false
      }
    })

    console.log(`✅ Updated ${result.count} prologue chapter(s) to unlocked status`)
    
    // Also update any chapters with 'prologue' in title
    const chapters = await prisma.chapter.findMany()
    let prologueCount = 0
    
    for (const chapter of chapters) {
      if (chapter.title.toLowerCase().includes('prologue') && chapter.isLocked) {
        await prisma.chapter.update({
          where: { id: chapter.id },
          data: { isLocked: false }
        })
        prologueCount++
      }
    }
    
    if (prologueCount > 0) {
      console.log(`✅ Updated ${prologueCount} additional prologue chapter(s) by title`)
    }
  } catch (error) {
    console.error('❌ Error updating prologue chapters:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updatePrologueChapters()
