import { FieldValue } from "firebase-admin/firestore";

import { firestore } from "../../config/firebase.js";

import { UpdateLastSeenInput, LastSeenResponse } from "./lastseen.types.js";
import { AppError } from "../../shared/errors/app-error.js";

export const lastSeenRepository = {
  async updateLastSeen(input: UpdateLastSeenInput): Promise<LastSeenResponse> {
    const chatRef = firestore.collection("chats").doc(String(input.chatId));

    const messageRef = chatRef.collection("messages").doc(input.messageId);

    const lastSeenRef = chatRef
      .collection("lastSeen")
      .doc(String(input.userId));

    await firestore.runTransaction(async (transaction) => {
      const messageSnapshot = await transaction.get(messageRef);

      if (!messageSnapshot.exists) {
        throw new AppError("Message not found", 404);
      }

      const lastSeenSnapshot = await transaction.get(lastSeenRef);

      if (lastSeenSnapshot.exists) {
        const previous = lastSeenSnapshot.data()!;

        const previousMessageRef = chatRef
          .collection("messages")
          .doc(previous.lastSeenMessageId);

        const previousMessageSnapshot =
          await transaction.get(previousMessageRef);

        if (!previousMessageSnapshot.exists) {
          throw new AppError("Previous last-seen message not found", 404);
        }

        const currentMessage = messageSnapshot.data()!;
        const previousMessage = previousMessageSnapshot.data()!;

        const currentTime = currentMessage.createdAt.toMillis();
        const previousTime = previousMessage.createdAt.toMillis();

        if (
          currentTime < previousTime ||
          (currentTime === previousTime &&
            input.messageId < previous.lastSeenMessageId)
        ) {
          throw new AppError("Cannot move last seen backwards", 400);
        }
      }

      transaction.set(lastSeenRef, {
        userId: input.userId,
        lastSeenMessageId: input.messageId,
        lastSeenAt: FieldValue.serverTimestamp(),
      });
    });

    const savedSnapshot = await lastSeenRef.get();

    const data = savedSnapshot.data();

    if (!data) {
      throw new AppError("Unable to retrieve last-seen information", 500);
    }

    return {
      userId: data.userId as number,
      lastSeenMessageId: data.lastSeenMessageId as string,
      lastSeenAt: data.lastSeenAt?.toDate().toISOString() ?? null,
    };
  },
};
