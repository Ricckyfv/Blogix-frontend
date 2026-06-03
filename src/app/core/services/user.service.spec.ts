import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UserService } from './user.service';
import { Author } from '../models/types';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  const mockProfile: Author = {
    id: 'user-123',
    name: 'Ricardo',
    description: 'Developer',
    profileImage: 'image-data',
    email: 'ricardo@test.com'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UserService]
    });
    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Ensure no outstanding requests
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch user profile (getMyProfile)', () => {
    service.getMyProfile().subscribe((profile) => {
      expect(profile).toBeTruthy();
      expect(profile.name).toBe('Ricardo');
      expect(profile.email).toBe('ricardo@test.com');
    });

    const req = httpMock.expectOne('http://localhost:8080/api/v1/users/me');
    expect(req.request.method).toBe('GET');
    req.flush(mockProfile);
  });

  it('should update user profile (updateProfile)', () => {
    service.updateProfile(mockProfile).subscribe((profile) => {
      expect(profile).toBeTruthy();
      expect(profile.name).toBe('Ricardo');
    });

    const req = httpMock.expectOne('http://localhost:8080/api/v1/users/me');
    expect(req.request.method).toBe('PUT');
    req.flush(mockProfile);
  });

  it('should delete account (deleteAccount)', () => {
    service.deleteAccount().subscribe(() => {
      // Deletion succeeded
    });

    const req = httpMock.expectOne('http://localhost:8080/api/v1/users/me');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
