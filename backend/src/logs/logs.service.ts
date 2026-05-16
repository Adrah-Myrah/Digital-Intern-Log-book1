import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Notification } from '../notifications/notification.entity';
import { Placement } from '../placements/placement.entity';
import { User } from '../users/user.entity';
import { Comment } from './comment.entity';
import { ApproveLogDto } from './dto/approve-log.dto';
import { CreateLogDto } from './dto/create-log.dto';
import { Log } from './log.entity';

type AuthUser = { sub: number; role: string };

@Injectable()
export class LogsService {
  constructor(
    @InjectRepository(Log)
    private logsRepository: Repository<Log>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Placement)
    private placementRepository: Repository<Placement>,
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
  ) {}

  // Student submits a log
  async createLog(dto: CreateLogDto): Promise<Log> {
    // Ensure status is pending by default
    const logData: CreateLogDto & { status: string } = {
      ...dto,
      status: 'pending',
    };

    const log = this.logsRepository.create(logData);
    const saved: Log = await this.logsRepository.save(log);

    // Notify assigned industry supervisor (if any)
    try {
      const student = await this.usersRepository.findOne({
        where: { id: saved.studentId, role: 'student' },
        select: ['industrySupervisorId'],
      });
      let supervisorId = student?.industrySupervisorId;
      if (!supervisorId) {
        const placement: Placement | null = await this.placementRepository.findOne({
          where: { studentId: saved.studentId },
        });
        supervisorId = placement?.industrySupervisorId ?? null;
      }

      if (supervisorId) {
        await this.notificationRepository.save(
          this.notificationRepository.create({
            studentId: saved.studentId,
            logId: saved.id,
            recipientId: supervisorId,
            message: `New log submitted: ${saved.taskName}`,
            read: false,
          }),
        );
      }
    } catch (err) {
      // Swallow notification errors so log creation doesn't fail
      console.error('Failed to create supervisor notification', err);
    }

    return saved;
  }

  // Get all logs for a specific student
  async getStudentLogs(
    studentId: number,
    user: AuthUser,
  ): Promise<Log[]> {
    await this.ensureStudentAccess(studentId, user);
    return this.logsRepository.find({
      where: { studentId },
      relations: ['student', 'approvedBySupervisor'],
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

  async getPendingLogsForIndustrySupervisor(
    supervisorId: number,
  ): Promise<Log[]> {
    const studentIds = await this.findAssignmentStudentIds(supervisorId);
    if (studentIds.length === 0) return [];

    return this.logsRepository
      .createQueryBuilder('log')
      .leftJoinAndSelect('log.student', 'student')
      .leftJoinAndSelect('log.approvedBySupervisor', 'approvedBySupervisor')
      .where('log.status = :status', { status: 'pending' })
      .andWhere('log.studentId IN (:...studentIds)', { studentIds })
      .orderBy('log.createdAt', 'DESC')
      .getMany();
  }

  // Get all logs (any status) for students assigned to an industry supervisor
  async getLogsForIndustrySupervisor(supervisorId: number): Promise<Log[]> {
    const studentIds = await this.findAssignmentStudentIds(supervisorId);
    if (studentIds.length === 0) return [];

    return this.logsRepository
      .createQueryBuilder('log')
      .leftJoinAndSelect('log.student', 'student')
      .leftJoinAndSelect('log.approvedBySupervisor', 'approvedBySupervisor')
      .where('log.studentId IN (:...studentIds)', { studentIds })
      .orderBy('log.createdAt', 'DESC')
      .getMany();
  }

  // Get all logs for the current user
  async getAllLogs(user: AuthUser): Promise<Log[]> {
    if (user.role === 'admin') {
      return this.logsRepository.find({
        relations: ['student', 'approvedBySupervisor'],
        order: { createdAt: 'DESC' },
      });
    }

    if (user.role === 'industry-supervisor') {
      const userId = Number(user.sub);
      const studentIds = await this.findAssignmentStudentIds(userId);
      if (studentIds.length === 0) return [];
      return this.logsRepository.find({
        where: { studentId: In(studentIds) },
        relations: ['student', 'approvedBySupervisor'],
        order: { createdAt: 'DESC' },
      });
    }

    if (user.role === 'school-supervisor') {
      const userId = Number(user.sub);
      const students = await this.usersRepository.find({
        where: { role: 'student', schoolSupervisorId: userId },
        select: ['id'],
      });
      const studentIds = students.map((student) => student.id);
      if (studentIds.length === 0) return [];
      return this.logsRepository.find({
        where: { studentId: In(studentIds) },
        relations: ['student', 'approvedBySupervisor'],
        order: { createdAt: 'DESC' },
      });
    }

    throw new ForbiddenException('Unauthorized access to logs');
  }

  // Industry supervisor approves or rejects a log
  async approveLog(
    logId: number,
    dto: ApproveLogDto,
    user: AuthUser,
  ): Promise<Log> {
    const log = await this.logsRepository.findOne({
      where: { id: logId },
      relations: ['student'],
    });
    if (!log) throw new NotFoundException('Log not found');

    if (user.role === 'industry-supervisor') {
      const userId = Number(user.sub);
      const assignedByUser = log.student?.industrySupervisorId === userId;
      const placement = await this.placementRepository.findOne({
        where: {
          studentId: log.studentId,
          industrySupervisorId: userId,
        },
      });
      if (!assignedByUser && !placement) {
        throw new ForbiddenException(
          'You can only approve logs for your assigned students',
        );
      }
      log.approvedBy = userId;
    }

    const previousStatus = log.status;
    log.status = dto.status;
    log.supervisorComment = dto.supervisorComment ?? null;
    log.approvedBy = dto.approvedBy ?? log.approvedBy ?? Number(user.sub);
    log.approvedAt = new Date();

    const saved: Log = await this.logsRepository.save(log);

    // Create notification for student when status changes or supervisor commented
    if (previousStatus !== saved.status || dto.supervisorComment) {
      const message =
        saved.status === 'approved'
          ? `Your supervisor approved log ${saved.taskName}`
          : `Your supervisor updated log ${saved.taskName}: ${dto.supervisorComment ?? saved.supervisorComment}`;
      await this.notificationRepository.save(
        this.notificationRepository.create({
          studentId: saved.studentId,
          logId: saved.id,
          message,
          read: false,
        }),
      );
    }

    return saved;
  }

  // Get a single log by id
  async getLogById(logId: number, user: AuthUser): Promise<Log> {
    const log = await this.logsRepository.findOne({
      where: { id: logId },
      relations: ['student', 'approvedBySupervisor'],
    });
    if (!log) throw new NotFoundException('Log not found');
    await this.ensureLogAccess(log, user);
    return log;
  }

  // Add a comment to a log
  async addComment(
    logId: number,
    comment: string,
    supervisorId: number,
  ): Promise<Log> {
    const log = await this.logsRepository.findOne({
      where: { id: logId },
      relations: ['student'],
    });
    if (!log) throw new NotFoundException('Log not found');

    const assignedByUser = log.student?.industrySupervisorId === supervisorId;
    const placement = await this.placementRepository.findOne({
      where: {
        studentId: log.studentId,
        industrySupervisorId: supervisorId,
      },
    });
    if (!assignedByUser && !placement) {
      throw new ForbiddenException(
        'You can only comment on logs from your assigned students',
      );
    }

    const newComment = this.commentRepository.create({
      logId: log.id,
      supervisorId,
      comment,
    });
    await this.commentRepository.save(newComment);

    await this.notificationRepository.save(
      this.notificationRepository.create({
        studentId: log.studentId,
        logId: log.id,
        message: `Your supervisor commented on log ${log.taskName}: ${comment}`,
        read: false,
      }),
    );

    return log;
  }

  // Get comments for a log (for now, just the approval comment)
  async getComments(
    logId: number,
    user: AuthUser,
  ): Promise<{ comment: string; supervisorId: number; createdAt: Date }[]> {
    const log = await this.logsRepository.findOne({
      where: { id: logId },
      relations: ['student', 'approvedBySupervisor'],
    });
    if (!log) throw new NotFoundException('Log not found');
    await this.ensureLogAccess(log, user);

    // fetch persisted comments
    const persisted = await this.commentRepository.find({
      where: { logId },
      relations: ['supervisor'],
      order: { createdAt: 'ASC' },
    });

    return persisted.map((c) => ({
      comment: c.comment,
      supervisorId: c.supervisorId,
      createdAt: c.createdAt,
    }));
  }

  private async ensureStudentAccess(studentId: number, user: AuthUser) {
    if (user.role === 'admin') return;
    if (user.role === 'student') {
      const userId = Number(user.sub);
      if (userId !== studentId) {
        throw new ForbiddenException('Students can only view their own logs');
      }
      return;
    }

    if (user.role === 'industry-supervisor') {
      const userId = Number(user.sub);
      const student = await this.usersRepository.findOne({
        where: { id: studentId, role: 'student' },
        select: ['industrySupervisorId'],
      });
      if (student?.industrySupervisorId === userId) {
        return;
      }
      const placement = await this.placementRepository.findOne({
        where: { studentId, industrySupervisorId: userId },
      });
      if (!placement) {
        throw new ForbiddenException(
          'You can only view logs for your assigned students',
        );
      }
      return;
    }

    if (user.role === 'school-supervisor') {
      const student = await this.usersRepository.findOne({
        where: { id: studentId, role: 'student' },
      });
      const userId = Number(user.sub);
      if (!student || student.schoolSupervisorId !== userId) {
        throw new ForbiddenException(
          'You can only view logs for your assigned students',
        );
      }
      return;
    }

    throw new ForbiddenException('Unauthorized access');
  }

  private async ensureLogAccess(log: Log, user: AuthUser) {
    if (user.role === 'admin') return;
    if (user.role === 'student') {
      const userId = Number(user.sub);
      if (userId !== log.studentId) {
        throw new ForbiddenException('Students can only view their own logs');
      }
      return;
    }

    if (user.role === 'industry-supervisor') {
      const userId = Number(user.sub);
      if (log.student?.industrySupervisorId === userId) {
        return;
      }
      const placement = await this.placementRepository.findOne({
        where: {
          studentId: log.studentId,
          industrySupervisorId: userId,
        },
      });
      if (!placement) {
        throw new ForbiddenException(
          'You can only view logs for your assigned students',
        );
      }
      return;
    }

    if (user.role === 'school-supervisor') {
      const userId = Number(user.sub);
      if (log.student.schoolSupervisorId !== userId) {
        throw new ForbiddenException(
          'You can only view logs for your assigned students',
        );
      }
      return;
    }

    throw new ForbiddenException('Unauthorized access');
  }

  private async findAssignmentStudentIds(supervisorId: number): Promise<number[]> {
    const students = await this.usersRepository.find({
      where: { role: 'student', industrySupervisorId: supervisorId },
      select: ['id'],
    });
    const studentIds = students.map((student) => student.id);
    if (studentIds.length > 0) {
      return studentIds;
    }

    const placements = await this.placementRepository.find({
      where: { industrySupervisorId: supervisorId },
      select: ['studentId'],
    });
    return placements.map((placement) => placement.studentId);
  }
}
