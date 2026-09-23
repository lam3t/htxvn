import { Component, ElementRef, ViewChild, AfterViewInit, inject, OnDestroy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HtxStateService } from '../../../core/services/htx-state.service';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-director-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard-wrap">
      <!-- TIÊU ĐỀ DASHBOARD & NÚT THAO TÁC NHANH -->
      <div class="dash-top-bar">
        <div>
          <div class="dash-sub">BẢNG ĐIỀU KHIỂN QUẢN TRỊ</div>
          <h1 class="dash-title">Tổng Quan Tình Hình HTX & Mùa Vụ</h1>
        </div>
        <div class="quick-action-btns">
          <a routerLink="/production/logs" class="btn btn-primary">
            <span>📝</span> Ghi Nhật Ký
          </a>
          <a routerLink="/harvest-packaging" class="btn btn-amber">
            <span>🏷️</span> Tạo Tem QR
          </a>
          <a routerLink="/members" class="btn btn-secondary">
            <span>👥</span> Duyệt Xã Viên
          </a>
        </div>
      </div>

      <!-- THANH THÔNG TIN HTX ĐANG QUẢN TRỊ NỔI BẬT -->
      <div class="active-htx-header-strip">
        <div class="strip-left">
          <span class="htx-strip-logo">{{ state.currentHtx().logo }}</span>
          <div class="htx-strip-info">
            <div class="strip-tag">
              <span class="live-dot">●</span> ĐANG QUẢN TRỊ DỮ LIỆU CỦA:
            </div>
            <div class="htx-strip-name">
              {{ state.currentHtx().name }}
              <span class="code-pill">{{ state.currentHtx().code }}</span>
            </div>
            <div class="strip-meta">
              📍 {{ state.currentHtx().district }}, Hưng Yên • 🌾 {{ state.currentHtx().primaryProduct }} • ⭐ {{ state.currentHtx().ocopLevel }}
            </div>
          </div>
        </div>
        <div class="strip-actions">
          <a routerLink="/htx-network" class="btn btn-secondary btn-sm">
            <span>🔄</span> Đổi Hợp Tác Xã Khác
          </a>
        </div>
      </div>

      <!-- BANNER CẢNH BÁO NÔNG VỤ KHẨN CẤP NẾU CÓ -->
      @if (state.unreadNotifications().length > 0) {
        <div class="alert-banner">
          <span class="alert-icon">⚠️</span>
          <div class="alert-content">
            <strong>{{ state.unreadNotifications()[0].title }}</strong>
            <p>{{ state.unreadNotifications()[0].content }}</p>
          </div>
          <a routerLink="/notifications" class="btn-alert-link">Xem chi tiết ➔</a>
        </div>
      }

      <!-- 4 THẺ KPI LỚN DỄ NHÌN (CHUẨN UX NÔNG THÔN) -->
      <div class="kpi-grid">
        <!-- KPI 1: THÀNH VIÊN -->
        <div class="kpi-card">
          <div class="kpi-header">
            <span class="kpi-title">Tổng Xã Viên</span>
            <span class="kpi-icon icon-green">👥</span>
          </div>
          <div class="kpi-value">{{ state.currentMembers().length }} <span class="unit">hộ</span></div>
          <div class="kpi-footer">
            <span class="status-pill green">● {{ state.activeMembers().length }} hộ đang canh tác</span>
            @if (state.pendingMembers().length > 0) {
              <span class="status-pill warning">● {{ state.pendingMembers().length }} hộ chờ duyệt</span>
            }
          </div>
        </div>

        <!-- KPI 2: DIỆN TÍCH QUY MÔ -->
        <div class="kpi-card">
          <div class="kpi-header">
            <span class="kpi-title">Quy Mô Canh Tác</span>
            <span class="kpi-icon icon-amber">🗺️</span>
          </div>
          <div class="kpi-value">{{ state.currentHtx().totalAreaHa }} <span class="unit">ha / trại</span></div>
          <div class="kpi-footer">
            <span class="status-pill green">● {{ state.currentZones().length }} vùng sản xuất tập trung</span>
          </div>
        </div>

        <!-- KPI 3: SẢN LƯỢNG ƯỚC TÍNH -->
        <div class="kpi-card">
          <div class="kpi-header">
            <span class="kpi-title">Sản Lượng Dự Kiến Vụ Này</span>
            <span class="kpi-icon icon-blue">🌾</span>
          </div>
          <div class="kpi-value">
            {{ (calculateTotalYield() / 1000) | number:'1.0-1' }} <span class="unit">tấn / lô</span>
          </div>
          <div class="kpi-footer">
            <span class="status-pill green">● Chuẩn {{ state.currentHtx().ocopLevel }}</span>
          </div>
        </div>

        <!-- KPI 4: DOANH SỐ ĐÃ BÁN -->
        <div class="kpi-card">
          <div class="kpi-header">
            <span class="kpi-title">Doanh Thu Đơn Hàng</span>
            <span class="kpi-icon icon-purple">💰</span>
          </div>
          <div class="kpi-value">
            {{ (calculateTotalSales() / 1000000) | number:'1.0-1' }} <span class="unit">triệu đ</span>
          </div>
          <div class="kpi-footer">
            <span class="status-pill green">● {{ state.currentOrders().length }} đơn hàng lớn đã ký</span>
          </div>
        </div>
      </div>

      <!-- KHU VỰC BIỂU ĐỒ VÀ TIẾN ĐỘ VỤ MÙA -->
      <div class="dash-mid-grid">
        <!-- BIỂU ĐỒ SẢN LƯỢNG VÀ DOANH SỐ -->
        <div class="card chart-card">
          <div class="card-header">
            <h2 class="card-title">📈 Diễn Biến Sản Lượng & Doanh Thu Theo Tháng</h2>
            <span class="badge badge-success">Dữ liệu thực tế HTX</span>
          </div>
          <div class="chart-container">
            <canvas #yieldChart></canvas>
          </div>
        </div>

        <!-- TIẾN ĐỘ CÁC VÙNG SẢN XUẤT -->
        <div class="card zones-summary-card">
          <div class="card-header">
            <h2 class="card-title">🌱 Tiến Độ Các Vùng Sản Xuất</h2>
            <a routerLink="/production/zones" class="link-more">Xem tất cả ➔</a>
          </div>
          <div class="zones-list">
            @for (z of state.currentZones(); track z.id) {
              <div class="zone-progress-item">
                <div class="zone-row-top">
                  <span class="zone-name">{{ z.name }}</span>
                  <span class="badge" [class.badge-success]="z.statusType === 'good'" [class.badge-warning]="z.statusType === 'harvest'">
                    {{ z.status }}
                  </span>
                </div>
                <div class="zone-meta">
                  <span>Chủ hộ: <strong>{{ z.managerName }}</strong></span>
                  <span>Dự kiến: <strong>{{ (z.expectedYieldKg / 1000) | number:'1.0-1' }} tấn</strong></span>
                </div>
                <div class="progress-bar-wrap">
                  <div class="progress-bar-fill" [style.width.%]="z.statusType === 'harvest' ? 90 : (z.statusType === 'good' ? 65 : 20)"></div>
                </div>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- NHẬT KÝ SẢN XUẤT MỚI NHẤT & ĐƠN HÀNG GẦN ĐÂY -->
      <div class="dash-bottom-grid">
        <!-- NHẬT KÝ MỚI NHẤT -->
        <div class="card">
          <div class="card-header">
            <h2 class="card-title">📝 Nhật Ký Nông Vụ Gần Đây</h2>
            <a routerLink="/production/logs" class="link-more">Xem đầy đủ ➔</a>
          </div>
          <div class="recent-logs-list">
            @for (log of state.currentLogs().slice(0, 3); track log.id) {
              <div class="recent-log-card">
                <div class="log-time">{{ log.date }} • {{ log.farmerName }}</div>
                <div class="log-task">{{ log.taskTitle }}</div>
                <div class="log-desc">{{ log.workDescription }}</div>
                <div class="log-hash">
                  <span class="lock-icon">🔒</span> {{ log.hashString }}
                </div>
              </div>
            }
          </div>
        </div>

        <!-- ĐƠN HÀNG MỚI NHẤT -->
        <div class="card">
          <div class="card-header">
            <h2 class="card-title">🛒 Đơn Hàng Phân Phối Mới</h2>
            <a routerLink="/sales" class="link-more">Xem đơn hàng ➔</a>
          </div>
          <div class="recent-orders-list">
            @for (ord of state.currentOrders().slice(0, 3); track ord.id) {
              <div class="recent-order-card">
                <div class="order-top">
                  <span class="order-code">{{ ord.orderCode }}</span>
                  <span class="order-amount">{{ ord.totalAmount.toLocaleString('vi-VN') }} đ</span>
                </div>
                <div class="order-cust">Khách: <strong>{{ ord.customerName }}</strong> ({{ ord.customerType }})</div>
                <div class="order-status-badge">
                  <span class="badge badge-success">{{ ord.status }}</span>
                  <span class="invoice-tag">HĐ: {{ ord.invoiceCode }}</span>
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-wrap {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .dash-top-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 8px;
    }

    .dash-sub {
      font-size: 11px;
      font-weight: 800;
      color: var(--primary-700);
      letter-spacing: 0.5px;
    }

    .dash-title {
      font-size: 18px;
      color: var(--text-main);
      margin: 0;
    }

    .quick-action-btns {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
    }

    .active-htx-header-strip {
      background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
      border: 1.5px solid var(--primary-400);
      border-radius: var(--radius-sm);
      padding: 10px 14px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }

    .strip-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .htx-strip-logo {
      font-size: 24px;
      width: 40px;
      height: 40px;
      background: #ffffff;
      border: 1.5px solid var(--primary-500);
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .htx-strip-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .strip-tag {
      font-size: 10.5px;
      font-weight: 800;
      color: var(--primary-800);
      display: flex;
      align-items: center;
      gap: 4px;
      letter-spacing: 0.3px;
    }

    .live-dot {
      color: var(--primary-600);
      font-size: 11px;
      animation: pulse 1.5s infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(0.85); }
    }

    .htx-strip-name {
      font-size: 15.5px;
      font-weight: 800;
      color: var(--primary-950);
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .code-pill {
      font-size: 11px;
      font-weight: 800;
      background: var(--primary-100);
      color: var(--primary-900);
      padding: 1px 6px;
      border-radius: 4px;
      border: 1px solid var(--primary-300);
    }

    .strip-meta {
      font-size: 12px;
      color: var(--text-muted);
    }

    .strip-actions {
      flex-shrink: 0;
    }

    .alert-banner {
      background: #fef2f2;
      border: 1.5px solid var(--danger-600);
      border-radius: var(--radius-sm);
      padding: 10px 14px;
      display: flex;
      align-items: center;
      gap: 10px;
      box-shadow: var(--shadow-sm);
    }

    .alert-icon {
      font-size: 20px;
    }

    .alert-content {
      flex: 1;
    }

    .alert-content strong {
      font-size: 13.5px;
      color: var(--danger-800);
      display: block;
      margin-bottom: 2px;
    }

    .alert-content p {
      font-size: 12.5px;
      color: var(--text-body);
      margin: 0;
    }

    .btn-alert-link {
      color: var(--danger-700);
      font-weight: 800;
      font-size: 12.5px;
      text-decoration: none;
    }

    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 10px;
    }

    .kpi-card {
      background: white;
      border: 1.5px solid var(--border-color);
      border-radius: var(--radius-sm);
      padding: 12px 14px;
      box-shadow: var(--shadow-sm);
      display: flex;
      flex-direction: column;
      gap: 6px;
      transition: transform 0.15s;
    }

    .kpi-card:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }

    .kpi-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .kpi-title {
      font-size: 13px;
      font-weight: 700;
      color: var(--text-muted);
    }

    .kpi-icon {
      font-size: 18px;
      width: 32px;
      height: 32px;
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .icon-green { background: #dcfce7; }
    .icon-amber { background: #fef3c7; }
    .icon-blue { background: #dbeafe; }
    .icon-purple { background: #f3e8ff; }

    .kpi-value {
      font-size: 24px;
      font-weight: 800;
      color: var(--text-main);
      line-height: 1.1;
    }

    .kpi-value .unit {
      font-size: 13px;
      font-weight: 600;
      color: var(--text-muted);
    }

    .kpi-footer {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      margin-top: auto;
    }

    .status-pill {
      font-size: 11.5px;
      font-weight: 700;
    }
    .status-pill.green { color: var(--primary-700); }
    .status-pill.warning { color: var(--amber-700); }

    .dash-mid-grid {
      display: grid;
      grid-template-columns: 1.8fr 1.2fr;
      gap: 10px;
    }

    .chart-container {
      position: relative;
      height: 210px;
      width: 100%;
    }

    .zones-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .zone-progress-item {
      background: var(--bg-card-subtle);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-sm);
      padding: 8px 10px;
    }

    .zone-row-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 4px;
    }

    .zone-name {
      font-size: 13.5px;
      font-weight: 800;
      color: var(--text-main);
    }

    .zone-meta {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      color: var(--text-muted);
      margin-bottom: 6px;
    }

    .progress-bar-wrap {
      height: 6px;
      background: #e2e8f0;
      border-radius: 99px;
      overflow: hidden;
    }

    .progress-bar-fill {
      height: 100%;
      background: var(--primary-600);
      border-radius: 99px;
    }

    .dash-bottom-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }

    .link-more {
      font-size: 13px;
      font-weight: 700;
      color: var(--primary-700);
      text-decoration: none;
    }

    .recent-logs-list, .recent-orders-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .recent-log-card, .recent-order-card {
      background: var(--bg-card-subtle);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-sm);
      padding: 10px 12px;
    }

    .log-time {
      font-size: 12px;
      font-weight: 700;
      color: var(--primary-700);
      margin-bottom: 4px;
    }

    .log-task {
      font-size: 15px;
      font-weight: 800;
      color: var(--text-main);
      margin-bottom: 4px;
    }

    .log-desc {
      font-size: 13.5px;
      color: var(--text-muted);
      line-height: 1.4;
      margin-bottom: 8px;
    }

    .log-hash {
      font-size: 12px;
      font-weight: 700;
      color: var(--info-800);
      background: var(--info-100);
      padding: 4px 8px;
      border-radius: 4px;
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }

    .order-top {
      display: flex;
      justify-content: space-between;
      margin-bottom: 4px;
    }

    .order-code {
      font-size: 14px;
      font-weight: 800;
      color: var(--primary-800);
    }

    .order-amount {
      font-size: 16px;
      font-weight: 800;
      color: var(--text-main);
    }

    .order-cust {
      font-size: 13.5px;
      color: var(--text-muted);
      margin-bottom: 6px;
    }

    .order-status-badge {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .invoice-tag {
      font-size: 12px;
      font-weight: 700;
      color: var(--text-muted);
    }

    @media (max-width: 900px) {
      .dash-mid-grid, .dash-bottom-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class DirectorDashboardComponent implements AfterViewInit, OnDestroy {
  state = inject(HtxStateService);

  @ViewChild('yieldChart') chartCanvas!: ElementRef<HTMLCanvasElement>;
  private chartInstance?: Chart;

  constructor() {
    // Re-render chart when HTX changes
    effect(() => {
      this.state.selectedHtxId();
      if (this.chartCanvas) {
        this.renderChart();
      }
    });
  }

  ngAfterViewInit() {
    this.renderChart();
  }

  ngOnDestroy() {
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }
  }

  calculateTotalYield(): number {
    return this.state.currentZones().reduce((acc, z) => acc + (z.expectedYieldKg || 0), 0);
  }

  calculateTotalSales(): number {
    return this.state.currentOrders().reduce((acc, o) => acc + (o.totalAmount || 0), 0);
  }

  private renderChart() {
    if (!this.chartCanvas) return;
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    this.chartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9 (Hiện tại)', 'Tháng 10 (Dự báo)'],
        datasets: [
          {
            label: 'Sản lượng thu hoạch (Tấn)',
            data: [15, 22, 35, 48, 65, 80],
            backgroundColor: '#15803d',
            borderRadius: 6,
            yAxisID: 'y'
          },
          {
            label: 'Doanh thu (Trăm triệu đồng)',
            data: [1.2, 1.8, 3.0, 4.5, 6.2, 7.8],
            backgroundColor: '#b45309',
            borderRadius: 6,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              font: { family: 'Plus Jakarta Sans', size: 13, weight: 'bold' }
            }
          }
        },
        scales: {
          y: {
            type: 'linear',
            position: 'left',
            grid: { color: '#f1f5f9' },
            ticks: { font: { family: 'Plus Jakarta Sans', size: 12 } }
          },
          y1: {
            type: 'linear',
            position: 'right',
            grid: { drawOnChartArea: false },
            ticks: { font: { family: 'Plus Jakarta Sans', size: 12 } }
          },
          x: {
            grid: { display: false },
            ticks: { font: { family: 'Plus Jakarta Sans', size: 12, weight: 'bold' } }
          }
        }
      }
    });
  }
}
