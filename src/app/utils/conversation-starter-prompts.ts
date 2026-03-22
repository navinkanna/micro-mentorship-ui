import { UserProfile } from '../services/auth-service';
import { ChatParticipant } from '../services/chat-service';

export function buildConversationStarterPrompts(
  currentUser: UserProfile | null,
  partner: ChatParticipant | null
): string[] {
  if (!currentUser || !partner) {
    return [];
  }

  const prompts = new Set<string>();
  const partnerRole = normalizeRole(partner.role);
  const currentUserRole = normalizeRole(currentUser.role);
  const primaryTopic = getPrimaryValue(partner.topics);
  const industry = partner.industry?.trim();
  const expertise = partner.expertise?.trim();

  if (currentUserRole === 'mentee') {
    prompts.add('Hi! I would love to learn what has been most valuable in your career growth so far.');
    prompts.add('What is one thing you wish someone had told you earlier in your career?');
    prompts.add(
      primaryTopic
        ? `I saw ${primaryTopic} on your profile. What is a strong way to get better at that?`
        : 'I am trying to level up professionally. What skill would you prioritize first?'
    );
  } else {
    prompts.add('Hi! What would make this conversation most useful for you today?');
    prompts.add('What are you currently working on, and where are you feeling stuck?');
    prompts.add(
      primaryTopic
        ? `What sparked your interest in ${primaryTopic}?`
        : 'What kind of guidance or perspective are you hoping to get from this chat?'
    );
  }

  if (industry) {
    prompts.add(`How has working in ${industry} shaped the way you approach your career?`);
  }

  if (expertise && partnerRole === 'mentor') {
    prompts.add(`How did you build confidence in ${expertise}?`);
  }

  if (currentUser.headline?.trim()) {
    prompts.add('What is one small next step we could help each other clarify before this chat ends?');
  }

  return Array.from(prompts).slice(0, 4);
}

function getPrimaryValue(commaSeparatedValues: string | undefined): string {
  return commaSeparatedValues?.split(',').map((value) => value.trim()).find(Boolean) ?? '';
}

function normalizeRole(role: string | undefined): 'mentor' | 'mentee' {
  return role?.trim().toLowerCase() === 'mentor' ? 'mentor' : 'mentee';
}
