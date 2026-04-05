import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Publication } from "./publications.entity";

@Entity("publication_images")
export class PublicationImage {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "integer" })
  publicationId!: number;

  @ManyToOne(() => Publication, (publication) => publication.images, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "publicationId" })
  publication!: Publication;

  @Column({ type: "varchar", length: 255 })
  fileUrl!: string;

  @Column({ type: "varchar", length: 255 })
  fileName!: string;

  @Column({ type: "varchar", length: 100 })
  mimeType!: string;

  @Column({ type: "integer" })
  size!: number;

  @Column({ type: "integer", default: 0 })
  sortOrder!: number;

  @CreateDateColumn({ type: "timestamp with time zone" })
  createdAt!: Date;
}
