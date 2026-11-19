import { DataTypes, Model } from "sequelize";

import { sequelize } from "../config/database.js";

export class Chat extends Model {
  declare id: number;
  declare type: "PRIVATE" | "GROUP";
  declare participantKey: string | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Chat.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },

    type: {
      type: DataTypes.ENUM("PRIVATE", "GROUP"),
      allowNull: false,
      defaultValue: "PRIVATE",
    },
    participantKey: {
      type: DataTypes.STRING(50),
      allowNull: true,
      unique: true,
      field: "participant_key",
    },
  },
  {
    sequelize,
    tableName: "chats",
    timestamps: true,
  },
);
