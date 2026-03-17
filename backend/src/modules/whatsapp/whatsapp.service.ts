import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name);
  private readonly apiUrl = 'https://graph.facebook.com/v21.0';

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {}

  async sendTemplateMessage(
    nome: string,
    telefone: string,
    link: string,
  ): Promise<void> {
    const token = this.configService.get<string>('WHATSAPP_TOKEN');
    const phoneId = this.configService.get<string>('WHATSAPP_PHONE_ID');
    const templateName =
      this.configService.get<string>('WHATSAPP_TEMPLATE_NAME') ||
      'sorteio_numeros';

    const payload = {
      messaging_product: 'whatsapp',
      to: telefone,
      type: 'template',
      template: {
        name: templateName,
        language: { code: 'pt_BR' },
        components: [
          {
            type: 'body',
            parameters: [
              { type: 'text', text: nome },
              { type: 'text', text: link },
            ],
          },
        ],
      },
    };

    this.logger.log(`Sending WhatsApp to ${telefone}`);

    let status = 'pending';
    let response: any = null;

    try {
      const res = await fetch(
        `${this.apiUrl}/${phoneId}/messages`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        },
      );

      response = await res.json();

      if (!res.ok) {
        status = 'error';
        this.logger.error(
          `WhatsApp API error: ${res.status} - ${JSON.stringify(response)}`,
        );
      } else {
        status = 'sent';
        this.logger.log(`WhatsApp sent to ${telefone} - ID: ${response?.messages?.[0]?.id}`);
      }
    } catch (error) {
      status = 'error';
      response = { error: error.message };
      this.logger.error(`WhatsApp send exception: ${error.message}`);
    }

    // Find lead by phone to log
    const lead = await this.prisma.lead.findFirst({
      where: { telefoneRaw: telefone },
      orderBy: { createdAt: 'desc' },
    });

    if (lead) {
      await this.prisma.whatsappLog.create({
        data: {
          leadId: lead.id,
          status,
          payload,
          response,
        },
      });
    }
  }
}
