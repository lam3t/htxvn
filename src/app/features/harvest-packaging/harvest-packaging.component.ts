import { Component, ElementRef, ViewChild, AfterViewInit, inject, signal, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HtxStateService } from '../../core/services/htx-state.service';
import { ToastService } from '../../core/services/toast.service';
import { PackagedProduct, HarvestBatch, ProductionZone, ProductInfo } from '../../core/models/htx.model';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import * as QRCode from 'qrcode';

@Component({
  selector: 'app-harvest-packaging',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, PaginationComponent],
  template: `
    <div class="packaging-page">
      <!-- HEADER TRANG -->
      <div class="page-top">
        <div>
          <div class="page-sub">THU HOẠCH & ĐÓNG GÓI THÀNH PHẨM • {{ state.currentHtx().shortName }}</div>
          <h1 class="page-title">Quản Lý Lô Thu Hoạch & Đóng Gói Cấp Mã QR Truy Xuất</h1>
        </div>
        <div class="top-actions">
          <button class="btn btn-secondary" (click)="openAddBatchModal()">
            <span>🌾</span> Khởi Tạo Lô Thu Hoạch Mới
          </button>
          <button class="btn btn-primary" (click)="openCreateQRModal()">
            <span>📦</span> Đóng Gói Sản Phẩm & Cấp Mã QR
          </button>
        </div>
      </div>

      <!-- SƠ ĐỒ LIÊN KẾT DỮ LIỆU TỰ ĐỘNG (CHUỖI TRUY XUẤT 5 BƯỚC) -->
      <div class="relation-banner">
        <div class="relation-item">
          <span class="rel-icon">📍</span>
          <div>
            <strong>1. Vùng Canh Tác (MSVT)</strong>
            <p>Quy mô, đất/nước, giống F1</p>
          </div>
        </div>
        <span class="rel-arrow">➔</span>
        <div class="relation-item">
          <span class="rel-icon">👨‍🌾</span>
          <div>
            <strong>2. Xã Viên & Nhật Ký Số</strong>
            <p>Hộ nông dân & BVTV sinh học</p>
          </div>
        </div>
        <span class="rel-arrow">➔</span>
        <div class="relation-item">
          <span class="rel-icon">🌾</span>
          <div>
            <strong>3. Lô Thu Hoạch Thô</strong>
            <p>Sản lượng, phân loại 1 & 2</p>
          </div>
        </div>
        <span class="rel-arrow">➔</span>
        <div class="relation-item highlight-rel">
          <span class="rel-icon">📦</span>
          <div>
            <strong>4. Khâu Đóng Gói Chuẩn</strong>
            <p>Bao bì, quy cách, hạn dùng</p>
          </div>
        </div>
        <span class="rel-arrow">➔</span>
        <div class="relation-item highlight-rel">
          <span class="rel-icon">🏷️</span>
          <div>
            <strong>5. Mã QR Sau Đóng Gói</strong>
            <p>Truy xuất nguồn gốc 100%</p>
          </div>
        </div>
      </div>

      <!-- DANH SÁCH LÔ THU HOẠCH NÔNG SẢN THÔ -->
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">🌾 Danh Sách Lô Thu Hoạch Nông Sản Thô</h2>
          <span class="badge badge-info">{{ state.currentHarvestBatches().length }} lô sản xuất</span>
        </div>

        <div class="table-responsive hide-mobile">
          <table class="data-table clean-table">
            <thead>
              <tr>
                <th style="width: 26%;">Lô Thu Hoạch & Nông Sản</th>
                <th style="width: 25%;">Vùng Canh Tác & Chủ Hộ</th>
                <th style="width: 23%;">Sản Lượng & Phẩm Cấp</th>
                <th style="width: 12%;">Trạng Thái</th>
                <th style="text-align: right; width: 14%;">Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              @for (b of paginatedHarvestBatches(); track b.id) {
                <tr>
                  <td>
                    <div><strong>{{ b.productName }}</strong></div>
                    <div class="sub-text">
                      <span class="code-pill">{{ b.batchCode }}</span> • 🕒 {{ b.harvestDate }}
                    </div>
                  </td>
                  <td>
                    <div><strong>{{ b.zoneName }}</strong></div>
                    <div class="sub-text">👨‍🌾 Phụ trách: {{ b.leadFarmer }}</div>
                  </td>
                  <td>
                    <div><strong style="color: var(--primary-800); font-size: 15px;">{{ (b.totalWeightKg / 1000) | number:'1.0-1' }} tấn</strong></div>
                    <small style="color: var(--text-muted);">Loại 1: {{ (b.grade1Kg / 1000) | number:'1.0-1' }}T • Loại 2: {{ (b.grade2Kg / 1000) | number:'1.0-1' }}T</small>
                  </td>
                  <td><span class="badge badge-success">{{ b.status }}</span></td>
                  <td style="text-align: right;">
                    <div class="table-actions-inline" style="justify-content: flex-end;">
                      <button class="btn btn-primary btn-sm" (click)="selectBatchToPackage(b)" title="Đóng gói nông sản từ lô này và cấp tem QR">
                        📦 Đóng Gói
                      </button>
                      <button class="btn btn-secondary btn-sm" (click)="openEditBatchModal(b)">✏️ Sửa</button>
                      <button class="btn btn-danger btn-sm" (click)="confirmDeleteBatch(b)">🗑️ Xóa</button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- MOBILE CARDS VIEW CHO LÔ THU HOẠCH -->
        <div class="mobile-card-list show-mobile p-16">
          @for (b of paginatedHarvestBatches(); track b.id) {
            <div class="mobile-data-card">
              <div class="card-row">
                <strong>{{ b.batchCode }}</strong>
                <span class="badge badge-success">{{ b.status }}</span>
              </div>
              <div class="card-row">
                <span class="label">Sản phẩm:</span>
                <span class="value"><strong>{{ b.productName }}</strong></span>
              </div>
              <div class="card-row">
                <span class="label">Vùng & Chủ hộ:</span>
                <span class="value">{{ b.zoneName }} ({{ b.leadFarmer }})</span>
              </div>
              <div class="card-row">
                <span class="label">Tổng sản lượng:</span>
                <span class="value" style="color: var(--primary-800); font-size: 16px;">{{ (b.totalWeightKg / 1000) | number:'1.0-1' }} tấn</span>
              </div>
              <div class="mobile-card-actions">
                <button class="btn btn-primary" (click)="selectBatchToPackage(b)">📦 Đóng Gói Lô Này</button>
                <button class="btn btn-secondary" (click)="openEditBatchModal(b)">Sửa</button>
                <button class="btn btn-danger" (click)="confirmDeleteBatch(b)">Xóa</button>
              </div>
            </div>
          }
        </div>

        <!-- PHÂN TRANG LÔ THU HOẠCH -->
        <app-pagination 
          [totalItems]="state.currentHarvestBatches().length"
          [pageSize]="batchPageSize()"
          [currentPage]="batchCurrentPage()"
          [pageSizeOptions]="[5, 10, 20]"
          (pageChange)="batchCurrentPage.set($event)"
          (pageSizeChange)="batchPageSize.set($event)">
        </app-pagination>
      </div>

      <!-- KHU VỰC SẢN PHẨM SAU ĐÓNG GÓI VÀ XEM TRƯỚC TEM QR CODE -->
      <div class="qr-showcase-grid">
        <!-- CỘT 1: DANH SÁCH SẢN PHẨM ĐÃ ĐÓNG GÓI & CẤP MÃ QR -->
        <div class="card">
          <div class="card-header">
            <h2 class="card-title">📦 Sản Phẩm Sau Đóng Gói (Đã Cấp Mã QR)</h2>
            <span class="badge badge-primary">{{ state.currentPackages().length }} gói thành phẩm</span>
          </div>
          <div class="package-items-list">
            @for (p of paginatedPackages(); track p.id) {
              <div class="package-item-row" [class.selected]="selectedPackage()?.id === p.id" (click)="selectPackage(p)">
                <div class="p-icon">📦</div>
                <div class="p-details">
                  <strong>{{ p.productName }}</strong>
                  <div class="p-code">Mã QR: <code>{{ p.qrCode }}</code></div>
                  <div class="p-sub-meta">Quy cách: {{ p.weightSpec }} • Lô nguồn: <strong>{{ p.batchCode }}</strong></div>
                  <div class="p-sub-date">Đóng gói: {{ p.packDate }} • HSD: {{ p.expiryDate }}</div>
                </div>
                <button class="btn btn-danger btn-sm" (click)="deletePackage(p.id, $event)" title="Xóa gói sản phẩm">Xóa</button>
              </div>
            }
            @if (paginatedPackages().length === 0) {
              <div style="text-align: center; padding: 24px; color: var(--text-muted);">
                Chưa có sản phẩm nào được đóng gói. Bác hãy bấm nút "Đóng Gói Sản Phẩm & Cấp Mã QR" ở trên nhé!
              </div>
            }
          </div>
          <!-- PHÂN TRANG GÓI SẢN PHẨM -->
          <app-pagination 
            [totalItems]="state.currentPackages().length"
            [pageSize]="pkgPageSize()"
            [currentPage]="pkgCurrentPage()"
            [pageSizeOptions]="[4, 8, 16]"
            (pageChange)="pkgCurrentPage.set($event)"
            (pageSizeChange)="pkgPageSize.set($event)">
          </app-pagination>
        </div>

        <!-- CỘT 2: KHUNG PREVIEW TEM NHÃN QR ĐỘNG DÁN TRÊN BAO BÌ SẢN PHẨM -->
        <div class="card preview-stamp-card">
          <div class="card-header">
            <h2 class="card-title">🔍 Xem Trước Tem QR Dán Trên Bao Bì</h2>
            <button class="btn btn-primary btn-sm" (click)="printStamp()">🖨️ In Tem QR Này</button>
          </div>

          @if (selectedPackage()) {
            <div class="htx-qr-stamp-box">
              <div class="stamp-top">
                <span class="stamp-logo">{{ state.currentHtx().logo }}</span>
                <div class="stamp-header-text">
                  <div class="s-gov">TEM TRUY XUẤT NGUỒN GỐC SẢN PHẨM ĐÃ ĐÓNG GÓI</div>
                  <h3 class="s-htx-name">{{ state.currentHtx().name }}</h3>
                </div>
              </div>

              <div class="stamp-body">
                <div class="stamp-qr-canvas-box">
                  <canvas #qrCanvas class="qr-canvas"></canvas>
                  <span class="scan-hint">Quét để tra cứu</span>
                </div>

                <div class="stamp-product-info">
                  <h4 class="sp-name">{{ selectedPackage()?.productName }}</h4>
                  <div class="sp-meta-row">
                    <span>Mã định danh QR:</span>
                    <code>{{ selectedPackage()?.qrCode }}</code>
                  </div>
                  <div class="sp-meta-row">
                    <span>Lô thu hoạch gốc:</span>
                    <strong>{{ selectedPackage()?.batchCode }}</strong>
                  </div>
                  <div class="sp-meta-row">
                    <span>Ngày đóng gói:</span>
                    <strong>{{ selectedPackage()?.packDate }}</strong>
                  </div>
                  <div class="sp-meta-row">
                    <span>Quy cách đóng gói:</span>
                    <strong>{{ selectedPackage()?.weightSpec }}</strong>
                  </div>
                  <div class="sp-meta-row">
                    <span>Hạn sử dụng:</span>
                    <strong>{{ selectedPackage()?.expiryDate }}</strong>
                  </div>
                  <div class="sp-meta-row">
                    <span>Tiêu chuẩn chất lượng:</span>
                    <strong class="text-success">{{ selectedPackage()?.standard }}</strong>
                  </div>
                </div>
              </div>

              <div class="stamp-footer">
                XÁC THỰC SỐ HÓA BỞI HỆ THỐNG QUẢN TRỊ HTX TỈNH HƯNG YÊN
              </div>
            </div>

            <!-- NÚT MỞ XEM TRANG CÔNG KHAI CỦA NGƯỜI TIÊU DÙNG -->
            <div class="public-preview-action">
              <a [routerLink]="['/trace', selectedPackage()?.qrCode]" target="_blank" class="btn btn-amber btn-block btn-lg">
                <span>📱</span> THỬ QUÉT MÃ QR NÀY (XEM TRANG CÔNG KHAI CHO NGƯỜI DÙNG) ↗
              </a>
            </div>
          }
        </div>
      </div>

      <!-- MODAL THÊM / SỬA LÔ THU HOẠCH -->
      @if (showBatchModal()) {
        <div class="modal-backdrop">
          <div class="modal-dialog modal-lg">
            <div class="modal-header-simple">
              <h2 class="card-title">
                {{ isEditingBatch() ? '✏️ Chỉnh Sửa Lô Thu Hoạch' : '🌾 Khởi Tạo Lô Thu Hoạch Nông Sản' }}
              </h2>
              <button type="button" class="btn-close-modal" (click)="showBatchModal.set(false)" title="Đóng">✕</button>
            </div>

            <div class="modal-link-hint" style="margin: 0 0 12px 0;">
              <span>💡</span>
              <p>Chọn Vùng Canh Tác bên dưới để hệ thống <strong>tự động liên kết</strong> Giống cây/con, Chủ hộ phụ trách và Mã số vùng trồng (MSVT).</p>
            </div>

            <form (submit)="saveBatch($event)">
              <!-- BƯỚC 1: CHỌN VÙNG CANH TÁC TỪ DANH SÁCH HTX -->
              <div class="form-group">
                <label class="form-label">1. Chọn Vùng Canh Tác Thu Hoạch (MSVT): <span class="required">*</span></label>
                <select class="form-control form-control-highlight" [(ngModel)]="selectedZoneId" name="zoneId" (change)="onZoneSelectedChange()" required>
                  @for (z of state.currentZones(); track z.id) {
                    <option [value]="z.id">
                      {{ z.name }} • [{{ z.code }}] - Chủ hộ: {{ z.managerName }} ({{ z.varietyName || z.currentCrop }})
                    </option>
                  }
                </select>
              </div>

              <!-- THÔNG TIN TỰ ĐỘNG ĐƯỢC ĐIỀN -->
              <div class="form-row-2">
                <div class="form-group">
                  <label class="form-label">Tên sản phẩm / Giống thu hoạch:</label>
                  <input type="text" class="form-control" [(ngModel)]="currentBatchData.productName" name="productName" required readonly style="background: var(--bg-card-subtle); font-weight: 700;" />
                </div>
                <div class="form-group">
                  <label class="form-label">Chủ hộ / Xã viên phụ trách:</label>
                  <input type="text" class="form-control" [(ngModel)]="currentBatchData.leadFarmer" name="leadFarmer" required readonly style="background: var(--bg-card-subtle); font-weight: 700;" />
                </div>
              </div>

              <div class="form-row-2">
                <div class="form-group">
                  <label class="form-label">Mã lô thu hoạch (Hệ thống tự sinh): <span class="required">*</span></label>
                  <input type="text" class="form-control" [(ngModel)]="currentBatchData.batchCode" name="batchCode" required style="font-weight: 800; color: var(--primary-900);" />
                </div>
                <div class="form-group">
                  <label class="form-label">Ngày thu hoạch:</label>
                  <input type="text" class="form-control" [(ngModel)]="currentBatchData.harvestDate" name="harvestDate" required />
                </div>
              </div>

              <!-- KHỐI LƯỢNG VÀ PHÂN LOẠI PHẨM CẤP -->
              <div class="form-row-2">
                <div class="form-group">
                  <label class="form-label">Tổng sản lượng thu hoạch (kg): <span class="required">*</span></label>
                  <input type="number" class="form-control" [(ngModel)]="currentBatchData.totalWeightKg" (input)="onTotalWeightChange()" name="totalWeight" required />
                </div>
                <div class="form-group">
                  <label class="form-label">Khối lượng Loại 1 (kg):</label>
                  <input type="number" class="form-control" [(ngModel)]="currentBatchData.grade1Kg" name="grade1" />
                </div>
              </div>

              <div class="form-row-2">
                <div class="form-group">
                  <label class="form-label">Khối lượng Loại 2 (kg):</label>
                  <input type="number" class="form-control" [(ngModel)]="currentBatchData.grade2Kg" name="grade2" />
                </div>
                <div class="form-group">
                  <label class="form-label">Chỉ số chất lượng thực tế:</label>
                  <input type="text" class="form-control" placeholder="Ví dụ: Độ ẩm 14.0% / Trọng lượng 4.5kg" [(ngModel)]="currentBatchData.moistureOrFatRate" name="quality" />
                </div>
              </div>

              <div class="modal-actions">
                <button type="button" class="btn btn-secondary" (click)="showBatchModal.set(false)">Hủy</button>
                <button type="submit" class="btn btn-primary">
                  {{ isEditingBatch() ? 'LƯU THAY ĐỔI' : 'TẠO LÔ THU HOẠCH' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- MODAL ĐÓNG GÓI THÀNH PHẨM & CẤP MÃ QR TRUY XUẤT -->
      @if (showCreateQRModal()) {
        <div class="modal-backdrop">
          <div class="modal-dialog modal-lg">
            <div class="modal-header-simple">
              <h2 class="card-title">📦 Đóng Gói Thành Phẩm & Cấp Mã QR Truy Xuất</h2>
              <button type="button" class="btn-close-modal" (click)="showCreateQRModal.set(false)" title="Đóng">✕</button>
            </div>

            <div class="modal-link-hint" style="margin: 0 0 12px 0;">
              <span>💡</span>
              <p>Mã QR tra cứu chỉ được sinh ra cho sản phẩm sau khi đã <strong>hoàn thành khâu đóng gói</strong> theo quy cách chuẩn và gắn liền với Lô thu hoạch nguồn.</p>
            </div>

            <form (submit)="saveNewPackage($event)">
              <!-- BƯỚC 1: CHỌN LÔ THU HOẠCH NGUỒN -->
              <div class="form-group">
                <label class="form-label">1. Chọn Lô Thu Hoạch Nguồn Cần Đóng Gói: <span class="required">*</span></label>
                <select class="form-control form-control-highlight" [(ngModel)]="selectedBatchIdForQR" name="batchId" (change)="onBatchSelectedChange()" required>
                  @for (b of state.currentHarvestBatches(); track b.id) {
                    <option [value]="b.id">
                      {{ b.batchCode }} • {{ b.productName }} ({{ (b.totalWeightKg / 1000) | number:'1.0-1' }} tấn - {{ b.zoneName }})
                    </option>
                  }
                </select>
              </div>

              <!-- BƯỚC 2: CHỌN SẢN PHẨM THƯƠNG MẠI SAU ĐÓNG GÓI -->
              <div class="form-group">
                <label class="form-label">2. Chọn Thương Phẩm Đóng Gói (Danh mục chuẩn OCOP): <span class="required">*</span></label>
                <select class="form-control" [(ngModel)]="selectedProductId" name="productSelect" (change)="onProductSelectedChange()" required>
                  <option value="" disabled>-- Chọn sản phẩm từ danh mục HTX --</option>
                  @for (p of state.currentHtxProducts(); track p.id) {
                    <option [value]="p.id">
                      {{ p.name }} • [{{ p.code }}] ({{ p.packagingSpec }}) - {{ p.standard }}
                    </option>
                  }
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Tên sản phẩm in trên nhãn bao bì:</label>
                <input type="text" class="form-control" [(ngModel)]="newPkg.productName" name="name" required style="font-weight: 700;" />
              </div>

              <div class="form-row-2">
                <div class="form-group">
                  <label class="form-label">Mã lô thu hoạch gắn kèm tem:</label>
                  <input type="text" class="form-control" [(ngModel)]="newPkg.batchCode" name="batch" readonly style="background: var(--bg-card-subtle); font-weight: 700;" />
                </div>
                <div class="form-group">
                  <label class="form-label">Tiêu chuẩn chất lượng dán nhãn:</label>
                  <input type="text" class="form-control" [(ngModel)]="newPkg.standard" name="standard" />
                </div>
              </div>

              <!-- BƯỚC 3: QUY CÁCH ĐÓNG GÓI VÀ HẠN DÙNG -->
              <div class="form-row-2">
                <div class="form-group">
                  <label class="form-label">Quy cách bao bì đóng gói: <span class="required">*</span></label>
                  <select class="form-control" [(ngModel)]="newPkg.weightSpec" name="weight">
                    <option value="5.0 kg / túi hút chân không">Túi 5.0 kg PA hút chân không</option>
                    <option value="10.0 kg / bao chuẩn">Bao 10.0 kg PE dệt màng ghép</option>
                    <option value="Khay 1 con (1.8 - 2.2kg) hút chân không cấp đông">Khay 1 con (1.8 - 2.2kg) hút chân không cấp đông</option>
                    <option value="4.2 kg - 4.8 kg / con nguyên con">Gà trống nguyên con 4.2 - 4.8 kg</option>
                    <option value="Hộp 2.0 kg / thùng carton quà biếu OCOP">Hộp 2.0 kg / thùng quà biếu OCOP</option>
                    <option value="Hũ 500g nắp nhôm xé seal">Hũ 500g nắp nhôm xé seal</option>
                    <option value="Cá sống nguyên con sục khí (2.5 - 3.5 kg)">Cá sống nguyên con sục khí (2.5 - 3.5 kg)</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Hạn sử dụng khuyến nghị:</label>
                  <input type="text" class="form-control" [(ngModel)]="newPkg.expiryDate" name="expiry" />
                </div>
              </div>

              <div class="modal-actions">
                <button type="button" class="btn btn-secondary" (click)="showCreateQRModal.set(false)">Hủy</button>
                <button type="submit" class="btn btn-primary">
                  <span>🏷️</span> HOÀN TẤT ĐÓNG GÓI & CẤP MÃ QR TRUY XUẤT
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- MODAL XÁC NHẬN XÓA LÔ THU HOẠCH -->
      @if (batchToDelete()) {
        <div class="modal-backdrop">
          <div class="modal-dialog modal-confirm">
            <div class="confirm-icon">⚠️</div>
            <h2 class="confirm-title">Xác Nhận Xóa Lô Thu Hoạch</h2>
            <p class="confirm-desc">
              Bác có chắc chắn muốn xóa lô thu hoạch <strong>"{{ batchToDelete()?.batchCode }}"</strong> khỏi hệ thống không?
            </p>
            <div class="modal-actions">
              <button class="btn btn-secondary" (click)="batchToDelete.set(null)">Hủy Bỏ</button>
              <button class="btn btn-danger" (click)="executeDeleteBatch()">ĐỒNG Ý XÓA</button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .packaging-page {
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

    .top-actions {
      display: flex;
      gap: 8px;
    }

    /* BANNER SƠ ĐỒ LIÊN KẾT DỮ LIỆU */
    .relation-banner {
      background: linear-gradient(135deg, #14532d 0%, #166534 100%);
      color: white;
      padding: 8px 12px;
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 6px;
      box-shadow: var(--shadow-sm);
    }

    .relation-item {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .rel-icon {
      font-size: 16px;
      background: rgba(255, 255, 255, 0.2);
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .relation-item strong {
      font-size: 12.5px;
      display: block;
    }

    .relation-item p {
      font-size: 11px;
      color: #bbf7d0;
      margin: 0;
    }

    .rel-arrow {
      font-size: 14px;
      color: #86efac;
      font-weight: 800;
    }

    .highlight-rel {
      background: rgba(255, 255, 255, 0.15);
      padding: 3px 8px;
      border-radius: var(--radius-full);
      border: 1px solid rgba(255, 255, 255, 0.3);
    }

    .table-actions-inline {
      display: flex;
      gap: 6px;
      justify-content: flex-end;
    }

    .qr-showcase-grid {
      display: grid;
      grid-template-columns: 1.2fr 1.5fr;
      gap: 10px;
    }

    .package-items-list {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .package-item-row {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 10px;
      border-radius: var(--radius-sm);
      border: 1.5px solid var(--border-color);
      background: var(--bg-card-subtle);
      cursor: pointer;
      transition: all 0.15s;
    }

    .package-item-row:hover {
      background: #f1f5f9;
    }

    .package-item-row.selected {
      background: var(--primary-100);
      border-color: var(--primary-700);
    }

    .p-icon {
      font-size: 20px;
    }

    .p-details {
      flex: 1;
      min-width: 0;
    }

    .p-details strong {
      font-size: 13.5px;
      color: var(--text-main);
      display: block;
      margin-bottom: 2px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .p-code {
      font-size: 12px;
      color: var(--primary-800);
      font-weight: 700;
    }

    .p-sub-meta {
      font-size: 11.5px;
      color: var(--text-muted);
    }

    .p-sub-date {
      font-size: 11px;
      color: var(--text-muted);
      margin-top: 1px;
    }

    /* MẪU TEM QR CHUẨN CỦA HTX */
    .htx-qr-stamp-box {
      border: 2px solid var(--primary-700);
      border-radius: var(--radius-sm);
      padding: 14px;
      background: #ffffff;
      box-shadow: var(--shadow-sm);
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .stamp-top {
      display: flex;
      align-items: center;
      gap: 10px;
      border-bottom: 1.5px solid var(--primary-600);
      padding-bottom: 8px;
    }

    .stamp-logo {
      font-size: 26px;
      width: 40px;
      height: 40px;
      background: var(--primary-100);
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .s-gov {
      font-size: 10.5px;
      font-weight: 800;
      color: var(--primary-800);
      letter-spacing: 0.5px;
    }

    .s-htx-name {
      font-size: 15px;
      font-weight: 800;
      color: var(--text-main);
      margin: 0;
    }

    .stamp-body {
      display: flex;
      gap: 14px;
      align-items: center;
    }

    .stamp-qr-canvas-box {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      padding: 8px;
      background: #f8fafc;
      border: 1px solid var(--border-color);
      border-radius: var(--radius-sm);
      flex-shrink: 0;
    }

    .qr-canvas {
      width: 130px !important;
      height: 130px !important;
    }

    .scan-hint {
      font-size: 10.5px;
      font-weight: 800;
      color: var(--primary-800);
    }

    .stamp-product-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
      min-width: 0;
    }

    .sp-name {
      font-size: 15px;
      font-weight: 800;
      color: var(--text-main);
      margin: 0 0 2px;
    }

    .sp-meta-row {
      display: flex;
      justify-content: space-between;
      font-size: 12.5px;
      gap: 6px;
    }

    .sp-meta-row span {
      color: var(--text-muted);
      white-space: nowrap;
    }

    .sp-meta-row strong, .sp-meta-row code {
      text-align: right;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .text-success {
      color: var(--primary-800);
    }

    .stamp-footer {
      font-size: 11px;
      font-weight: 700;
      color: var(--primary-800);
      text-align: center;
      background: var(--primary-50);
      padding: 5px;
      border-radius: 4px;
    }

    .public-preview-action {
      margin-top: 10px;
    }

    .modal-link-hint {
      background: var(--primary-50);
      border: 1px solid var(--primary-300);
      padding: 8px 12px;
      border-radius: var(--radius-sm);
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .modal-link-hint p {
      font-size: 12.5px;
      color: var(--primary-900);
      margin: 0;
    }

    .form-control-highlight {
      border: 1.5px solid var(--primary-600);
      background-color: #f0fdf4;
      font-weight: 700;
      color: var(--primary-950);
    }

    .form-row-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }

    .btn-sm {
      min-height: 34px;
      padding: 5px 10px;
      font-size: 12.5px;
    }

    .modal-confirm {
      text-align: center;
      max-width: 400px;
    }

    .confirm-icon {
      font-size: 40px;
      margin-bottom: 6px;
    }

    .confirm-title {
      font-size: 18px;
      font-weight: 800;
      color: var(--text-main);
    }

    .confirm-desc {
      font-size: 13.5px;
      color: var(--text-muted);
      margin: 8px 0 16px;
      line-height: 1.45;
    }

    @media (max-width: 900px) {
      .qr-showcase-grid {
        grid-template-columns: 1fr;
      }
      .stamp-body {
        flex-direction: column;
      }
      .form-row-2 {
        grid-template-columns: 1fr;
      }
      .relation-banner {
        flex-direction: column;
        align-items: flex-start;
      }
      .rel-arrow {
        display: none;
      }
    }
  `]
})
export class HarvestPackagingComponent implements AfterViewInit {
  state = inject(HtxStateService);
  toast = inject(ToastService);

  @ViewChild('qrCanvas') qrCanvasRef!: ElementRef<HTMLCanvasElement>;

  selectedPackage = signal<PackagedProduct | null>(null);
  showCreateQRModal = signal(false);
  showBatchModal = signal(false);
  isEditingBatch = signal(false);
  batchToDelete = signal<HarvestBatch | null>(null);

  selectedZoneId = '';
  selectedBatchIdForQR = '';
  selectedProductId = '';

  currentBatchData: Partial<HarvestBatch> = {
    batchCode: '',
    productName: '',
    zoneName: '',
    leadFarmer: '',
    harvestDate: new Date().toLocaleDateString('vi-VN'),
    totalWeightKg: 5000,
    grade1Kg: 4250,
    grade2Kg: 750,
    moistureOrFatRate: 'Độ ẩm 14.0% (Chuẩn VietGAP)',
    status: 'Mới thu hoạch' as const
  };

  batchCurrentPage = signal(1);
  batchPageSize = signal(5);

  pkgCurrentPage = signal(1);
  pkgPageSize = signal(4);

  paginatedHarvestBatches = computed(() => {
    const list = this.state.currentHarvestBatches();
    const start = (this.batchCurrentPage() - 1) * this.batchPageSize();
    return list.slice(start, start + this.batchPageSize());
  });

  paginatedPackages = computed(() => {
    const list = this.state.currentPackages();
    const start = (this.pkgCurrentPage() - 1) * this.pkgPageSize();
    return list.slice(start, start + this.pkgPageSize());
  });

  newPkg = {
    productName: '',
    batchCode: '',
    weightSpec: '5.0 kg / túi hút chân không',
    standard: 'OCOP 4 sao & VietGAP',
    packDate: new Date().toLocaleDateString('vi-VN'),
    expiryDate: '12 tháng kể từ ngày đóng gói',
    status: 'Sẵn sàng bán' as const,
    sampleImg: 'assets/images/gao-st25.jpg'
  };

  constructor() {
    effect(() => {
      const currentList = this.state.currentPackages();
      if (currentList.length > 0 && !this.selectedPackage()) {
        this.selectedPackage.set(currentList[0]);
      }
      if (this.selectedPackage() && this.qrCanvasRef) {
        this.generateQR();
      }
    });
  }

  ngAfterViewInit() {
    if (this.state.currentPackages().length > 0) {
      this.selectedPackage.set(this.state.currentPackages()[0]);
      setTimeout(() => this.generateQR(), 100);
    }
  }

  selectPackage(p: PackagedProduct) {
    this.selectedPackage.set(p);
    setTimeout(() => this.generateQR(), 50);
  }

  generateQR() {
    const pkg = this.selectedPackage();
    if (!pkg || !this.qrCanvasRef?.nativeElement) return;

    const canvas = this.qrCanvasRef.nativeElement;
    const origin = window.location.origin;
    const traceUrl = `${origin}/trace/${pkg.qrCode}`;

    QRCode.toCanvas(canvas, traceUrl, {
      width: 130,
      margin: 1,
      color: {
        dark: '#14532d',
        light: '#ffffff'
      },
      errorCorrectionLevel: 'H'
    }, (error: any) => {
      if (error) console.error('Lỗi sinh mã QR:', error);
    });
  }

  openAddBatchModal() {
    this.isEditingBatch.set(false);
    const zones = this.state.currentZones();
    if (zones.length > 0) {
      this.selectedZoneId = zones[0].id;
      this.populateBatchFromZone(zones[0]);
    } else {
      this.currentBatchData = {
        batchCode: `LÔ-TH-${new Date().getFullYear() % 100}-01`,
        productName: this.state.currentHtx().primaryProduct,
        zoneName: 'Khu vực canh tác chuẩn',
        leadFarmer: this.state.currentHtx().representative.split('(')[0].trim(),
        harvestDate: new Date().toLocaleDateString('vi-VN'),
        totalWeightKg: 5000,
        grade1Kg: 4250,
        grade2Kg: 750,
        moistureOrFatRate: 'Độ ẩm 14.0% (Chuẩn VietGAP)',
        status: 'Mới thu hoạch'
      };
    }
    this.showBatchModal.set(true);
  }

  openEditBatchModal(batch: HarvestBatch) {
    this.isEditingBatch.set(true);
    this.currentBatchData = { ...batch };
    const matchingZone = this.state.currentZones().find(z => batch.zoneName.includes(z.name) || batch.zoneName.includes(z.code));
    if (matchingZone) {
      this.selectedZoneId = matchingZone.id;
    }
    this.showBatchModal.set(true);
  }

  onZoneSelectedChange() {
    const zone = this.state.currentZones().find(z => z.id === this.selectedZoneId);
    if (zone) {
      this.populateBatchFromZone(zone);
    }
  }

  private populateBatchFromZone(zone: ProductionZone) {
    const htxCode = this.state.currentHtx().code.split('-')[1] || 'HTX';
    const zoneCodeClean = zone.code.replace(/[^A-Z0-9]/gi, '');
    const randomSeq = Math.floor(10 + Math.random() * 90);
    const totalWeight = zone.expectedYieldKg || 5000;
    const grade1 = Math.round(totalWeight * 0.85);
    const grade2 = totalWeight - grade1;

    let qualityRate = 'Độ ẩm 14.0% (Chuẩn VietGAP)';
    if (zone.farmingType === 'livestock' || this.state.currentHtx().id === 'htx-dongtao') {
      qualityRate = 'Trọng lượng TB 4.2 - 4.6 kg/con (Chân vảy rồng đỏ)';
    } else if (zone.farmingType === 'aquaculture') {
      qualityRate = 'Trọng lượng TB 2.8 - 3.5 kg/con (Cá sống khỏe)';
    } else if (zone.name.includes('Nhãn') || this.state.currentHtx().id === 'htx-quyetthang') {
      qualityRate = 'Độ ngọt Brix 23.0°Bx (Cùi dày ráo nước)';
    }

    this.currentBatchData = {
      batchCode: `LÔ-TH-${htxCode}-${zoneCodeClean}-${randomSeq}`,
      productName: zone.varietyName || zone.currentCrop || this.state.currentHtx().primaryProduct,
      zoneName: `${zone.name} (MSVT: ${zone.code})`,
      leadFarmer: zone.managerName,
      harvestDate: new Date().toLocaleDateString('vi-VN'),
      totalWeightKg: totalWeight,
      grade1Kg: grade1,
      grade2Kg: grade2,
      moistureOrFatRate: qualityRate,
      status: 'Mới thu hoạch' as const
    };
  }

  onTotalWeightChange() {
    const total = this.currentBatchData.totalWeightKg || 0;
    this.currentBatchData.grade1Kg = Math.round(total * 0.85);
    this.currentBatchData.grade2Kg = total - (this.currentBatchData.grade1Kg || 0);
  }

  saveBatch(e: Event) {
    e.preventDefault();
    if (!this.currentBatchData.batchCode || !this.currentBatchData.productName) return;

    if (this.isEditingBatch() && this.currentBatchData.id) {
      this.state.updateHarvestBatch(this.currentBatchData as HarvestBatch);
    } else {
      this.state.addHarvestBatch(this.currentBatchData as Omit<HarvestBatch, 'id' | 'htxId'>);
    }
    this.showBatchModal.set(false);
  }

  confirmDeleteBatch(batch: HarvestBatch) {
    this.batchToDelete.set(batch);
  }

  executeDeleteBatch() {
    if (this.batchToDelete()) {
      this.state.deleteHarvestBatch(this.batchToDelete()!.id);
      this.batchToDelete.set(null);
    }
  }

  deletePackage(id: string, e: Event) {
    e.stopPropagation();
    this.state.deletePackagedProduct(id);
    if (this.selectedPackage()?.id === id) {
      const remaining = this.state.currentPackages();
      this.selectedPackage.set(remaining.length > 0 ? remaining[0] : null);
    }
  }

  selectBatchToPackage(b: HarvestBatch) {
    this.selectedBatchIdForQR = b.id;
    this.populatePackagingFromBatch(b);
    this.showCreateQRModal.set(true);
  }

  openCreateQRModal() {
    const batches = this.state.currentHarvestBatches();
    if (batches.length > 0) {
      this.selectedBatchIdForQR = batches[0].id;
      this.populatePackagingFromBatch(batches[0]);
    } else {
      const prods = this.state.currentHtxProducts();
      const firstProd = prods.length > 0 ? prods[0] : null;
      this.selectedProductId = firstProd ? firstProd.id : '';

      this.newPkg = {
        productName: firstProd ? firstProd.name : `${this.state.currentHtx().primaryProduct} Chuẩn OCOP`,
        batchCode: 'LÔ-TH-26-01',
        weightSpec: firstProd?.packagingSpec || '5.0 kg / túi hút chân không',
        standard: firstProd?.standard || this.state.currentHtx().ocopLevel,
        packDate: new Date().toLocaleDateString('vi-VN'),
        expiryDate: '12 tháng kể từ ngày đóng gói',
        status: 'Sẵn sàng bán',
        sampleImg: 'assets/images/gao-st25.jpg'
      };
    }
    this.showCreateQRModal.set(true);
  }

  onBatchSelectedChange() {
    const batch = this.state.currentHarvestBatches().find(b => b.id === this.selectedBatchIdForQR);
    if (batch) {
      this.populatePackagingFromBatch(batch);
    }
  }

  onProductSelectedChange() {
    const prod = this.state.currentHtxProducts().find(p => p.id === this.selectedProductId);
    if (prod) {
      this.newPkg.productName = prod.name;
      this.newPkg.weightSpec = prod.packagingSpec || '5.0 kg / túi hút chân không';
      this.newPkg.standard = prod.standard;
      this.newPkg.expiryDate = `${prod.shelfLifeDays || 365} ngày kể từ ngày đóng gói`;
    }
  }

  private populatePackagingFromBatch(b: HarvestBatch) {
    const products = this.state.currentHtxProducts();
    // Tìm sản phẩm phù hợp nhất trong danh mục
    let matchingProduct = products.find(p => p.name.includes(b.productName) || b.productName.includes(p.name) || p.varietyName?.includes(b.productName));
    if (!matchingProduct && products.length > 0) {
      matchingProduct = products[0];
    }

    if (matchingProduct) {
      this.selectedProductId = matchingProduct.id;
      this.newPkg = {
        productName: matchingProduct.name,
        batchCode: b.batchCode,
        weightSpec: matchingProduct.packagingSpec || '5.0 kg / túi hút chân không',
        standard: matchingProduct.standard || this.state.currentHtx().ocopLevel,
        packDate: new Date().toLocaleDateString('vi-VN'),
        expiryDate: `${matchingProduct.shelfLifeDays || 365} ngày kể từ ngày đóng gói`,
        status: 'Sẵn sàng bán',
        sampleImg: 'assets/images/gao-st25.jpg'
      };
    } else {
      let packaging = '5.0 kg / túi hút chân không';
      let expiry = '12 tháng kể từ ngày đóng gói';

      if (b.productName.includes('Gà') || this.state.currentHtx().farmingType === 'livestock' || this.state.currentHtx().id === 'htx-dongtao') {
        packaging = 'Khay 1 con (1.8 - 2.2kg) hút chân không cấp đông';
        expiry = '30 ngày trong ngăn đông (-18°C)';
      } else if (b.productName.includes('Cá') || this.state.currentHtx().farmingType === 'aquaculture') {
        packaging = 'Cá sống nguyên con sục khí (2.5 - 3.5 kg)';
        expiry = 'Sử dụng tươi sống trong 24 giờ';
      } else if (b.productName.includes('Nhãn') || this.state.currentHtx().id === 'htx-quyetthang') {
        packaging = 'Hộp 2.0 kg / thùng carton quà biếu OCOP';
        expiry = 'Bảo quản mát 15 ngày';
      }

      this.newPkg = {
        productName: `${b.productName} Đóng Gói (${this.state.currentHtx().shortName})`,
        batchCode: b.batchCode,
        weightSpec: packaging,
        standard: this.state.currentHtx().ocopLevel,
        packDate: new Date().toLocaleDateString('vi-VN'),
        expiryDate: expiry,
        status: 'Sẵn sàng bán',
        sampleImg: 'assets/images/gao-st25.jpg'
      };
    }
  }

  saveNewPackage(e: Event) {
    e.preventDefault();
    const htxCode = this.state.currentHtx().code.split('-')[1] || 'HTX';
    const randomSeq = Math.floor(1000 + Math.random() * 9000);
    const qrCode = `HY-${htxCode}-${new Date().getFullYear()}-${randomSeq}`;

    this.state.addPackagedProduct({
      qrCode,
      ...this.newPkg
    });

    // Cập nhật trạng thái lô thu hoạch thành 'Đã đóng gói QR'
    const batch = this.state.currentHarvestBatches().find(b => b.id === this.selectedBatchIdForQR);
    if (batch) {
      this.state.updateHarvestBatch({
        ...batch,
        status: 'Đã đóng gói QR'
      });
    }

    this.showCreateQRModal.set(false);
    this.toast.success('Đóng gói & Cấp mã QR thành công', `Đã sinh mã QR "${qrCode}" cho sản phẩm ${this.newPkg.productName}.`);
  }

  printStamp() {
    this.toast.success('Đang in tem QR', 'Lệnh in tem nhãn có mã QR đã được gửi tới máy in nhiệt chuyên dụng.');
  }
}
