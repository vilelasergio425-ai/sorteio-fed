import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/server/prisma';
import { validateAdminKey } from '@/lib/server/admin-guard';

export async function GET(req: NextRequest) {
  const unauthorized = validateAdminKey(req);
  if (unauthorized) return unauthorized;

  try {
    const totalLeads = await prisma.lead.count();
    const confirmados = await prisma.lead.count({ where: { confirmado: true } });
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const leadsHoje = await prisma.lead.count({ where: { createdAt: { gte: hoje } } });
    const whatsappEnviados = await prisma.whatsappLog.count({ where: { status: 'sent' } });

    return NextResponse.json({
      totalLeads,
      confirmados,
      leadsHoje,
      whatsappEnviados,
    });
  } catch (error) {
    console.error('Error getting overview:', error);
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 });
  }
}
