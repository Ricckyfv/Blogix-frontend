import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html'
})
export class RegisterComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  registerForm!: FormGroup;
  isLoading = false;
  errorMessage = '';

  avatars = [
    'https://api.dicebear.com/7.x/adventurer/svg?seed=Felix',
    'https://api.dicebear.com/7.x/adventurer/svg?seed=Aneka',
    'https://api.dicebear.com/7.x/adventurer/svg?seed=Jude',
    'https://api.dicebear.com/7.x/adventurer/svg?seed=Buster',
    'https://api.dicebear.com/7.x/adventurer/svg?seed=Garrett',
    'https://api.dicebear.com/7.x/adventurer/svg?seed=Luna'
  ];

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      birthDate: ['', [Validators.required]],
      description: ['', [Validators.required, Validators.maxLength(500)]],
      profileImage: [this.avatars[0], [Validators.required]],
      acceptedTerms: [false, [Validators.requiredTrue]]
    });
  }

  selectAvatar(avatarUrl: string): void {
    this.registerForm.patchValue({ profileImage: avatarUrl });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        this.errorMessage = 'Please select a valid image file.';
        return;
      }

      this.errorMessage = '';
      const reader = new FileReader();

      reader.onload = () => {
        const img = new Image();
        img.src = reader.result as string;

        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const targetSize = 200;
          canvas.width = targetSize;
          canvas.height = targetSize;

          if (ctx) {
            const scale = Math.max(targetSize / img.width, targetSize / img.height);
            const x = (targetSize - img.width * scale) / 2;
            const y = (targetSize - img.height * scale) / 2;

            ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
            this.registerForm.patchValue({ profileImage: compressedBase64 });
            console.log('Peso optimizado con éxito');
          }
        };
      };

      reader.onerror = () => {
        this.errorMessage = 'Error reading the image file.';
      };

      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.errorMessage = 'Please complete all required fields correctly.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const { acceptedTerms, ...registerData } = this.registerForm.value;

    this.authService.register(registerData).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.message || 'Error creating account. Please try again.';
      }
    });
  }
}
