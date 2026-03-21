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
    const { templateName } = body;

    if (!templateName) {
      return NextResponse.json({ message: 'Nome do template é obrigatório' }, { status: 400 });
    }

    const token = process.env.WHATSAPP_TOKEN;
    const phoneId = process.env.WHATSAPP_PHONE_ID;

    if (!token || !phoneId) {
      return NextResponse.json({ message: 'WhatsApp não configurado' }, { status: 500 });
    }

    const sorteio = await prisma.sorteio.findUnique({
      where: { id },
      include: {
        leads: {
          select: { id: true, nome: true, telefoneRaw: true },
        },
      },
    });

    if (!sorteio) {
      return NextResponse.json({ message: 'Sorteio não encontrado' }, { status: 404 });
    }

    let enviados = 0;
    let falhas = 0;

    // Send messages sequentially with delay
    for (const lead of sorteio.leads) {
      const phone = lead.telefoneRaw.startsWith('55')
        ? lead.telefoneRaw
        : `55${lead.telefoneRaw}`;

      const payload = {
        messaging_product: 'whatsapp',
        to: phone,
        type: 'template',
        template: {
          name: templateName,
          language: { code: 'pt_BR' },
          components: [
            {
              type: 'body',
              parameters: [
                { type: 'text', text: lead.nome },
              ],
            },
          ],
        },
      };

      try {
        const res = await fetch(
          `https://graph.facebook.com/v22.0/${phoneId}/messages`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          },
        );

        const data = await res.json();

        await prisma.whatsappLog.create({
          data: {
            leadId: lead.id,
            status: res.ok ? 'sent' : 'failed',
            payload: payload as object,
            response: data as object,
          },
        });

        if (res.ok) enviados++;
        else falhas++;
      } catch (error) {
        await prisma.whatsappLog.create({
          data: {
            leadId: lead.id,
            status: 'error',
            payload: payload as object,
            response: { error: String(error) },
          },
        });
        falhas++;
      }

      // Delay between sends (rate limit)
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    return NextResponse.json({
      success: true,
      total: sorteio.leads.length,
      enviados,
      falhas,
    });
  } catch (error) {
    console.error('Error sending bulk WhatsApp:', error);
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 });
  }
}
