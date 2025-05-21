import { Component, ElementRef, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { ChatService } from 'src/app/services/chat.service';
import { Message } from 'src/app/models/message';
import { AuthService } from 'src/app/services/auth.service';
import { User } from 'src/app/models/user';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-chat',
  imports: [CommonModule, TitleCasePipe, FormsModule],
  templateUrl: './live-chat.component.html',
  styleUrls: ['./live-chat.component.scss']
})
export class ChatComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private chatService = inject(ChatService);
  private router = inject(Router);
  
  @ViewChild('messageContainer') messageContainer!: ElementRef;
  @ViewChild('messageInput') messageInput!: ElementRef;

  messageContent: string = '';
  isLoading: boolean = false;
  currentPage: number = 1;
  unreadCounts: { [userId: number]: number } = {};
  private unreadSubscription?: Subscription;

  get currentChat(): User | null {
    return this.chatService.currentOpenedChat();
  }

  get messages(): Message[] {
    return this.chatService.messages();
  }

  get filteredContacts(): User[] {
    return this.chatService.onlineUsers();
  }

  get isLawyer(): boolean {
    return this.chatService.isLawyer();
  }

  constructor() { }

  ngOnInit(): void {
    this.isLoading = this.chatService.loading();
    
    this.unreadSubscription = this.chatService.unreadMessages$.subscribe(counts => {
      this.unreadCounts = counts;
    });

    // Si es un cliente y solo hay un contacto (el abogado asignado), seleccionar automáticamente
    if (!this.isLawyer && this.filteredContacts.length === 1) {
      setTimeout(() => {
        this.selectChat(this.filteredContacts[0]);
      }, 100);
    }
  }

  ngOnDestroy(): void {
    this.unreadSubscription?.unsubscribe();
  }

  selectChat(user: User): void {
    this.chatService.openChat(user);
    setTimeout(() => {
      this.scrollToBottom();
      this.focusMessageInput();
    }, 100);
  }

  sendMessage(): void {
    if (!this.currentChat || !this.messageContent.trim()) return;
    
    this.chatService.sendMessage(this.currentChat.id, this.messageContent.trim())!
    .then(() => {
      this.messageContent = '';
      setTimeout(() => this.scrollToBottom(), 100);
    });

  }

  onTyping(): void {
    if (!this.currentChat) return;
    this.chatService.notifyTyping(this.currentChat.id);
  }

  isOwnMessage(message: Message): boolean {
    const currentUserId = Number(this.authService.currentLoggedUser);
    return message.senderId === currentUserId;
  }

  formatMessageTime(date: string | Date): string {
    if (!date) return '';
    const messageDate = new Date(date);
    return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  onScroll(event: Event): void {
    const element = event.target as HTMLElement;
    // Si el scroll está cerca del tope y no estamos cargando, cargar más mensajes
    if (element.scrollTop < 50 && !this.isLoading && this.messages.length > 0) {
      this.loadMoreMessages();
    }
  }

  loadMoreMessages(): void {
    if (!this.currentChat) return;
    
    this.currentPage++;
    const scrollHeight = this.messageContainer.nativeElement.scrollHeight;
    
    this.isLoading = true;
    this.chatService.loadMessages(this.currentChat.id, this.currentPage);
    
    // Mantener la posición del scroll al cargar más mensajes
    setTimeout(() => {
      const newScrollHeight = this.messageContainer.nativeElement.scrollHeight;
      this.messageContainer.nativeElement.scrollTop = newScrollHeight - scrollHeight;
    }, 500);
  }

  scrollToBottom(): void {
    if (this.messageContainer) {
      this.messageContainer.nativeElement.scrollTop = this.messageContainer.nativeElement.scrollHeight;
    }
  }

  focusMessageInput(): void {
    if (this.messageInput) {
      this.messageInput.nativeElement.focus();
    }
  }

  goBackToDashboard(): void {
    this.router.navigate(['/user-dashboard']);
  }
}