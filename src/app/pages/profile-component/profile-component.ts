import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, UserProfile } from '../../services/auth-service';

@Component({
  selector: 'app-profile-component',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile-component.html',
  styleUrl: './profile-component.scss'
})
export class ProfileComponent {
  readonly form;
  isLoading = true;
  isSaving = false;
  saveMessage = '';
  errorMessage = '';

  constructor(private fb: FormBuilder, private router: Router, public auth: AuthService) {
    this.form = this.fb.group({
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
        this.form.patchValue(profile);
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  backHome() {
    this.router.navigate(['/home']);
  }

  saveProfile() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    this.saveMessage = '';
    this.errorMessage = '';

    this.auth.saveProfile(this.form.getRawValue() as UserProfile).subscribe({
      next: () => {
        this.isSaving = false;
        this.saveMessage = 'Profile saved.';
      },
      error: () => {
        this.isSaving = false;
        this.errorMessage = 'Profile could not be saved. Add your API endpoint when ready.';
      }
    });
  }
}
