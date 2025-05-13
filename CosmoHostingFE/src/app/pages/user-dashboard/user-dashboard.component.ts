import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { NotificationModalComponent } from './notification-modal.component';
import { AlertModalComponent } from './alert-modal.components';

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
export class UserDashboardComponent implements OnInit {
  constructor(
    private dialog: MatDialog,
    private authService: AuthService
  ) {}

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