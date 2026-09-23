import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { HtxStateService } from '../../core/services/htx-state.service';
import { MockDataService } from '../../core/services/mock-data.service';

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <!-- THANH BOTTOM NAVIGATION CỐ ĐỊNH DƯỚI ĐÁY CHO MOBILE -->
    <nav class="bottom-nav">
      <a routerLink="/demo-hub" routerLinkActive="active" class="bottom-tab">
        <span class="tab-icon">🧭</span>
        <span class="tab-label">Tổng quan</span>
      </a>

      @if (state.currentUser().role === 'admin' || state.currentUser().role === 'director' || state.currentUser().role === 'accountant') {
        <a routerLink="/dashboard" routerLinkActive="active" class="bottom-tab">
          <span class="tab-icon">📊</span>
          <span class="tab-label">Bảng tin</span>
        </a>
      } @else {
        <a routerLink="/dashboard/member" routerLinkActive="active" class="bottom-tab">
          <span class="tab-icon">🏡</span>
          <span class="tab-label">Trang chủ</span>
        </a>
      }

      <a routerLink="/production/logs" routerLinkActive="active" class="bottom-tab action-tab">
        <div class="plus-circle">📝</div>
        <span class="tab-label">Nhật ký</span>
      </a>

      <a routerLink="/members" routerLinkActive="active" class="bottom-tab">
        <span class="tab-icon">👥</span>
        <span class="tab-label">Thành viên</span>
        @if (state.pendingMembers().length > 0) {
          <span class="mobile-badge">{{ state.pendingMembers().length }}</span>
        }
      </a>

      <button class="bottom-tab btn-more" (click)="toggleDrawer()">
        <span class="tab-icon">☰</span>
        <span class="tab-label">Tất cả</span>
      </button>
    </nav>

    <!-- DRAWER MENU KHI BẤM "TẤT CẢ" TRÊN MOBILE -->
    @if (showDrawer()) {
      <div class="drawer-backdrop" (click)="toggleDrawer()">
        <div class="drawer-sheet" (click)="$event.stopPropagation()">
          <div class="drawer-header">
            <div class="drawer-title">
              <span class="icon">🌾</span> Toàn Bộ Menu Chức Năng
            </div>
            <button class="btn-close-drawer" (click)="toggleDrawer()">✕</button>
          </div>

          <!-- BỘ CHUYỂN HTX TRÊN MOBILE -->
          <div class="drawer-section">
            <label class="drawer-section-label">🏢 Đang chọn HTX:</label>
            <select class="form-control" [value]="state.selectedHtxId()" (change)="onHtxChange($event)">
              @for (htx of state.cooperatives(); track htx.id) {
                <option [value]="htx.id">{{ htx.logo }} {{ htx.name }}</option>
              }
            </select>
          </div>

          <!-- BỘ CHUYỂN VAI TRÒ TRÊN MOBILE -->
          <div class="drawer-section">
            <label class="drawer-section-label">👤 Đổi vai trò tài khoản:</label>
            <select class="form-control" [value]="state.currentUser().id" (change)="onRoleChange($event)">
              @for (u of mockData.demoUsers; track u.id) {
                <option [value]="u.id">{{ u.avatar }} {{ u.name }} ({{ u.roleTitle }})</option>
              }
            </select>
          </div>

          <!-- DANH SÁCH MENU ĐẦY ĐỦ -->
          <div class="drawer-menu-grid">
            <a routerLink="/demo-hub" (click)="toggleDrawer()" class="drawer-item">
              <span class="item-icon">🧭</span>
              <span class="item-text">Mục lục Demo</span>
            </a>
            <a routerLink="/dashboard" (click)="toggleDrawer()" class="drawer-item">
              <span class="item-icon">📊</span>
              <span class="item-text">Dashboard HTX</span>
            </a>
            <a routerLink="/members" (click)="toggleDrawer()" class="drawer-item">
              <span class="item-icon">👥</span>
              <span class="item-text">Quản lý Xã viên</span>
            </a>
            <a routerLink="/production/zones" (click)="toggleDrawer()" class="drawer-item">
              <span class="item-icon">🗺️</span>
              <span class="item-text">Vùng canh tác</span>
            </a>
            <a routerLink="/production/logs" (click)="toggleDrawer()" class="drawer-item">
              <span class="item-icon">📝</span>
              <span class="item-text">Nhật ký sản xuất</span>
            </a>
            <a routerLink="/warehouse" (click)="toggleDrawer()" class="drawer-item">
              <span class="item-icon">📦</span>
              <span class="item-text">Kho vật tư</span>
            </a>
            <a routerLink="/harvest-packaging" (click)="toggleDrawer()" class="drawer-item">
              <span class="item-icon">🏷️</span>
              <span class="item-text">Đóng gói & Tem QR</span>
            </a>
            <a routerLink="/sales" (click)="toggleDrawer()" class="drawer-item">
              <span class="item-icon">🛒</span>
              <span class="item-text">Bán hàng & Hóa đơn</span>
            </a>
            <a routerLink="/reports" (click)="toggleDrawer()" class="drawer-item">
              <span class="item-icon">📈</span>
              <span class="item-text">Báo cáo tổng hợp</span>
            </a>
            <a routerLink="/system-admin/roles" (click)="toggleDrawer()" class="drawer-item">
              <span class="item-icon">🛡️</span>
              <span class="item-text">Phân quyền hệ thống</span>
            </a>
            <a routerLink="/system-admin/technical-manuals" (click)="toggleDrawer()" class="drawer-item">
              <span class="item-icon">📚</span>
              <span class="item-text">Tài liệu Nông nghiệp</span>
            </a>
            <a routerLink="/trace/HY-AN-ST25-2026-0988" target="_blank" (click)="toggleDrawer()" class="drawer-item qr-public-item">
              <span class="item-icon">🔍</span>
              <span class="item-text">Trang quét QR Công khai ↗</span>
            </a>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .bottom-nav {
      display: none;
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      height: 68px;
      background-color: #ffffff;
      border-top: 2px solid var(--border-color);
      z-index: 990;
      box-shadow: 0 -4px 10px rgba(0,0,0,0.08);
      justify-content: space-around;
      align-items: center;
      padding: 0 4px;
    }

    .bottom-tab {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 2px;
      height: 100%;
      text-decoration: none;
      color: var(--text-muted);
      background: transparent;
      border: none;
      cursor: pointer;
      position: relative;
    }

    .tab-icon {
      font-size: 22px;
      line-height: 1;
    }

    .tab-label {
      font-size: 12px;
      font-weight: 700;
    }

    .bottom-tab.active {
      color: var(--primary-700);
    }

    .bottom-tab.active .tab-icon {
      transform: scale(1.1);
    }

    .action-tab .plus-circle {
      width: 38px;
      height: 38px;
      border-radius: var(--radius-full);
      background: var(--primary-700);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      box-shadow: var(--shadow-md);
      margin-top: -12px;
    }

    .mobile-badge {
      position: absolute;
      top: 6px;
      right: 22%;
      background: var(--danger-600);
      color: white;
      font-size: 11px;
      font-weight: 800;
      padding: 1px 6px;
      border-radius: var(--radius-full);
    }

    /* DRAWER SHEET TRÊN MOBILE */
    .drawer-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.7);
      z-index: 9995;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      animation: fadeIn 0.2s ease;
    }

    .drawer-sheet {
      background: #ffffff;
      border-radius: 24px 24px 0 0;
      padding: 20px 20px 30px 20px;
      max-height: 85vh;
      overflow-y: auto;
      animation: slideUp 0.25s ease;
    }

    .drawer-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 2px solid var(--border-color);
    }

    .drawer-title {
      font-size: 18px;
      font-weight: 800;
      color: var(--text-main);
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .btn-close-drawer {
      width: 40px;
      height: 40px;
      border-radius: var(--radius-full);
      border: 2px solid var(--border-color);
      background: var(--bg-app);
      font-size: 18px;
      font-weight: 800;
      cursor: pointer;
    }

    .drawer-section {
      margin-bottom: 14px;
    }

    .drawer-section-label {
      font-size: 13px;
      font-weight: 700;
      color: var(--text-muted);
      margin-bottom: 4px;
      display: block;
    }

    .drawer-menu-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
      margin-top: 14px;
    }

    .drawer-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px;
      background: var(--bg-card-subtle);
      border: 1.5px solid var(--border-color);
      border-radius: var(--radius-md);
      text-decoration: none;
      color: var(--text-main);
      font-size: 14px;
      font-weight: 700;
    }

    .drawer-item:hover {
      background: var(--primary-100);
      border-color: var(--primary-600);
    }

    .qr-public-item {
      grid-column: span 2;
      background: var(--amber-50);
      border-color: var(--amber-600);
      color: var(--amber-800);
    }

    @keyframes slideUp {
      from { transform: translateY(100%); }
      to { transform: translateY(0); }
    }

    @media (max-width: 900px) {
      .bottom-nav {
        display: flex;
      }
    }
  `]
})
export class BottomNavComponent {
  state = inject(HtxStateService);
  mockData = inject(MockDataService);
  showDrawer = signal(false);

  toggleDrawer() {
    this.showDrawer.update(v => !v);
  }

  onHtxChange(e: Event) {
    const target = e.target as HTMLSelectElement;
    if (target.value) {
      this.state.switchHtx(target.value);
    }
  }

  onRoleChange(e: Event) {
    const target = e.target as HTMLSelectElement;
    const user = this.mockData.demoUsers.find(u => u.id === target.value);
    if (user) {
      this.state.switchUser(user);
    }
  }
}
