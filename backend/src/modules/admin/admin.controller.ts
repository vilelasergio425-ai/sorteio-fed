import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminApiKeyGuard } from '../../common/guards/admin-api-key.guard';
import { CreatePixelDto, UpdatePixelDto } from './dto/pixel.dto';

@Controller('admin')
@UseGuards(AdminApiKeyGuard)
export class AdminController {
  private readonly logger = new Logger(AdminController.name);

  constructor(private readonly adminService: AdminService) {}

  @Get('overview')
  async getOverview() {
    this.logger.log('GET /admin/overview');
    return this.adminService.getOverview();
  }

  @Get('leads')
  async getLeads(
    @Query('date') date?: string,
    @Query('utm_source') utm_source?: string,
    @Query('confirmado') confirmado?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    this.logger.log('GET /admin/leads');
    return this.adminService.getLeads({
      date,
      utm_source,
      confirmado,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 50,
    });
  }

  @Get('leads/:id')
  async getLeadDetail(@Param('id') id: string) {
    this.logger.log(`GET /admin/leads/${id}`);
    return this.adminService.getLeadDetail(id);
  }

  @Get('campaigns')
  async getCampaigns() {
    this.logger.log('GET /admin/campaigns');
    return this.adminService.getCampaigns();
  }

  // ---- Pixels ----

  @Get('pixels')
  async getPixels() {
    this.logger.log('GET /admin/pixels');
    return this.adminService.getPixels();
  }

  @Post('pixels')
  async createPixel(@Body() dto: CreatePixelDto) {
    this.logger.log(`POST /admin/pixels - ${dto.pixelId}`);
    return this.adminService.createPixel(dto);
  }

  @Patch('pixels/:id')
  async updatePixel(
    @Param('id') id: string,
    @Body() dto: UpdatePixelDto,
  ) {
    this.logger.log(`PATCH /admin/pixels/${id}`);
    return this.adminService.updatePixel(id, dto);
  }

  @Delete('pixels/:id')
  async deletePixel(@Param('id') id: string) {
    this.logger.log(`DELETE /admin/pixels/${id}`);
    return this.adminService.deletePixel(id);
  }
}
