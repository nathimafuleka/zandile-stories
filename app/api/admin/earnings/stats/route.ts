import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminFromRequest } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const admin = verifyAdminFromRequest(request)
    if (!admin) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date()
    const todayStart = new Date(now.setHours(0, 0, 0, 0))
    const weekStart = new Date(now.setDate(now.getDate() - 7))
    const monthStart = new Date(now.setDate(now.getDate() - 30))
    const yearStart = new Date(now.setFullYear(now.getFullYear() - 1))

    const [todayEarnings, weekEarnings, monthEarnings, yearEarnings, totalEarnings] = await Promise.all([
      prisma.transaction.aggregate({
        where: { createdAt: { gte: todayStart }, status: 'completed', type: 'sale' },
        _sum: { amount: true },
        _count: true
      }),
      prisma.transaction.aggregate({
        where: { createdAt: { gte: weekStart }, status: 'completed', type: 'sale' },
        _sum: { amount: true },
        _count: true
      }),
      prisma.transaction.aggregate({
        where: { createdAt: { gte: monthStart }, status: 'completed', type: 'sale' },
        _sum: { amount: true },
        _count: true
      }),
      prisma.transaction.aggregate({
        where: { createdAt: { gte: yearStart }, status: 'completed', type: 'sale' },
        _sum: { amount: true },
        _count: true
      }),
      prisma.transaction.aggregate({
        where: { status: 'completed', type: 'sale' },
        _sum: { amount: true },
        _count: true
      })
    ])

    return NextResponse.json({
      today: {
        amount: Number(todayEarnings._sum.amount || 0),
        count: todayEarnings._count
      },
      week: {
        amount: Number(weekEarnings._sum.amount || 0),
        count: weekEarnings._count
      },
      month: {
        amount: Number(monthEarnings._sum.amount || 0),
        count: monthEarnings._count
      },
      year: {
        amount: Number(yearEarnings._sum.amount || 0),
        count: yearEarnings._count
      },
      total: {
        amount: Number(totalEarnings._sum.amount || 0),
        count: totalEarnings._count
      }
    })
  } catch (error) {
    console.error('Fetch stats error:', error)
    return NextResponse.json(
      { message: 'Failed to fetch statistics' },
      { status: 500 }
    )
  }
}
