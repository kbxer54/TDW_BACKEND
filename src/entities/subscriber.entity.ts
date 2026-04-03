import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Generated } from "typeorm";

/*
Represents a newsletter subscriber in the database.
Representa um inscrito na newsletter no banco de dados.
*/
@Entity("subscribers")
export class Subscriber {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  name!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ default: true })
  is_active!: boolean;

  /*
  Automatically generated UUID used for secure unsubscribe links.
  UUID gerado automaticamente usado para links seguros de cancelamento.
  */
@Column()
  @Generated("uuid")
  unsubscribe_token!: string;

  @CreateDateColumn()
  created_at!: Date;
}