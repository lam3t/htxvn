import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: string;
  type: 'success' | 'danger' | 'warning' | 'info';
  title: string;
  message: string;
  icon: string;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  readonly toasts = signal<ToastMessage[]>([]);

  show(type: 'success' | 'danger' | 'warning' | 'info', title: string, message: string = '', durationMs: number = 4000) {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 6);
    let icon = '✅';
    if (type === 'danger') icon = '🚨';
    if (type === 'warning') icon = '⚠️';
    if (type === 'info') icon = 'ℹ️';

    const newToast: ToastMessage = { id, type, title, message, icon };
    this.toasts.update(list => [newToast, ...list]);

    setTimeout(() => {
      this.remove(id);
    }, durationMs);
  }

  success(title: string, message: string = '') {
    this.show('success', title, message, 4500);
  }

  danger(title: string, message: string = '') {
    this.show('danger', title, message, 5000);
  }

  warning(title: string, message: string = '') {
    this.show('warning', title, message, 4500);
  }

  info(title: string, message: string = '') {
    this.show('info', title, message, 4000);
  }

  remove(id: string) {
    this.toasts.update(list => list.filter(t => t.id !== id));
  }
}
