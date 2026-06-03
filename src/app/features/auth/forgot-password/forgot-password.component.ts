import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule],
  templateUrl: './forgot-password.component.html'
})
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  forgotForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  isLoading = false;
  successMessage = '';
  errorMessage = '';

  onSubmit(): void {
    if (this.forgotForm.invalid) {
      this.errorMessage = 'Please provide a valid email address.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.forgotPassword(this.forgotForm.value.email).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'If this email address exists in our database, we have sent a secure recovery link to it. Please check your inbox (and spam folder) within the next 15 minutes.';
      },
      error: (err) => {
        this.isLoading = false;
        // Even if user does not exist, standard practice is to show success or friendly error.
        // We will output any backend validation error, or fall back.
        this.errorMessage = err.message || 'Unable to process request. Please try again later.';
      }
    });
  }
}
