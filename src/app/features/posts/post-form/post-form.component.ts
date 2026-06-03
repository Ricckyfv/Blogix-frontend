import { Component, OnInit, inject } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { PostService } from '../../../core/services/post.service';
import { CategoryService } from '../../../core/services/category.service';
import { TagService } from '../../../core/services/tag.service';
import { Category, Tag, CreatePostRequest, UpdatePostRequest } from '../../../core/models/types';
import { forkJoin } from 'rxjs';
import { WysiwygEditorComponent } from '../../../components/wysiwyg-editor/wysiwyg-editor.component';

@Component({
  selector: 'app-post-form',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, RouterLink, WysiwygEditorComponent],
  templateUrl: './post-form.component.html'
})
export class PostFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private postService = inject(PostService);
  private categoryService = inject(CategoryService);
  private tagService = inject(TagService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  postForm!: FormGroup;
  postId: string | null = null;
  isEditMode = false;

  // Option lists from backend
  categories: Category[] = [];
  tags: Tag[] = [];

  // Inline additions
  newCategoryName = '';
  newTagName = '';
  showNewCategoryInput = false;
  showNewTagInput = false;

  // States
  isLoading = false;
  isSaving = false;
  errorMessage = '';

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.postId = id;
      this.isEditMode = true;
    }

    this.postForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
      content: ['', [Validators.required, Validators.minLength(10)]],
      categoryId: ['', [Validators.required]],
      tagIds: [[] as string[]],
      status: ['PUBLISHED', [Validators.required]],
      postImage: ['']
    });

    this.loadFormMetadata();
  }

  loadFormMetadata(): void {
    this.isLoading = true;
    this.errorMessage = '';

    forkJoin({
      categories: this.categoryService.getCategories(),
      tags: this.tagService.getTags()
    }).subscribe({
      next: (res) => {
        this.categories = res.categories;
        this.tags = res.tags;
        
        if (this.isEditMode && this.postId) {
          this.loadExistingPost(this.postId);
        } else {
          this.isLoading = false;
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'Error loading available categories and tags.';
        console.error(err);
      }
    });
  }

  loadExistingPost(id: string): void {
    this.postService.getPost(id).subscribe({
      next: (post) => {
        this.postForm.patchValue({
          title: post.title,
          content: post.content,
          categoryId: post.category.id,
          tagIds: post.tags.map(t => t.id),
          status: post.status,
          postImage: post.postImage || ''
        });
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.message || 'Could not load the post for editing.';
      }
    });
  }

  toggleTag(tagId: string): void {
    const currentTagIds: string[] = this.postForm.get('tagIds')?.value || [];
    const idx = currentTagIds.indexOf(tagId);
    if (idx > -1) {
      currentTagIds.splice(idx, 1);
    } else {
      currentTagIds.push(tagId);
    }
    this.postForm.patchValue({ tagIds: [...currentTagIds] });
  }

  isTagSelected(tagId: string): boolean {
    const currentTagIds: string[] = this.postForm.get('tagIds')?.value || [];
    return currentTagIds.includes(tagId);
  }

  setStatus(statusVal: 'DRAFT' | 'PUBLISHED'): void {
    this.postForm.patchValue({ status: statusVal });
  }

  getStatus(): 'DRAFT' | 'PUBLISHED' {
    return this.postForm.get('status')?.value;
  }

  // Inline Category Creator
  onCreateCategory(): void {
    if (!this.newCategoryName.trim()) return;
    
    this.isSaving = true;
    this.categoryService.createCategory(this.newCategoryName.trim()).subscribe({
      next: (newCat) => {
        this.categories.push(newCat);
        this.postForm.patchValue({ categoryId: newCat.id });
        this.newCategoryName = '';
        this.showNewCategoryInput = false;
        this.isSaving = false;
      },
      error: (err) => {
        this.isSaving = false;
        alert(err.message || 'Error creating category.');
      }
    });
  }

  // Inline Tag Creator
  onCreateTag(): void {
    if (!this.newTagName.trim()) return;

    this.isSaving = true;
    const tagNames = this.newTagName.trim().split(',').map(name => name.trim()).filter(Boolean);
    
    this.tagService.createTags(tagNames).subscribe({
      next: (newTags) => {
        newTags.forEach(t => {
          if (!this.tags.some(existing => existing.id === t.id)) {
            this.tags.push(t);
          }
          const currentTagIds: string[] = this.postForm.get('tagIds')?.value || [];
          if (!currentTagIds.includes(t.id)) {
            currentTagIds.push(t.id);
            this.postForm.patchValue({ tagIds: [...currentTagIds] });
          }
        });
        this.newTagName = '';
        this.showNewTagInput = false;
        this.isSaving = false;
      },
      error: (err) => {
        this.isSaving = false;
        alert(err.message || 'Error creating tags.');
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

          // Dimensiones optimizadas para portada de blog
          const maxDim = 800;
          let width = img.width;
          let height = img.height;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;

          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
            this.postForm.patchValue({ postImage: compressedBase64 });
            console.log('Imagen de portada optimizada con éxito');
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
    if (this.postForm.invalid) {
      this.errorMessage = 'Please fill in the title, content, and category correctly.';
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';

    const formVal = this.postForm.value;

    if (this.isEditMode && this.postId) {
      const request: UpdatePostRequest = {
        id: this.postId,
        title: formVal.title.trim(),
        content: formVal.content.trim(),
        categoryId: formVal.categoryId,
        tagIds: formVal.tagIds,
        status: formVal.status,
        postImage: formVal.postImage
      };

      this.postService.updatePost(this.postId, request).subscribe({
        next: (savedPost) => {
          this.isSaving = false;
          this.router.navigate(['/posts', savedPost.id]);
        },
        error: (err) => {
          this.isSaving = false;
          this.errorMessage = err.message || 'Error saving post changes.';
        }
      });
    } else {
      const request: CreatePostRequest = {
        title: formVal.title.trim(),
        content: formVal.content.trim(),
        categoryId: formVal.categoryId,
        tagIds: formVal.tagIds,
        status: formVal.status,
        postImage: formVal.postImage
      };

      this.postService.createPost(request).subscribe({
        next: (savedPost) => {
          this.isSaving = false;
          if (savedPost.status === 'DRAFT') {
            this.router.navigate(['/posts/drafts']);
          } else {
            this.router.navigate(['/posts', savedPost.id]);
          }
        },
        error: (err) => {
          this.isSaving = false;
          this.errorMessage = err.message || 'Error creating post.';
        }
      });
    }
  }
}
