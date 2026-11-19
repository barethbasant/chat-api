import { Op } from "sequelize";

import { sequelize } from "../../config/database.js";
import { User } from "../../models/user.model.js";
import { Chat } from "../../models/chat.model.js";
import { ChatMember } from "../../models/chat-member.model.js";

export const chatRepository = {
  async findUsers(userIds: number[]) {
    return User.findAll({
      where: {
        id: {
          [Op.in]: userIds,
        },
      },
      attributes: ["id"],
    });
  },

  async findPrivateChat(participantKey: string) {
    return Chat.findOne({
      where: {
        type: "PRIVATE",
        participantKey,
      },
    });
  },

  async createPrivateChat(userIds: number[], participantKey: string) {
    return sequelize.transaction(async (transaction) => {
      const chat = await Chat.create(
        {
          type: "PRIVATE",
          participantKey,
        },
        { transaction },
      );

      await ChatMember.bulkCreate(
        userIds.map((userId) => ({
          chatId: chat.id,
          userId,
        })),
        { transaction },
      );

      return chat;
    });
  },
  async findChatMember(chatId: number, userId: number) {
    return ChatMember.findOne({
      where: {
        chatId,
        userId,
      },
    });
  },
};
