import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, BeforeInsert, BeforeUpdate } from "typeorm";
import * as bcrypt from "bcryptjs";
import { Role } from "../enums/role";

/*
Represents a system user (Admin or Developer) who can access the dashboard.
Automatically hashes the password before saving it to the database.

Representa um usuário do sistema (Admin ou Desenvolvedor) que pode acessar o painel.
Faz o hash automático da senha antes de salvá-la no banco de dados.
*/
@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  name!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column({
    type: "enum",
    enum: Role,
    default: Role.DEVELOPER,
  })
  role!: Role;

  @CreateDateColumn()
  created_at!: Date;

  @BeforeInsert()
  @BeforeUpdate()
  hashPassword() {
    if (this.password) {
      this.password = bcrypt.hashSync(this.password, 10);
    }
  }
}