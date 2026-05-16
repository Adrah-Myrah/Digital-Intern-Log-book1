import {
    Controller, Post, Get, Patch,
    Param, Body, UseInterceptors,
    UploadedFile, Query, UseGuards, Req, ForbiddenException
  } from '@nestjs/common';
  import { FileInterceptor } from '@nestjs/platform-express';
  import { ReportsService } from './reports.service';
  import { ReviewReportDto } from './dto/review-report.dto';
  import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
  import { RolesGuard } from '../auth/guards/roles.guard';
  import { Roles } from '../auth/guards/roles.decorator';
  
  @Controller('reports')
  @UseGuards(JwtAuthGuard, RolesGuard)
  export class ReportsController {
    constructor(private reportsService: ReportsService) {}
  
    // POST /api/reports/upload?studentId=1 — student uploads PDF
    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    @Roles('student')
    uploadReport(
      @UploadedFile() file: Express.Multer.File,
      @Query('studentId') studentId: string,
      @Req() req: any,
    ) {
      if (Number(req.user.sub) !== Number(studentId)) {
        throw new ForbiddenException('You can only upload reports for yourself');
      }
      return this.reportsService.uploadReport(Number(studentId), file);
    }
  
    // GET /api/reports — admin/supervisor gets all
    @Get()
    @Roles('school-supervisor', 'industry-supervisor', 'admin')
    getAllReports() {
      return this.reportsService.getAllReports();
    }
  
// GET /api/reports/student/:studentId
  @Get('student/:studentId')
  @Roles('student', 'school-supervisor', 'industry-supervisor', 'admin')
  async getStudentReport(@Param('studentId') studentId: string, @Req() req: any) {
    if (req.user.role === 'student' && Number(req.user.sub) !== Number(studentId)) {
      throw new ForbiddenException('Students can only view their own reports');
    }
    const report = await this.reportsService.getStudentReport(Number(studentId));
    if (!report) {
      return {}; // Return empty object instead of empty body
    }
    return report;
    }
  
    // GET /api/reports/:id
    @Get(':id')
    @Roles('school-supervisor', 'industry-supervisor', 'admin')
    getReportById(@Param('id') id: string) {
      return this.reportsService.getReportById(Number(id));
    }
  
    // PATCH /api/reports/:id/review — supervisor reviews report
    @Patch(':id/review')
    @Roles('school-supervisor', 'industry-supervisor', 'admin')
    reviewReport(@Param('id') id: string, @Body() body: ReviewReportDto) {
      return this.reportsService.reviewReport(Number(id), body);
    }
  }
