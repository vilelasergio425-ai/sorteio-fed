import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/server/prisma';
import { validateAdminKey } from '@/lib/server/admin-guard';
import { sendWhatsAppMessage } from '@/lib/server/whatsapp';

export async function POST(req: NextRequest) {
  const unauthorized = validateAdminKey(req);
  if (unauthorized) return unauthorized;

  try {
    // Find all leads that have error/failed logs but no successful log
    const failedLeads = await prisma.lead.findMany({
      where: {
        whatsappLogs: {
          every: {
            status: { in: ['error', 'failed'] },
          },
          some: {},
        },
      },
      include: {
        access: true,
        whatsappLogs: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    // Filter out leads that also have a 'sent' log
    const leadsToRetry = [];
    for (const lead of failedLeads) {
      const hasSent = await prisma.whatsappLog.findFirst({
        where: { leadId: lead.id, status: 'sent' },
      });
      if (!hasSent && lead.access) {
        leadsToRetry.push(lead);
      }
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://caminhopremiado.com';
    let sent = 0;
    let failed = 0;

    for (const lead of leadsToRetry) {
      const token = lead.access?.token;
      if (!token) {
        failed++;
        continue;
      }
      const link = `${baseUrl}/p/${token}`;
      try {
        const result = await sendWhatsAppMessage(lead.id, lead.nome, lead.telefoneRaw, link);
        if (result) {
          sent++;
        } else {
          failed++;
        }
        // Small delay between messages
        await new Promise((r) => setTimeout(r, 1500));
      } catch {
        failed++;
      }
    }

    return NextResponse.json({
      success: true,
      total: leadsToRetry.length,
      sent,
      failed,
    });
  } catch (error) {
    console.error('Error retrying whatsapp:', error);
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 });
  }
}
