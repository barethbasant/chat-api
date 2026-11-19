import { Chat } from "../../models/chat.model.js";
import { User } from "../../models/user.model.js";
import { AppError } from "../../shared/errors/app-error.js";
import { userRepository } from "./user.repository.js";

import { UserChatResponse } from "./user.types.js";

export const userService = {
  async createUser(input: { name: string; email: string }) {
    const normalizedEmail = input.email.trim().toLowerCase();

    const existingUser = await userRepository.findUserByEmail(normalizedEmail);

    if (existingUser) {
      throw new AppError("Email already registered", 409);
    }

    const user = await userRepository.createUser({
      name: input.name,
      email: normalizedEmail,
    });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
    };
  },
  async getUserChats(userId: number): Promise<UserChatResponse[]> {
    const user = await userRepository.findUserChats(userId);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    const chats = user.get("chats") as Chat[];

    return chats.map((chat) => {
      const users = chat.get("users") as User[];

      return {
        chatId: chat.id,
        type: chat.type,
        memberIds: users.map((member) => member.id),
      };
    });
  },
};
