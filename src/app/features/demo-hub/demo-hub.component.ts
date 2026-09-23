import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HtxStateService } from '../../core/services/htx-state.service';
import { MockDataService } from '../../core/services/mock-data.service';

@Component({
  selector: 'app-demo-hub',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="hub-container">
      <!-- BANNER CHÀO MỪNG & GIỚI THIỆU DỰ ÁN -->
      <div class="welcome-hero">
        <div class="hero-badge">HỆ THỐNG QUẢN TRỊ SỐ HỢP TÁC XÃ</div>
        <h1 class="hero-title">Quản Trị Sản Xuất Nông Nghiệp & Truy Xuất Nguồn Gốc HTX</h1>
        <p class="hero-desc">
          Bản demo nghiệp vụ tương tác trực quan phục vụ công tác quản trị nội bộ và kết nối chuỗi giá trị nông sản cho 3 Hợp tác xã thí điểm.
        </p>

        <!-- KHUNG ĐIỀU HƯỚNG NHANH THEO HTX VÀ VAI TRÒ -->
        <div class="quick-switcher-card">
          <div class="switch-col">
            <label class="switch-label">1. CHỌN HỢP TÁC XÃ ĐỂ TRẢI NGHIỆM DỮ LIỆU THỰC TẾ:</label>
            <div class="htx-button-group">
              @for (htx of state.cooperatives(); track htx.id) {
                <button 
                  class="btn-htx-pill" 
                  [class.active]="state.selectedHtxId() === htx.id"
                  (click)="state.switchHtx(htx.id)">
                  <span class="pill-logo">{{ htx.logo }}</span>
                  <div class="pill-info">
                    <span class="pill-title">{{ htx.shortName }}</span>
                    <span class="pill-sub">{{ htx.category }}</span>
                  </div>
                </button>
              }
            </div>
          </div>

          <div class="switch-col">
            <label class="switch-label">2. CHỌN VAI TRÒ ĐỂ TRẢI NGHIỆM PHÂN QUYỀN GIAO DIỆN:</label>
            <div class="role-button-group">
              @for (u of mockData.demoUsers; track u.id) {
                <button 
                  class="btn-role-pill" 
                  [class.active]="state.currentUser().id === u.id"
                  (click)="state.switchUser(u)">
                  <span class="pill-logo">{{ u.avatar }}</span>
                  <div class="pill-info">
                    <span class="pill-title">{{ u.name }}</span>
                    <span class="pill-sub">{{ u.roleTitle }}</span>
                  </div>
                </button>
              }
            </div>
          </div>
        </div>
      </div>

      <!-- FLOW SƠ ĐỒ LIÊN KẾT DỮ LIỆU ĐỒNG BỘ CHUẨN NÔNG NGHIỆP ERP -->
      <div class="relation-flow-card">
        <div class="flow-header">
          <span class="flow-badge">KIẾN TRÚC DỮ LIỆU LIÊN KẾT</span>
          <h2 class="flow-title">🔗 Luồng Dữ Liệu Khép Kín • Tự Động Kế Thừa (Không Nhập Lại)</h2>
          <p class="flow-subtitle">Các đối tượng được xâu chuỗi logic từ Giống & Vụ $\rightarrow$ Vùng trồng $\rightarrow$ Nhật ký $\rightarrow$ Lô thu hoạch $\rightarrow$ Tem QR $\rightarrow$ Hóa đơn bán hàng</p>
        </div>
        
        <div class="flow-steps">
          <div class="flow-node">
            <div class="node-icon">🏛️</div>
            <div class="node-title">1. Mạng Lưới HTX & Master Data</div>
            <div class="node-desc">Danh mục Giống chuẩn, Mùa vụ, Vật tư, Hồ sơ HTX</div>
            <a routerLink="/system-admin/master-data" class="node-link">Master Data ➔</a>
          </div>

          <div class="flow-arrow">➔</div>

          <div class="flow-node">
            <div class="node-icon">🌱</div>
            <div class="node-title">2. Vùng Trồng & Xã Viên</div>
            <div class="node-desc">Cấp Mã số vùng trồng (MSVT), phân bổ nông hộ phụ trách</div>
            <a routerLink="/production/zones" class="node-link">Vùng MSVT ➔</a>
          </div>

          <div class="flow-arrow">➔</div>

          <div class="flow-node">
            <div class="node-icon">📝</div>
            <div class="node-title">3. Nhật Ký Điện Tử</div>
            <div class="node-desc">Ghi chép bón phân, phòng trừ sâu bệnh, lưu vết Hash</div>
            <a routerLink="/production/logs" class="node-link">Nhật ký số ➔</a>
          </div>

          <div class="flow-arrow">➔</div>

          <div class="flow-node highlight">
            <div class="node-icon">🌾</div>
            <div class="node-title">4. Lô Thu Hoạch</div>
            <div class="node-desc">Chọn Vùng $\rightarrow$ Tự điền Giống, Chủ hộ, MSVT, Tỷ lệ Grade 1/2</div>
            <a routerLink="/harvest-packaging" class="node-link">Lô thu hoạch ➔</a>
          </div>

          <div class="flow-arrow">➔</div>

          <div class="flow-node highlight">
            <div class="node-icon">🏷️</div>
            <div class="node-title">5. Tem QR & Đóng Gói</div>
            <div class="node-desc">Chọn Lô $\rightarrow$ Kế thừa quy chuẩn, sinh mã QR truy xuất</div>
            <a routerLink="/harvest-packaging" class="node-link">Tem QR ➔</a>
          </div>

          <div class="flow-arrow">➔</div>

          <div class="flow-node">
            <div class="node-icon">🤝</div>
            <div class="node-title">6. Đối Tác & Xuất Bán</div>
            <div class="node-desc">Bao tiêu WinMart, Bác Tôm, hợp đồng & hóa đơn điện tử</div>
            <a routerLink="/partners" class="node-link">Đối tác ➔</a>
          </div>
        </div>
      </div>

      <!-- MỤC LỤC CHI TIẾT 10 MODULE CHỨC NĂNG CẦN DEMO -->
      <div class="section-title-wrap">
        <h2>🧭 Mục Lục Toàn Bộ 10 Màn Hình Nghiệp Vụ</h2>
        <p>Bấm vào từng thẻ bên dưới để chuyển trực tiếp đến màn hình chức năng tương ứng</p>
      </div>

      <div class="modules-grid">
        <!-- MODULE: MẠNG LƯỚI HTX -->
        <div class="module-card card-accent">
          <div class="module-header">
            <span class="module-icon">🏢</span>
            <div class="module-tag tag-priority">MẠNG LƯỚI MULTI-HTX</div>
          </div>
          <h3 class="module-title">Mạng Lưới Hợp Tác Xã</h3>
          <p class="module-desc">Quản trị danh mục multi-HTX, thêm mới HTX không giới hạn, xem tổng quan quy mô diện tích & xã viên toàn tỉnh.</p>
          <div class="module-links">
            <a routerLink="/htx-network" class="link-btn">Quản Lý Danh Sách HTX ({{ state.cooperatives().length }} HTX) ➔</a>
            <a routerLink="/htx-profile" class="link-btn">Hồ Sơ & Chứng Nhận OCOP HTX ➔</a>
          </div>
        </div>

        <!-- MODULE: ĐỐI TÁC & PHÂN PHỐI -->
        <div class="module-card card-primary">
          <div class="module-header">
            <span class="module-icon">🤝</span>
            <div class="module-tag">CHUỖI LIÊN KẾT</div>
          </div>
          <h3 class="module-title">Đối Tác & Kênh Phân Phối</h3>
          <p class="module-desc">Quản lý mạng lưới doanh nghiệp bao tiêu (WinMart, Bác Tôm, BigGreen) và nhà cung ứng vật tư nông nghiệp (Quế Lâm).</p>
          <div class="module-links">
            <a routerLink="/partners" class="link-btn">Danh Mục Đối Tác & Hợp Đồng Bao Tiêu ➔</a>
            <a routerLink="/sales" class="link-btn">Đơn Hàng & Hóa Đơn Điện Tử (e-Invoice) ➔</a>
          </div>
        </div>

        <!-- MODULE: MASTER DATA CHUẨN -->
        <div class="module-card card-primary">
          <div class="module-header">
            <span class="module-icon">📚</span>
            <div class="module-tag">MASTER DATA</div>
          </div>
          <h3 class="module-title">Danh Mục Dùng Chung Nông Nghiệp</h3>
          <p class="module-desc">Danh mục phân cấp chuẩn ERP: Mã giống, Mùa vụ, Tiêu chuẩn chất lượng (VietGAP, OCOP), Đơn vị đo và Vật tư.</p>
          <div class="module-links">
            <a routerLink="/system-admin/master-data" class="link-btn">Quản Trị Master Data Phân Cấp ➔</a>
            <a routerLink="/system-admin/technical-manuals" class="link-btn">Thư Viện Tài Liệu Canh Tác ➔</a>
          </div>
        </div>

        <!-- MODULE: DASHBOARD -->
        <div class="module-card card-accent">
          <div class="module-header">
            <span class="module-icon">📊</span>
            <div class="module-tag tag-priority">DASHBOARD & KPI</div>
          </div>
          <h3 class="module-title">Dashboard & Báo Cáo</h3>
          <p class="module-desc">Bảng điều khiển KPI lớn cho Lãnh đạo HTX, biểu đồ sản lượng, doanh thu và trang cá nhân Xã viên.</p>
          <div class="module-links">
            <a routerLink="/dashboard" class="link-btn">Dashboard Lãnh đạo HTX ➔</a>
            <a routerLink="/dashboard/member" class="link-btn">Dashboard Hộ Xã viên ➔</a>
            <a routerLink="/reports" class="link-btn">Báo cáo Quản trị (3 Tab) ➔</a>
          </div>
        </div>

        <!-- MODULE: THÀNH VIÊN -->
        <div class="module-card card-primary">
          <div class="module-header">
            <span class="module-icon">👥</span>
            <div class="module-tag">XÃ VIÊN & NÔNG HỘ</div>
          </div>
          <h3 class="module-title">Quản Lý Thành Viên HTX</h3>
          <p class="module-desc">Danh sách xã viên, hồ sơ pháp lý, danh bạ thương lái và <strong>Phê duyệt thành viên mới từ Zalo</strong>.</p>
          <div class="module-links">
            <a routerLink="/members" class="link-btn">
              Quản lý Xã viên 
              @if (state.pendingMembers().length > 0) {
                <span class="badge-alert">{{ state.pendingMembers().length }} chờ duyệt</span>
              }
              ➔
            </a>
            <a routerLink="/htx-profile" class="link-btn">Hồ sơ Pháp lý & Chứng nhận OCOP ➔</a>
          </div>
        </div>

        <!-- MODULE: SẢN XUẤT & NHẬT KÝ -->
        <div class="module-card card-accent">
          <div class="module-header">
            <span class="module-icon">📝</span>
            <div class="module-tag tag-priority">SẢN XUẤT & MSVT</div>
          </div>
          <h3 class="module-title">Sản Xuất & Nhật Ký (Hash)</h3>
          <p class="module-desc">Bản đồ vùng trồng/chăn nuôi, mã số MSVT, nhật ký thời gian thực có gắn mã băm bảo mật, in PDF nhật ký mùa vụ.</p>
          <div class="module-links">
            <a routerLink="/production/zones" class="link-btn">Vùng Trồng / Chăn Nuôi & MSVT ➔</a>
            <a routerLink="/production/logs" class="link-btn">Nhật Ký Sản Xuất (Lưu vết Hash) ➔</a>
            <a routerLink="/production/processes" class="link-btn">Quy Trình & Nhân Bản Mùa Vụ ➔</a>
          </div>
        </div>

        <!-- MODULE: KHO VẬT TƯ -->
        <div class="module-card card-primary">
          <div class="module-header">
            <span class="module-icon">📦</span>
            <div class="module-tag">KHO VẬT TƯ</div>
          </div>
          <h3 class="module-title">Quản Lý Kho Vật Tư</h3>
          <p class="module-desc">Theo dõi tồn kho phân bón, hạt giống, thức ăn chăn nuôi, cảnh báo sắp hết hàng và tạo phiếu nhập/xuất.</p>
          <div class="module-links">
            <a routerLink="/warehouse" class="link-btn">Danh mục Tồn kho & Phiếu Nhập Xuất ➔</a>
          </div>
        </div>

        <!-- MODULE: THU HOẠCH & ĐÓNG GÓI QR -->
        <div class="module-card card-accent">
          <div class="module-header">
            <span class="module-icon">🏷️</span>
            <div class="module-tag tag-priority">THU HOẠCH & TEM QR</div>
          </div>
          <h3 class="module-title">Thu Hoạch & Tem QR Code</h3>
          <p class="module-desc">Phân loại phẩm cấp lô thu hoạch theo Vùng MSVT, sinh mã QR Code động, in tem nhãn có Logo HTX và hóa đơn.</p>
          <div class="module-links">
            <a routerLink="/harvest-packaging" class="link-btn">Tạo Mã & In Tem QR Code HTX ➔</a>
            <a routerLink="/sales" class="link-btn">Quản lý Bán hàng & Xem Hóa Đơn ➔</a>
          </div>
        </div>

        <!-- MODULE: TRANG TRUY XUẤT CÔNG KHAI -->
        <div class="module-card card-public">
          <div class="module-header">
            <span class="module-icon">🔍</span>
            <div class="module-tag tag-public">PUBLIC (KHÁCH QUÉT QR)</div>
          </div>
          <h3 class="module-title">Trang Truy Xuất Nguồn Gốc</h3>
          <p class="module-desc">Giao diện Mobile-First dành cho người tiêu dùng quét tem QR trên bao bì sản phẩm (ảnh thật đặc sản).</p>
          <div class="module-links">
            <a routerLink="/trace/HY-AN-ST25-2026-0988" target="_blank" class="link-btn-public">
              Xem thử Trang Quét QR Gạo ST25 An Ninh ↗
            </a>
            <a routerLink="/trace/HY-DT-GA-2026-0112" target="_blank" class="link-btn-public">
              Xem thử Trang Quét QR Gà Đông Tảo ↗
            </a>
            <a routerLink="/trace/HY-QT-NHAN-2026-3341" target="_blank" class="link-btn-public">
              Xem thử Trang Quét QR Nhãn Lồng Quyết Thắng ↗
            </a>
          </div>
        </div>

        <!-- MODULE: PHÂN QUYỀN HỆ THỐNG -->
        <div class="module-card card-primary">
          <div class="module-header">
            <span class="module-icon">🛡️</span>
            <div class="module-tag">BẢO MẬT & PHÂN QUYỀN</div>
          </div>
          <h3 class="module-title">Phân Quyền & Tài Liệu</h3>
          <p class="module-desc">Ma trận phân quyền chi tiết theo nhóm chức năng, hướng dẫn kỹ thuật canh tác VietGAP cho từng loại hình.</p>
          <div class="module-links">
            <a routerLink="/system-admin/roles" class="link-btn">Ma Trận Phân Quyền Checkbox ➔</a>
            <a routerLink="/notifications" class="link-btn">Quản Lý Thông Báo & Cảnh Báo (SMS/Zalo) ➔</a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .hub-container {
      max-width: 100%;
      margin: 0 auto;
    }

    .welcome-hero {
      background: linear-gradient(135deg, #14532d 0%, #166534 50%, #15803d 100%);
      color: white;
      padding: 16px 20px;
      border-radius: var(--radius-sm);
      box-shadow: var(--shadow-md);
      margin-bottom: 12px;
    }

    .hero-badge {
      display: inline-block;
      background: rgba(255, 255, 255, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.4);
      padding: 3px 10px;
      border-radius: var(--radius-full);
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.6px;
      margin-bottom: 8px;
    }

    .hero-title {
      font-size: 22px;
      color: white;
      margin-bottom: 6px;
      line-height: 1.25;
    }

    .hero-desc {
      font-size: 13.5px;
      color: #e2e8f0;
      max-width: 800px;
      margin-bottom: 14px;
    }

    .quick-switcher-card {
      background: rgba(255, 255, 255, 0.95);
      border-radius: var(--radius-sm);
      padding: 12px 14px;
      color: var(--text-main);
      display: flex;
      flex-direction: column;
      gap: 10px;
      box-shadow: var(--shadow-sm);
    }

    .relation-flow-card {
      background: #f0fdf4;
      border: 1.5px solid #86efac;
      border-radius: var(--radius-sm);
      padding: 12px 16px;
      margin-bottom: 14px;
      box-shadow: var(--shadow-sm);
    }

    .flow-badge {
      display: inline-block;
      background: #166534;
      color: white;
      font-size: 10.5px;
      font-weight: 800;
      padding: 2px 8px;
      border-radius: var(--radius-full);
      margin-bottom: 4px;
      letter-spacing: 0.5px;
    }

    .flow-title {
      font-size: 16px;
      font-weight: 800;
      color: #14532d;
      margin: 0 0 3px 0;
    }

    .flow-subtitle {
      font-size: 13px;
      color: #166534;
      margin: 0 0 10px 0;
    }

    .flow-steps {
      display: flex;
      align-items: center;
      gap: 8px;
      overflow-x: auto;
      padding-bottom: 4px;
    }

    .flow-node {
      background: white;
      border: 1.5px solid #bbf7d0;
      border-radius: var(--radius-sm);
      padding: 8px 10px;
      min-width: 140px;
      flex: 1;
      display: flex;
      flex-direction: column;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    }

    .flow-node.highlight {
      border-color: #22c55e;
      background: #fafffc;
      box-shadow: 0 2px 6px rgba(34, 197, 94, 0.12);
    }

    .node-icon {
      font-size: 18px;
      margin-bottom: 4px;
    }

    .node-title {
      font-size: 12.5px;
      font-weight: 800;
      color: var(--text-main);
      margin-bottom: 2px;
    }

    .node-desc {
      font-size: 11px;
      color: var(--text-muted);
      line-height: 1.3;
      margin-bottom: 6px;
      flex: 1;
    }

    .node-link {
      font-size: 11.5px;
      font-weight: 800;
      color: var(--primary-700);
      text-decoration: none;
    }

    .node-link:hover {
      text-decoration: underline;
    }

    .flow-arrow {
      font-size: 16px;
      font-weight: 800;
      color: #16a34a;
    }

    .switch-label {
      font-size: 12px;
      font-weight: 800;
      color: var(--primary-900);
      letter-spacing: 0.5px;
      margin-bottom: 6px;
      display: block;
    }

    .htx-button-group, .role-button-group {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .btn-htx-pill, .btn-role-pill {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 10px;
      background: #f1f5f9;
      border: 1.5px solid var(--border-color);
      border-radius: var(--radius-sm);
      cursor: pointer;
      text-align: left;
      transition: all 0.15s;
    }

    .btn-htx-pill:hover, .btn-role-pill:hover {
      background: #e2e8f0;
    }

    .btn-htx-pill.active, .btn-role-pill.active {
      background: var(--primary-100);
      border-color: var(--primary-700);
      box-shadow: 0 0 0 1.5px var(--primary-700);
    }

    .pill-logo {
      font-size: 18px;
    }

    .pill-title {
      font-size: 12.5px;
      font-weight: 800;
      color: var(--text-main);
      display: block;
    }

    .pill-sub {
      font-size: 11px;
      color: var(--text-muted);
      display: block;
    }

    .section-title-wrap {
      margin-bottom: 12px;
    }

    .section-title-wrap h2 {
      font-size: 18px;
      margin-bottom: 2px;
    }

    .section-title-wrap p {
      font-size: 13px;
      color: var(--text-muted);
    }

    .modules-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 10px;
    }

    .module-card {
      background: white;
      border-radius: var(--radius-sm);
      border: 1.5px solid var(--border-color);
      padding: 12px 14px;
      display: flex;
      flex-direction: column;
      box-shadow: var(--shadow-sm);
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .module-card:hover {
      transform: translateY(-3px);
      box-shadow: var(--shadow-lg);
    }

    .card-accent {
      border-color: var(--primary-600);
      background: #fafdfb;
    }

    .card-public {
      border-color: var(--amber-600);
      background: #fffdfa;
    }

    .module-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .module-icon {
      font-size: 32px;
    }

    .module-tag {
      font-size: 11px;
      font-weight: 800;
      background: #e2e8f0;
      color: var(--text-main);
      padding: 3px 8px;
      border-radius: var(--radius-sm);
    }

    .tag-priority {
      background: var(--primary-700);
      color: white;
    }

    .tag-public {
      background: var(--amber-700);
      color: white;
    }

    .module-title {
      font-size: 19px;
      font-weight: 800;
      margin-bottom: 8px;
    }

    .module-desc {
      font-size: 14.5px;
      color: var(--text-muted);
      line-height: 1.45;
      margin-bottom: 18px;
      flex: 1;
    }

    .module-links {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .link-btn {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 11px 14px;
      background: #f8fafc;
      border: 1.5px solid var(--border-color);
      border-radius: var(--radius-md);
      color: var(--text-main);
      font-size: 14px;
      font-weight: 700;
      text-decoration: none;
      transition: background 0.15s, border-color 0.15s;
    }

    .link-btn:hover {
      background: var(--primary-100);
      border-color: var(--primary-700);
      color: var(--primary-900);
    }

    .link-btn-public {
      display: block;
      padding: 11px 14px;
      background: var(--amber-100);
      border: 1.5px solid var(--amber-700);
      border-radius: var(--radius-md);
      color: var(--amber-900);
      font-size: 14px;
      font-weight: 800;
      text-decoration: none;
      text-align: center;
    }

    .link-btn-public:hover {
      background: var(--amber-600);
      color: white;
    }

    .badge-alert {
      background: var(--danger-600);
      color: white;
      font-size: 11px;
      font-weight: 800;
      padding: 2px 6px;
      border-radius: var(--radius-full);
      margin-left: 6px;
    }

    @media (max-width: 768px) {
      .hero-title {
        font-size: 22px;
      }
      .modules-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class DemoHubComponent {
  state = inject(HtxStateService);
  mockData = inject(MockDataService);
}
