import { Routes } from '@angular/router';
import { AdminPage } from './admin/admin.page';
import { ADMIN_ROUTES } from './admin/admin.routes';

export const routes: Routes = [
  {
    path:'admin',
    component:AdminPage,
    children:ADMIN_ROUTES
  },
  {
    path: '',
    redirectTo: 'admin/form/cotizacion/vertice/data',
    pathMatch: 'full',
  },

];
