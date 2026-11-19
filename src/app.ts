import express from "express";
import cors from "cors";

import chatRoutes from "./modules/chats/chat.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/chat", chatRoutes);
import userRoutes from "./modules/users/user.routes.js";
import { errorMiddleware } from "./shared/middlewares/error.middleware.js";

app.use("/user", userRoutes);

app.get("/health", (_req, res) => {
  res.json({
    success: true,
    message: "Chat API is running",
  });
});

app.use(errorMiddleware);

export default app;
