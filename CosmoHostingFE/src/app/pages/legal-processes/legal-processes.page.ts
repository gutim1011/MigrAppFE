import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { LegalProcessService } from '../../services/legal-process.service';

@Component({
  standalone: true,
  selector: 'app-legal-processes',
  imports: [
    CommonModule,
    MatListModule,
    MatCardModule,
    MatButtonModule
  ],
  templateUrl: './legal-processes.page.html',
  styleUrls: ['./legal-processes.page.scss']
})
export class LegalProcessesPage implements OnInit {
  legalProcessService = inject(LegalProcessService);
  router = inject(Router);

  processes: any[] = [];
  userId: number = 0;

  ngOnInit() {
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      this.userId = +storedUserId;
      this.loadProcesses();
    }
  }

  loadProcesses() {
    this.legalProcessService.getUserProcesses(this.userId).subscribe({
      next: (data) => this.processes = data,
      error: (err) => console.error('Error loading processes:', err)
    });
  }

  viewDetails(processId: number) {
    this.router.navigate(['/process-detail', processId]);
  }
}
