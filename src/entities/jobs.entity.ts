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
  title!: string; // Nome da vaga

  @Column({ type: "text" })
  description!: string; // Descrição da vaga

  @Column({ default: true }) // Por padrão, a vaga começa ativa
  isActive!: boolean;

  @CreateDateColumn({ type: "timestamp with time zone" })
  createdAt?: Date; // Data de criação da vaga

  @OneToMany(() => User, (user) => user.job)
  applicants?: User[]; // Lista de usuários interessados na vaga
}
