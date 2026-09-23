import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container" aria-live="polite">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="toast-item" [class]="'toast-' + toast.type">
          <span class="toast-icon">{{ toast.icon }}</span>
          <div class="toast-content">
            <div class="toast-title">{{ toast.title }}</div>
            <div class="toast-desc">{{ toast.message }}</div>
          </div>
          <button class="toast-close" (click)="toastService.remove(toast.id)">✕</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-icon {
      font-size: 26px;
      line-height: 1;
    }
    .toast-content {
      flex: 1;
    }
    .toast-title {
      font-size: 16px;
      font-weight: 800;
      margin-bottom: 2px;
    }
    .toast-desc {
      font-size: 14px;
      font-weight: 500;
      opacity: 0.95;
    }
    .toast-close {
      background: transparent;
      border: none;
      color: white;
      font-size: 18px;
      font-weight: 800;
      cursor: pointer;
      padding: 4px 8px;
      border-radius: 4px;
    }
    .toast-close:hover {
      background: rgba(255,255,255,0.2);
    }
  `]
})
export class ToastContainerComponent {
  toastService = inject(ToastService);
}
