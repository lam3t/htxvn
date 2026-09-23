import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HtxStateService } from '../../core/services/htx-state.service';
import { ToastService } from '../../core/services/toast.service';

interface CertItem {
  id: string;
  name: string;
  decisionNo: string;
  validity: string;
  icon: string;
  issuer: string;
}

interface PartnerItem {
  id: string;
  name: string;
  category: string;
  phone: string;
  icon: string;
  status: 'Đang hợp tác' | 'Dự kiến ký mới';
}

interface CropVarietyItem {
  id: string;
  name: string;
  origin: string;
  season: string;
  expectedYield: string;
  standard: string;
}

@Component({
  selector: 'app-htx-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="profile-page">
      <!-- HEADER TRANG -->
      <div class="page-top">
        <div>
          <div class="page-sub">HỒ SƠ NĂNG LỰC & ĐỐI TÁC • {{ state.currentHtx().code }}</div>
          <h1 class="page-title">Thông Tin Hợp Tác Xã & Chuỗi Giá Trị</h1>
        </div>
        <button class="btn btn-primary" (click)="saveProfile()">
          <span>💾</span> Lưu Thay Đổi Hồ Sơ
        </button>
      </div>

      <!-- KHUNG THÔNG TIN CHÍNH CỦA HTX -->
      <div class="profile-grid">
        <!-- CỘT TRÁI: HỒ SƠ PHÁP LÝ & CƠ BẢN -->
        <div class="card main-info-card">
          <div class="card-header">
            <h2 class="card-title">🏢 Hồ Sơ Pháp Lý Hợp Tác Xã</h2>
            <span class="badge badge-success">{{ state.currentHtx().ocopLevel }}</span>
          </div>

          <div class="info-form-grid">
            <div class="form-group">
              <label class="form-label">Tên đầy đủ của Hợp tác xã:</label>
              <input type="text" class="form-control" [(ngModel)]="htxData.name" />
            </div>

            <div class="form-group">
              <label class="form-label">Tên viết tắt / Tên thương mại:</label>
              <input type="text" class="form-control" [(ngModel)]="htxData.shortName" />
            </div>

            <div class="form-group">
              <label class="form-label">Mã định danh HTX:</label>
              <input type="text" class="form-control" [(ngModel)]="htxData.code" readonly />
            </div>

            <div class="form-group">
              <label class="form-label">Người đại diện pháp luật (Chủ tịch/Giám đốc):</label>
              <input type="text" class="form-control" [(ngModel)]="htxData.representative" />
            </div>

            <div class="form-group">
              <label class="form-label">Số điện thoại đường dây nóng:</label>
              <input type="text" class="form-control" [(ngModel)]="htxData.phone" />
            </div>

            <div class="form-group">
              <label class="form-label">Hộp thư điện tử (Email):</label>
              <input type="email" class="form-control" [(ngModel)]="htxData.email" />
            </div>

            <div class="form-group">
              <label class="form-label">Tổng số thành viên (xã viên):</label>
              <input type="number" class="form-control" [(ngModel)]="htxData.totalMembers" />
            </div>

            <div class="form-group">
              <label class="form-label">Tổng diện tích canh tác (ha):</label>
              <input type="number" step="0.1" class="form-control" [(ngModel)]="htxData.totalAreaHa" />
            </div>

            <div class="form-group span-2">
              <label class="form-label">Địa chỉ trụ sở chính:</label>
              <input type="text" class="form-control" [(ngModel)]="htxData.address" />
            </div>

            <div class="form-group span-2">
              <label class="form-label">Mô tả giới thiệu chuỗi giá trị HTX:</label>
              <textarea class="form-control" rows="3" [(ngModel)]="htxData.description"></textarea>
            </div>
          </div>
        </div>

        <!-- CỘT PHẢI: CHỨNG NHẬN, ĐỐI TÁC & GIỐNG CHỦ LỰC -->
        <div class="certs-column">
          <!-- 1. CHỨNG NHẬN CHẤT LƯỢNG -->
          <div class="card">
            <div class="card-header">
              <h2 class="card-title">⭐ Chứng Nhận Chất Lượng</h2>
              <button class="btn btn-secondary btn-sm" (click)="openAddCertModal()">+ Thêm</button>
            </div>
            <div class="certs-list">
              @for (c of certs(); track c.id) {
                <div class="cert-card">
                  <div class="cert-icon">{{ c.icon }}</div>
                  <div class="cert-info">
                    <strong>{{ c.name }}</strong>
                    <p>{{ c.decisionNo }}</p>
                    <span class="cert-valid">{{ c.validity }}</span>
                  </div>
                  <div class="item-actions">
                    <button class="btn-icon" title="Chỉnh sửa" (click)="openEditCertModal(c)">✏️</button>
                    <button class="btn-icon text-danger" title="Xóa" (click)="confirmDeleteCert(c)">🗑️</button>
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- 2. ĐỐI TÁC & DOANH NGHIỆP BAO TIÊU -->
          <div class="card">
            <div class="card-header">
              <h2 class="card-title">🤝 Đối Tác & Kênh Phân Phối</h2>
              <button class="btn btn-secondary btn-sm" (click)="openAddPartnerModal()">+ Thêm</button>
            </div>
            <div class="partners-list">
              @for (p of partners(); track p.id) {
                <div class="partner-row">
                  <span class="p-logo">{{ p.icon }}</span>
                  <div class="p-details">
                    <strong>{{ p.name }}</strong>
                    <p>{{ p.category }} • ĐT: {{ p.phone }}</p>
                  </div>
                  <div class="item-actions">
                    <button class="btn-icon" title="Chỉnh sửa" (click)="openEditPartnerModal(p)">✏️</button>
                    <button class="btn-icon text-danger" title="Xóa" (click)="confirmDeletePartner(p)">🗑️</button>
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- 3. DANH MỤC SẢN PHẨM THƯƠNG MẠI SỐ HÓA -->
          <div class="card">
            <div class="card-header">
              <h2 class="card-title">📦 Sản Phẩm Thương Mại Số Hóa</h2>
              <span class="badge badge-success">{{ state.currentHtxProducts().length }} sản phẩm OCOP</span>
            </div>
            <div class="varieties-list">
              @for (prod of state.currentHtxProducts(); track prod.id) {
                <div class="variety-row">
                  <div class="v-details">
                    <div style="display: flex; align-items: center; gap: 6px;">
                      <span class="item-code-tag">{{ prod.code }}</span>
                      <strong>{{ prod.name }}</strong>
                    </div>
                    <p>Quy cách: {{ prod.packagingSpec }} • Giá: {{ prod.defaultUnitPrice.toLocaleString('vi-VN') }} đ/{{ prod.unit }}</p>
                    <span class="badge badge-success">{{ prod.standard }}</span>
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- 4. DANH MỤC GIỐNG & CÂY TRỒNG / CON NUÔI CHỦ LỰC -->
          <div class="card">
            <div class="card-header">
              <h2 class="card-title">🌱 Giống & Cây Trồng / Con Nuôi</h2>
              <button class="btn btn-secondary btn-sm" (click)="openAddVarietyModal()">+ Thêm</button>
            </div>
            <div class="varieties-list">
              @for (v of varieties(); track v.id) {
                <div class="variety-row">
                  <div class="v-details">
                    <strong>{{ v.name }}</strong>
                    <p>Nguồn gốc: {{ v.origin }} • Vụ: {{ v.season }}</p>
                    <span class="badge badge-info">{{ v.standard }}</span>
                  </div>
                  <div class="item-actions">
                    <button class="btn-icon" title="Chỉnh sửa" (click)="openEditVarietyModal(v)">✏️</button>
                    <button class="btn-icon text-danger" title="Xóa" (click)="confirmDeleteVariety(v)">🗑️</button>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      </div>

      <!-- MODAL THÊM / SỬA CHỨNG NHẬN -->
      @if (showCertModal()) {
        <div class="modal-backdrop">
          <div class="modal-dialog modal-lg">
            <div class="modal-header-simple">
              <h2 class="card-title">{{ isEditCert() ? '✏️ Chỉnh Sửa Chứng Nhận' : '➕ Thêm Chứng Nhận Mới' }}</h2>
              <button type="button" class="btn-close-modal" (click)="showCertModal.set(false)" title="Đóng">✕</button>
            </div>
            <form (submit)="saveCert($event)">
              <div class="form-row-2">
                <div class="form-group">
                  <label class="form-label">Tên chứng nhận / Tiêu chuẩn: <span class="required">*</span></label>
                  <input type="text" class="form-control" [(ngModel)]="activeCert.name" name="certName" required placeholder="Ví dụ: Chứng nhận OCOP 4 Sao hoặc VietGAP" />
                </div>
                <div class="form-group">
                  <label class="form-label">Số quyết định / Mã chứng nhận: <span class="required">*</span></label>
                  <input type="text" class="form-control" [(ngModel)]="activeCert.decisionNo" name="decisionNo" required placeholder="Ví dụ: QĐ số 1892/QĐ-UBND" />
                </div>
              </div>
              <div class="form-row-2">
                <div class="form-group">
                  <label class="form-label">Thời hạn hiệu lực:</label>
                  <input type="text" class="form-control" [(ngModel)]="activeCert.validity" name="validity" placeholder="Ví dụ: Hiệu lực: 2024 - 2027" />
                </div>
                <div class="form-group">
                  <label class="form-label">Cơ quan cấp chứng nhận:</label>
                  <input type="text" class="form-control" [(ngModel)]="activeCert.issuer" name="issuer" placeholder="Ví dụ: Hội đồng Đánh giá OCOP Hưng Yên" />
                </div>
              </div>
              <div class="modal-actions">
                <button type="button" class="btn btn-secondary" (click)="showCertModal.set(false)">Hủy</button>
                <button type="submit" class="btn btn-primary">LƯU CHỨNG NHẬN</button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- MODAL THÊM / SỬA ĐỐI TÁC -->
      @if (showPartnerModal()) {
        <div class="modal-backdrop">
          <div class="modal-dialog modal-lg">
            <div class="modal-header-simple">
              <h2 class="card-title">{{ isEditPartner() ? '✏️ Chỉnh Sửa Đối Tác' : '➕ Thêm Đối Tác / Kênh Phân Phối' }}</h2>
              <button type="button" class="btn-close-modal" (click)="showPartnerModal.set(false)" title="Đóng">✕</button>
            </div>
            <form (submit)="savePartner($event)">
              <div class="form-group">
                <label class="form-label">Tên doanh nghiệp / Đơn vị bao tiêu: <span class="required">*</span></label>
                <input type="text" class="form-control" [(ngModel)]="activePartner.name" name="partnerName" required placeholder="Ví dụ: Tập đoàn WinCommerce (Chuỗi WinMart)" />
              </div>
              <div class="form-row-2">
                <div class="form-group">
                  <label class="form-label">Vai trò / Loại hình hợp tác:</label>
                  <input type="text" class="form-control" [(ngModel)]="activePartner.category" name="category" required placeholder="Ví dụ: Siêu thị phân phối, Nhà cung ứng..." />
                </div>
                <div class="form-group">
                  <label class="form-label">Số điện thoại liên hệ:</label>
                  <input type="text" class="form-control" [(ngModel)]="activePartner.phone" name="phone" placeholder="024 7109 8888" />
                </div>
              </div>
              <div class="modal-actions">
                <button type="button" class="btn btn-secondary" (click)="showPartnerModal.set(false)">Hủy</button>
                <button type="submit" class="btn btn-primary">LƯU ĐỐI TÁC</button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- MODAL THÊM / SỬA GIỐNG CHỦ LỰC -->
      @if (showVarietyModal()) {
        <div class="modal-backdrop">
          <div class="modal-dialog modal-lg">
            <div class="modal-header-simple">
              <h2 class="card-title">{{ isEditVariety() ? '✏️ Chỉnh Sửa Giống' : '➕ Thêm Giống / Nông Sản Chủ Lực' }}</h2>
              <button type="button" class="btn-close-modal" (click)="showVarietyModal.set(false)" title="Đóng">✕</button>
            </div>
            <form (submit)="saveVariety($event)">
              <div class="form-row-2">
                <div class="form-group">
                  <label class="form-label">Tên giống / Sản phẩm: <span class="required">*</span></label>
                  <input type="text" class="form-control" [(ngModel)]="activeVariety.name" name="vName" required placeholder="Ví dụ: Lúa ST25 Nguyên Chủng hoặc Gà Đông Tảo F1" />
                </div>
                <div class="form-group">
                  <label class="form-label">Nguồn gốc xuất xứ:</label>
                  <input type="text" class="form-control" [(ngModel)]="activeVariety.origin" name="origin" placeholder="Viện Cây Lương Thực / Bản địa" />
                </div>
              </div>
              <div class="form-row-2">
                <div class="form-group">
                  <label class="form-label">Mùa vụ chính:</label>
                  <input type="text" class="form-control" [(ngModel)]="activeVariety.season" name="season" placeholder="Vụ Xuân & Vụ Mùa hàng năm" />
                </div>
                <div class="form-group">
                  <label class="form-label">Tiêu chuẩn áp dụng:</label>
                  <input type="text" class="form-control" [(ngModel)]="activeVariety.standard" name="standard" placeholder="VietGAP & OCOP 4 sao" />
                </div>
              </div>
              <div class="modal-actions">
                <button type="button" class="btn btn-secondary" (click)="showVarietyModal.set(false)">Hủy</button>
                <button type="submit" class="btn btn-primary">LƯU GIỐNG</button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- MODAL XÁC NHẬN XÓA CHUNG -->
      @if (showDeleteModal()) {
        <div class="modal-backdrop">
          <div class="modal-dialog modal-confirm">
            <div class="confirm-icon">⚠️</div>
            <h2 class="confirm-title">Xác Nhận Xóa</h2>
            <p class="confirm-desc">
              Bác có chắc chắn muốn xóa <strong>"{{ deleteTargetName }}"</strong> khỏi hồ sơ HTX không?
            </p>
            <div class="modal-actions">
              <button class="btn btn-secondary" (click)="showDeleteModal.set(false)">Hủy Bỏ</button>
              <button class="btn btn-danger" (click)="executeDelete()">ĐỒNG Ý XÓA</button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .profile-page {
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

    .profile-grid {
      display: grid;
      grid-template-columns: 1.8fr 1.2fr;
      gap: 10px;
    }

    .info-form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }

    .span-2 {
      grid-column: span 2;
    }

    .certs-column {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .certs-list, .partners-list, .varieties-list {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .cert-card {
      background: var(--bg-card-subtle);
      border: 1.5px solid var(--border-color);
      border-radius: var(--radius-sm);
      padding: 8px 10px;
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .cert-icon {
      font-size: 20px;
    }

    .cert-info {
      flex: 1;
    }

    .cert-info strong {
      font-size: 13.5px;
      color: var(--text-main);
      display: block;
      margin-bottom: 2px;
    }

    .cert-info p {
      font-size: 12px;
      color: var(--text-muted);
      margin-bottom: 3px;
    }

    .cert-valid {
      font-size: 11px;
      font-weight: 700;
      color: var(--primary-700);
      background: var(--primary-100);
      padding: 1px 6px;
      border-radius: 4px;
      display: inline-block;
    }

    .partner-row, .variety-row {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 10px;
      border-radius: var(--radius-sm);
      background: var(--bg-card-subtle);
      border: 1px solid var(--border-color);
    }

    .p-logo {
      font-size: 18px;
    }

    .p-details, .v-details {
      flex: 1;
    }

    .p-details strong, .v-details strong {
      font-size: 14px;
      color: var(--text-main);
      display: block;
    }

    .p-details p, .v-details p {
      font-size: 12px;
      color: var(--text-muted);
      margin: 2px 0 0;
    }

    .item-actions {
      display: flex;
      gap: 4px;
    }

    .btn-icon {
      background: none;
      border: 1px solid var(--border-color);
      border-radius: 6px;
      padding: 4px 8px;
      cursor: pointer;
      font-size: 13px;
      transition: all 0.2s;
    }

    .btn-icon:hover {
      background: #ffffff;
      border-color: var(--primary-600);
    }

    .text-danger {
      color: var(--danger-600);
    }

    .btn-sm {
      min-height: 36px;
      padding: 4px 12px;
      font-size: 13px;
    }

    .modal-confirm {
      text-align: center;
      max-width: 440px;
    }

    .confirm-icon {
      font-size: 48px;
      margin-bottom: 8px;
    }

    .confirm-title {
      font-size: 20px;
      font-weight: 800;
      color: var(--text-main);
    }

    .confirm-desc {
      font-size: 14.5px;
      color: var(--text-muted);
      margin: 10px 0 20px;
      line-height: 1.5;
    }

    @media (max-width: 900px) {
      .profile-grid {
        grid-template-columns: 1fr;
      }
      .info-form-grid {
        grid-template-columns: 1fr;
      }
      .span-2 {
        grid-column: span 1;
      }
    }
  `]
})
export class HtxProfileComponent {
  state = inject(HtxStateService);
  toast = inject(ToastService);

  htxData = { ...this.state.currentHtx() };

  // Signals cho Certs, Partners, Varieties
  certs = signal<CertItem[]>([
    {
      id: 'c-01',
      name: 'Chứng nhận OCOP 4 Sao',
      decisionNo: 'Quyết định số: 1892/QĐ-UBND',
      validity: 'Hiệu lực: 2024 - 2027',
      icon: '🏅',
      issuer: 'Hội đồng Đánh giá OCOP'
    },
    {
      id: 'c-02',
      name: 'Tiêu chuẩn VietGAP Nông Nghiệp',
      decisionNo: 'Mã số chứng nhận: VietGAP-TT-26-0089',
      validity: 'Tổ chức cấp: Trung tâm Giám định',
      icon: '🌿',
      issuer: 'Trung tâm Giám định Chất lượng'
    },
    {
      id: 'c-03',
      name: 'Chỉ Dẫn Địa Lý Hưng Yên',
      decisionNo: 'Văn bằng bảo hộ nhãn hiệu tập thể',
      validity: 'Phạm vi: Toàn vùng quy hoạch HTX',
      icon: '📍',
      issuer: 'Cục Sở hữu Trí tuệ'
    }
  ]);

  partners = signal<PartnerItem[]>([
    {
      id: 'p-01',
      name: 'Tập đoàn WinCommerce (Chuỗi WinMart)',
      category: 'Kênh phân phối siêu thị miền Bắc',
      phone: '024 7109 8888',
      icon: '🏢',
      status: 'Đang hợp tác'
    },
    {
      id: 'p-02',
      name: 'Tập đoàn Quế Lâm Miền Bắc',
      category: 'Nhà cung ứng phân bón hữu cơ vi sinh',
      phone: '024 3822 5566',
      icon: '🌾',
      status: 'Đang hợp tác'
    },
    {
      id: 'p-03',
      name: 'Chuỗi Cửa Hàng Thực Phẩm Bác Tôm',
      category: 'Đơn vị thu mua độc quyền nông sản OCOP',
      phone: '0903 221 445',
      icon: '🚚',
      status: 'Đang hợp tác'
    }
  ]);

  varieties = signal<CropVarietyItem[]>([
    {
      id: 'v-01',
      name: 'Lúa ST25 & Bắc Thơm 7 Nguyên Chủng',
      origin: 'Viện Lúa ĐBSCL / Viện Cây Lương Thực',
      season: 'Vụ Xuân & Vụ Mùa',
      expectedYield: '65 - 70 tạ/ha',
      standard: 'VietGAP & OCOP 4 sao'
    },
    {
      id: 'v-02',
      name: 'Gà Đông Tảo Thuần Chủng Chân Vảy Rồng',
      origin: 'Nguồn gen bản địa Đông Tảo, Khoái Châu',
      season: 'Quanh năm (Vụ Tết xuất bán chính)',
      expectedYield: '4.2 - 5.0 kg/con',
      standard: 'An toàn sinh học HTX'
    },
    {
      id: 'v-03',
      name: 'Nhãn Lồng Miền Thiết Cổ Thụ & Cá Lăng Sông Hồng',
      origin: 'Vùng bãi bồi ven sông Hồng Hưng Yên',
      season: 'Thu hoạch chính vụ Tháng 8 - 9',
      expectedYield: '180 tấn nhãn / 45 tấn cá',
      standard: 'OCOP 4 sao & VietGAP'
    }
  ]);

  // Modal states
  showCertModal = signal(false);
  isEditCert = signal(false);
  activeCert: CertItem = { id: '', name: '', decisionNo: '', validity: '', icon: '🏅', issuer: '' };

  showPartnerModal = signal(false);
  isEditPartner = signal(false);
  activePartner: PartnerItem = { id: '', name: '', category: '', phone: '', icon: '🏢', status: 'Đang hợp tác' };

  showVarietyModal = signal(false);
  isEditVariety = signal(false);
  activeVariety: CropVarietyItem = { id: '', name: '', origin: '', season: '', expectedYield: '', standard: '' };

  showDeleteModal = signal(false);
  deleteTargetType: 'cert' | 'partner' | 'variety' = 'cert';
  deleteTargetId = '';
  deleteTargetName = '';

  saveProfile() {
    this.toast.success(
      'Lưu hồ sơ thành công!',
      `Thông tin và các chỉ số chuỗi giá trị của "${this.htxData.name}" đã được cập nhật thành công.`
    );
  }

  // Cert CRUD
  openAddCertModal() {
    this.isEditCert.set(false);
    this.activeCert = {
      id: '',
      name: '',
      decisionNo: '',
      validity: 'Hiệu lực: 3 năm',
      icon: '🏅',
      issuer: ''
    };
    this.showCertModal.set(true);
  }

  openEditCertModal(c: CertItem) {
    this.isEditCert.set(true);
    this.activeCert = { ...c };
    this.showCertModal.set(true);
  }

  saveCert(e: Event) {
    e.preventDefault();
    if (this.isEditCert()) {
      this.certs.update(list => list.map(c => c.id === this.activeCert.id ? { ...this.activeCert } : c));
      this.toast.success('Cập nhật chứng nhận', `Đã lưu thông tin chứng nhận "${this.activeCert.name}".`);
    } else {
      const newC: CertItem = {
        ...this.activeCert,
        id: 'cert-' + Date.now().toString(36)
      };
      this.certs.update(list => [newC, ...list]);
      this.toast.success('Thêm chứng nhận mới', `Đã bổ sung "${newC.name}" vào hồ sơ HTX.`);
    }
    this.showCertModal.set(false);
  }

  confirmDeleteCert(c: CertItem) {
    this.deleteTargetType = 'cert';
    this.deleteTargetId = c.id;
    this.deleteTargetName = c.name;
    this.showDeleteModal.set(true);
  }

  // Partner CRUD
  openAddPartnerModal() {
    this.isEditPartner.set(false);
    this.activePartner = {
      id: '',
      name: '',
      category: '',
      phone: '',
      icon: '🏢',
      status: 'Đang hợp tác'
    };
    this.showPartnerModal.set(true);
  }

  openEditPartnerModal(p: PartnerItem) {
    this.isEditPartner.set(true);
    this.activePartner = { ...p };
    this.showPartnerModal.set(true);
  }

  savePartner(e: Event) {
    e.preventDefault();
    if (this.isEditPartner()) {
      this.partners.update(list => list.map(p => p.id === this.activePartner.id ? { ...this.activePartner } : p));
      this.toast.success('Cập nhật đối tác', `Đã lưu thay đổi cho đối tác "${this.activePartner.name}".`);
    } else {
      const newP: PartnerItem = {
        ...this.activePartner,
        id: 'p-' + Date.now().toString(36)
      };
      this.partners.update(list => [newP, ...list]);
      this.toast.success('Thêm đối tác mới', `Đã thêm đối tác "${newP.name}".`);
    }
    this.showPartnerModal.set(false);
  }

  confirmDeletePartner(p: PartnerItem) {
    this.deleteTargetType = 'partner';
    this.deleteTargetId = p.id;
    this.deleteTargetName = p.name;
    this.showDeleteModal.set(true);
  }

  // Variety CRUD
  openAddVarietyModal() {
    this.isEditVariety.set(false);
    this.activeVariety = {
      id: '',
      name: '',
      origin: '',
      season: 'Vụ Xuân / Vụ Mùa',
      expectedYield: 'Năng suất đạt chuẩn',
      standard: 'VietGAP & OCOP'
    };
    this.showVarietyModal.set(true);
  }

  openEditVarietyModal(v: CropVarietyItem) {
    this.isEditVariety.set(true);
    this.activeVariety = { ...v };
    this.showVarietyModal.set(true);
  }

  saveVariety(e: Event) {
    e.preventDefault();
    if (this.isEditVariety()) {
      this.varieties.update(list => list.map(v => v.id === this.activeVariety.id ? { ...this.activeVariety } : v));
      this.toast.success('Cập nhật giống cây/con', `Đã cập nhật giống "${this.activeVariety.name}".`);
    } else {
      const newV: CropVarietyItem = {
        ...this.activeVariety,
        id: 'var-' + Date.now().toString(36)
      };
      this.varieties.update(list => [newV, ...list]);
      this.toast.success('Thêm giống mới', `Đã thêm giống "${newV.name}".`);
    }
    this.showVarietyModal.set(false);
  }

  confirmDeleteVariety(v: CropVarietyItem) {
    this.deleteTargetType = 'variety';
    this.deleteTargetId = v.id;
    this.deleteTargetName = v.name;
    this.showDeleteModal.set(true);
  }

  // Execute Delete
  executeDelete() {
    if (this.deleteTargetType === 'cert') {
      this.certs.update(list => list.filter(c => c.id !== this.deleteTargetId));
      this.toast.danger('Đã xóa chứng nhận', `Đã gỡ bỏ chứng nhận "${this.deleteTargetName}".`);
    } else if (this.deleteTargetType === 'partner') {
      this.partners.update(list => list.filter(p => p.id !== this.deleteTargetId));
      this.toast.danger('Đã xóa đối tác', `Đã gỡ bỏ đối tác "${this.deleteTargetName}".`);
    } else if (this.deleteTargetType === 'variety') {
      this.varieties.update(list => list.filter(v => v.id !== this.deleteTargetId));
      this.toast.danger('Đã xóa giống', `Đã gỡ bỏ giống "${this.deleteTargetName}".`);
    }
    this.showDeleteModal.set(false);
  }
}
