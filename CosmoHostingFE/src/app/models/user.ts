export interface User{
    id: number;
    imageUrl: string;
    name: string;
    lastName: string;
    email?: string;
    isOnline: boolean;
    connectionId: string;
    role?: string;
    lastMessage: string;
    unreadCount: number;
    isTyping: boolean;
}