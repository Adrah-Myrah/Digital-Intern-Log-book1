import { Body, Controller, ForbiddenException, Get, Param, Patch, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private usersService: UsersService) { }

  @Get('students')
  @Roles('admin')
  getAllStudents() {
    return this.usersService.findAllStudents();
  }

  @Get('students/assigned/school/:supervisorId')
  @Roles('admin', 'school-supervisor')
  getSchoolAssignedStudents(@Param('supervisorId') supervisorId: string, @Req() req: any) {
    if (req.user.role === 'school-supervisor' && Number(req.user.sub) !== Number(supervisorId)) {
      throw new ForbiddenException('You can only view your own assigned students');
    }
    return this.usersService.findStudentsBySchoolSupervisor(Number(supervisorId));
  }

  @Get('students/assigned/industry/:supervisorId')
  @Roles('admin', 'industry-supervisor')
  getIndustryAssignedStudents(@Param('supervisorId') supervisorId: string, @Req() req: any) {
    if (req.user.role === 'industry-supervisor' && Number(req.user.sub) !== Number(supervisorId)) {
      throw new ForbiddenException('You can only view your own assigned students');
    }
    return this.usersService.findStudentsByIndustrySupervisor(Number(supervisorId));
  }

  @Patch('students/:studentId/assign-supervisors')
  @Roles('admin')
  assignStudentSupervisors(
    @Param('studentId') studentId: string,
    @Body() body: { schoolSupervisorId?: number | null; industrySupervisorId?: number | null },
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
  async getUserById(@Param('id') id: string, @Req() req: any) {
    const requestedId = Number(id);
    const requester = req.user;

    // Admin can view anyone
    if (requester.role === 'admin') {
      return this.usersService.findById(requestedId);
    }

    // Users can view their own profile
    if (Number(requester.sub) === requestedId) {
      return this.usersService.findById(requestedId);
    }

    // Supervisors can view their assigned students
    if (requester.role === 'school-supervisor' || requester.role === 'industry-supervisor') {
      const assignedStudents = await (requester.role === 'school-supervisor'
        ? this.usersService.findStudentsBySchoolSupervisor(Number(requester.sub))
        : this.usersService.findStudentsByIndustrySupervisor(Number(requester.sub)));
      const isAssigned = assignedStudents.some(student => student.id === requestedId);
      if (isAssigned) {
        return this.usersService.findById(requestedId);
      }
    }

    throw new ForbiddenException('You do not have permission to view this user');
  }

}

