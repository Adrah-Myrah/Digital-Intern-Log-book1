import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
  ) {}

  async createNotification(
    studentId: number,
    message: string,
    logId?: number,
    recipientId?: number,
  ): Promise<Notification> {
    const notification = this.notificationRepository.create({
      studentId,
      message,
      logId: logId ?? null,
      recipientId: recipientId ?? null,
      read: false,
    });
    return this.notificationRepository.save(notification);
  }

  async findNotificationsForUser(userId: number): Promise<Notification[]> {
    return this.notificationRepository
      .createQueryBuilder('n')
      .leftJoinAndSelect('n.student', 'student')
      .leftJoinAndSelect('n.recipient', 'recipient')
      .where('n.recipientId = :userId', { userId })
      .orWhere('n.studentId = :userId', { userId })
      .orderBy('n.createdAt', 'DESC')
      .getMany();
  }

  async findNotificationsForStudent(studentId: number): Promise<Notification[]> {
    return this.notificationRepository.find({
      where: { studentId },
      order: { createdAt: 'DESC' },
    });
  }
}
