import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Supervision } from './supervision.entity';
import { CreateSupervisionDto } from './dto/create-supervision.dto';
import { SubmitAssessmentDto } from './dto/submit-assessment.dto';

@Injectable()
export class SupervisionsService {
  constructor(
    @InjectRepository(Supervision)
    private supervisionsRepository: Repository<Supervision>,
  ) {}

  // Schedule a supervision
  async createSupervision(dto: CreateSupervisionDto): Promise<Supervision> {
    const supervision = this.supervisionsRepository.create(dto);
    return this.supervisionsRepository.save(supervision);
  }

  // Get all supervisions for a supervisor
  async getSupervisorSupervisions(
    supervisorId: number,
  ): Promise<Supervision[]> {
    return this.supervisionsRepository.find({
      where: { supervisorId },
      order: { createdAt: 'DESC' },
    });
  }

  // Get all supervisions for a student
  async getStudentSupervisions(studentId: number): Promise<Supervision[]> {
    return this.supervisionsRepository.find({
      where: { studentId },
      order: { createdAt: 'DESC' },
    });
  }

  // Get single supervision
  async getSupervisionById(id: number): Promise<Supervision> {
    const supervision = await this.supervisionsRepository.findOne({
      where: { id },
    });
    if (!supervision) throw new NotFoundException('Supervision not found');
    return supervision;
  }

  // Submit assessment after visit
  async submitAssessment(
    id: number,
    dto: SubmitAssessmentDto,
  ): Promise<Supervision> {
    const supervision = await this.supervisionsRepository.findOne({
      where: { id },
    });
    if (!supervision) throw new NotFoundException('Supervision not found');

    Object.assign(supervision, dto);
    return this.supervisionsRepository.save(supervision);
  }

  // Get all supervisions (admin)
  async getAllSupervisions(): Promise<Supervision[]> {
    return this.supervisionsRepository.find({
      order: { createdAt: 'DESC' },
    });
  }
}
