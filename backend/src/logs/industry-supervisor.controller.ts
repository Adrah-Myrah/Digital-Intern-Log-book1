import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/guards/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ApproveLogDto } from './dto/approve-log.dto';
import { LogsService } from './logs.service';

@Controller('industry-supervisor')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('industry-supervisor')
export class IndustrySupervisorController {
  constructor(private logsService: LogsService) {}

  @Get('student/:studentId/logs')
  async getStudentLogs(@Param('studentId') studentId: string, @Req() req: any) {
    return this.logsService.getStudentLogs(Number(studentId), req.user);
  }

  @Get('logs')
  async getAllLogsForSupervisor(@Req() req: any) {
    // Returns logs for students assigned to this supervisor
    const userId = Number(req.user.sub);
    return this.logsService.getLogsForIndustrySupervisor(userId);
  }

  @Get('log/:logId')
  async getLog(@Param('logId') logId: string, @Req() req: any) {
    return this.logsService.getLogById(Number(logId), req.user);
  }

  @Patch('log/:logId/approve')
  async approveLog(
    @Param('logId') logId: string,
    @Body() dto: ApproveLogDto,
    @Req() req: any,
  ) {
    return this.logsService.approveLog(Number(logId), dto, req.user);
  }

  @Patch('log/:logId/reject')
  async rejectLog(
    @Param('logId') logId: string,
    @Body() dto: ApproveLogDto,
    @Req() req: any,
  ) {
    dto.status = 'rejected';
    return this.logsService.approveLog(Number(logId), dto, req.user);
  }

  @Post('log/:logId/comment')
  async commentOnLog(
    @Param('logId') logId: string,
    @Body() body: { comment: string },
    @Req() req: any,
  ) {
    return this.logsService.addComment(Number(logId), body.comment, Number(req.user.sub));
  }
}
