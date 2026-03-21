import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/server/prisma';
import { validateAdminKey } from '@/lib/server/admin-guard';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const unauthorized = validateAdminKey(req);
  if (unauthorized) return unauthorized;

  try {
    const { id } = await params;

    const sorteio = await prisma.sorteio.findUnique({
      where: { id },
      include: {
        _count: { select: { leads: true } },
      },
    });

    if (!sorteio) {
      return NextResponse.json({ message: 'Sorteio não encontrado' }, { status: 404 });
    }

    return NextResponse.json(sorteio);
  } catch (error) {
    console.error('Error getting sorteio:', error);
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 });
  }
}
