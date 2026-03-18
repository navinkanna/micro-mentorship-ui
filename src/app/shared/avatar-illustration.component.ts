import { Component, computed, input } from '@angular/core';
import { avatarSheetPath, getAvatarOption } from './avatar-options';

@Component({
  selector: 'app-avatar-illustration',
  standalone: true,
  template: `
    <div class="avatar-svg" [style.width.px]="size()" [style.height.px]="size()">
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
    </div>
  `,
  styles: [
    `
      .avatar-svg {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
      }

      .avatar-svg :where(svg) {
        display: block;
        width: 100%;
        height: 100%;
      }
    `
  ]
})
export class AvatarIllustrationComponent {
  readonly avatarId = input<string | undefined>();
  readonly size = input(96);
  readonly sheetPath = avatarSheetPath;
  readonly avatar = computed(() => getAvatarOption(this.avatarId()));
  readonly viewBox = computed(() => {
    const avatar = this.avatar();
    return `${avatar.cropX} ${avatar.cropY} ${avatar.cropSize} ${avatar.cropSize}`;
  });
}
