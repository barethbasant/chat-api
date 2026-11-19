import { UniqueConstraintError } from "sequelize";

import { chatRepository } from "./chat.repository.js";
import { AppError } from "../../shared/errors/app-error.js";

export const chatService = {
  async createOrGetChat(userAId: number, userBId: number) {
    const userIds = [userAId, userBId].sort((a, b) => a - b);

    const participantKey = userIds.join(":");

    const users = await chatRepository.findUsers(userIds);

    if (users.length !== 2) {
      throw new AppError("One or both users do not exist", 404);
    }

    const existingChat = await chatRepository.findPrivateChat(participantKey);

    if (existingChat) {
      return {
        chatId: existingChat.id,
        isNew: false,
      };
    }

    try {
      const newChat = await chatRepository.createPrivateChat(
        userIds,
        participantKey,
      );

      return {
        chatId: newChat.id,
        isNew: true,
      };
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        const existingChat =
          await chatRepository.findPrivateChat(participantKey);

        if (existingChat) {
          return {
            chatId: existingChat.id,
            isNew: false,
          };
        }
      }

      throw error;
    }
  },
};
