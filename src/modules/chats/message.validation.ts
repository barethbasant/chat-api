import { SendMessageInput } from "./message.types.js";
export interface GetMessagesQuery {
  limit: number;
  lastMessageId?: string;
}

export const validateSendMessage = (
  input: Partial<SendMessageInput>,
): string | null => {
  if (!Number.isInteger(input.chatId) || Number(input.chatId) <= 0) {
    return "Invalid chat ID";
  }

  if (!Number.isInteger(input.senderId) || Number(input.senderId) <= 0) {
    return "Invalid sender ID";
  }

  if (typeof input.text !== "string" || !input.text.trim()) {
    return "Message text is required";
  }

  if (input.text.length > 5000) {
    return "Message cannot exceed 5000 characters";
  }

  return null;
};

export const validateGetMessages = (
  limit: number,
  lastMessageId?: string,
): string | null => {
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    return "Limit must be between 1 and 100";
  }

  if (
    lastMessageId !== undefined &&
    (typeof lastMessageId !== "string" || lastMessageId.trim().length === 0)
  ) {
    return "Invalid lastMessageId";
  }

  return null;
};
