import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginAndRegisterComponent } from './Components/login-and-register/login-and-register.component';
import { GeneralComponent } from './Components/general/general.component';
import { AuthGuard } from './guard/auth.guard';
import { LoginGuard } from './guard/login.guard';

const routes: Routes = [
  { path: '', redirectTo: '/auth', pathMatch: 'full' }, // Default route to login
  { path: 'auth', component: LoginAndRegisterComponent, canActivate: [LoginGuard] }, // Login page
  { path: 'general', component: GeneralComponent, canActivate: [AuthGuard] }, // Protected route
  { path: '**', redirectTo: '/auth' } // Redirect unknown routes to login
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }