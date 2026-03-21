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
    const { templateName, parametros } = body as {
      templateName: string;
      parametros: string[]; // e.g. ['nome', 'email', 'telefone', 'token', 'url', 'numero_sorteado']
    };

    if (!templateName) {
      return NextResponse.json({ message: 'Nome do template é obrigatório' }, { status: 400 });
    }

    if (!parametros || parametros.length === 0) {
      return NextResponse.json({ message: 'Selecione pelo menos um parâmetro' }, { status: 400 });
    }

    const whatsappToken = process.env.WHATSAPP_TOKEN;
    const phoneId = process.env.WHATSAPP_PHONE_ID;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://caminhopremiado.com';

    if (!whatsappToken || !phoneId) {
      return NextResponse.json({ message: 'WhatsApp não configurado' }, { status: 500 });
    }

    const sorteio = await prisma.sorteio.findUnique({
      where: { id },
      include: {
        leads: {
          select: {
            id: true,
            nome: true,
            email: true,
            telefone: true,
            telefoneRaw: true,
            access: { select: { token: true } },
          },
        },
      },
    });

    if (!sorteio) {
      return NextResponse.json({ message: 'Sorteio não encontrado' }, { status: 404 });
    }

    const numeroSorteado = sorteio.numeroGanhador !== null
      ? String(sorteio.numeroGanhador).padStart(5, '0')
      : '00000';

    let enviados = 0;
    let falhas = 0;

    for (const lead of sorteio.leads) {
      const phone = lead.telefoneRaw.startsWith('55')
        ? lead.telefoneRaw
        : `55${lead.telefoneRaw}`;

      const accessToken = lead.access?.token || '';
      const url = `${baseUrl}/p/${accessToken}`;

      // Build parameters in the order selected by admin
      const paramValues: Record<string, string> = {
        nome: lead.nome,
        email: lead.email,
        telefone: lead.telefone,
        token: accessToken,
        url: url,
        numero_sorteado: numeroSorteado,
      };

      const templateParams = parametros.map((p) => ({
        type: 'text' as const,
        text: paramValues[p] || '',
      }));

      const payload = {
        messaging_product: 'whatsapp',
        to: phone,
        type: 'template',
        template: {
          name: templateName,
          language: { code: 'pt_BR' },
          components: templateParams.length > 0
            ? [{ type: 'body', parameters: templateParams }]
            : [],
        },
      };

      try {
        const res = await fetch(
          `https://graph.facebook.com/v22.0/${phoneId}/messages`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${whatsappToken}`,
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
