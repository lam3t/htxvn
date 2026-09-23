import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HtxStateService } from '../../../core/services/htx-state.service';
import { ToastService } from '../../../core/services/toast.service';
import { PartnerInfo, PartnerCommitment, ProductInfo } from '../../../core/models/htx.model';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-partners-list',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent],
  template: `
    <div class="partners-page">
      <!-- HEADER TRANG -->
      <div class="page-top">
        <div>
          <div class="page-sub">THƯƠNG MẠI & CHUỖI CUNG ỨNG • SỐ HÓA CAM KẾT SẢN PHẨM</div>
          <h1 class="page-title">Quản Lý Đối Tác, Bao Tiêu & Kênh Phân Phối</h1>
        </div>
        <button class="btn btn-primary" (click)="openAddModal()">
          <span>➕</span> Thêm Đối Tác / Kênh Phân Phối Mới
        </button>
      </div>

      <!-- TỔNG QUAN NĂNG LỰC LIÊN KẾT THƯƠNG MẠI (ĐƯỢC TÍNH TOÁN TỰ ĐỘNG TỪ CSDL ĐỐI TƯỢNG SỐ HÓA) -->
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-header">
            <span class="kpi-title">Tổng Số Đối Tác Ký Kết</span>
            <span class="kpi-icon icon-green">🤝</span>
          </div>
          <div class="kpi-value">{{ state.partners().length }} <span class="unit">đối tác</span></div>
          <span class="status-pill green">● Chuỗi liên kết khép kín</span>
        </div>

        <div class="kpi-card">
          <div class="kpi-header">
            <span class="kpi-title">Số Hợp Đồng Cam Kết Số Hóa</span>
            <span class="kpi-icon icon-blue">🏬</span>
          </div>
          <div class="kpi-value">{{ totalCommitmentLines() }} <span class="unit">dòng cam kết SP</span></div>
          <span class="status-pill blue">Định lượng cụ thể theo từng sản phẩm</span>
        </div>

        <div class="kpi-card">
          <div class="kpi-header">
            <span class="kpi-title">Tổng Sản Lượng Cam Kết Lúa/Nhãn</span>
            <span class="kpi-icon icon-amber">📦</span>
          </div>
          <div class="kpi-value">> {{ totalCommittedTons() | number:'1.0-0' }} <span class="unit">tấn/năm</span></div>
          <span class="status-pill amber">Thống kê từ CSDL số hóa</span>
        </div>

        <div class="kpi-card">
          <div class="kpi-header">
            <span class="kpi-title">Tổng Giá Trị Bao Tiêu Dự Kiến</span>
            <span class="kpi-icon icon-purple">💰</span>
          </div>
          <div class="kpi-value">{{ (totalCommittedValue() / 1000000000) | number:'1.1-1' }} <span class="unit">tỷ đồng</span></div>
          <span class="status-pill purple">Hợp đồng nguyên tắc dài hạn</span>
        </div>
      </div>

      <!-- BỘ LỌC VÀ BẢNG DANH SÁCH ĐỐI TÁC -->
      <div class="card p-0">
        <div class="card-header p-20">
          <div class="type-filter-tabs">
            <button 
              class="type-tab" 
              [class.active]="selectedType() === 'ALL'" 
              (click)="onTypeFilterChange('ALL')">
              Tất Cả ({{ state.partners().length }})
            </button>
            <button 
              class="type-tab" 
              [class.active]="selectedType() === 'Siêu thị / Bán lẻ'" 
              (click)="onTypeFilterChange('Siêu thị / Bán lẻ')">
              🏬 Siêu Thị & Bán Lẻ
            </button>
            <button 
              class="type-tab" 
              [class.active]="selectedType() === 'Doanh nghiệp bao tiêu'" 
              (click)="onTypeFilterChange('Doanh nghiệp bao tiêu')">
              🌾 Doanh Nghiệp Bao Tiêu
            </button>
            <button 
              class="type-tab" 
              [class.active]="selectedType() === 'Nhà cung ứng vật tư'" 
              (click)="onTypeFilterChange('Nhà cung ứng vật tư')">
              🧪 Cung Ứng Vật Tư
            </button>
            <button 
              class="type-tab" 
              [class.active]="selectedType() === 'Đại lý phân phối'" 
              (click)="onTypeFilterChange('Đại lý phân phối')">
              🚚 Đại Lý Phân Phối
            </button>
          </div>

          <div class="search-box-wrap">
            <input 
              type="text" 
              class="form-control form-control-sm" 
              placeholder="Tìm tên đối tác, đại diện, SĐT..." 
              [ngModel]="searchKeyword()" 
              (ngModelChange)="onSearchChange($event)"
            />
          </div>
        </div>

        <div class="table-responsive hide-mobile">
          <table class="data-table clean-table">
            <thead>
              <tr>
                <th style="width: 26%;">Đối Tác & Kênh Phân Phối</th>
                <th style="width: 22%;">Đại Diện & Trụ Sở</th>
                <th style="width: 32%;">Sản Phẩm & Cam Kết Số Hóa (Có Định Lượng)</th>
                <th style="width: 10%;">Hợp Đồng</th>
                <th style="text-align: right; width: 10%;">Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              @for (p of paginatedPartners(); track p.id) {
                <tr>
                  <td>
                    <div><strong style="font-size: 15px;">{{ p.name }}</strong></div>
                    <div class="sub-text">
                      <span class="item-code-tag">{{ p.code }}</span> • 
                      <span class="badge badge-info">{{ p.type }}</span>
                    </div>
                    @if (p.contractNumber) {
                      <div style="font-size: 12px; color: var(--text-muted); margin-top: 2px;">
                        Số HĐ: <strong>{{ p.contractNumber }}</strong>
                      </div>
                    }
                  </td>
                  <td>
                    <div><strong>{{ p.contactPerson }}</strong> (<a [href]="'tel:' + p.phone" class="phone-link">{{ p.phone }}</a>)</div>
                    <small style="color: var(--text-muted);">{{ p.address }}</small>
                  </td>
                  <td>
                    <!-- DANH SÁCH ĐỐI TƯỢNG SẢN PHẨM CAM KẾT CÓ ĐỊNH LƯỢNG RÕ RÀNG -->
                    <div class="commitments-list">
                      @for (c of p.commitments; track c.productId || c.productName) {
                        <div class="commitment-badge">
                          <span class="badge-icon">📦</span>
                          <span class="badge-prod-name"><strong>{{ c.productName }}</strong>:</span>
                          <span class="badge-qty">{{ c.targetQuantity | number:'1.0-0' }} {{ c.unit }}/{{ c.period }}</span>
                          @if (c.contractPrice) {
                            <span class="badge-price">({{ (c.contractPrice).toLocaleString('vi-VN') }} đ/{{ c.unit }})</span>
                          }
                        </div>
                      }
                      @if (!p.commitments || p.commitments.length === 0) {
                        <div style="color: var(--text-muted); font-size: 13px;">Chưa có sản phẩm cam kết số hóa</div>
                      }
                    </div>
                  </td>
                  <td>
                    <span class="badge badge-success">{{ p.contractStatus }}</span>
                    @if (p.debtStatus) {
                      <div class="debt-tag">{{ p.debtStatus }}</div>
                    }
                  </td>
                  <td style="text-align: right;">
                    <div class="table-actions-inline" style="justify-content: flex-end;">
                      <button class="btn btn-secondary btn-sm" (click)="openEditModal(p)">✏️ Sửa</button>
                      <button class="btn btn-danger btn-sm" (click)="confirmDelete(p)">🗑️ Xóa</button>
                    </div>
                  </td>
                </tr>
              }
              @if (paginatedPartners().length === 0) {
                <tr>
                  <td colspan="5" style="text-align: center; padding: 32px; color: var(--text-muted);">
                    Không tìm thấy đối tác nào phù hợp với từ khóa "{{ searchKeyword() }}".
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- MOBILE CARDS VIEW -->
        <div class="mobile-card-list show-mobile p-16">
          @for (p of paginatedPartners(); track p.id) {
            <div class="mobile-data-card">
              <div class="card-row">
                <strong>{{ p.name }}</strong>
                <span class="badge badge-success">{{ p.contractStatus }}</span>
              </div>
              <div class="card-row">
                <span class="label">Mã / Loại:</span>
                <span class="value">{{ p.code }} • {{ p.type }}</span>
              </div>
              <div class="card-row">
                <span class="label">Đại diện / SĐT:</span>
                <span class="value">{{ p.contactPerson }} ({{ p.phone }})</span>
              </div>
              <div class="card-row" style="flex-direction: column; align-items: flex-start; gap: 4px;">
                <span class="label">Cam kết sản phẩm số hóa:</span>
                <div class="commitments-list" style="width: 100%;">
                  @for (c of p.commitments; track c.productId || c.productName) {
                    <div class="commitment-badge">
                      <strong>{{ c.productName }}</strong>: {{ c.targetQuantity | number:'1.0-0' }} {{ c.unit }}/{{ c.period }}
                    </div>
                  }
                </div>
              </div>
              <div class="mobile-card-actions">
                <button class="btn btn-secondary" (click)="openEditModal(p)">Sửa</button>
                <button class="btn btn-danger" (click)="confirmDelete(p)">Xóa</button>
              </div>
            </div>
          }
        </div>

        <!-- PHÂN TRANG -->
        <app-pagination 
          [totalItems]="filteredPartners().length"
          [pageSize]="pageSize()"
          [currentPage]="currentPage()"
          [itemName]="'đối tác'"
          (pageChange)="currentPage.set($event)"
          (pageSizeChange)="pageSize.set($event)">
        </app-pagination>
      </div>

      <!-- MODAL THÊM / SỬA ĐỐI TÁC VỚI BỘ CHỌN SẢN PHẨM SỐ HÓA -->
      @if (showModal()) {
        <div class="modal-backdrop">
          <div class="modal-dialog modal-xl">
            <div class="modal-header-simple">
              <h2 class="card-title">
                {{ isEdit() ? '✏️ Chỉnh Sửa Thông Tin Đối Tác & Cam Kết Số Hóa' : '🤝 Thêm Đối Tác / Kênh Phân Phối Mới' }}
              </h2>
              <button type="button" class="btn-close-modal" (click)="showModal.set(false)" title="Đóng">✕</button>
            </div>
            <form (submit)="savePartner($event)">
              <!-- PHẦN 1: THÔNG TIN PHÁP LÝ & ĐỐI TÁC -->
              <div class="form-section-title">
                <span>🏢</span> 1. Thông Tin Doanh Nghiệp / Đối Tác
              </div>

              <div class="form-row-2">
                <div class="form-group">
                  <label class="form-label">Tên doanh nghiệp / Đối tác: <span class="required">*</span></label>
                  <input type="text" class="form-control" placeholder="Ví dụ: Hệ thống Siêu thị WinMart Miền Bắc" [(ngModel)]="activePartner.name" name="name" required />
                </div>
                <div class="form-group">
                  <label class="form-label">Mã định danh đối tác: <span class="required">*</span></label>
                  <input type="text" class="form-control" placeholder="DT-WINMART" [(ngModel)]="activePartner.code" name="code" required />
                </div>
              </div>

              <div class="form-row-2">
                <div class="form-group">
                  <label class="form-label">Phân loại đối tác:</label>
                  <select class="form-control" [(ngModel)]="activePartner.type" name="type">
                    <option value="Siêu thị / Bán lẻ">Hệ thống Siêu thị & Bán lẻ</option>
                    <option value="Doanh nghiệp bao tiêu">Doanh nghiệp xuất khẩu & Bao tiêu</option>
                    <option value="Nhà cung ứng vật tư">Nhà cung ứng giống, vật tư phân bón</option>
                    <option value="Đại lý phân phối">Đại lý phân phối cấp 1</option>
                    <option value="Chế biến & Vận chuyển">Đơn vị Chế biến & Vận tải lạnh</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Tình trạng hợp đồng:</label>
                  <select class="form-control" [(ngModel)]="activePartner.contractStatus" name="contractStatus">
                    <option value="Đang hiệu lực">Đang hiệu lực (Hợp đồng nguyên tắc)</option>
                    <option value="Sắp hết hạn">Sắp hết hạn (Cần tái ký)</option>
                    <option value="Tạm dừng">Tạm dừng giao dịch</option>
                  </select>
                </div>
              </div>

              <div class="form-row-2">
                <div class="form-group">
                  <label class="form-label">Số hợp đồng ký kết:</label>
                  <input type="text" class="form-control" placeholder="HĐ-WCM-HY-2026/01" [(ngModel)]="activePartner.contractNumber" name="contractNumber" />
                </div>
                <div class="form-group">
                  <label class="form-label">Điều khoản thanh toán & Công nợ:</label>
                  <input type="text" class="form-control" placeholder="Thanh toán đúng hạn (T+15)" [(ngModel)]="activePartner.debtStatus" name="debtStatus" />
                </div>
              </div>

              <div class="form-row-2">
                <div class="form-group">
                  <label class="form-label">Người đại diện liên hệ: <span class="required">*</span></label>
                  <input type="text" class="form-control" placeholder="Họ và tên người phụ trách..." [(ngModel)]="activePartner.contactPerson" name="contactPerson" required />
                </div>
                <div class="form-group">
                  <label class="form-label">Số điện thoại liên hệ: <span class="required">*</span></label>
                  <input type="text" class="form-control" placeholder="0988 123 456" [(ngModel)]="activePartner.phone" name="phone" required />
                </div>
              </div>

              <div class="form-row-2">
                <div class="form-group">
                  <label class="form-label">Email giao dịch:</label>
                  <input type="email" class="form-control" placeholder="contact@winmart.vn" [(ngModel)]="activePartner.email" name="email" />
                </div>
                <div class="form-group">
                  <label class="form-label">Địa chỉ trụ sở / Kho giao nhận:</label>
                  <input type="text" class="form-control" placeholder="Khu đô thị Times City, Hai Bà Trưng, Hà Nội" [(ngModel)]="activePartner.address" name="address" />
                </div>
              </div>

              <!-- PHẦN 2: SỐ HÓA DANH MỤC SẢN PHẨM & CAM KẾT ĐỊNH LƯỢNG -->
              <div class="form-section-title" style="margin-top: 16px;">
                <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                  <span>📦 2. Danh Mục Sản Phẩm Bao Tiêu Số Hóa (Định Lượng & Đơn Giá)</span>
                  <button type="button" class="btn btn-outline btn-sm" (click)="addCommitmentRow()">
                    <span>➕</span> Thêm Dòng Sản Phẩm Cam Kết
                  </button>
                </div>
              </div>

              <div class="commitment-table-wrap">
                <table class="commitment-table">
                  <thead>
                    <tr>
                      <th style="width: 32%;">Chọn Sản Phẩm Số Hóa</th>
                      <th style="width: 18%;">Sản Lượng Định Lượng</th>
                      <th style="width: 16%;">Đơn Vị Tính</th>
                      <th style="width: 14%;">Kỳ Cam Kết</th>
                      <th style="width: 14%;">Đơn Giá (VNĐ)</th>
                      <th style="width: 6%; text-align: center;">Xóa</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (cm of activeCommitments; track $index) {
                      <tr>
                        <td>
                          <select 
                            class="form-control form-control-sm" 
                            [(ngModel)]="cm.productId" 
                            (change)="onProductSelectChange(cm)"
                            [name]="'prod_' + $index" 
                            required>
                            <option value="" disabled>-- Chọn sản phẩm số hóa --</option>
                            @for (p of state.products(); track p.id) {
                              <option [value]="p.id">[{{ p.code }}] {{ p.name }} ({{ p.unit }})</option>
                            }
                          </select>
                        </td>
                        <td>
                          <input 
                            type="number" 
                            class="form-control form-control-sm" 
                            placeholder="Số lượng..." 
                            [(ngModel)]="cm.targetQuantity" 
                            [name]="'qty_' + $index" 
                            min="1" 
                            required 
                          />
                        </td>
                        <td>
                          <select class="form-control form-control-sm" [(ngModel)]="cm.unit" [name]="'unit_' + $index">
                            <option value="tấn">Tấn</option>
                            <option value="kg">kg</option>
                            <option value="con">Con (Gà/Cá)</option>
                            <option value="khay">Khay</option>
                            <option value="hộp">Hộp</option>
                            <option value="túi 5kg">Túi 5kg</option>
                            <option value="lít">Lít</option>
                          </select>
                        </td>
                        <td>
                          <select class="form-control form-control-sm" [(ngModel)]="cm.period" [name]="'period_' + $index">
                            <option value="năm">/ Năm</option>
                            <option value="vụ">/ Vụ</option>
                            <option value="tháng">/ Tháng</option>
                          </select>
                        </td>
                        <td>
                          <input 
                            type="number" 
                            class="form-control form-control-sm" 
                            placeholder="Đơn giá HĐ..." 
                            [(ngModel)]="cm.contractPrice" 
                            [name]="'price_' + $index" 
                            step="1000" 
                          />
                        </td>
                        <td style="text-align: center;">
                          <button 
                            type="button" 
                            class="btn-delete-row" 
                            (click)="removeCommitmentRow($index)" 
                            [disabled]="activeCommitments.length <= 1"
                            title="Xóa dòng này">
                            ✕
                          </button>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>

              <div class="modal-actions">
                <button type="button" class="btn btn-secondary" (click)="showModal.set(false)">Hủy Bỏ</button>
                <button type="submit" class="btn btn-primary">
                  {{ isEdit() ? 'LƯU THAY ĐỔI' : 'LƯU ĐỐI TÁC MỚI' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- MODAL XÁC NHẬN XÓA ĐỐI TÁC -->
      @if (showDeleteModal()) {
        <div class="modal-backdrop">
          <div class="modal-dialog modal-confirm">
            <div class="confirm-icon">⚠️</div>
            <h2 class="confirm-title">Xác Nhận Xóa Đối Tác</h2>
            <p class="confirm-desc">
              Bác có chắc chắn muốn xóa đối tác <strong>"{{ partnerToDelete?.name }}"</strong> khỏi danh bạ liên kết không?
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
    .partners-page {
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

    .type-filter-tabs {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
    }

    .type-tab {
      padding: 4px 10px;
      background: var(--bg-card-subtle);
      border: 1.5px solid var(--border-color);
      border-radius: var(--radius-full);
      font-size: 12.5px;
      font-weight: 700;
      color: var(--text-body);
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .type-tab.active {
      background: var(--primary-700);
      color: white;
      border-color: var(--primary-700);
    }

    .search-box-wrap {
      min-width: 200px;
    }

    .item-code-tag {
      font-size: 11.5px;
      font-weight: 800;
      background: var(--bg-app);
      padding: 2px 6px;
      border-radius: 4px;
      white-space: nowrap;
    }

    .commitments-list {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .commitment-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 12px;
      color: var(--primary-900);
      flex-wrap: wrap;
    }

    .badge-icon {
      font-size: 13px;
    }

    .badge-prod-name {
      color: var(--text-main);
    }

    .badge-qty {
      font-weight: 800;
      color: var(--primary-800);
      background: #dcfce7;
      padding: 1px 6px;
      border-radius: 4px;
    }

    .badge-price {
      font-size: 12px;
      color: var(--text-muted);
    }

    .debt-tag {
      font-size: 11.5px;
      color: var(--text-muted);
      margin-top: 2px;
    }

    .mobile-card-actions {
      display: flex;
      gap: 8px;
      margin-top: 8px;
    }
    .mobile-card-actions .btn {
      flex: 1;
    }

    .form-section-title {
      font-size: 15px;
      font-weight: 800;
      color: var(--primary-900);
      background: var(--primary-50);
      padding: 8px 14px;
      border-radius: var(--radius-sm);
      margin-bottom: 14px;
      display: flex;
      align-items: center;
      gap: 8px;
      border-left: 4px solid var(--primary-700);
    }

    .commitment-table-wrap {
      width: 100%;
      overflow-x: auto;
      margin-bottom: 16px;
      border: 1.5px solid var(--border-color);
      border-radius: var(--radius-md);
    }

    .commitment-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13.5px;
      background: #ffffff;
    }

    .commitment-table th {
      background: #f8fafc;
      padding: 10px 12px;
      font-weight: 700;
      color: var(--text-main);
      border-bottom: 1.5px solid var(--border-color);
      text-align: left;
    }

    .commitment-table td {
      padding: 8px 10px;
      border-bottom: 1px solid #e2e8f0;
      vertical-align: middle;
    }

    .btn-delete-row {
      background: transparent;
      border: none;
      color: var(--danger-700);
      font-weight: 800;
      font-size: 16px;
      cursor: pointer;
      padding: 6px 10px;
      border-radius: 4px;
      transition: background 0.15s;
    }

    .btn-delete-row:hover:not(:disabled) {
      background: var(--danger-100);
    }

    .btn-delete-row:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }

    .modal-xl {
      max-width: 900px;
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
  `]
})
export class PartnersListComponent {
  state = inject(HtxStateService);
  toast = inject(ToastService);

  selectedType = signal<string>('ALL');
  searchKeyword = signal('');
  currentPage = signal(1);
  pageSize = signal(10);

  showModal = signal(false);
  isEdit = signal(false);

  showDeleteModal = signal(false);
  partnerToDelete: PartnerInfo | null = null;

  activeCommitments: PartnerCommitment[] = [];

  activePartner: PartnerInfo = {
    id: '',
    code: 'DT-',
    name: '',
    type: 'Siêu thị / Bán lẻ',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    commitments: [],
    contractNumber: '',
    contractStatus: 'Đang hiệu lực',
    debtStatus: 'Thanh toán đúng hạn'
  };

  // KPI Computations from digitized partner commitments
  totalCommitmentLines = computed(() => {
    return this.state.partners().reduce((sum, p) => sum + (p.commitments?.length || 0), 0);
  });

  totalCommittedTons = computed(() => {
    let totalTons = 0;
    for (const p of this.state.partners()) {
      if (p.commitments) {
        for (const c of p.commitments) {
          if (c.unit === 'tấn') {
            totalTons += c.targetQuantity;
          } else if (c.unit === 'kg') {
            totalTons += c.targetQuantity / 1000;
          }
        }
      }
    }
    return totalTons;
  });

  totalCommittedValue = computed(() => {
    let totalVal = 0;
    for (const p of this.state.partners()) {
      if (p.commitments) {
        for (const c of p.commitments) {
          if (c.totalCommittedValue) {
            totalVal += c.totalCommittedValue;
          } else if (c.contractPrice && c.targetQuantity) {
            totalVal += c.contractPrice * c.targetQuantity;
          }
        }
      }
    }
    return totalVal;
  });

  onTypeFilterChange(t: string) {
    this.selectedType.set(t);
    this.currentPage.set(1);
  }

  onSearchChange(kw: string) {
    this.searchKeyword.set(kw);
    this.currentPage.set(1);
  }

  filteredPartners = computed(() => {
    const type = this.selectedType();
    const kw = this.searchKeyword().toLowerCase().trim();

    return this.state.partners().filter(p => {
      const matchType = type === 'ALL' || p.type === type;
      const matchKw = !kw || 
        p.name.toLowerCase().includes(kw) || 
        p.code.toLowerCase().includes(kw) || 
        p.contactPerson.toLowerCase().includes(kw) || 
        p.phone.includes(kw);
      return matchType && matchKw;
    });
  });

  paginatedPartners = computed(() => {
    const list = this.filteredPartners();
    const start = (this.currentPage() - 1) * this.pageSize();
    return list.slice(start, start + this.pageSize());
  });

  openAddModal() {
    this.isEdit.set(false);
    this.activePartner = {
      id: '',
      code: 'DT-' + Date.now().toString(36).toUpperCase().slice(-4),
      name: '',
      type: 'Siêu thị / Bán lẻ',
      contactPerson: '',
      phone: '',
      email: '',
      address: 'Hà Nội / Hưng Yên',
      contractNumber: 'HĐ-' + new Date().getFullYear() + '/' + Math.floor(100 + Math.random() * 900),
      commitments: [],
      contractStatus: 'Đang hiệu lực',
      debtStatus: 'Thanh toán định kỳ T+15'
    };

    // Initialize with 1 default commitment row
    const defaultProd = this.state.products()[0];
    this.activeCommitments = [
      {
        id: 'cm-' + Date.now().toString(36),
        productId: defaultProd?.id || 'sp-st25',
        productCode: defaultProd?.code || 'SP-GAO-ST25',
        productName: defaultProd?.name || 'Gạo sạch ST25 An Ninh',
        targetQuantity: 100,
        unit: 'tấn',
        period: 'năm',
        contractPrice: 28000000,
        totalCommittedValue: 2800000000
      }
    ];

    this.showModal.set(true);
  }

  openEditModal(p: PartnerInfo) {
    this.isEdit.set(true);
    this.activePartner = { ...p };
    this.activeCommitments = p.commitments && p.commitments.length > 0 
      ? JSON.parse(JSON.stringify(p.commitments))
      : [
          {
            id: 'cm-' + Date.now().toString(36),
            productId: this.state.products()[0]?.id || '',
            productCode: this.state.products()[0]?.code || '',
            productName: this.state.products()[0]?.name || 'Sản phẩm tiêu chuẩn',
            targetQuantity: 50,
            unit: 'tấn',
            period: 'năm',
            contractPrice: 25000000
          }
        ];
    this.showModal.set(true);
  }

  addCommitmentRow() {
    const defaultProd = this.state.products()[0];
    this.activeCommitments.push({
      id: 'cm-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 5),
      productId: defaultProd?.id || '',
      productCode: defaultProd?.code || '',
      productName: defaultProd?.name || '',
      targetQuantity: 10,
      unit: defaultProd?.unit?.includes('túi') ? 'túi 5kg' : (defaultProd?.unit || 'tấn'),
      period: 'năm',
      contractPrice: defaultProd?.defaultUnitPrice || 0
    });
  }

  removeCommitmentRow(index: number) {
    if (this.activeCommitments.length > 1) {
      this.activeCommitments.splice(index, 1);
    }
  }

  onProductSelectChange(cm: PartnerCommitment) {
    const prod = this.state.products().find(p => p.id === cm.productId);
    if (prod) {
      cm.productCode = prod.code;
      cm.productName = prod.name;
      cm.unit = prod.unit.includes('túi') ? 'túi 5kg' : (prod.unit || 'tấn');
      cm.contractPrice = prod.defaultUnitPrice;
    }
  }

  savePartner(e: Event) {
    e.preventDefault();
    if (!this.activePartner.name.trim() || !this.activePartner.code.trim()) return;

    // Filter valid commitments
    const validCommitments = this.activeCommitments
      .filter(c => c.productId && c.targetQuantity > 0)
      .map(c => {
        const prod = this.state.products().find(p => p.id === c.productId);
        return {
          ...c,
          productCode: prod ? prod.code : c.productCode,
          productName: prod ? prod.name : c.productName,
          totalCommittedValue: (c.contractPrice || 0) * (c.targetQuantity || 0)
        };
      });

    this.activePartner.commitments = validCommitments;
    this.activePartner.productsLinked = validCommitments.map(c => c.productName);
    this.activePartner.annualCommitment = validCommitments
      .map(c => `${c.targetQuantity} ${c.unit} ${c.productName}/${c.period}`)
      .join(' + ');

    if (this.isEdit()) {
      this.state.updatePartner(this.activePartner);
    } else {
      this.state.addPartner(this.activePartner);
    }
    this.showModal.set(false);
  }

  confirmDelete(p: PartnerInfo) {
    this.partnerToDelete = p;
    this.showDeleteModal.set(true);
  }

  executeDelete() {
    if (this.partnerToDelete) {
      this.state.deletePartner(this.partnerToDelete.id);
      this.showDeleteModal.set(false);
    }
  }
}
