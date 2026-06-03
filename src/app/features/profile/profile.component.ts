import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { Author } from '../../core/models/types';
import { ConfirmModalComponent } from '../../components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ConfirmModalComponent],
  templateUrl: './profile.component.html'
})
export class ProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private router = inject(Router);

  profileForm!: FormGroup;
  isLoading = false;
  isSaving = false;
  errorMessage = '';
  successMessage = '';

  // Modal de Eliminación Reutilizable
  isDeleteModalOpen = false;

  ngOnInit(): void {
    this.profileForm = this.fb.group({
      id: [''],
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: [{ value: '', disabled: true }],
      description: ['', [Validators.required, Validators.maxLength(500)]],
      profileImage: ['']
    });

    this.loadProfileData();
  }

  loadProfileData(): void {
    this.isLoading = true;
    this.userService.getMyProfile().subscribe({
      next: (profile) => {
        this.profileForm.patchValue({
          id: profile.id,
          name: profile.name,
          email: profile.email || '',
          description: profile.description || '',
          profileImage: profile.profileImage || ''
        });
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Error loading profile data.';
        this.isLoading = false;
      }
    });
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
            const compressed = canvas.toDataURL('image/jpeg', 0.7);
            this.profileForm.patchValue({ profileImage: compressed });
          }
        };
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    if (this.profileForm.invalid) {
      this.errorMessage = 'Please fill in all fields correctly.';
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';
    this.successMessage = '';

    // El email está deshabilitado en el formGroup, por lo que se obtiene con getRawValue
    const formValue = this.profileForm.getRawValue();
    const updatedProfile: Author = {
      id: formValue.id,
      name: formValue.name,
      description: formValue.description,
      profileImage: formValue.profileImage,
      email: formValue.email
    };

    this.userService.updateProfile(updatedProfile).subscribe({
      next: (updated) => {
        this.isSaving = false;
        this.successMessage = 'Profile updated successfully!';
        this.authService.updateCurrentUserDetails(updated.name, updated.profileImage || null, updated.description || null);
      },
      error: (err) => {
        this.isSaving = false;
        this.errorMessage = err.message || 'Error updating profile.';
      }
    });
  }

  onDeleteAccountConfirmed(): void {
    this.isDeleteModalOpen = false;
    this.isLoading = true;
    this.userService.deleteAccount().subscribe({
      next: () => {
        this.isLoading = false;
        this.authService.logout();
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.message || 'Could not delete account. Please try again.';
      }
    });
  }
}
