import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('users')
export class User {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: ['student', 'school-supervisor', 'industry-supervisor', 'admin'] })
  role: string;

  @Column()
  fullName: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  // Student-only fields
  @Column({ nullable: true, unique: true })
  registrationNumber: string;   // e.g. 2021/BSC/001

  @Column({ nullable: true })
  yearOfStudy: string;          // Year 1 - 4

  @Column({ nullable: true })
  internshipAttempt: string;    // First Time or Retake

  @Column({ nullable: true })
  course: string;               // e.g. BSc Computer Science

  @Column({ nullable: true })
  placementCompany: string;     // Company / Organisation name

  @Column({ nullable: true })
  country: string;              // Uganda, Kenya, etc.

  // Supervisor / Admin fields
  @Column({ nullable: true, unique: true })
  staffId: string;              // e.g. STAFF-042

  @Column({ nullable: true })
  department: string;           // Not shown for admin

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  internshipStartDate: string;

  @Column({ nullable: true })
  internshipEndDate: string;
}