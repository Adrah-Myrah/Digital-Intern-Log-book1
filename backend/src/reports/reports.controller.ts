import {
    Controller, Post, Get, Patch,
    Param, Body, UseInterceptors,
    UploadedFile, Query
  } from '@nestjs/common';
  import { FileInterceptor } from '@nestjs/platform-express';
  import { ReportsService } from './reports.service';
  import { ReviewReportDto } from './dto/review-report.dto';
  
  @Controller('reports')
  export class ReportsController {
    constructor(private reportsService: ReportsService) {}
  
    // POST /api/reports/upload?studentId=1 — student uploads PDF
    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    uploadReport(
      @UploadedFile() file: Express.Multer.File,
      @Query('studentId') studentId: string,
    ) {
      return this.reportsService.uploadReport(Number(studentId), file);
    }
  
    // GET /api/reports — admin/supervisor gets all
    @Get()
    getAllReports() {
      return this.reportsService.getAllReports();
    }
  
    // GET /api/reports/student/:id
    @Get('student/:id')
    getStudentReport(@Param('id') id: string) {
      return this.reportsService.getStudentReport(Number(id));
    }
  
    // GET /api/reports/:id
    @Get(':id')
    getReportById(@Param('id') id: string) {
      return this.reportsService.getReportById(Number(id));
    }
  
    // PATCH /api/reports/:id/review — supervisor reviews report
    @Patch(':id/review')
    reviewReport(@Param('id') id: string, @Body() body: ReviewReportDto) {
      return this.reportsService.reviewReport(Number(id), body);
    }
  }