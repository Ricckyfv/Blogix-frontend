import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { AuthService } from './core/services/auth.service';
import { UserService } from './core/services/user.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, AsyncPipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  private router = inject(Router);
  public authService = inject(AuthService);
  private userService = inject(UserService);

  // States
  isMobileMenuOpen = false;
  isProfileDropdownOpen = false;
  isMobileProfileOpen = false;
  isDarkTheme = false;

  ngOnInit(): void {
    this.initializeTheme();
    this.fetchFreshUserProfile();
  }

  initializeTheme(): void {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
    this.isDarkTheme = true;
  }

  fetchFreshUserProfile(): void {
    if (this.authService.isAuthenticated()) {
      this.userService.getMyProfile().subscribe({
        next: (profile) => {
          this.authService.updateCurrentUserDetails(
            profile.name,
            profile.profileImage || null,
            profile.description || null
          );
        },
        error: (err) => console.error('Failed to load fresh user profile:', err)
      });
    }
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  toggleProfileDropdown(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.isProfileDropdownOpen = !this.isProfileDropdownOpen;
    if (this.isProfileDropdownOpen) {
      this.isMobileProfileOpen = false;
    }
  }

  toggleMobileProfileDropdown(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.isMobileProfileOpen = !this.isMobileProfileOpen;
    if (this.isMobileProfileOpen) {
      this.isProfileDropdownOpen = false;
    }
  }

  closeDropdowns(): void {
    this.isProfileDropdownOpen = false;
    this.isMobileProfileOpen = false;
  }

  onLogout(): void {
    this.isProfileDropdownOpen = false;
    this.isMobileProfileOpen = false;
    this.isMobileMenuOpen = false;
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
