import { Routes } from '@angular/router';
import { StarterComponent } from './starter/starter.component';

/*
export const PagesRoutes: Routes = [
  {
    path: '',
    component: StarterComponent,
    data: {
      title: 'Starter Page',
      urls: [
        { title: 'Dashboard', url: '/dashboards/dashboard1' },
        { title: 'Starter Page' },
      ],
    },
  },
];
*/

import { UserDashboardComponent } from './user-dashboard/user-dashboard.component';

export const PagesRoutes: Routes = [
  {
    path: 'dashboard',
    component: UserDashboardComponent
  }
];
