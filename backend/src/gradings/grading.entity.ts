import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('gradings')
export class Grading {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  supervisorId: number;

  @Column()
  studentId: number;

  // Attendance (20%)
  @Column({ nullable: true })
  attendanceRate: number;

  @Column({ nullable: true, type: 'text' })
  attendanceComments: string | null;

  // Daily Entries (25%)
  @Column({ nullable: true })
  logQuality: string;

  @Column({ nullable: true })
  logConsistency: number;

  // Internship Report (20%)
  @Column({ nullable: true })
  reportGrade: string;

  @Column({ nullable: true, type: 'text' })
  reportFeedback: string | null;

  // Communication (15%)
  @Column({ nullable: true })
  communicationRating: number;

  @Column({ nullable: true, type: 'text' })
  communicationObservations: string | null;

  // Industry Evaluation (20%)
  @Column({ nullable: true })
  industryPerformance: string;

  @Column({ nullable: true, type: 'text' })
  industryComments: string | null;

  // Overall
  @Column({ nullable: true })
  overallGrade: string;

  @Column({ nullable: true, type: 'text' })
  finalComments: string | null;

  @CreateDateColumn()
  createdAt: Date;
}