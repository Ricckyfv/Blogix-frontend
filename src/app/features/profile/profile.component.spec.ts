import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ProfileComponent } from './profile.component';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { Author } from '../../core/models/types';
import { ConfirmModalComponent } from '../../components/confirm-modal/confirm-modal.component';

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;
  let mockUserService: jasmine.SpyObj<UserService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;

  const mockProfile: Author = {
    id: 'user-123',
    name: 'Ricardo Fernandez',
    email: 'ricardo@test.com',
    description: 'Senior Software Engineer',
    profileImage: 'avatar-url'
  };

  beforeEach(async () => {
    mockUserService = jasmine.createSpyObj('UserService', ['getMyProfile', 'updateProfile', 'deleteAccount']);
    mockAuthService = jasmine.createSpyObj('AuthService', ['logout']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    // Set up default return values for the mocks
    mockUserService.getMyProfile.and.returnValue(of(mockProfile));

    await TestBed.configureTestingModule({
      imports: [ProfileComponent, ReactiveFormsModule, ConfirmModalComponent],
      providers: [
        { provide: UserService, useValue: mockUserService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
  });

  it('should create the component and fetch profile data on init', () => {
    fixture.detectChanges(); // Trigger ngOnInit and lifecycle hook

    expect(component).toBeTruthy();
    expect(mockUserService.getMyProfile).toHaveBeenCalled();
    expect(component.profileForm.get('id')?.value).toBe('user-123');
    expect(component.profileForm.get('name')?.value).toBe('Ricardo Fernandez');
    expect(component.profileForm.get('email')?.value).toBe('ricardo@test.com');
  });

  it('should invalidate form if name or description is empty', () => {
    fixture.detectChanges();

    const nameControl = component.profileForm.get('name');
    nameControl?.setValue('');
    expect(component.profileForm.invalid).toBeTrue();

    nameControl?.setValue('A'); // Too short (min length 2)
    expect(component.profileForm.invalid).toBeTrue();

    nameControl?.setValue('Ricardo');
    const descControl = component.profileForm.get('description');
    descControl?.setValue('');
    expect(component.profileForm.invalid).toBeTrue();
  });

  it('should save profile successfully when submitting valid form', () => {
    mockUserService.updateProfile.and.returnValue(of(mockProfile));
    fixture.detectChanges();

    component.profileForm.get('name')?.setValue('Ricardo V');
    component.profileForm.get('description')?.setValue('Professional Angular Architect');
    
    component.onSubmit();

    expect(component.isSaving).toBeFalse();
    expect(mockUserService.updateProfile).toHaveBeenCalled();
    expect(component.successMessage).toBe('¡Perfil actualizado con éxito!');
  });

  it('should open delete confirm modal and trigger deletion on confirm', () => {
    mockUserService.deleteAccount.and.returnValue(of(undefined));
    fixture.detectChanges();

    // Trigger delete flow
    component.isDeleteModalOpen = true;
    component.onDeleteAccountConfirmed();

    expect(mockUserService.deleteAccount).toHaveBeenCalled();
    expect(mockAuthService.logout).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
  });
});
