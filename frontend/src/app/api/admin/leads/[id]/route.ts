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

    const lead = await prisma.lead.findUnique({
      where: { id },
      include: {
        numbers: { select: { numero: true } },
        utms: true,
        whatsappLogs: { orderBy: { createdAt: 'desc' } },
        confirmations: true,
        access: { select: { token: true } },
      },
    });

    if (!lead) {
      return NextResponse.json({ message: 'Lead não encontrado' }, { status: 404 });
    }

    return NextResponse.json(lead);
  } catch (error) {
    console.error('Error getting lead detail:', error);
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 });
  }
}
