import { Controller, ForbiddenException, Get, Param, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/guards/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get('student/:studentId')
  @Roles('student', 'admin')
  getStudentNotifications(@Param('studentId') studentId: string, @Req() req: any) {
    if (
      req.user.role === 'student' &&
      Number(req.user.sub) !== Number(studentId)
    ) {
      throw new ForbiddenException('You can only view your own notifications');
    }

    return this.notificationsService.findNotificationsForUser(Number(studentId));
  }

  @Get('my-notifications')
  @Roles('student', 'industry-supervisor')
  getMyNotifications(@Req() req: any) {
    return this.notificationsService.findNotificationsForUser(Number(req.user.sub));
  }
}
