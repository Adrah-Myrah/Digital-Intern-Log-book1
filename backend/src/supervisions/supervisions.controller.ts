import { Controller, Post, Get, Patch, Param, Body } from '@nestjs/common';
import { SupervisionsService } from './supervisions.service';
import { CreateSupervisionDto } from './dto/create-supervision.dto';
import { SubmitAssessmentDto } from './dto/submit-assessment.dto';

@Controller('supervisions')
export class SupervisionsController {
  constructor(private supervisionsService: SupervisionsService) {}

  // POST /api/supervisions — schedule a supervision
  @Post()
  createSupervision(@Body() body: CreateSupervisionDto) {
    return this.supervisionsService.createSupervision(body);
  }

  // GET /api/supervisions — admin gets all
  @Get()
  getAllSupervisions() {
    return this.supervisionsService.getAllSupervisions();
  }

  // GET /api/supervisions/supervisor/:id
  @Get('supervisor/:id')
  getSupervisorSupervisions(@Param('id') id: string) {
    return this.supervisionsService.getSupervisorSupervisions(Number(id));
  }

  // GET /api/supervisions/student/:id
  @Get('student/:id')
  getStudentSupervisions(@Param('id') id: string) {
    return this.supervisionsService.getStudentSupervisions(Number(id));
  }

  // GET /api/supervisions/:id
  @Get(':id')
  getSupervisionById(@Param('id') id: string) {
    return this.supervisionsService.getSupervisionById(Number(id));
  }

  // PATCH /api/supervisions/:id/assessment — submit assessment after visit
  @Patch(':id/assessment')
  submitAssessment(@Param('id') id: string, @Body() body: SubmitAssessmentDto) {
    return this.supervisionsService.submitAssessment(Number(id), body);
  }
}