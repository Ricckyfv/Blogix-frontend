import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AsyncPipe } from '@angular/common';
import { CategoryService } from '../../core/services/category.service';
import { AuthService } from '../../core/services/auth.service';
import { Category } from '../../core/models/types';
import { ConfirmModalComponent } from '../../components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [FormsModule, RouterLink, AsyncPipe, ConfirmModalComponent],
  templateUrl: './categories.component.html'
})
export class CategoriesComponent implements OnInit {
  private categoryService = inject(CategoryService);
  public authService = inject(AuthService);

  categories: Category[] = [];
  isLoading = false;
  isSubmitting = false;
  errorMessage = '';

  // Modal State
  isModalOpen = false;
  editingCategory: Category | null = null;
  newCategoryName = '';

  // Confirm Modal state for deletion
  isDeleteModalOpen = false;
  categoryToDelete: Category | null = null;

  ngOnInit(): void {
    this.fetchCategories();
  }

  fetchCategories(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.categoryService.getCategories().subscribe({
      next: (res) => {
        this.categories = res;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'Could not load categories. Please try again later.';
        console.error(err);
      }
    });
  }

  openAddModal(): void {
    this.editingCategory = null;
    this.newCategoryName = '';
    this.isModalOpen = true;
  }

  openEditModal(category: Category): void {
    this.editingCategory = category;
    this.newCategoryName = category.name;
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.editingCategory = null;
    this.newCategoryName = '';
  }

  handleAddEdit(): void {
    if (!this.newCategoryName.trim()) return;

    this.isSubmitting = true;
    this.errorMessage = '';

    const obs$ = this.editingCategory
      ? this.categoryService.updateCategory(this.editingCategory.id, this.newCategoryName.trim())
      : this.categoryService.createCategory(this.newCategoryName.trim());

    obs$.subscribe({
      next: () => {
        this.isSubmitting = false;
        this.closeModal();
        this.fetchCategories();
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err.message || 'Error saving category.';
      }
    });
  }

  handleDelete(category: Category): void {
    if (category.postCount && category.postCount > 0) {
      alert('Cannot delete a category containing posts.');
      return;
    }

    this.categoryToDelete = category;
    this.isDeleteModalOpen = true;
  }

  onDeleteConfirmed(): void {
    if (!this.categoryToDelete) return;
    const category = this.categoryToDelete;
    this.isDeleteModalOpen = false;
    this.categoryToDelete = null;

    this.isLoading = true;
    this.categoryService.deleteCategory(category.id).subscribe({
      next: () => {
        this.fetchCategories();
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.message || 'Error deleting category.';
      }
    });
  }
}
