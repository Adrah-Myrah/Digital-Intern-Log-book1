// import { Controller } from '@nestjs/common';

// @Controller('logs')
// export class LogsController {}

import { Controller, Post, Get, Patch, Param, Body, ForbiddenException, Req, UseGuards } from '@nestjs/common';
import { LogsService } from './logs.service';
import { CreateLogDto } from './dto/create-log.dto';
import { ApproveLogDto } from './dto/approve-log.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';

@Controller('logs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LogsController {
  constructor(private logsService: LogsService) {}

  // POST /api/logs — student submits a log
  @Post()
  @Roles('student')
  createLog(@Body() body: CreateLogDto) {
    return this.logsService.createLog(body);
  }

  // GET /api/logs/student/:studentId — get all logs for a student
  @Get('student/:studentId')
  @Roles('student', 'school-supervisor', 'industry-supervisor', 'admin')
  getStudentLogs(@Param('studentId') studentId: string, @Req() req: any) {
    if (req.user.role === 'student' && Number(req.user.sub) !== Number(studentId)) {
      throw new ForbiddenException('Students can only view their own logs');
    }
    return this.logsService.getStudentLogs(Number(studentId));
  }

  // GET /api/logs/pending — industry supervisor sees pending logs
  @Get('pending')
  @Roles('admin')
  getPendingLogs() {
    return this.logsService.getPendingLogs();
  }

  // GET /api/logs/pending/:supervisorId — pending logs for assigned students
  @Get('pending/:supervisorId')
  @Roles('admin', 'industry-supervisor')
  getPendingLogsForSupervisor(@Param('supervisorId') supervisorId: string, @Req() req: any) {
    if (req.user.role === 'industry-supervisor' && Number(req.user.sub) !== Number(supervisorId)) {
      throw new ForbiddenException('You can only view your own pending queue');
    }
    return this.logsService.getPendingLogsForIndustrySupervisor(Number(supervisorId));
  }

  // GET /api/logs — admin sees all logs
  @Get()
  @Roles('admin', 'school-supervisor', 'industry-supervisor')
  getAllLogs() {
    return this.logsService.getAllLogs();
  }

  // GET /api/logs/:id — get single log
  @Get(':id')
  @Roles('student', 'school-supervisor', 'industry-supervisor', 'admin')
  getLogById(@Param('id') id: string) {
    return this.logsService.getLogById(Number(id));
  }

  // PATCH /api/logs/:id/approve — industry supervisor approves/rejects
  @Patch(':id/approve')
  @Roles('industry-supervisor', 'admin')
  approveLog(@Param('id') id: string, @Body() body: ApproveLogDto) {
    return this.logsService.approveLog(Number(id), body);
  }
}