import { Request, Response, NextFunction } from "express";

import { receiptService } from "./receipt.service.js";

export const receiptController = {
  async markMessageRead(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const chatId = Number(req.params.chatId);
      const messageId = req.params.messageId;

      const { userId } = req.body;

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

      const result = await receiptService.markMessageRead({
        chatId,
        messageId,
        userId,
      });

      res.status(200).json({
        success: true,
        message: "Message marked as read",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
};
