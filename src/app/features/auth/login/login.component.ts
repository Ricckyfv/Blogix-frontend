import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

declare var google: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm!: FormGroup;
  isLoading = false;
  errorMessage = '';

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
    this.initGoogleSSO();
  }

  initGoogleSSO(retries = 0): void {
    if (typeof google !== 'undefined') {
      google.accounts.id.initialize({
        client_id: '799849990519-iq2kqh4lguasovp9n48mclj8n9u7noa5.apps.googleusercontent.com',
        callback: (response: any) => this.handleGoogleCredentialResponse(response)
      });

      google.accounts.id.renderButton(
        document.getElementById('google-btn-container'),
        {
          theme: 'filled_dark',
          size: 'large',
          text: 'continue_with',
          width: 376,
          shape: 'rectangular'
        }
      );
    } else if (retries < 10) {
      setTimeout(() => this.initGoogleSSO(retries + 1), 100);
    }
  }

  handleGoogleCredentialResponse(response: any): void {
    if (response && response.credential) {
      this.isLoading = true;
      this.errorMessage = '';
      this.authService.loginWithGoogle(response.credential).subscribe({
        next: () => {
          this.isLoading = false;
          this.router.navigate(['/posts']);
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = err.message || 'Failed to authenticate with Google.';
        }
      });
    }
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.errorMessage = 'Please fill in all fields correctly.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/posts']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.message || 'Authentication error. Please verify your credentials.';
      }
    });
  }
}
