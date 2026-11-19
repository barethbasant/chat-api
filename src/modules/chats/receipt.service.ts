import { AppError } from "../../shared/errors/app-error.js";
import { chatRepository } from "./chat.repository.js";
import { receiptRepository } from "./receipt.repository.js";

import { MarkMessageReadInput } from "./receipt.types.js";

export const receiptService = {
  async markMessageRead(input: MarkMessageReadInput) {
    const membership = await chatRepository.findChatMember(
      input.chatId,
      input.userId,
    );

    if (!membership) {
      throw new AppError("User is not a member of this chat", 404);
    }

    return receiptRepository.markMessageRead(input);
  },
};
