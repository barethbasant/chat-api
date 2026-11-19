import { sequelize } from "./database.js";

import "../models/user.model.js";
import "../models/chat.model.js";
import "../models/chat-member.model.js";
import "../models/associations.js";

export const initializeDatabase = async (): Promise<void> => {
  try {
    await sequelize.authenticate();

    console.log("MySQL connected successfully");

    await sequelize.sync();

    console.log("Database models synchronized");
  } catch (error) {
    console.error("Database initialization failed:", error);
    throw error;
  }
};
