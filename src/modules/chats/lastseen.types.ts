export interface UpdateLastSeenInput {
  chatId: number;
  userId: number;
  messageId: string;
}

export interface LastSeenResponse {
  userId: number;
  lastSeenMessageId: string;
  lastSeenAt: string | null;
}
