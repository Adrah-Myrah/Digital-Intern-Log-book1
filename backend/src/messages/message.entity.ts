import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  senderId: number;

  @Column()
  receiverId: number;

  @Column('text')
  content: string;

  @Column({ default: false })
  isRead: boolean;

  @CreateDateColumn()
  sentAt: Date;
}