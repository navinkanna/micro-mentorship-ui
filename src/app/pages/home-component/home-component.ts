import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-home-component',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home-component.html',
  styleUrl: './home-component.scss'
})
export class HomeComponent {
  readonly conversationNotes = [
    'Set your role and focus.',
    'Join a short one-on-one chat.',
    'Leave with one useful takeaway.'
  ];

  constructor(private router: Router, public auth: AuthService) {}

  signup() {
    this.router.navigate(['/signup']);
  }

  login() {
    this.router.navigate(['/login']);
  }

  profile() {
    this.router.navigate(['/profile']);
  }

  logout() {
    this.auth.clearSession();
    this.router.navigate(['/home']);
  }
}
