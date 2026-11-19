import { z } from "zod";

export const getMessagesSchema = z.object({
  params: z.object({
    chatId: z.coerce.number().int().positive(),
  }),

  query: z.object({
    userId: z.coerce.number().int().positive(),

    limit: z.coerce.number().int().min(1).max(100).default(50),

    lastMessageId: z.string().optional(),
  }),
});
