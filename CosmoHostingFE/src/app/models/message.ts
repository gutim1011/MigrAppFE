export interface Message {
  id: number;
  content: string;
  senderId: number;
  receiverId: number;
  createdDate: string;
  isRead: boolean;
}