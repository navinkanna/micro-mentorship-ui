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

export interface RegisterPayload {
  userName: string;
  password: string;
  role: string;
}

export interface TokenResponse {
  token: string;
  refreshToken: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly accessTokenKey = 'access_Token';
  private readonly refreshTokenKey = 'refresh_Token';
  private readonly emailKey = 'user_email';
  private readonly apiUrl = '/api/Authorize/login';
  private readonly registerApiUrl = '/api/Authorize/register';
  private readonly refreshApiUrl = '/api/Authorize/refresh';
  private readonly profileApiUrl = '/api/profile';
  private readonly authenticated = signal(this.hasStoredSession());
  private readonly currentUserEmail = signal(localStorage.getItem(this.emailKey) ?? '');
  private refreshRequest$: Observable<TokenResponse> | null = null;

  readonly isAuthenticated = computed(() => this.authenticated());
  readonly userEmail = computed(() => this.currentUserEmail());

  constructor(private http: HttpClient) {}

  login(payload: {
    username: string;
    password: string;
  }): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(this.apiUrl, payload);
  }

  register(payload: RegisterPayload): Observable<string> {
    return this.http.post(this.registerApiUrl, payload, { responseType: 'text' });
  }

  storeSession(email: string, tokens: TokenResponse): void {
    localStorage.setItem(this.accessTokenKey, tokens.token);
    localStorage.setItem(this.refreshTokenKey, tokens.refreshToken);

    localStorage.setItem(this.emailKey, email);
    this.currentUserEmail.set(email);
    this.authenticated.set(true);
  }

  refreshToken(): Observable<TokenResponse> {
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
      .post<TokenResponse>(this.refreshApiUrl, requestBody)
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

  createProfile(profile: UserProfile): Observable<UserProfile> {
    return this.http.post<UserProfile>(this.profileApiUrl, profile);
  }

  saveProfile(profile: UserProfile): Observable<UserProfile> {
    return this.http.put<UserProfile>(this.profileApiUrl, profile);
  }
}
