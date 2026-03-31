import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './message.entity';
import { SendMessageDto } from './dto/send-message.dto';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private messagesRepository: Repository<Message>,
  ) {}

  // Send a message
  async sendMessage(dto: SendMessageDto): Promise<Message> {
    const message = this.messagesRepository.create(dto);
    const saved = await this.messagesRepository.save(message);
    return saved as unknown as Message;
  }

  // Get conversation between two users
  async getConversation(userId1: number, userId2: number): Promise<Message[]> {
    return this.messagesRepository
      .createQueryBuilder('message')
      .where(
        '(message.senderId = :userId1 AND message.receiverId = :userId2) OR (message.senderId = :userId2 AND message.receiverId = :userId1)',
        { userId1, userId2 }
      )
      .orderBy('message.sentAt', 'ASC')
      .getMany();
  }

  // Get all conversations for a user (latest message per contact)
  async getUserConversations(userId: number): Promise<Message[]> {
    return this.messagesRepository
      .createQueryBuilder('message')
      .where('message.senderId = :userId OR message.receiverId = :userId', { userId })
      .orderBy('message.sentAt', 'DESC')
      .getMany();
  }

  // Mark messages as read
  async markAsRead(senderId: number, receiverId: number): Promise<void> {
    await this.messagesRepository
      .createQueryBuilder()
      .update(Message)
      .set({ isRead: true })
      .where('senderId = :senderId AND receiverId = :receiverId', { senderId, receiverId })
      .execute();
  }

  // Get unread count for a user
  async getUnreadCount(userId: number): Promise<number> {
    return this.messagesRepository.count({
      where: { receiverId: userId, isRead: false }
    });
  }
}