import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HtxStateService } from '../../core/services/htx-state.service';
import { MockDataService } from '../../core/services/mock-data.service';
import { HTXInfo } from '../../core/models/htx.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <header class="main-header">
      <!-- CỤM 1: LOGO HỆ THỐNG & KHÔNG GIAN HTX HIỆN TẠI -->
      <div class="brand-area">
        <a routerLink="/demo-hub" class="brand-link" title="Về trang chủ mục lục Demo">
          <span class="htx-avatar-badge">{{ state.currentHtx().logo }}</span>
          <div class="brand-text">
            <div class="system-tag">HỆ THỐNG CSDL HTX HƯNG YÊN</div>
            <div class="htx-working-title">
              <span class="live-dot">●</span> Đang làm việc: <strong>{{ state.currentHtx().shortName }}</strong>
            </div>
          </div>
        </a>
      </div>

      <!-- CỤM 2: THANH CHUYỂN ĐỔI HTX NHANH (SIÊU TRỰC QUAN CHO NÔNG DÂN) -->
      <div class="htx-quick-pills-bar hide-mobile">
        <span class="pills-label">🏢 Chuyển nhanh HTX:</span>
        <div class="pills-list">
          @for (htx of state.cooperatives(); track htx.id) {
            <button 
              type="button"
              class="htx-pill-btn" 
              [class.active]="state.selectedHtxId() === htx.id"
              (click)="selectHtx(htx)"
              [title]="'Chuyển sang làm việc với ' + htx.name">
              <span class="pill-logo">{{ htx.logo }}</span>
              <span class="pill-name">{{ htx.shortName }}</span>
              @if (state.selectedHtxId() === htx.id) {
                <span class="pill-check">✓ Đang chọn</span>
              }
            </button>
          }
        </div>
      </div>

      <!-- CỤM 3: VAI TRÒ & THÔNG BÁO & MỤC LỤC -->
      <div class="actions-area">
        <!-- BỘ ĐỔI VAI TRÒ NHANH -->
        <div class="role-switcher-box">
          <label class="switcher-label">
            <span class="icon">👤</span> Vai trò:
          </label>
          <select 
            class="role-select" 
            [value]="state.currentUser().id" 
            (change)="onRoleChange($event)">
            @for (u of mockData.demoUsers; track u.id) {
              <option [value]="u.id">{{ u.avatar }} {{ u.name }} — {{ u.roleTitle }}</option>
            }
          </select>
        </div>

        <!-- NÚT CHUÔNG THÔNG BÁO -->
        <div class="notif-dropdown-wrapper">
          <button class="icon-btn notif-btn" (click)="toggleNotifDropdown()" title="Thông báo">
            <span class="bell-icon">🔔</span>
            @if (state.unreadNotifications().length > 0) {
              <span class="badge-count">{{ state.unreadNotifications().length }}</span>
            }
          </button>

          <!-- DROPDOWN DANH SÁCH THÔNG BÁO -->
          @if (showNotif()) {
            <div class="notif-dropdown">
              <div class="notif-header">
                <h3>📢 Thông Báo Nông Vụ</h3>
                <span class="count-text">{{ state.unreadNotifications().length }} tin mới</span>
              </div>
              <div class="notif-list">
                @for (n of state.notifications(); track n.id) {
                  <div class="notif-card" [class.unread]="!n.isRead" (click)="readNotif(n.id)">
                    <div class="notif-meta">
                      <span class="notif-type-tag" [class]="'tag-' + n.type">
                        {{ n.type === 'urgent' ? '🔴 Khẩn cấp' : (n.type === 'warning' ? '🟠 Chú ý' : '🔵 Tin tức') }}
                      </span>
                      <span class="notif-time">{{ n.createdAt }}</span>
                    </div>
                    <h4 class="notif-item-title">{{ n.title }}</h4>
                    <p class="notif-item-content">{{ n.content }}</p>
                  </div>
                }
              </div>
              <div class="notif-footer">
                <a routerLink="/notifications" (click)="showNotif.set(false)" class="btn-view-all">Xem tất cả thông báo ➔</a>
              </div>
            </div>
          }
        </div>

        <!-- PROFILE & TRANG CHỦ DEMO -->
        <a routerLink="/demo-hub" class="btn-hub-link" title="Mục lục toàn bộ màn hình">
          <span class="hub-icon">🧭</span>
          <span class="hub-text">Mục Lục Demo</span>
        </a>
      </div>
    </header>
  `,
  styles: [`
    .main-header {
      background-color: #ffffff;
      border-bottom: 1.5px solid var(--border-color);
      padding: 6px 14px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: sticky;
      top: 0;
      z-index: 1000;
      box-shadow: var(--shadow-sm);
    }

    .brand-area {
      display: flex;
      align-items: center;
    }

    .brand-link {
      display: flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
      color: inherit;
    }

    .htx-avatar-badge {
      font-size: 22px;
      width: 38px;
      height: 38px;
      background: var(--primary-100);
      border: 1.5px solid var(--primary-600);
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .system-tag {
      font-size: 10.5px;
      font-weight: 800;
      color: var(--primary-700);
      letter-spacing: 0.5px;
      text-transform: uppercase;
      line-height: 1.1;
    }

    .htx-title {
      font-size: 15.5px;
      font-weight: 800;
      color: var(--text-main);
      margin: 0;
      line-height: 1.2;
    }

    .actions-area {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .htx-switcher-box, .role-switcher-box {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .switcher-label {
      font-size: 11px;
      font-weight: 700;
      color: var(--text-muted);
      display: flex;
      align-items: center;
      gap: 3px;
      line-height: 1;
    }

    .htx-select, .role-select {
      height: 34px;
      padding: 4px 28px 4px 8px;
      font-size: 13px;
      font-weight: 700;
      color: var(--text-main);
      background-color: var(--bg-card-subtle);
      border: 1.5px solid var(--border-color);
      border-radius: var(--radius-sm);
      cursor: pointer;
      appearance: none;
      background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%230f172a' stroke-width='2'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
      background-repeat: no-repeat;
      background-position: right 8px center;
      background-size: 12px;
    }

    .htx-select:focus, .role-select:focus {
      outline: none;
      border-color: var(--primary-700);
    }

    .notif-dropdown-wrapper {
      position: relative;
    }

    .icon-btn {
      width: 36px;
      height: 36px;
      border-radius: var(--radius-sm);
      border: 1.5px solid var(--border-color);
      background: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 17px;
      position: relative;
    }

    .icon-btn:hover {
      background: var(--bg-app);
    }

    .badge-count {
      position: absolute;
      top: -4px;
      right: -4px;
      background: var(--danger-600);
      color: white;
      font-size: 11px;
      font-weight: 800;
      padding: 1px 5px;
      border-radius: var(--radius-full);
      border: 1.5px solid white;
    }

    .notif-dropdown {
      position: absolute;
      top: 44px;
      right: 0;
      width: 340px;
      background: #ffffff;
      border: 1.5px solid var(--border-color);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-xl);
      overflow: hidden;
      animation: fadeIn 0.2s ease;
    }

    .notif-header {
      padding: 10px 12px;
      background: var(--bg-app);
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid var(--border-color);
    }

    .notif-header h3 {
      font-size: 14px;
      font-weight: 800;
    }

    .count-text {
      font-size: 12px;
      font-weight: 700;
      color: var(--danger-700);
    }

    .notif-list {
      max-height: 300px;
      overflow-y: auto;
    }

    .notif-card {
      padding: 10px 12px;
      border-bottom: 1px solid #e2e8f0;
      cursor: pointer;
      transition: background 0.15s;
    }

    .notif-card:hover {
      background: #f8fafc;
    }

    .notif-card.unread {
      background: var(--primary-50);
      border-left: 3px solid var(--primary-600);
    }

    .notif-meta {
      display: flex;
      justify-content: space-between;
      margin-bottom: 4px;
    }

    .notif-type-tag {
      font-size: 10.5px;
      font-weight: 800;
      padding: 1px 5px;
      border-radius: 4px;
    }
    .tag-urgent { background: #fee2e2; color: #991b1b; }
    .tag-warning { background: #fef3c7; color: #92400e; }
    .tag-info { background: #dbeafe; color: #1e40af; }

    .notif-time {
      font-size: 11px;
      color: var(--text-muted);
    }

    .notif-item-title {
      font-size: 13px;
      font-weight: 700;
      margin-bottom: 2px;
    }

    .notif-item-content {
      font-size: 12px;
      color: var(--text-muted);
      line-height: 1.35;
    }

    .notif-footer {
      padding: 8px;
      text-align: center;
      background: #f8fafc;
      border-top: 1px solid var(--border-color);
    }

    .htx-working-title {
      font-size: 14.5px;
      font-weight: 700;
      color: var(--text-main);
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .live-dot {
      color: var(--primary-600);
      font-size: 12px;
      animation: pulse 1.5s infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(0.85); }
    }

    .htx-quick-pills-bar {
      display: flex;
      align-items: center;
      gap: 8px;
      background: var(--bg-card-subtle);
      border: 1.5px solid var(--border-color);
      border-radius: var(--radius-full);
      padding: 3px 6px 3px 12px;
    }

    .pills-label {
      font-size: 11.5px;
      font-weight: 800;
      color: var(--text-muted);
      white-space: nowrap;
    }

    .pills-list {
      display: flex;
      gap: 4px;
    }

    .htx-pill-btn {
      display: flex;
      align-items: center;
      gap: 5px;
      padding: 4px 10px;
      border-radius: var(--radius-full);
      border: 1.5px solid transparent;
      background: transparent;
      font-size: 12px;
      font-weight: 700;
      color: var(--text-body);
      cursor: pointer;
      transition: all 0.15s ease;
      white-space: nowrap;
    }

    .htx-pill-btn:hover {
      background: #ffffff;
      border-color: var(--primary-400);
      color: var(--primary-800);
    }

    .htx-pill-btn.active {
      background: var(--primary-700);
      color: #ffffff;
      border-color: var(--primary-700);
      box-shadow: 0 1px 3px rgba(20, 83, 45, 0.3);
    }

    .pill-check {
      font-size: 10.5px;
      background: rgba(255, 255, 255, 0.25);
      padding: 1px 5px;
      border-radius: 4px;
      margin-left: 2px;
    }

    .btn-view-all {
      font-size: 13px;
      font-weight: 700;
      color: var(--primary-700);
      text-decoration: none;
    }

    .btn-hub-link {
      display: flex;
      align-items: center;
      gap: 6px;
      background: var(--amber-700);
      color: white;
      padding: 4px 12px;
      border-radius: var(--radius-sm);
      text-decoration: none;
      font-weight: 800;
      font-size: 13px;
      height: 34px;
    }

    .btn-hub-link:hover {
      background: var(--amber-800);
    }

    @media (max-width: 1100px) {
      .htx-quick-pills-bar {
        display: none;
      }
    }

    @media (max-width: 900px) {
      .role-switcher-box {
        display: none;
      }
      .system-tag {
        display: none;
      }
      .notif-dropdown {
        width: 320px;
        right: -60px;
      }
    }
  `]
})
export class HeaderComponent {
  state = inject(HtxStateService);
  mockData = inject(MockDataService);
  showNotif = signal(false);

  toggleNotifDropdown() {
    this.showNotif.update(v => !v);
  }

  readNotif(id: string) {
    this.state.markNotificationAsRead(id);
  }

  selectHtx(htx: HTXInfo) {
    this.state.switchHtx(htx.id);
  }

  onRoleChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    const user = this.mockData.demoUsers.find(u => u.id === target.value);
    if (user) {
      this.state.switchUser(user);
    }
  }
}
