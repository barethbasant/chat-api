import { AppError } from "../../shared/errors/app-error.js";
import { chatRepository } from "./chat.repository.js";
import { messageRepository } from "./message.repository.js";

import { GetMessagesInput, SendMessageInput } from "./message.types.js";

export const messageService = {
  async sendMessage(input: SendMessageInput) {
    const membership = await chatRepository.findChatMember(
      input.chatId,
      input.senderId,
    );

    if (!membership) {
      throw new AppError("User is not a member of this chat", 404);
    }

    const message = await messageRepository.createMessage(input);

    return message;
  },
  async getMessages(input: GetMessagesInput) {
    const membership = await chatRepository.findChatMember(
      input.chatId,
      input.userId,
    );

    if (!membership) {
      throw new AppError("User is not a member of this chat", 404);
    }

    return messageRepository.getMessages(input);
  },
};
