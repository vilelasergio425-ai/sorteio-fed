import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/server/prisma';
import { generateNumbers } from '@/lib/server/numbers';
import { sendWhatsAppMessage } from '@/lib/server/whatsapp';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nome, email, telefone, utm_source, utm_medium, utm_campaign, utm_content, utm_term } = body;

    if (!nome || !email || !telefone) {
      return NextResponse.json({ message: 'Campos obrigatórios: nome, email, telefone' }, { status: 400 });
    }

    const telefoneRaw = telefone.replace(/\D/g, '');
    const testNumber = '62997021311';
    const isTestNumber = telefoneRaw === testNumber || telefoneRaw === `55${testNumber}`;

    // Check if phone already registered (skip for test number)
    if (!isTestNumber) {
      const existing = await prisma.lead.findFirst({
        where: { telefoneRaw },
        include: { access: true },
      });

      if (existing) {
        return NextResponse.json({
          success: false,
          alreadyRegistered: true,
          message: 'Você já está cadastrado no sorteio! Confira sua participação no WhatsApp.',
        }, { status: 409 });
      }
    }

    const token = uuidv4();
    const numbers = generateNumbers();

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const userAgent = req.headers.get('user-agent') || undefined;

    const lead = await prisma.lead.create({
      data: {
        nome,
        email,
        telefone,
        telefoneRaw,
        confirmado: true,
        ip,
        userAgent,
        numbers: {
          createMany: {
            data: numbers.map((n) => ({ numero: n })),
          },
        },
        access: {
          create: { token },
        },
        utms: {
          create: {
            utmSource: utm_source || null,
            utmMedium: utm_medium || null,
            utmCampaign: utm_campaign || null,
            utmContent: utm_content || null,
            utmTerm: utm_term || null,
          },
        },
        confirmations: {
          create: {},
        },
      },
      include: {
        access: true,
        numbers: true,
      },
    });

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || req.nextUrl.origin;
    const link = `${baseUrl}/p/${token}`;

    sendWhatsAppMessage(lead.id, nome, telefoneRaw, link).catch((err) => {
      console.error(`WhatsApp send failed for lead ${lead.id}:`, err);
    });

    return NextResponse.json({ success: true, token, leadId: lead.id });
  } catch (error) {
    console.error('Error creating lead:', error);
    return NextResponse.json({ message: 'Erro ao criar lead' }, { status: 500 });
  }
}
