import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';y
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { NotificationModalComponent } from './notification-modal.component';
import { AlertModalComponent } from './alert-modal.components';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-user-dashboard',
  imports: [
    CommonModule,
    MatCardModule,
    MatDialogModule,
    NotificationModalComponent
  ],
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.scss']
})
export class UserDashboardComponent {
  constructor(private dialog: MatDialog, private router: Router) {}

  authService = inject(AuthService);
  userData: any = {};
  userImageUrl: string = 'assets/images/default.jpg';
  userId: number = 0;

  ngOnInit() {
    const storedId = localStorage.getItem('userId');
    if (storedId) {
      this.userId = +storedId;
      this.fetchUserData();
      this.fetchUserProfile();
    } else {
      console.warn('User ID not found in localStorage.');
    }
  }

  fetchUserData() {
    this.authService.getUserInfo(this.userId).subscribe({
      next: (data: any) => {
        this.userData = data;
      },
      error: (err: any) => {
        console.error('Failed to load user data:', err);
      }
    });
  }

  fetchUserProfile() {
    this.authService.getUserProfile(this.userId).subscribe({
      next: (data: any) => {
        this.userImageUrl = data.image || this.userImageUrl;
      },
      error: (err: any) => {
        console.error('Failed to load profile image:', err);
      }
    });
  }

  goToChat(): void {
    this.router.navigate(['/live-chat']);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/authentication/login'])
  }
  
  openNotificationDialog(note: any) {
    this.dialog.open(NotificationModalComponent, { data: note });
  }

  openAlertDialog(alert: any) {
    this.dialog.open(AlertModalComponent, { data: alert });
  }

  notifications = [
    { title: 'Document Expired', content: 'Your passport document has expired. Please upload a new one.' }
  ];

  alerts = [
    { title: 'Alert #1', content: 'Details of alert #1' }
  ];
}