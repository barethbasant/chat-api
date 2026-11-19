export interface SendMessageInput {
  chatId: number;
  senderId: number;
  text: string;
}

export interface MessageResponse {
  messageId: string;
  chatId: string;
  senderId: number;
  text: string;
  createdAt: string | null;
}

export interface GetMessagesInput {
  chatId: number;
  userId: number;
  limit: number;
  lastMessageId?: string;
}

export interface MessageItem {
  messageId: string;
  senderId: number;
  text: string;
  createdAt: string | null;
}

export interface GetMessagesResponse {
  messages: MessageItem[];
  nextCursor: string | null;
  hasMore: boolean;
}
