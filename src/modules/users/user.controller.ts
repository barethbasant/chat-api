import { Request, Response, NextFunction } from "express";

import { userService } from "./user.service.js";
import {
  CreateUserInput,
  GetUserChatsInput,
} from "./schemas/create-user.schema.js";

export const userController = {
  async createUser(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { name, email } = req.validated!.body as CreateUserInput;

      const user = await userService.createUser({
        name,
        email,
      });

      res.status(201).json({
        success: true,
        message: "User created successfully",
        data: user,
      });
    } catch (error) {
      next(error);
    }
  },

  async getUserChats(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { userId } = req.validated!.params as GetUserChatsInput;

      const chats = await userService.getUserChats(userId);

      res.status(200).json({
        success: true,
        message: "Chats retrieved successfully",
        data: chats,
      });
    } catch (error) {
      next(error);
    }
  },
};
