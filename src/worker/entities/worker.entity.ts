import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('workers')
export class Worker {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  fullName!: string;

  @Column({ unique: true })
  phone!: string;

  @Column()
  skill!: string; // 'plumber', 'electrician', etc.

  @Column()
  idNumber!: string;

  @Column({ default: false })
  verified!: boolean;

  @Column({ default: true })
  available!: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  lastJobTimestamp!: Date;
  
  // rating system
  @Column({ default: 0 })
  rating!: number;

  @Column({ default: 0 })
  numReviews!: number;

  @Column({ default: 0 })
  numJobsCompleted!: number;

  @Column({ default: 0 })
  numJobsCancelled!: number;

}
