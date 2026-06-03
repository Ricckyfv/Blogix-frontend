import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AsyncPipe } from '@angular/common';
import { TagService } from '../../core/services/tag.service';
import { AuthService } from '../../core/services/auth.service';
import { Tag } from '../../core/models/types';
import { ConfirmModalComponent } from '../../components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-tags',
  standalone: true,
  imports: [FormsModule, RouterLink, AsyncPipe, ConfirmModalComponent],
  templateUrl: './tags.component.html'
})
export class TagsComponent implements OnInit {
  private tagService = inject(TagService);
  public authService = inject(AuthService);

  tags: Tag[] = [];
  isLoading = false;
  isSubmitting = false;
  errorMessage = '';

  // Modal and addition states
  isModalOpen = false;
  newTagsList: string[] = [];
  tagInput = '';

  // Confirm Modal state for deletion
  isDeleteModalOpen = false;
  tagToDelete: Tag | null = null;

  ngOnInit(): void {
    this.fetchTags();
  }

  fetchTags(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.tagService.getTags().subscribe({
      next: (res) => {
        this.tags = res;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'Could not load tags. Please try again later.';
        console.error(err);
      }
    });
  }

  openModal(): void {
    this.newTagsList = [];
    this.tagInput = '';
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.newTagsList = [];
    this.tagInput = '';
  }

  handleTagInputKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      const val = this.tagInput.trim().toLowerCase().replace(/,/g, '');
      if (val && !this.newTagsList.includes(val)) {
        this.newTagsList.push(val);
        this.tagInput = '';
      }
    } else if (event.key === 'Backspace' && !this.tagInput && this.newTagsList.length > 0) {
      this.newTagsList.pop();
    }
  }

  removeNewTag(tag: string): void {
    this.newTagsList = this.newTagsList.filter(t => t !== tag);
  }

  handleAddTags(): void {
    if (this.newTagsList.length === 0) return;

    this.isSubmitting = true;
    this.errorMessage = '';

    this.tagService.createTags(this.newTagsList).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.closeModal();
        this.fetchTags();
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err.message || 'Error saving tags.';
      }
    });
  }

  handleDelete(tag: Tag): void {
    if (tag.postCount && tag.postCount > 0) {
      alert('Cannot delete a tag associated with posts.');
      return;
    }

    this.tagToDelete = tag;
    this.isDeleteModalOpen = true;
  }

  onDeleteConfirmed(): void {
    if (!this.tagToDelete) return;
    const tag = this.tagToDelete;
    this.isDeleteModalOpen = false;
    this.tagToDelete = null;

    this.isLoading = true;
    this.tagService.deleteTag(tag.id).subscribe({
      next: () => {
        this.fetchTags();
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.message || 'Error deleting tag.';
      }
    });
  }
}
