import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/server/prisma';
import { validateAdminKey } from '@/lib/server/admin-guard';

export async function GET(req: NextRequest) {
  const unauthorized = validateAdminKey(req);
  if (unauthorized) return unauthorized;

  try {
    const sorteios = await prisma.sorteio.findMany({
      orderBy: { numero: 'desc' },
      include: {
        _count: { select: { leads: true } },
      },
    });

    return NextResponse.json(sorteios);
  } catch (error) {
    console.error('Error getting sorteios:', error);
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 });
  }
}
