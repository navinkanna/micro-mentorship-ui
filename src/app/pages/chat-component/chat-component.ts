import { CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth-service';
import { ChatService } from '../../services/chat-service';
import { AvatarIllustrationComponent } from '../../shared/avatar-illustration.component';

@Component({
  selector: 'app-chat-component',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, AvatarIllustrationComponent],
  templateUrl: './chat-component.html',
  styleUrl: './chat-component.scss'
})
export class ChatComponent implements OnDestroy {
  draftMessage = '';

  constructor(
    private router: Router,
    public auth: AuthService,
    public chat: ChatService
  ) {}

  async startChat() {
    await this.chat.startSearching();
  }

  async cancelSearch() {
    await this.chat.cancelSearch();
  }

  async sendMessage() {
    const message = this.draftMessage.trim();
    if (!message) {
      return;
    }

    await this.chat.sendMessage(message);
    this.draftMessage = '';
  }

  async endChat() {
    await this.chat.endChat();
  }

  async skipChat() {
    await this.chat.skipChat();
  }

  profile() {
    this.router.navigate(['/profile']);
  }

  home() {
    this.router.navigate(['/home']);
  }

  getPartnerDisplayName() {
    const partner = this.chat.partner();
    return partner ? this.chat.getParticipantDisplayName(partner) : '';
  }

  getMessageSenderName(senderUserId: number, senderName: string) {
    return this.chat.getMessageDisplayName({
      sessionId: this.chat.sessionId() ?? 0,
      senderUserId,
      senderName,
      content: '',
      sentAtUtc: ''
    });
  }

  async ngOnDestroy() {
    await this.chat.disconnect();
  }
}
