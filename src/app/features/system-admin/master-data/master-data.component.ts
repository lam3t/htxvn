import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HtxStateService } from '../../../core/services/htx-state.service';
import { ToastService } from '../../../core/services/toast.service';
import { MasterDataItem } from '../../../core/models/htx.model';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

interface MasterCatDefinition {
  code: 'MD-SAN-PHAM' | 'MD-GIONG' | 'MD-MUA-VU' | 'MD-PHAN-BVTV' | 'MD-VACXIN-THUCAN' | 'MD-STANDARDS' | 'MD-DVT';
  name: string;
  icon: string;
  description: string;
}

@Component({
  selector: 'app-master-data',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent],
  template: `
    <div class="master-data-page">
      <!-- HEADER TRANG GỌN -->
      <div class="page-top">
        <div>
          <div class="page-sub">QUẢN TRỊ HỆ THỐNG • MASTER DATA CHUẨN NÔNG NGHIỆP</div>
          <h1 class="page-title">Quản Lý Danh Mục Dùng Chung Chuẩn Hóa</h1>
        </div>
        <div class="top-actions">
          <button class="btn btn-primary" (click)="openAddItemModal()">
            <span>➕</span> Thêm Mục Chuẩn Mới
          </button>
        </div>
      </div>

      <!-- GIAO DIỆN 2 CỘT CHUẨN QUẢN TRỊ GỌN GÀNG -->
      <div class="master-layout-grid">
        <!-- CỘT 1: CÂY DANH MỤC NGHIỆP VỤ (CATEGORY DIRECTORY GỌN) -->
        <div class="card category-sidebar-card">
          <div class="card-header">
            <h2 class="card-title">🗂️ Nhóm Danh Mục</h2>
          </div>
          <div class="cat-nav-list">
            @for (cat of catDefs; track cat.code) {
              <button 
                class="cat-nav-item" 
                [class.active]="selectedCatCode() === cat.code" 
                (click)="onSelectCat(cat.code)">
                <span class="cat-nav-icon">{{ cat.icon }}</span>
                <span class="cat-nav-name">{{ cat.name }}</span>
                <span class="cat-count-pill">{{ countItemsInCat(cat.code) }}</span>
              </button>
            }
          </div>
        </div>

        <!-- CỘT 2: BẢNG DỮ LIỆU CHI TIẾT (MASTER DATA GRID) -->
        <div class="card data-grid-card">
          <div class="card-header">
            <div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span class="badge badge-info">{{ activeCatDef().code }}</span>
                <h2 class="card-title">{{ activeCatDef().name }}</h2>
              </div>
              <p class="cat-desc-sub">{{ activeCatDef().description }}</p>
            </div>

            <div class="grid-tools">
              <input 
                type="text" 
                class="form-control form-control-sm" 
                placeholder="Tìm mã, tên mục..." 
                [ngModel]="searchKeyword()"
                (ngModelChange)="onSearchChange($event)"
              />
            </div>
          </div>

          <!-- BẢNG DỮ LIỆU DANH MỤC CHUẨN -->
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Mã Định Danh</th>
                  <th>Tên Chuẩn Nông Nghiệp</th>
                  <th>Phân Loại Phụ</th>
                  <th>Đơn Vị Tính</th>
                  <th>Tiêu Chuẩn Áp Dụng</th>
                  <th>Trạng Thái</th>
                  <th>Ngày Hiệu Lực</th>
                  <th style="text-align: right;" class="nowrap">Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                @if (filteredItems().length === 0) {
                  <tr>
                    <td colspan="8" style="text-align: center; padding: 32px; color: var(--text-muted);">
                      Không tìm thấy mục nào trong danh mục này. Bác hãy bấm nút "Thêm Mục Chuẩn Mới" phía trên để tạo nhé!
                    </td>
                  </tr>
                }
                @for (it of paginatedItems(); track it.id) {
                  <tr [class.inactive-row]="it.status === 'inactive'">
                    <td>
                      <span class="item-code-tag">{{ it.code }}</span>
                    </td>
                    <td>
                      <strong style="font-size: 15px;">{{ it.name }}</strong>
                      @if (it.description) {
                        <div class="sub-desc">{{ it.description }}</div>
                      }
                    </td>
                    <td>
                      <span class="badge badge-primary">{{ it.subType }}</span>
                    </td>
                    <td>{{ it.unit || '—' }}</td>
                    <td><small>{{ it.standard || '—' }}</small></td>
                    <td>
                      <button 
                        class="status-toggle-btn" 
                        [class.status-active]="it.status === 'active'"
                        (click)="state.toggleMasterItemStatus(it.id)"
                        title="Bấm để bật/tắt trạng thái">
                        {{ it.status === 'active' ? '● Đang áp dụng' : '○ Tạm dừng' }}
                      </button>
                    </td>
                    <td><small>{{ it.effectiveDate || '01/01/2026' }}</small></td>
                    <td style="text-align: right;" class="nowrap">
                      <div class="table-actions-inline" style="justify-content: flex-end;">
                        <button class="btn btn-secondary btn-sm" (click)="openEditModal(it)">Sửa</button>
                        <button class="btn btn-danger btn-sm" (click)="confirmDelete(it)">Xóa</button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <!-- PHÂN TRANG -->
          <app-pagination
            [totalItems]="filteredItems().length"
            [pageSize]="pageSize()"
            [currentPage]="currentPage()"
            [itemName]="'mục'"
            (pageChange)="onPageChange($event)"
            (pageSizeChange)="onPageSizeChange($event)">
          </app-pagination>
        </div>
      </div>

      <!-- MODAL THÊM / SỬA MỤC MASTER DATA -->
      @if (showModal()) {
        <div class="modal-backdrop">
          <div class="modal-dialog modal-lg">
            <div class="modal-header-simple">
              <h2 class="card-title">
                {{ isEdit() ? '✏️ Chỉnh Sửa Mục Danh Mục Chuẩn' : '➕ Khởi Tạo Mục Danh Mục Chuẩn Mới' }}
              </h2>
              <button type="button" class="btn-close-modal" (click)="showModal.set(false)" title="Đóng">✕</button>
            </div>
            <form (submit)="saveItem($event)">
              <div class="form-row-2">
                <div class="form-group">
                  <label class="form-label">Thuộc nhóm danh mục gốc:</label>
                  <select class="form-control" [(ngModel)]="activeItem.categoryCode" name="catCode" required>
                    @for (cat of catDefs; track cat.code) {
                      <option [value]="cat.code">{{ cat.icon }} {{ cat.name }} ({{ cat.code }})</option>
                    }
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Mã định danh chuẩn (Item Code): <span class="required">*</span></label>
                  <input type="text" class="form-control" placeholder="Ví dụ: G-ST25 hoặc PB-QL01" [(ngModel)]="activeItem.code" name="code" required />
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Tên gọi chuẩn nông nghiệp: <span class="required">*</span></label>
                <input type="text" class="form-control" placeholder="Ví dụ: Giống lúa ST25 Thượng Hạng hoặc Phân vi sinh Quế Lâm..." [(ngModel)]="activeItem.name" name="name" required />
              </div>

              <div class="form-row-2">
                <div class="form-group">
                  <label class="form-label">Phân loại phụ (Sub-type):</label>
                  <input type="text" class="form-control" placeholder="Lúa thơm / Gia cầm / Hữu cơ..." [(ngModel)]="activeItem.subType" name="subType" required />
                </div>
                <div class="form-group">
                  <label class="form-label">Đơn vị tính chuẩn:</label>
                  <input type="text" class="form-control" placeholder="kg, Bao 50kg, Con, Lọ..." [(ngModel)]="activeItem.unit" name="unit" />
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Tiêu chuẩn kỹ thuật áp dụng:</label>
                <input type="text" class="form-control" placeholder="TCVN 11892-1:2017 / VietGAP / OCOP..." [(ngModel)]="activeItem.standard" name="standard" />
              </div>

              <div class="form-group">
                <label class="form-label">Mô tả đặc tính kỹ thuật / Quy chuẩn hướng dẫn:</label>
                <textarea class="form-control" rows="3" placeholder="Đặc tính sinh trưởng, khuyến nghị sử dụng..." [(ngModel)]="activeItem.description" name="desc"></textarea>
              </div>

              <div class="modal-actions">
                <button type="button" class="btn btn-secondary" (click)="showModal.set(false)">Hủy Bỏ</button>
                <button type="submit" class="btn btn-primary">
                  {{ isEdit() ? 'LƯU THAY ĐỔI' : 'LƯU VÀO MASTER DATA' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- MODAL XÁC NHẬN XÓA MỤC -->
      @if (showDeleteModal()) {
        <div class="modal-backdrop">
          <div class="modal-dialog modal-confirm">
            <div class="confirm-icon">⚠️</div>
            <h2 class="confirm-title">Xác Nhận Xóa Mục Danh Mục</h2>
            <p class="confirm-desc">
              Bác có chắc chắn muốn xóa mục <strong>"{{ itemToDelete?.name }}"</strong> ({{ itemToDelete?.code }}) khỏi Master Data không?
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
    .master-data-page {
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

    .master-layout-grid {
      display: grid;
      grid-template-columns: 210px 1fr;
      gap: 10px;
      align-items: flex-start;
    }

    .category-sidebar-card {
      padding: 8px 10px;
    }

    .cat-nav-list {
      display: flex;
      flex-direction: column;
      gap: 3px;
      margin-top: 4px;
    }

    .cat-nav-item {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 8px;
      min-height: 32px;
      border-radius: var(--radius-sm);
      border: 1.5px solid var(--border-color);
      background: #ffffff;
      text-align: left;
      cursor: pointer;
      transition: all 0.15s;
    }

    .cat-nav-item:hover {
      border-color: var(--primary-600);
      background: #f8fafc;
    }

    .cat-nav-item.active {
      background: var(--primary-700);
      color: #ffffff;
      border-color: var(--primary-700);
    }

    .cat-nav-icon {
      font-size: 16px;
      line-height: 1;
    }

    .cat-nav-name {
      font-size: 12px;
      font-weight: 700;
      flex: 1;
      line-height: 1.2;
    }

    .cat-count-pill {
      font-size: 10.5px;
      font-weight: 800;
      background: var(--bg-app);
      color: var(--text-main);
      padding: 1px 5px;
      border-radius: 9999px;
    }

    .cat-nav-item.active .cat-count-pill {
      background: rgba(255, 255, 255, 0.25);
      color: #ffffff;
    }

    .cat-desc-sub {
      font-size: 12px;
      color: var(--text-muted);
      margin: 2px 0 0;
    }

    .grid-tools {
      min-width: 180px;
    }

    .item-code-tag {
      font-size: 12px;
      font-weight: 800;
      background: var(--primary-100);
      color: var(--primary-900);
      padding: 2px 6px;
      border-radius: 4px;
      white-space: nowrap;
    }

    .sub-desc {
      font-size: 12px;
      color: var(--text-muted);
      margin-top: 2px;
    }

    .status-toggle-btn {
      border: 1px solid var(--border-color);
      padding: 4px 10px;
      border-radius: var(--radius-full);
      font-size: 12px;
      font-weight: 700;
      background: #ffffff;
      color: var(--text-muted);
      cursor: pointer;
      transition: all 0.2s;
    }

    .status-toggle-btn.status-active {
      background: var(--primary-100);
      color: var(--primary-900);
      border-color: var(--primary-600);
    }

    .inactive-row {
      opacity: 0.6;
      background-color: #fafafa;
    }

    .form-row-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    .form-row-3 {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 12px;
    }

    .modal-lg {
      max-width: 680px;
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

    @media (max-width: 960px) {
      .master-layout-grid {
        grid-template-columns: 1fr;
      }
      .form-row-2, .form-row-3 {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class MasterDataComponent {
  state = inject(HtxStateService);
  toast = inject(ToastService);

  catDefs: MasterCatDefinition[] = [
    { code: 'MD-SAN-PHAM', name: 'Sản Phẩm & Nông Sản OCOP', icon: '📦', description: 'Danh mục sản phẩm nông nghiệp, đặc sản OCOP số hóa dùng cho chuỗi bao tiêu & bán hàng' },
    { code: 'MD-GIONG', name: 'Giống Cây Trồng & Vật Nuôi', icon: '🌾', description: 'Danh mục giống thuần chủng, giống F1 đạt chuẩn phục vụ HTX' },
    { code: 'MD-MUA-VU', name: 'Mùa Vụ Canh Tác Chuẩn', icon: '📅', description: 'Khung lịch thời vụ canh tác lúa, nhãn, gà và thủy sản' },
    { code: 'MD-PHAN-BVTV', name: 'Phân Bón & Thuốc BVTV Sinh Học', icon: '🧪', description: 'Vật tư hữu cơ, vi sinh được phép sử dụng trong chuỗi OCOP/VietGAP' },
    { code: 'MD-VACXIN-THUCAN', name: 'Vắc-xin & Thức Ăn Chăn Nuôi', icon: '🐓', description: 'Thuốc thú y, phòng dịch sinh học và thức ăn dinh dưỡng' },
    { code: 'MD-STANDARDS', name: 'Tiêu Chuẩn & Chứng Nhận Chất Lượng', icon: '⭐', description: 'Quy chuẩn OCOP, VietGAP, Chỉ dẫn địa lý' },
    { code: 'MD-DVT', name: 'Đơn Vị Đo Lường Nông Nghiệp', icon: '📐', description: 'Quy chuẩn đơn vị tính diện tích, khối lượng, đóng gói' }
  ];

  selectedCatCode = signal<'MD-SAN-PHAM' | 'MD-GIONG' | 'MD-MUA-VU' | 'MD-PHAN-BVTV' | 'MD-VACXIN-THUCAN' | 'MD-STANDARDS' | 'MD-DVT'>('MD-SAN-PHAM');
  searchKeyword = signal('');
  currentPage = signal(1);
  pageSize = signal(10);

  showModal = signal(false);
  isEdit = signal(false);

  showDeleteModal = signal(false);
  itemToDelete: MasterDataItem | null = null;

  activeItem: MasterDataItem = {
    id: '',
    categoryCode: 'MD-GIONG',
    code: '',
    name: '',
    subType: 'Lúa chất lượng cao',
    unit: 'kg',
    standard: 'VietGAP',
    status: 'active',
    effectiveDate: '01/01/2026',
    description: ''
  };

  activeCatDef = computed(() => {
    return this.catDefs.find(c => c.code === this.selectedCatCode()) || this.catDefs[0];
  });

  countItemsInCat(code: string) {
    return this.state.masterDataItems().filter(i => i.categoryCode === code).length;
  }

  filteredItems = computed(() => {
    const catCode = this.selectedCatCode();
    const kw = this.searchKeyword().toLowerCase().trim();

    return this.state.masterDataItems().filter(i => {
      const matchCat = i.categoryCode === catCode;
      const matchKw = !kw || i.name.toLowerCase().includes(kw) || i.code.toLowerCase().includes(kw) || (i.subType && i.subType.toLowerCase().includes(kw));
      return matchCat && matchKw;
    });
  });

  paginatedItems = computed(() => {
    const list = this.filteredItems();
    const start = (this.currentPage() - 1) * this.pageSize();
    return list.slice(start, start + this.pageSize());
  });

  onSelectCat(code: 'MD-SAN-PHAM' | 'MD-GIONG' | 'MD-MUA-VU' | 'MD-PHAN-BVTV' | 'MD-VACXIN-THUCAN' | 'MD-STANDARDS' | 'MD-DVT') {
    this.selectedCatCode.set(code);
    this.currentPage.set(1);
  }

  onSearchChange(val: string) {
    this.searchKeyword.set(val);
    this.currentPage.set(1);
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
  }

  onPageSizeChange(size: number) {
    this.pageSize.set(size);
    this.currentPage.set(1);
  }

  openAddItemModal() {
    this.isEdit.set(false);
    this.activeItem = {
      id: '',
      categoryCode: this.selectedCatCode(),
      code: 'MD-' + Date.now().toString(36).toUpperCase().slice(-4),
      name: '',
      subType: 'Chuẩn quy định',
      unit: 'kg',
      standard: 'TCVN',
      status: 'active',
      effectiveDate: new Date().toLocaleDateString('vi-VN'),
      description: ''
    };
    this.showModal.set(true);
  }

  openEditModal(item: MasterDataItem) {
    this.isEdit.set(true);
    this.activeItem = { ...item };
    this.showModal.set(true);
  }

  saveItem(e: Event) {
    e.preventDefault();
    if (!this.activeItem.code.trim() || !this.activeItem.name.trim()) return;

    if (this.isEdit()) {
      this.state.updateMasterItem(this.activeItem);
    } else {
      this.state.addMasterItem(this.activeItem);
    }
    this.showModal.set(false);
  }

  confirmDelete(item: MasterDataItem) {
    this.itemToDelete = item;
    this.showDeleteModal.set(true);
  }

  executeDelete() {
    if (this.itemToDelete) {
      this.state.deleteMasterItem(this.itemToDelete.id);
      this.showDeleteModal.set(false);
    }
  }
}
