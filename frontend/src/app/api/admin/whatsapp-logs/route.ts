import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/server/prisma';
import { validateAdminKey } from '@/lib/server/admin-guard';

export async function GET(req: NextRequest) {
  const unauthorized = validateAdminKey(req);
  if (unauthorized) return unauthorized;

  try {
    const logs = await prisma.whatsappLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        lead: {
          select: { nome: true, telefone: true, email: true },
        },
      },
    });

    return NextResponse.json(logs);
  } catch (error) {
    console.error('Error getting whatsapp logs:', error);
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 });
  }
}
