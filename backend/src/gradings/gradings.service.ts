import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Placement } from '../placements/placement.entity';
import { User } from '../users/user.entity';
import { CreateGradingDto } from './dto/create-grading.dto';
import { Grading } from './grading.entity';

@Injectable()
export class GradingsService {
  constructor(
    @InjectRepository(Grading)
    private gradingsRepository: Repository<Grading>,
    @InjectRepository(Placement)
    private placementRepository: Repository<Placement>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  // Return students assigned to an industry supervisor
  async getAssignedStudents(supervisorId: number): Promise<{
    id: number;
    fullName: string;
    registrationNumber: string;
    course: string;
    internshipOrganization: string;
  }[]> {
    const students = await this.usersRepository.find({
      where: { role: 'student', industrySupervisorId: supervisorId },
      order: { fullName: 'ASC' },
    });

    if (students.length > 0) {
      return students.map((student) => ({
        id: student.id,
        fullName: student.fullName,
        registrationNumber: student.registrationNumber,
        course: student.course,
        internshipOrganization: student.placementCompany || '',
      }));
    }

    const placements = await this.placementRepository.find({
      where: { industrySupervisorId: supervisorId },
      relations: ['student', 'organization'],
    });

    return placements.map((p) => ({
      id: p.student.id,
      fullName: p.student.fullName,
      registrationNumber: p.student.registrationNumber,
      course: p.student.course,
      internshipOrganization: p.organization?.name || p.student.placementCompany || '',
    }));
  }

  // Submit grading for a student
  async createGrading(dto: CreateGradingDto): Promise<Grading> {
    // Calculate industry supervisor total if individual scores are provided
    if (
      dto.enthusiasm !== undefined &&
      dto.technicalCompetence !== undefined &&
      dto.punctuality !== undefined &&
      dto.presentationSmartness !== undefined &&
      dto.superiorSubordinateRelationship !== undefined &&
      dto.adherenceToPolicies !== undefined
    ) {
      dto.industrySupervisorTotal =
        dto.enthusiasm +
        dto.technicalCompetence +
        dto.punctuality +
        dto.presentationSmartness +
        dto.superiorSubordinateRelationship +
        dto.adherenceToPolicies;
    }
    const grading = this.gradingsRepository.create(dto);
    return this.gradingsRepository.save(grading);
  }

  // Get all gradings (admin)
  async getAllGradings(): Promise<Grading[]> {
    return this.gradingsRepository.find({
      order: { createdAt: 'DESC' },
    });
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
  async updateGrading(
    id: number,
    dto: Partial<CreateGradingDto>,
  ): Promise<Grading> {
    const grading = await this.gradingsRepository.findOne({ where: { id } });
    if (!grading) throw new NotFoundException('Grading not found');

    // Calculate industry supervisor total if individual scores are provided
    if (
      dto.enthusiasm !== undefined &&
      dto.technicalCompetence !== undefined &&
      dto.punctuality !== undefined &&
      dto.presentationSmartness !== undefined &&
      dto.superiorSubordinateRelationship !== undefined &&
      dto.adherenceToPolicies !== undefined
    ) {
      dto.industrySupervisorTotal =
        dto.enthusiasm +
        dto.technicalCompetence +
        dto.punctuality +
        dto.presentationSmartness +
        dto.superiorSubordinateRelationship +
        dto.adherenceToPolicies;
    }

    Object.assign(grading, dto);
    return this.gradingsRepository.save(grading);
  }

  // Submit industry supervisor grading
  async submitIndustryGrading(
    supervisorId: number,
    studentId: number,
    dto: {
      enthusiasm: number;
      technicalCompetence: number;
      punctuality: number;
      presentationSmartness: number;
      superiorSubordinateRelationship: number;
      adherenceToPolicies: number;
      industryComments?: string;
    },
  ): Promise<Grading> {
    // verify supervisor is assigned to student
    const placement = await this.placementRepository.findOne({
      where: { studentId, industrySupervisorId: supervisorId },
    });
    if (!placement) {
      throw new NotFoundException('You are not assigned to this student');
    }
    // Find existing grading or create new one
    let grading = await this.gradingsRepository.findOne({
      where: { studentId },
    });

    if (!grading) {
      grading = this.gradingsRepository.create({ studentId });
    }

    // Calculate total
    const total =
      dto.enthusiasm +
      dto.technicalCompetence +
      dto.punctuality +
      dto.presentationSmartness +
      dto.superiorSubordinateRelationship +
      dto.adherenceToPolicies;

    // Update industry grading fields
    grading.enthusiasm = dto.enthusiasm;
    grading.technicalCompetence = dto.technicalCompetence;
    grading.punctuality = dto.punctuality;
    grading.presentationSmartness = dto.presentationSmartness;
    grading.superiorSubordinateRelationship =
      dto.superiorSubordinateRelationship;
    grading.adherenceToPolicies = dto.adherenceToPolicies;
    grading.industrySupervisorTotal = total;
    grading.supervisorId = supervisorId;
    if (dto.industryComments) {
      grading.industryComments = dto.industryComments;
    }

    return this.gradingsRepository.save(grading);
  }
}
