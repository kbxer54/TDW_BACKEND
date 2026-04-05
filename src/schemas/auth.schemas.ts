import { z } from "zod";
import { accountRoles } from "../interface/auth.interfaces";

const normalizedEmailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Invalid email address");

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(100, "Password is too long")
  .regex(/[a-z]/, "Password must contain a lowercase letter")
  .regex(/[A-Z]/, "Password must contain an uppercase letter")
  .regex(/[0-9]/, "Password must contain a number");

export const accountRoleSchema = z.enum(accountRoles);

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: normalizedEmailSchema,
  password: passwordSchema,
  role: accountRoleSchema.optional(),
});

export const loginSchema = z.object({
  email: normalizedEmailSchema,
  password: z.string().min(1, "Password is required"),
});

export const selfProfileUpdateSchema = z
  .object({
    name: z.string().trim().min(2, "Name must be at least 2 characters").optional(),
    email: normalizedEmailSchema.optional(),
    password: passwordSchema.optional(),
    currentPassword: z.string().min(1, "Current password is required").optional(),
  })
  .refine(
    (data) => Object.values(data).some((value) => typeof value !== "undefined"),
    {
      message: "At least one field must be provided",
      path: ["body"],
    },
  )
  .superRefine((data, context) => {
    if (data.password && !data.currentPassword) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["currentPassword"],
        message: "Current password is required to set a new password",
      });
    }
  });

export const adminAccountUpdateSchema = z
  .object({
    name: z.string().trim().min(2, "Name must be at least 2 characters").optional(),
    email: normalizedEmailSchema.optional(),
    password: passwordSchema.optional(),
    role: accountRoleSchema.optional(),
  })
  .refine(
    (data) => Object.values(data).some((value) => typeof value !== "undefined"),
    {
      message: "At least one field must be provided",
      path: ["body"],
    },
  );

export const accountResponseSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
  role: accountRoleSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const authResponseSchema = z.object({
  token: z.string(),
  user: accountResponseSchema,
});
