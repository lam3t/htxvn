import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HtxStateService } from '../../../core/services/htx-state.service';
import { MockDataService } from '../../../core/services/mock-data.service';
import { ToastService } from '../../../core/services/toast.service';
import { User } from '../../../core/models/htx.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="login-wrapper">
      <div class="login-container">
        <!-- LOGO & TIÊU ĐỀ -->
        <div class="login-header">
          <div class="logo-circle">{{ state.currentHtx().logo }}</div>
          <div class="header-badge">HỆ THỐNG QUẢN TRỊ SỐ HỢP TÁC XÃ</div>
          <h1 class="login-title">Quản Trị Sản Xuất & Truy Xuất Nguồn Gốc</h1>
          <p class="login-subtitle">{{ state.currentHtx().name }}</p>
        </div>

        <!-- FORM ĐĂNG NHẬP -->
        <div class="card login-card">
          <div class="form-tabs">
            <button class="tab-btn" [class.active]="activeTab() === 'login'" (click)="activeTab.set('login')">
              Đăng Nhập
            </button>
            <button class="tab-btn" [class.active]="activeTab() === 'change-pass'" (click)="activeTab.set('change-pass')">
              Đổi Mật Khẩu
            </button>
          </div>

          @if (activeTab() === 'login') {
            <form (submit)="onSubmit($event)">
              <div class="form-group">
                <label class="form-label" for="username">Tên đăng nhập hoặc Số điện thoại:</label>
                <input 
                  type="text" 
                  id="username" 
                  class="form-control" 
                  placeholder="Ví dụ: admin hoặc 0983245118" 
                  [(ngModel)]="username" 
                  name="username" 
                  required
                />
              </div>

              <div class="form-group">
                <label class="form-label" for="password">Mật khẩu:</label>
                <input 
                  type="password" 
                  id="password" 
                  class="form-control" 
                  placeholder="Nhập mật khẩu..." 
                  [(ngModel)]="password" 
                  name="password" 
                  required
                />
              </div>

              <div class="form-meta">
                <label class="remember-me">
                  <input type="checkbox" [(ngModel)]="rememberMe" name="rememberMe" />
                  <span>Ghi nhớ đăng nhập</span>
                </label>
                <button type="button" class="btn-text" (click)="showForgotModal.set(true)">
                  Quên mật khẩu?
                </button>
              </div>

              <button type="submit" class="btn btn-primary btn-lg btn-block">
                <span>ĐĂNG NHẬP VÀO HỆ THỐNG</span> ➔
              </button>
            </form>
          } @else {
            <form (submit)="onChangePassword($event)">
              <div class="form-group">
                <label class="form-label">Mật khẩu hiện tại:</label>
                <input type="password" class="form-control" placeholder="Nhập mật khẩu cũ..." required />
              </div>
              <div class="form-group">
                <label class="form-label">Mật khẩu mới (tối thiểu 6 ký tự):</label>
                <input type="password" class="form-control" placeholder="Nhập mật khẩu mới..." required />
              </div>
              <div class="form-group">
                <label class="form-label">Nhập lại mật khẩu mới:</label>
                <input type="password" class="form-control" placeholder="Xác nhận lại mật khẩu mới..." required />
              </div>
              <button type="submit" class="btn btn-primary btn-lg btn-block">
                XÁC NHẬN ĐỔI MẬT KHẨU
              </button>
            </form>
          }

          <!-- BỘ ĐĂNG NHẬP NHANH DÀNH CHO LÃNH ĐẠO TEST DEMO -->
          <div class="quick-demo-section">
            <div class="quick-title">⚡ ĐĂNG NHẬP NHANH (1 CHẠM ĐỂ TRẢI NGHIỆM):</div>
            <div class="quick-roles-grid">
              @for (u of mockData.demoUsers; track u.id) {
                <button type="button" class="quick-role-btn" (click)="quickLogin(u)">
                  <span class="role-icon">{{ u.avatar }}</span>
                  <div class="role-desc">
                    <span class="role-name">{{ u.name }}</span>
                    <span class="role-label">{{ u.roleTitle }}</span>
                  </div>
                </button>
              }
            </div>
          </div>
        </div>

        <!-- FOOTER BẢO TRỢ -->
        <div class="login-footer">
          <p>© 2026 Hệ Thống Quản Trị Hợp Tác Xã & Truy Xuất Nguồn Gốc Nông Sản</p>
          <a routerLink="/demo-hub" class="footer-hub-link">🧭 Quay lại Mục Lục Demo</a>
        </div>
      </div>

      <!-- MODAL QUÊN MẬT KHẨU -->
      @if (showForgotModal()) {
        <div class="modal-backdrop">
          <div class="modal-dialog">
            <div class="modal-header-simple">
              <h2 class="card-title">🔑 Khôi Phục Mật Khẩu</h2>
              <button type="button" class="btn-close-modal" (click)="showForgotModal.set(false)" title="Đóng">✕</button>
            </div>
            <p style="margin: 0 0 16px; color: var(--text-muted); font-size: 14.5px;">
              Vui lòng nhập Số điện thoại hoặc CCCD đã đăng ký với Hợp tác xã. Hệ thống sẽ gửi mã OTP xác thực qua Zalo / Tin nhắn.
            </p>
            <div class="form-group">
              <label class="form-label">Số điện thoại / CCCD: <span class="required">*</span></label>
              <input type="text" class="form-control" placeholder="Ví dụ: 0983 245 118" />
            </div>
            <div class="modal-actions">
              <button class="btn btn-secondary" (click)="showForgotModal.set(false)">Hủy bỏ</button>
              <button class="btn btn-primary" (click)="onSendOtp()">Gửi Mã OTP Qua Zalo</button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .login-wrapper {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #f0fdf4 0%, #e2e8f0 100%);
      padding: 24px 16px;
    }

    .login-container {
      width: 100%;
      max-width: 580px;
    }

    .login-header {
      text-align: center;
      margin-bottom: 24px;
    }

    .logo-circle {
      width: 72px;
      height: 72px;
      background: #ffffff;
      border: 3px solid var(--primary-600);
      border-radius: var(--radius-full);
      font-size: 40px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      box-shadow: var(--shadow-md);
      margin-bottom: 12px;
    }

    .header-badge {
      display: inline-block;
      background: var(--primary-100);
      color: var(--primary-900);
      font-size: 13px;
      font-weight: 800;
      padding: 4px 12px;
      border-radius: var(--radius-full);
      margin-bottom: 8px;
    }

    .login-title {
      font-size: 24px;
      font-weight: 800;
      color: var(--text-main);
      margin-bottom: 6px;
      line-height: 1.25;
    }

    .login-subtitle {
      font-size: 16px;
      font-weight: 700;
      color: var(--primary-800);
    }

    .login-card {
      padding: 28px;
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-xl);
    }

    .form-tabs {
      display: flex;
      border-bottom: 2px solid var(--border-color);
      margin-bottom: 24px;
    }

    .tab-btn {
      flex: 1;
      padding: 12px;
      background: transparent;
      border: none;
      border-bottom: 3px solid transparent;
      font-size: 16px;
      font-weight: 700;
      color: var(--text-muted);
      cursor: pointer;
    }

    .tab-btn.active {
      color: var(--primary-700);
      border-bottom-color: var(--primary-700);
    }

    .form-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .remember-me {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
    }

    .remember-me input {
      width: 20px;
      height: 20px;
      accent-color: var(--primary-700);
    }

    .btn-text {
      background: transparent;
      border: none;
      color: var(--primary-700);
      font-size: 15px;
      font-weight: 700;
      cursor: pointer;
      text-decoration: underline;
    }

    .quick-demo-section {
      margin-top: 28px;
      padding-top: 20px;
      border-top: 2px dashed var(--border-color);
    }

    .quick-title {
      font-size: 13px;
      font-weight: 800;
      color: var(--amber-800);
      letter-spacing: 0.5px;
      margin-bottom: 12px;
    }

    .quick-roles-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
    }

    .quick-role-btn {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 12px;
      background: var(--bg-app);
      border: 1.5px solid var(--border-color);
      border-radius: var(--radius-md);
      cursor: pointer;
      text-align: left;
      transition: all 0.15s;
    }

    .quick-role-btn:hover {
      background: var(--primary-100);
      border-color: var(--primary-600);
    }

    .role-icon {
      font-size: 24px;
    }

    .role-name {
      font-size: 13px;
      font-weight: 800;
      color: var(--text-main);
      display: block;
    }

    .role-label {
      font-size: 11px;
      color: var(--text-muted);
      display: block;
    }

    .login-footer {
      text-align: center;
      margin-top: 20px;
      font-size: 13px;
      color: var(--text-muted);
    }

    .footer-hub-link {
      display: inline-block;
      margin-top: 8px;
      font-weight: 800;
      color: var(--primary-800);
      text-decoration: none;
    }
  `]
})
export class LoginComponent {
  state = inject(HtxStateService);
  mockData = inject(MockDataService);
  toast = inject(ToastService);
  router = inject(Router);

  activeTab = signal<'login' | 'change-pass'>('login');
  username = '';
  password = '';
  rememberMe = true;
  showForgotModal = signal(false);

  onSubmit(e: Event) {
    e.preventDefault();
    this.toast.success('Đăng nhập thành công', `Chào mừng bạn đến với CSDL ${this.state.currentHtx().name}`);
    this.router.navigate(['/dashboard']);
  }

  quickLogin(user: User) {
    this.state.switchUser(user);
    this.router.navigate(['/dashboard']);
  }

  onChangePassword(e: Event) {
    e.preventDefault();
    this.toast.success('Đổi mật khẩu thành công', 'Mật khẩu mới đã được cập nhật an toàn.');
    this.activeTab.set('login');
  }

  onSendOtp() {
    this.showForgotModal.set(false);
    this.toast.info('Đã gửi mã OTP', 'Mã xác thực đã được gửi tới tài khoản Zalo liên kết.');
  }
}
