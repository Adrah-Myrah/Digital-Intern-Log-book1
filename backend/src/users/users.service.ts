// import { Injectable } from '@nestjs/common';

// @Injectable()
// export class UsersService {}
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Placement } from '../placements/placement.entity';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Placement)
    private placementRepository: Repository<Placement>,
  ) {}

  async findByStaffId(staffId: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { staffId } });
  }

  async findByRegNumber(registrationNumber: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { registrationNumber } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findById(id: number): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async createUser(data: Partial<User>): Promise<User> {
    const user = this.usersRepository.create(data);
    return this.usersRepository.save(user);
  }

  async saveUser(user: User): Promise<User> {
    return this.usersRepository.save(user);
  }

  async findAllStudents(): Promise<User[]> {
    return this.usersRepository.find({
      where: { role: 'student' },
      order: { fullName: 'ASC' },
    });
  }

  async findByRole(role: string): Promise<User[]> {
    return this.usersRepository.find({
      where: { role },
      order: { fullName: 'ASC' },
    });
  }

  async getRoleCounts() {
    const [students, schoolSupervisors, industrySupervisors, admins] =
      await Promise.all([
        this.usersRepository.count({ where: { role: 'student' } }),
        this.usersRepository.count({ where: { role: 'school-supervisor' } }),
        this.usersRepository.count({ where: { role: 'industry-supervisor' } }),
        this.usersRepository.count({ where: { role: 'admin' } }),
      ]);

    return {
      students,
      schoolSupervisors,
      industrySupervisors,
      admins,
      supervisors: schoolSupervisors + industrySupervisors,
      totalUsers: students + schoolSupervisors + industrySupervisors + admins,
    };
  }

  async findStudentsBySchoolSupervisor(supervisorId: number): Promise<User[]> {
    return this.usersRepository.find({
      where: { role: 'student', schoolSupervisorId: supervisorId },
      relations: ['schoolSupervisor'],
      order: { fullName: 'ASC' },
    });
  }

  async findStudentsByIndustrySupervisor(
    supervisorId: number,
  ): Promise<User[]> {
    const placements = await this.placementRepository.find({
      where: { industrySupervisorId: supervisorId },
      relations: ['student'],
    });

    return placements
      .map((placement) => placement.student)
      .sort((left, right) => left.fullName.localeCompare(right.fullName));
  }

  async assignStudentSupervisors(
    studentId: number,
    schoolSupervisorId?: number | null,
    industrySupervisorId?: number | null,
  ) {
    const student = await this.usersRepository.findOne({
      where: { id: studentId, role: 'student' },
    });
    if (!student) throw new NotFoundException('Student not found');

    if (schoolSupervisorId !== undefined) {
      student.schoolSupervisorId = schoolSupervisorId ?? null;
    }
    if (industrySupervisorId !== undefined) {
      student.industrySupervisorId = industrySupervisorId ?? null;
    }

    return this.usersRepository.save(student);
  }

  async linkStudentsByRegistrationNumbers(
    supervisorId: number,
    registrationNumbers: string[],
  ): Promise<{ linked: User[]; failed: string[] }> {
    const linked: User[] = [];
    const failed: string[] = [];

    for (const regNumber of registrationNumbers) {
      const student = await this.usersRepository.findOne({
        where: { registrationNumber: regNumber, role: 'student' },
      });

      if (!student) {
        failed.push(`${regNumber}: Student not found`);
        continue;
      }

      if (student.industrySupervisorId === supervisorId) {
        failed.push(`${regNumber}: Already assigned to this supervisor`);
        continue;
      }

      student.industrySupervisorId = supervisorId;
      const updated = await this.usersRepository.save(student);
      linked.push(updated);
    }

    return { linked, failed };
  }

  async getInternsByIndustrySupervisor(supervisorId: number): Promise<User[]> {
    return this.usersRepository.find({
      where: { role: 'student', industrySupervisorId: supervisorId },
      order: { fullName: 'ASC' },
    });
  }
}
