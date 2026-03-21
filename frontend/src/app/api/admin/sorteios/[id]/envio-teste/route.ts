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
    const { templateName, parametros, telefone } = body as {
      templateName: string;
      parametros: string[];
      telefone: string;
    };

    if (!templateName || !parametros?.length || !telefone) {
      return NextResponse.json({ message: 'Template, parametros e telefone obrigatorios' }, { status: 400 });
    }

    const whatsappToken = process.env.WHATSAPP_TOKEN;
    const phoneId = process.env.WHATSAPP_PHONE_ID;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://caminhopremiado.com';

    if (!whatsappToken || !phoneId) {
      return NextResponse.json({ message: 'WhatsApp nao configurado' }, { status: 500 });
    }

    const sorteio = await prisma.sorteio.findUnique({
      where: { id },
      include: {
        leads: {
          take: 1,
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
      return NextResponse.json({ message: 'Sorteio nao encontrado' }, { status: 404 });
    }

    // Use first lead from sorteio as sample data
    const sampleLead = sorteio.leads[0];
    if (!sampleLead) {
      return NextResponse.json({ message: 'Nenhum lead neste sorteio para usar como teste' }, { status: 400 });
    }

    const numeroSorteado = sorteio.numeroGanhador !== null
      ? String(sorteio.numeroGanhador).padStart(5, '0')
      : '00000';

    const accessToken = sampleLead.access?.token || '';
    const url = `${baseUrl}/p/${accessToken}`;

    const paramValues: Record<string, string> = {
      nome: sampleLead.nome,
      email: sampleLead.email,
      telefone: sampleLead.telefone,
      url: url,
      numero_sorteado: numeroSorteado,
    };

    const templateParams = parametros.map((p) => ({
      type: 'text' as const,
      text: paramValues[p] || '',
    }));

    const phone = telefone.replace(/\D/g, '');
    const fullPhone = phone.startsWith('55') ? phone : `55${phone}`;

    const payload = {
      messaging_product: 'whatsapp',
      to: fullPhone,
      type: 'template',
      template: {
        name: templateName,
        language: { code: 'pt_BR' },
        components: templateParams.length > 0
          ? [{ type: 'body', parameters: templateParams }]
          : [],
      },
    };

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

    return NextResponse.json({
      status: res.ok ? 'sent' : 'failed',
      payload,
      response: data,
    });
  } catch (error) {
    console.error('Error sending test WhatsApp:', error);
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 });
  }
}
