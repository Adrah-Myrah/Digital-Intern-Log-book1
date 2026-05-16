import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
} from 'typeorm';

@Entity('settings')
export class Setting {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  key: string; // e.g. 'internship_start', 'internship_end'

  @Column()
  value: string; // e.g. '2026-01-13'

  @Column({ nullable: true })
  label: string; // e.g. 'Internship Start Date'

  @UpdateDateColumn()
  updatedAt: Date;
}
