import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HtxStateService } from '../../../core/services/htx-state.service';
import { ProductionZone, FarmingType } from '../../../core/models/htx.model';
import { ToastService } from '../../../core/services/toast.service';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-zones-list',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent],
  template: `
    <div class="zones-page">
      <!-- HEADER TRANG -->
      <div class="page-top">
        <div>
          <div class="page-sub">QUẢN TRỊ SẢN XUẤT • {{ state.currentHtx().shortName }}</div>
          <h1 class="page-title">Vùng Trồng, Chăn Nuôi & Dự Báo Sản Lượng</h1>
        </div>
        <button class="btn btn-primary" (click)="openAddModal()">
          <span>➕</span> Thêm Vùng Sản Xuất Mới
        </button>
      </div>

      <!-- BẢN ĐỒ MINH HỌA VÙNG TRỒNG TRỰC QUAN -->
      <div class="card map-card">
        <div class="card-header">
          <h2 class="card-title">🗺️ Sơ Đồ Quy Hoạch Vùng Canh Tác HTX</h2>
          <div class="map-legend">
            <span class="legend-item"><span class="dot dot-green"></span> Đang sinh trưởng</span>
            <span class="legend-item"><span class="dot dot-amber"></span> Sắp thu hoạch</span>
            <span class="legend-item"><span class="dot dot-blue"></span> Nghỉ vụ / Cày ải</span>
          </div>
        </div>

        <div class="svg-map-wrapper">
          <div class="zones-interactive-grid">
            @for (z of state.currentZones(); track z.id) {
              <div 
                class="zone-parcel-box" 
                [class.parcel-harvest]="z.statusType === 'harvest'"
                [class.parcel-good]="z.statusType === 'good'"
                [class.parcel-rest]="z.statusType === 'rest'"
                (click)="viewZoneDetail(z)">
                <div class="parcel-badge">{{ z.code }}</div>
                <h3 class="parcel-title">{{ z.name }}</h3>
                <div class="parcel-crop">🌾 Giống: <strong>{{ z.varietyName || z.currentCrop }}</strong></div>
                <div class="parcel-soil">🏞️ {{ z.soilOrWaterType }}</div>
                <div class="parcel-stats">
                  <span>📐 {{ z.areaHa }} ha</span>
                  <span>👨‍🌾 {{ z.managerName }}</span>
                </div>
                <div class="parcel-status-pill">
                  {{ z.status }}
                </div>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- BẢNG DỰ BÁO SẢN LƯỢNG CHI TIẾT KÈM THAO TÁC CRUD -->
      <div class="card p-0">
        <div class="card-header p-20">
          <h2 class="card-title">📊 Bảng Kế Hoạch Sản Xuất & Dự Báo Sản Lượng</h2>
          <div class="filter-actions">
            <input 
              type="text" 
              class="form-control form-control-sm" 
              placeholder="Tìm theo mã MSVT, tên vùng, chủ hộ..." 
              [ngModel]="searchKeyword()" 
              (ngModelChange)="onSearchChange($event)"
            />
            <button class="btn btn-secondary btn-sm" (click)="exportReport()">📑 Xuất Báo Cáo</button>
          </div>
        </div>

        <div class="table-responsive hide-mobile">
          <table class="data-table clean-table">
            <thead>
              <tr>
                <th style="width: 30%;">Vùng Sản Xuất & Giống</th>
                <th style="width: 25%;">Quy Mô & Chủ Hộ</th>
                <th style="width: 23%;">Dự Báo Thu Hoạch</th>
                <th style="width: 10%;">Tình Trạng</th>
                <th style="text-align: right; width: 12%;">Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              @for (z of paginatedZones(); track z.id) {
                <tr>
                  <td>
                    <div><strong>{{ z.name }}</strong></div>
                    <div class="sub-text">
                      <span class="code-pill">{{ z.code }}</span> • 
                      <span class="badge badge-info">{{ z.varietyName || z.currentCrop }}</span>
                    </div>
                  </td>
                  <td>
                    <div><strong>{{ z.areaHa }} ha</strong> ({{ z.soilOrWaterType }})</div>
                    <div class="sub-text">
                      👨‍🌾 {{ z.managerName }} (<a [href]="'tel:' + z.managerPhone" class="sub-phone">{{ z.managerPhone }}</a>)
                    </div>
                  </td>
                  <td>
                    <div><strong style="color: var(--primary-800); font-size: 15px;">{{ (z.expectedYieldKg / 1000) | number:'1.0-1' }} tấn</strong></div>
                    <small style="color: var(--text-muted);">Dự kiến: {{ z.expectedHarvestDate }}</small>
                  </td>
                  <td>
                    <span class="badge" [class.badge-success]="z.statusType === 'good'" [class.badge-warning]="z.statusType === 'harvest'">
                      {{ z.status }}
                    </span>
                  </td>
                  <td style="text-align: right;">
                    <div class="table-actions-inline" style="justify-content: flex-end;">
                      <button class="btn btn-secondary btn-sm" (click)="openEditModal(z)">✏️ Sửa</button>
                      <button class="btn btn-danger btn-sm" (click)="confirmDelete(z)">🗑️ Xóa</button>
                    </div>
                  </td>
                </tr>
              }
              @if (paginatedZones().length === 0) {
                <tr>
                  <td colspan="5" style="text-align: center; padding: 32px; color: var(--text-muted);">
                    Chưa tìm thấy vùng sản xuất nào phù hợp với từ khóa "{{ searchKeyword() }}".
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- MOBILE CARDS -->
        <div class="mobile-card-list show-mobile p-16">
          @for (z of paginatedZones(); track z.id) {
            <div class="mobile-data-card">
              <div class="card-row">
                <div>
                  <strong>{{ z.name }}</strong>
                  <div class="sub-text">{{ z.code }}</div>
                </div>
                <span class="badge" [class.badge-success]="z.statusType === 'good'" [class.badge-warning]="z.statusType === 'harvest'">
                  {{ z.status }}
                </span>
              </div>
              <div class="card-row">
                <span class="label">Giống canh tác:</span>
                <span class="value">{{ z.varietyName || z.currentCrop }}</span>
              </div>
              <div class="card-row">
                <span class="label">Quy mô:</span>
                <span class="value">{{ z.areaHa }} ha • {{ (z.expectedYieldKg / 1000) | number:'1.0-1' }} tấn</span>
              </div>
              <div class="card-row">
                <span class="label">Chủ hộ:</span>
                <span class="value">{{ z.managerName }} ({{ z.managerPhone }})</span>
              </div>
              <div class="mobile-card-actions">
                <button class="btn btn-secondary" (click)="openEditModal(z)">Sửa</button>
                <button class="btn btn-danger" (click)="confirmDelete(z)">Xóa</button>
              </div>
            </div>
          }
        </div>

        <app-pagination 
          [totalItems]="filteredZones().length"
          [pageSize]="pageSize()"
          [currentPage]="currentPage()"
          (pageChange)="currentPage.set($event)"
          (pageSizeChange)="pageSize.set($event)">
        </app-pagination>
      </div>

      <!-- MODAL THÊM / SỬA VÙNG SẢN XUẤT -->
      @if (showModal()) {
        <div class="modal-backdrop">
          <div class="modal-dialog modal-lg">
            <div class="modal-header-simple">
              <h2 class="card-title" style="margin: 0;">
                {{ isEditing() ? '✏️ Chỉnh Sửa Vùng Sản Xuất' : '➕ Khai Báo Vùng Sản Xuất Mới' }}
              </h2>
              <button type="button" class="btn-close-modal" (click)="showModal.set(false)" title="Đóng">✕</button>
            </div>
            
            <form (submit)="saveZone($event)">
              <div class="form-row-2">
                <div class="form-group">
                  <label class="form-label">Tên vùng canh tác / trại: <span class="required">*</span></label>
                  <input type="text" class="form-control" placeholder="Ví dụ: Cánh đồng mẫu lớn Đội 4" [(ngModel)]="currentZoneData.name" name="name" required />
                </div>
                <div class="form-group">
                  <label class="form-label">Mã số vùng trồng (MSVT): <span class="required">*</span></label>
                  <input type="text" class="form-control" [(ngModel)]="currentZoneData.code" name="code" required />
                </div>
              </div>

              <div class="form-row-2">
                <div class="form-group">
                  <label class="form-label">Loại hình sản xuất:</label>
                  <select class="form-control" [(ngModel)]="currentZoneData.farmingType" name="farmingType">
                    <option value="crop">🌾 Trồng trọt (Lúa, Cây ăn quả)</option>
                    <option value="livestock">🐓 Chăn nuôi (Gia cầm, Gia súc)</option>
                    <option value="aquaculture">🐟 Thủy sản (Cá lồng bè)</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Chủ hộ phụ trách quản lý: <span class="required">*</span></label>
                  <select 
                    class="form-control" 
                    [(ngModel)]="selectedMemberId" 
                    name="memberSelect" 
                    (change)="onMemberChange()" 
                    required>
                    <option value="" disabled>-- Chọn xã viên trong HTX --</option>
                    @for (m of state.currentMembers(); track m.id) {
                      <option [value]="m.id">
                        {{ m.name }} • ({{ m.phone }}) - {{ m.village || m.address }}
                      </option>
                    }
                  </select>
                </div>
              </div>

              <div class="form-row-2">
                <div class="form-group">
                  <label class="form-label">Diện tích (ha) hoặc số lồng/chuồng: <span class="required">*</span></label>
                  <input type="number" step="0.1" class="form-control" placeholder="Ví dụ: 12.5" [(ngModel)]="currentZoneData.areaHa" name="areaHa" required />
                </div>
                <div class="form-group">
                  <label class="form-label">Giống cây / con nuôi: <span class="required">*</span></label>
                  <select 
                    class="form-control" 
                    [(ngModel)]="currentZoneData.varietyName" 
                    name="varietySelect" 
                    required>
                    <option value="" disabled>-- Chọn giống từ danh mục chuẩn --</option>
                    @for (g of cropBreedsList(); track g.code) {
                      <option [value]="g.name">
                        {{ g.name }} [{{ g.code }}] • {{ g.subType }}
                      </option>
                    }
                  </select>
                </div>
              </div>

              <div class="form-row-2">
                <div class="form-group">
                  <label class="form-label">Đặc điểm đất / Nguồn nước:</label>
                  <input type="text" class="form-control" placeholder="Ví dụ: Đất phù sa ven sông Luộc" [(ngModel)]="currentZoneData.soilOrWaterType" name="soil" />
                </div>
                <div class="form-group">
                  <label class="form-label">Sản lượng dự kiến (kg):</label>
                  <input type="number" class="form-control" placeholder="60000" [(ngModel)]="currentZoneData.expectedYieldKg" name="yield" />
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Dự kiến ngày thu hoạch:</label>
                <input type="text" class="form-control" placeholder="30/10/2026" [(ngModel)]="currentZoneData.expectedHarvestDate" name="harvestDate" />
              </div>

              <div class="modal-actions">
                <button type="button" class="btn btn-secondary" (click)="showModal.set(false)">Hủy Bỏ</button>
                <button type="submit" class="btn btn-primary">
                  {{ isEditing() ? 'LƯU CẬP NHẬT VÙNG' : 'LƯU VÙNG MỚI' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- MODAL XÁC NHẬN XÓA VÙNG -->
      @if (zoneToDelete()) {
        <div class="modal-backdrop">
          <div class="modal-dialog modal-confirm">
            <div class="confirm-icon">⚠️</div>
            <h2 class="confirm-title">Xác Nhận Xóa Vùng Canh Tác</h2>
            <p class="confirm-desc">
              Bác có chắc muốn xóa vùng <strong>"{{ zoneToDelete()?.name }}"</strong>? Nếu vùng đã phát sinh nhật ký, hệ thống sẽ tự động chuyển sang lưu trữ ẩn.
            </p>
            <div class="modal-actions">
              <button class="btn btn-secondary" (click)="zoneToDelete.set(null)">Hủy Bỏ</button>
              <button class="btn btn-danger" (click)="executeDelete()">ĐỒNG Ý XÓA</button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .zones-page {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .p-0 { padding: 0 !important; }
    .p-20 { padding: 10px 14px !important; }
    .p-16 { padding: 10px 12px !important; }

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

    .map-card {
      background: #f8fafc;
      border: 1.5px solid var(--border-color);
    }

    .map-legend {
      display: flex;
      gap: 12px;
      font-size: 12px;
      font-weight: 700;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      display: inline-block;
    }
    .dot-green { background-color: var(--primary-600); }
    .dot-amber { background-color: var(--amber-600); }
    .dot-blue { background-color: var(--info-600); }

    .zones-interactive-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 10px;
    }

    .zone-parcel-box {
      background: white;
      border: 1.5px solid var(--border-color);
      border-radius: var(--radius-sm);
      padding: 10px 12px;
      cursor: pointer;
      transition: all 0.2s ease;
      position: relative;
    }

    .zone-parcel-box:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }

    .parcel-good {
      border-left: 5px solid var(--primary-600);
    }

    .parcel-harvest {
      border-left: 5px solid var(--amber-600);
      background-color: #fffdfa;
    }

    .parcel-rest {
      border-left: 5px solid var(--info-600);
    }

    .parcel-badge {
      font-size: 11px;
      font-weight: 800;
      background: var(--bg-app);
      padding: 1px 6px;
      border-radius: 4px;
      display: inline-block;
      margin-bottom: 4px;
    }

    .parcel-title {
      font-size: 15px;
      font-weight: 800;
      color: var(--text-main);
      margin-bottom: 4px;
    }

    .parcel-crop, .parcel-soil {
      font-size: 12.5px;
      color: var(--text-body);
      margin-bottom: 3px;
    }

    .parcel-stats {
      display: flex;
      justify-content: space-between;
      margin-top: 8px;
      font-size: 12px;
      font-weight: 700;
      color: var(--text-muted);
      border-top: 1px dashed var(--border-color);
      padding-top: 6px;
    }

    .parcel-status-pill {
      margin-top: 4px;
      font-size: 11px;
      font-weight: 800;
      color: var(--primary-800);
    }

    .filter-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .sub-phone {
      font-size: 11.5px;
      color: var(--primary-700);
      text-decoration: none;
      font-weight: 600;
      display: block;
      white-space: nowrap;
    }

    .mobile-card-actions {
      display: flex;
      gap: 6px;
      margin-top: 6px;
    }
    .mobile-card-actions .btn {
      flex: 1;
    }

    .form-row-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }

    @media (max-width: 768px) {
      .form-row-2 {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ZonesListComponent {
  state = inject(HtxStateService);
  toast = inject(ToastService);

  searchKeyword = signal('');
  currentPage = signal(1);
  pageSize = signal(10);

  showModal = signal(false);
  isEditing = signal(false);
  selectedMemberId = '';
  zoneToDelete = signal<ProductionZone | null>(null);

  // Danh mục giống cây, con nuôi chuẩn lấy từ Master Data và Sản phẩm HTX
  cropBreedsList = computed(() => {
    const list = this.state.masterDataItems().filter(m => m.categoryCode === 'MD-GIONG' && m.status === 'active');
    return list;
  });

  currentZoneData: Partial<ProductionZone> = {
    code: 'MSVT-AN-03',
    name: '',
    farmingType: 'crop' as FarmingType,
    areaHa: 10,
    managerName: '',
    managerPhone: '0983 245 118',
    currentCrop: this.state.currentHtx().primaryProduct,
    varietyName: 'Giống lúa ST25 Thượng Hạng',
    soilOrWaterType: 'Đất phù sa sông Luộc',
    plantingDate: '20/07/2026',
    expectedHarvestDate: '30/10/2026',
    expectedYieldKg: 60000,
    status: 'Đang sinh trưởng' as const,
    statusType: 'good' as const,
    locationDesc: 'Thôn An Lạc, Xã An Ninh'
  };

  onSearchChange(kw: string) {
    this.searchKeyword.set(kw);
    this.currentPage.set(1);
  }

  filteredZones = computed(() => {
    const kw = this.searchKeyword().toLowerCase().trim();
    return this.state.currentZones().filter(z =>
      !kw || z.code.toLowerCase().includes(kw) || z.name.toLowerCase().includes(kw) || z.managerName.toLowerCase().includes(kw)
    );
  });

  paginatedZones = computed(() => {
    const list = this.filteredZones();
    const start = (this.currentPage() - 1) * this.pageSize();
    return list.slice(start, start + this.pageSize());
  });

  onMemberChange() {
    const member = this.state.currentMembers().find(m => m.id === this.selectedMemberId);
    if (member) {
      this.currentZoneData.managerName = member.name;
      this.currentZoneData.managerPhone = member.phone;
    }
  }

  openAddModal() {
    this.isEditing.set(false);
    const members = this.state.currentMembers();
    const defaultMember = members.length > 0 ? members[0] : null;
    this.selectedMemberId = defaultMember ? defaultMember.id : '';

    const breeds = this.cropBreedsList();
    let defaultVariety = 'Giống lúa ST25 Thượng Hạng';
    if (this.state.currentHtx().id === 'htx-dongtao') defaultVariety = 'Gà Đông Tảo thuần chủng F1 chân vảy rồng';
    else if (this.state.currentHtx().id === 'htx-quyetthang') defaultVariety = 'Nhãn lồng Miền Thiết Hương Chi';
    else if (breeds.length > 0) defaultVariety = breeds[0].name;

    this.currentZoneData = {
      code: 'MSVT-' + this.state.currentHtx().code.split('-')[1] + '-' + Math.floor(10 + Math.random() * 90),
      name: '',
      farmingType: this.state.currentHtx().farmingType,
      areaHa: 10,
      managerName: defaultMember ? defaultMember.name : '',
      managerPhone: defaultMember ? defaultMember.phone : '0983 245 118',
      currentCrop: this.state.currentHtx().primaryProduct,
      varietyName: defaultVariety,
      soilOrWaterType: 'Đất phù sa màu mỡ',
      plantingDate: '20/07/2026',
      expectedHarvestDate: '30/10/2026',
      expectedYieldKg: 60000,
      status: 'Đang sinh trưởng' as const,
      statusType: 'good' as const,
      locationDesc: this.state.currentHtx().address
    };
    this.showModal.set(true);
  }

  openEditModal(zone: ProductionZone) {
    this.isEditing.set(true);
    this.currentZoneData = { ...zone };
    const member = this.state.currentMembers().find(m => m.name === zone.managerName || zone.managerName.includes(m.name));
    this.selectedMemberId = member ? member.id : (this.state.currentMembers()[0]?.id || '');
    this.showModal.set(true);
  }

  saveZone(e: Event) {
    e.preventDefault();
    if (!this.currentZoneData.name || !this.currentZoneData.managerName) return;

    if (this.isEditing() && this.currentZoneData.id) {
      this.state.updateZone(this.currentZoneData as ProductionZone);
    } else {
      this.state.addZone(this.currentZoneData as Omit<ProductionZone, 'id' | 'htxId'>);
    }
    this.showModal.set(false);
  }

  viewZoneDetail(z: ProductionZone) {
    this.toast.info('Vùng sản xuất', `Đang xem ${z.name} (${z.varietyName}) - Quản lý bởi ${z.managerName}`);
  }

  confirmDelete(zone: ProductionZone) {
    this.zoneToDelete.set(zone);
  }

  executeDelete() {
    if (this.zoneToDelete()) {
      this.state.deleteZone(this.zoneToDelete()!.id);
      this.zoneToDelete.set(null);
    }
  }

  exportReport() {
    this.toast.success('Đã xuất báo cáo', 'Đã tải xuống file kế hoạch sản lượng mùa vụ.');
  }
}
