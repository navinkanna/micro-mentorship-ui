import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-linkedin-callback-component',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './linkedin-callback-component.html',
  styleUrl: './linkedin-callback-component.scss'
})
export class LinkedInCallbackComponent implements OnInit {
  private readonly linkedInStateStorageKey = 'linkedin_auth_state';

  statusMessage = 'Finishing LinkedIn sign-in...';
  errorMessage = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly auth: AuthService
  ) {}

  ngOnInit(): void {
    const code = this.route.snapshot.queryParamMap.get('code');
    const state = this.route.snapshot.queryParamMap.get('state');
    const error = this.route.snapshot.queryParamMap.get('error');
    const errorDescription = this.route.snapshot.queryParamMap.get('error_description');

    if (error) {
      this.errorMessage = errorDescription || 'LinkedIn sign-in was cancelled.';
      return;
    }

    const expectedState = localStorage.getItem(this.linkedInStateStorageKey);
    if (!code || !state || !expectedState || state !== expectedState) {
      this.clearPendingLinkedInState();
      this.errorMessage = 'LinkedIn sign-in could not be verified. Please try again.';
      return;
    }

    this.clearPendingLinkedInState();

    this.auth.getLinkedInConfig().subscribe({
      next: (config) => {
        this.auth
          .exchangeLinkedInCode({
            code,
            redirectUri: config.redirectUri
          })
          .subscribe({
            next: (tokens) => {
              const userEmail = this.extractEmailFromToken(tokens.token) || 'LinkedIn member';
              this.auth.storeSession(userEmail, tokens);
              this.auth.getPostLoginRedirectPath().subscribe({
                next: (redirectPath) => {
                  this.router.navigate([redirectPath]);
                },
                error: () => {
                  this.router.navigate(['/profile']);
                }
              });
            },
            error: (exchangeError) => {
              this.errorMessage = this.getErrorMessage(exchangeError);
            }
          });
      },
      error: (configError) => {
        this.errorMessage = this.getErrorMessage(configError);
      }
    });
  }

  private clearPendingLinkedInState(): void {
    localStorage.removeItem(this.linkedInStateStorageKey);
  }

  private extractEmailFromToken(token: string): string | null {
    const payload = token.split('.')[1];
    if (!payload) {
      return null;
    }

    try {
      const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/');
      const decodedPayload = this.decodeBase64(normalizedPayload);
      const parsedPayload = JSON.parse(decodedPayload) as {
        unique_name?: string;
        email?: string;
        name?: string;
      };

      return parsedPayload.unique_name || parsedPayload.email || parsedPayload.name || null;
    } catch {
      return null;
    }
  }

  private decodeBase64(value: string): string {
    const paddedValue = value.padEnd(value.length + ((4 - (value.length % 4)) % 4), '=');
    return atob(paddedValue);
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse && typeof error.error === 'string') {
      return error.error;
    }

    return 'LinkedIn sign-in could not be completed.';
  }
}
