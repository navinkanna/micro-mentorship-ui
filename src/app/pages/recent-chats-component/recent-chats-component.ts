import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth-service';
import { RecentChatService, RecentChatSummary } from '../../services/recent-chat-service';
import { AvatarIllustrationComponent } from '../../shared/avatar-illustration.component';
import { getChatDisplayName } from '../../utils/chat-display-name';

@Component({
  selector: 'app-recent-chats-component',
  standalone: true,
  imports: [CommonModule, RouterModule, AvatarIllustrationComponent],
  templateUrl: './recent-chats-component.html',
  styleUrl: './recent-chats-component.scss'
})
export class RecentChatsComponent implements OnInit {
  recentChats: RecentChatSummary[] = [];
  isLoading = true;

  constructor(
    private router: Router,
    public auth: AuthService,
    private recentChatService: RecentChatService
  ) {}

  ngOnInit() {
    this.loadRecentChats();
  }

  home() {
    this.router.navigate(['/home']);
  }

  chat() {
    this.router.navigate(['/chat']);
  }

  openTranscript(sessionId: number) {
    this.router.navigate(['/recent-chats', sessionId]);
  }

  getPartnerDisplayName(chat: RecentChatSummary) {
    return getChatDisplayName({
      userId: chat.partnerUserId,
      role: chat.partnerRole,
      firstName: chat.partnerFirstName,
      lastName: chat.partnerLastName
    });
  }

  private loadRecentChats() {
    this.isLoading = true;
    this.recentChatService.getRecentChats().subscribe({
      next: (recentChats) => {
        this.recentChats = recentChats;
        this.isLoading = false;
      },
      error: () => {
        this.recentChats = [];
        this.isLoading = false;
      }
    });
  }
}
