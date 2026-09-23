import { Component, inject, signal, computed, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HtxStateService } from '../../../core/services/htx-state.service';
import { ToastService } from '../../../core/services/toast.service';
import { TechnicalManual } from '../../../core/models/htx.model';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-technical-manuals',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent],
  template: `
    <div class="manuals-page">
      <!-- HEADER TRANG -->
      <div class="page-top">
        <div>
          <div class="page-sub">THƯ VIỆN KỸ THUẬT SỐ • TÀI LIỆU NÔNG NGHIỆP HTX</div>
          <h1 class="page-title">Sổ Tay Hướng Dẫn Kỹ Thuật Canh Tác Chuẩn</h1>
        </div>
        <button class="btn btn-primary" (click)="openAddModal()">
          <span>📤</span> Tải Lên Sổ Tay Kỹ Thuật Mới
        </button>
      </div>

      <!-- BỘ LỌC CHỦ ĐỀ & TÌM KIẾM -->
      <div class="card filter-card">
        <div class="filter-row">
          <div class="category-tabs">
            <button 
              class="cat-tab" 
              [class.active]="selectedCategory() === 'ALL'" 
              (click)="onCategorySelect('ALL')">
              Tất Cả ({{ manuals().length }})
            </button>
            <button 
              class="cat-tab" 
              [class.active]="selectedCategory() === 'Trồng trọt'" 
              (click)="onCategorySelect('Trồng trọt')">
              🌾 Trồng Trọt
            </button>
            <button 
              class="cat-tab" 
              [class.active]="selectedCategory() === 'Chăn nuôi'" 
              (click)="onCategorySelect('Chăn nuôi')">
              🐓 Chăn Nuôi
            </button>
            <button 
              class="cat-tab" 
              [class.active]="selectedCategory() === 'Thủy sản'" 
              (click)="onCategorySelect('Thủy sản')">
              🐟 Thủy Sản
            </button>
            <button 
              class="cat-tab" 
              [class.active]="selectedCategory() === 'Tiêu chuẩn VietGAP'" 
              (click)="onCategorySelect('Tiêu chuẩn VietGAP')">
              ⭐ Tiêu Chuẩn VietGAP
            </button>
          </div>

          <div class="search-wrap">
            <input 
              type="text" 
              class="search-input" 
              placeholder="Tìm kiếm tài liệu kỹ thuật..." 
              [ngModel]="searchKeyword()"
              (ngModelChange)="onSearchChange($event)"
            />
          </div>
        </div>
      </div>

      <!-- DANH SÁCH TÀI LIỆU KỸ THUẬT -->
      <div class="manuals-grid">
        @if (filteredManuals().length === 0) {
          <div class="card" style="grid-column: 1 / -1; text-align: center; padding: 36px; color: var(--text-muted);">
            Không tìm thấy tài liệu kỹ thuật nào phù hợp. Bác hãy thử từ khóa khác hoặc bấm nút "Tải Lên Sổ Tay Kỹ Thuật Mới" nhé!
          </div>
        }
        @for (m of paginatedManuals(); track m.id) {
          <div class="card manual-card">
            <div class="manual-top">
              <span class="badge" [ngClass]="getBadgeClass(m.category)">{{ m.category }}</span>
              <span class="manual-size">
                <span class="file-icon-badge">{{ getFileIcon(m.fileSize, m.fileName) }}</span>
                {{ m.fileSize }}
              </span>
            </div>

            <h2 class="manual-title">{{ m.title }}</h2>
            <p class="manual-summary">{{ m.summary }}</p>

            @if (m.fileName) {
              <div class="file-attached-info">
                <span>📎 Tệp gốc: <strong>{{ m.fileName }}</strong></span>
              </div>
            }

            <div class="manual-meta">
              <span>Biên soạn: <strong>{{ m.author }}</strong></span>
              <span>Ngày ban hành: {{ m.publishedDate }}</span>
            </div>

            <div class="manual-actions-grid">
              <button class="btn btn-secondary" (click)="viewManual(m)">
                <span>👁️</span> Xem
              </button>
              <button class="btn btn-primary" (click)="downloadPdf(m)" [title]="'Tải về: ' + m.title">
                <span>📥</span> Tải File
              </button>
              <button class="btn btn-secondary btn-icon-only" title="Chỉnh sửa" (click)="openEditModal(m)">
                ✏️
              </button>
              <button class="btn btn-danger btn-icon-only" title="Xóa tài liệu" (click)="confirmDelete(m)">
                🗑️
              </button>
            </div>
          </div>
        }
      </div>

      <!-- PHÂN TRANG -->
      <app-pagination
        [totalItems]="filteredManuals().length"
        [pageSize]="pageSize()"
        [currentPage]="currentPage()"
        [itemName]="'tài liệu'"
        (pageChange)="onPageChange($event)"
        (pageSizeChange)="onPageSizeChange($event)">
      </app-pagination>

      <!-- MODAL THÊM / SỬA TÀI LIỆU -->
      @if (showModal()) {
        <div class="modal-backdrop">
          <div class="modal-dialog modal-lg modal-scroll">
            <div class="modal-header-simple">
              <h2 class="card-title">{{ isEdit() ? '✏️ Chỉnh Sửa Sổ Tay Kỹ Thuật' : '📤 Tải Lên Sổ Tay Kỹ Thuật Mới' }}</h2>
              <button type="button" class="btn-close-modal" (click)="showModal.set(false)" title="Đóng">✕</button>
            </div>
            
            <form (submit)="saveManual($event)">
              <!-- KHU VỰC UPLOAD FILE TÀI LIỆU -->
              <div class="form-group upload-section">
                <label class="form-label">
                  <strong>Tệp tài liệu đính kèm (PDF, Word, Excel, Hình ảnh):</strong>
                  <span class="required">*</span>
                </label>
                
                <!-- Input file ẩn -->
                <input 
                  type="file" 
                  #fileInput 
                  (change)="onFileSelected($event)" 
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png" 
                  style="display: none;" 
                />

                @if (!selectedFile() && !activeManual.fileName) {
                  <!-- DROPZONE KHI CHƯA CHỌN FILE -->
                  <div 
                    class="dropzone-area" 
                    [class.dragging]="isDragging()"
                    (dragover)="onDragOver($event)"
                    (dragleave)="onDragLeave($event)"
                    (drop)="onFileDropped($event)"
                    (click)="triggerFileInput()"
                  >
                    <div class="dropzone-icon">📁</div>
                    <div class="dropzone-text">
                      <strong>Kéo thả tệp tài liệu vào đây</strong> hoặc <span class="browse-link">Bấm để chọn từ máy tính</span>
                    </div>
                    <div class="dropzone-hint">
                      Định dạng hỗ trợ: PDF, Word (.doc, .docx), Excel (.xlsx), PowerPoint (.pptx), Ảnh (.jpg, .png)
                    </div>
                  </div>
                } @else {
                  <!-- PREVIEW TỆP ĐÃ CHỌN -->
                  <div class="file-preview-card">
                    <div class="file-preview-left">
                      <div class="file-type-icon">
                        {{ getFileIcon(activeManual.fileSize, activeManual.fileName || selectedFile()?.name) }}
                      </div>
                      <div class="file-preview-meta">
                        <div class="file-name">{{ selectedFile()?.name || activeManual.fileName }}</div>
                        <div class="file-size-badge">
                          Dung lượng: <strong>{{ activeManual.fileSize }}</strong>
                          <span class="status-ready">✅ Đã sẵn sàng</span>
                        </div>
                      </div>
                    </div>
                    <div class="file-preview-actions">
                      <button type="button" class="btn btn-secondary btn-sm" (click)="triggerFileInput()">
                        🔄 Đổi tệp khác
                      </button>
                      <button type="button" class="btn btn-danger btn-sm" (click)="removeSelectedFile()">
                        ✕ Gỡ bỏ
                      </button>
                    </div>
                  </div>
                }
              </div>

              <!-- THÔNG TIN CHI TIẾT TÀI LIỆU -->
              <div class="form-group">
                <label class="form-label">Tên tài liệu / Sổ tay kỹ thuật: <span class="required">*</span></label>
                <input 
                  type="text" 
                  class="form-control" 
                  placeholder="Ví dụ: Quy trình thâm canh lúa chất lượng cao theo tiêu chuẩn VietGAP" 
                  [(ngModel)]="activeManual.title" 
                  name="title" 
                  required 
                />
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Lĩnh vực chuyên môn: <span class="required">*</span></label>
                  <select class="form-control" [(ngModel)]="activeManual.category" name="category" required>
                    <option value="Trồng trọt">🌾 Trồng trọt (Lúa, Cây ăn quả)</option>
                    <option value="Chăn nuôi">🐓 Chăn nuôi (Gà Đông Tảo, Gia cầm)</option>
                    <option value="Thủy sản">🐟 Nuôi trồng Thủy sản</option>
                    <option value="Tiêu chuẩn VietGAP">⭐ Tiêu chuẩn & Chứng nhận VietGAP</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Đơn vị / Chuyên gia biên soạn: <span class="required">*</span></label>
                  <input 
                    type="text" 
                    class="form-control" 
                    placeholder="Ví dụ: Ban Kỹ Thuật Nông Nghiệp HTX" 
                    [(ngModel)]="activeManual.author" 
                    name="author" 
                    required 
                  />
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Dung lượng & Định dạng tệp:</label>
                  <input 
                    type="text" 
                    class="form-control" 
                    placeholder="Tự động tính khi chọn tệp" 
                    [(ngModel)]="activeManual.fileSize" 
                    name="fileSize" 
                  />
                </div>
                <div class="form-group">
                  <label class="form-label">Ngày ban hành / Cập nhật:</label>
                  <input 
                    type="text" 
                    class="form-control" 
                    [(ngModel)]="activeManual.publishedDate" 
                    name="pubDate" 
                  />
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Tóm tắt nội dung kỹ thuật trọng tâm: <span class="required">*</span></label>
                <textarea 
                  class="form-control" 
                  rows="3" 
                  placeholder="Mô tả các bước kỹ thuật canh tác, phòng trừ sâu bệnh sinh học, liều lượng bón phân, thời gian cách ly..." 
                  [(ngModel)]="activeManual.summary" 
                  name="summary" 
                  required
                ></textarea>
              </div>

              <div class="modal-actions">
                <button type="button" class="btn btn-secondary" (click)="showModal.set(false)">Hủy Bỏ</button>
                <button type="submit" class="btn btn-primary">
                  <span>💾</span> LƯU & TẢI LÊN THƯ VIỆN
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- MODAL XEM CHI TIẾT TÀI LIỆU -->
      @if (showViewModal() && viewingManual) {
        <div class="modal-backdrop">
          <div class="modal-dialog modal-lg modal-scroll">
            <div class="modal-header-simple">
              <h2 class="card-title">📖 Chi Tiết Sổ Tay Kỹ Thuật Nông Nghiệp</h2>
              <button type="button" class="btn-close-modal" (click)="showViewModal.set(false)" title="Đóng">✕</button>
            </div>
            <div class="view-header">
              <span class="badge" [ngClass]="getBadgeClass(viewingManual.category)">{{ viewingManual.category }}</span>
              <h2 class="view-title">{{ viewingManual.title }}</h2>
              <div class="view-meta">
                <span>Tác giả: <strong>{{ viewingManual.author }}</strong></span> • 
                <span>Ban hành: <strong>{{ viewingManual.publishedDate }}</strong></span> • 
                <span>Định dạng: <strong>{{ viewingManual.fileSize }}</strong></span>
                @if (viewingManual.fileName) {
                  • <span>Tệp: <strong>{{ viewingManual.fileName }}</strong></span>
                }
              </div>
            </div>

            <div class="view-content-box">
              <h3>📝 Tóm tắt quy trình kỹ thuật:</h3>
              <p>{{ viewingManual.summary }}</p>

              <div class="guide-steps-mock">
                <div class="guide-step">
                  <div class="step-badge">Khâu 1</div>
                  <div>
                    <strong>Chuẩn bị giống & Xử lý giá thể vi sinh</strong>
                    <p>Sử dụng 100% giống xác nhận F1, xử lý giống bằng nước ấm hoặc chế phẩm nấm đối kháng Trichoderma sinh học an toàn.</p>
                  </div>
                </div>
                <div class="guide-step">
                  <div class="step-badge">Khâu 2</div>
                  <div>
                    <strong>Chăm sóc & Phòng trừ sâu bệnh theo chu kỳ sinh học</strong>
                    <p>Bón phân hữu cơ vi sinh cân đối, ứng dụng bẫy bả sinh học pheromone, ghi chép nhật ký canh tác số sau mỗi khâu.</p>
                  </div>
                </div>
                <div class="guide-step">
                  <div class="step-badge">Khâu 3</div>
                  <div>
                    <strong>Thời gian cách ly (PHI) & Thu hoạch đóng gói</strong>
                    <p>Đảm bảo cách ly tối thiểu 14 ngày trước thu hoạch với trồng trọt, 21 ngày với chăn nuôi/thủy sản đảm bảo an toàn tuyệt đối.</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- NẾU CÓ ẢNH PREVIEW HOẶC TỆP ĐÍNH KÈM -->
            @if (viewingManual.fileDataUrl && isImageFile(viewingManual.fileName)) {
              <div class="image-preview-container">
                <img [src]="viewingManual.fileDataUrl" alt="Tài liệu đính kèm" class="preview-img" />
              </div>
            }

            <div class="modal-actions">
              <button class="btn btn-secondary" (click)="showViewModal.set(false)">Đóng</button>
              <button class="btn btn-primary" (click)="downloadPdf(viewingManual)">
                <span>📥</span> Tải File Về Máy ({{ viewingManual.fileSize }})
              </button>
            </div>
          </div>
        </div>
      }

      <!-- MODAL XÁC NHẬN XÓA -->
      @if (showDeleteModal()) {
        <div class="modal-backdrop">
          <div class="modal-dialog modal-confirm">
            <div class="confirm-icon">⚠️</div>
            <h2 class="confirm-title">Xác Nhận Xóa Tài Liệu</h2>
            <p class="confirm-desc">
              Bác có chắc chắn muốn xóa tài liệu <strong>"{{ manualToDelete?.title }}"</strong> khỏi thư viện kỹ thuật không?
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
    .manuals-page {
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

    .filter-card {
      padding: 8px 12px;
      margin-bottom: 0;
    }

    .filter-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 8px;
    }

    .category-tabs {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .cat-tab {
      padding: 4px 10px;
      border-radius: var(--radius-full);
      border: 1.5px solid var(--border-color);
      background: #ffffff;
      font-size: 12.5px;
      font-weight: 700;
      color: var(--text-muted);
      cursor: pointer;
      transition: all 0.2s;
    }

    .cat-tab:hover {
      border-color: var(--primary-600);
      color: var(--primary-700);
    }

    .cat-tab.active {
      background: var(--primary-700);
      color: #ffffff;
      border-color: var(--primary-700);
    }

    .search-wrap {
      min-width: 200px;
    }

    .search-input {
      width: 100%;
      height: 36px;
      border: 1.5px solid var(--border-color);
      border-radius: var(--radius-sm);
      padding: 0 10px;
      font-size: 13.5px;
    }

    .manuals-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 10px;
    }

    .manual-card {
      border: 1.5px solid var(--border-color);
      border-radius: var(--radius-sm);
      padding: 10px 12px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .manual-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .manual-size {
      font-size: 12.5px;
      font-weight: 700;
      color: var(--text-muted);
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .file-icon-badge {
      font-size: 14px;
    }

    .manual-title {
      font-size: 16px;
      font-weight: 800;
      color: var(--text-main);
      line-height: 1.35;
      margin: 0;
    }

    .manual-summary {
      font-size: 13.5px;
      color: var(--text-muted);
      line-height: 1.45;
      flex: 1;
      margin: 0;
    }

    .file-attached-info {
      font-size: 12px;
      color: var(--primary-800);
      background: var(--primary-50);
      padding: 4px 8px;
      border-radius: 4px;
      border: 1px solid var(--primary-100);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .manual-meta {
      display: flex;
      flex-direction: column;
      gap: 3px;
      font-size: 12.5px;
      color: var(--text-muted);
      border-top: 1px dashed var(--border-color);
      padding-top: 8px;
    }

    .manual-actions-grid {
      display: grid;
      grid-template-columns: 1fr 1fr auto auto;
      gap: 6px;
      margin-top: 4px;
    }

    .btn-icon-only {
      padding: 6px 10px;
      font-size: 13px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }

    .modal-lg {
      max-width: 680px;
    }

    .modal-scroll {
      max-height: 90vh;
      overflow-y: auto;
    }

    /* UPLOAD DROPZONE STYLES */
    .upload-section {
      background: #f8fafc;
      border: 1px solid var(--border-color);
      padding: 12px;
      border-radius: var(--radius-sm);
    }

    .dropzone-area {
      border: 2px dashed #94a3b8;
      border-radius: var(--radius-sm);
      padding: 20px 16px;
      text-align: center;
      background: #ffffff;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .dropzone-area:hover, .dropzone-area.dragging {
      border-color: var(--primary-600);
      background: var(--primary-50);
    }

    .dropzone-icon {
      font-size: 32px;
      margin-bottom: 6px;
    }

    .dropzone-text {
      font-size: 14px;
      color: var(--text-main);
      margin-bottom: 4px;
    }

    .browse-link {
      color: var(--primary-700);
      text-decoration: underline;
      font-weight: 700;
    }

    .dropzone-hint {
      font-size: 12px;
      color: var(--text-muted);
    }

    .file-preview-card {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #ffffff;
      border: 1.5px solid var(--primary-300);
      border-radius: var(--radius-sm);
      padding: 10px 12px;
      gap: 10px;
    }

    .file-preview-left {
      display: flex;
      align-items: center;
      gap: 10px;
      min-width: 0;
      flex: 1;
    }

    .file-type-icon {
      font-size: 26px;
      line-height: 1;
    }

    .file-preview-meta {
      min-width: 0;
    }

    .file-name {
      font-size: 13.5px;
      font-weight: 800;
      color: var(--text-main);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .file-size-badge {
      font-size: 12px;
      color: var(--text-muted);
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 2px;
    }

    .status-ready {
      color: var(--primary-700);
      font-weight: 700;
    }

    .file-preview-actions {
      display: flex;
      gap: 6px;
      flex-shrink: 0;
    }

    .btn-sm {
      padding: 5px 10px;
      font-size: 12px;
      min-height: 32px;
    }

    /* VIEW MODAL STYLES */
    .view-header {
      margin-bottom: 12px;
      border-bottom: 1px solid var(--border-color);
      padding-bottom: 10px;
    }

    .view-title {
      font-size: 18px;
      font-weight: 800;
      color: var(--text-main);
      margin: 6px 0 4px;
    }

    .view-meta {
      font-size: 12.5px;
      color: var(--text-muted);
    }

    .view-content-box {
      background: var(--bg-card-subtle);
      padding: 12px;
      border-radius: var(--radius-sm);
      margin-bottom: 12px;
    }

    .view-content-box h3 {
      font-size: 14px;
      font-weight: 800;
      margin: 0 0 6px;
      color: var(--text-main);
    }

    .view-content-box p {
      font-size: 13.5px;
      color: var(--text-main);
      line-height: 1.45;
      margin: 0 0 10px;
    }

    .guide-steps-mock {
      display: flex;
      flex-direction: column;
      gap: 8px;
      border-top: 1px dashed var(--border-color);
      padding-top: 10px;
    }

    .guide-step {
      display: flex;
      gap: 10px;
      align-items: flex-start;
      background: #ffffff;
      padding: 8px 10px;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border-color);
    }

    .step-badge {
      font-size: 11px;
      font-weight: 800;
      background: var(--primary-100);
      color: var(--primary-900);
      padding: 2px 6px;
      border-radius: 4px;
      white-space: nowrap;
    }

    .guide-step strong {
      font-size: 13px;
      color: var(--text-main);
      display: block;
    }

    .guide-step p {
      font-size: 12px;
      color: var(--text-muted);
      margin: 2px 0 0;
    }

    .image-preview-container {
      margin-bottom: 12px;
      text-align: center;
      background: #000;
      border-radius: var(--radius-sm);
      padding: 6px;
    }

    .preview-img {
      max-width: 100%;
      max-height: 300px;
      object-fit: contain;
      border-radius: 4px;
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

    @media (max-width: 768px) {
      .manual-actions-grid {
        grid-template-columns: 1fr 1fr;
      }
      .form-row {
        grid-template-columns: 1fr;
      }
      .file-preview-card {
        flex-direction: column;
        align-items: flex-start;
      }
      .file-preview-actions {
        width: 100%;
        justify-content: flex-end;
      }
    }
  `]
})
export class TechnicalManualsComponent {
  @ViewChild('fileInput') fileInputRef!: ElementRef<HTMLInputElement>;

  state = inject(HtxStateService);
  toast = inject(ToastService);

  manuals = signal<TechnicalManual[]>([...this.state.technicalManuals()]);
  selectedCategory = signal<string>('ALL');
  searchKeyword = signal('');
  currentPage = signal(1);
  pageSize = signal(6);

  showModal = signal(false);
  isEdit = signal(false);
  isDragging = signal(false);
  selectedFile = signal<File | null>(null);

  activeManual: TechnicalManual = {
    id: '',
    title: '',
    category: 'Trồng trọt',
    author: '',
    publishedDate: 'Hôm nay',
    fileSize: '',
    summary: '',
    fileName: '',
    fileType: '',
    fileDataUrl: '',
    downloadUrl: '#'
  };

  showViewModal = signal(false);
  viewingManual: TechnicalManual | null = null;

  showDeleteModal = signal(false);
  manualToDelete: TechnicalManual | null = null;

  filteredManuals = computed(() => {
    return this.manuals().filter(m => {
      const matchCat = this.selectedCategory() === 'ALL' || m.category === this.selectedCategory();
      const kw = this.searchKeyword().toLowerCase().trim();
      const matchKw = !kw || 
        m.title.toLowerCase().includes(kw) || 
        m.summary.toLowerCase().includes(kw) || 
        m.author.toLowerCase().includes(kw) ||
        (m.fileName && m.fileName.toLowerCase().includes(kw));
      return matchCat && matchKw;
    });
  });

  paginatedManuals = computed(() => {
    const list = this.filteredManuals();
    const start = (this.currentPage() - 1) * this.pageSize();
    return list.slice(start, start + this.pageSize());
  });

  onCategorySelect(cat: string) {
    this.selectedCategory.set(cat);
    this.currentPage.set(1);
  }

  onSearchChange(val: string) {
    this.searchKeyword.set(val);
    this.currentPage.set(1);
  }

  onPageChange(p: number) {
    this.currentPage.set(p);
  }

  onPageSizeChange(s: number) {
    this.pageSize.set(s);
    this.currentPage.set(1);
  }

  getBadgeClass(cat: string) {
    switch (cat) {
      case 'Trồng trọt': return 'badge-success';
      case 'Chăn nuôi': return 'badge-warning';
      case 'Thủy sản': return 'badge-info';
      default: return 'badge-primary';
    }
  }

  getFileIcon(sizeStr?: string, fileName?: string): string {
    const fn = (fileName || sizeStr || '').toLowerCase();
    if (fn.includes('.pdf') || fn.includes('pdf')) return '📕';
    if (fn.includes('.doc') || fn.includes('.docx') || fn.includes('word')) return '📘';
    if (fn.includes('.xls') || fn.includes('.xlsx') || fn.includes('excel')) return '📗';
    if (fn.includes('.ppt') || fn.includes('.pptx')) return '📙';
    if (fn.includes('.png') || fn.includes('.jpg') || fn.includes('.jpeg')) return '🖼️';
    return '📄';
  }

  isImageFile(fileName?: string): boolean {
    if (!fileName) return false;
    const fn = fileName.toLowerCase();
    return fn.endsWith('.jpg') || fn.endsWith('.jpeg') || fn.endsWith('.png') || fn.endsWith('.webp');
  }

  triggerFileInput() {
    if (this.fileInputRef?.nativeElement) {
      this.fileInputRef.nativeElement.click();
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.processUploadedFile(input.files[0]);
    }
  }

  onDragOver(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    this.isDragging.set(true);
  }

  onDragLeave(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    this.isDragging.set(false);
  }

  onFileDropped(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    this.isDragging.set(false);
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      this.processUploadedFile(e.dataTransfer.files[0]);
    }
  }

  processUploadedFile(file: File) {
    this.selectedFile.set(file);
    const formattedSize = this.formatFileSize(file.size);
    const extension = file.name.substring(file.name.lastIndexOf('.')).toUpperCase();
    const typeLabel = extension ? `${formattedSize} (${extension.replace('.', '')})` : formattedSize;

    this.activeManual.fileName = file.name;
    this.activeManual.fileType = file.type || extension;
    this.activeManual.fileSize = typeLabel;

    // Tự động điền tên sổ tay nếu người dùng chưa nhập
    if (!this.activeManual.title || this.activeManual.title.trim() === '') {
      const baseName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      this.activeManual.title = baseName.charAt(0).toUpperCase() + baseName.slice(1);
    }

    // Đọc DataURL để hỗ trợ tải xuống / xem trước
    const reader = new FileReader();
    reader.onload = () => {
      this.activeManual.fileDataUrl = reader.result as string;
      this.toast.success('Đã tải tệp lên', `Tệp "${file.name}" (${typeLabel}) đã sẵn sàng.`);
    };
    reader.onerror = () => {
      this.toast.warning('Lỗi đọc tệp', 'Không thể đọc nội dung tệp đính kèm.');
    };
    reader.readAsDataURL(file);
  }

  removeSelectedFile() {
    this.selectedFile.set(null);
    this.activeManual.fileName = '';
    this.activeManual.fileDataUrl = '';
    this.activeManual.fileSize = '';
    if (this.fileInputRef?.nativeElement) {
      this.fileInputRef.nativeElement.value = '';
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  openAddModal() {
    this.isEdit.set(false);
    this.selectedFile.set(null);
    this.activeManual = {
      id: '',
      title: '',
      category: 'Trồng trọt',
      author: 'Ban Kỹ Thuật Nông Nghiệp HTX',
      publishedDate: new Date().toLocaleDateString('vi-VN'),
      fileSize: '',
      summary: '',
      fileName: '',
      fileType: '',
      fileDataUrl: '',
      downloadUrl: '#'
    };
    this.showModal.set(true);
  }

  openEditModal(m: TechnicalManual) {
    this.isEdit.set(true);
    this.selectedFile.set(null);
    this.activeManual = { ...m };
    this.showModal.set(true);
  }

  saveManual(e: Event) {
    e.preventDefault();
    if (!this.activeManual.title.trim()) {
      this.toast.warning('Thiếu thông tin', 'Vui lòng nhập tên sổ tay kỹ thuật.');
      return;
    }

    if (!this.activeManual.fileSize) {
      this.activeManual.fileSize = '3.5 MB (PDF)';
    }

    if (this.isEdit()) {
      this.manuals.update(list => list.map(m => m.id === this.activeManual.id ? { ...this.activeManual } : m));
      this.state.technicalManuals.set(this.manuals());
      this.toast.success('Cập nhật tài liệu', `Đã lưu thay đổi cho sổ tay "${this.activeManual.title}".`);
    } else {
      const newM: TechnicalManual = {
        ...this.activeManual,
        id: 'tm-' + Date.now().toString(36)
      };
      this.manuals.update(list => [newM, ...list]);
      this.state.technicalManuals.set(this.manuals());
      this.toast.success('Tải lên thành công', `Đã thêm sổ tay kỹ thuật "${newM.title}" vào thư viện số.`);
    }
    this.showModal.set(false);
  }

  viewManual(m: TechnicalManual) {
    this.viewingManual = m;
    this.showViewModal.set(true);
  }

  downloadPdf(m: TechnicalManual) {
    try {
      let downloadUrl = m.fileDataUrl;
      const downloadFileName = m.fileName || `${m.title.replace(/[/\\?%*:|"<>]/g, '_')}.pdf`;

      if (!downloadUrl) {
        // Nếu là tài liệu mẫu chưa có binary data thật, tạo file tài liệu hướng dẫn kỹ thuật mẫu hoàn chỉnh
        const docContent = `================================================================================
CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
Độc lập - Tự do - Hạnh phúc
--------------------------------------------------------------------------------
HỆ THỐNG CƠ SỞ DỮ LIỆU SẢN XUẤT NÔNG NGHIỆP HTX TỈNH HƯNG YÊN
SỞ NÔNG NGHIỆP VÀ PHÁT TRIỂN NÔNG THÔN TỈNH HƯNG YÊN

TÀI LIỆU HƯỚNG DẪN KỸ THUẬT CANH TÁC CHUẨN NÔNG NGHIỆP SỐ
MÃ TÀI LIỆU: ${m.id.toUpperCase()}

TÊN TÀI LIỆU: ${m.title}
LĨNH VỰC: ${m.category}
CƠ QUAN / ĐƠN VỊ BIÊN SOẠN: ${m.author}
NGÀY BAN HÀNH / CẬP NHẬT: ${m.publishedDate}
DUNG LƯỢNG LƯU TRỮ: ${m.fileSize}

--------------------------------------------------------------------------------
I. TỔNG QUAN VÀ MỤC TIÊU KỸ THUẬT
${m.summary}

--------------------------------------------------------------------------------
II. CÁC QUY TRÌNH KỸ THUẬT BẮT BUỘC THEO TIÊU CHUẨN VIETGAP

1. KHÂU 1: CHUẨN BỊ GIỐNG VÀ XỬ LÝ ĐẤT / CHUỒNG TRẠI / MÔI TRƯỜNG NƯỚC
- Sử dụng 100% giống xác nhận có nguồn gốc xuất xứ rõ ràng từ cơ sở được cấp phép.
- Khử trùng hạt giống / con giống bằng biện pháp sinh học, nước ấm và chế phẩm nấm đối kháng.
- Cải tạo đất, làm đệm lót sinh học hoặc xử lý vi sinh nguồn nước ao nuôi định kỳ 7-10 ngày/lần.

2. KHÂU 2: CHĂM SÓC, BÓN PHÂN VÀ PHÒNG TRỪ DỊCH BỆNH SINH HỌC
- Áp dụng nguyên tắc bón phân "3 Giảm 3 Tăng", ưu tiên 100% phân bón hữu cơ vi sinh ủ hoai mục.
- Tuyệt đối KHÔNG sử dụng các hoạt chất cấm, kháng sinh tăng trọng hay thuốc bảo vệ thực vật ngoài danh mục.
- Khi xuất hiện sâu bệnh, ưu tiên sử dụng thuốc thảo mộc sinh học, bẫy dính pheromone hoặc thiên địch.
- Cán bộ kỹ thuật và thành viên phải ghi chép ngay nhật ký canh tác số trên hệ thống CSDL HTX Hưng Yên.

3. KHÂU 3: THỜI GIAN CÁCH LY (PHI) VÀ QUY TRÌNH THU HOẠCH - ĐÓNG GÓI
- Tuân thủ nghiêm ngặt thời gian cách ly PHI tối thiểu:
  + Đối với rau củ, lúa, cây ăn quả (nhãn lồng): Tối thiểu 14 ngày trước thu hoạch.
  + Đối với chăn nuôi gia cầm (Gà Đông Tảo), thủy sản: Tối thiểu 21 ngày trước khi xuất chuồng/thu hoạch.
- Sử dụng bao bì đạt chuẩn an toàn thực phẩm, dán mã QR truy xuất nguồn gốc do HTX cấp phát.

--------------------------------------------------------------------------------
III. ĐIỀU KHOẢN THI HÀNH
Toàn thể thành viên HTX nông nghiệp An Ninh, HTX Gà Đông Tảo, HTX Quyết Thắng và các tổ hợp tác trên địa bàn tỉnh Hưng Yên nghiêm túc tuân thủ quy trình kỹ thuật này.

HƯNG YÊN, Ngày ${m.publishedDate}
BAN KỸ THUẬT NÔNG NGHIỆP HTX TỈNH HƯNG YÊN
================================================================================`;

        const blob = new Blob([docContent], { type: 'text/plain;charset=utf-8' });
        downloadUrl = URL.createObjectURL(blob);
      }

      // Kích hoạt tải tệp tự động về máy tính người dùng
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = downloadFileName.endsWith('.pdf') || downloadFileName.endsWith('.docx') || downloadFileName.endsWith('.txt') 
        ? downloadFileName 
        : `${downloadFileName}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      this.toast.success('Đang tải tài liệu', `Đã tải xuống sổ tay kỹ thuật "${downloadFileName}" thành công.`);
    } catch (err) {
      console.error('Download error:', err);
      this.toast.warning('Tải tài liệu', `Đã bắt đầu tiến trình tải sổ tay "${m.title}".`);
    }
  }

  confirmDelete(m: TechnicalManual) {
    this.manualToDelete = m;
    this.showDeleteModal.set(true);
  }

  executeDelete() {
    if (!this.manualToDelete) return;
    const title = this.manualToDelete.title;
    this.manuals.update(list => list.filter(m => m.id !== this.manualToDelete?.id));
    this.state.technicalManuals.set(this.manuals());
    this.showDeleteModal.set(false);
    this.toast.danger('Đã xóa tài liệu', `Đã gỡ bỏ "${title}" khỏi thư viện.`);
  }
}
