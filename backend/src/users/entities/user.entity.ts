import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  user_id: number;

  @Column({ type: 'bigint', unsigned: true })
  role_id: number;

  @Column({ type: 'varchar', length: 150 })
  user_full_name: string;

  @Column({ type: 'varchar', length: 150, unique: true })
  user_email: string;

  @Column({ type: 'varchar', length: 20, nullable: true, unique: true })
  user_phone: string;

  @Column({ type: 'varchar', length: 255 })
  password_hash: string;

  @Column({ type: 'varchar', length: 30, default: 'ACTIVE' })
  account_status: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
