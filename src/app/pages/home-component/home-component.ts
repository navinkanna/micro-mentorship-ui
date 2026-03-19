import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService, UserProfile } from '../../services/auth-service';
import { AvatarIllustrationComponent } from '../../shared/avatar-illustration.component';

@Component({
  selector: 'app-home-component',
  standalone: true,
  imports: [CommonModule, RouterModule, AvatarIllustrationComponent],
  templateUrl: './home-component.html',
  styleUrl: './home-component.scss'
})
export class HomeComponent {
  readonly conversationNotes = [
    'Set your role and focus.',
    'Join a short one-on-one chat.',
    'Leave with one useful takeaway.'
  ];
  memberCardProfile: UserProfile | null = null;
  isPreviewOpen = false;
  hasAttemptedProfileLoad = false;

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

  chat() {
    this.router.navigate(['/chat']);
  }

  previewCard() {
    this.isPreviewOpen = true;
    if (!this.memberCardProfile && !this.hasAttemptedProfileLoad) {
      this.loadProfilePreview();
    }
  }

  closePreview() {
    this.isPreviewOpen = false;
  }

  logout() {
    this.auth.clearSession();
    this.router.navigate(['/home']);
  }

  private loadProfilePreview() {
    this.hasAttemptedProfileLoad = true;
    this.auth.getProfile().subscribe({
      next: (profile) => {
        this.memberCardProfile = profile;
      },
      error: () => {
        this.memberCardProfile = null;
      }
    });
  }
}
