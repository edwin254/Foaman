import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { Point } from 'geojson';

@Entity('workers')
export class Worker {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  fullName: string;

  @Column({ unique: true })
  phone: string;

  @Column()
  skill: string; // 'plumber', 'electrician', etc.

  @Column('geometry', { spatialFeatureType: 'Point', srid: 4326 })
  location: Point; // { type: 'Point', coordinates: [lng, lat] }

  @Column()
  idNumber: string;

  @Column({ default: false })
  verified: boolean;

  @Column({ default: true })
  available: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  lastJobTimestamp: Date;
}
