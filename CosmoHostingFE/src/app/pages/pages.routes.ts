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
import { ChatComponent } from '../components/live-chat/live-chat.component';

export const PagesRoutes: Routes = [
  {
    path: 'dashboard',
    component: UserDashboardComponent
  },
  { path: 'live-chat', 
    component: ChatComponent }
];
