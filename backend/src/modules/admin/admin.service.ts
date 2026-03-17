import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(private prisma: PrismaService) {}

  async getOverview() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalLeads, leadsToday, totalConfirmed] = await Promise.all([
      this.prisma.lead.count(),
      this.prisma.lead.count({
        where: { createdAt: { gte: today } },
      }),
      this.prisma.lead.count({
        where: { confirmado: true },
      }),
    ]);

    const conversionRate =
      totalLeads > 0
        ? ((totalConfirmed / totalLeads) * 100).toFixed(2)
        : '0.00';

    return {
      totalLeads,
      leadsToday,
      totalConfirmed,
      conversionRate: parseFloat(conversionRate),
    };
  }

  async getLeads(filters: {
    date?: string;
    utm_source?: string;
    confirmado?: string;
    page?: number;
    limit?: number;
  }) {
    const { date, utm_source, confirmado, page = 1, limit = 50 } = filters;

    const where: any = {};

    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      where.createdAt = { gte: start, lte: end };
    }

    if (confirmado !== undefined) {
      where.confirmado = confirmado === 'true';
    }

    if (utm_source) {
      where.utms = { utmSource: utm_source };
    }

    const [leads, total] = await Promise.all([
      this.prisma.lead.findMany({
        where,
        include: {
          utms: true,
          numbers: { select: { numero: true } },
          whatsappLogs: true,
          confirmations: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.lead.count({ where }),
    ]);

    return {
      data: leads,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getLeadDetail(id: string) {
    return this.prisma.lead.findUnique({
      where: { id },
      include: {
        utms: true,
        numbers: { select: { numero: true } },
        whatsappLogs: { orderBy: { createdAt: 'desc' } },
        confirmations: true,
        access: { select: { token: true } },
      },
    });
  }

  // ---- Pixels ----

  async getPixels() {
    return this.prisma.metaPixel.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async createPixel(data: { pixelId: string; nome: string }) {
    this.logger.log(`Creating pixel: ${data.pixelId} (${data.nome})`);
    return this.prisma.metaPixel.create({
      data: {
        pixelId: data.pixelId,
        nome: data.nome,
      },
    });
  }

  async updatePixel(id: string, data: { nome?: string; ativo?: boolean }) {
    this.logger.log(`Updating pixel: ${id}`);
    return this.prisma.metaPixel.update({
      where: { id },
      data,
    });
  }

  async deletePixel(id: string) {
    this.logger.log(`Deleting pixel: ${id}`);
    return this.prisma.metaPixel.delete({ where: { id } });
  }

  async getActivePixels() {
    return this.prisma.metaPixel.findMany({
      where: { ativo: true },
      select: { pixelId: true },
    });
  }

  async getCampaigns() {
    const leads = await this.prisma.lead.findMany({
      include: { utms: true },
    });

    const campaignMap = new Map<
      string,
      {
        campaign: string;
        adsets: Map<
          string,
          { adset: string; leads: number; confirmed: number }
        >;
        leads: number;
        confirmed: number;
      }
    >();

    for (const lead of leads) {
      const campaign = lead.utms?.utmCampaign || '(direto)';
      const adset = lead.utms?.utmContent || lead.utms?.utmTerm || '(sem adset)';

      if (!campaignMap.has(campaign)) {
        campaignMap.set(campaign, {
          campaign,
          adsets: new Map(),
          leads: 0,
          confirmed: 0,
        });
      }

      const camp = campaignMap.get(campaign)!;
      camp.leads++;
      if (lead.confirmado) camp.confirmed++;

      if (!camp.adsets.has(adset)) {
        camp.adsets.set(adset, { adset, leads: 0, confirmed: 0 });
      }

      const ad = camp.adsets.get(adset)!;
      ad.leads++;
      if (lead.confirmado) ad.confirmed++;
    }

    return Array.from(campaignMap.values()).map((camp) => ({
      campaign: camp.campaign,
      leads: camp.leads,
      confirmed: camp.confirmed,
      conversionRate:
        camp.leads > 0
          ? parseFloat(((camp.confirmed / camp.leads) * 100).toFixed(2))
          : 0,
      adsets: Array.from(camp.adsets.values()).map((ad) => ({
        ...ad,
        conversionRate:
          ad.leads > 0
            ? parseFloat(((ad.confirmed / ad.leads) * 100).toFixed(2))
            : 0,
      })),
    }));
  }
}
