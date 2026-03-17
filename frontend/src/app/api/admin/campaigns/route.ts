import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/server/prisma';
import { validateAdminKey } from '@/lib/server/admin-guard';

export async function GET(req: NextRequest) {
  const unauthorized = validateAdminKey(req);
  if (unauthorized) return unauthorized;

  try {
    const utms = await prisma.utmTracking.findMany({
      include: {
        lead: { select: { confirmado: true } },
      },
    });

    const campaignMap: Record<string, Record<string, { leads: number; confirmados: number }>> = {};

    for (const utm of utms) {
      const campaign = utm.utmCampaign || '(sem campanha)';
      const content = utm.utmContent || '(sem conteúdo)';

      if (!campaignMap[campaign]) campaignMap[campaign] = {};
      if (!campaignMap[campaign][content]) campaignMap[campaign][content] = { leads: 0, confirmados: 0 };

      campaignMap[campaign][content].leads++;
      if (utm.lead.confirmado) campaignMap[campaign][content].confirmados++;
    }

    const campaigns = Object.entries(campaignMap).map(([name, adsets]) => ({
      campaign: name,
      adsets: Object.entries(adsets).map(([adset, data]) => ({
        name: adset,
        ...data,
        taxa: data.leads > 0 ? ((data.confirmados / data.leads) * 100).toFixed(1) : '0',
      })),
      totalLeads: Object.values(adsets).reduce((s, d) => s + d.leads, 0),
      totalConfirmados: Object.values(adsets).reduce((s, d) => s + d.confirmados, 0),
    }));

    return NextResponse.json(campaigns);
  } catch (error) {
    console.error('Error getting campaigns:', error);
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 });
  }
}
