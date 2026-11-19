import { User } from "./user.model.js";
import { Chat } from "./chat.model.js";
import { ChatMember } from "./chat-member.model.js";

User.hasMany(ChatMember, {
  foreignKey: "userId",
  as: "memberships",
});

ChatMember.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

Chat.hasMany(ChatMember, {
  foreignKey: "chatId",
  as: "members",
});

ChatMember.belongsTo(Chat, {
  foreignKey: "chatId",
  as: "chat",
});

User.belongsToMany(Chat, {
  through: ChatMember,
  foreignKey: "userId",
  otherKey: "chatId",
  as: "chats",
});

Chat.belongsToMany(User, {
  through: ChatMember,
  foreignKey: "chatId",
  otherKey: "userId",
  as: "users",
});
