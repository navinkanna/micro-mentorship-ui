const mentorAliases = [
  'Captain Commit',
  'Stack Sensei',
  'Kernel Owl',
  'Byte Beacon',
  'Cloud Captain',
  'Circuit Fox',
  'Pixel Sage',
  'Query Wizard'
];

const menteeAliases = [
  'Byte Sprout',
  'Stack Scout',
  'Cache Cub',
  'Pixel Rookie',
  'Query Spark',
  'Neon Newbie',
  'Curious Coder',
  'Bug Hunter'
];

export interface ChatIdentityLike {
  userId: number;
  role?: string;
  firstName?: string;
  lastName?: string;
}

export function getChatDisplayName(identity: ChatIdentityLike): string {
  const firstName = identity.firstName?.trim() ?? '';
  const lastName = identity.lastName?.trim() ?? '';
  const fullName = `${firstName} ${lastName}`.trim();

  if (fullName) {
    return fullName;
  }

  return getChatAlias(identity.role, identity.userId);
}

export function getChatAlias(role: string | undefined, userId: number): string {
  const aliases = normalizeRole(role) === 'mentor' ? mentorAliases : menteeAliases;
  return aliases[Math.abs(userId) % aliases.length];
}

export function getOppositeRole(role: string | undefined): 'mentor' | 'mentee' {
  return normalizeRole(role) === 'mentor' ? 'mentee' : 'mentor';
}

function normalizeRole(role: string | undefined): 'mentor' | 'mentee' {
  return role?.trim().toLowerCase() === 'mentor' ? 'mentor' : 'mentee';
}
