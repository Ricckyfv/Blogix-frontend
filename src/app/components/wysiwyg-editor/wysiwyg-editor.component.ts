import { Component, ElementRef, ViewChild, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-wysiwyg-editor',
  standalone: true,
  template: `
    <div class="relative rounded-xl border border-outline-variant/60 dark:border-outline/30 bg-white dark:bg-slate-900 overflow-hidden transition-all duration-300 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 shadow-sm">

      <div class="flex flex-wrap items-center gap-1.5 bg-surface-container-low/80 dark:bg-slate-950/80 px-4 py-2.5 border-b border-outline-variant/30 dark:border-outline/20">

        <select (change)="applyHeading($any($event.target).value); $any($event.target).value = ''"
                class="bg-white dark:bg-slate-900 border border-outline-variant/60 dark:border-outline/40 rounded-lg px-2.5 py-1.5 text-xs text-on-surface-variant dark:text-on-surface outline-none hover:border-outline dark:hover:border-outline/70 focus:border-primary transition-colors cursor-pointer font-semibold">
          <option value="" disabled selected class="bg-white dark:bg-slate-900 text-on-surface">Format</option>
          <option value="H1" class="bg-white dark:bg-slate-900 text-on-surface">Heading 1</option>
          <option value="H2" class="bg-white dark:bg-slate-900 text-on-surface">Heading 2</option>
          <option value="H3" class="bg-white dark:bg-slate-900 text-on-surface">Heading 3</option>
          <option value="P" class="bg-white dark:bg-slate-900 text-on-surface">Paragraph</option>
        </select>

        <div class="h-6 w-px bg-outline-variant/40 dark:bg-outline/25 mx-1.5"></div>

        <button type="button" (click)="execCommand('bold')"
                class="p-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container/60 dark:hover:bg-slate-800/60 active:scale-95 transition-all cursor-pointer border-none bg-transparent flex" title="Bold">
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 4h8a4 4 0 014 4c0 1.83-1.24 3.36-2.9 3.86C16.8 12.35 18 13.98 18 16a4 4 0 01-4 4H6V4zm4 6h4a2 2 0 100-4h-4v4zm0 6h4a2 2 0 100-4h-4v4z" />
          </svg>
        </button>

        <button type="button" (click)="execCommand('italic')"
                class="p-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container/60 dark:hover:bg-slate-800/60 active:scale-95 transition-all cursor-pointer border-none bg-transparent flex" title="Italic">
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10 20l4-16m-4 0h4m-6 16h4" />
          </svg>
        </button>

        <div class="h-6 w-px bg-outline-variant/40 dark:bg-outline/25 mx-1.5"></div>

        <button type="button" (click)="execCommand('insertUnorderedList')"
                class="p-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container/60 dark:hover:bg-slate-800/60 active:scale-95 transition-all cursor-pointer border-none bg-transparent flex" title="Bulleted List">
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16M4 6h.01M4 12h.01M4 18h.01" />
          </svg>
        </button>

        <button type="button" (click)="execCommand('insertOrderedList')"
                class="p-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container/60 dark:hover:bg-slate-800/60 active:scale-95 transition-all cursor-pointer border-none bg-transparent flex" title="Numbered List">
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M7 8h13M7 12h13M7 16h13M3 8h.01M3 12h.01M3 16h.01" />
          </svg>
        </button>

        <div class="h-6 w-px bg-outline-variant/40 dark:bg-outline/25 mx-1.5"></div>

        <button type="button" (click)="execCommand('undo')"
                class="p-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container/60 dark:hover:bg-slate-800/60 active:scale-95 transition-all cursor-pointer border-none bg-transparent flex" title="Undo (Ctrl+Z)">
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
        </button>

        <button type="button" (click)="execCommand('redo')"
                class="p-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container/60 dark:hover:bg-slate-800/60 active:scale-95 transition-all cursor-pointer border-none bg-transparent flex" title="Redo (Ctrl+Y)">
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
          </svg>
        </button>
      </div>

      <div #editorArea
           contenteditable="true"
           (input)="onInput()"
           (blur)="onBlur()"
           class="prose dark:prose-invert max-w-none focus:outline-none min-h-[380px] px-5 py-4 text-on-surface leading-relaxed font-sans scroll-smooth"
           [innerHTML]="initialValue">
      </div>
    </div>
  `,
  styles: [`
    [contenteditable]:empty:before {
      content: "Write your technical content here... Supports H1, H2, H3 headings, bold, italic, and lists.";
      color: var(--color-outline);
    }
    ::ng-deep .prose h1 {
      font-size: 1.875rem;
      font-weight: 800;
      margin-top: 1.5rem;
      margin-bottom: 0.5rem;
      color: var(--color-on-surface);
    }
    ::ng-deep .prose h2 {
      font-size: 1.5rem;
      font-weight: 700;
      margin-top: 1.25rem;
      margin-bottom: 0.5rem;
      color: var(--color-on-surface);
    }
    ::ng-deep .prose h3 {
      font-size: 1.25rem;
      font-weight: 600;
      margin-top: 1rem;
      margin-bottom: 0.5rem;
      color: var(--color-on-surface);
    }
    ::ng-deep .prose p, ::ng-deep .prose ul, ::ng-deep .prose ol {
      margin-bottom: 1rem;
      color: var(--color-on-surface-variant);
    }
    ::ng-deep .prose ul {
      list-style-type: disc;
      padding-left: 1.5rem;
    }
    ::ng-deep .prose ol {
      list-style-type: decimal;
      padding-left: 1.5rem;
    }
  `],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => WysiwygEditorComponent),
      multi: true
    }
  ]
})
export class WysiwygEditorComponent implements ControlValueAccessor {
  @ViewChild('editorArea') editorArea!: ElementRef<HTMLDivElement>;

  initialValue = '';
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  execCommand(command: string, arg: string = ''): void {
    document.execCommand(command, false, arg);
    this.onInput();
  }

  applyHeading(heading: string): void {
    if (heading === 'P') {
      this.execCommand('formatBlock', 'P');
    } else {
      this.execCommand('formatBlock', heading);
    }
  }

  onInput(): void {
    const html = this.editorArea.nativeElement.innerHTML;
    this.onChange(html === '<br>' ? '' : html);
  }

  onBlur(): void {
    this.onTouched();
  }

  writeValue(value: string): void {
    this.initialValue = value || '';
    if (this.editorArea) {
      this.editorArea.nativeElement.innerHTML = this.initialValue;
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
}
