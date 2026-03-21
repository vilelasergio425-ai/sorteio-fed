import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/server/prisma';
import { validateAdminKey } from '@/lib/server/admin-guard';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const unauthorized = validateAdminKey(req);
  if (unauthorized) return unauthorized;

  try {
    const { id } = await params;
    const body = await req.json();
    const { numeroGanhador, iniciarNovo } = body;

    if (numeroGanhador === undefined || numeroGanhador === null) {
      return NextResponse.json({ message: 'Número ganhador é obrigatório' }, { status: 400 });
    }

    const numero = parseInt(String(numeroGanhador));
    if (isNaN(numero) || numero < 0 || numero > 99999) {
      return NextResponse.json({ message: 'Número deve ser entre 0 e 99999' }, { status: 400 });
    }

    const sorteio = await prisma.sorteio.findUnique({
      where: { id },
      include: { leads: { select: { id: true } } },
    });

    if (!sorteio) {
      return NextResponse.json({ message: 'Sorteio não encontrado' }, { status: 404 });
    }

    // Add winning number to all leads in this sorteio
    const leadIds = sorteio.leads.map((l) => l.id);

    if (leadIds.length > 0) {
      await prisma.leadNumber.createMany({
        data: leadIds.map((leadId) => ({
          leadId,
          numero,
        })),
      });
    }

    // Mark sorteio as finalized
    await prisma.sorteio.update({
      where: { id },
      data: {
        numeroGanhador: numero,
        ativo: false,
        finalizadoAt: new Date(),
      },
    });

    let novoSorteio = null;

    // Create new sorteio if requested
    if (iniciarNovo) {
      novoSorteio = await prisma.sorteio.create({
        data: {
          nome: `Sorteio #${sorteio.numero + 1}`,
          ativo: true,
        },
      });
    }

    return NextResponse.json({
      success: true,
      leadsAtualizados: leadIds.length,
      novoSorteio,
    });
  } catch (error) {
    console.error('Error finalizing sorteio:', error);
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 });
  }
}
