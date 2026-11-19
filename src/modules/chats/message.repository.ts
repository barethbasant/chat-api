import { firestore } from "../../config/firebase.js";

import { FieldPath, FieldValue } from "firebase-admin/firestore";

import {
  SendMessageInput,
  MessageResponse,
  MessageItem,
  GetMessagesInput,
  GetMessagesResponse,
} from "./message.types.js";
import { AppError } from "../../shared/errors/app-error.js";

export const messageRepository = {
  async createMessage(input: SendMessageInput): Promise<MessageResponse> {
    const messagesRef = firestore
      .collection("chats")
      .doc(String(input.chatId))
      .collection("messages");

    const messageRef = messagesRef.doc();

    await messageRef.set({
      senderId: input.senderId,
      text: input.text,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: null,
      deletedAt: null,
    });

    const savedMessage = await messageRef.get();

    const data = savedMessage.data();

    if (!data) {
      throw new AppError("Unable to retrieve saved message", 500);
    }

    return {
      messageId: messageRef.id,
      chatId: String(input.chatId),
      senderId: data.senderId as number,
      text: data.text as string,
      createdAt: data.createdAt?.toDate().toISOString() ?? null,
    };
  },

  async getMessages(input: GetMessagesInput): Promise<GetMessagesResponse> {
    const messagesRef = firestore
      .collection("chats")
      .doc(String(input.chatId))
      .collection("messages");

    let query = messagesRef
      .orderBy("createdAt", "desc")
      .orderBy(FieldPath.documentId(), "desc");

    if (input.lastMessageId) {
      const cursorDoc = await messagesRef.doc(input.lastMessageId).get();

      if (!cursorDoc.exists) {
        throw new AppError("Invalid pagination cursor", 400);
      }

      query = query.startAfter(cursorDoc);
    }

    const snapshot = await query.limit(input.limit + 1).get();

    const hasMore = snapshot.docs.length > input.limit;

    const pageDocs = snapshot.docs.slice(0, input.limit);

    const nextCursor = hasMore ? pageDocs[pageDocs.length - 1].id : null;

    const messages: MessageItem[] = pageDocs
      .map((doc) => {
        const data = doc.data();

        return {
          messageId: doc.id,
          senderId: data.senderId as number,
          text: data.text as string,
          createdAt: data.createdAt?.toDate().toISOString() ?? null,
        };
      })
      .reverse();

    return {
      messages,
      nextCursor,
      hasMore,
    };
  },
};
