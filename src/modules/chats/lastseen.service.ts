import { AppError } from "../../shared/errors/app-error.js";
import { chatRepository } from "./chat.repository.js";
import { lastSeenRepository } from "./lastseen.repository.js";

import { UpdateLastSeenInput } from "./lastseen.types.js";

export const lastSeenService = {
  async updateLastSeen(input: UpdateLastSeenInput) {
    const membership = await chatRepository.findChatMember(
      input.chatId,
      input.userId,
    );

    if (!membership) {
      throw new AppError("User is not a member of this chat", 404);
    }

    return lastSeenRepository.updateLastSeen(input);
  },
};
