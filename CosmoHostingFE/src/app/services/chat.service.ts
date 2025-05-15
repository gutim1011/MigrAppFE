import { inject, Injectable, signal } from '@angular/core';
import { User } from '../models/user';
import { AuthService } from './auth.service';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { MessageRequest } from '../models/message-request';
import { Message } from '../models/message';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private authService = inject(AuthService);
  private hubUrl = 'http://localhost:5199/hubs/chat';

  onlineUsers = signal<User[]>([]);
  currentOpenedChat = signal<User | null>(null);
  messages = signal<Message[]>([]);
  loading = signal<boolean>(false);

  private unreadMessagesSubject = new BehaviorSubject<{ [userId: number]: number }>({});
  unreadMessages$ = this.unreadMessagesSubject.asObservable();

  private hubConnection?: HubConnection;
  private typingTimeout?: any;

  startConnection() {
    this.loading.set(true);
    const token = this.authService.getAccessToken;
    const currentUserId = Number(this.authService.currentLoggedUser); // asegúrate de que sea number

    this.hubConnection = new HubConnectionBuilder()
      .withUrl(`${this.hubUrl}?senderId=${currentUserId}`, {
        accessTokenFactory: () => token || '',
        withCredentials: true
      })
      .withAutomaticReconnect()
      .build();

    this.setupSignalRHandlers();

    this.hubConnection
      .start()
      .then(() => {
        console.log('Conexión establecida con SignalR');
        this.loading.set(false);
      })
      .catch(err => {
        console.error('Error al conectar con SignalR', err);
        this.loading.set(false);
      });

    this.hubConnection.invoke('Ping')
      .then(() => console.log('✅ Ping enviado'))
      .catch(err => console.error('❌ Error al hacer ping', err));
  }

  private setupSignalRHandlers() {
    if (!this.hubConnection) return;

    this.hubConnection.on('OnlineUsers', (users: User[]) => {
      this.onlineUsers.set(users.map(u => ({ ...u, id: Number(u.id) })));
      console.log('📋 Usuarios en línea actualizados:', users);
    });

    this.hubConnection.on('ReceiveMessageList', (messages: Message[]) => {
      this.messages.set(messages.map(m => ({
        ...m,
        id: Number(m.id),
        senderId: Number(m.senderId),
        receiverId: Number(m.receiverId)
      })));
      console.log('💬 Mensajes cargados:', messages);
    });

    this.hubConnection.on('ReceiveNewMessage', (message: Message) => {
      const parsed = {
        ...message,
        id: Number(message.id),
        senderId: Number(message.senderId),
        receiverId: Number(message.receiverId)
      };

      const currentMessages = this.messages();
      this.messages.set([...currentMessages, parsed]);

      const currentChat = this.currentOpenedChat();
      if (!currentChat || currentChat.id !== parsed.senderId) {
        this.updateUnreadCount(parsed.senderId);
      }

      console.log('📩 Nuevo mensaje recibido:', parsed);
    });

    this.hubConnection.on('NotifyTypingToUser', (senderId: number) => {
      const users = this.onlineUsers();
      const updatedUsers = users.map(user =>
        user.id === Number(senderId)
          ? { ...user, isTyping: true }
          : user
      );

      this.onlineUsers.set(updatedUsers);

      setTimeout(() => {
        const currentUsers = this.onlineUsers();
        const resetUsers = currentUsers.map(user =>
          user.id === Number(senderId)
            ? { ...user, isTyping: false }
            : user
        );
        this.onlineUsers.set(resetUsers);
      }, 2000);
    });

    this.hubConnection.on('Notify', (user: User) => {
      user.id = Number(user.id);
      console.log('👋 Usuario conectado:', user);
    });
  }

  loadMessages(receiverId: number, pageNumber: number = 1) {
    if (!this.hubConnection) {
      console.error('No hay conexión establecida');
      return;
    }

    this.loading.set(true);

    this.hubConnection.invoke('LoadMessages', Number(receiverId), pageNumber)
      .then(() => {
        this.resetUnreadCount(receiverId);
        this.loading.set(false);
      })
      .catch(err => {
        console.error('Error al cargar mensajes:', err);
        this.loading.set(false);
      });
  }

  sendMessage(receiverId: number, content: string) {
    if (!this.hubConnection) {
      console.error('No hay conexión establecida');
      return;
    }

    const messageRequest: MessageRequest = {
      receiverId: Number(receiverId),
      content: content
    };

    return this.hubConnection.invoke('SendMessage', messageRequest)
      .then(() => {
        console.log('✅ Mensaje enviado');
      })
      .catch(err => {
        console.error('❌ Error al enviar mensaje:', err);
      });
  }

  notifyTyping(receiverId: number) {
    if (!this.hubConnection) return;

    clearTimeout(this.typingTimeout);
    this.typingTimeout = setTimeout(() => {
      this.hubConnection?.invoke('NotifyTyping', Number(receiverId))
        .catch(err => console.error('Error al notificar escritura:', err));
    }, 300);
  }

  openChat(user: User) {
    user.id = Number(user.id);
    this.currentOpenedChat.set(user);
    this.loadMessages(user.id);
    this.resetUnreadCount(user.id);
  }

  status(name: string): string {
    const currentChatUser = this.currentOpenedChat();
    if (!currentChatUser) return 'Desconectado';

    const onlineUser = this.onlineUsers().find(user => user.name === name);
    return onlineUser?.isTyping ? 'Escribiendo...' : this.isUserOnline();
  }

  isUserOnline(): string {
    const currentChat = this.currentOpenedChat();
    if (!currentChat) return 'Desconectado';

    const onlineUser = this.onlineUsers().find(user => user.id === currentChat.id);
    return onlineUser?.isOnline ? 'En línea' : currentChat.name;
  }

  private updateUnreadCount(senderId: number) {
    const unreadCounts = this.unreadMessagesSubject.value;
    unreadCounts[Number(senderId)] = (unreadCounts[Number(senderId)] || 0) + 1;
    this.unreadMessagesSubject.next(unreadCounts);
  }

  private resetUnreadCount(userId: number) {
    const unreadCounts = this.unreadMessagesSubject.value;
    if (unreadCounts[Number(userId)]) {
      unreadCounts[Number(userId)] = 0;
      this.unreadMessagesSubject.next(unreadCounts);
    }
  }

  disconnect() {
    if (this.hubConnection) {
      this.hubConnection.stop()
        .then(() => console.log('Desconectado de SignalR'))
        .catch(err => console.error('Error al desconectar:', err));
    }
  }
}
