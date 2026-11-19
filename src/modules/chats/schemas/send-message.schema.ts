import { z } from "zod";

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
      .max(5000, "Message is too long"),
  }),
});
