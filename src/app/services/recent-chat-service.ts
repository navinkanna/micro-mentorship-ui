import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface RecentChatSummary {
  sessionId: number;
  partnerUserId: number;
  partnerUserName: string;
  partnerRole: string;
  partnerAvatarId: string;
  partnerFirstName: string;
  partnerLastName: string;
  partnerHeadline: string;
  lastMessagePreview: string;
  lastMessageSentAtUtc: string | null;
  messageCount: number;
  startedAtUtc: string;
  endedAtUtc: string | null;
}

export interface TranscriptMessage {
  senderUserId: number;
  content: string;
  sentAtUtc: string;
}

export interface RecentChatTranscript {
  sessionId: number;
  partnerUserId: number;
  partnerUserName: string;
  partnerRole: string;
  partnerAvatarId: string;
  partnerFirstName: string;
  partnerLastName: string;
  partnerHeadline: string;
  startedAtUtc: string;
  endedAtUtc: string | null;
  messages: TranscriptMessage[];
}

@Injectable({
  providedIn: 'root'
})
export class RecentChatService {
  private readonly recentChatsApiUrl = `${environment.apiBaseUrl}/ChatHistory/recent`;

  constructor(private http: HttpClient) {}

  getRecentChats(): Observable<RecentChatSummary[]> {
    return this.http.get<RecentChatSummary[]>(this.recentChatsApiUrl);
  }

  getTranscript(sessionId: number): Observable<RecentChatTranscript> {
    return this.http.get<RecentChatTranscript>(`${this.recentChatsApiUrl}/${sessionId}`);
  }
}
