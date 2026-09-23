import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HtxStateService } from '../../../core/services/htx-state.service';
import { ToastService } from '../../../core/services/toast.service';

export interface SystemParameters {
  otpExpiryMinutes: number;
  maxFailedLogins: number;
  qrPrefixFormat: string;
  logReminderFrequencyDays: number;
  maxFileUploadMb: number;
  autoLockLogHours: number;
  defaultMinStockAlert: number;
  enableZaloSync: boolean;
  enableAuditLog: boolean;
  systemMaintenanceMode: boolean;
}

@Component({
  selector: 'app-system-parameters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="system-params-page">
      <!-- HEADER TRANG -->
      <div class="page-top">
        <div>
          <div class="page-sub">MODULE 1 • QUẢN TRỊ HỆ THỐNG (CN-1.4.1)</div>
          <h1 class="page-title">Cấu Hình Tham Số Vận Hành Hệ Thống</h1>
        </div>
        <div class="top-actions">
          <button class="btn btn-secondary" (click)="resetDefaults()">
            <span>🔄</span> Khôi Phục Mặc Định
          </button>
          <button class="btn btn-primary" (click)="saveParameters()">
            <span>💾</span> LƯU THAY ĐỔI THAM SỐ
          </button>
        </div>
      </div>

      <!-- LƯU Ý QUẢN TRỊ -->
      <div class="alert-box">
        <span class="alert-icon">ℹ️</span>
        <div>
          <strong>Lưu ý cấu hình tham số cốt lõi:</strong> Các tham số dưới đây ảnh hưởng trực tiếp đến quy tắc bảo mật xác thực, sinh mã định danh QR truy xuất nguồn gốc và cơ chế đồng bộ dữ liệu giữa Web Admin và Zalo Mini App. Chỉ Quản trị viên hệ thống (R01) mới có quyền điều chỉnh.
        </div>
      </div>

      <!-- FORM THAM SỐ CHIA THÀNH CÁC KHỐI NGHIỆP VỤ -->
      <div class="params-grid">
        <!-- KHỐI 1: BẢO MẬT & XÁC THỰC -->
        <div class="card param-section">
          <div class="card-header">
            <h2 class="card-title">🔐 1. Xác Thực & Bảo Mật Tài Khoản (CN-1.1)</h2>
          </div>
          
          <div class="form-group">
            <label class="form-label">Thời gian hiệu lực của mã OTP xác thực (phút):</label>
            <div class="stepper">
              <button type="button" class="stepper-btn" (click)="adjustVal('otpExpiryMinutes', -1)">-</button>
              <input type="number" class="stepper-input" [(ngModel)]="params.otpExpiryMinutes" min="1" max="30" />
              <button type="button" class="stepper-btn" (click)="adjustVal('otpExpiryMinutes', 1)">+</button>
            </div>
            <div class="form-hint">Thời gian mã OTP gửi qua tin nhắn Zalo / SMS duy trì tính khả dụng (Mặc định: 5 phút).</div>
          </div>

          <div class="form-group">
            <label class="form-label">Số lần đăng nhập sai tối đa trước khi tạm khóa:</label>
            <div class="stepper">
              <button type="button" class="stepper-btn" (click)="adjustVal('maxFailedLogins', -1)">-</button>
              <input type="number" class="stepper-input" [(ngModel)]="params.maxFailedLogins" min="3" max="10" />
              <button type="button" class="stepper-btn" (click)="adjustVal('maxFailedLogins', 1)">+</button>
            </div>
            <div class="form-hint">Bảo vệ tài khoản chống lại tấn công dò mật khẩu tự động (Mặc định: 5 lần).</div>
          </div>
        </div>

        <!-- KHỐI 2: ĐỊNH DẠNG MÃ QR & TRUY XUẤT NGUỒN GỐC -->
        <div class="card param-section">
          <div class="card-header">
            <h2 class="card-title">🏷️ 2. Định Dạng Mã Sản Phẩm & Tem QR Code (CN-2.10)</h2>
          </div>

          <div class="form-group">
            <label class="form-label">Cấu trúc quy tắc định dạng tiền tố mã QR / Lô:</label>
            <input 
              type="text" 
              class="form-control" 
              [(ngModel)]="params.qrPrefixFormat" 
              placeholder="HY-{HTX}-{PROD}-{YEAR}-{BATCH}" 
            />
            <div class="form-hint">Mã mẫu sinh ra: <strong>HY-AN-ST25-2026-0988</strong> (HY: Hưng Yên, AN: HTX An Ninh, ST25: Giống lúa).</div>
          </div>

          <div class="form-group">
            <label class="form-label">Dung lượng tối đa mỗi file ảnh / tài liệu đính kèm (MB):</label>
            <div class="stepper">
              <button type="button" class="stepper-btn" (click)="adjustVal('maxFileUploadMb', -5)">-</button>
              <input type="number" class="stepper-input" [(ngModel)]="params.maxFileUploadMb" min="5" max="50" />
              <button type="button" class="stepper-btn" (click)="adjustVal('maxFileUploadMb', 5)">+</button>
            </div>
            <div class="form-hint">Giới hạn dung lượng tải ảnh chụp nhật ký ngoài đồng và file PDF chứng nhận OCOP (Mặc định: 15 MB).</div>
          </div>
        </div>

        <!-- KHỐI 3: QUẢN TRỊ SẢN XUẤT & NHẬT KÝ ĐỒNG RUỘNG -->
        <div class="card param-section">
          <div class="card-header">
            <h2 class="card-title">🌾 3. Vận Hành Nhật Ký Sản Xuất & Kho (CN-2.5 & CN-2.7)</h2>
          </div>

          <div class="form-group">
            <label class="form-label">Tần suất nhắc lịch ghi nhật ký đồng ruộng (ngày):</label>
            <div class="stepper">
              <button type="button" class="stepper-btn" (click)="adjustVal('logReminderFrequencyDays', -1)">-</button>
              <input type="number" class="stepper-input" [(ngModel)]="params.logReminderFrequencyDays" min="1" max="14" />
              <button type="button" class="stepper-btn" (click)="adjustVal('logReminderFrequencyDays', 1)">+</button>
            </div>
            <div class="form-hint">Hệ thống tự động gửi thông báo qua Zalo nhắc bác nông dân cập nhật nhật ký canh tác (Mặc định: 3 ngày/lần).</div>
          </div>

          <div class="form-group">
            <label class="form-label">Thời hạn tự động khóa / lưu vết mã hóa nhật ký (giờ):</label>
            <div class="stepper">
              <button type="button" class="stepper-btn" (click)="adjustVal('autoLockLogHours', -12)">-</button>
              <input type="number" class="stepper-input" [(ngModel)]="params.autoLockLogHours" min="12" max="168" />
              <button type="button" class="stepper-btn" (click)="adjustVal('autoLockLogHours', 12)">+</button>
            </div>
            <div class="form-hint">Sau khoảng thời gian này, nhật ký sản xuất được đóng dấu Hash bất biến để đảm bảo tính trung thực (Mặc định: 48 giờ).</div>
          </div>

          <div class="form-group">
            <label class="form-label">Mức cảnh báo tồn kho tối thiểu mặc định (kg / bao / chai):</label>
            <div class="stepper">
              <button type="button" class="stepper-btn" (click)="adjustVal('defaultMinStockAlert', -10)">-</button>
              <input type="number" class="stepper-input" [(ngModel)]="params.defaultMinStockAlert" min="5" max="500" />
              <button type="button" class="stepper-btn" (click)="adjustVal('defaultMinStockAlert', 10)">+</button>
            </div>
            <div class="form-hint">Cảnh báo màu cam khi số lượng vật tư trong kho xuống dưới ngưỡng này.</div>
          </div>
        </div>

        <!-- KHỐI 4: ĐỒNG BỘ NỀN TẢNG & AUDIT LOG -->
        <div class="card param-section">
          <div class="card-header">
            <h2 class="card-title">⚙️ 4. Cơ Chế Đồng Bộ & Giám Sát Hệ Thống</h2>
          </div>

          <div class="toggle-row">
            <div>
              <div class="toggle-title">Đồng bộ dữ liệu thời gian thực với Zalo Mini App</div>
              <div class="form-hint">Tự động cập nhật hồ sơ, đơn duyệt và nhật ký giữa Web Admin và ứng dụng điện thoại.</div>
            </div>
            <label class="switch">
              <input type="checkbox" [(ngModel)]="params.enableZaloSync" />
              <span class="slider round"></span>
            </label>
          </div>

          <div class="toggle-row">
            <div>
              <div class="toggle-title">Kích hoạt Nhật ký Kiểm toán (Audit Log)</div>
              <div class="form-hint">Ghi nhận toàn bộ vết thao tác Thêm / Sửa / Xóa / Duyệt trên mọi thực thể dữ liệu quan trọng.</div>
            </div>
            <label class="switch">
              <input type="checkbox" [(ngModel)]="params.enableAuditLog" />
              <span class="slider round"></span>
            </label>
          </div>

          <div class="toggle-row">
            <div>
              <div class="toggle-title">Chế độ Bảo trì Hệ thống</div>
              <div class="form-hint">Tạm dừng truy cập người dùng phổ thông khi nâng cấp phiên bản phần mềm.</div>
            </div>
            <label class="switch">
              <input type="checkbox" [(ngModel)]="params.systemMaintenanceMode" />
              <span class="slider round"></span>
            </label>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .system-params-page {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .page-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 8px;
    }

    .page-sub {
      font-size: 11px;
      font-weight: 800;
      color: var(--primary-700);
      letter-spacing: 0.5px;
    }

    .page-title {
      font-size: 18px;
      color: var(--text-main);
      margin: 0;
    }

    .top-actions {
      display: flex;
      gap: 8px;
    }

    .alert-box {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      background-color: var(--info-50);
      border: 1.5px solid var(--info-600);
      border-radius: var(--radius-sm);
      font-size: 12.5px;
      color: var(--info-900, #1e3a8a);
      line-height: 1.4;
    }

    .alert-icon {
      font-size: 20px;
    }

    .params-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 10px;
    }

    .param-section {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .toggle-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 14px 0;
      border-bottom: 1px solid #e2e8f0;
    }

    .toggle-row:last-child {
      border-bottom: none;
    }

    .toggle-title {
      font-size: 15.5px;
      font-weight: 700;
      color: var(--text-main);
    }

    /* TOGGLE SWITCH */
    .switch {
      position: relative;
      display: inline-block;
      width: 52px;
      height: 28px;
      flex-shrink: 0;
    }

    .switch input {
      opacity: 0;
      width: 0;
      height: 0;
    }

    .slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: #cbd5e1;
      transition: .3s;
      border-radius: 28px;
    }

    .slider:before {
      position: absolute;
      content: "";
      height: 22px;
      width: 22px;
      left: 3px;
      bottom: 3px;
      background-color: white;
      transition: .3s;
      border-radius: 50%;
    }

    input:checked + .slider {
      background-color: var(--primary-700);
    }

    input:checked + .slider:before {
      transform: translateX(24px);
    }

    @media (max-width: 768px) {
      .params-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class SystemParametersComponent {
  state = inject(HtxStateService);
  toast = inject(ToastService);

  params: SystemParameters = {
    otpExpiryMinutes: 5,
    maxFailedLogins: 5,
    qrPrefixFormat: 'HY-{HTX}-{PROD}-{YEAR}',
    logReminderFrequencyDays: 3,
    maxFileUploadMb: 15,
    autoLockLogHours: 48,
    defaultMinStockAlert: 50,
    enableZaloSync: true,
    enableAuditLog: true,
    systemMaintenanceMode: false
  };

  adjustVal(field: keyof SystemParameters, delta: number) {
    const curr = Number(this.params[field]);
    if (!isNaN(curr)) {
      const next = Math.max(1, curr + delta);
      (this.params as any)[field] = next;
    }
  }

  saveParameters() {
    this.toast.success(
      'Lưu cấu hình thành công!',
      'Các tham số vận hành hệ thống đã được áp dụng ngay lập tức trên toàn bộ các phân hệ.'
    );
  }

  resetDefaults() {
    this.params = {
      otpExpiryMinutes: 5,
      maxFailedLogins: 5,
      qrPrefixFormat: 'HY-{HTX}-{PROD}-{YEAR}',
      logReminderFrequencyDays: 3,
      maxFileUploadMb: 15,
      autoLockLogHours: 48,
      defaultMinStockAlert: 50,
      enableZaloSync: true,
      enableAuditLog: true,
      systemMaintenanceMode: false
    };
    this.toast.info('Đã khôi phục mặc định', 'Cấu hình tham số đã đưa về trạng thái tiêu chuẩn khuyến nghị.');
  }
}
