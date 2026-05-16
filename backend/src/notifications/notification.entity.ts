import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Log } from '../logs/log.entity';
import { User } from '../users/user.entity';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'studentId' })
  student: User;

  @Column()
  studentId: number;

  @ManyToOne(() => Log, { nullable: true })
  @JoinColumn({ name: 'logId' })
  log: Log | null;

  @Column({ nullable: true })
  logId: number | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'recipientId' })
  recipient: User | null;

  @Column({ nullable: true })
  recipientId: number | null;

  @Column('text')
  message: string;

  @Column({ default: false })
  read: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
