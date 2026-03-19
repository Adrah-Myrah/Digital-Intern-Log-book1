import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  studentId: number;

  @Column()
  fileName: string;

  @Column()
  fileUrl: string;

  @Column({ default: 'submitted' })
  status: string;           // submitted / reviewed / graded

  @Column({ nullable: true })
  reviewedBy: number;

  @Column({ nullable: true })
  grade: string;

  @Column({ nullable: true, type: 'text' })
  reviewComments: string | null;

  @CreateDateColumn()
  submittedAt: Date;
}