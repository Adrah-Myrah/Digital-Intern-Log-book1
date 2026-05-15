// import { Injectable } from '@nestjs/common';

// @Injectable()
// export class LogsService {}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Log } from './log.entity';
import { CreateLogDto } from './dto/create-log.dto';
import { ApproveLogDto } from './dto/approve-log.dto';
import { User } from '../users/user.entity';

@Injectable()
export class LogsService {
  constructor(
    @InjectRepository(Log)
    private logsRepository: Repository<Log>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  // Student submits a log
  async createLog(dto: CreateLogDto): Promise<Log> {
    const log = this.logsRepository.create(dto);
    return this.logsRepository.save(log);
  }

  // Get all logs for a specific student
  async getStudentLogs(studentId: number): Promise<Log[]> {
    return this.logsRepository.find({
      where: { studentId },
      order: { createdAt: 'DESC' },
    });
  }

  // Get all pending logs for industry supervisor
  async getPendingLogs(): Promise<Log[]> {
    return this.logsRepository.find({
      where: { status: 'pending' },
      order: { createdAt: 'DESC' },
    });
  }

  async getPendingLogsForIndustrySupervisor(supervisorId: number): Promise<Log[]> {
    const assignedStudents = await this.usersRepository.find({
      where: { role: 'student', industrySupervisorId: supervisorId },
      select: ['id'],
    });

    const studentIds = assignedStudents.map(s => s.id);
    if (studentIds.length === 0) return [];

    return this.logsRepository
      .createQueryBuilder('log')
      .where('log.status = :status', { status: 'pending' })
      .andWhere('log.studentId IN (:...studentIds)', { studentIds })
      .orderBy('log.createdAt', 'DESC')
      .getMany();
  }

  // Get all logs (admin)
  async getAllLogs(): Promise<Log[]> {
    return this.logsRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  // Industry supervisor approves or rejects a log
  async approveLog(logId: number, dto: ApproveLogDto): Promise<Log> {
    const log = await this.logsRepository.findOne({ where: { id: logId } });
    if (!log) throw new NotFoundException('Log not found');

    log.status = dto.status;
    if (dto.supervisorComment !== undefined) log.supervisorComment = dto.supervisorComment;
    if (dto.approvedBy !== undefined) log.approvedBy = dto.approvedBy;
    if (dto.status === 'approved' || dto.status === 'rejected') {
      log.approvedAt = new Date();
    }

    return this.logsRepository.save(log);
  }

  // Get a single log by id
  async getLogById(logId: number): Promise<Log> {
    const log = await this.logsRepository.findOne({ where: { id: logId } });
    if (!log) throw new NotFoundException('Log not found');
    return log;
  }
}