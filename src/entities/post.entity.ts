import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./user.entity";

/*
Represents a news post or patch note created by a Developer or Admin.
Links to the User who authored the content.

Representa um post de notícia ou patch note criado por um Desenvolvedor ou Admin.
Vincula-se ao Usuário que escreveu o conteúdo.
*/
@Entity("posts")
export class Post {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  title!: string;

  @Column("text")
  content_html!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "author_id" })
  author!: User;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}