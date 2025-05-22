import { inject, Injectable, signal } from '@angular/core';
import { User } from '../models/user';
import { AuthService } from './auth.service';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { MessageRequest } from '../models/message-request';
import { Message } from '../models/message';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastr = inject(ToastrService);
  private translate = inject(TranslateService);
  private hubUrl = 'http://localhost:5199/hubs/chat';

  onlineUsers = signal<User[]>([]);
  currentOpenedChat = signal<User | null>(null);
  messages = signal<Message[]>([]);
  loading = signal<boolean>(false);
  isLawyer = signal<boolean>(false);

  private unreadMessagesSubject = new BehaviorSubject<{ [userId: number]: number }>({});
  unreadMessages$ = this.unreadMessagesSubject.asObservable();

  private hubConnection?: HubConnection;
  private typingTimeout?: any;
  private connectionPromise: Promise<void> | null = null;

  async ensureConnection(): Promise<void> {
    if (this.hubConnection?.state === 'Connected') return;

    if (!this.connectionPromise) {
      this.connectionPromise = this.startConnection();
    }

    return this.connectionPromise;
  }

  async startConnection(): Promise<void> {
    this.loading.set(true);
    const token = this.authService.getAccessToken;
    const currentUserId = Number(this.authService.currentLoggedUser);

    this.hubConnection = new HubConnectionBuilder()
      .withUrl(`${this.hubUrl}?senderId=${currentUserId}`, {
        accessTokenFactory: () => token || '',
        withCredentials: true
      })
      .withAutomaticReconnect()
      .build();

    this.setupSignalRHandlers();

    try {
      await this.hubConnection.start();
      await this.waitForAssignedUsers(3000);

      const userType = await this.determineUserType();
      this.isLawyer.set(userType === 'lawyer');

      this.toastr.success(
        this.translate.instant('CHAT.CONNECTED'),
        this.translate.instant('CHAT.TITLE')
      );
      this.loading.set(false);
    } catch (err) {
      console.error('Error al conectar con SignalR', err);
      this.toastr.error(
        this.translate.instant('CHAT.CONNECTION_ERROR'),
        this.translate.instant('CHAT.TITLE')
      );
      this.loading.set(false);
      throw err;
    }
  }

  private async determineUserType(): Promise<string> {
    try {
      const users = this.onlineUsers();
      return users.length > 1 ? 'lawyer' : 'user';
    } catch (error) {
      console.error('Error al determinar el tipo de usuario', error);
      this.toastr.warning(
        this.translate.instant('CHAT.ROLE_UNDETECTED'),
        this.translate.instant('CHAT.WARNING')
      );
      return 'user';
    }
  }

  private setupSignalRHandlers() {
    if (!this.hubConnection) return;

    this.hubConnection.on('AllLawyers', (users: User[]) => {
      this.onlineUsers.set(users.map(u => ({ ...u, id: Number(u.id) })));
      if (users.length === 1 && !this.isLawyer()) {
        this.openChat(users[0]);
      }
    });

    this.hubConnection.on('AssignedClients', (users: User[]) => {
      this.onlineUsers.set(users.map(u => ({ ...u, id: Number(u.id) })));
    });

    this.hubConnection.on('ReceiveMessageList', (messages: Message[]) => {
      this.messages.set(messages.map(m => ({
        ...m,
        id: Number(m.id),
        senderId: Number(m.senderId),
        receiverId: Number(m.receiverId)
      })));
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
        this.toastr.info(
          this.translate.instant('CHAT.NEW_MESSAGE'),
          this.translate.instant('CHAT.TITLE')
        );
      }
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
        const resetUsers = this.onlineUsers().map(user =>
          user.id === Number(senderId)
            ? { ...user, isTyping: false }
            : user
        );
        this.onlineUsers.set(resetUsers);
      }, 2000);
    });

    this.hubConnection.on('Notify', (user: User) => {
      user.id = Number(user.id);
      console.log('Usuario conectado:', user);
    });
  }

  async goToClientChat(): Promise<boolean> {
    try {
      await this.ensureConnection();
      const users = await this.waitForAssignedUsers(3000);

      if (!users || !Array.isArray(users) || users.length === 0) {
        this.toastr.warning(
          this.translate.instant('CHAT.NO_LAWYER_ASSIGNED'),
          this.translate.instant('CHAT.TITLE')
        );
        return false;
      }

      return await this.router.navigate(['/live-chat']);
    } catch (error) {
      console.error('Error interno en goToClientChat:', error);
      this.toastr.error(
        this.translate.instant('CHAT.ERROR_OPENING_CHAT'),
        this.translate.instant('CHAT.TITLE')
      );
      throw error;
    }
  }

  loadMessages(receiverId: number, pageNumber: number = 1) {
    if (!this.hubConnection) {
      this.toastr.error(
        this.translate.instant('CHAT.NO_CONNECTION'),
        this.translate.instant('CHAT.TITLE')
      );
      return;
    }

    this.loading.set(true);

    this.hubConnection.invoke('LoadMessages', receiverId, pageNumber)
      .then(() => {
        this.resetUnreadCount(receiverId);
        this.loading.set(false);
      })
      .catch(err => {
        console.error(err);
        this.toastr.error(
          this.translate.instant('CHAT.LOAD_MESSAGES_ERROR'),
          this.translate.instant('CHAT.TITLE')
        );
        this.loading.set(false);
      });
  }

  sendMessage(receiverId: number, content: string) {
    if (!this.hubConnection) {
      this.toastr.error(
        this.translate.instant('CHAT.NO_CONNECTION'),
        this.translate.instant('CHAT.TITLE')
      );
      return;
    }

    const senderId = Number(this.authService.currentLoggedUser);
    const newMessage: Message = {
      id: Date.now(),
      content,
      createdDate: new Date().toISOString(),
      senderId,
      receiverId,
      isRead: true
    };

    const currentMessages = this.messages();
    this.messages.set([...currentMessages, newMessage]);

    const messageRequest: MessageRequest = { receiverId, content };

    return this.hubConnection.invoke('SendMessage', messageRequest)
      .catch(err => {
        console.error(err);
        this.toastr.error(
          this.translate.instant('CHAT.SEND_ERROR'),
          this.translate.instant('CHAT.TITLE')
        );
      });
  }

  notifyTyping(receiverId: number) {
    if (!this.hubConnection) return;

    clearTimeout(this.typingTimeout);
    this.typingTimeout = setTimeout(() => {
      this.hubConnection?.invoke('NotifyTyping', receiverId)
        .catch(err => {
          console.error(err);
          this.toastr.error(
            this.translate.instant('CHAT.TYPING_ERROR'),
            this.translate.instant('CHAT.TITLE')
          );
        });
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
    unreadCounts[senderId] = (unreadCounts[senderId] || 0) + 1;
    this.unreadMessagesSubject.next(unreadCounts);
  }

  private resetUnreadCount(userId: number) {
    const unreadCounts = this.unreadMessagesSubject.value;
    if (unreadCounts[userId]) {
      unreadCounts[userId] = 0;
      this.unreadMessagesSubject.next(unreadCounts);
    }
  }

  private async waitForAssignedUsers(timeoutMs: number): Promise<User[]> {
    const interval = 100;
    let waited = 0;

    return new Promise((resolve) => {
      const check = () => {
        const users = this.onlineUsers();
        if (users.length > 0 || waited >= timeoutMs) {
          resolve(users);
        } else {
          waited += interval;
          setTimeout(check, interval);
        }
      };
      check();
    });
  }

  disconnect() {
    if (this.hubConnection) {
      this.hubConnection.stop()
        .then(() => {
          this.toastr.info(
            this.translate.instant('CHAT.DISCONNECTED'),
            this.translate.instant('CHAT.TITLE')
          );
        })
        .catch(err => {
          console.error('Error al desconectar:', err);
          this.toastr.error(
            this.translate.instant('CHAT.DISCONNECT_ERROR'),
            this.translate.instant('CHAT.TITLE')
          );
        });
      this.connectionPromise = null;
    }
  }
}
