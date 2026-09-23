import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HtxStateService } from '../../../core/services/htx-state.service';

@Component({
  selector: 'app-member-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="member-dash-wrap">
      <!-- LỜI CHÀO NỒNG ẤM DÀNH CHO XÃ VIÊN -->
      <div class="farmer-greeting-card">
        <div class="greeting-avatar">{{ state.currentUser().avatar }}</div>
        <div class="greeting-text">
          <div class="greeting-sub">SỔ TAY NÔNG VỤ ĐIỆN TỬ • {{ state.currentHtx().shortName }}</div>
          <h1 class="greeting-title">Kính chào Bác {{ state.currentUser().name }}!</h1>
          <p class="greeting-desc">
            Thời tiết hôm nay tại {{ state.currentHtx().district }}: <strong>Nắng đẹp 29°C, gió nhẹ</strong>. Rất thuận lợi cho đồng ruộng và chuồng trại.
          </p>
        </div>
      </div>

      <!-- NÚT HÀNH ĐỘNG KHỔ LỚN DỄ BẤM -->
      <div class="giant-actions-grid">
        <a routerLink="/production/logs" class="giant-btn giant-btn-primary">
          <span class="giant-icon">📝</span>
          <div class="giant-info">
            <span class="giant-title">GHI NHẬT KÝ HÔM NAY</span>
            <span class="giant-sub">Chụp ảnh cánh đồng, lưu lượng phân bón & bảo vệ mùa màng</span>
          </div>
        </a>

        <a href="tel:0977345678" class="giant-btn giant-btn-amber">
          <span class="giant-icon">📞</span>
          <div class="giant-info">
            <span class="giant-title">GỌI KỸ SƯ HỖ TRỢ</span>
            <span class="giant-sub">Bác Đặng Văn Hùng (Kỹ sư trưởng: 0977 345 678)</span>
          </div>
        </a>
      </div>

      <!-- THÔNG TIN THỬA RUỘNG / TRẠI NUÔI CỦA HỘ GIA ĐÌNH -->
      <div class="card my-parcel-card">
        <div class="card-header">
          <h2 class="card-title">🏡 Thửa Ruộng / Quy Mô Canh Tác Của Bác</h2>
          <span class="badge badge-success">Đã định danh CSDL</span>
        </div>
        <div class="parcel-grid">
          <div class="parcel-item">
            <span class="p-label">Sản phẩm canh tác:</span>
            <span class="p-val">{{ state.currentHtx().primaryProduct }}</span>
          </div>
          <div class="parcel-item">
            <span class="p-label">Quy mô diện tích:</span>
            <span class="p-val">1.8 héc-ta (Thuộc Vùng An Lạc 1)</span>
          </div>
          <div class="parcel-item">
            <span class="p-label">Tiêu chuẩn áp dụng:</span>
            <span class="p-val">VietGAP & OCOP 4 sao Hưng Yên</span>
          </div>
          <div class="parcel-item">
            <span class="p-label">Ngày dự kiến thu hoạch:</span>
            <span class="p-val text-green">25/10/2026 (Còn khoảng 32 ngày)</span>
          </div>
        </div>
      </div>

      <!-- VIỆC CẦN LÀM TUẦN NÀY (HƯỚNG DẪN BƯỚC ĐI TIẾP THEO) -->
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">📋 Lịch Nhắc Công Việc Tuần Này (Kỹ sư HTX hướng dẫn)</h2>
        </div>
        <div class="task-checklist">
          <div class="task-row done">
            <span class="check-box">✅</span>
            <div class="task-text">
              <strong>1. Bón thúc đòng đợt 2:</strong>
              <p>Đã hoàn thành ngày 20/09 (Đã bón phân vi sinh Quế Lâm).</p>
            </div>
          </div>

          <div class="task-row active-task">
            <span class="check-box">⏳</span>
            <div class="task-text">
              <strong>2. Kiểm tra sâu cuốn lá & đạo ôn cổ bông:</strong>
              <p>Thời hạn: Ngày 24/09 đến 26/09. Nếu phát hiện vết bệnh cần báo ngay cho kỹ sư HTX.</p>
            </div>
            <a routerLink="/production/logs" class="btn btn-primary btn-sm">Ghi nhật ký ➔</a>
          </div>

          <div class="task-row pending-task">
            <span class="check-box">⚪</span>
            <div class="task-text">
              <strong>3. Tháo kiệt nước phơi ruộng trước thu hoạch 10 ngày:</strong>
              <p>Dự kiến: Ngày 15/10/2026.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .member-dash-wrap {
      display: flex;
      flex-direction: column;
      gap: 24px;
      max-width: 900px;
      margin: 0 auto;
    }

    .farmer-greeting-card {
      background: linear-gradient(135deg, #15803d 0%, #166534 100%);
      color: white;
      padding: 24px;
      border-radius: var(--radius-xl);
      display: flex;
      align-items: center;
      gap: 20px;
      box-shadow: var(--shadow-lg);
    }

    .greeting-avatar {
      font-size: 48px;
      width: 72px;
      height: 72px;
      background: rgba(255, 255, 255, 0.2);
      border: 3px solid rgba(255, 255, 255, 0.5);
      border-radius: var(--radius-full);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .greeting-sub {
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 0.8px;
      color: #bbf7d0;
      margin-bottom: 4px;
    }

    .greeting-title {
      font-size: 24px;
      color: white;
      margin-bottom: 6px;
    }

    .greeting-desc {
      font-size: 15px;
      color: #f0fdf4;
      line-height: 1.4;
      margin: 0;
    }

    .giant-actions-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .giant-btn {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px;
      border-radius: var(--radius-xl);
      text-decoration: none;
      box-shadow: var(--shadow-md);
      transition: transform 0.15s;
    }

    .giant-btn:hover {
      transform: translateY(-2px);
    }

    .giant-btn-primary {
      background: var(--primary-700);
      color: white;
      border: 2px solid var(--primary-800);
    }

    .giant-btn-amber {
      background: var(--amber-700);
      color: white;
      border: 2px solid var(--amber-800);
    }

    .giant-icon {
      font-size: 36px;
    }

    .giant-title {
      font-size: 18px;
      font-weight: 800;
      display: block;
      margin-bottom: 2px;
    }

    .giant-sub {
      font-size: 13px;
      opacity: 0.9;
      display: block;
      line-height: 1.3;
    }

    .parcel-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 14px;
    }

    .parcel-item {
      background: var(--bg-card-subtle);
      padding: 14px;
      border-radius: var(--radius-md);
      border: 1px solid var(--border-color);
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .p-label {
      font-size: 13px;
      font-weight: 700;
      color: var(--text-muted);
    }

    .p-val {
      font-size: 16px;
      font-weight: 800;
      color: var(--text-main);
    }

    .text-green {
      color: var(--primary-800);
    }

    .task-checklist {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .task-row {
      display: flex;
      align-items: flex-start;
      gap: 14px;
      padding: 14px;
      border-radius: var(--radius-md);
      border: 1.5px solid var(--border-color);
      background: #ffffff;
    }

    .task-row.done {
      background: #f8fafc;
      opacity: 0.85;
    }

    .task-row.active-task {
      background: var(--primary-50);
      border-color: var(--primary-600);
    }

    .check-box {
      font-size: 22px;
      line-height: 1;
    }

    .task-text {
      flex: 1;
    }

    .task-text strong {
      font-size: 16px;
      color: var(--text-main);
      display: block;
      margin-bottom: 2px;
    }

    .task-text p {
      font-size: 14px;
      color: var(--text-muted);
      margin: 0;
    }

    .btn-sm {
      min-height: 38px;
      padding: 6px 14px;
      font-size: 13px;
    }

    @media (max-width: 768px) {
      .giant-actions-grid {
        grid-template-columns: 1fr;
      }
      .parcel-grid {
        grid-template-columns: 1fr;
      }
      .farmer-greeting-card {
        flex-direction: column;
        text-align: center;
      }
    }
  `]
})
export class MemberDashboardComponent {
  state = inject(HtxStateService);
}
