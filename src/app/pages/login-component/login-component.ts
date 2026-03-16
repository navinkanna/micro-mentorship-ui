import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-login-component',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login-component.html',
  styleUrl: './login-component.scss'
})
export class LoginComponent {
  constructor(private fb: FormBuilder, private auth: AuthService) {}
  form: any;

  ngOnInit() {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  submit() {
    if (this.form.valid) {
      const payload = {
        username: this.form.value.email,
        password: this.form.value.password
      }
      this.auth.login(payload).subscribe({
        next: (tokens) => {
          this.auth.storeTokens(tokens);
          alert('Login successful!');
        },
        error: (err) => {
          console.error('Login failed', err);
          alert('Login failed. Please try again.');
        }
      });
    } else {
      console.log('Form is invalid');
      this.form.markAllAsTouched(); // Mark all fields as touched to trigger validation messages
      return;
    }
  }
}
