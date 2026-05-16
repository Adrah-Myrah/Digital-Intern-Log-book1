import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { Log } from './log.entity';

@Entity('log_comments')
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Log, { nullable: false })
  @JoinColumn({ name: 'logId' })
  log: Log;

  @Column()
  logId: number;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'supervisorId' })
  supervisor: User;

  @Column()
  supervisorId: number;

  @Column('text')
  comment: string;

  @CreateDateColumn()
  createdAt: Date;
}
