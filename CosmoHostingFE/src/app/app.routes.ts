import { Routes } from '@angular/router';
import { BlankComponent } from './layouts/blank/blank.component';
import { FullComponent } from './layouts/full/full.component';

export const routes: Routes = [
  {
    path: '',
    component: FullComponent,
    children: [
      {
        path: '',
        redirectTo: '/auth/login',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        data: { breadcrumb: 'Dashboard' }, // 🧩
        loadChildren: () =>
          import('./pages/pages.routes').then((m) => m.PagesRoutes),
      },
      {
        path: 'user-dashboard',
        loadChildren: () =>
          import('./pages/user-dashboard/user-dashboard.routes').then((m) => m.UserDashboardRoutes),
      },
      {
        path: 'help',
        data: { breadcrumb: 'Help' }, // 🧩
        loadComponent: () =>
          import('./pages/help/help.component').then((m) => m.HelpComponent),
      },
      {
        path: 'ui-components',
        data: { breadcrumb: 'UI Components' }, // 🧩
        loadChildren: () =>
          import('./pages/ui-components/ui-components.routes').then((m) => m.UiComponentsRoutes),
      },
      {
        path: 'extra',
        data: { breadcrumb: 'Extras' }, // 🧩
        loadChildren: () =>
          import('./pages/extra/extra.routes').then((m) => m.ExtraRoutes),
      },
      {
        path: 'profile',
        data: { breadcrumb: 'Profile' }, // 🧩
        loadComponent: () =>
          import('./pages/profile/profile.component').then(
            (m) => m.CompleteProfileComponent
          ),
      },
      {
        path: 'payments',
        data: { breadcrumb: 'Payments' }, // 🧩
        loadChildren: () =>
          import('./pages/payments/payments.routes').then((m) => m.PaymentsRoutes),
      },
      {
        path: 'legal-process',
        data: { breadcrumb: 'Legal Processes' }, // 🧩
        loadComponent: () =>
          import('./pages/legal-processes/legal-processes.page').then((m) => m.LegalProcessesPage),
      },
      {
        path: 'process-detail/:id',
        data: { breadcrumb: 'Detail' }, // 🧩 dinámico (puedes mejorarlo luego)
        loadComponent: () =>
          import('./pages/legal-processes/legal-process-detail.page').then((m) => m.LegalProcessDetailPage),
      },
      {
        path: 'live-chat',
        data: { breadcrumb: 'Live Chat' }, // 🧩
        loadComponent: () =>
          import('./components/live-chat/live-chat.component').then(
            (m) => m.LiveChatComponent
          ),
      }
    ],
  },
  {
    path: '',
    component: BlankComponent,
    children: [
      {
        path: 'authentication',
        loadChildren: () =>
          import('./pages/authentication/authentication.routes').then(
            (m) => m.AuthenticationRoutes
          ),
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'authentication/error',
  },
];

