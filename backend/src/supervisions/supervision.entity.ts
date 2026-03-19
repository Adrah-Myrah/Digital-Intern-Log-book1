import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('supervisions')
export class Supervision {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  supervisorId: number;

  @Column()
  studentId: number;

  // Part 1 - Schedule
  @Column()
  mode: string;

  @Column({ type: 'date' })
  supervisionDate: string;

  @Column()
  supervisionTime: string;

  @Column()
  durationMinutes: number;

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true })
  zoomLink: string;

  @Column({ nullable: true, type: 'text' })
  notesBefore: string | null;

  // Part 2 - Assessment
  @Column({ default: 'scheduled' })
  status: string;

  @Column({ nullable: true })
  actualDateTime: string;

  @Column({ nullable: true })
  performanceRating: string;

  @Column({ nullable: true, type: 'text' })
  technicalSkills: string | null;

  @Column({ nullable: true, type: 'text' })
  professionalism: string | null;

  @Column({ nullable: true, type: 'text' })
  areasOfImprovement: string | null;

  @Column({ nullable: true, type: 'text' })
  finalComments: string | null;

  @CreateDateColumn()
  createdAt: Date;
}