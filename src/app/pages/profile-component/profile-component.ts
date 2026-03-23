import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService, UserProfile } from '../../services/auth-service';
import { AvatarIllustrationComponent } from '../../shared/avatar-illustration.component';
import { avatarOptions } from '../../shared/avatar-options';

@Component({
  selector: 'app-profile-component',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, AvatarIllustrationComponent],
  templateUrl: './profile-component.html',
  styleUrl: './profile-component.scss'
})
export class ProfileComponent {
  readonly avatars = avatarOptions;
  readonly defaultAvatarId = avatarOptions[0].id;
  readonly form;
  isLoading = true;
  isSaving = false;
  profileExists = false;
  saveMessage = '';
  errorMessage = '';
  isAvatarPickerOpen = false;
  profileStats = {
    helpfulFeedbackCount: 0
  };

  constructor(private fb: FormBuilder, private router: Router, public auth: AuthService) {
    this.form = this.fb.group({
      avatarId: [avatarOptions[0].id, Validators.required],
      avatarMode: ['illustration'],
      profilePhotoUrl: [''],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      role: ['', Validators.required],
      expertise: [''],
      yearsOfExperience: [''],
      industry: [''],
      company: [''],
      location: [''],
      headline: [''],
      bio: [''],
      topics: ['']
    });
  }

  ngOnInit() {
    this.auth.getProfile().subscribe({
      next: (profile) => {
        this.profileStats = {
          helpfulFeedbackCount: profile.helpfulFeedbackCount || 0
        };
        this.form.patchValue({
          ...profile,
          avatarId: profile.avatarId || this.defaultAvatarId,
          avatarMode: profile.avatarMode || 'illustration',
          profilePhotoUrl: profile.profilePhotoUrl || ''
        });
        this.profileExists = true;
        this.isLoading = false;
      },
      error: () => {
        this.profileExists = false;
        this.isLoading = false;
      }
    });
  }

  backHome() {
    this.router.navigate(['/home']);
  }

  chat() {
    this.router.navigate(['/chat']);
  }

  selectAvatar(avatarId: string) {
    this.form.patchValue({ avatarId, avatarMode: 'illustration' });
    this.isAvatarPickerOpen = false;
  }

  selectProfilePhoto() {
    if (!this.hasProfilePhoto) {
      return;
    }

    this.form.patchValue({ avatarMode: 'photo' });
  }

  openAvatarPicker() {
    this.isAvatarPickerOpen = true;
  }

  closeAvatarPicker() {
    this.isAvatarPickerOpen = false;
  }

  get selectedAvatarId(): string {
    return this.form.value.avatarId || this.defaultAvatarId;
  }

  get selectedAvatarMode(): string {
    return this.form.value.avatarMode || 'illustration';
  }

  get profilePhotoUrl(): string {
    return this.form.value.profilePhotoUrl || '';
  }

  get hasProfilePhoto(): boolean {
    return Boolean(this.profilePhotoUrl);
  }

  saveProfile() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    this.saveMessage = '';
    this.errorMessage = '';

    const request$ = this.profileExists
      ? this.auth.saveProfile(this.form.getRawValue() as UserProfile)
      : this.auth.createProfile(this.form.getRawValue() as UserProfile);

    request$.subscribe({
      next: () => {
        this.isSaving = false;
        this.profileExists = true;
        this.router.navigate(['/home']);
      },
      error: () => {
        this.isSaving = false;
        this.errorMessage = 'Profile could not be saved.';
      }
    });
  }
}
