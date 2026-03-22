import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth-service';
import {
  RecentChatService,
  RecentChatTranscript,
  TranscriptMessage
} from '../../services/recent-chat-service';
import { AvatarIllustrationComponent } from '../../shared/avatar-illustration.component';
import { getChatDisplayName } from '../../utils/chat-display-name';

@Component({
  selector: 'app-transcript-detail-component',
  standalone: true,
  imports: [CommonModule, RouterModule, AvatarIllustrationComponent],
  templateUrl: './transcript-detail-component.html',
  styleUrl: './transcript-detail-component.scss'
})
export class TranscriptDetailComponent implements OnInit {
  transcript: RecentChatTranscript | null = null;
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public auth: AuthService,
    private recentChatService: RecentChatService
  ) {}

  ngOnInit() {
    const sessionId = Number(this.route.snapshot.paramMap.get('sessionId'));
    if (!sessionId) {
      this.router.navigate(['/recent-chats']);
      return;
    }

    this.recentChatService.getTranscript(sessionId).subscribe({
      next: (transcript) => {
        this.transcript = transcript;
        this.isLoading = false;
      },
      error: () => {
        this.transcript = null;
        this.isLoading = false;
      }
    });
  }

  backToRecentChats() {
    this.router.navigate(['/recent-chats']);
  }

  getPartnerDisplayName() {
    if (!this.transcript) {
      return '';
    }

    return getChatDisplayName({
      userId: this.transcript.partnerUserId,
      role: this.transcript.partnerRole,
      firstName: this.transcript.partnerFirstName,
      lastName: this.transcript.partnerLastName
    });
  }

  isOwnMessage(message: TranscriptMessage) {
    return this.transcript ? message.senderUserId !== this.transcript.partnerUserId : false;
  }

  getMessageSenderName(message: TranscriptMessage) {
    return this.isOwnMessage(message) ? 'You' : this.getPartnerDisplayName();
  }
}
