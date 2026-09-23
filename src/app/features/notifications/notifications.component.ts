import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HtxStateService } from '../../core/services/htx-state.service';
import { ToastService } from '../../core/services/toast.service';
import { NotificationItem } from '../../core/models/htx.model';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent],
  template: `
    <div class="notif-page">
      <!-- HEADER TRANG -->
      <div class="page-top">
        <div>
          <div class="page-sub">ĐIỀU HÀNH & NÔNG VỤ • {{ state.currentHtx().shortName }}</div>
          <h1 class="page-title">Quản Lý Thông Báo & Cảnh Báo Nông Vụ</h1>
        </div>
        <button class="btn btn-primary" (click)="showCreateModal.set(true)">
          <span>📢</span> Phát Thông Báo Mới
        </button>
      </div>

      <!-- THANH BỘ LỌC THÔNG BÁO -->
      <div class="card filter-card">
        <div class="filter-tabs">
          <button 
            class="filter-tab" 
            [class.active]="activeFilter() === 'ALL'" 
            (click)="onFilterSelect('ALL')">
            Tất Cả ({{ state.notifications().length }})
          </button>
          <button 
            class="filter-tab" 
            [class.active]="activeFilter() === 'urgent'" 
            (click)="onFilterSelect('urgent')">
            🔴 Khẩn Cấp ({{ countType('urgent') }})
          </button>
          <button 
            class="filter-tab" 
            [class.active]="activeFilter() === 'warning'" 
            (click)="onFilterSelect('warning')">
            🟠 Chú Ý ({{ countType('warning') }})
          </button>
          <button 
            class="filter-tab" 
            [class.active]="activeFilter() === 'info'" 
            (click)="onFilterSelect('info')">
            🔵 Tin Tức ({{ countType('info') }})
          </button>
        </div>
      </div>

      <!-- DANH SÁCH THÔNG BÁO -->
      <div class="notif-cards-list">
        @if (filteredNotifs().length === 0) {
          <div class="empty-state">
            <span class="empty-state-icon">📭</span>
            <div class="empty-state-title">Không có thông báo nào trong mục này</div>
          </div>
        } @else {
          @for (n of paginatedNotifs(); track n.id) {
            <div class="card notif-card-item" [class.urgent-card]="n.type === 'urgent'" [class.unread]="!n.isRead">
              <div class="notif-item-top">
                <div class="notif-left">
                  <span class="badge" [class.badge-danger]="n.type === 'urgent'" [class.badge-warning]="n.type === 'warning'" [class.badge-info]="n.type === 'info'">
                    {{ n.type === 'urgent' ? '🔴 CẢNH BÁO KHẨN CẤP' : (n.type === 'warning' ? '🟠 CHÚ Ý NÔNG VỤ' : '🔵 TIN TỨC CHUNG') }}
                  </span>
                  <span class="notif-date">🕒 {{ n.createdAt }}</span>
                </div>
                <span class="receiver-badge">Gửi tới: <strong>{{ n.receiverGroup }}</strong></span>
              </div>

              <h2 class="notif-title">{{ n.title }}</h2>
              <p class="notif-body">{{ n.content }}</p>

              <div class="notif-footer-row">
                <span class="sender-info">Người phát tin: <strong>{{ n.sender }}</strong></span>
                <div class="btn-actions">
                  @if (!n.isRead) {
                    <button class="btn btn-secondary btn-sm" (click)="state.markNotificationAsRead(n.id)">
                      ✓ Đánh dấu đã đọc
                    </button>
                  }
                  <button class="btn btn-danger btn-sm" (click)="confirmDelete(n)">
                    🗑️ Xóa
                  </button>
                </div>
              </div>
            </div>
          }
        }
      </div>

      <!-- PHÂN TRANG -->
      <app-pagination
        [totalItems]="filteredNotifs().length"
        [pageSize]="pageSize()"
        [currentPage]="currentPage()"
        [itemName]="'thông báo'"
        (pageChange)="onPageChange($event)"
        (pageSizeChange)="onPageSizeChange($event)">
      </app-pagination>

      <!-- MODAL PHÁT THÔNG BÁO MỚI -->
      @if (showCreateModal()) {
        <div class="modal-backdrop">
          <div class="modal-dialog modal-lg">
            <div class="modal-header-simple">
              <h2 class="card-title">📢 Soạn Thông Báo Nông Vụ Khẩn</h2>
              <button type="button" class="btn-close-modal" (click)="showCreateModal.set(false)" title="Đóng">✕</button>
            </div>
            <form (submit)="sendNotification($event)">
              <div class="form-group">
                <label class="form-label">Mức độ ưu tiên:</label>
                <select class="form-control" [(ngModel)]="newNotifType" name="type">
                  <option value="urgent">🔴 Khẩn cấp (Mưa bão, dịch bệnh, ngập úng)</option>
                  <option value="warning">🟠 Chú ý (Lịch bón phân, lịch tập huấn, lịch nước)</option>
                  <option value="info">🔵 Thông tin chung (Họp đại hội xã viên, giá thu mua)</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Tiêu đề thông báo: <span class="required">*</span></label>
                <input type="text" class="form-control" placeholder="Ví dụ: Cảnh báo sâu cuốn lá nhỏ hại lúa đòng" [(ngModel)]="newNotifTitle" name="title" required />
              </div>

              <div class="form-group">
                <label class="form-label">Nội dung chi tiết & hướng dẫn xử lý: <span class="required">*</span></label>
                <textarea class="form-control" rows="4" placeholder="Nhập nội dung thông báo phát tới xã viên..." [(ngModel)]="newNotifContent" name="content" required></textarea>
              </div>

              <div class="form-group">
                <label class="form-label">Nhóm người nhận:</label>
                <select class="form-control" [(ngModel)]="newNotifReceiver" name="receiver">
                  <option value="Toàn thể xã viên HTX">Toàn thể xã viên HTX</option>
                  <option value="Ban Quản Trị & Kỹ sư HTX">Ban Quản Trị & Kỹ sư HTX</option>
                  <option value="Xã viên Vùng Lúa An Lạc">Xã viên Vùng Lúa An Lạc</option>
                  <option value="Hộ chăn nuôi gà Đông Tảo">Hộ chăn nuôi gà Đông Tảo</option>
                  <option value="Hộ nuôi lồng cá Tân Hưng">Hộ nuôi lồng cá Tân Hưng</option>
                </select>
              </div>

              <div class="modal-actions">
                <button type="button" class="btn btn-secondary" (click)="showCreateModal.set(false)">Hủy Bỏ</button>
                <button type="submit" class="btn btn-primary">PHÁT THÔNG BÁO TỨC THÌ</button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- MODAL XÁC NHẬN XÓA THÔNG BÁO -->
      @if (showDeleteModal()) {
        <div class="modal-backdrop">
          <div class="modal-dialog modal-confirm">
            <div class="confirm-icon">⚠️</div>
            <h2 class="confirm-title">Xác Nhận Xóa Thông Báo</h2>
            <p class="confirm-desc">
              Bác có chắc chắn muốn xóa thông báo <strong>"{{ notifToDelete?.title }}"</strong> không?
            </p>
            <div class="modal-actions">
              <button class="btn btn-secondary" (click)="showDeleteModal.set(false)">Hủy Bỏ</button>
              <button class="btn btn-danger" (click)="executeDelete()">ĐỒNG Ý XÓA</button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .notif-page {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .page-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
    }

    .page-sub {
      font-size: 13px;
      font-weight: 800;
      color: var(--primary-700);
      letter-spacing: 0.5px;
    }

    .page-title {
      font-size: 26px;
      color: var(--text-main);
      margin: 0;
    }

    .filter-card {
      padding: 12px 16px;
    }

    .filter-tabs {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .filter-tab {
      padding: 8px 14px;
      border-radius: var(--radius-full);
      border: 1.5px solid var(--border-color);
      background: #ffffff;
      font-size: 13.5px;
      font-weight: 700;
      color: var(--text-muted);
      cursor: pointer;
      transition: all 0.2s;
    }

    .filter-tab:hover {
      border-color: var(--primary-600);
      color: var(--primary-700);
    }

    .filter-tab.active {
      background: var(--primary-700);
      color: #ffffff;
      border-color: var(--primary-700);
    }

    .notif-cards-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .notif-card-item {
      border: 2px solid var(--border-color);
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .urgent-card {
      border-color: var(--danger-600);
      background: #fffdfd;
    }

    .notif-card-item.unread {
      border-left: 6px solid var(--primary-600);
    }

    .notif-item-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 10px;
    }

    .notif-left {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .notif-date {
      font-size: 13px;
      color: var(--text-muted);
      font-weight: 600;
    }

    .receiver-badge {
      font-size: 13px;
      color: var(--text-muted);
    }

    .notif-title {
      font-size: 18px;
      font-weight: 800;
      color: var(--text-main);
    }

    .notif-body {
      font-size: 15px;
      color: var(--text-body);
      line-height: 1.5;
    }

    .notif-footer-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 10px;
      border-top: 1px dashed var(--border-color);
    }

    .sender-info {
      font-size: 13.5px;
      color: var(--text-muted);
    }

    .btn-actions {
      display: flex;
      gap: 8px;
    }

    .btn-sm {
      min-height: 38px;
      padding: 6px 14px;
      font-size: 13px;
    }

    .modal-confirm {
      text-align: center;
      max-width: 440px;
    }

    .confirm-icon {
      font-size: 48px;
      margin-bottom: 8px;
    }

    .confirm-title {
      font-size: 20px;
      font-weight: 800;
      color: var(--text-main);
    }

    .confirm-desc {
      font-size: 14.5px;
      color: var(--text-muted);
      margin: 10px 0 20px;
      line-height: 1.5;
    }
  `]
})
export class NotificationsComponent {
  state = inject(HtxStateService);
  toast = inject(ToastService);

  activeFilter = signal<'ALL' | 'urgent' | 'warning' | 'info'>('ALL');
  currentPage = signal(1);
  pageSize = signal(5);

  showCreateModal = signal(false);
  newNotifTitle = '';
  newNotifContent = '';
  newNotifType: 'urgent' | 'warning' | 'info' = 'urgent';
  newNotifReceiver = 'Toàn thể xã viên HTX';

  showDeleteModal = signal(false);
  notifToDelete: NotificationItem | null = null;

  countType(type: 'urgent' | 'warning' | 'info') {
    return this.state.notifications().filter(n => n.type === type).length;
  }

  filteredNotifs = computed(() => {
    const filter = this.activeFilter();
    if (filter === 'ALL') {
      return this.state.notifications();
    }
    return this.state.notifications().filter(n => n.type === filter);
  });

  paginatedNotifs = computed(() => {
    const list = this.filteredNotifs();
    const start = (this.currentPage() - 1) * this.pageSize();
    return list.slice(start, start + this.pageSize());
  });

  onFilterSelect(filter: 'ALL' | 'urgent' | 'warning' | 'info') {
    this.activeFilter.set(filter);
    this.currentPage.set(1);
  }

  onPageChange(p: number) {
    this.currentPage.set(p);
  }

  onPageSizeChange(s: number) {
    this.pageSize.set(s);
    this.currentPage.set(1);
  }

  sendNotification(e: Event) {
    e.preventDefault();
    if (!this.newNotifTitle || !this.newNotifContent) return;
    this.state.addNotification(this.newNotifTitle, this.newNotifContent, this.newNotifType, this.newNotifReceiver);
    this.showCreateModal.set(false);
    this.newNotifTitle = '';
    this.newNotifContent = '';
  }

  confirmDelete(n: NotificationItem) {
    this.notifToDelete = n;
    this.showDeleteModal.set(true);
  }

  executeDelete() {
    if (!this.notifToDelete) return;
    const id = this.notifToDelete.id;
    this.state.deleteNotification(id);
    this.showDeleteModal.set(false);
  }
}
