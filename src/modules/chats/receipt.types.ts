export interface MarkMessageReadInput {
  chatId: number;
  messageId: string;
  userId: number;
}

export interface ReadReceiptResponse {
  messageId: string;
  userId: number;
  readAt: string | null;
}
