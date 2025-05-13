import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';

@Component({
  selector: 'app-payments',
  imports: [CommonModule, CurrencyPipe, DatePipe],
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.scss']
})
export class PaymentsComponent implements OnInit {
  payments: any[] = [];

  constructor() {}

  ngOnInit(): void {
    this.payments = [
      {
        name: 'Monthly Subscription',
        cost: 9.99,
        date: '2025-04-01T10:00:00'
      },
      {
        name: 'E-book Purchase',
        cost: 14.50,
        date: '2025-03-20T15:30:00'
      },
      {
        name: 'Course Access',
        cost: 49.99,
        date: '2025-02-18T09:00:00'
      },
      {
        name: 'One-time Donation',
        cost: 25.00,
        date: '2025-01-10T18:45:00'
      }
    ];
  }
}
