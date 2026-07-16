import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  OneToMany 
} from 'typeorm';
import { User } from './user.entity';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  role_id: number;

  @Column({ length: 50, unique: true })
  role_code: string;

  @Column({ length: 100, unique: true })
  role_name: string;

  @Column({ length: 255, nullable: true })
  role_description: string;

  @CreateDateColumn({ type: 'datetime' })
  created_at: Date;

  @OneToMany(() => User, (user) => user.role)
  users: User[];
}