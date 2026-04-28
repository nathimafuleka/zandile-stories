import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminFromRequest } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const admin = verifyAdminFromRequest(request)
    if (!admin) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'today' // today, week, month, year, custom
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    let dateFilter: any = {}
    const now = new Date()

    switch (period) {
      case 'today':
        const todayStart = new Date(now.setHours(0, 0, 0, 0))
        dateFilter = { gte: todayStart }
        break
      case 'week':
        const weekStart = new Date(now.setDate(now.getDate() - 7))
        dateFilter = { gte: weekStart }
        break
      case 'month':
        const monthStart = new Date(now.setDate(now.getDate() - 30))
        dateFilter = { gte: monthStart }
        break
      case 'year':
        const yearStart = new Date(now.setFullYear(now.getFullYear() - 1))
        dateFilter = { gte: yearStart }
        break
      case 'custom':
        if (startDate && endDate) {
          dateFilter = {
            gte: new Date(startDate),
            lte: new Date(endDate)
          }
        }
        break
    }

    const transactions = await prisma.transaction.findMany({
      where: {
        createdAt: dateFilter,
        status: 'completed'
      },
      orderBy: { createdAt: 'desc' }
    })

    const totalEarnings = transactions.reduce((sum: number, t: any) => {
      return sum + (t.type === 'refund' ? -Number(t.amount) : Number(t.amount))
    }, 0)

    const salesCount = transactions.filter((t: any) => t.type === 'sale').length
    const refundsCount = transactions.filter((t: any) => t.type === 'refund').length

    return NextResponse.json({
      totalEarnings,
      salesCount,
      refundsCount,
      transactions,
      period
    })
  } catch (error) {
    console.error('Fetch earnings error:', error)
    return NextResponse.json(
      { message: 'Failed to fetch earnings' },
      { status: 500 }
    )
  }
}
