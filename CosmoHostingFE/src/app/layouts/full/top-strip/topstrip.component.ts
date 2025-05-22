import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { TablerIconsModule } from 'angular-tabler-icons';
import { TranslateService } from '@ngx-translate/core';
import { TranslateModule } from '@ngx-translate/core';


@Component({
  selector: 'app-topstrip',
  standalone: true,
  imports: [TablerIconsModule, MatButtonModule, MatMenuModule,TranslateModule,],
  templateUrl: './topstrip.component.html',
})
export class AppTopstripComponent {
  currentLang: string;

  constructor(private router: Router, private translate: TranslateService) {
    const storedLang = localStorage.getItem('language');
    this.currentLang = storedLang || 'es';
    this.translate.use(this.currentLang);
  }

  switchLanguage(lang: string): void {
    this.currentLang = lang;
    this.translate.use(lang);
    localStorage.setItem('language', lang);
  }

  openHelp(): void {
    this.router.navigate(['/help']);
  }

  openDashboard(): void {
    this.router.navigate(['/user-dashboard']);
  }

  goToProfile(): void {
    this.router.navigate(['/profile']);
  }

  goToProcess(): void {
    this.router.navigate(['/legal-process']);
  }
}
