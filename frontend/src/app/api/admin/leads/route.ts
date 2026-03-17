import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/server/prisma';
import { validateAdminKey } from '@/lib/server/admin-guard';

export async function GET(req: NextRequest) {
  const unauthorized = validateAdminKey(req);
  if (unauthorized) return unauthorized;

  try {
    const { searchParams } = req.nextUrl;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const utmSource = searchParams.get('utm_source');
    const confirmado = searchParams.get('confirmado');

    const where: Record<string, unknown> = {};

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) (where.createdAt as Record<string, unknown>).gte = new Date(dateFrom);
      if (dateTo) (where.createdAt as Record<string, unknown>).lte = new Date(dateTo + 'T23:59:59');
    }

    if (utmSource) {
      where.utms = { utmSource };
    }

    if (confirmado !== null && confirmado !== undefined && confirmado !== '') {
      where.confirmado = confirmado === 'true';
    }

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        include: { utms: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.lead.count({ where }),
    ]);

    return NextResponse.json({
      leads,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error getting leads:', error);
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 });
  }
}
