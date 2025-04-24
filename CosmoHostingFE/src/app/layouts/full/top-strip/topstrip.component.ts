import { Component } from '@angular/core';
import { Router } from '@angular/router'; // ✅ Import Router
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { TablerIconsModule } from 'angular-tabler-icons';

@Component({
  selector: 'app-topstrip',
  imports: [TablerIconsModule, MatButtonModule, MatMenuModule],
  templateUrl: './topstrip.component.html',
})
export class AppTopstripComponent {
  constructor(private router: Router) {} // ✅ Inject Router

  openHelp(): void {
    this.router.navigate(['/help']); // ✅ Navigate to help route
  }

  openDashboard(): void {
    this.router.navigate(['/user-dashboard']);
  }
}