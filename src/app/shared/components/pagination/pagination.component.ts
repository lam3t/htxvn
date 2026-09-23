import { Component, EventEmitter, Input, Output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="pagination-wrapper" *ngIf="totalItems > 0">
      <!-- THÔNG TIN SỐ BẢN GHI & SỐ DÒNG/TRANG -->
      <div class="pagination-info">
        <span>
          Hiển thị <strong>{{ startItem }} - {{ endItem }}</strong> trong tổng số <strong>{{ totalItems }}</strong> {{ itemName }}
        </span>
        <div class="page-size-selector">
          <label for="pageSizeSelect">Số dòng:</label>
          <select 
            id="pageSizeSelect"
            class="page-size-select" 
            [ngModel]="pageSize" 
            (ngModelChange)="onPageSizeChange($event)">
            <option *ngFor="let opt of pageSizeOptions" [value]="opt">{{ opt }}/trang</option>
          </select>
        </div>
      </div>

      <!-- BỘ ĐIỀU HƯỚNG TRANG -->
      <div class="pagination-controls">
        <button 
          class="page-btn" 
          [disabled]="currentPage <= 1" 
          (click)="goToPage(1)"
          title="Trang đầu">
          « Đầu
        </button>

        <button 
          class="page-btn" 
          [disabled]="currentPage <= 1" 
          (click)="goToPage(currentPage - 1)"
          title="Trang trước">
          ◀ Trước
        </button>

        <ng-container *ngFor="let p of visiblePages">
          <span *ngIf="p === -1" class="page-ellipsis">...</span>
          <button 
            *ngIf="p !== -1"
            class="page-btn" 
            [class.active]="p === currentPage" 
            (click)="goToPage(p)">
            {{ p }}
          </button>
        </ng-container>

        <button 
          class="page-btn" 
          [disabled]="currentPage >= totalPages" 
          (click)="goToPage(currentPage + 1)"
          title="Trang sau">
          Sau ▶
        </button>

        <button 
          class="page-btn" 
          [disabled]="currentPage >= totalPages" 
          (click)="goToPage(totalPages)"
          title="Trang cuối">
          Cuối »
        </button>
      </div>
    </div>
  `
})
export class PaginationComponent {
  @Input() totalItems: number = 0;
  @Input() pageSize: number = 10;
  @Input() currentPage: number = 1;
  @Input() pageSizeOptions: number[] = [5, 10, 20, 50];
  @Input() itemName: string = 'bản ghi';

  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.pageSize) || 1;
  }

  get startItem(): number {
    if (this.totalItems === 0) return 0;
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get endItem(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalItems);
  }

  get visiblePages(): number[] {
    const total = this.totalPages;
    const current = this.currentPage;
    const delta = 1; // Số trang lân cận hiện tại
    const range: number[] = [];
    const rangeWithDots: number[] = [];
    let l: number | undefined;

    for (let i = 1; i <= total; i++) {
      if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
        range.push(i);
      }
    }

    for (const i of range) {
      if (l !== undefined) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push(-1); // -1 đại diện cho dấu "..."
        }
      }
      rangeWithDots.push(i);
      l = i;
    }

    return rangeWithDots;
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.pageChange.emit(page);
    }
  }

  onPageSizeChange(newSize: number) {
    const size = Number(newSize);
    this.pageSizeChange.emit(size);
    // Khi đổi page size, reset về trang 1
    this.pageChange.emit(1);
  }
}
