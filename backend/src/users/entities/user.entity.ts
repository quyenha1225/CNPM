import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn, 
  ManyToOne, 
  JoinColumn 
} from 'typeorm';
import { Role } from './role.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  user_id: number;

  @Column({ type: 'bigint', unsigned: true })
  role_id: number;

  @Column({ length: 150 })
  user_full_name: string;

  @Column({ length: 150, unique: true })
  user_email: string;

  @Column({ length: 20, unique: true, nullable: true })
  user_phone: string;

  @Column({ length: 255 })
  password_hash: string;

  @Column({ length: 30, default: 'ACTIVE' })
  account_status: string;

  @CreateDateColumn({ type: 'datetime' })
  created_at: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updated_at: Date;

  @ManyToOne(() => Role, (role) => role.users, { 
    onUpdate: 'CASCADE', 
    onDelete: 'RESTRICT' 
  })
  @JoinColumn({ name: 'role_id' })
  role: Role;
}