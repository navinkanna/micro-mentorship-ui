import { computed, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { finalize, Observable, shareReplay, tap } from 'rxjs';

export interface UserProfile {
  firstName: string;
  lastName: string;
  role: string;
  expertise: string;
  yearsOfExperience: string;
  industry: string;
  company: string;
  location: string;
  headline: string;
  bio: string;
  topics: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly accessTokenKey = 'access_Token';
  private readonly refreshTokenKey = 'refresh_Token';
  private readonly emailKey = 'user_email';
  private readonly apiUrl = '/api/Authorize/login';
  private readonly refreshApiUrl = '/api/Authorize/refresh';
  private readonly profileApiUrl = '/api/profile';
  private readonly authenticated = signal(this.hasStoredSession());
  private readonly currentUserEmail = signal(localStorage.getItem(this.emailKey) ?? '');
  private refreshRequest$: Observable<{ accessToken?: string; refreshToken?: string; token?: string }> | null =
    null;

  readonly isAuthenticated = computed(() => this.authenticated());
  readonly userEmail = computed(() => this.currentUserEmail());

  constructor(private http: HttpClient) {}

  login(payload: {
    username: string;
    password: string;
  }): Observable<{ accessToken?: string; refreshToken?: string; token?: string }> {
    return this.http.post<{ accessToken?: string; refreshToken?: string; token?: string }>(
      this.apiUrl,
      payload
    );
  }

  storeSession(
    email: string,
    tokens: { accessToken?: string; refreshToken?: string; token?: string }
  ): void {
    const accessToken = tokens.accessToken ?? tokens.token;

    if (!accessToken) {
      throw new Error('Login response did not include a token.');
    }

    localStorage.setItem(this.accessTokenKey, accessToken);

    if (tokens.refreshToken) {
      localStorage.setItem(this.refreshTokenKey, tokens.refreshToken);
    } else {
      localStorage.removeItem(this.refreshTokenKey);
    }

    localStorage.setItem(this.emailKey, email);
    this.currentUserEmail.set(email);
    this.authenticated.set(true);
  }

  refreshToken(): Observable<{ accessToken?: string; refreshToken?: string; token?: string }> {
    if (this.refreshRequest$) {
      return this.refreshRequest$;
    }

    const refreshToken = this.getRefreshToken();

    if (!refreshToken) {
      throw new Error('Refresh token is not available.');
    }

    const requestBody = {
      token: this.getAccessToken() ?? '',
      refreshToken
    };

    this.refreshRequest$ = this.http
      .post<{ accessToken?: string; refreshToken?: string; token?: string }>(
        this.refreshApiUrl,
        requestBody
      )
      .pipe(
        tap((tokens) => {
          this.storeSession(this.currentUserEmail() || localStorage.getItem(this.emailKey) || '', tokens);
        }),
        finalize(() => {
          this.refreshRequest$ = null;
        }),
        shareReplay(1)
      );

    return this.refreshRequest$;
  }

  clearSession(): void {
    localStorage.removeItem(this.accessTokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    localStorage.removeItem(this.emailKey);
    this.currentUserEmail.set('');
    this.authenticated.set(false);
  }

  private hasStoredSession(): boolean {
    return Boolean(localStorage.getItem(this.accessTokenKey));
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.accessTokenKey);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshTokenKey);
  }

  getProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(this.profileApiUrl);
  }

  saveProfile(profile: UserProfile): Observable<UserProfile> {
    return this.http.put<UserProfile>(this.profileApiUrl, profile);
  }
}
