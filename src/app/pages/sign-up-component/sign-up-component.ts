import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sign-up-component',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './sign-up-component.html',
  styleUrl: './sign-up-component.scss'
})
export class SignUpComponent {
  isLoading = false;
  form: any;
  private linkedInClientId = '869337zcs01g5k';
  private redirectUri = 'http://localhost:4200/auth/linkedin/callback';

  constructor(private fb: FormBuilder, private router: Router) {}

  ngOnInit() {
    this.form = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  backToHome() {
    this.router.navigate(['/home']);
  }

  login() {
    this.router.navigate(['/login']);
  }

  loginWithLinkedIn() {
    const linkedInAuthUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${this.linkedInClientId}&redirect_uri=${encodeURIComponent(this.redirectUri)}&scope=r_liteprofile`;
    window.location.href = linkedInAuthUrl;
  }

  async submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Signup successful!', this.form.value);
      alert('Account created! (Demo)');
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Signup failed', error);
      alert('Signup failed! (Demo)');
    } finally {
      this.isLoading = false;
    }
  }
}
