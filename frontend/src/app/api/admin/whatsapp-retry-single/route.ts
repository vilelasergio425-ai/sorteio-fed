import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/server/prisma';
import { validateAdminKey } from '@/lib/server/admin-guard';
import { sendWhatsAppMessage } from '@/lib/server/whatsapp';

export async function POST(req: NextRequest) {
  const unauthorized = validateAdminKey(req);
  if (unauthorized) return unauthorized;

  try {
    const { leadId } = await req.json();

    if (!leadId) {
      return NextResponse.json({ message: 'leadId obrigatório' }, { status: 400 });
    }

    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: { access: true },
    });

    if (!lead || !lead.access) {
      return NextResponse.json({ message: 'Lead não encontrado' }, { status: 404 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://caminhopremiado.com';
    const link = `${baseUrl}/p/${lead.access.token}`;

    const result = await sendWhatsAppMessage(lead.id, lead.nome, lead.telefoneRaw, link);

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('Error retrying single whatsapp:', error);
    return NextResponse.json({ message: 'Erro ao reenviar' }, { status: 500 });
  }
}
