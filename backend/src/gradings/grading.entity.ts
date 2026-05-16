import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
} from 'typeorm';

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

  // Industry Evaluation (20%) - Detailed criteria from industry supervisor
  @Column({ nullable: true })
  industryPerformance: string;

  @Column({ nullable: true, type: 'text' })
  industryComments: string | null;

  // Industry Supervisor Detailed Grading (30 marks total)
  @Column({ nullable: true, default: 0 })
  enthusiasm: number; // Enthusiasm in organization activities (5 marks)

  @Column({ nullable: true, default: 0 })
  technicalCompetence: number; // Technical competence (5 marks)

  @Column({ nullable: true, default: 0 })
  punctuality: number; // Punctuality (5 marks)

  @Column({ nullable: true, default: 0 })
  presentationSmartness: number; // Presentation smartness (5 marks)

  @Column({ nullable: true, default: 0 })
  superiorSubordinateRelationship: number; // Superior-subordinate relationship (5 marks)

  @Column({ nullable: true, default: 0 })
  adherenceToPolicies: number; // Adherence to organization goals, procedures and policies (5 marks)

  @Column({ nullable: true, default: 0 })
  industrySupervisorTotal: number; // Total marks from industry supervisor (max 30)

  // Overall
  @Column({ nullable: true })
  overallGrade: string;

  @Column({ nullable: true, type: 'text' })
  finalComments: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
