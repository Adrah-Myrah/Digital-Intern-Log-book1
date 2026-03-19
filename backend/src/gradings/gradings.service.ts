import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Grading } from './grading.entity';
import { CreateGradingDto } from './dto/create-grading.dto';

@Injectable()
export class GradingsService {
  constructor(
    @InjectRepository(Grading)
    private gradingsRepository: Repository<Grading>,
  ) {}

  // Submit grading for a student
  async createGrading(dto: CreateGradingDto): Promise<Grading> {
    const grading = this.gradingsRepository.create(dto);
    return this.gradingsRepository.save(grading);
  }

  // Get all gradings for a specific student
  async getStudentGradings(studentId: number): Promise<Grading[]> {
    return this.gradingsRepository.find({
      where: { studentId },
      order: { createdAt: 'DESC' },
    });
  }

  // Get all gradings submitted by a supervisor
  async getSupervisorGradings(supervisorId: number): Promise<Grading[]> {
    return this.gradingsRepository.find({
      where: { supervisorId },
      order: { createdAt: 'DESC' },
    });
  }

  // Get single grading
  async getGradingById(id: number): Promise<Grading> {
    const grading = await this.gradingsRepository.findOne({ where: { id } });
    if (!grading) throw new NotFoundException('Grading not found');
    return grading;
  }

  // Update grading
  async updateGrading(id: number, dto: Partial<CreateGradingDto>): Promise<Grading> {
    const grading = await this.gradingsRepository.findOne({ where: { id } });
    if (!grading) throw new NotFoundException('Grading not found');
    Object.assign(grading, dto);
    return this.gradingsRepository.save(grading);
  }

  // Get all gradings (admin)
  async getAllGradings(): Promise<Grading[]> {
    return this.gradingsRepository.find({
      order: { createdAt: 'DESC' },
    });
  }
}