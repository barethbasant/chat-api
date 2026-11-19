import { z } from "zod";

export const createUserSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(100),

    email: z
      .string()
      .trim()
      .email("Invalid email address")
      .max(150)
      .transform((value) => value.toLowerCase()),
  }),
});

export const getUserChatsSchema = z.object({
  params: z.object({
    userId: z.coerce.number().int().positive(),
  }),
});

export type CreateUserInput = z.infer<typeof createUserSchema>["body"];

export type GetUserChatsInput = z.infer<typeof getUserChatsSchema>["params"];
