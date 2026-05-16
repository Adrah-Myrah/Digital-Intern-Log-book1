import {
    Body,
    Controller,
    ForbiddenException,
    Get,
    Param,
    Patch,
    Post,
    Req,
    UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/guards/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('students')
  @Roles('admin')
  getAllStudents() {
    return this.usersService.findAllStudents();
  }

  @Get('students/assigned/school/:supervisorId')
  @Roles('admin', 'school-supervisor')
  getSchoolAssignedStudents(
    @Param('supervisorId') supervisorId: string,
    @Req() req: any,
  ) {
    if (
      req.user.role === 'school-supervisor' &&
      Number(req.user.sub) !== Number(supervisorId)
    ) {
      throw new ForbiddenException(
        'You can only view your own assigned students',
      );
    }
    return this.usersService.findStudentsBySchoolSupervisor(
      Number(supervisorId),
    );
  }

  @Get('students/assigned/industry/:supervisorId')
  @Roles('admin', 'industry-supervisor')
  getIndustryAssignedStudents(
    @Param('supervisorId') supervisorId: string,
    @Req() req: any,
  ) {
    if (
      req.user.role === 'industry-supervisor' &&
      Number(req.user.sub) !== Number(supervisorId)
    ) {
      throw new ForbiddenException(
        'You can only view your own assigned students',
      );
    }
    return this.usersService.findStudentsByIndustrySupervisor(
      Number(supervisorId),
    );
  }

  @Patch('students/:studentId/assign-supervisors')
  @Roles('admin')
  assignStudentSupervisors(
    @Param('studentId') studentId: string,
    @Body()
    body: {
      schoolSupervisorId?: number | null;
      industrySupervisorId?: number | null;
    },
  ) {
    return this.usersService.assignStudentSupervisors(
      Number(studentId),
      body.schoolSupervisorId,
      body.industrySupervisorId,
    );
  }

  @Get('supervisors')
  @Roles('admin')
  getAllSupervisors() {
    return Promise.all([
      this.usersService.findByRole('school-supervisor'),
      this.usersService.findByRole('industry-supervisor'),
    ]).then(([school, industry]) => ({ school, industry }));
  }

  @Get('role/:role')
  @Roles('admin')
  getByRole(@Param('role') role: string) {
    return this.usersService.findByRole(role);
  }

  @Get('counts')
  @Roles('admin')
  getRoleCounts() {
    return this.usersService.getRoleCounts();
  }

  @Get(':id')
  getUserById(@Param('id') id: string, @Req() req: any) {
    const requestedId = Number(id);
    if (req.user.role !== 'admin' && Number(req.user.sub) !== requestedId) {
      throw new ForbiddenException('You can only view your own profile');
    }
    return this.usersService.findById(Number(id));
  }

  @Post('industry-supervisor/link-students')
  @Roles('industry-supervisor')
  linkStudents(
    @Body() body: { registrationNumbers: string[] },
    @Req() req: any,
  ) {
    return this.usersService.linkStudentsByRegistrationNumbers(
      Number(req.user.sub),
      body.registrationNumbers,
    );
  }

  @Get('industry-supervisor/my-interns')
  @Roles('industry-supervisor')
  getMyInterns(@Req() req: any) {
    return this.usersService.getInternsByIndustrySupervisor(
      Number(req.user.sub),
    );
  }
}
