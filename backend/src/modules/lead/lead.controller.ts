import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Req,
  Logger,
} from '@nestjs/common';
import type { Request } from 'express';
import { LeadService } from './lead.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { PrismaService } from '../prisma/prisma.service';

@Controller()
export class LeadController {
  private readonly logger = new Logger(LeadController.name);

  constructor(
    private readonly leadService: LeadService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('lead')
  async createLead(@Body() dto: CreateLeadDto, @Req() req: Request) {
    const ip =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    this.logger.log(`POST /lead from IP: ${ip}`);

    return this.leadService.createLead(dto, ip, userAgent);
  }

  @Get('participant/:token')
  async getParticipant(@Param('token') token: string) {
    this.logger.log(`GET /participant/${token}`);
    return this.leadService.getParticipant(token);
  }

@Get('pixels/active')
  async getActivePixels() {
    const pixels = await this.prisma.metaPixel.findMany({
      where: { ativo: true },
      select: { pixelId: true },
    });
    return pixels.map((p) => p.pixelId);
  }
}
