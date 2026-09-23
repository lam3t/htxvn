import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { HtxStateService } from '../../core/services/htx-state.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <aside class="app-sidebar">
      <!-- KHÔNG GIAN HTX ĐANG LÀM VIỆC (SIÊU RÕ RÀNG) -->
      <div class="active-htx-sidebar-card">
        <div class="htx-card-header-sub">
          <span class="live-dot">●</span> ĐANG QUẢN TRỊ HTX
        </div>
        <div class="htx-card-main-row">
          <span class="htx-card-logo">{{ state.currentHtx().logo }}</span>
          <div class="htx-card-text">
            <div class="htx-card-title">{{ state.currentHtx().shortName }}</div>
            <div class="htx-card-sub">{{ state.currentHtx().district }}</div>
          </div>
        </div>
        @if (state.canSwitchHtx()) {
          <a routerLink="/htx-network" class="btn-switch-htx-link" title="Đổi sang Hợp tác xã khác (Admin)">
            <span>🔄 Đổi Hợp Tác Xã</span>
          </a>
        } @else {
          <div class="htx-locked-sidebar-tag">
            <span>🔒 Phạm vi HTX trực thuộc</span>
          </div>
        }
      </div>

      <!-- USER PROFILE MINI CARD -->
      <div class="user-mini-card">
        <span class="user-avatar">{{ state.currentUser().avatar }}</span>
        <div class="user-info">
          <div class="user-name">{{ state.currentUser().name }}</div>
          <div class="user-role-badge" [class]="'role-' + state.currentUser().role">
            {{ state.currentUser().roleTitle }}
          </div>
        </div>
      </div>

      <!-- DANH SÁCH MENU ĐIỀU HƯỚNG (LỌC THEO VAI TRÒ) -->
      <nav class="nav-menu">
        <div class="nav-section-title">CHỨC NĂNG CHÍNH</div>

        <!-- MỤC LỤC DEMO HUB -->
        <a routerLink="/demo-hub" routerLinkActive="active" class="nav-item">
          <span class="nav-icon">🧭</span>
          <span class="nav-text">Mục lục Tổng quan Demo</span>
        </a>

        <!-- DASHBOARD -->
        @if (state.currentUser().role === 'admin' || state.currentUser().role === 'director' || state.currentUser().role === 'accountant') {
          <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">📊</span>
            <span class="nav-text">Bảng điều khiển HTX</span>
          </a>
        }

        @if (state.currentUser().role === 'member') {
          <a routerLink="/dashboard/member" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">🏡</span>
            <span class="nav-text">Trang chủ Xã viên</span>
          </a>
        }

        <!-- MODULE C: QUẢN LÝ HTX & THÀNH VIÊN -->
        @if (state.currentUser().role === 'admin' || state.currentUser().role === 'director') {
          <div class="nav-section-title">QUẢN TRỊ HTX</div>
          <a routerLink="/htx-network" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">🏢</span>
            <span class="nav-text">Mạng lưới Hợp Tác Xã</span>
          </a>
          <a routerLink="/members" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">👥</span>
            <span class="nav-text">Quản lý Thành viên</span>
            @if (state.pendingMembers().length > 0) {
              <span class="nav-badge">{{ state.pendingMembers().length }}</span>
            }
          </a>
          <a routerLink="/htx-profile" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">📜</span>
            <span class="nav-text">Hồ sơ & Chứng nhận HTX</span>
          </a>
          <a routerLink="/partners" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">🤝</span>
            <span class="nav-text">Đối tác & Phân phối</span>
          </a>
        }

        <!-- MODULE D: QUẢN LÝ SẢN XUẤT & NHẬT KÝ -->
        @if (state.currentUser().role === 'admin' || state.currentUser().role === 'director' || state.currentUser().role === 'technician' || state.currentUser().role === 'member') {
          <div class="nav-section-title">SẢN XUẤT & TRUY XUẤT</div>
          <a routerLink="/production/zones" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">🗺️</span>
            <span class="nav-text">Vùng trồng & Chăn nuôi</span>
          </a>
          <a routerLink="/production/logs" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">📝</span>
            <span class="nav-text">Nhật ký Sản xuất (Hash)</span>
          </a>
          <a routerLink="/production/processes" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">🌱</span>
            <span class="nav-text">Quy trình Mùa vụ</span>
          </a>
        }

        <!-- MODULE F & G: KHO, ĐÓNG GÓI QR & BÁN HÀNG -->
        @if (state.currentUser().role === 'admin' || state.currentUser().role === 'director' || state.currentUser().role === 'accountant') {
          <div class="nav-section-title">KHO & THƯƠNG MẠI</div>
          <a routerLink="/warehouse" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">📦</span>
            <span class="nav-text">Quản lý Kho Vật tư</span>
          </a>
          <a routerLink="/harvest-packaging" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">🏷️</span>
            <span class="nav-text">Thu hoạch & Tem QR Code</span>
          </a>
          <a routerLink="/sales" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">🛒</span>
            <span class="nav-text">Bán hàng & Hóa đơn</span>
          </a>
          <a routerLink="/reports" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">📈</span>
            <span class="nav-text">Báo cáo Quản trị</span>
          </a>
        }

        <!-- MODULE B: QUẢN TRỊ HỆ THỐNG (CHỈ ADMIN) -->
        @if (state.currentUser().role === 'admin') {
          <div class="nav-section-title">QUẢN TRỊ HỆ THỐNG HTX</div>
          <a routerLink="/system-admin/roles" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">🛡️</span>
            <span class="nav-text">Phân quyền Ma trận</span>
          </a>
          <a routerLink="/system-admin/master-data" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">🗂️</span>
            <span class="nav-text">Danh mục Dùng chung</span>
          </a>
          <a routerLink="/system-admin/technical-manuals" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">📚</span>
            <span class="nav-text">Tài liệu Nông nghiệp</span>
          </a>
          <a routerLink="/system-admin/parameters" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">⚙️</span>
            <span class="nav-text">Cấu hình Tham số (CN-1.4)</span>
          </a>
        }


        <!-- MODULE H: TRANG TRUY XUẤT CÔNG KHAI -->
        <div class="nav-section-title">NGƯỜI TIÊU DÙNG</div>
        <a routerLink="/trace/HY-AN-ST25-2026-0988" target="_blank" class="nav-item public-nav-item">
          <span class="nav-icon">🔍</span>
          <span class="nav-text">Trang quét QR Công khai ↗</span>
        </a>
      </nav>

      <!-- FOOTER SIDEBAR -->
      <div class="sidebar-footer">
        <div class="htx-cert-badge">
          <span class="cert-icon">⭐</span>
          <span>{{ state.currentHtx().ocopLevel }}</span>
        </div>
      </div>
    </aside>
  `,
  styles: [`
    .app-sidebar {
      width: 215px;
      min-width: 215px;
      background-color: #ffffff;
      border-right: 1.5px solid var(--border-color);
      display: flex;
      flex-direction: column;
      height: calc(100vh - 48px);
      position: sticky;
      top: 48px;
      overflow-y: auto;
    }

    .active-htx-sidebar-card {
      padding: 8px 10px;
      background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
      border-bottom: 1.5px solid var(--primary-300);
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .htx-card-header-sub {
      font-size: 10px;
      font-weight: 800;
      color: var(--primary-800);
      letter-spacing: 0.5px;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .live-dot {
      color: var(--primary-600);
      font-size: 10px;
      animation: pulse 1.5s infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(0.85); }
    }

    .htx-card-main-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .htx-card-logo {
      font-size: 20px;
      width: 32px;
      height: 32px;
      background: #ffffff;
      border: 1.5px solid var(--primary-400);
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    }

    .htx-card-text {
      min-width: 0;
      flex: 1;
    }

    .htx-card-title {
      font-size: 12.5px;
      font-weight: 800;
      color: var(--primary-950);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      line-height: 1.2;
    }

    .htx-card-sub {
      font-size: 10.5px;
      color: var(--primary-700);
      font-weight: 600;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin-top: 1px;
    }

    .btn-switch-htx-link {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      font-size: 11px;
      font-weight: 700;
      color: var(--primary-800);
      background: #ffffff;
      border: 1px solid var(--primary-400);
      border-radius: 4px;
      padding: 3px 6px;
      text-decoration: none;
      transition: all 0.15s;
    }

    .btn-switch-htx-link:hover {
      background: var(--primary-600);
      color: #ffffff;
      border-color: var(--primary-600);
    }

    .htx-locked-sidebar-tag {
      font-size: 10.5px;
      font-weight: 700;
      color: var(--primary-900);
      background: rgba(255, 255, 255, 0.7);
      border: 1px dashed var(--primary-400);
      border-radius: 4px;
      padding: 3px 6px;
      text-align: center;
    }

    .user-mini-card {
      padding: 6px 10px;
      background: var(--bg-card-subtle);
      border-bottom: 1.5px solid var(--border-color);
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .user-avatar {
      font-size: 18px;
      width: 32px;
      height: 32px;
      background: white;
      border: 1.5px solid var(--border-color);
      border-radius: var(--radius-full);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .user-info {
      overflow: hidden;
    }

    .user-name {
      font-size: 13px;
      font-weight: 800;
      color: var(--text-main);
      line-height: 1.2;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .user-role-badge {
      font-size: 10px;
      font-weight: 700;
      padding: 1px 5px;
      border-radius: var(--radius-sm);
      display: inline-block;
      margin-top: 1px;
      background: var(--primary-100);
      color: var(--primary-900);
    }
    .role-admin { background: #dbeafe; color: #1e40af; }
    .role-director { background: #fef3c7; color: #92400e; }
    .role-technician { background: #dcfce7; color: #166534; }
    .role-accountant { background: #f3e8ff; color: #6b21a8; }
    .role-member { background: #e0f2fe; color: #0369a1; }

    .nav-menu {
      flex: 1;
      padding: 6px 6px;
      display: flex;
      flex-direction: column;
      gap: 1px;
    }

    .nav-section-title {
      font-size: 10px;
      font-weight: 800;
      color: var(--text-muted);
      letter-spacing: 0.5px;
      padding: 6px 6px 2px 6px;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 5px 8px;
      min-height: 32px;
      border-radius: var(--radius-sm);
      color: var(--text-body);
      text-decoration: none;
      font-size: 12.5px;
      font-weight: 700;
      transition: all 0.15s ease;
      position: relative;
    }

    .nav-item:hover {
      background-color: var(--bg-app);
      color: var(--text-main);
    }

    .nav-item.active {
      background-color: var(--primary-100);
      color: var(--primary-900);
      border-left: 3px solid var(--primary-700);
    }

    .nav-icon {
      font-size: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .nav-text {
      flex: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .nav-badge {
      background-color: var(--danger-600);
      color: white;
      font-size: 11px;
      font-weight: 800;
      padding: 1px 6px;
      border-radius: var(--radius-full);
    }

    .public-nav-item {
      background-color: var(--amber-50);
      color: var(--amber-800);
      border: 1px dashed var(--amber-600);
    }
    .public-nav-item:hover {
      background-color: var(--amber-100);
    }

    .sidebar-footer {
      padding: 8px 10px;
      border-top: 1px solid var(--border-color);
      background-color: var(--bg-card-subtle);
    }

    .htx-cert-badge {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      font-weight: 800;
      color: var(--amber-800);
      background: var(--amber-100);
      padding: 4px 8px;
      border-radius: var(--radius-sm);
      border: 1px solid var(--amber-600);
    }

    @media (max-width: 900px) {
      .app-sidebar {
        display: none;
      }
    }
  `]
})
export class SidebarComponent {
  state = inject(HtxStateService);
}
