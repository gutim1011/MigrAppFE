import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-notification-dialog',
  imports: [CommonModule, MatDialogModule],
  templateUrl: './notification-dialog.component.html',
  styleUrls: ['./notification-dialog.component.scss']
})
export class NotificationDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { title: string; content: string }) {}
}
