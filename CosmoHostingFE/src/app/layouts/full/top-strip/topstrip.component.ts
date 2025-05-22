import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { TablerIconsModule } from 'angular-tabler-icons';
import { TranslateService } from '@ngx-translate/core';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { AuthService } from 'src/app/services/auth.service';
import { ChatService } from 'src/app/services/chat.service';

@Component({
  selector: 'app-topstrip',
  standalone: true,
  imports: [CommonModule, TablerIconsModule, MatButtonModule, MatMenuModule, TranslateModule,],
  templateUrl: './topstrip.component.html',
})
export class AppTopstripComponent implements OnInit {
  userImageUrl: string = 'assets/images/default-avatar.jpg';
  userId: number = 0;
  currentLang: string;
  chatService = inject(ChatService);
  
  constructor(private router: Router,private authService: AuthService, private translate: TranslateService) {
    const storedLang = localStorage.getItem('language');
    this.currentLang = storedLang || 'es';
    this.translate.use(this.currentLang);
  }

  switchLanguage(lang: string): void {
    this.currentLang = lang;
    this.translate.use(lang);
    localStorage.setItem('language', lang);
  }

  ngOnInit(): void {
    const storedId = localStorage.getItem('userId');
    if (storedId) {
      this.userId = +storedId;
      this.loadUserImage();
    }
  }

  loadUserImage(): void {
    this.authService.getUserProfile(this.userId).subscribe({
      next: (data: any) => {
        this.userImageUrl = data.image || this.userImageUrl;
      },
      error: (err) => {
        console.error('Error loading user image:', err);
      },
    });
  }

  openHelp(): void {
    this.router.navigate(['/help']);
  }

  openDashboard(): void {
    this.router.navigate(['/user-dashboard']);
  }

  goToProfile(): void {
    this.router.navigate(['/profile']);
  }

  goToProcess(): void {
    this.router.navigate(['/legal-process']);
  }

  logout(): void {
    this.chatService.disconnect();
    this.authService.logout();
    this.router.navigate(['/authentication/login']);
  }
}
