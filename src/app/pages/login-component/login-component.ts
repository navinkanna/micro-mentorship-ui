import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth-service';
import { strongPasswordValidator } from '../../validators/password-validator';

@Component({
  selector: 'app-login-component',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login-component.html',
  styleUrl: './login-component.scss'
})
export class LoginComponent {
  private readonly linkedInStateStorageKey = 'linkedin_auth_state';
  isSubmitting = false;
  isLinkedInSubmitting = false;
  errorMessage = '';

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {}
  form: any;

  ngOnInit() {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, strongPasswordValidator()]]
    });
  }

  backToHome() {
    this.router.navigate(['/home']);
  }

  submit() {
    if (this.form.valid) {
      this.isSubmitting = true;
      this.errorMessage = '';

      const payload = {
        username: this.form.value.email,
        password: this.form.value.password
      };

      this.auth.login(payload).subscribe({
        next: (tokens) => {
          this.auth.storeSession(payload.username, tokens);
          this.auth.getPostLoginRedirectPath().subscribe({
            next: (redirectPath) => {
              this.isSubmitting = false;
              this.router.navigate([redirectPath]);
            },
            error: () => {
              this.isSubmitting = false;
              this.router.navigate(['/profile']);
            }
          });
        },
        error: (err) => {
          this.isSubmitting = false;
          console.error('Login failed', err);
          this.errorMessage = 'Login failed. Check your credentials and try again.';
        }
      });
    } else {
      this.form.markAllAsTouched();
      return;
    }
  }

  continueWithLinkedIn() {
    if (this.isLinkedInSubmitting) {
      return;
    }

    this.isLinkedInSubmitting = true;
    this.errorMessage = '';

    this.auth.getLinkedInConfig().subscribe({
      next: (config) => {
        const state = this.createLinkedInState();
        localStorage.setItem(this.linkedInStateStorageKey, state);

        const authorizationUrl = new URL('https://www.linkedin.com/oauth/v2/authorization');
        authorizationUrl.searchParams.set('response_type', 'code');
        authorizationUrl.searchParams.set('client_id', config.clientId);
        authorizationUrl.searchParams.set('redirect_uri', config.redirectUri);
        authorizationUrl.searchParams.set('scope', config.scope);
        authorizationUrl.searchParams.set('state', state);

        window.location.href = authorizationUrl.toString();
      },
      error: (error) => {
        this.isLinkedInSubmitting = false;
        this.errorMessage = this.getLinkedInErrorMessage(error);
      }
    });
  }

  private createLinkedInState(): string {
    if ('randomUUID' in crypto) {
      return crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }

  private getLinkedInErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse && typeof error.error === 'string') {
      return error.error;
    }

    return 'LinkedIn sign-in is not available right now.';
  }
}
