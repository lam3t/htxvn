import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HtxStateService } from '../../../core/services/htx-state.service';
import { SalesOrder } from '../../../core/models/htx.model';
import { ToastService } from '../../../core/services/toast.service';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-sales-list',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent],
  template: `
    <div class="sales-page">
      <!-- HEADER TRANG -->
      <div class="page-top">
        <div>
          <div class="page-sub">THƯƠNG MẠI & PHÂN PHỐI • {{ state.currentHtx().shortName }}</div>
          <h1 class="page-title">Quản Lý Đơn Hàng & Hóa Đơn Điện Tử</h1>
        </div>
        <button class="btn btn-primary" (click)="openAddModal()">
          <span>➕</span> Tạo Đơn Hàng Bán Mới
        </button>
      </div>

      <!-- TỔNG HỢP DOANH THU -->
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-header">
            <span class="kpi-title">Tổng Doanh Số Đã Ký</span>
            <span class="kpi-icon icon-green">💰</span>
          </div>
          <div class="kpi-value">{{ totalRevenue().toLocaleString('vi-VN') }} <span class="unit">đ</span></div>
          <span class="status-pill green">● {{ state.currentOrders().length }} hợp đồng thương mại</span>
        </div>
      </div>

      <!-- THANH TÌM KIẾM ĐƠN HÀNG -->
      <div class="card filter-bar">
        <div class="filter-flex">
          <div class="search-box">
            <span class="search-icon">🔍</span>
            <input 
              type="text" 
              class="search-input" 
              placeholder="Tìm theo mã đơn hàng, tên khách hàng, số điện thoại..." 
              [ngModel]="searchKeyword()"
              (ngModelChange)="onSearchChange($event)"
            />
          </div>
          <div class="category-filter-box">
            <select 
              class="form-control" 
              [ngModel]="statusFilter()"
              (ngModelChange)="onStatusFilterChange($event)">
              <option value="">Tất cả trạng thái</option>
              <option value="Đã thanh toán">Đã thanh toán</option>
              <option value="Chờ giao hàng">Chờ giao hàng</option>
              <option value="Đang xử lý">Đang xử lý</option>
            </select>
          </div>
        </div>
      </div>

      <!-- DANH SÁCH ĐƠN HÀNG BÁN -->
      <div class="card p-0">
        <div class="card-header p-20">
          <h2 class="card-title">🛒 Danh Sách Hợp Đồng & Đơn Hàng Xuất Bán</h2>
        </div>

        <div class="table-responsive hide-mobile">
          <table class="data-table clean-table">
            <thead>
              <tr>
                <th style="width: 30%;">Đơn Hàng & Khách Hàng</th>
                <th style="width: 25%;">Sản Phẩm & Số Lượng</th>
                <th style="width: 25%;">Tổng Tiền & Trạng Thái</th>
                <th style="text-align: right; width: 20%;">Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              @for (ord of paginatedOrders(); track ord.id) {
                <tr>
                  <td>
                    <div><strong>{{ ord.orderCode }}</strong> • 🕒 {{ ord.orderDate }}</div>
                    <div class="sub-text">
                      👤 {{ ord.customerName }} (<a [href]="'tel:' + ord.customerPhone" class="phone-link">{{ ord.customerPhone }}</a>) • <span class="badge badge-info">{{ ord.customerType }}</span>
                    </div>
                  </td>
                  <td>
                    @for (it of ord.items; track it.productName) {
                      <div><strong>{{ it.productName }}</strong> ({{ it.quantity }} {{ it.unit }})</div>
                    }
                  </td>
                  <td>
                    <div><strong style="color: var(--primary-900); font-size: 16px;">{{ ord.totalAmount.toLocaleString('vi-VN') }} đ</strong></div>
                    <span class="badge badge-success">{{ ord.status }}</span>
                  </td>
                  <td style="text-align: right;">
                    <div class="table-actions-inline" style="justify-content: flex-end;">
                      <button class="btn btn-primary btn-sm" (click)="viewInvoice(ord)">🧾 Hóa Đơn</button>
                      <button class="btn btn-secondary btn-sm" (click)="openEditModal(ord)">✏️ Sửa</button>
                      <button class="btn btn-danger btn-sm" (click)="confirmDelete(ord)">🗑️ Xóa</button>
                    </div>
                  </td>
                </tr>
              }
              @if (paginatedOrders().length === 0) {
                <tr>
                  <td colspan="4" style="text-align: center; padding: 32px; color: var(--text-muted);">
                    Không tìm thấy đơn hàng nào phù hợp với từ khóa "{{ searchKeyword() }}".
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- DANH SÁCH THẺ DỌC CHO MOBILE -->
        <div class="mobile-card-list show-mobile p-16">
          @for (ord of paginatedOrders(); track ord.id) {
            <div class="mobile-data-card">
              <div class="card-row">
                <strong>{{ ord.orderCode }}</strong>
                <span class="badge badge-success">{{ ord.status }}</span>
              </div>
              <div class="card-row">
                <span class="label">Khách hàng:</span>
                <span class="value">{{ ord.customerName }}</span>
              </div>
              <div class="card-row">
                <span class="label">Tổng tiền:</span>
                <span class="value" style="color: var(--primary-800); font-size: 17px;">{{ ord.totalAmount.toLocaleString('vi-VN') }} đ</span>
              </div>
              <div class="mobile-card-actions">
                <button class="btn btn-primary" (click)="viewInvoice(ord)">Xem Hóa Đơn</button>
                <button class="btn btn-secondary" (click)="openEditModal(ord)">Sửa</button>
                <button class="btn btn-danger" (click)="confirmDelete(ord)">Xóa</button>
              </div>
            </div>
          }
        </div>

        <!-- PHÂN TRANG -->
        <app-pagination 
          [totalItems]="filteredOrders().length"
          [pageSize]="pageSize()"
          [currentPage]="currentPage()"
          (pageChange)="currentPage.set($event)"
          (pageSizeChange)="pageSize.set($event)">
        </app-pagination>
      </div>

      <!-- MODAL XEM TRƯỚC HÓA ĐƠN ĐIỆN TỬ (E-INVOICE PREVIEW) -->
      @if (selectedOrder()) {
        <div class="modal-backdrop">
          <div class="modal-dialog modal-lg invoice-modal">
            <div class="modal-header-simple">
              <h2 class="card-title">🧾 Hóa Đơn Bán Hàng Điện Tử HTX</h2>
              <button type="button" class="btn-close-modal" (click)="selectedOrder.set(null)" title="Đóng">✕</button>
            </div>

            <!-- MẪU HÓA ĐƠN ĐIỆN TỬ CHUẨN HTX -->
            <div class="invoice-box">
              <div class="inv-header">
                <div class="inv-htx-brand">
                  <span class="inv-logo">{{ state.currentHtx().logo }}</span>
                  <div>
                    <h3 class="inv-htx-title">{{ state.currentHtx().name }}</h3>
                    <p class="inv-htx-addr">Địa chỉ: {{ state.currentHtx().address }}</p>
                    <p class="inv-htx-addr">Mã số thuế: 0900889988 • ĐT: {{ state.currentHtx().phone }}</p>
                  </div>
                </div>

                <div class="inv-meta-right">
                  <div class="inv-badge">HÓA ĐƠN BÁN HÀNG ĐIỆN TỬ</div>
                  <div class="inv-code-text">Mẫu số: 1/001 • Ký hiệu: HY/26E</div>
                  <div class="inv-code-text">Số HĐ: <strong>{{ selectedOrder()?.invoiceCode }}</strong></div>
                  <div class="inv-code-text">Ngày lập: {{ selectedOrder()?.orderDate }}</div>
                </div>
              </div>

              <div class="inv-customer-box">
                <div><strong>Đơn vị mua hàng:</strong> {{ selectedOrder()?.customerName }}</div>
                <div><strong>Số điện thoại:</strong> {{ selectedOrder()?.customerPhone }}</div>
                <div><strong>Hình thức thanh toán:</strong> Chuyển khoản qua Ngân hàng Nông nghiệp (Agribank)</div>
              </div>

              <table class="data-table inv-table">
                <thead>
                  <tr>
                    <th>STT</th>
                    <th>Tên Nông Sản & Quy Cách</th>
                    <th>ĐVT</th>
                    <th>Số Lượng</th>
                    <th>Đơn Giá</th>
                    <th>Thành Tiền (VNĐ)</th>
                  </tr>
                </thead>
                <tbody>
                  @for (it of selectedOrder()?.items; track it.productName; let idx = $index) {
                    <tr>
                      <td>{{ idx + 1 }}</td>
                      <td><strong>{{ it.productName }}</strong></td>
                      <td>{{ it.unit }}</td>
                      <td>{{ it.quantity }}</td>
                      <td>{{ it.unitPrice.toLocaleString('vi-VN') }} đ</td>
                      <td><strong>{{ it.amount.toLocaleString('vi-VN') }} đ</strong></td>
                    </tr>
                  }
                </tbody>
              </table>

              <div class="inv-total-row">
                <span>TỔNG TIỀN THANH TOÁN:</span>
                <span class="total-big-text">{{ selectedOrder()?.totalAmount?.toLocaleString('vi-VN') }} VNĐ</span>
              </div>

              <div class="inv-signature-row">
                <div class="sig-box">
                  <strong>NGƯỜI MUA HÀNG</strong>
                  <p>(Ký, ghi rõ họ tên)</p>
                </div>
                <div class="sig-box">
                  <strong>NGƯỜI BÁN HÀNG</strong>
                  <div class="digital-sign-stamp">
                    <span>✓ KÝ SỐ BỞI:</span>
                    <strong>{{ state.currentHtx().name }}</strong>
                    <small>Thời gian ký: {{ selectedOrder()?.orderDate }} 14:00</small>
                  </div>
                </div>
              </div>
            </div>

            <div class="modal-actions">
              <button class="btn btn-secondary" (click)="selectedOrder.set(null)">Đóng</button>
              <button class="btn btn-primary" (click)="downloadInvoicePdf()">
                <span>📥</span> Tải File Hóa Đơn PDF
              </button>
            </div>
          </div>
        </div>
      }

      <!-- MODAL TẠO / SỬA ĐƠN HÀNG -->
      @if (showModal()) {
        <div class="modal-backdrop">
          <div class="modal-dialog modal-lg">
            <div class="modal-header-simple">
              <h2 class="card-title">
                {{ isEditing() ? '✏️ Chỉnh Sửa Đơn Hàng Bán' : '➕ Tạo Đơn Hàng Bán Nông Sản Mới' }}
              </h2>
              <button type="button" class="btn-close-modal" (click)="showModal.set(false)" title="Đóng">✕</button>
            </div>
            <form (submit)="saveOrder($event)">
              <div class="form-row-2">
                <div class="form-group">
                  <label class="form-label">Tên đối tác / Khách hàng mua: <span class="required">*</span></label>
                  <input type="text" class="form-control" placeholder="Ví dụ: Siêu thị WinMart Times City" [(ngModel)]="currentOrderData.customerName" name="cName" required />
                </div>
                <div class="form-group">
                  <label class="form-label">Số điện thoại liên hệ: <span class="required">*</span></label>
                  <input type="text" class="form-control" placeholder="0988 123 456" [(ngModel)]="currentOrderData.customerPhone" name="cPhone" required />
                </div>
              </div>

              <div class="form-row-2">
                <div class="form-group">
                  <label class="form-label">Phân loại khách hàng:</label>
                  <select class="form-control" [(ngModel)]="currentOrderData.customerType" name="cType">
                    <option value="Siêu thị">Hệ thống Siêu thị / Bán lẻ</option>
                    <option value="Đại lý phân phối">Đại lý phân phối cấp 1</option>
                    <option value="Thương lái">Thương lái bao tiêu</option>
                    <option value="Khách lẻ tiêu dùng">Khách mua trực tiếp</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Ngày giao hàng / xuất bán:</label>
                  <input type="text" class="form-control" [(ngModel)]="currentOrderData.orderDate" name="oDate" />
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Chọn nông sản / Sản phẩm OCOP số hóa: <span class="required">*</span></label>
                <select class="form-control" [(ngModel)]="orderItemName" (change)="onProductSelected()" name="pName" required>
                  @for (p of state.products(); track p.id) {
                    <option [value]="p.name">[{{ p.code }}] {{ p.name }} • {{ p.unit }} • (Niêm yết: {{ p.defaultUnitPrice.toLocaleString('vi-VN') }} đ)</option>
                  }
                </select>
              </div>

              <div class="form-row-3">
                <div class="form-group">
                  <label class="form-label">Số lượng xuất bán:</label>
                  <input type="number" class="form-control" [(ngModel)]="orderItemQty" name="qty" min="1" required />
                </div>
                <div class="form-group">
                  <label class="form-label">Đơn vị tính:</label>
                  <input type="text" class="form-control" [(ngModel)]="orderItemUnit" name="unit" readonly style="background: #f8fafc;" />
                </div>
                <div class="form-group">
                  <label class="form-label">Đơn giá bán (VNĐ):</label>
                  <input type="number" class="form-control" [(ngModel)]="orderItemPrice" name="price" step="1000" required />
                </div>
              </div>

              <div class="total-calc-box">
                <span>Tổng giá trị đơn hàng:</span>
                <strong>{{ (orderItemQty * orderItemPrice).toLocaleString('vi-VN') }} VNĐ</strong>
              </div>

              <div class="modal-actions">
                <button type="button" class="btn btn-secondary" (click)="showModal.set(false)">Hủy Bỏ</button>
                <button type="submit" class="btn btn-primary">LƯU ĐƠN HÀNG</button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- MODAL XÁC NHẬN XÓA ĐƠN HÀNG -->
      @if (orderToDelete()) {
        <div class="modal-backdrop">
          <div class="modal-dialog modal-confirm">
            <div class="confirm-icon">⚠️</div>
            <h2 class="confirm-title">Xác Nhận Hủy Đơn Hàng</h2>
            <p class="confirm-desc">
              Bác có chắc muốn xóa đơn hàng <strong>"{{ orderToDelete()?.orderCode }}"</strong> của khách hàng {{ orderToDelete()?.customerName }} không?
            </p>
            <div class="modal-actions">
              <button class="btn btn-secondary" (click)="orderToDelete.set(null)">Hủy Bỏ</button>
              <button class="btn btn-danger" (click)="executeDelete()">ĐỒNG Ý XÓA</button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .sales-page {
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
      font-size: 22px;
      font-weight: 800;
      color: var(--primary-900);
      line-height: 1.1;
    }

    .kpi-value .unit {
      font-size: 14px;
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

    .sub-phone {
      font-size: 12.5px;
      color: var(--primary-700);
      font-weight: 700;
      margin-top: 2px;
      white-space: nowrap;
    }

    .mobile-card-actions {
      display: flex;
      gap: 8px;
      margin-top: 8px;
    }
    .mobile-card-actions .btn {
      flex: 1;
    }

    .invoice-modal {
      max-width: 800px;
    }

    .invoice-box {
      background: white;
      border: 2px solid #334155;
      padding: 24px;
      border-radius: var(--radius-md);
    }

    .inv-header {
      display: flex;
      justify-content: space-between;
      border-bottom: 2px solid #334155;
      padding-bottom: 16px;
      margin-bottom: 16px;
    }

    .inv-htx-brand {
      display: flex;
      gap: 12px;
      align-items: center;
    }

    .inv-logo {
      font-size: 36px;
      width: 56px;
      height: 56px;
      background: var(--primary-100);
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .inv-htx-title {
      font-size: 17px;
      font-weight: 800;
      color: #14532d;
      margin: 0;
    }

    .inv-htx-addr {
      font-size: 12px;
      color: #475569;
      margin: 2px 0 0;
    }

    .inv-meta-right {
      text-align: right;
    }

    .inv-badge {
      font-size: 14px;
      font-weight: 800;
      color: #b91c1c;
      margin-bottom: 4px;
    }

    .inv-code-text {
      font-size: 12px;
      color: #334155;
    }

    .inv-customer-box {
      background: #f8fafc;
      padding: 12px;
      border-radius: var(--radius-sm);
      margin-bottom: 16px;
      font-size: 13.5px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .inv-table th, .inv-table td {
      padding: 8px 12px;
      font-size: 13.5px;
    }

    .inv-total-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 14px 12px;
      background: #f1f5f9;
      margin-top: 12px;
      border-radius: var(--radius-sm);
      font-weight: 800;
      font-size: 15px;
    }

    .total-big-text {
      font-size: 20px;
      color: #14532d;
    }

    .inv-signature-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      margin-top: 24px;
      text-align: center;
    }

    .digital-sign-stamp {
      border: 2px dashed #16a34a;
      background: #f0fdf4;
      padding: 8px;
      border-radius: var(--radius-sm);
      margin-top: 10px;
      display: flex;
      flex-direction: column;
      gap: 2px;
      font-size: 11.5px;
      color: #166534;
    }

    .total-calc-box {
      background: var(--primary-50);
      border: 1.5px solid var(--primary-500);
      padding: 12px 16px;
      border-radius: var(--radius-md);
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 15px;
      margin-bottom: 16px;
    }

    .total-calc-box strong {
      font-size: 18px;
      color: var(--primary-900);
    }

    .form-row-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
    }

    .modal-confirm {
      text-align: center;
      max-width: 440px;
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
      .inv-header {
        flex-direction: column;
        gap: 12px;
      }
      .form-row-2 {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class SalesListComponent {
  state = inject(HtxStateService);
  toast = inject(ToastService);

  searchKeyword = signal('');
  statusFilter = signal('');
  currentPage = signal(1);
  pageSize = signal(10);

  showModal = signal(false);
  isEditing = signal(false);
  selectedOrder = signal<SalesOrder | null>(null);
  orderToDelete = signal<SalesOrder | null>(null);

  currentOrderData: Partial<SalesOrder> = {
    customerName: '',
    customerPhone: '',
    customerType: 'Siêu thị' as const,
    orderDate: '23/09/2026',
    status: 'Đã thanh toán' as const,
    invoiceCode: 'HD-HY26-8800'
  };

  orderItemName = this.state.currentHtx().primaryProduct;
  orderItemUnit = 'túi 5kg';
  orderItemQty = 500;
  orderItemPrice = 180000;

  totalRevenue(): number {
    return this.state.currentOrders().reduce((acc, o) => acc + (o.totalAmount || 0), 0);
  }

  onSearchChange(kw: string) {
    this.searchKeyword.set(kw);
    this.currentPage.set(1);
  }

  onStatusFilterChange(st: string) {
    this.statusFilter.set(st);
    this.currentPage.set(1);
  }

  filteredOrders = computed(() => {
    const kw = this.searchKeyword().toLowerCase().trim();
    const st = this.statusFilter();

    return this.state.currentOrders().filter(ord => {
      const matchKw = !kw || 
        ord.orderCode.toLowerCase().includes(kw) || 
        ord.customerName.toLowerCase().includes(kw) || 
        ord.customerPhone.includes(kw);
      const matchSt = !st || ord.status === st;
      return matchKw && matchSt;
    });
  });

  paginatedOrders = computed(() => {
    const list = this.filteredOrders();
    const start = (this.currentPage() - 1) * this.pageSize();
    return list.slice(start, start + this.pageSize());
  });

  viewInvoice(order: SalesOrder) {
    this.selectedOrder.set(order);
  }

  downloadInvoicePdf() {
    this.toast.success('Đã tải hóa đơn', `Đã xuất file hóa đơn điện tử "${this.selectedOrder()?.invoiceCode}.pdf".`);
    this.selectedOrder.set(null);
  }

  openAddModal() {
    this.isEditing.set(false);
    this.currentOrderData = {
      orderCode: 'ĐH-HY-' + Math.floor(100 + Math.random() * 900),
      customerName: '',
      customerPhone: '',
      customerType: 'Siêu thị' as const,
      orderDate: '23/09/2026',
      status: 'Đã thanh toán' as const,
      invoiceCode: 'HD-HY26-' + Math.floor(1000 + Math.random() * 9000)
    };
    this.orderItemName = this.state.products()[0]?.name || this.state.currentHtx().primaryProduct;
    this.orderItemUnit = this.state.products()[0]?.unit || 'kg';
    this.orderItemQty = 100;
    this.orderItemPrice = this.state.products()[0]?.defaultUnitPrice || 165000;
    this.showModal.set(true);
  }

  onProductSelected() {
    const prod = this.state.products().find(p => p.name === this.orderItemName);
    if (prod) {
      this.orderItemUnit = prod.unit;
      this.orderItemPrice = prod.defaultUnitPrice;
    }
  }

  openEditModal(ord: SalesOrder) {
    this.isEditing.set(true);
    this.currentOrderData = { ...ord };
    if (ord.items && ord.items.length > 0) {
      this.orderItemName = ord.items[0].productName;
      this.orderItemUnit = ord.items[0].unit || 'kg';
      this.orderItemQty = ord.items[0].quantity;
      this.orderItemPrice = ord.items[0].unitPrice;
    }
    this.showModal.set(true);
  }

  saveOrder(e: Event) {
    e.preventDefault();
    if (!this.currentOrderData.customerName) return;

    const amount = this.orderItemQty * this.orderItemPrice;
    const fullOrder: SalesOrder = {
      id: this.currentOrderData.id || ('ord-' + Date.now().toString(36)),
      htxId: this.state.selectedHtxId(),
      orderCode: this.currentOrderData.orderCode || ('ĐH-HY-' + Math.floor(100 + Math.random() * 900)),
      customerName: this.currentOrderData.customerName || '',
      customerPhone: this.currentOrderData.customerPhone || '',
      customerType: this.currentOrderData.customerType || 'Siêu thị',
      orderDate: this.currentOrderData.orderDate || '23/09/2026',
      status: this.currentOrderData.status || 'Đã thanh toán',
      invoiceCode: this.currentOrderData.invoiceCode || ('HD-HY26-' + Math.floor(1000 + Math.random() * 9000)),
      items: [
        {
          productName: this.orderItemName,
          quantity: this.orderItemQty,
          unit: 'Túi/Con',
          unitPrice: this.orderItemPrice,
          amount
        }
      ],
      totalAmount: amount
    };

    if (this.isEditing() && this.currentOrderData.id) {
      this.state.updateSalesOrder(fullOrder);
    } else {
      this.state.addSalesOrder(fullOrder);
    }
    this.showModal.set(false);
  }

  confirmDelete(order: SalesOrder) {
    this.orderToDelete.set(order);
  }

  executeDelete() {
    if (this.orderToDelete()) {
      this.state.deleteSalesOrder(this.orderToDelete()!.id);
      this.orderToDelete.set(null);
    }
  }
}
