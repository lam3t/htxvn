import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HtxStateService } from '../../../core/services/htx-state.service';
import { InventoryItem } from '../../../core/models/htx.model';
import { ToastService } from '../../../core/services/toast.service';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

interface WarehouseTransaction {
  id: string;
  code: string;
  type: 'in' | 'out';
  date: string;
  itemName: string;
  quantity: number;
  unit: string;
  partnerOrMember: string;
  actor: string;
  notes: string;
}

@Component({
  selector: 'app-warehouse-list',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent],
  template: `
    <div class="warehouse-page">
      <!-- HEADER TRANG -->
      <div class="page-top">
        <div>
          <div class="page-sub">QUẢN LÝ KHO & VẬT TƯ • {{ state.currentHtx().shortName }}</div>
          <h1 class="page-title">Quản Lý Vật Tư Nông Nghiệp & Xuất Nhập Tồn</h1>
        </div>
        <div class="top-actions">
          <button class="btn btn-secondary" (click)="openStockOutModal()">
            <span>📤</span> Xuất Vật Tư Cho Xã Viên
          </button>
          <button class="btn btn-secondary" (click)="openStockInModal()">
            <span>📥</span> Nhập Kho Vật Tư
          </button>
          <button class="btn btn-primary" (click)="openAddItemModal()">
            <span>➕</span> Thêm Vật Tư Mới
          </button>
        </div>
      </div>

      <!-- TABS CHUYỂN ĐỔI: TỒN KHO VÀ NHẬT KÝ NHẬP/XUẤT -->
      <div class="warehouse-tabs">
        <button 
          class="tab-item" 
          [class.active]="activeTab() === 'inventory'" 
          (click)="switchTab('inventory')">
          <span>📦 Danh Mục Vật Tư Tồn Kho ({{ state.currentInventory().length }})</span>
        </button>
        <button 
          class="tab-item" 
          [class.active]="activeTab() === 'transactions'" 
          (click)="switchTab('transactions')">
          <span>📋 Lịch Sử Phiếu Nhập / Xuất ({{ transactions().length }})</span>
        </button>
      </div>

      <!-- TAB 1: DANH MỤC VẬT TƯ VÀ CẢNH BÁO TỒN KHO -->
      @if (activeTab() === 'inventory') {
        <div class="card filter-bar">
          <div class="filter-flex">
            <div class="search-box">
              <span class="search-icon">🔍</span>
              <input 
                type="text" 
                class="search-input" 
                placeholder="Tìm theo tên vật tư, mã VT, nhà cung cấp..." 
                [ngModel]="searchKeyword()"
                (ngModelChange)="onSearchChange($event)"
              />
            </div>
            <div class="category-filter-box">
              <select 
                class="form-control" 
                [ngModel]="categoryFilter()"
                (ngModelChange)="onCategoryFilterChange($event)">
                <option value="">Tất cả loại vật tư</option>
                <option value="Phân bón vi sinh">Phân bón vi sinh</option>
                <option value="Hạt giống & Cây/Con giống">Hạt giống / Con giống</option>
                <option value="Thức ăn chăn nuôi">Thức ăn chăn nuôi</option>
                <option value="Chế phẩm sinh học BVTV">Chế phẩm sinh học BVTV</option>
                <option value="Bao bì & Tem nhãn">Bao bì & Tem QR</option>
              </select>
            </div>
          </div>
        </div>

        <div class="card p-0">
          <div class="table-responsive hide-mobile">
            <table class="data-table clean-table">
              <thead>
                <tr>
                  <th style="width: 32%;">Vật Tư Nông Nghiệp & Nhóm</th>
                  <th style="width: 20%;">Số Lượng Tồn Kho</th>
                  <th style="width: 22%;">Đơn Giá & Nhà Cung Cấp</th>
                  <th style="width: 14%;">Vị Trí & Hạn Dùng</th>
                  <th style="text-align: right; width: 12%;">Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                @for (item of paginatedInventory(); track item.id) {
                  <tr>
                    <td>
                      <div><strong style="font-size: 15.5px;">{{ item.name }}</strong></div>
                      <div class="sub-text">
                        <span class="code-pill">{{ item.code }}</span> • 
                        <span class="badge badge-info">{{ item.category }}</span>
                      </div>
                    </td>
                    <td>
                      <div style="display: flex; align-items: baseline; gap: 6px;">
                        <strong [style.color]="item.stockQty <= item.minStockAlert ? 'var(--danger-700)' : 'var(--primary-800)'" style="font-size: 18px;">
                          {{ item.stockQty }}
                        </strong>
                        <span>{{ item.unit }}</span>
                        @if (item.stockQty <= item.minStockAlert) {
                          <span class="badge badge-danger">⚠️ Sắp hết</span>
                        } @else {
                          <span class="badge badge-success">Đủ hàng</span>
                        }
                      </div>
                    </td>
                    <td>
                      <div><strong>{{ item.unitPrice.toLocaleString('vi-VN') }} đ</strong> / {{ item.unit }}</div>
                      <small style="color: var(--text-muted);">{{ item.supplier }}</small>
                    </td>
                    <td>
                      <div>{{ item.location }}</div>
                      <small style="color: var(--text-muted);">HSD: {{ item.expiryDate || '12/2027' }}</small>
                    </td>
                    <td style="text-align: right;">
                      <div class="table-actions-inline" style="justify-content: flex-end;">
                        <button class="btn btn-secondary btn-sm" (click)="openEditItemModal(item)">✏️ Sửa</button>
                        <button class="btn btn-danger btn-sm" (click)="confirmDeleteItem(item)">🗑️ Xóa</button>
                      </div>
                    </td>
                  </tr>
                }
                @if (paginatedInventory().length === 0) {
                  <tr>
                    <td colspan="5" style="text-align: center; padding: 32px; color: var(--text-muted);">
                      Không tìm thấy vật tư nào phù hợp với từ khóa "{{ searchKeyword() }}".
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <!-- DANH SÁCH THẺ DỌC TRÊN MOBILE -->
          <div class="mobile-card-list show-mobile p-16">
            @for (item of paginatedInventory(); track item.id) {
              <div class="mobile-data-card">
                <div class="card-row">
                  <strong>{{ item.name }}</strong>
                  @if (item.stockQty <= item.minStockAlert) {
                    <span class="badge badge-danger">Sắp hết</span>
                  } @else {
                    <span class="badge badge-success">Đủ hàng</span>
                  }
                </div>
                <div class="card-row">
                  <span class="label">Mã VT / Nhóm:</span>
                  <span class="value">{{ item.code }} • {{ item.category }}</span>
                </div>
                <div class="card-row">
                  <span class="label">Số lượng tồn kho:</span>
                  <span class="value" style="font-size: 18px; color: var(--primary-800);">{{ item.stockQty }} {{ item.unit }}</span>
                </div>
                <div class="card-row">
                  <span class="label">Nhà cung cấp:</span>
                  <span class="value">{{ item.supplier }}</span>
                </div>
                <div class="mobile-card-actions">
                  <button class="btn btn-secondary" (click)="openEditItemModal(item)">Sửa</button>
                  <button class="btn btn-danger" (click)="confirmDeleteItem(item)">Xóa</button>
                </div>
              </div>
            }
          </div>

          <!-- PHÂN TRANG TAB 1 -->
          <app-pagination 
            [totalItems]="filteredInventory().length"
            [pageSize]="pageSize()"
            [currentPage]="currentPage()"
            (pageChange)="currentPage.set($event)"
            (pageSizeChange)="pageSize.set($event)">
          </app-pagination>
        </div>
      }

      <!-- TAB 2: LỊCH SỬ PHIẾU NHẬP / XUẤT KHO -->
      @if (activeTab() === 'transactions') {
        <div class="card p-0">
          <div class="table-responsive hide-mobile">
            <table class="data-table clean-table">
              <thead>
                <tr>
                  <th style="width: 25%;">Phiếu & Thời Gian</th>
                  <th style="width: 25%;">Vật Tư & Số Lượng</th>
                  <th style="width: 25%;">Đối Tác / Xã Viên Nhận</th>
                  <th style="width: 25%;">Người Lập & Ghi Chú</th>
                </tr>
              </thead>
              <tbody>
                @for (tr of paginatedTransactions(); track tr.id) {
                  <tr>
                    <td>
                      <div><strong>{{ tr.code }}</strong></div>
                      <div class="sub-text">
                        <span class="badge" [class.badge-success]="tr.type === 'in'" [class.badge-warning]="tr.type === 'out'">
                          {{ tr.type === 'in' ? '📥 Nhập kho' : '📤 Xuất cấp' }}
                        </span> • 🕒 {{ tr.date }}
                      </div>
                    </td>
                    <td>
                      <div><strong>{{ tr.itemName }}</strong></div>
                      <div class="sub-text">
                        <strong [style.color]="tr.type === 'in' ? 'var(--primary-800)' : 'var(--amber-800)'">
                          {{ tr.type === 'in' ? '+' : '-' }}{{ tr.quantity }} {{ tr.unit }}
                        </strong>
                      </div>
                    </td>
                    <td>
                      <div><strong>{{ tr.partnerOrMember }}</strong></div>
                    </td>
                    <td>
                      <div><strong>{{ tr.actor }}</strong></div>
                      <small style="color: var(--text-muted);">{{ tr.notes }}</small>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <!-- PHÂN TRANG TAB 2 -->
          <app-pagination 
            [totalItems]="transactions().length"
            [pageSize]="transPageSize()"
            [currentPage]="transCurrentPage()"
            (pageChange)="transCurrentPage.set($event)"
            (pageSizeChange)="transPageSize.set($event)">
          </app-pagination>
        </div>
      }

      <!-- MODAL THÊM / SỬA VẬT TƯ -->
      @if (showItemModal()) {
        <div class="modal-backdrop">
          <div class="modal-dialog modal-lg">
            <div class="modal-header-simple">
              <h2 class="card-title" style="margin: 0;">
                {{ isEditingItem() ? '✏️ Chỉnh Sửa Vật Tư Nông Nghiệp' : '➕ Khai Báo Vật Tư Mới' }}
              </h2>
              <button type="button" class="btn-close-modal" (click)="showItemModal.set(false)" title="Đóng">✕</button>
            </div>

            <form (submit)="saveItem($event)">
              <div class="form-row-2">
                <div class="form-group">
                  <label class="form-label">Tên vật tư nông nghiệp: <span class="required">*</span></label>
                  <input type="text" class="form-control" placeholder="Ví dụ: Phân bón vi sinh Quế Lâm" [(ngModel)]="currentItemData.name" name="name" required />
                </div>
                <div class="form-group">
                  <label class="form-label">Mã vật tư: <span class="required">*</span></label>
                  <input type="text" class="form-control" [(ngModel)]="currentItemData.code" name="code" required />
                </div>
              </div>

              <div class="form-row-2">
                <div class="form-group">
                  <label class="form-label">Nhóm danh mục: <span class="required">*</span></label>
                  <select class="form-control" [(ngModel)]="currentItemData.category" name="category" required>
                    <option value="Phân bón vi sinh">Phân bón vi sinh</option>
                    <option value="Hạt giống & Cây/Con giống">Hạt giống & Cây/Con giống</option>
                    <option value="Thức ăn chăn nuôi">Thức ăn chăn nuôi</option>
                    <option value="Chế phẩm sinh học BVTV">Chế phẩm sinh học BVTV</option>
                    <option value="Bao bì & Tem nhãn">Bao bì & Tem nhãn</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Đơn vị tính: <span class="required">*</span></label>
                  <input type="text" class="form-control" placeholder="Bao (50kg) / Lít / Gói" [(ngModel)]="currentItemData.unit" name="unit" required />
                </div>
              </div>

              <div class="form-row-2">
                <div class="form-group">
                  <label class="form-label">Số lượng tồn kho ban đầu: <span class="required">*</span></label>
                  <input type="number" class="form-control" [(ngModel)]="currentItemData.stockQty" name="stock" required />
                </div>
                <div class="form-group">
                  <label class="form-label">Ngưỡng cảnh báo sắp hết:</label>
                  <input type="number" class="form-control" [(ngModel)]="currentItemData.minStockAlert" name="minStock" />
                </div>
              </div>

              <div class="form-row-2">
                <div class="form-group">
                  <label class="form-label">Đơn giá nhập ước tính (VNĐ):</label>
                  <input type="number" class="form-control" placeholder="420000" [(ngModel)]="currentItemData.unitPrice" name="price" />
                </div>
                <div class="form-group">
                  <label class="form-label">Vị trí lưu kho:</label>
                  <input type="text" class="form-control" placeholder="Kho A - Dãy 2" [(ngModel)]="currentItemData.location" name="loc" />
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Nhà cung cấp uy tín:</label>
                <input type="text" class="form-control" placeholder="Công ty CP Tập đoàn Quế Lâm" [(ngModel)]="currentItemData.supplier" name="sup" />
              </div>

              <div class="modal-actions">
                <button type="button" class="btn btn-secondary" (click)="showItemModal.set(false)">Hủy Bỏ</button>
                <button type="submit" class="btn btn-primary">LƯU VẬT TƯ</button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- MODAL NHẬP / XUẤT KHO -->
      @if (showTransModal()) {
        <div class="modal-backdrop">
          <div class="modal-dialog">
            <div class="modal-header-simple">
              <h2 class="card-title" style="margin: 0;">
                {{ transType() === 'in' ? '📥 Tạo Phiếu Nhập Kho Vật Tư' : '📤 Tạo Phiếu Xuất Cấp Vật Tư Cho Xã Viên' }}
              </h2>
              <button type="button" class="btn-close-modal" (click)="showTransModal.set(false)" title="Đóng">✕</button>
            </div>

            <form (submit)="saveTransaction($event)">
              <div class="form-group">
                <label class="form-label">Chọn vật tư trong kho: <span class="required">*</span></label>
                <select class="form-control" [(ngModel)]="transItemName" name="tItem" (change)="onTransItemChange()" required>
                  @for (it of state.currentInventory(); track it.id) {
                    <option [value]="it.name">{{ it.name }} (Hiện còn: {{ it.stockQty }} {{ it.unit }})</option>
                  }
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">
                  {{ transType() === 'in' ? 'Nhà cung ứng / Đối tác giao hàng:' : 'Xã viên / Đội sản xuất nhận vật tư:' }} <span class="required">*</span>
                </label>
                <input type="text" class="form-control" [(ngModel)]="transPartner" name="tPartner" required />
              </div>

              <div class="form-group">
                <label class="form-label">Số lượng {{ transType() === 'in' ? 'nhập thêm' : 'xuất cấp' }}: <span class="required">*</span></label>
                <div class="stepper" style="width: 100%;">
                  <button type="button" class="stepper-btn" (click)="adjustTransQty(-5)">-</button>
                  <input type="number" class="stepper-input" style="flex: 1;" [(ngModel)]="transQty" name="tQty" min="1" />
                  <button type="button" class="stepper-btn" (click)="adjustTransQty(5)">+</button>
                </div>
                @if (transType() === 'out' && selectedInventoryItem && transQty > selectedInventoryItem.stockQty) {
                  <div class="form-hint" style="color: var(--danger-700); font-weight: 700;">
                    ⚠️ Cảnh báo: Số lượng xuất ({{ transQty }}) vượt quá tồn kho khả dụng ({{ selectedInventoryItem.stockQty }})!
                  </div>
                }
              </div>

              <div class="form-group">
                <label class="form-label">Ghi chú phiếu kho:</label>
                <input type="text" class="form-control" placeholder="Mục đích sử dụng, số hóa đơn giao nhận..." [(ngModel)]="transNotes" name="tNotes" />
              </div>

              <div class="modal-actions">
                <button type="button" class="btn btn-secondary" (click)="showTransModal.set(false)">Hủy Bỏ</button>
                <button 
                  type="submit" 
                  class="btn btn-primary"
                  [disabled]="transType() === 'out' && selectedInventoryItem && transQty > selectedInventoryItem.stockQty">
                  {{ transType() === 'in' ? 'XÁC NHẬN NHẬP KHO' : 'XÁC NHẬN XUẤT CẤP' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- MODAL XÁC NHẬN XÓA VẬT TƯ -->
      @if (itemToDelete()) {
        <div class="modal-backdrop">
          <div class="modal-dialog modal-confirm">
            <div class="confirm-icon">⚠️</div>
            <h2 class="card-title" style="color: var(--danger-800);">Xác Nhận Xóa Vật Tư</h2>
            <p class="confirm-desc">
              Bác có chắc chắn muốn xóa vật tư <strong>{{ itemToDelete()?.name }}</strong> khỏi kho không?
            </p>
            <div class="modal-actions">
              <button class="btn btn-secondary" (click)="itemToDelete.set(null)">Hủy Bỏ</button>
              <button class="btn btn-danger" (click)="executeDeleteItem()">ĐỒNG Ý XÓA</button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .warehouse-page {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .p-0 { padding: 0 !important; }
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

    .top-actions {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
    }

    .warehouse-tabs {
      display: flex;
      gap: 8px;
      border-bottom: 1.5px solid var(--border-color);
      padding-bottom: 1px;
    }

    .tab-item {
      padding: 6px 14px;
      background: none;
      border: none;
      border-bottom: 2.5px solid transparent;
      font-size: 13.5px;
      font-weight: 700;
      color: var(--text-muted);
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .tab-item.active {
      color: var(--primary-700);
      border-bottom-color: var(--primary-700);
    }

    .filter-bar {
      margin-bottom: 0;
      padding: 8px 12px;
    }

    .filter-flex {
      display: flex;
      gap: 10px;
      align-items: center;
      flex-wrap: wrap;
    }

    .search-box {
      flex: 1;
      min-width: 200px;
      display: flex;
      align-items: center;
      gap: 8px;
      background: var(--bg-card-subtle);
      border: 1.5px solid var(--border-color);
      border-radius: var(--radius-sm);
      padding: 0 10px;
    }

    .search-icon {
      font-size: 15px;
      color: var(--text-muted);
    }

    .search-input {
      width: 100%;
      height: 36px;
      border: none;
      background: transparent;
      font-size: 13.5px;
      font-weight: 600;
      color: var(--text-main);
      outline: none;
    }

    .category-filter-box select {
      min-width: 180px;
      height: 36px;
      font-size: 13px;
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

    .form-row-3 {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 10px;
    }

    .modal-confirm {
      text-align: center;
      max-width: 420px;
    }

    .confirm-icon {
      font-size: 48px;
      margin-bottom: 8px;
    }

    .confirm-desc {
      font-size: 14.5px;
      color: var(--text-muted);
      margin: 10px 0 20px;
      line-height: 1.5;
    }

    @media (max-width: 768px) {
      .form-row-2, .form-row-3 {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class WarehouseListComponent {
  state = inject(HtxStateService);
  toast = inject(ToastService);

  activeTab = signal<'inventory' | 'transactions'>('inventory');
  searchKeyword = signal('');
  categoryFilter = signal('');

  currentPage = signal(1);
  pageSize = signal(10);

  transCurrentPage = signal(1);
  transPageSize = signal(10);

  showTransModal = signal(false);
  transType = signal<'in' | 'out'>('in');

  showItemModal = signal(false);
  isEditingItem = signal(false);
  itemToDelete = signal<InventoryItem | null>(null);

  currentItemData: Partial<InventoryItem> = {
    code: 'VT-PB-09',
    name: '',
    category: 'Phân bón vi sinh' as const,
    unit: 'Bao (50kg)',
    stockQty: 100,
    minStockAlert: 20,
    unitPrice: 420000,
    supplier: 'Công ty Quế Lâm',
    location: 'Kho A'
  };

  transItemName = '';
  transQty = 10;
  transPartner = '';
  transNotes = '';

  transactions = signal<WarehouseTransaction[]>([
    {
      id: 'tr-01',
      code: 'PNK-2026-001',
      type: 'in',
      date: '20/09/2026 09:15',
      itemName: 'Phân bón vi sinh Quế Lâm NPK 12-5-10',
      quantity: 50,
      unit: 'Bao (50kg)',
      partnerOrMember: 'Công ty CP Tập đoàn Quế Lâm',
      actor: 'Nguyễn Văn Nam (Thủ kho)',
      notes: 'Nhập lô phục vụ vụ gieo cấy lúa sạch'
    },
    {
      id: 'tr-02',
      code: 'PXK-2026-002',
      type: 'out',
      date: '22/09/2026 14:30',
      itemName: 'Phân bón vi sinh Quế Lâm NPK 12-5-10',
      quantity: 15,
      unit: 'Bao (50kg)',
      partnerOrMember: 'Bác Vũ Văn Thiện (Đội 1)',
      actor: 'Nguyễn Văn Nam (Thủ kho)',
      notes: 'Xuất cấp cho vùng trồng lúa sạch Đội 1'
    },
    {
      id: 'tr-03',
      code: 'PNK-2026-003',
      type: 'in',
      date: '18/09/2026 10:00',
      itemName: 'Thóc giống ST25 Nguyên Chủng',
      quantity: 80,
      unit: 'Bao (25kg)',
      partnerOrMember: 'Viện Cây Lương Thực & CTP Hưng Yên',
      actor: 'Nguyễn Văn Nam (Thủ kho)',
      notes: 'Nhập giống lúa đầu vụ đạt chứng nhận kiểm nghiệm'
    },
    {
      id: 'tr-04',
      code: 'PXK-2026-004',
      type: 'out',
      date: '21/09/2026 16:00',
      itemName: 'Tem QR Code Truy Xuất Nguồn Gốc',
      quantity: 2000,
      unit: 'Tem',
      partnerOrMember: 'Tổ đóng gói gạo bao bì',
      actor: 'Nguyễn Văn Nam (Thủ kho)',
      notes: 'Cấp tem dán túi gạo 5kg'
    }
  ]);

  get selectedInventoryItem(): InventoryItem | undefined {
    return this.state.currentInventory().find(i => i.name === this.transItemName);
  }

  switchTab(tab: 'inventory' | 'transactions') {
    this.activeTab.set(tab);
    this.currentPage.set(1);
    this.transCurrentPage.set(1);
  }

  onSearchChange(kw: string) {
    this.searchKeyword.set(kw);
    this.currentPage.set(1);
  }

  onCategoryFilterChange(cat: string) {
    this.categoryFilter.set(cat);
    this.currentPage.set(1);
  }

  filteredInventory = computed(() => {
    const kw = this.searchKeyword().toLowerCase().trim();
    const cat = this.categoryFilter();

    return this.state.currentInventory().filter(i => {
      const matchKw = !kw || i.name.toLowerCase().includes(kw) || i.code.toLowerCase().includes(kw) || i.supplier.toLowerCase().includes(kw);
      const matchCat = !cat || i.category === cat;
      return matchKw && matchCat;
    });
  });

  paginatedInventory = computed(() => {
    const list = this.filteredInventory();
    const start = (this.currentPage() - 1) * this.pageSize();
    return list.slice(start, start + this.pageSize());
  });

  paginatedTransactions = computed(() => {
    const list = this.transactions();
    const start = (this.transCurrentPage() - 1) * this.transPageSize();
    return list.slice(start, start + this.transPageSize());
  });

  openAddItemModal() {
    this.isEditingItem.set(false);
    this.currentItemData = {
      code: 'VT-' + Math.floor(100 + Math.random() * 900),
      name: '',
      category: 'Phân bón vi sinh' as const,
      unit: 'Bao (50kg)',
      stockQty: 50,
      minStockAlert: 15,
      unitPrice: 350000,
      supplier: 'Công ty Cung ứng Nông nghiệp Hưng Yên',
      location: 'Kho Trung tâm'
    };
    this.showItemModal.set(true);
  }

  openEditItemModal(item: InventoryItem) {
    this.isEditingItem.set(true);
    this.currentItemData = { ...item };
    this.showItemModal.set(true);
  }

  saveItem(e: Event) {
    e.preventDefault();
    if (!this.currentItemData.name) return;

    if (this.isEditingItem() && this.currentItemData.id) {
      this.state.updateInventoryItem(this.currentItemData as InventoryItem);
    } else {
      this.state.addInventoryItem(this.currentItemData as Omit<InventoryItem, 'id' | 'htxId'>);
    }
    this.showItemModal.set(false);
  }

  confirmDeleteItem(item: InventoryItem) {
    this.itemToDelete.set(item);
  }

  executeDeleteItem() {
    if (this.itemToDelete()) {
      this.state.deleteInventoryItem(this.itemToDelete()!.id);
      this.itemToDelete.set(null);
    }
  }

  openStockInModal() {
    this.transType.set('in');
    const first = this.state.currentInventory()[0];
    if (first) this.transItemName = first.name;
    this.transPartner = 'Công ty Tập đoàn Quế Lâm';
    this.transQty = 20;
    this.transNotes = 'Nhập bổ sung kho';
    this.showTransModal.set(true);
  }

  openStockOutModal() {
    this.transType.set('out');
    const first = this.state.currentInventory()[0];
    if (first) this.transItemName = first.name;
    this.transPartner = 'Bác Vũ Văn Thiện (Đội 1)';
    this.transQty = 10;
    this.transNotes = 'Xuất phục vụ chăm sóc nông vụ';
    this.showTransModal.set(true);
  }

  onTransItemChange() {
    // Keep track of item
  }

  adjustTransQty(delta: number) {
    this.transQty = Math.max(1, this.transQty + delta);
  }

  saveTransaction(e: Event) {
    e.preventDefault();
    const item = this.selectedInventoryItem;
    if (!item) return;

    if (this.transType() === 'out' && this.transQty > item.stockQty) {
      this.toast.danger('Lỗi xuất kho', `Số lượng xuất (${this.transQty}) vượt quá tồn kho (${item.stockQty}).`);
      return;
    }

    const newTr: WarehouseTransaction = {
      id: 'tr-' + Date.now().toString(36),
      code: (this.transType() === 'in' ? 'PNK-' : 'PXK-') + Date.now().toString().slice(-4),
      type: this.transType(),
      date: '23/09/2026 11:30',
      itemName: this.transItemName,
      quantity: this.transQty,
      unit: item.unit,
      partnerOrMember: this.transPartner,
      actor: this.state.currentUser().name,
      notes: this.transNotes || 'Giao dịch qua phần mềm'
    };

    // Update stock quantity in state
    const newQty = this.transType() === 'in' ? item.stockQty + this.transQty : item.stockQty - this.transQty;
    this.state.updateInventoryItem({ ...item, stockQty: newQty });

    this.transactions.update(list => [newTr, ...list]);
    this.showTransModal.set(false);

    if (this.transType() === 'in') {
      this.toast.success('Nhập kho thành công', `Đã nhập thêm ${this.transQty} ${item.unit} cho "${this.transItemName}". Tồn kho mới: ${newQty}`);
    } else {
      this.toast.success('Xuất kho thành công', `Đã xuất ${this.transQty} ${item.unit} cho "${this.transPartner}". Tồn kho còn lại: ${newQty}`);
    }
  }
}
