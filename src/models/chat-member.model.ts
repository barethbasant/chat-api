import { DataTypes, Model } from "sequelize";

import { sequelize } from "../config/database.js";

export class ChatMember extends Model {
  declare id: number;
  declare chatId: number;
  declare userId: number;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

ChatMember.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },

    chatId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      field: "chat_id",
    },

    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      field: "user_id",
    },
  },
  {
    sequelize,
    tableName: "chat_members",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["chat_id", "user_id"],
      },
      {
        fields: ["user_id", "chat_id"],
      },
    ],
  },
);
