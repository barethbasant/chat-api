import { z } from "zod";

export const createChatSchema = z.object({
  body: z
    .object({
      userAId: z.number().int().positive(),
      userBId: z.number().int().positive(),
    })
    .refine((data) => data.userAId !== data.userBId, {
      message: "A user cannot create a chat with themselves",
      path: ["userBId"],
    }),
});

export type CreateChatInput = z.infer<typeof createChatSchema>["body"];

export const sendMessageSchema = z.object({
  params: z.object({
    chatId: z.coerce.number().int().positive(),
  }),

  body: z.object({
    senderId: z.number().int().positive(),

    text: z
      .string()
      .trim()
      .min(1, "Message cannot be empty")
      .max(5000, "Message cannot exceed 5000 characters"),
  }),
});

export type SendMessageParams = z.infer<typeof sendMessageSchema>["params"];

export type SendMessageInput = z.infer<typeof sendMessageSchema>["body"];
