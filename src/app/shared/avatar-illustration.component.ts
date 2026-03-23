import { Component, computed, input } from '@angular/core';
import { avatarSheetPath, getAvatarOption } from './avatar-options';

@Component({
  selector: 'app-avatar-illustration',
  standalone: true,
  template: `
    <div class="avatar-svg" [style.width.px]="size()" [style.height.px]="size()">
      @if (shouldShowPhoto()) {
        <img class="avatar-photo" [src]="profilePhotoUrl()!" alt="Profile photo" />
      } @else {
        <svg
          [attr.viewBox]="viewBox()"
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          [attr.role]="'img'"
          [attr.aria-label]="avatar().label"
          preserveAspectRatio="xMidYMid slice"
        >
          <image [attr.href]="sheetPath" [attr.xlink:href]="sheetPath" width="800" height="800" />
        </svg>
      }
    </div>
  `,
  styles: [
    `
      .avatar-svg {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.85);
      }

      .avatar-svg :where(svg),
      .avatar-photo {
        display: block;
        width: 100%;
        height: 100%;
      }

      .avatar-photo {
        object-fit: cover;
      }
    `
  ]
})
export class AvatarIllustrationComponent {
  readonly avatarId = input<string | undefined>();
  readonly avatarMode = input<string | undefined>();
  readonly profilePhotoUrl = input<string | null | undefined>();
  readonly size = input(96);
  readonly sheetPath = avatarSheetPath;
  readonly avatar = computed(() => getAvatarOption(this.avatarId()));
  readonly shouldShowPhoto = computed(() =>
    this.avatarMode() === 'photo' && Boolean(this.profilePhotoUrl())
  );
  readonly viewBox = computed(() => {
    const avatar = this.avatar();
    return `${avatar.cropX} ${avatar.cropY} ${avatar.cropSize} ${avatar.cropSize}`;
  });
}
