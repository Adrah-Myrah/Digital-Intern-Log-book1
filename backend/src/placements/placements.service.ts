import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from '../organizations/organization.entity';
import { CreatePlacementDto } from './dto/create-placement.dto';
import { Placement } from './placement.entity';

@Injectable()
export class PlacementsService {
  constructor(
    @InjectRepository(Placement)
    private placementRepository: Repository<Placement>,
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
  ) {}

  async createPlacement(dto: CreatePlacementDto): Promise<Placement> {
    const organization = await this.organizationRepository.findOne({
      where: { id: dto.organizationId },
    });
    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    const placement = this.placementRepository.create(dto);
    return this.placementRepository.save(placement);
  }

  async findStudentIdsByIndustrySupervisor(supervisorId: number): Promise<number[]> {
    const placements = await this.placementRepository.find({
      where: { industrySupervisorId: supervisorId },
      select: ['studentId'],
    });
    return placements.map((placement) => placement.studentId);
  }

  async findPlacementForStudentAndSupervisor(
    studentId: number,
    supervisorId: number,
  ): Promise<Placement | null> {
    return this.placementRepository.findOne({
      where: { studentId, industrySupervisorId: supervisorId },
    });
  }
}
