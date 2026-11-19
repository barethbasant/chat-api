import { Router } from "express";

import { userController } from "./user.controller.js";

import { validate } from "../../shared/middlewares/validate.middleware.js";
import {
  createUserSchema,
  getUserChatsSchema,
} from "./schemas/create-user.schema.js";

const router = Router();

router.post("/create", validate(createUserSchema), userController.createUser);

router.get(
  "/:userId/chats",
  validate(getUserChatsSchema),
  userController.getUserChats,
);

export default router;
