export interface OnlineUserDto {
  id?: number;
  connectionId: string;
  name: string;
  lastName?: string;
  imageUrl?: string;
  isOnline?: boolean;
  isTyping?: boolean;
  unreadCount?: number;
}