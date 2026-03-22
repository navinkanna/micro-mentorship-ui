import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login-component/login-component';
import { HomeComponent } from './pages/home-component/home-component';
import { SignUpComponent } from './pages/sign-up-component/sign-up-component';
import { ProfileComponent } from './pages/profile-component/profile-component';
import { ChatComponent } from './pages/chat-component/chat-component';
import { RecentChatsComponent } from './pages/recent-chats-component/recent-chats-component';
import { TranscriptDetailComponent } from './pages/transcript-detail-component/transcript-detail-component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignUpComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'chat', component: ChatComponent },
  { path: 'recent-chats', component: RecentChatsComponent },
  { path: 'recent-chats/:sessionId', component: TranscriptDetailComponent },
  { path: '**', redirectTo: '' }
];
