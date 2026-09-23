import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MockDataService } from '../../../core/services/mock-data.service';
import { HTXInfo, PackagedProduct } from '../../../core/models/htx.model';

@Component({
  selector: 'app-public-trace',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="public-trace-wrapper">
      <!-- HEADER CỦA CỔNG TRUY XUẤT CÔNG KHAI -->
      <header class="trace-header">
        <div class="header-inner">
          <div class="gov-title">
            <span class="star">⭐</span> CỔNG THÔNG TIN TRUY XUẤT NGUỒN GỐC NÔNG SẢN
          </div>
          <div class="trace-sub-desc">Hệ thống thông tin sản xuất & xác thực chuỗi cung ứng Hợp tác xã</div>
        </div>
      </header>

      <main class="trace-main-container">
        <!-- KHUNG XÁC THỰC TEM ĐIỆN TỬ CHỐNG HÀNG GIẢ -->
        <div class="verify-badge-card">
          <div class="verified-icon">🛡️</div>
          <div class="verified-info">
            <div class="verified-tag">✓ SẢN PHẨM CHÍNH HÃNG OCOP HƯNG YÊN</div>
            <div class="verified-code">Mã QR Định Danh: <strong>{{ currentCode() }}</strong></div>
            <div class="verified-time">Xác thực lúc: <strong>Hôm nay</strong> • Nhật ký số HTX đã kiểm duyệt</div>
          </div>
        </div>

        <!-- HERO BANNER SẢN PHẨM & ẢNH CHỤP -->
        <div class="product-hero-card">
          <div class="product-img-box">
            <img [src]="productInfo()?.sampleImg || 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&auto=format&fit=crop'" alt="Ảnh sản phẩm" class="product-img" />
            <div class="product-badge-float">
              {{ htxInfo()?.ocopLevel }}
            </div>
          </div>

          <div class="product-core-details">
            <h1 class="p-main-title">{{ productInfo()?.productName }}</h1>
            <div class="p-specs-grid">
              <div class="spec-box">
                <span class="lbl">Quy cách:</span>
                <strong>{{ productInfo()?.weightSpec }}</strong>
              </div>
              <div class="spec-box">
                <span class="lbl">Mã lô thu hoạch:</span>
                <strong>{{ productInfo()?.batchCode }}</strong>
              </div>
              <div class="spec-box">
                <span class="lbl">Ngày đóng gói:</span>
                <strong>{{ productInfo()?.packDate }}</strong>
              </div>
              <div class="spec-box">
                <span class="lbl">Hạn sử dụng:</span>
                <strong>{{ productInfo()?.expiryDate }}</strong>
              </div>
            </div>
          </div>
        </div>

        <!-- THÔNG TIN HỢP TÁC XÃ SẢN XUẤT -->
        <div class="card htx-contact-card">
          <div class="htx-header-row">
            <div class="htx-logo-circle">{{ htxInfo()?.logo }}</div>
            <div>
              <div class="htx-label">ĐƠN VỊ SẢN XUẤT & CHỊU TRÁCH NHIỆM:</div>
              <h2 class="htx-name">{{ htxInfo()?.name }}</h2>
            </div>
          </div>

          <div class="htx-info-list">
            <div class="htx-row">
              <span class="ico">📍</span>
              <span><strong>Địa chỉ:</strong> {{ htxInfo()?.address }}</span>
            </div>
            <div class="htx-row">
              <span class="ico">👨‍💼</span>
              <span><strong>Đại diện pháp luật:</strong> {{ htxInfo()?.representative }}</span>
            </div>
            <div class="htx-row">
              <span class="ico">📞</span>
              <span><strong>Hotline hỗ trợ:</strong> <a [href]="'tel:' + htxInfo()?.phone" class="phone-link">{{ htxInfo()?.phone }}</a></span>
            </div>
          </div>

          <div class="hotline-btn-wrap">
            <a [href]="'tel:' + htxInfo()?.phone" class="btn btn-primary btn-block btn-lg">
              <span>📞</span> GỌI ĐẶT MUA / HỖ TRỢ: {{ htxInfo()?.phone }}
            </a>
          </div>
        </div>

        <!-- HÀNH TRÌNH CHUỖI GIÁ TRỊ TỪ GIỐNG ĐẾN BÀN ĂN (5 BƯỚC TIMELINE) -->
        <div class="card journey-card">
          <div class="card-header">
            <h2 class="card-title">🌱 Hành Trình Sản Xuất & Nguồn Gốc</h2>
            <span class="badge badge-success">Minh bạch 100%</span>
          </div>

          <div class="journey-timeline">
            <!-- BƯỚC 1 -->
            <div class="journey-step done">
              <div class="step-num">1</div>
              <div class="step-content">
                <div class="step-time">Giai đoạn 1 • Chuẩn bị giống</div>
                <h3 class="step-title">Xuất Giống Nguyên Chủng Đạt Chuẩn</h3>
                <p class="step-desc">Giống cây/con được kiểm định nghiêm ngặt từ Viện Cây Lương Thực / Trại giống chuẩn F1, có chứng nhận nguồn gốc xuất xứ.</p>
              </div>
            </div>

            <!-- BƯỚC 2 -->
            <div class="journey-step done">
              <div class="step-num">2</div>
              <div class="step-content">
                <div class="step-time">Giai đoạn 2 • Canh tác sinh học</div>
                <h3 class="step-title">Chăm Sóc Hữu Cơ & Nhật Ký Điện Tử (Hash)</h3>
                <p class="step-desc">100% bón phân vi sinh Quế Lâm, thảo dược tự nhiên. Mọi công việc được ghi nhật ký và đóng dấu thời gian bảo mật chống gian lận.</p>
                <div class="hash-tag-box">
                  <span class="lock-icon">🔒</span> Mã xác thực chuỗi cung ứng HTX: <code>0x8f2a9e...e3b1c4 (Đã kiểm duyệt & niêm phong)</code>
                </div>
              </div>
            </div>

            <!-- BƯỚC 3 -->
            <div class="journey-step done">
              <div class="step-num">3</div>
              <div class="step-content">
                <div class="step-time">Giai đoạn 3 • Thu hoạch</div>
                <h3 class="step-title">Thu Hoạch Cơ Giới Đúng Độ Chín</h3>
                <p class="step-desc">Thu hoạch bằng máy đập liên hợp / tuyển chọn gà đạt thể trọng 4.2kg / nhãn hái đúng thời điểm ngọt đậm đà nhất.</p>
              </div>
            </div>

            <!-- BƯỚC 4 -->
            <div class="journey-step done">
              <div class="step-num">4</div>
              <div class="step-content">
                <div class="step-time">Giai đoạn 4 • Sơ chế & Đóng gói</div>
                <h3 class="step-title">Sơ Chế Khép Kín & Đóng Gói Mã QR</h3>
                <p class="step-desc">Hút chân không, đóng hộp định lượng chuẩn OCOP, in và dán tem QR Code truy xuất điện tử có mã định danh duy nhất.</p>
              </div>
            </div>

            <!-- BƯỚC 5 -->
            <div class="journey-step done">
              <div class="step-num">5</div>
              <div class="step-content">
                <div class="step-time">Giai đoạn 5 • Xuất xưởng & Phân phối</div>
                <h3 class="step-title">Kiểm Nghiệm Vệ Sinh ATTP & Phân Phối</h3>
                <p class="step-desc">Sản phẩm đạt 0% dư lượng thuốc bảo vệ thực vật, đủ điều kiện vào hệ thống siêu thị WinMart và xuất khẩu.</p>
              </div>
            </div>
          </div>
        </div>

        <!-- CHỨNG NHẬN & KIỂM ĐỊNH CHẤT LƯỢNG -->
        <div class="card cert-showcase-card">
          <div class="card-header">
            <h2 class="card-title">📜 Giấy Chứng Nhận & Kiểm Nghiệm</h2>
          </div>
          <div class="cert-badges-row">
            <div class="cert-pill">
              <span class="c-star">⭐</span>
              <div>
                <strong>Chứng nhận OCOP 4 Sao</strong>
                <p>Đặc sản Hưng Yên</p>
              </div>
            </div>

            <div class="cert-pill">
              <span class="c-star">🌿</span>
              <div>
                <strong>Tiêu chuẩn VietGAP</strong>
                <p>Mã: VietGAP-TT-26-0089</p>
              </div>
            </div>

            <div class="cert-pill">
              <span class="c-star">📍</span>
              <div>
                <strong>Chỉ Dẫn Địa Lý</strong>
                <p>Vùng trồng quy hoạch</p>
              </div>
            </div>
          </div>
        </div>

        <!-- NÚT QUAY LẠI HỆ THỐNG QUẢN TRỊ -->
        <div class="trace-footer-nav">
          <a routerLink="/demo-hub" class="btn btn-secondary btn-block">
            🧭 Quay lại Bảng Mục Lục Quản Trị HTX
          </a>
        </div>
      </main>

      <!-- FOOTER BẢN QUYỀN -->
      <footer class="public-footer">
        <p>© 2026 Hệ Thống Quản Trị Hợp Tác Xã & Truy Xuất Nguồn Gốc Nông Sản</p>
        <p>Hệ thống thông tin sản xuất phục vụ quản trị HTX và truy xuất nguồn gốc</p>
      </footer>
    </div>
  `,
  styles: [`
    .public-trace-wrapper {
      min-height: 100vh;
      background: #f1f5f9;
      display: flex;
      flex-direction: column;
      font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    }

    .trace-header {
      background: linear-gradient(135deg, #14532d 0%, #166534 100%);
      color: white;
      padding: 18px 16px;
      text-align: center;
      box-shadow: var(--shadow-md);
    }

    .gov-title {
      font-size: 15px;
      font-weight: 800;
      letter-spacing: 0.5px;
      margin-bottom: 2px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
    }

    .trace-sub-desc {
      font-size: 12px;
      color: #bbf7d0;
      font-weight: 600;
    }

    .trace-main-container {
      max-width: 680px;
      width: 100%;
      margin: 0 auto;
      padding: 16px 14px 40px 14px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .verify-badge-card {
      background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
      border: 2px solid var(--primary-600);
      border-radius: var(--radius-lg);
      padding: 16px;
      display: flex;
      align-items: center;
      gap: 14px;
      box-shadow: var(--shadow-sm);
    }

    .verified-icon {
      font-size: 38px;
    }

    .verified-tag {
      font-size: 14px;
      font-weight: 800;
      color: var(--primary-900);
      letter-spacing: 0.5px;
      margin-bottom: 2px;
    }

    .verified-code {
      font-size: 13.5px;
      color: var(--text-main);
    }

    .verified-time {
      font-size: 12px;
      color: var(--text-muted);
    }

    .product-hero-card {
      background: white;
      border: 2px solid var(--border-color);
      border-radius: var(--radius-xl);
      overflow: hidden;
      box-shadow: var(--shadow-md);
    }

    .product-img-box {
      position: relative;
      width: 100%;
      height: 260px;
    }

    .product-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .product-badge-float {
      position: absolute;
      top: 14px;
      right: 14px;
      background: var(--amber-700);
      color: white;
      font-size: 13px;
      font-weight: 800;
      padding: 6px 14px;
      border-radius: var(--radius-full);
      box-shadow: var(--shadow-md);
      border: 2px solid white;
    }

    .product-core-details {
      padding: 20px;
    }

    .p-main-title {
      font-size: 22px;
      font-weight: 800;
      color: var(--text-main);
      margin-bottom: 14px;
      line-height: 1.3;
    }

    .p-specs-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    .spec-box {
      background: var(--bg-card-subtle);
      padding: 10px 12px;
      border-radius: var(--radius-md);
      border: 1px solid var(--border-color);
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .spec-box .lbl {
      font-size: 12px;
      color: var(--text-muted);
      font-weight: 600;
    }

    .spec-box strong {
      font-size: 14px;
      color: var(--text-main);
    }

    .htx-header-row {
      display: flex;
      align-items: center;
      gap: 14px;
      margin-bottom: 14px;
      padding-bottom: 12px;
      border-bottom: 2px solid var(--border-color);
    }

    .htx-logo-circle {
      font-size: 34px;
      width: 54px;
      height: 54px;
      background: var(--primary-100);
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1.5px solid var(--primary-600);
    }

    .htx-label {
      font-size: 11px;
      font-weight: 800;
      color: var(--primary-800);
      letter-spacing: 0.5px;
    }

    .htx-name {
      font-size: 18px;
      font-weight: 800;
      color: var(--text-main);
      margin: 0;
    }

    .htx-info-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
      font-size: 14px;
      margin-bottom: 16px;
    }

    .htx-row {
      display: flex;
      gap: 8px;
      align-items: flex-start;
    }

    .phone-link {
      color: var(--primary-700);
      font-weight: 800;
      text-decoration: none;
    }

    /* TIMELINE 5 BƯỚC HÀNH TRÌNH */
    .journey-timeline {
      display: flex;
      flex-direction: column;
      gap: 16px;
      position: relative;
      padding-left: 20px;
      border-left: 3px solid var(--primary-600);
      margin-left: 10px;
      margin-top: 10px;
    }

    .journey-step {
      position: relative;
    }

    .step-num {
      position: absolute;
      left: -32px;
      top: 0;
      width: 24px;
      height: 24px;
      background: var(--primary-700);
      color: white;
      border-radius: var(--radius-full);
      font-size: 12px;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid white;
      box-shadow: 0 0 0 2px var(--primary-700);
    }

    .step-content {
      background: var(--bg-card-subtle);
      border: 1.5px solid var(--border-color);
      border-radius: var(--radius-md);
      padding: 14px;
    }

    .step-time {
      font-size: 12px;
      font-weight: 800;
      color: var(--primary-800);
      margin-bottom: 2px;
    }

    .step-title {
      font-size: 16px;
      font-weight: 800;
      color: var(--text-main);
      margin-bottom: 4px;
    }

    .step-desc {
      font-size: 13.5px;
      color: var(--text-muted);
      line-height: 1.45;
      margin: 0;
    }

    .hash-tag-box {
      margin-top: 8px;
      padding: 6px 10px;
      background: #e0f2fe;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 700;
      color: #0369a1;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    .cert-badges-row {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .cert-pill {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: var(--bg-card-subtle);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
    }

    .c-star {
      font-size: 26px;
    }

    .cert-pill strong {
      font-size: 14px;
      color: var(--text-main);
      display: block;
    }

    .cert-pill p {
      font-size: 12px;
      color: var(--text-muted);
      margin: 0;
    }

    .public-footer {
      text-align: center;
      padding: 20px 16px;
      background: #ffffff;
      border-top: 1px solid var(--border-color);
      font-size: 12px;
      color: var(--text-muted);
    }
  `]
})
export class PublicTraceComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private mockData = inject(MockDataService);

  currentCode = signal('HY-AN-ST25-2026-0988');
  productInfo = signal<PackagedProduct | null>(null);
  htxInfo = signal<HTXInfo | null>(null);

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const code = params.get('qrCode') || 'HY-AN-ST25-2026-0988';
      this.currentCode.set(code);

      // Find packaged product by qrCode
      const pkg = this.mockData.packagedProducts.find(p => p.qrCode === code) || this.mockData.packagedProducts[0];
      this.productInfo.set(pkg);

      // Find HTX info
      const htx = this.mockData.cooperatives.find(h => h.id === pkg.htxId) || this.mockData.cooperatives[0];
      this.htxInfo.set(htx);
    });
  }
}
