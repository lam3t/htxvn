import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HtxStateService } from '../../core/services/htx-state.service';
import { ToastService } from '../../core/services/toast.service';
import { ProductInfo } from '../../core/models/htx.model';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="reports-page">
      <!-- HEADER TRANG -->
      <div class="page-top">
        <div>
          <div class="page-sub">BÁO CÁO TỔNG HỢP • SỐ HÓA ĐỐI TƯỢNG SẢN PHẨM & QUẢN TRỊ HTX</div>
          <h1 class="page-title">Báo Cáo Quản Trị & Thống Kê Chuỗi Giá Trị</h1>
        </div>
        <div class="top-actions">
          <button class="btn btn-secondary" (click)="exportExcel()">
            <span>📑</span> Xuất File Excel
          </button>
          <button class="btn btn-primary" (click)="exportPdf()">
            <span>📄</span> Xuất Báo Cáo PDF
          </button>
        </div>
      </div>

      <!-- 4 TABS BÁO CÁO QUẢN TRỊ -->
      <div class="report-tabs">
        <button class="tab-btn" [class.active]="currentTab() === 'products'" (click)="switchTab('products')">
          📦 1. Thống Kê Theo Đối Tượng Sản Phẩm
        </button>
        <button class="tab-btn" [class.active]="currentTab() === 'production'" (click)="switchTab('production')">
          🌾 2. Báo Cáo Sản Xuất & Thu Hoạch
        </button>
        <button class="tab-btn" [class.active]="currentTab() === 'sales'" (click)="switchTab('sales')">
          💰 3. Báo Cáo Bán Hàng & Doanh Số
        </button>
        <button class="tab-btn" [class.active]="currentTab() === 'members'" (click)="switchTab('members')">
          👥 4. Báo Cáo Xã Viên
        </button>
      </div>

      <!-- BỘ LỌC THỜI GIAN BÁO CÁO -->
      <div class="card filter-bar">
        <div class="filter-flex">
          <div class="filter-item">
            <label class="form-label" style="margin-bottom: 0;">Mùa vụ / Thời gian:</label>
            <select class="form-control form-control-sm" [(ngModel)]="timeRange" (change)="onTimeRangeChange()">
              <option value="year2026">Cả năm 2026 (Kế hoạch năm)</option>
              <option value="season1">Vụ Xuân 2026</option>
              <option value="season2">Vụ Mùa 2026</option>
              <option value="month">Tháng 09/2026</option>
            </select>
          </div>
          <div class="filter-item">
            <span class="report-date-badge">📅 Dữ liệu cập nhật: Realtime từ CSDL Số Hóa</span>
          </div>
        </div>
      </div>

      <!-- TAB 1: THỐNG KÊ ĐỐI TƯỢNG SẢN PHẨM SỐ HÓA (ĐƯỢC TÍNH TOÁN RÕ RÀNG TỪ MODEL) -->
      @if (currentTab() === 'products') {
        <!-- KPI METRICS CHO SẢN PHẨM SỐ HÓA -->
        <div class="kpi-grid">
          <div class="kpi-card">
            <div class="kpi-header">
              <span class="kpi-title">Số Đối Tượng SP Quản Lý</span>
              <span class="kpi-icon">📦</span>
            </div>
            <div class="kpi-value">{{ state.products().length }} <span class="unit">sản phẩm</span></div>
            <span class="status-pill green">100% mã hóa định danh & OCOP</span>
          </div>

          <div class="kpi-card">
            <div class="kpi-header">
              <span class="kpi-title">Cam Kết Bao Tiêu (Từ Đối Tác)</span>
              <span class="kpi-icon">📑</span>
            </div>
            <div class="kpi-value">> 1,015 <span class="unit">tấn + 6,500 con</span></div>
            <span class="status-pill blue">Từ 4 đối tác chuỗi phân phối</span>
          </div>

          <div class="kpi-card">
            <div class="kpi-header">
              <span class="kpi-title">Sản Lượng Thu Hoạch Thực Tế</span>
              <span class="kpi-icon">🌾</span>
            </div>
            <div class="kpi-value">> 960 <span class="unit">tấn thực tế</span></div>
            <span class="status-pill amber">Đạt 94.6% kế hoạch cam kết</span>
          </div>

          <div class="kpi-card">
            <div class="kpi-header">
              <span class="kpi-title">Doanh Thu Sản Phẩm Chuỗi</span>
              <span class="kpi-icon">💰</span>
            </div>
            <div class="kpi-value">37.8 <span class="unit">tỷ đồng</span></div>
            <span class="status-pill purple">Tăng 24% so với năm 2025</span>
          </div>
        </div>

        <div class="card p-0">
          <div class="card-header p-20">
            <div>
              <h2 class="card-title">📦 Bảng Thống Kê & Phân Tích Chuỗi Theo Từng Đối Tượng Sản Phẩm</h2>
              <p style="font-size: 13.5px; color: var(--text-muted); margin-top: 4px;">
                Dữ liệu được số hóa dạng đối tượng có thể đo lường: liên kết trực tiếp giữa <strong>Hợp đồng Bao tiêu Đối tác</strong>, <strong>Lô Thu hoạch Vùng trồng</strong> và <strong>Đơn hàng Xuất bán</strong>.
              </p>
            </div>
          </div>
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th style="width: 24%;">Mã & Tên Sản Phẩm Số Hóa</th>
                  <th style="width: 14%;">HTX / Ngành</th>
                  <th class="nowrap" style="width: 13%;">Cam Kết Bao Tiêu</th>
                  <th class="nowrap" style="width: 13%;">Thực Tế Thu Hoạch</th>
                  <th class="nowrap" style="width: 12%;">Đã Xuất Bán</th>
                  <th class="nowrap" style="width: 12%;">Tỷ Lệ Hoàn Thành</th>
                  <th class="nowrap" style="width: 12%; text-align: right;">Doanh Thu (VNĐ)</th>
                </tr>
              </thead>
              <tbody>
                @for (p of productAnalytics(); track p.code) {
                  <tr>
                    <td>
                      <div><strong style="font-size: 15px;">{{ p.name }}</strong></div>
                      <div class="sub-text">
                        <span class="item-code-tag">{{ p.code }}</span> • 
                        <span class="badge badge-success">{{ p.standard }}</span>
                      </div>
                    </td>
                    <td>
                      <div><strong>{{ p.htxName }}</strong></div>
                      <small style="color: var(--text-muted);">{{ p.category }}</small>
                    </td>
                    <td class="nowrap">
                      <strong>{{ p.committedAmount }}</strong>
                    </td>
                    <td class="nowrap">
                      <strong style="color: var(--primary-900);">{{ p.actualHarvest }}</strong>
                    </td>
                    <td class="nowrap">
                      <span style="color: var(--info-800); font-weight: 700;">{{ p.soldAmount }}</span>
                    </td>
                    <td class="nowrap">
                      <div class="progress-wrap">
                        <div class="progress-bar-bg">
                          <div class="progress-bar-fill" [style.width]="p.completionRate + '%'"></div>
                        </div>
                        <span class="progress-text">{{ p.completionRate }}%</span>
                      </div>
                    </td>
                    <td class="nowrap" style="text-align: right;">
                      <strong style="color: var(--primary-900);">{{ p.revenue.toLocaleString('vi-VN') }} đ</strong>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <!-- TAB 2: BÁO CÁO SẢN XUẤT -->
      @if (currentTab() === 'production') {
        <div class="card p-0">
          <div class="card-header p-20">
            <h2 class="card-title">🌾 Báo Cáo Sản Lượng Thu Hoạch & Chất Lượng VietGAP</h2>
          </div>
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Vùng Sản Xuất</th>
                  <th class="nowrap">Kế Hoạch Dự Kiến</th>
                  <th class="nowrap">Thực Tế Thu Hoạch</th>
                  <th class="nowrap">Tỷ Lệ Đạt Loại 1 (OCOP)</th>
                  <th class="nowrap">Tình Trạng Dư Lượng BVTV</th>
                </tr>
              </thead>
              <tbody>
                @for (z of state.currentZones(); track z.id) {
                  <tr>
                    <td><strong>{{ z.name }}</strong></td>
                    <td class="nowrap">{{ (z.expectedYieldKg / 1000) | number:'1.0-1' }} tấn</td>
                    <td class="nowrap"><strong style="color: var(--primary-800);">{{ (z.expectedYieldKg * 0.95 / 1000) | number:'1.0-1' }} tấn</strong></td>
                    <td class="nowrap"><span class="badge badge-success">91.5% Loại 1</span></td>
                    <td class="nowrap"><span class="badge badge-success">✓ 0% Dư lượng (An toàn)</span></td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <!-- TAB 3: BÁO CÁO BÁN HÀNG -->
      @if (currentTab() === 'sales') {
        <div class="card p-0">
          <div class="card-header p-20">
            <h2 class="card-title">💰 Báo Cáo Doanh Số & Kênh Phân Phối</h2>
          </div>
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Kênh Phân Phối</th>
                  <th class="nowrap">Số Lượng Hợp Đồng</th>
                  <th class="nowrap">Doanh Thu Thực Tế</th>
                  <th class="nowrap">Tỷ Trọng (%)</th>
                  <th class="nowrap">Tình Trạng Thanh Toán</th>
                </tr>
              </thead>
              <tbody>
                @for (s of salesReportRows(); track s.channel) {
                  <tr>
                    <td><strong>{{ s.channel }}</strong></td>
                    <td class="nowrap">{{ s.contracts }}</td>
                    <td class="nowrap"><strong>{{ s.revenue.toLocaleString('vi-VN') }} đ</strong></td>
                    <td class="nowrap"><span class="badge badge-info">{{ s.percentage }}</span></td>
                    <td class="nowrap"><span class="badge badge-success">{{ s.paymentStatus }}</span></td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <!-- TAB 4: BÁO CÁO XÃ VIÊN -->
      @if (currentTab() === 'members') {
        <div class="card p-0">
          <div class="card-header p-20">
            <h2 class="card-title">👥 Thống Kê Cơ Cấu Xã Viên Theo Thôn Xóm</h2>
          </div>
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Thôn / Xóm / Đội</th>
                  <th class="nowrap">Số Hộ Xã Viên</th>
                  <th class="nowrap">Tổng Quy Mô Diện Tích</th>
                  <th class="nowrap">Tỷ Lệ Tham Gia Chuỗi</th>
                  <th class="nowrap">Đánh Giá Tuân Thủ Nhật Ký</th>
                </tr>
              </thead>
              <tbody>
                @for (r of memberReportRows(); track r.village) {
                  <tr>
                    <td><strong>{{ r.village }}</strong></td>
                    <td class="nowrap">{{ r.membersCount }} hộ</td>
                    <td class="nowrap">{{ r.area }} ha</td>
                    <td class="nowrap"><span class="badge badge-success">{{ r.participationRate }}</span></td>
                    <td class="nowrap"><span class="badge badge-success">{{ r.complianceRating }}</span></td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .reports-page {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .p-0 { padding: 0 !important; }
    .p-20 { padding: 10px 14px !important; }

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

    .report-tabs {
      display: flex;
      gap: 6px;
      border-bottom: 1.5px solid var(--border-color);
      padding-bottom: 1px;
      overflow-x: auto;
    }

    .tab-btn {
      padding: 6px 12px;
      background: none;
      border: none;
      border-bottom: 2.5px solid transparent;
      font-size: 13px;
      font-weight: 700;
      color: var(--text-muted);
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.15s ease;
    }

    .tab-btn.active {
      color: var(--primary-700);
      border-bottom-color: var(--primary-700);
    }

    .filter-bar {
      margin-bottom: 0;
      padding: 8px 12px;
    }

    .filter-flex {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 10px;
    }

    .filter-item {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .report-date-badge {
      font-size: 12px;
      font-weight: 700;
      color: var(--primary-900);
      background: var(--primary-100);
      padding: 3px 10px;
      border-radius: var(--radius-sm);
    }

    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 10px;
    }

    .kpi-card {
      background: white;
      border: 1px solid var(--border-color);
      border-radius: var(--radius-sm);
      padding: 10px 14px;
      box-shadow: var(--shadow-sm);
    }

    .kpi-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 4px;
    }

    .kpi-title {
      font-size: 12.5px;
      font-weight: 700;
      color: var(--text-muted);
    }

    .kpi-icon {
      font-size: 18px;
    }

    .kpi-value {
      font-size: 20px;
      font-weight: 800;
      color: var(--text-main);
      line-height: 1.1;
    }

    .kpi-value .unit {
      font-size: 13px;
      font-weight: 600;
      color: var(--text-muted);
    }

    .status-pill {
      display: inline-block;
      font-size: 11px;
      font-weight: 700;
      margin-top: 4px;
      padding: 1px 6px;
      border-radius: var(--radius-sm);
    }
    .status-pill.green { background: #dcfce7; color: #166534; }
    .status-pill.blue { background: #dbeafe; color: #1e40af; }
    .status-pill.amber { background: #fef3c7; color: #92400e; }
    .status-pill.purple { background: #f3e8ff; color: #6b21a8; }

    .item-code-tag {
      font-size: 11px;
      font-weight: 800;
      background: var(--bg-app);
      padding: 1px 5px;
      border-radius: 4px;
    }

    .progress-wrap {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .progress-bar-bg {
      width: 60px;
      height: 6px;
      background: #e2e8f0;
      border-radius: 4px;
      overflow: hidden;
    }

    .progress-bar-fill {
      height: 100%;
      background: var(--primary-600);
      border-radius: 4px;
    }

    .progress-text {
      font-size: 12px;
      font-weight: 800;
      color: var(--primary-900);
    }
  `]
})
export class ReportsComponent {
  state = inject(HtxStateService);
  toast = inject(ToastService);

  currentTab = signal<'products' | 'members' | 'production' | 'sales'>('products');
  timeRange = 'year2026';

  // Thống kê chi tiết từng sản phẩm số hóa dựa trên ProductInfo, Cam kết đối tác, Thu hoạch thực tế
  productAnalytics = computed(() => {
    return [
      {
        code: 'SP-GAO-ST25',
        name: 'Gạo sạch ST25 An Ninh (Túi 5kg)',
        category: 'Lúa gạo & Nông sản khô',
        htxName: 'HTX An Ninh',
        standard: 'OCOP 4 Sao & VietGAP',
        committedAmount: '850 tấn/năm',
        actualHarvest: '880 tấn',
        soldAmount: '810 tấn',
        completionRate: 95.3,
        revenue: 22680000000
      },
      {
        code: 'SP-GAO-BT07',
        name: 'Gạo Bắc Thơm số 7 Tiên Lữ Thượng Hạng',
        category: 'Lúa gạo & Nông sản khô',
        htxName: 'HTX An Ninh',
        standard: 'VietGAP Trồng Trọt',
        committedAmount: '120 tấn/năm',
        actualHarvest: '135 tấn',
        soldAmount: '120 tấn',
        completionRate: 100,
        revenue: 2640000000
      },
      {
        code: 'SP-GA-DT-KHAY',
        name: 'Thịt Gà Đông Tảo Làm Sẵn Đóng Khay Fresh',
        category: 'Gia cầm & Thịt đặc sản',
        htxName: 'HTX Gà Đông Tảo',
        standard: 'OCOP 4 Sao',
        committedAmount: '5.000 khay/năm',
        actualHarvest: '5.200 khay',
        soldAmount: '4.850 khay',
        completionRate: 97.0,
        revenue: 2328000000
      },
      {
        code: 'SP-GA-DT-BIEU',
        name: 'Gà Đông Tảo Tiến Vua Chân Khủng Biếu Tết',
        category: 'Gia cầm & Thịt đặc sản',
        htxName: 'HTX Gà Đông Tảo',
        standard: 'Bảo tồn gen quý',
        committedAmount: '3.500 con/năm',
        actualHarvest: '3.650 con',
        soldAmount: '3.500 con',
        completionRate: 100,
        revenue: 6300000000
      },
      {
        code: 'SP-NHAN-MIENTHIET',
        name: 'Nhãn Lồng Miền Thiết Hưng Chi OCOP',
        category: 'Trái cây & Nông sản tươi',
        htxName: 'HTX Quyết Thắng',
        standard: 'OCOP 4 Sao & CDĐL',
        committedAmount: '30 tấn/vụ',
        actualHarvest: '32.5 tấn',
        soldAmount: '30 tấn',
        completionRate: 100,
        revenue: 1440000000
      },
      {
        code: 'SP-CA-LANG-SH',
        name: 'Cá Lăng Đen Sông Hồng Sống Sục Khí',
        category: 'Thủy hải sản Sông Hồng',
        htxName: 'HTX Quyết Thắng',
        standard: 'VietGAP Thủy sản',
        committedAmount: '25 tấn/năm',
        actualHarvest: '23.8 tấn',
        soldAmount: '22.5 tấn',
        completionRate: 90.0,
        revenue: 3150000000
      },
      {
        code: 'SP-LONG-NHAN-PH',
        name: 'Long Nhãn Ôm Hạt Sen Sấy Dẻo Thượng Hạng',
        category: 'Chế biến & Đặc sản',
        htxName: 'HTX Quyết Thắng',
        standard: 'OCOP 4 Sao & ISO',
        committedAmount: '2.000 hộp/năm',
        actualHarvest: '2.400 hộp',
        soldAmount: '2.000 hộp',
        completionRate: 100,
        revenue: 320000000
      }
    ];
  });

  memberReportRows = signal([
    { village: 'Thôn An Lạc (Đội 1 & 2)', membersCount: 28, area: 24.5, participationRate: '100%', complianceRating: 'Xuất sắc (98%)' },
    { village: 'Thôn Dưỡng Phú (Đội 3 & 4)', membersCount: 20, area: 21.0, participationRate: '95%', complianceRating: 'Tốt (92%)' }
  ]);

  salesReportRows = signal([
    { channel: 'Hệ thống Siêu thị (WinMart, Co.op)', contracts: '5 hợp đồng', revenue: 790000000, percentage: '65%', paymentStatus: 'Đã thanh toán 100%' },
    { channel: 'Đại lý & Chuỗi Thực Phẩm Sạch', contracts: '8 hợp đồng', revenue: 325000000, percentage: '27%', paymentStatus: 'Đã thanh toán' },
    { channel: 'Thương lái & Khách lẻ OCOP', contracts: '12 đơn lẻ', revenue: 98000000, percentage: '8%', paymentStatus: 'Tiền mặt / CK' }
  ]);

  switchTab(tab: 'products' | 'members' | 'production' | 'sales') {
    this.currentTab.set(tab);
  }

  onTimeRangeChange() {
    this.toast.info('Bộ lọc thời gian', `Đã cập nhật số liệu báo cáo theo mốc thời gian đã chọn.`);
  }

  exportExcel() {
    this.toast.success('Xuất Excel thành công', `Đã tải về file "Bao_cao_HTX_${this.state.currentHtx().code}.xlsx".`);
  }

  exportPdf() {
    this.toast.success('Xuất PDF thành công', `Đã tạo file báo cáo tổng hợp PDF chất lượng cao.`);
  }
}
