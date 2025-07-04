import { Routes } from '@angular/router';
import { AdminPage } from './admin/admin.page';
import { ADMIN_ROUTES } from './admin/admin.routes';
import { LoginPageRoutingModule } from './pages/auth/login/login-routing.module';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full',
  },
  {
    path:'admin',
    component:AdminPage,
    children:ADMIN_ROUTES
  },
  {
    path: '',
    component: LoginPageRoutingModule,
  },
  // {
  //   path: '',
  //   redirectTo: 'admin/form/cotizacion/vertice/data',
  //   pathMatch: 'full',
  // },

];
