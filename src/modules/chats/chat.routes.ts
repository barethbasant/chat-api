import { Router } from "express";

import { chatController } from "./chat.controller.js";
import { receiptController } from "./receipt.controller.js";
import { lastSeenController } from "./lastseen.controller.js";
import { validate } from "../../shared/middlewares/validate.middleware.js";
import { createChatSchema, sendMessageSchema } from "./chat.validation.js";

const router = Router();

router.post("/create", validate(createChatSchema), chatController.createChat);
router.post(
  "/:chatId/message/send",
  validate(sendMessageSchema),
  chatController.sendMessage,
);
router.get("/:chatId/messages", chatController.getMessages);
router.post("/:chatId/lastseen", lastSeenController.updateLastSeen);
router.post(
  "/:chatId/message/:messageId/read",
  receiptController.markMessageRead,
);
export default router;
