import { FieldValue } from "firebase-admin/firestore";

import { firestore } from "../../config/firebase.js";

import { MarkMessageReadInput, ReadReceiptResponse } from "./receipt.types.js";
import { AppError } from "../../shared/errors/app-error.js";

export const receiptRepository = {
  async markMessageRead(
    input: MarkMessageReadInput,
  ): Promise<ReadReceiptResponse> {
    const chatRef = firestore.collection("chats").doc(String(input.chatId));

    const messageRef = chatRef.collection("messages").doc(input.messageId);

    const receiptRef = chatRef
      .collection("readReceipts")
      .doc(`${input.messageId}_${input.userId}`);

    await firestore.runTransaction(async (transaction) => {
      const messageSnapshot = await transaction.get(messageRef);

      if (!messageSnapshot.exists) {
        throw new AppError("Message not found", 404);
      }

      const message = messageSnapshot.data()!;

      if (message.senderId === input.userId) {
        throw new AppError("Cannot mark your own message as read", 400);
      }

      const receiptSnapshot = await transaction.get(receiptRef);

      if (!receiptSnapshot.exists) {
        transaction.set(receiptRef, {
          messageId: input.messageId,
          userId: input.userId,
          readAt: FieldValue.serverTimestamp(),
        });
      }
    });

    const savedReceipt = await receiptRef.get();
    const data = savedReceipt.data();

    if (!data) {
      throw new AppError("Unable to retrieve read receipt", 500);
    }

    return {
      messageId: input.messageId,
      userId: input.userId,
      readAt: data.readAt?.toDate().toISOString() ?? null,
    };
  },
};
