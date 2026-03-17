import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-login-component',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login-component.html',
  styleUrl: './login-component.scss'
})
export class LoginComponent {
  isSubmitting = false;
  errorMessage = '';

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {}
  form: any;

  ngOnInit() {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  submit() {
    if (this.form.valid) {
      this.isSubmitting = true;
      this.errorMessage = '';

      const payload = {
        username: this.form.value.email,
        password: this.form.value.password
      };

      this.auth.login(payload).subscribe({
        next: (tokens) => {
          this.auth.storeSession(payload.username, tokens);
          this.isSubmitting = false;
          this.router.navigate(['/home']);
        },
        error: (err) => {
          this.isSubmitting = false;
          console.error('Login failed', err);
          this.errorMessage = 'Login failed. Check your credentials and try again.';
        }
      });
    } else {
      this.form.markAllAsTouched();
      return;
    }
  }
}
