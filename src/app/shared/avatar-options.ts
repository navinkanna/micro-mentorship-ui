export interface AvatarOption {
  id: string;
  label: string;
  cropX: number;
  cropY: number;
  cropSize: number;
}

export const avatarSheetPath = '/avatars-sheet.svg?v=20260317-1';

export const avatarOptions: AvatarOption[] = [
  { id: 'sprout', label: 'Sprout', cropX: 71, cropY: 39, cropSize: 190 },
  { id: 'pebble', label: 'Pebble', cropX: 305, cropY: 39, cropSize: 190 },
  { id: 'cocoa', label: 'Cocoa', cropX: 538, cropY: 39, cropSize: 190 },
  { id: 'sunbeam', label: 'Sunbeam', cropX: 71, cropY: 284, cropSize: 190 },
  { id: 'minty', label: 'Minty', cropX: 305, cropY: 282, cropSize: 190 },
  { id: 'berry', label: 'Berry', cropX: 537, cropY: 282, cropSize: 190 },
  { id: 'harbor', label: 'Harbor', cropX: 72, cropY: 526, cropSize: 190 },
  { id: 'violet', label: 'Violet', cropX: 305, cropY: 526, cropSize: 190 },
  { id: 'nova', label: 'Nova', cropX: 537, cropY: 526, cropSize: 190 }
];

export function getAvatarOption(avatarId?: string): AvatarOption {
  return avatarOptions.find((option) => option.id === avatarId) ?? avatarOptions[0];
}
