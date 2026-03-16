import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class  AuthService {
  
  private apiUrl = '/api/Authorize/login';
  constructor(private http: HttpClient) {}

  login(payload: { username: string; password: string }): Observable<{accessToken: string; refreshToken: string}> {
    return this.http.post<{accessToken: string; refreshToken: string}>(this.apiUrl, payload);
  }

  storeTokens(tokens:{accessToken: string; refreshToken: string}): void {
    localStorage.setItem('access_Token', tokens.accessToken);
    localStorage.setItem('refresh_Token', tokens.refreshToken);
  }
  clearTokens(): void {
    localStorage.removeItem('access_Token');
    localStorage.removeItem('refresh_Token');
  }
}
