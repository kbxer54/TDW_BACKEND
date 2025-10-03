import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from "typeorm";
import { User } from "./user.entity";

@Entity("jobs")
export class Job {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 255 })
  title!: string; 

  @Column({ type: "text" })
  description!: string; 

  @Column({ default: true }) 
  isActive!: boolean;

  @CreateDateColumn({ type: "timestamp with time zone" })
  createdAt?: Date;

  @OneToMany(() => User, (user) => user.job)
  applicants?: User[]; 
}
