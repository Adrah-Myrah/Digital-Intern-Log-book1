import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, In, Not } from 'typeorm';
import { Message } from './message.entity';
import { SendMessageDto } from './dto/send-message.dto';
import { User } from '../users/user.entity';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private messagesRepository: Repository<Message>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  private async getUserById(userId: number): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  private async canUsersMessage(userId1: number, userId2: number): Promise<boolean> {
    const [user1, user2] = await Promise.all([
      this.getUserById(userId1),
      this.getUserById(userId2),
    ]);

    if (!user1 || !user2) {
      throw new NotFoundException('User not found');
    }

    if (user1.role === 'admin' || user2.role === 'admin') return true;

    const isStudentPair = user1.role === 'student' || user2.role === 'student';
    if (!isStudentPair) return false;

    const student = user1.role === 'student' ? user1 : user2;
    const other = user1.role === 'student' ? user2 : user1;
    const allowedSupervisorIds = [student.schoolSupervisorId, student.industrySupervisorId]
      .filter(Boolean)
      .map(Number); // Force to number

    if (allowedSupervisorIds.length === 0) return false;

    return allowedSupervisorIds.includes(Number(other.id)); // Force both to number
  }

  async getAvailableUsers(userId: number, userRole: string, query?: string): Promise<Partial<User>[]> {
    const user = await this.getUserById(userId);
    const searchTerm = query?.trim();
    const nameFilter = searchTerm ? ILike(`%${searchTerm}%`) : undefined;
    const selectFields: (keyof User)[] = ['id', 'fullName', 'role', 'email', 'registrationNumber', 'staffId', 'department'];
    const ordering = { fullName: 'ASC' } as const;

    if (userRole === 'admin') {
      return this.usersRepository.find({
        where: [
          { role: Not('admin'), id: Not(user.id), ...(nameFilter ? { fullName: nameFilter } : {}) },
        ],
        select: selectFields,
        order: ordering,
      });
    }

    if (userRole === 'student') {
      const supervisorIds = [user.schoolSupervisorId, user.industrySupervisorId].filter(Boolean) as number[];
      if (supervisorIds.length === 0) {
        return [];
      }
      return this.usersRepository.find({
        where: supervisorIds.map(id => ({ id, ...(nameFilter ? { fullName: nameFilter } : {}) } as any)),
        select: selectFields,
        order: ordering,
      });
    }

    if (userRole === 'school-supervisor' || userRole === 'industry-supervisor') {
      const supervisorField = userRole === 'school-supervisor' ? 'schoolSupervisorId' : 'industrySupervisorId';
      return this.usersRepository.find({
        where: [
          { [supervisorField]: userId, ...(nameFilter ? { fullName: nameFilter } : {}) },
        ],
        select: selectFields,
        order: ordering,
      });
    }

    return [];
  }

  // Send a message
  async sendMessage(senderId: number, receiverId: number, content: string): Promise<Message> {
    const allowed = await this.canUsersMessage(senderId, receiverId);
    if (!allowed) {
      throw new ForbiddenException('Messaging not allowed for this user pair');
    }

    const message = this.messagesRepository.create({
      senderId,
      receiverId,
      content,
      isRead: false,
    });
    return this.messagesRepository.save(message);
  }

  // Get conversation between two users
  async getConversation(userId1: number, userId2: number): Promise<Message[]> {
    const allowed = await this.canUsersMessage(userId1, userId2);
    if (!allowed) {
      throw new ForbiddenException('Conversation access denied');
    }

    return this.messagesRepository
      .createQueryBuilder('message')
      .where(
        '(message.senderId = :userId1 AND message.receiverId = :userId2) OR (message.senderId = :userId2 AND message.receiverId = :userId1)',
        { userId1, userId2 },
      )
      .orderBy('message.sentAt', 'ASC')
      .getMany();
  }

  // Get all conversations for a user (latest message per contact)
  async getUserConversations(userId: number): Promise<Message[]> {
    return this.messagesRepository
      .createQueryBuilder('message')
      .where('message.senderId = :userId OR message.receiverId = :userId', {
        userId,
      })
      .orderBy('message.sentAt', 'DESC')
      .getMany();
  }

  // Mark messages as read
  async markAsRead(senderId: number, receiverId: number): Promise<void> {
    await this.messagesRepository
      .createQueryBuilder()
      .update(Message)
      .set({ isRead: true })
      .where('senderId = :senderId AND receiverId = :receiverId', {
        senderId,
        receiverId,
      })
      .execute();
  }

  // Get unread count for a user
  async getUnreadCount(userId: number): Promise<number> {
    return this.messagesRepository.count({
      where: { receiverId: userId, isRead: false },
    });
  }
}
