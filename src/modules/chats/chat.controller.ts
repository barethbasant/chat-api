import { Request, Response, NextFunction } from "express";

import { chatService } from "./chat.service.js";
import { messageService } from "./message.service.js";
import { validateGetMessages } from "./message.validation.js";
import {
  CreateChatInput,
  SendMessageInput,
  SendMessageParams,
} from "./chat.validation.js";

export const chatController = {
  async createChat(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { userAId, userBId } = req.validated!.body as CreateChatInput;

      const result = await chatService.createOrGetChat(userAId, userBId);

      res.status(result.isNew ? 201 : 200).json({
        success: true,
        message: result.isNew
          ? "Chat created successfully"
          : "Chat retrieved successfully",
        data: {
          chatId: result.chatId,
        },
      });
    } catch (error) {
      next(error);
    }
  },
  async sendMessage(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { chatId } = req.validated!.params as SendMessageParams;

      const { senderId, text } = req.validated!.body as SendMessageInput;

      const message = await messageService.sendMessage({
        chatId,
        senderId,
        text,
      });

      res.status(201).json({
        success: true,
        message: "Message sent successfully",
        data: message,
      });
    } catch (error) {
      next(error);
    }
  },
  async getMessages(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const chatId = Number(req.params.chatId);

      const userId = Number(req.query.userId);

      const limit =
        req.query.limit === undefined ? 50 : Number(req.query.limit);

      const lastMessageId = req.query.lastMessageId
        ? String(req.query.lastMessageId)
        : undefined;

      if (!Number.isInteger(chatId) || chatId <= 0) {
        res.status(400).json({
          success: false,
          message: "Invalid chat ID",
        });
        return;
      }

      if (!Number.isInteger(userId) || userId <= 0) {
        res.status(400).json({
          success: false,
          message: "Valid userId is required",
        });
        return;
      }

      const validationError = validateGetMessages(limit, lastMessageId);

      if (validationError) {
        res.status(400).json({
          success: false,
          message: validationError,
        });
        return;
      }

      const result = await messageService.getMessages({
        chatId,
        userId,
        limit,
        lastMessageId,
      });

      res.status(200).json({
        success: true,
        message: "Messages retrieved successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
};
