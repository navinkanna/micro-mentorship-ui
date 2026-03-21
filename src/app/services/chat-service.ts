import { Injectable, signal } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { firstValueFrom } from 'rxjs';
import { AuthService, UserProfile } from './auth-service';
import { environment } from '../../environments/environment';
import { getChatDisplayName, getOppositeRole } from '../utils/chat-display-name';

export type ChatViewState =
  | 'idle'
  | 'connecting'
  | 'searching'
  | 'matched'
  | 'ended'
  | 'error';

export interface ChatParticipant {
  userId: number;
  userName: string;
  role: string;
  avatarId: string;
  firstName: string;
  lastName: string;
  headline: string;
  expertise: string;
  industry: string;
  topics: string;
}

export interface ChatMessage {
  sessionId: number;
  senderUserId: number;
  senderName: string;
  content: string;
  sentAtUtc: string;
}

interface ChatMatchFound {
  sessionId: number;
  partner: ChatParticipant;
  startedAtUtc: string;
}

interface ChatQueueState {
  state: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private connection: signalR.HubConnection | null = null;
  private isConfigured = false;
  private readonly currentUserProfile = signal<UserProfile | null>(null);

  readonly state = signal<ChatViewState>('idle');
  readonly statusMessage = signal('Ready when you are.');
  readonly sessionId = signal<number | null>(null);
  readonly partner = signal<ChatParticipant | null>(null);
  readonly messages = signal<ChatMessage[]>([]);

  constructor(private auth: AuthService) {}

  async startSearching(): Promise<void> {
    this.state.set('connecting');
    this.statusMessage.set('Connecting to live chat...');

    try {
      await this.ensureCurrentUserProfile();
      await this.ensureConnection();
      await this.connection?.invoke('JoinQueue');
    } catch (error) {
      this.handleError(error, 'Unable to start chat search.');
    }
  }

  async cancelSearch(): Promise<void> {
    if (!this.connection) {
      this.resetToIdle('Search cancelled.');
      return;
    }

    try {
      await this.connection.invoke('CancelQueue');
    } catch (error) {
      this.handleError(error, 'Unable to cancel search.');
    }
  }

  async sendMessage(content: string): Promise<void> {
    const sessionId = this.sessionId();
    const trimmed = content.trim();
    if (!trimmed || !sessionId || !this.connection) {
      return;
    }

    try {
      await this.connection.invoke('SendMessage', sessionId, trimmed);
    } catch (error) {
      this.handleError(error, 'Unable to send the message.');
    }
  }

  async endChat(): Promise<void> {
    if (!this.connection) {
      this.resetToIdle('Chat ended.');
      return;
    }

    try {
      await this.connection.invoke('EndChat');
    } catch (error) {
      this.handleError(error, 'Unable to end the chat.');
    }
  }

  async skipChat(): Promise<void> {
    if (!this.connection) {
      return;
    }

    this.state.set('searching');
    this.statusMessage.set('Looking for another match...');
    this.partner.set(null);
    this.sessionId.set(null);
    this.messages.set([]);

    try {
      await this.connection.invoke('SkipChat');
    } catch (error) {
      this.handleError(error, 'Unable to skip this chat.');
    }
  }

  async disconnect(): Promise<void> {
    if (!this.connection) {
      this.resetToIdle('Disconnected.');
      return;
    }

    const activeSessionId = this.sessionId();
    try {
      if (activeSessionId) {
        await this.connection.invoke('EndChat');
      } else if (this.state() === 'searching') {
        await this.connection.invoke('CancelQueue');
      }
    } catch {
      // Best-effort cleanup before stopping the connection.
    }

    await this.connection.stop();
    this.connection = null;
    this.isConfigured = false;
    this.resetToIdle('Disconnected.');
  }

  private async ensureConnection(): Promise<void> {
    if (!this.connection) {
      this.connection = new signalR.HubConnectionBuilder()
        .withUrl(environment.chatHubUrl, {
          accessTokenFactory: () => this.auth.getAccessToken() ?? ''
        })
        .withAutomaticReconnect()
        .build();
    }

    if (!this.isConfigured) {
      this.registerHandlers(this.connection);
      this.isConfigured = true;
    }

    if (this.connection.state === signalR.HubConnectionState.Disconnected) {
      await this.connection.start();
    }
  }

  private registerHandlers(connection: signalR.HubConnection) {
    connection.on('QueueJoined', (payload: ChatQueueState) => {
      this.state.set('searching');
      this.statusMessage.set(payload.message || 'Looking for a match...');
      this.sessionId.set(null);
      this.partner.set(null);
      this.messages.set([]);
    });

    connection.on('QueueCancelled', (payload: ChatQueueState) => {
      this.resetToIdle(this.sanitizeStatusMessage(payload.message || 'Search cancelled.'));
    });

    connection.on('MatchFound', (payload: ChatMatchFound) => {
      this.state.set('matched');
      this.statusMessage.set('You are matched. Say hello.');
      this.sessionId.set(payload.sessionId);
      this.partner.set(payload.partner);
      this.messages.set([]);
    });

    connection.on('ReceiveMessage', (payload: ChatMessage) => {
      this.messages.update((messages) => [
        ...messages,
        {
          ...payload,
          senderName: this.getMessageDisplayName(payload)
        }
      ]);
    });

    connection.on('ChatEnded', (payload: ChatQueueState) => {
      this.state.set('ended');
      this.statusMessage.set(this.sanitizeStatusMessage(payload.message || 'The chat has ended.'));
      this.sessionId.set(null);
      this.partner.set(null);
    });

    connection.onreconnecting(() => {
      this.state.set('connecting');
      this.statusMessage.set('Reconnecting...');
      return Promise.resolve();
    });

    connection.onreconnected(() => {
      if (this.sessionId()) {
        this.state.set('matched');
        this.statusMessage.set('Reconnected to chat.');
      } else {
        this.state.set('idle');
        this.statusMessage.set('Connection restored. Start a new chat when ready.');
      }

      return Promise.resolve();
    });

    connection.onclose(() => {
      this.connection = null;
      this.isConfigured = false;

      if (this.state() !== 'error') {
        this.resetToIdle('Connection closed.');
      }

      return Promise.resolve();
    });
  }

  private resetToIdle(message: string) {
    this.state.set('idle');
    this.statusMessage.set(message);
    this.sessionId.set(null);
    this.partner.set(null);
    this.messages.set([]);
  }

  private handleError(error: unknown, fallbackMessage: string) {
    const message =
      typeof error === 'object' &&
      error !== null &&
      'message' in error &&
      typeof error.message === 'string'
        ? error.message
        : fallbackMessage;

    this.state.set('error');
    this.statusMessage.set(this.sanitizeStatusMessage(message));
  }

  getParticipantDisplayName(participant: ChatParticipant): string {
    return getChatDisplayName(participant);
  }

  getMessageDisplayName(message: ChatMessage): string {
    const partner = this.partner();

    if (partner && message.senderUserId === partner.userId) {
      return this.getParticipantDisplayName(partner);
    }

    const profile = this.currentUserProfile();
    if (profile) {
      return getChatDisplayName({
        userId: message.senderUserId,
        role: profile.role,
        firstName: profile.firstName,
        lastName: profile.lastName
      });
    }

    return getChatDisplayName({
      userId: message.senderUserId,
      role: getOppositeRole(partner?.role),
      firstName: '',
      lastName: ''
    });
  }

  private sanitizeStatusMessage(message: string): string {
    let sanitizedMessage = message;
    const currentUserEmail = this.auth.userEmail();

    if (currentUserEmail) {
      sanitizedMessage = sanitizedMessage.replaceAll(currentUserEmail, 'You');
    }

    const partner = this.partner();
    if (partner?.userName) {
      sanitizedMessage = sanitizedMessage.replaceAll(
        partner.userName,
        this.getParticipantDisplayName(partner)
      );
    }

    return sanitizedMessage;
  }

  private async ensureCurrentUserProfile(): Promise<void> {
    if (this.currentUserProfile()) {
      return;
    }

    try {
      const profile = await firstValueFrom(this.auth.getProfile());
      this.currentUserProfile.set(profile);
    } catch {
      this.currentUserProfile.set(null);
    }
  }
}
