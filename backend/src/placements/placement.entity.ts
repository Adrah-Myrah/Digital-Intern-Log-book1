import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Organization } from '../organizations/organization.entity';
import { User } from '../users/user.entity';

@Entity('placements')
export class Placement {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'studentId' })
  student: User;

  @Column()
  studentId: number;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'industrySupervisorId' })
  industrySupervisor: User;

  @Column()
  industrySupervisorId: number;

  @ManyToOne(() => Organization, { nullable: false })
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @Column()
  organizationId: number;

  @CreateDateColumn()
  createdAt: Date;
}
