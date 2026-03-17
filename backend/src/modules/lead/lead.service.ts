import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WhatsappService } from '../whatsapp/whatsapp.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { generateNumbers } from '../../common/utils/numbers.util';
import { maskName, maskEmail, maskPhone } from '../../common/utils/mask.util';
import { v4 as uuidv4 } from 'uuid';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LeadService {
  private readonly logger = new Logger(LeadService.name);

  constructor(
    private prisma: PrismaService,
    private whatsappService: WhatsappService,
    private configService: ConfigService,
  ) {}

  async createLead(dto: CreateLeadDto, ip?: string, userAgent?: string) {
    const telefoneRaw = dto.telefone.replace(/\D/g, '');
    const token = uuidv4();
    const numbers = generateNumbers();

    this.logger.log(`Creating lead: ${dto.email} | IP: ${ip}`);

    const lead = await this.prisma.lead.create({
      data: {
        nome: dto.nome,
        email: dto.email,
        telefone: dto.telefone,
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
            utmSource: dto.utm_source,
            utmMedium: dto.utm_medium,
            utmCampaign: dto.utm_campaign,
            utmContent: dto.utm_content,
            utmTerm: dto.utm_term,
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

    this.logger.log(`Lead created: ${lead.id} | Token: ${token}`);

    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    const link = `${frontendUrl}/p/${token}`;

    this.whatsappService
      .sendTemplateMessage(lead.nome, telefoneRaw, link)
      .catch((err) => {
        this.logger.error(`WhatsApp send failed for lead ${lead.id}: ${err.message}`);
      });

    return {
      success: true,
      token,
      leadId: lead.id,
    };
  }

  async getParticipant(token: string) {
    const access = await this.prisma.leadAccess.findUnique({
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
      throw new NotFoundException('Participante não encontrado');
    }

    const { lead } = access;

    return {
      nome: maskName(lead.nome),
      email: maskEmail(lead.email),
      telefone: maskPhone(lead.telefone),
      numeros: lead.numbers.map((n) => n.numero),
      confirmado: lead.confirmado,
    };
  }

}
