import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/server/prisma';
import { maskName, maskEmail, maskPhone } from '@/lib/server/mask';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    const { token } = await params;

    const access = await prisma.leadAccess.findUnique({
      where: { token },
      include: {
        lead: {
          include: {
            numbers: { select: { numero: true } },
          },
        },
      },
    });

    if (!access) {
      return NextResponse.json({ message: 'Participante não encontrado' }, { status: 404 });
    }

    const { lead } = access;

    return NextResponse.json({
      nome: maskName(lead.nome),
      email: maskEmail(lead.email),
      telefone: maskPhone(lead.telefone),
      numeros: lead.numbers.map((n) => n.numero),
      confirmado: lead.confirmado,
    });
  } catch (error) {
    console.error('Error getting participant:', error);
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 });
  }
}
