import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/guards/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { GradingsService } from './gradings.service';

@Controller('industry-supervisor/grading')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('industry-supervisor')
export class IndustrySupervisorGradingController {
  constructor(private gradingsService: GradingsService) {}

  @Get('students')
  async getAssignedStudents(@Req() req: any) {
    const userId = Number(req.user.sub);
    return this.gradingsService.getAssignedStudents(userId);
  }

  @Post(':studentId')
  async submitGrading(
    @Param('studentId') studentId: string,
    @Body() body: any,
    @Req() req: any,
  ) {
    const supervisorId = Number(req.user.sub);
    // Only allow fields we expect
    const dto = {
      enthusiasm: Number(body.enthusiasm) || 0,
      technicalCompetence: Number(body.technicalCompetence) || 0,
      punctuality: Number(body.punctuality) || 0,
      presentationSmartness: Number(body.presentationSmartness) || 0,
      superiorSubordinateRelationship: Number(body.superiorSubordinateRelationship) || 0,
      adherenceToPolicies: Number(body.adherenceToPolicies) || 0,
      industryComments: body.industryComments || body.industryComments || null,
    };

    return this.gradingsService.submitIndustryGrading(
      supervisorId,
      Number(studentId),
      dto,
    );
  }
}
