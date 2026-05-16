import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

@Entity('logs')
export class Log {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'studentId' })
  student: User;

  @Column()
  studentId: number;

  @Column()
  taskName: string;

  @Column()
  workType: string;

  @Column('text')
  description: string;

  @Column({ nullable: true })
  skillsApplied: string;

  @Column()
  estimatedHours: number;

  @Column({ nullable: true })
  proofFileUrl: string;

  @Column({ nullable: true, type: 'decimal', precision: 10, scale: 7 })
  gpsLatitude: number;

  @Column({ nullable: true, type: 'decimal', precision: 10, scale: 7 })
  gpsLongitude: number;

  @Column({ default: 'pending' })
  status: string;

  @Column({ nullable: true, type: 'text' })
  supervisorComment: string | null;

  @Column({ nullable: true, type: 'text' })
  approvalComment: string | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'approvedBy' })
  approvedBySupervisor: User | null;

  @Column({ nullable: true })
  approvedBy: number;

  @Column({ nullable: true })
  approvedAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
