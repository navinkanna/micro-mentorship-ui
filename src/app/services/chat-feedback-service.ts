import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface SubmitChatFeedbackPayload {
  sessionId: number;
  wasHelpful: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ChatFeedbackService {
  private readonly chatFeedbackApiUrl = `${environment.apiBaseUrl}/ChatFeedback`;

  constructor(private http: HttpClient) {}

  submitFeedback(payload: SubmitChatFeedbackPayload): Observable<string> {
    return this.http.post(this.chatFeedbackApiUrl, payload, { responseType: 'text' });
  }
}
