import { Component, ViewChild ,inject} from '@angular/core';
import { TablerIconsModule } from 'angular-tabler-icons';
import {
  ApexChart,
  ChartComponent,
  ApexDataLabels,
  ApexLegend,
  ApexStroke,
  ApexTooltip,
  ApexAxisChartSeries,
  ApexXAxis,
  ApexYAxis,
  ApexGrid,
  ApexPlotOptions,
  ApexFill,
  ApexMarkers,
  NgApexchartsModule,
} from 'ng-apexcharts';
import { MaterialModule } from 'src/app/material.module';
import { LegalProcessService } from 'src/app/services/legal-process.service';


export interface salesChart {
  series: ApexAxisChartSeries | any;
  chart: ApexChart | any;
  dataLabels: ApexDataLabels | any;
  plotOptions: ApexPlotOptions | any;
  yaxis: ApexYAxis | any;
  xaxis: ApexXAxis | any;
  fill: ApexFill | any;
  tooltip: ApexTooltip | any;
  stroke: ApexStroke | any;
  legend: ApexLegend | any;
  grid: ApexGrid | any;
  marker: ApexMarkers | any;
}

@Component({
  selector: 'app-sales-overview',
  imports: [NgApexchartsModule, TablerIconsModule, MaterialModule],
  templateUrl: './sales-overview.component.html',
})
export class AppSalesOverviewComponent {
  @ViewChild('chart') chart: ChartComponent = Object.create(null);
  
  legalService = inject(LegalProcessService)
  userId: number = 0;

  public salesChart!: Partial<salesChart> | any;

  ngOnInit() {
    const storedId = localStorage.getItem('userId');
    if (storedId) {
      this.userId = +storedId;
      this.loadProcessesAndBuildChart();
    } else {
      console.warn('User ID not found in localStorage.');
    }
  }

  constructor() {
    this.salesChart = {

      series: [],
      chart: {
        fontFamily: 'inherit',
        type: 'bar',
        height: 330,
        foreColor: '#adb0bb',
        offsetY: 10,
        offsetX: -15,
        toolbar: {
          show: false,
        },
      },
      grid: {
        show: true,
        strokeDashArray: 3,
        borderColor: "rgba(0,0,0,.1)",
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "30%",
          endingShape: "flat",
          borderRadius: 4,
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        show: true,
        width: 5,
        colors: ["transparent"],
      },
      xaxis: {
        type: 'category',
        categories: [],
        axisTicks: {
          show: false,
        },
        axisBorder: {
          show: false,
        },
        labels: {
          style: {
            colors: "#a1aab2",
          },
        },
      },
      yaxis: {
        labels: {
          style: {
            colors: '#a1aab2',
          },
        },
      },
      fill: {
        opacity: 1,
        colors: ["#1B84FF", "#43CED7"],
      },
      tooltip: {
        theme: "dark",
      },
      legend: {
        show: false,
      },
      responsive: [
        {
          breakpoint: 767,
          options: {
            stroke: {
              show: false,
              width: 5,
              colors: ["transparent"],
            },
          },
        },
      ],
    };
  }

  loadProcessesAndBuildChart() {
    this.legalService.getUserProcesses(this.userId).subscribe({
      next: (processes: any[]) => {
        this.updateChart(processes);
      },
      error: (error) => {
        console.error('Failed to load processes:', error);
      },
    });
  }

  updateChart(processes: any[]) {
    this.salesChart.xaxis.categories = processes.map(
      (p) => `Proceso #${p.legalProcessId}`
    );

    this.salesChart.series = [
      {
        name: 'Progreso',
        data: processes.map((p) => p.progress),
        color: '#1B84FF',
      },
    ];
  }
}
