import { Controller, Post, Get, Patch, Param, Body } from '@nestjs/common';
import { GradingsService } from './gradings.service';
import { CreateGradingDto } from './dto/create-grading.dto';

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
  updateGrading(@Param('id') id: string, @Body() body: Partial<CreateGradingDto>) {
    return this.gradingsService.updateGrading(Number(id), body);
  }
}