import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth-service';
import { strongPasswordValidator } from '../../validators/password-validator';

@Component({
  selector: 'app-sign-up-component',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './sign-up-component.html',
  styleUrl: './sign-up-component.scss'
})
export class SignUpComponent {
  private readonly linkedInStateStorageKey = 'linkedin_auth_state';
  isLoading = false;
  isLinkedInLoading = false;
  errorMessage = '';
  form: any;

  constructor(private fb: FormBuilder, private router: Router, private auth: AuthService) {}

  ngOnInit() {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, strongPasswordValidator()]],
      role: ['mentee', Validators.required]
    });
  }

  backToHome() {
    this.router.navigate(['/home']);
  }

  login() {
    this.router.navigate(['/login']);
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const payload = {
      userName: this.form.value.email,
      password: this.form.value.password,
      role: this.form.value.role
    };

    this.auth.register(payload).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/login']);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Signup failed', error);

        if (
          error instanceof HttpErrorResponse &&
          error.status === 409 &&
          typeof error.error === 'string'
        ) {
          this.errorMessage = error.error;
          return;
        }

        this.errorMessage = 'Could not create account.';
      }
    });
  }

  continueWithLinkedIn() {
    if (this.isLinkedInLoading) {
      return;
    }

    this.isLinkedInLoading = true;
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
        this.isLinkedInLoading = false;
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
