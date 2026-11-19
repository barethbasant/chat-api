export interface UserChatResponse {
  chatId: number;
  type: "PRIVATE" | "GROUP";
  memberIds: number[];
}
