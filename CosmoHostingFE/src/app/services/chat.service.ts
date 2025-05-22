import { inject, Injectable, signal } from '@angular/core';
import { User } from '../models/user';
import { AuthService } from './auth.service';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { MessageRequest } from '../models/message-request';
import { Message } from '../models/message';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private authService = inject(AuthService);
  private router = inject(Router);
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

  // Método para asegurar la conexión antes de usar el chat
  async ensureConnection(): Promise<void> {
    if (this.hubConnection?.state === 'Connected') {
      return Promise.resolve();
    }
    
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
      console.log('Conexión establecida con SignalR');
      await this.waitForAssignedUsers(3000);
      
      // Determinar si el usuario es abogado
      const userType = await this.determineUserType();
      this.isLawyer.set(userType === 'lawyer');
      
      this.loading.set(false);
        
    } catch (err) {
      console.error('Error al conectar con SignalR', err);
      this.loading.set(false);
      throw err;
    }
  }

  private async determineUserType(): Promise<string> {
    try {
      const users = this.onlineUsers();
      console.log("número de usuarios: ", users.length)
      return users.length > 1 ? 'lawyer' : 'user';
    } catch (error) {
      console.error('Error al determinar el tipo de usuario', error);
      return 'user'; 
    }
  }

  private setupSignalRHandlers() {
    if (!this.hubConnection) return;

    this.hubConnection.on('AllLawyers', (users: User[]) => {
      this.onlineUsers.set(users.map(u => ({ ...u, id: Number(u.id) })));
      console.log('Usuarios en línea actualizados:', users);
      
      if (users.length === 1 && !this.isLawyer()) {
        this.openChat(users[0]);
      }
    });

    this.hubConnection.on('AssignedClients', (users: User[]) => {
      this.onlineUsers.set(users.map(u => ({ ...u, id: Number(u.id) }))); 
      console.log('Clientes asignados recibidos:', users);
    });


    this.hubConnection.on('ReceiveMessageList', (messages: Message[]) => {
      this.messages.set(messages.map(m => ({
        ...m,
        id: Number(m.id),
        senderId: Number(m.senderId),
        receiverId: Number(m.receiverId)
      })));
      console.log('Mensajes cargados:', messages);
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

      console.log('Nuevo mensaje recibido:', parsed);
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
      console.log('Usuario conectado:', user);
    });
  }

  // Método para ir directamente al chat como cliente
  async goToClientChat(): Promise<boolean> {
    try {
      await this.ensureConnection();

      const users = await this.waitForAssignedUsers(3000);
      console.log('Usuarios asignados al entrar al chat:', users);

      // Verifica que al menos haya un abogado asignado
      if (!users || !Array.isArray(users) || users.length === 0) {
        throw new Error('No tienes un abogado asignado. Inténtalo más tarde.');
      }

      return await this.router.navigate(['/live-chat']);
    } catch (error) {
      console.error('Error interno en goToClientChat:', error);
      throw error; // vuelve a lanzar para ser capturado en goToChat
    }
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

    const senderId = Number(this.authService.currentLoggedUser);

    const newMessage: Message = {
      id: Date.now(), // ID temporal
      content: content,
      createdDate: new Date().toISOString(),
      senderId: senderId,
      receiverId: receiverId,
      isRead: true // ya lo leyó el emisor
    };

    // Agregar mensaje local inmediatamente
    const currentMessages = this.messages();
    this.messages.set([...currentMessages, newMessage]);

    const messageRequest: MessageRequest = {
      receiverId: receiverId,
      content: content
    };

    return this.hubConnection.invoke('SendMessage', messageRequest)
      .then(() => {
        console.log('Mensaje enviado al backend');
      })
      .catch(err => {
        console.error('Error al enviar mensaje:', err);
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
        .then(() => console.log('Desconectado de SignalR'))
        .catch(err => console.error('Error al desconectar:', err));
      this.connectionPromise = null;
    }
  }
}