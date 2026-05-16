// import { Controller } from '@nestjs/common';

// @Controller('logs')
// export class LogsController {}

import { Body, Controller, ForbiddenException, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/guards/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ApproveLogDto } from './dto/approve-log.dto';
import { CreateLogDto } from './dto/create-log.dto';
import { LogsService } from './logs.service';

@Controller('logs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LogsController {
  constructor(private logsService: LogsService) {}

  // POST /api/logs — student submits a log
  @Post()
  @Roles('student')
  createLog(@Body() body: CreateLogDto, @Req() req: any) {
    // ensure studentId is taken from the logged-in user
    body.studentId = Number(req.user.sub);
    return this.logsService.createLog(body);
  }

  // GET /api/logs/student/:studentId — get all logs for a student
  @Get('student/:studentId')
  @Roles('student', 'school-supervisor', 'industry-supervisor', 'admin')
  getStudentLogs(@Param('studentId') studentId: string, @Req() req: any) {
    return this.logsService.getStudentLogs(Number(studentId), req.user);
  }

  // GET /api/logs/pending — admin sees all pending logs
  @Get('pending')
  @Roles('admin')
  getPendingLogs() {
    return this.logsService.getPendingLogs();
  }

  // GET /api/logs/pending/:supervisorId — pending logs for assigned students
  @Get('pending/:supervisorId')
  @Roles('admin', 'industry-supervisor')
  getPendingLogsForSupervisor(
    @Param('supervisorId') supervisorId: string,
    @Req() req: any,
  ) {
    if (
      req.user.role === 'industry-supervisor' &&
      Number(req.user.sub) !== Number(supervisorId)
    ) {
      throw new ForbiddenException('You can only view your own pending queue');
    }
    return this.logsService.getPendingLogsForIndustrySupervisor(
      Number(supervisorId),
    );
  }

  // GET /api/logs — user-specific log list based on role
  @Get()
  @Roles('admin', 'school-supervisor', 'industry-supervisor')
  getAllLogs(@Req() req: any) {
    return this.logsService.getAllLogs(req.user);
  }

  // GET /api/logs/:id — get single log
  @Get(':id')
  @Roles('student', 'school-supervisor', 'industry-supervisor', 'admin')
  getLogById(@Param('id') id: string, @Req() req: any) {
    return this.logsService.getLogById(Number(id), req.user);
  }

  // PATCH /api/logs/:id/approve — industry supervisor approves/rejects
  @Patch(':id/approve')
  @Roles('industry-supervisor', 'admin')
  approveLog(
    @Param('id') id: string,
    @Body() body: ApproveLogDto,
    @Req() req: any,
  ) {
    return this.logsService.approveLog(Number(id), body, req.user);
  }

  // POST /api/logs/:id/comment — industry supervisor adds comment to log
  @Post(':id/comment')
  @Roles('industry-supervisor', 'admin')
  addComment(
    @Param('id') id: string,
    @Body() body: { comment: string },
    @Req() req: any,
  ) {
    return this.logsService.addComment(
      Number(id),
      body.comment,
      Number(req.user.sub),
    );
  }

  // GET /api/logs/:id/comments — get comments for a log
  @Get(':id/comments')
  @Roles('student', 'school-supervisor', 'industry-supervisor', 'admin')
  getComments(@Param('id') id: string, @Req() req: any) {
    return this.logsService.getComments(Number(id), req.user);
  }
}
