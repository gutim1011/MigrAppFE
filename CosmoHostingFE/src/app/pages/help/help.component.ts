import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  standalone: true,
  selector: 'app-help',
  imports: [CommonModule],
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.scss'],
})

export class HelpComponent implements OnInit {
  helpData: any;
  helpContent: any;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.getHelpContent().subscribe((data) => {
      console.log('Received help data:', data);
      this.helpData = data;
    });
  }
}
