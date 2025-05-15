import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
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
    MatCardModule,       // ✅ Needed for <mat-card>
    MatDialogModule,
    NotificationModalComponent
  ],
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.scss']
})
export class UserDashboardComponent {
  constructor(private dialog: MatDialog, private router: Router) {}

  authService = inject(AuthService);
  notifications = [
    {title: 'Document Expired', content: 'Your passport document has expired. Please upload a new one.'},
    {title: 'Document Expired', content: 'Your passport document has expired. Please upload a new one.'},
    {title: 'Document Expired', content: 'Your passport document has expired. Please upload a new one.'},
    {title: 'Document Expired', content: 'Your passport document has expired. Please upload a new one.'},
    {title: 'Document Expired', content: 'Your passport document has expired. Please upload a new one.'},
    {title: 'Document Expired', content: 'Your passport document has expired. Please upload a new one.'},
    {title: 'Document Expired', content: 'Your passport document has expired. Please upload a new one.'},
  ];

  alerts = [
    { title: 'Alert #1', content: 'Details of alert #1' },
    { title: 'Alert #2', content: 'Details of alert #2' },
    { title: 'Alert #3', content: 'Details of alert #3' },
    { title: 'Alert #3', content: 'Details of alert #3' },
    { title: 'Alert #3', content: 'Details of alert #3' },
    { title: 'Alert #3', content: 'Details of alert #3' },
    { title: 'Alert #3', content: 'Details of alert #3' },
    { title: 'Alert #3', content: 'Details of alert #3' },
  ];

  openNotificationDialog(note: any) {
    this.dialog.open(NotificationModalComponent, {
      data: note
    });
  }

  openAlertDialog(alert: any): void {
    this.dialog.open(AlertModalComponent, {
      data: alert,
    });
  }

  goToChat(): void {
    this.router.navigate(['/live-chat']);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/authentication/login'])
  }
}
