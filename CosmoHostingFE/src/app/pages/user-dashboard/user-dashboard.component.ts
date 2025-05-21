import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { NotificationModalComponent } from './notification-modal.component';
import { AlertModalComponent } from './alert-modal.components';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { ChatService } from 'src/app/services/chat.service';
import { LegalProcessService } from '../../services/legal-process.service';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { AppSalesOverviewComponent } from '../../components/sales-overview/sales-overview.component';
import { NgChartsModule } from 'ng2-charts';
import { ChartType, ChartOptions, ChartData } from 'chart.js';

@Component({
  standalone: true,
  selector: 'app-user-dashboard',
  imports: [
    CommonModule,
    MatCardModule,
    MatDialogModule,
    NotificationModalComponent,
    MatProgressBarModule,
    AppSalesOverviewComponent,
    NgChartsModule
  ],
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.scss']
})
export class UserDashboardComponent implements OnInit {
  constructor(private dialog: MatDialog, private router: Router) {}

  authService = inject(AuthService);

  legalService = inject(LegalProcessService);

  chatService = inject(ChatService);
  legalService = inject(LegalProcessService);

  userData: any = {};
  userImageUrl: string = 'assets/images/default.jpg';
  userId: number = 0;
  progressPercentage: number = 0;

  chartLabels: string[] = [];
  chartData: number[] = [];

  chartType: ChartType = 'bar';
  chartOptions: ChartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: 'Progress per Legal Process'
      }
    }
  };
  chartDataSet: ChartData<'bar'> = {
    labels: [],
    datasets: [
      {
        label: 'Progress (%)',
        data: [],
        backgroundColor: ['#f44336', '#ff9800', '#4caf50']
      }
    ]
  };

  notifications = [
    { title: 'Document Expired', content: 'Your passport document has expired. Please upload a new one.' }
  ];

  alerts = [
    { title: 'Alert #1', content: 'Details of alert #1' }
  ];

  ngOnInit() {
    const storedId = localStorage.getItem('userId');
    if (storedId) {
      this.userId = +storedId;
      this.fetchUserData();
      this.fetchUserProfile();
      this.fetchLegalProcesses();
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

  fetchLegalProcesses() {
    this.legalService.getUserProcesses(this.userId).subscribe({
      next: (processes) => {
        this.calculateAverageProgress(processes);
        this.prepareChartData(processes);
      },
      error: (err) => {
        console.error('Error loading legal processes:', err);
      }
    });
  }

  calculateAverageProgress(processes: any[]) {
    if (!processes.length) {
      this.progressPercentage = 0;
      return;
    }

    const totalProgress = processes.reduce((sum, proc) => sum + proc.progress, 0);
    this.progressPercentage = Math.round(totalProgress / processes.length);
  }

  prepareChartData(processes: any[]) {
    this.chartLabels = processes.map(proc => proc.name || `Task #${proc.id}`);
    this.chartData = processes.map(proc => proc.progress ?? 0);

    const backgroundColors = processes.map(proc => {
      const status = (proc.status || '').toLowerCase();
      switch(status) {
        case 'pending': return '#f44336';      // rojo
        case 'in progress': return '#ff9800';  // naranja
        case 'completed': return '#4caf50';    // verde
        default: return '#4caf50';              // azul
      }
    });

    this.chartDataSet = {
      labels: this.chartLabels,
      datasets: [
        {
          label: 'Task Progress (%)',
          data: this.chartData,
          backgroundColor: backgroundColors
        }
      ]
    };
  }


  async goToChat(): Promise<void> {
    try {
      await this.chatService.ensureConnection();
      
      const result = await this.chatService.goToClientChat();
      
      if (!result) {
        alert('No hay asesores disponibles en este momento. Por favor, inténtelo más tarde.');
      }
    } catch (error) {
      console.error('Error al acceder al chat:', error);
      alert('Hubo un problema al conectar con el servicio de chat. Por favor, inténtelo de nuevo.');
    }
  }

  logout(): void {
    this.chatService.disconnect();
    this.authService.logout();
    this.router.navigate(['/authentication/login']);
  }

  openNotificationDialog(note: any) {
    this.dialog.open(NotificationModalComponent, { data: note });
  }

  openAlertDialog(alert: any) {
    this.dialog.open(AlertModalComponent, { data: alert });
  }
}
