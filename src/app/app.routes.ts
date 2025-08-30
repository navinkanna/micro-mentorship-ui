import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login-component/login-component';
import { HomeComponent } from './pages/home-component/home-component';
import { SignUpComponent } from './pages/sign-up-component/sign-up-component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'home', component: HomeComponent },
    { path: 'login', component: LoginComponent },
    { path: 'signup', component: SignUpComponent }, 
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: '**', redirectTo: '' }
  ];
  
