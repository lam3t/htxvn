import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HtxStateService } from '../../../core/services/htx-state.service';
import { ProductionLog } from '../../../core/models/htx.model';
import { ToastService } from '../../../core/services/toast.service';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-logs-list',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent],
  template: `
    <div class="logs-page">
      <!-- HEADER TRANG -->
      <div class="page-top">
        <div>
          <div class="page-sub">NHẬT KÝ SẢN XUẤT ĐIỆN TỬ • {{ state.currentHtx().shortName }}</div>
          <h1 class="page-title">Sổ Nhật Ký Canh Tác & Lưu Vết An Toàn</h1>
        </div>
        <div class="top-actions">
          <button class="btn btn-secondary" (click)="openPrintModal()">
            <span>🖨️</span> In / Xuất PDF Nhật Ký
          </button>
          <button class="btn btn-primary" (click)="openAddModal()">
            <span>📝</span> Ghi Nhật Ký Mới
          </button>
        </div>
      </div>

      <!-- BANNER BẢO MẬT LƯU VẾT HASH -->
      <div class="security-banner">
        <span class="sec-icon">🔒</span>
        <div class="sec-text">
          <strong>Hệ thống Nhật ký Điện tử chuẩn Truy xuất Nguồn gốc HTX:</strong>
          <p>Mỗi bản ghi được đóng dấu thời gian (Timestamp) và sinh mã băm lưu vết chống sửa lùi ngày, đảm bảo tính minh bạch cho quy trình VietGAP và OCOP.</p>
        </div>
      </div>

      <!-- THANH TÌM KIẾM & BỘ LỌC VÙNG -->
      <div class="card filter-bar">
        <div class="filter-flex">
          <div class="search-box">
            <span class="search-icon">🔍</span>
            <input 
              type="text" 
              class="search-input" 
              placeholder="Tìm theo công việc, vật tư, người ghi..." 
              [ngModel]="searchKeyword()"
              (ngModelChange)="onSearchChange($event)"
            />
          </div>
          <div class="zone-filter-box">
            <label for="zoneFilterSelect">Vùng sản xuất:</label>
            <select 
              id="zoneFilterSelect"
              class="form-control" 
              [ngModel]="selectedZoneFilter()"
              (ngModelChange)="onZoneFilterChange($event)">
              <option value="all">Tất cả vùng canh tác</option>
              @for (z of state.currentZones(); track z.id) {
                <option [value]="z.id">{{ z.name }}</option>
              }
            </select>
          </div>
        </div>
      </div>

      <!-- TIMELINE DANH SÁCH NHẬT KÝ THEO NGÀY -->
      <div class="timeline-container">
        @if (filteredLogs().length === 0) {
          <div class="empty-state">
            <span class="empty-state-icon">📝</span>
            <div class="empty-state-title">Chưa tìm thấy bản ghi nhật ký phù hợp!</div>
            <div class="empty-state-desc">Bác nông dân hoặc kỹ sư hãy bấm nút "Ghi Nhật Ký Mới" bên dưới để tạo bản ghi mới nhé.</div>
            <button class="btn btn-primary" (click)="openAddModal()">Ghi Nhật Ký Mới</button>
          </div>
        } @else {
          <div class="timeline-tree">
            @for (log of paginatedLogs(); track log.id) {
              <div class="timeline-card-item">
                <!-- TIMELINE DOT -->
                <div class="timeline-marker">
                  <span class="marker-dot"></span>
                </div>

                <!-- CARD NỘI DUNG NHẬT KÝ -->
                <div class="card log-entry-card">
                  <div class="log-top-row">
                    <div class="log-farmer-badge">
                      <span class="farmer-ico">👨‍🌾</span>
                      <div>
                        <strong>{{ log.farmerName }}</strong>
                        <span class="zone-tag">📍 {{ log.zoneName }}</span>
                      </div>
                    </div>
                    <div class="log-right-meta">
                      <div class="log-time-badge">
                        <span>🕒 {{ log.date }}</span>
                      </div>
                      <div class="card-inline-actions">
                        @if (log.isSecured) {
                          <span class="locked-badge" title="Đã mã hóa lưu vết - Không thể chỉnh sửa">🔒 Đã khóa lưu vết</span>
                        } @else {
                          <button class="btn btn-secondary btn-sm" (click)="openEditModal(log)">✏️ Sửa</button>
                        }
                        <button class="btn btn-danger btn-sm" (click)="confirmDelete(log)">🗑️ Xóa</button>
                      </div>
                    </div>
                  </div>

                  <h3 class="log-task-title">{{ log.taskTitle }}</h3>
                  <p class="log-work-desc">{{ log.workDescription }}</p>

                  <!-- CHI TIẾT VẬT TƯ & THỜI TIẾT -->
                  <div class="log-chips-row">
                    <div class="chip-item chip-material">
                      <span class="c-icon">🧪</span>
                      <span>Vật tư: <strong>{{ log.materialsUsed }}</strong> ({{ log.quantity }})</span>
                    </div>
                    @if (log.isolationDays > 0) {
                      <div class="chip-item chip-isolation">
                        <span class="c-icon">⏳</span>
                        <span>Cách ly PHI: <strong>{{ log.isolationDays }} ngày</strong></span>
                      </div>
                    }
                    <div class="chip-item chip-weather">
                      <span class="c-icon">⛅</span>
                      <span>Thời tiết: <strong>{{ log.weather }}</strong></span>
                    </div>
                  </div>

                  <!-- HÌNH ẢNH HIỆN TRƯỜNG -->
                  @if (log.photos && log.photos.length > 0) {
                    <div class="log-photos-gallery">
                      @for (img of log.photos; track $index) {
                        <div class="photo-thumb-wrap">
                          <img [src]="img" alt="Ảnh cánh đồng" class="photo-thumb" />
                          <span class="photo-caption">📷 Ảnh chụp tại hiện trường</span>
                        </div>
                      }
                    </div>
                  }

                  <!-- KHUNG MÃ HÓA LƯU VẾT HASH CHỐNG SỬA -->
                  <div class="log-hash-footer">
                    <div class="hash-text">
                      <span class="lock-tag">🔐 MÃ LƯU VẾT:</span>
                      <code>{{ log.hashString }}</code>
                    </div>
                    <div class="verified-tag">
                      ✓ Đã xác thực bởi: <strong>{{ log.verifiedBy }}</strong>
                    </div>
                  </div>
                </div>
              </div>
            }
          </div>

          <!-- PHÂN TRANG -->
          <div class="card p-0" style="margin-top: 20px;">
            <app-pagination 
              [totalItems]="filteredLogs().length"
              [pageSize]="pageSize()"
              [currentPage]="currentPage()"
              [pageSizeOptions]="[5, 10, 20]"
              (pageChange)="currentPage.set($event)"
              (pageSizeChange)="pageSize.set($event)">
            </app-pagination>
          </div>
        }
      </div>

      <!-- MODAL GHI / SỬA NHẬT KÝ -->
      @if (showModal()) {
        <div class="modal-backdrop">
          <div class="modal-dialog modal-lg">
            <div class="modal-header-simple">
              <h2 class="card-title" style="margin: 0;">
                {{ isEditing() ? '✏️ Chỉnh Sửa Bản Ghi Nhật Ký' : '📝 Ghi Nhật Ký Nông Vụ Mới' }}
              </h2>
              <button type="button" class="btn-close-modal" (click)="showModal.set(false)" title="Đóng">✕</button>
            </div>

            <form (submit)="saveLog($event)">
              <!-- BƯỚC 1: CHỌN VÙNG VÀ HỘ NÔNG DÂN -->
              <div class="form-row-2">
                <div class="form-group">
                  <label class="form-label">1. Vùng Canh Tác / Trại Nuôi: <span class="required">*</span></label>
                  <select class="form-control" [(ngModel)]="currentLogData.zoneId" name="zoneId" (change)="onZoneSelected()" required>
                    @for (z of state.currentZones(); track z.id) {
                      <option [value]="z.id">{{ z.name }} (Chủ hộ: {{ z.managerName }})</option>
                    }
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Ngày thực hiện: <span class="required">*</span></label>
                  <input type="text" class="form-control" placeholder="Hôm nay (23/09/2026)" [(ngModel)]="currentLogData.date" name="date" required />
                </div>
              </div>

              <!-- BƯỚC 2: CHỌN CÔNG VIỆC NHANH -->
              <div class="form-group">
                <label class="form-label">2. Công việc thực hiện: <span class="required">*</span></label>
                <div class="quick-tasks-chips">
                  @for (t of quickTaskPresets; track t) {
                    <button type="button" class="quick-task-btn" [class.selected]="currentLogData.taskTitle === t" (click)="currentLogData.taskTitle = t">
                      {{ t }}
                    </button>
                  }
                </div>
                <input type="text" class="form-control" style="margin-top: 8px;" placeholder="Hoặc tự gõ tiêu đề công việc..." [(ngModel)]="currentLogData.taskTitle" name="taskTitle" required />
              </div>

              <!-- BƯỚC 3: MÔ TẢ CHI TIẾT & VẬT TƯ SỬ DỤNG -->
              <div class="form-group">
                <label class="form-label">3. Mô tả nội dung công việc:</label>
                <textarea class="form-control" rows="2" placeholder="Chi tiết thao tác ngoài đồng ruộng / chuồng trại..." [(ngModel)]="currentLogData.workDescription" name="desc"></textarea>
              </div>

              <div class="form-row-2">
                <div class="form-group">
                  <label class="form-label">Vật tư sử dụng (từ danh mục chuẩn):</label>
                  <select class="form-control" [(ngModel)]="currentLogData.materialsUsed" name="mat">
                    <option value="" disabled>-- Chọn vật tư từ danh mục --</option>
                    @for (m of masterSuppliesList(); track m.code) {
                      <option [value]="m.name">{{ m.name }} • [{{ m.code }}]</option>
                    }
                    <option value="Không sử dụng vật tư / Làm thủ công">Không sử dụng vật tư / Chăm sóc thủ công</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Số lượng & Đơn vị:</label>
                  <div class="stepper" style="width: 100%;">
                    <button type="button" class="stepper-btn" (click)="decreaseQty()">-</button>
                    <input type="number" class="stepper-input" style="flex: 1;" [(ngModel)]="qtyValue" name="qty" />
                    <button type="button" class="stepper-btn" (click)="increaseQty()">+</button>
                  </div>
                </div>
              </div>

              <div class="form-row-2">
                <div class="form-group">
                  <label class="form-label">Thời gian cách ly PHI (ngày):</label>
                  <input type="number" class="form-control" placeholder="14" [(ngModel)]="currentLogData.isolationDays" name="iso" />
                </div>
                <div class="form-group">
                  <label class="form-label">Điều kiện thời tiết:</label>
                  <div class="quick-tasks-chips">
                    @for (w of weatherPresets; track w) {
                      <button type="button" class="quick-task-btn" [class.selected]="currentLogData.weather === w" (click)="currentLogData.weather = w">
                        {{ w }}
                      </button>
                    }
                  </div>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">4. Hình ảnh hiện trường thực tế:</label>
                <div class="photo-upload-box" (click)="simUploadPhoto()">
                  <span class="upload-icon">📷</span>
                  <span>Bấm vào đây để Chụp ảnh hoặc Tải ảnh từ điện thoại</span>
                </div>
              </div>

              <div class="modal-actions">
                <button type="button" class="btn btn-secondary" (click)="showModal.set(false)">Hủy Bỏ</button>
                <button type="submit" class="btn btn-primary">
                  {{ isEditing() ? 'LƯU THAY ĐỔI' : 'LƯU VÀO SỔ NHẬT KÝ' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- MODAL IN / XUẤT PDF SỔ NHẬT KÝ SẢN XUẤT -->
      @if (showPrintModal()) {
        <div class="modal-backdrop">
          <div class="modal-dialog modal-lg print-dialog">
            <div class="print-preview-sheet">
              <div class="print-header">
                <div class="print-htx-name">{{ state.currentHtx().name }}</div>
                <h2 class="print-title">SỔ NHẬT KÝ CANH TÁC & BẢO VỆ THỰC VẬT ĐIỆN TỬ</h2>
                <div class="print-meta">Áp dụng theo tiêu chuẩn VietGAP & OCOP Hưng Yên • Năm 2026</div>
              </div>

              <table class="print-table">
                <thead>
                  <tr>
                    <th>Ngày</th>
                    <th>Vùng / Hộ</th>
                    <th>Công việc thực hiện</th>
                    <th>Vật tư & Số lượng</th>
                    <th>Cách ly (ngày)</th>
                    <th>Mã băm lưu vết</th>
                  </tr>
                </thead>
                <tbody>
                  @for (l of state.currentLogs(); track l.id) {
                    <tr>
                      <td>{{ l.date }}</td>
                      <td>{{ l.zoneName }} ({{ l.farmerName }})</td>
                      <td><strong>{{ l.taskTitle }}</strong></td>
                      <td>{{ l.materialsUsed }} ({{ l.quantity }})</td>
                      <td>{{ l.isolationDays }}</td>
                      <td><code>{{ l.hashString }}</code></td>
                    </tr>
                  }
                </tbody>
              </table>

              <div class="print-sign-grid">
                <div>
                  <strong>Người ghi chép</strong>
                  <p style="margin-top: 30px;">(Ký và ghi rõ họ tên)</p>
                </div>
                <div>
                  <strong>Cán bộ kỹ thuật HTX</strong>
                  <p style="margin-top: 30px;">(Ký và ghi rõ họ tên)</p>
                </div>
                <div>
                  <strong>Giám đốc Hợp tác xã</strong>
                  <p style="margin-top: 30px;">(Ký tên và đóng dấu)</p>
                </div>
              </div>
            </div>

            <div class="modal-actions">
              <button class="btn btn-secondary" (click)="showPrintModal.set(false)">Đóng</button>
              <button class="btn btn-primary" (click)="confirmPrint()">🖨️ XÁC NHẬN IN RA GIẤY / XUẤT PDF</button>
            </div>
          </div>
        </div>
      }

      <!-- MODAL XÁC NHẬN XÓA NHẬT KÝ -->
      @if (logToDelete()) {
        <div class="modal-backdrop">
          <div class="modal-dialog modal-confirm">
            <div class="confirm-icon">⚠️</div>
            <h2 class="confirm-title">Xác Nhận Xóa Nhật Ký</h2>
            <p class="confirm-desc">
              Bác có chắc muốn xóa bản ghi <strong>"{{ logToDelete()?.taskTitle }}"</strong> ngày {{ logToDelete()?.date }} không?
            </p>
            <div class="modal-actions">
              <button class="btn btn-secondary" (click)="logToDelete.set(null)">Hủy Bỏ</button>
              <button class="btn btn-danger" (click)="executeDelete()">ĐỒNG Ý XÓA</button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .logs-page {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .p-0 { padding: 0 !important; }

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

    .security-banner {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      background-color: var(--primary-50);
      border: 1.5px solid var(--primary-500);
      border-radius: var(--radius-sm);
      font-size: 13px;
    }

    .sec-icon {
      font-size: 22px;
      color: var(--primary-700);
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

    .zone-filter-box {
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: 700;
      font-size: 13px;
    }

    .zone-filter-box select {
      min-width: 180px;
      height: 36px;
      font-size: 13px;
    }

    .timeline-container {
      margin-top: 6px;
    }

    .timeline-tree {
      display: flex;
      flex-direction: column;
      gap: 10px;
      position: relative;
    }

    .timeline-card-item {
      display: flex;
      gap: 10px;
    }

    .timeline-marker {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 24px;
      flex-shrink: 0;
    }

    .marker-dot {
      width: 12px;
      height: 12px;
      background-color: var(--primary-600);
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: var(--shadow-sm);
      margin-top: 14px;
    }

    .log-entry-card {
      flex: 1;
      border-left: 4px solid var(--primary-700);
      padding: 10px 14px;
    }

    .log-top-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      flex-wrap: wrap;
      gap: 6px;
    }

    .log-farmer-badge {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .farmer-ico {
      font-size: 18px;
    }

    .zone-tag {
      font-size: 12px;
      color: var(--text-muted);
      margin-left: 6px;
    }

    .log-right-meta {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .log-time-badge {
      font-size: 12px;
      font-weight: 700;
      color: var(--text-muted);
      background: var(--bg-app);
      padding: 2px 8px;
      border-radius: var(--radius-sm);
    }

    .card-inline-actions {
      display: flex;
      gap: 4px;
    }

    .locked-badge {
      font-size: 11.5px;
      font-weight: 800;
      color: var(--primary-900);
      background: var(--primary-100);
      padding: 2px 8px;
      border-radius: 4px;
      border: 1px solid var(--primary-500);
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }

    .log-task-title {
      font-size: 19px;
      font-weight: 800;
      color: var(--text-main);
      margin-bottom: 6px;
    }

    .log-work-desc {
      font-size: 15px;
      color: var(--text-body);
      line-height: 1.5;
      margin-bottom: 14px;
    }

    .log-chips-row {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      margin-bottom: 16px;
    }

    .chip-item {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border-radius: var(--radius-full);
      font-size: 13.5px;
      background: var(--bg-card-subtle);
      border: 1px solid var(--border-color);
    }

    .chip-isolation {
      background: var(--amber-50);
      border-color: var(--amber-600);
      color: var(--amber-800);
    }

    .log-photos-gallery {
      display: flex;
      gap: 12px;
      margin-bottom: 16px;
      flex-wrap: wrap;
    }

    .photo-thumb-wrap {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .photo-thumb {
      width: 140px;
      height: 100px;
      object-fit: cover;
      border-radius: var(--radius-md);
      border: 2px solid var(--border-color);
    }

    .photo-caption {
      font-size: 11px;
      color: var(--text-muted);
    }

    .log-hash-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 12px;
      border-top: 1px dashed var(--border-color);
      font-size: 12.5px;
      color: var(--text-muted);
      flex-wrap: wrap;
      gap: 10px;
    }

    .lock-tag {
      font-weight: 800;
      color: var(--primary-700);
    }

    .quick-tasks-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .quick-task-btn {
      padding: 6px 12px;
      font-size: 13px;
      font-weight: 600;
      background: white;
      border: 1.5px solid var(--border-color);
      border-radius: var(--radius-full);
      cursor: pointer;
    }

    .quick-task-btn.selected {
      background: var(--primary-100);
      border-color: var(--primary-700);
      color: var(--primary-900);
      font-weight: 800;
    }

    .photo-upload-box {
      border: 2px dashed var(--border-color);
      border-radius: var(--radius-md);
      padding: 24px;
      text-align: center;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      background: var(--bg-card-subtle);
    }

    .form-row-3 {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 14px;
    }

    .print-dialog {
      max-width: 850px;
    }

    .print-preview-sheet {
      background: white;
      padding: 24px;
      border: 1px solid #cbd5e1;
      border-radius: var(--radius-md);
    }

    .print-header {
      text-align: center;
      margin-bottom: 24px;
      border-bottom: 2px solid #334155;
      padding-bottom: 12px;
    }

    .print-title {
      font-size: 20px;
      font-weight: 800;
      margin: 6px 0;
    }

    .print-htx-name {
      font-size: 16px;
      font-weight: 700;
      color: #166534;
    }

    .print-meta {
      font-size: 13px;
      color: #475569;
    }

    .print-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 14px;
    }

    .print-table th, .print-table td {
      border: 1px solid #94a3b8;
      font-size: 13px;
      padding: 8px;
    }

    .print-sign-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      text-align: center;
      margin-top: 40px;
      padding-bottom: 50px;
    }

    @media (max-width: 768px) {
      .form-row-3 {
        grid-template-columns: 1fr;
      }
      .photo-thumb {
        width: 100%;
        height: auto;
      }
    }
  `]
})
export class LogsListComponent {
  state = inject(HtxStateService);
  toast = inject(ToastService);

  searchKeyword = signal('');
  selectedZoneFilter = signal('all');
  currentPage = signal(1);
  pageSize = signal(5);

  showModal = signal(false);
  isEditing = signal(false);
  showPrintModal = signal(false);
  logToDelete = signal<ProductionLog | null>(null);

  qtyValue = 50;

  quickTaskPresets = [
    'Bón phân vi sinh thúc đòng',
    'Phun chế phẩm sinh học phòng trừ sâu bệnh',
    'Làm cỏ bờ & điều tiết nước tưới',
    'Bổ sung thảo dược tự nhiên vào thức ăn',
    'Tỉa cành khoanh vỏ đón hoa',
    'Thu hoạch & phân loại nông sản'
  ];

  weatherPresets = [
    'Nắng ráo 29°C, gió nhẹ',
    'Trời râm mát 26°C',
    'Có mưa rào nhỏ, độ ẩm 85%',
    'Nắng nóng 34°C, cần tưới đủ nước'
  ];

  masterSuppliesList = computed(() => {
    return this.state.masterDataItems().filter(m => 
      (m.categoryCode === 'MD-PHAN-BVTV' || m.categoryCode === 'MD-VACXIN-THUCAN') && m.status === 'active'
    );
  });

  currentLogData: Partial<ProductionLog> = {
    zoneId: '',
    zoneName: '',
    date: '23/09/2026 08:30',
    farmerName: '',
    farmerPhone: '0983 245 118',
    taskTitle: 'Bón phân vi sinh thúc đòng',
    workDescription: 'Đã hoàn thành bón lót phân vi sinh hữu cơ theo đúng liều lượng chỉ dẫn của kỹ sư.',
    materialsUsed: 'Phân vi sinh Quế Lâm NPK',
    quantity: '50 kg',
    isolationDays: 14,
    weather: 'Nắng ráo 29°C, gió nhẹ',
    photos: [
      'assets/images/gao-st25.jpg'
    ],
    verifiedBy: 'Đặng Văn Hùng (Kỹ sư HTX)'
  };

  onSearchChange(kw: string) {
    this.searchKeyword.set(kw);
    this.currentPage.set(1);
  }

  onZoneFilterChange(zoneId: string) {
    this.selectedZoneFilter.set(zoneId);
    this.currentPage.set(1);
  }

  filteredLogs = computed(() => {
    const kw = this.searchKeyword().toLowerCase().trim();
    const zoneId = this.selectedZoneFilter();

    return this.state.currentLogs().filter(log => {
      const matchKw = !kw || 
        log.taskTitle.toLowerCase().includes(kw) || 
        log.materialsUsed.toLowerCase().includes(kw) || 
        log.farmerName.toLowerCase().includes(kw) || 
        log.workDescription.toLowerCase().includes(kw);
      
      const matchZone = zoneId === 'all' || log.zoneId === zoneId;
      return matchKw && matchZone;
    });
  });

  paginatedLogs = computed(() => {
    const list = this.filteredLogs();
    const start = (this.currentPage() - 1) * this.pageSize();
    return list.slice(start, start + this.pageSize());
  });

  openAddModal() {
    this.isEditing.set(false);
    const firstZone = this.state.currentZones()[0];
    let defaultImg = 'assets/images/gao-st25.jpg';
    if (this.state.currentHtx().id === 'htx-quyetthang') defaultImg = 'assets/images/nhan-long.jpg';
    else if (this.state.currentHtx().id === 'htx-dongtao') defaultImg = 'assets/images/ga-dong-tao.jpg';

    this.currentLogData = {
      zoneId: firstZone?.id || '',
      zoneName: firstZone?.name || '',
      farmerName: firstZone?.managerName || '',
      farmerPhone: firstZone?.managerPhone || '0983 245 118',
      date: '23/09/2026 08:30',
      taskTitle: 'Bón phân vi sinh thúc đòng',
      workDescription: 'Đã hoàn thành bón phân hữu cơ vi sinh theo đúng liều lượng chỉ dẫn.',
      materialsUsed: 'Phân vi sinh Quế Lâm NPK 12-5-10',
      quantity: '50 kg',
      isolationDays: 14,
      weather: 'Nắng ráo 29°C, gió nhẹ',
      photos: [
        defaultImg
      ],
      verifiedBy: 'Kỹ sư HTX'
    };
    this.qtyValue = 50;
    this.showModal.set(true);
  }

  openEditModal(log: ProductionLog) {
    if (log.isSecured) {
      this.toast.warning('Bản ghi đã khóa', 'Nhật ký đã đóng dấu mã Hash lưu vết không thể chỉnh sửa.');
      return;
    }
    this.isEditing.set(true);
    this.currentLogData = { ...log };
    const numMatch = log.quantity.match(/\d+/);
    this.qtyValue = numMatch ? parseInt(numMatch[0]) : 50;
    this.showModal.set(true);
  }

  onZoneSelected() {
    const zone = this.state.currentZones().find(z => z.id === this.currentLogData.zoneId);
    if (zone) {
      this.currentLogData.zoneName = zone.name;
      this.currentLogData.farmerName = zone.managerName;
      this.currentLogData.farmerPhone = zone.managerPhone;
    }
  }

  increaseQty() {
    this.qtyValue += 10;
  }

  decreaseQty() {
    if (this.qtyValue > 5) this.qtyValue -= 5;
  }

  simUploadPhoto() {
    this.toast.info('Đã tải ảnh lên', 'Đã chụp và đính kèm ảnh cánh đồng thực tế thành công.');
  }

  saveLog(e: Event) {
    e.preventDefault();
    this.currentLogData.quantity = `${this.qtyValue} kg`;

    if (this.isEditing() && this.currentLogData.id) {
      this.state.updateProductionLog(this.currentLogData as ProductionLog);
    } else {
      this.state.addProductionLog(this.currentLogData as Omit<ProductionLog, 'id' | 'htxId' | 'isSecured' | 'hashString'>);
    }
    this.showModal.set(false);
  }

  confirmDelete(log: ProductionLog) {
    this.logToDelete.set(log);
  }

  executeDelete() {
    if (this.logToDelete()) {
      this.state.deleteProductionLog(this.logToDelete()!.id);
      this.logToDelete.set(null);
    }
  }

  openPrintModal() {
    this.showPrintModal.set(true);
  }

  confirmPrint() {
    this.showPrintModal.set(false);
    this.toast.success('Lệnh in đã gửi', 'Đang in Sổ Nhật Ký Sản Xuất VietGAP ra máy in kết nối.');
  }
}
