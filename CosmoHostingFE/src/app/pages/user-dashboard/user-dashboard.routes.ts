import { Routes } from '@angular/router';
import { UserDashboardComponent } from './user-dashboard.component';
import { LiveChatComponent } from 'src/app/components/live-chat/live-chat.component';

export const UserDashboardRoutes: Routes = [
  {
    path: '',
    component: UserDashboardComponent
  },
  { path: 'live-chat', 
      component: LiveChatComponent }
];
