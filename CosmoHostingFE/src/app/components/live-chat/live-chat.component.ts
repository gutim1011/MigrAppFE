import { CommonModule, DatePipe, TitleCasePipe } from '@angular/common';
import { Component, ElementRef, HostListener, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ChatService } from 'src/app/services/chat.service';
import { AuthService } from 'src/app/services/auth.service';
import { FormsModule } from '@angular/forms';
import { User } from 'src/app/models/user';
import { Message } from 'src/app/models/message';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-live-chat',
  standalone: true,
  imports: [CommonModule, TitleCasePipe, DatePipe, FormsModule],
  templateUrl: './live-chat.component.html',
  styleUrls: ['./live-chat.component.scss']
})
export class LiveChatComponent implements OnInit, OnDestroy {
  chatService = inject(ChatService);
  authService = inject(AuthService);
  
  messageContent: string = '';
  currentUser: any;
  currentUserId: number = 0;
  userRole: string = '';
  
  contacts: User[] = [];
  unreadCounts: {[userId: number]: number} = {};
  
  private subscriptions: Subscription[] = [];
  
  @ViewChild('messageContainer') messageContainer?: ElementRef;
  @ViewChild('messageInput') messageInput?: ElementRef;

  ngOnInit(): void {
    const token = this.authService.getAccessToken;
    const userId = this.authService.currentLoggedUser;

    if (userId) {
      this.currentUserId = parseInt(userId);
    }

    // Obtener información del usuario actual
    this.authService.getUserInfo(this.currentUserId).subscribe({
      next: (user) => {
        this.currentUser = user;
        this.userRole = user.role;
        console.log('👤 Usuario cargado:', user);
      },
      error: (err) => console.error('Error al cargar información del usuario:', err)
    });

    console.log("🔐 Iniciando conexión con token:", !!token);
    console.log("👤 Usuario logueado ID:", userId);

    // Iniciar conexión con SignalR
    this.chatService.startConnection();
    
    // Suscribirse a los mensajes no leídos
    const unreadSub = this.chatService.unreadMessages$.subscribe(counts => {
      this.unreadCounts = counts;
    });
    this.subscriptions.push(unreadSub);
  }

  ngOnDestroy(): void {
    // Limpiar suscripciones para evitar fugas de memoria
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.chatService.disconnect();
  }

  get messages(): Message[] {
    return this.chatService.messages();
  }

  get onlineUsers(): User[] {
    return this.chatService.onlineUsers();
  }

  get currentChat(): User | null {
    return this.chatService.currentOpenedChat();
  }

  get isLoading(): boolean {
    return this.chatService.loading();
  }

  // Filtrar contactos según el rol del usuario
  get filteredContacts(): User[] {
    if (!this.userRole) return this.onlineUsers;
    
    // Si es inmigrante, solo mostrar asesores
    if (this.userRole === 'immigrant') {
      return this.onlineUsers.filter(user => user.role === 'advisor');
    }
    
    // Si es asesor, solo mostrar inmigrantes
    if (this.userRole === 'advisor') {
      return this.onlineUsers.filter(user => user.role === 'immigrant');
    }
    
    return this.onlineUsers;
  }

  // Verificar si un mensaje es del usuario actual
  isOwnMessage(message: Message): boolean {
    return message.senderId === this.currentUserId;
  }

  // Seleccionar un chat
  selectChat(user: User): void {
    this.chatService.openChat(user);
    setTimeout(() => this.scrollToBottom(), 100);
    
    // Enfocar en el campo de texto
    setTimeout(() => {
      this.messageInput?.nativeElement.focus();
    }, 200);
  }

  // Enviar un mensaje
  sendMessage(): void {
    if (!this.messageContent.trim() || !this.currentChat) return;
    
    this.chatService.sendMessage(this.currentChat.id, this.messageContent.trim())
      ?.then(() => {
        this.messageContent = '';
        setTimeout(() => this.scrollToBottom(), 100);
      });
  }

  // Notificar que el usuario está escribiendo
  onTyping(): void {
    if (this.currentChat) {
      this.chatService.notifyTyping(this.currentChat.id);
    }
  }

  // Desplazarse al último mensaje
  scrollToBottom(): void {
    if (this.messageContainer) {
      this.messageContainer.nativeElement.scrollTop = 
        this.messageContainer.nativeElement.scrollHeight;
    }
  }

  // Manejar la tecla Enter para enviar mensajes
  @HostListener('keydown.enter', ['$event'])
  onEnterPress(event: KeyboardEvent): void {
    if (!event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  // Cargar más mensajes (paginación)
  loadMoreMessages(): void {
    if (!this.currentChat) return;
    
    const nextPage = Math.ceil(this.messages.length / 10) + 1;
    this.chatService.loadMessages(this.currentChat.id, nextPage);
  }

  // Formatear la fecha del mensaje
  formatMessageTime(date: string): string {
    const messageDate = new Date(date);
    const today = new Date();
    
    // Si es hoy, mostrar solo la hora
    if (messageDate.toDateString() === today.toDateString()) {
      return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // Si es este año, mostrar día y mes
    if (messageDate.getFullYear() === today.getFullYear()) {
      return messageDate.toLocaleDateString([], { day: '2-digit', month: 'short' });
    }
    
    // Si es otro año, mostrar día, mes y año
    return messageDate.toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' });
  }

  onScroll(event: Event): void {
    const target = event.target as HTMLElement;
    if (target && target.scrollTop === 0) {
      this.loadMoreMessages();
    }
  }
}