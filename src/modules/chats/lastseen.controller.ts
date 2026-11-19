import { Request, Response, NextFunction } from "express";

import { lastSeenService } from "./lastseen.service.js";

export const lastSeenController = {
  async updateLastSeen(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const chatId = Number(req.params.chatId);

      const { userId, messageId } = req.body;

      if (
        !Number.isInteger(chatId) ||
        chatId <= 0 ||
        !Number.isInteger(userId) ||
        userId <= 0 ||
        typeof messageId !== "string" ||
        !messageId.trim()
      ) {
        res.status(400).json({
          success: false,
          message: "Invalid request parameters",
        });

        return;
      }

      const result = await lastSeenService.updateLastSeen({
        chatId,
        userId,
        messageId,
      });

      res.status(200).json({
        success: true,
        message: "Last seen updated successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
};
