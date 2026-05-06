import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('logs')
export class Log {
  @PrimaryGeneratedColumn()
  id: number;

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

  @Column({ nullable: true })
  approvedBy: number;

  @Column({ nullable: true })
  approvedAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}