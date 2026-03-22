import { CommonModule } from '@angular/common';
import { AfterViewChecked, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
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
export class ChatComponent implements AfterViewChecked, OnDestroy, OnInit {
  @ViewChild('messageList') private messageListRef?: ElementRef<HTMLDivElement>;
  @ViewChild('composerInput') private composerInputRef?: ElementRef<HTMLTextAreaElement>;

  draftMessage = '';
  private previousMessageCount = 0;
  private previousState = '';

  constructor(
    private router: Router,
    public auth: AuthService,
    public chat: ChatService
  ) {}

  async ngOnInit() {
    await this.chat.preloadCurrentUserProfile();
  }

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

  async handleComposerKeydown(event: KeyboardEvent) {
    if (event.key !== 'Enter' || event.shiftKey) {
      return;
    }

    event.preventDefault();
    await this.sendMessage();
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

  getStarterPrompts() {
    return this.chat.getConversationStarterPrompts();
  }

  useStarterPrompt(prompt: string) {
    this.draftMessage = prompt;
    queueMicrotask(() => this.composerInputRef?.nativeElement.focus());
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

  isOwnMessage(senderUserId: number) {
    const partner = this.chat.partner();
    return partner ? senderUserId !== partner.userId : false;
  }

  ngAfterViewChecked() {
    const messageCount = this.chat.messages().length;
    const state = this.chat.state();

    if (messageCount !== this.previousMessageCount || state !== this.previousState) {
      this.previousMessageCount = messageCount;
      this.previousState = state;
      this.scrollMessagesToBottom();
    }
  }

  private scrollMessagesToBottom() {
    const messageList = this.messageListRef?.nativeElement;
    if (!messageList) {
      return;
    }

    messageList.scrollTop = messageList.scrollHeight;
  }

  async ngOnDestroy() {
    await this.chat.disconnect();
  }
}
