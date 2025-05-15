export interface MessageResponseDto {
  id: number;
  content: string;
  senderId: number;
  receiverId: number;
  createdDate: string;
  isRead: boolean;
}