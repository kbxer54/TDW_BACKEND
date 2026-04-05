import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from "typeorm";
import { Account } from "./account.entity";
import { PublicationImage } from "./publicationImages.entity";
import { PublicationType } from "../interface/publicationMeta.interfaces";

@Index("IDX_publications_type_createdAt", ["type", "createdAt"])
@Entity("publications")
export class Publication {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 255 })
  title!: string;

  @Column({ type: "text" })
  summary!: string;

  @Column({ type: "text" })
  content!: string;

  @Column({ type: "varchar", length: 255, unique: true })
  slug!: string;

  @Column({ type: "varchar", length: 32, default: "PATCH_NOTE" })
  type!: PublicationType;

  @Column({ type: "integer", nullable: true })
  authorId!: number | null;

  @ManyToOne(() => Account, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "authorId" })
  author!: Account | null;

  @OneToMany(() => PublicationImage, (image) => image.publication)
  images!: PublicationImage[];

  @CreateDateColumn({ type: "timestamp with time zone" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp with time zone" })
  updatedAt!: Date;
}
