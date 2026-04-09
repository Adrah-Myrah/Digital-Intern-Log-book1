// import { Injectable } from '@nestjs/common';

// @Injectable()
// export class UsersService {}
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
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

  async createUser(data: Partial<User>): Promise<User> {
    const user = this.usersRepository.create(data);
    return this.usersRepository.save(user);
  }

  async findById(id: number): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async findAllStudents(): Promise<User[]> {
    return this.usersRepository.find({ 
      where: { role: 'student' },
      order: { fullName: 'ASC' }
    });
  }

  async findByRole(role: string): Promise<User[]> {
    return this.usersRepository.find({
      where: { role },
      order: { fullName: 'ASC' },
    });
  }

  async getRoleCounts() {
    const [students, schoolSupervisors, industrySupervisors, admins] = await Promise.all([
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
      order: { fullName: 'ASC' },
    });
  }

  async findStudentsByIndustrySupervisor(supervisorId: number): Promise<User[]> {
    return this.usersRepository.find({
      where: { role: 'student', industrySupervisorId: supervisorId },
      order: { fullName: 'ASC' },
    });
  }

  async assignStudentSupervisors(
    studentId: number,
    schoolSupervisorId?: number | null,
    industrySupervisorId?: number | null,
  ) {
    const student = await this.usersRepository.findOne({ where: { id: studentId, role: 'student' } });
    if (!student) throw new NotFoundException('Student not found');

    if (schoolSupervisorId !== undefined) {
      student.schoolSupervisorId = schoolSupervisorId ?? null;
    }
    if (industrySupervisorId !== undefined) {
      student.industrySupervisorId = industrySupervisorId ?? null;
    }

    return this.usersRepository.save(student);
  }
}

