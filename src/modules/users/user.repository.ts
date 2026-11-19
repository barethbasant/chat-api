import { User } from "../../models/user.model.js";
import { Chat } from "../../models/chat.model.js";
import { ChatMember } from "../../models/chat-member.model.js";

interface CreateUserInput {
  name: string;
  email: string;
}

export const userRepository = {
  async createUser(input: CreateUserInput) {
    return User.create({
      name: input.name.trim(),
      email: input.email.trim().toLowerCase(),
    });
  },

  async findUserByEmail(email: string) {
    return User.findOne({
      where: {
        email: email.toLowerCase(),
      },
    });
  },
  async findUserChats(userId: number) {
    return User.findByPk(userId, {
      attributes: ["id"],

      include: [
        {
          model: Chat,
          as: "chats",

          attributes: ["id", "type", "createdAt"],

          through: {
            attributes: [],
          },

          include: [
            {
              model: User,
              as: "users",

              attributes: ["id"],

              through: {
                attributes: [],
              },
            },
          ],
        },
      ],

      order: [[{ model: Chat, as: "chats" }, "createdAt", "DESC"]],
    });
  },
};
