import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/guards/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateGradingDto } from './dto/create-grading.dto';
import { GradingsService } from './gradings.service';

@Controller('gradings')
export class GradingsController {
  constructor(private gradingsService: GradingsService) {}

  // POST /api/gradings — submit a grading
  @Post()
  createGrading(@Body() body: CreateGradingDto) {
    return this.gradingsService.createGrading(body);
  }

  // GET /api/gradings — admin gets all
  @Get()
  getAllGradings() {
    return this.gradingsService.getAllGradings();
  }

  // GET /api/gradings/student/:id
  @Get('student/:id')
  getStudentGradings(@Param('id') id: string) {
    return this.gradingsService.getStudentGradings(Number(id));
  }

  // GET /api/gradings/supervisor/:id
  @Get('supervisor/:id')
  getSupervisorGradings(@Param('id') id: string) {
    return this.gradingsService.getSupervisorGradings(Number(id));
  }

  // GET /api/gradings/:id
  @Get(':id')
  getGradingById(@Param('id') id: string) {
    return this.gradingsService.getGradingById(Number(id));
  }

  // PATCH /api/gradings/:id — update a grading
  @Patch(':id')
  updateGrading(
    @Param('id') id: string,
    @Body() body: Partial<CreateGradingDto>,
  ) {
    return this.gradingsService.updateGrading(Number(id), body);
  }

  // POST /api/gradings/industry/:studentId — industry supervisor submits grading
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('industry-supervisor')
  @Post('industry/:studentId')
  submitIndustryGrading(
    @Param('studentId') studentId: string,
    @Body()
    body: {
      enthusiasm: number;
      technicalCompetence: number;
      punctuality: number;
      presentationSmartness: number;
      superiorSubordinateRelationship: number;
      adherenceToPolicies: number;
      industryComments?: string;
    },
    @Req() req: any,
  ) {
    return this.gradingsService.submitIndustryGrading(
      Number(req.user.sub),
      Number(studentId),
      body,
    );
  }
}
