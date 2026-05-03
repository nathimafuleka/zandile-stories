import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// Public endpoint to get settings (for displaying unlock prices, etc.)
export async function GET() {
  try {
    let settings = await prisma.settings.findFirst()

    // If no settings exist, create default settings
    if (!settings) {
      settings = await (prisma as any).settings.create({
        data: {
          downloadPriceCard: 65,
          downloadPriceBank: 60,
          unlockChapterPriceCard: 35,
          unlockChapterPriceBank: 30,
        }
      })
    }

    return NextResponse.json({
      settings: {
        ...settings,
        downloadPriceCard: Number((settings as any).downloadPriceCard || 65),
        downloadPriceBank: Number((settings as any).downloadPriceBank || 60),
        unlockChapterPriceCard: Number(settings?.unlockChapterPriceCard || 35),
        unlockChapterPriceBank: Number(settings?.unlockChapterPriceBank || 30),
      }
    })
  } catch (error) {
    console.error('Get settings error:', error)
    return NextResponse.json(
      { message: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}
