import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import {
  EmailQueuePayload,
  EmailQueueStatus,
  EmailQueueType,
} from "../interface/emailQueue.interfaces";

@Entity("email_queue")
@Index(["status", "scheduledAt"])
@Index(["type", "createdAt"])
export class EmailQueue {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 32 })
  type!: EmailQueueType;

  @Column({ type: "varchar", length: 32, default: "PENDING" })
  status!: EmailQueueStatus;

  @Column({ type: "varchar", length: 320, nullable: true })
  to!: string | null;

  @Column({ type: "varchar", length: 320, nullable: true })
  from!: string | null;

  @Column({ type: "varchar", length: 320, nullable: true })
  replyTo!: string | null;

  @Column({ type: "varchar", length: 255, nullable: true })
  subject!: string | null;

  @Column({ type: "text", nullable: true })
  text!: string | null;

  @Column({ type: "text", nullable: true })
  html!: string | null;

  @Column({ type: "jsonb", nullable: true })
  payload!: EmailQueuePayload | null;

  @Column({ type: "integer", default: 0 })
  attempts!: number;

  @Column({ type: "integer", default: 5 })
  maxAttempts!: number;

  @Column({ type: "varchar", length: 120, nullable: true })
  providerMessageId!: string | null;

  @Column({ type: "text", nullable: true })
  lastError!: string | null;

  @Column({ type: "timestamp with time zone", default: () => "CURRENT_TIMESTAMP" })
  scheduledAt!: Date;

  @Column({ type: "timestamp with time zone", nullable: true })
  sentAt!: Date | null;

  @CreateDateColumn({ type: "timestamp with time zone" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp with time zone" })
  updatedAt!: Date;
}
