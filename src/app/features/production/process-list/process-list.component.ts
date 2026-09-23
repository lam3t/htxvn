import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HtxStateService } from '../../../core/services/htx-state.service';
import { ToastService } from '../../../core/services/toast.service';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

interface ProcessStepItem {
  day: string;
  title: string;
  guide: string;
  material: string;
}

interface ProcessItem {
  id: string;
  name: string;
  season: string;
  farmingType: 'crop' | 'livestock' | 'aquaculture';
  totalDays: number;
  stepsCount: number;
  updatedDate: string;
  standard: string;
  steps: ProcessStepItem[];
}

@Component({
  selector: 'app-process-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, PaginationComponent],
  template: `
    <div class="processes-page">
      <!-- HEADER TRANG -->
      <div class="page-top">
        <div>
          <div class="page-sub">QUY TRÌNH NÔNG VỤ • {{ state.currentHtx().shortName }}</div>
          <h1 class="page-title">Quy Trình Canh Tác Chuẩn Nông Nghiệp HTX</h1>
        </div>
        <div>
          @if (state.canEditProcess()) {
            <button class="btn btn-primary" (click)="openAddModal()">
              <span>➕</span> Tạo Quy Trình Nông Vụ Mới
            </button>
          } @else {
            <a routerLink="/production/logs" class="btn btn-primary">
              <span>📝</span> Sang Sổ Ghi Nhật Ký Sản Xuất ➔
            </a>
          }
        </div>
      </div>

      <!-- BANNER HƯỚNG DẪN DÀNH CHO XÃ VIÊN / NÔNG DÂN (KHÔNG CÓ QUYỀN SỬA QUY TRÌNH) -->
      @if (!state.canEditProcess()) {
        <div class="farmer-instruction-banner">
          <span class="banner-icon">📖</span>
          <div class="banner-content">
            <strong>Sổ Tay Hướng Dẫn Kỹ Thuật Chuẩn Của HTX (Dành cho Xã Viên):</strong>
            <p>Đây là quy trình chuẩn VietGAP/OCOP do Kỹ sư HTX ban hành. Bác chỉ cần tham khảo hướng dẫn từng bước dưới đây và thực hiện ghi chép công việc trên đồng ruộng tại <strong>"Nhật Ký Sản Xuất"</strong>.</p>
          </div>
          <a routerLink="/production/logs" class="btn btn-primary btn-sm">
            <span>📝</span> Ghi Nhật Ký Ngay ➔
          </a>
        </div>
      }

      <!-- THANH TÌM KIẾM QUY TRÌNH -->
      <div class="card filter-bar">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input 
            type="text" 
            class="search-input" 
            placeholder="Tìm quy trình theo tên, mùa vụ, tiêu chuẩn VietGAP/OCOP..." 
            [ngModel]="searchKeyword()"
            (ngModelChange)="onSearchChange($event)"
          />
        </div>
      </div>

      <!-- DANH SÁCH CÁC QUY TRÌNH HIỆN CÓ CỦA HTX -->
      <div class="process-cards-grid">
        @for (p of paginatedProcesses(); track p.id) {
          <div class="card process-card">
            <div class="process-card-header">
              <div>
                <div class="badges-row">
                  <span class="badge badge-success">{{ p.season }}</span>
                  <span class="badge badge-info">{{ p.standard }}</span>
                </div>
                <h2 class="p-title">{{ p.name }}</h2>
              </div>
              <span class="p-duration">⏱️ {{ p.totalDays }} ngày</span>
            </div>

            <div class="p-meta">
              <span>Số bước kỹ thuật: <strong>{{ p.steps.length }} giai đoạn</strong></span>
              <span>Cập nhật gần nhất: {{ p.updatedDate }}</span>
            </div>

            <!-- BƯỚC KỸ THUẬT TIÊU BIỂU -->
            <div class="steps-preview">
              @for (st of p.steps; track $index) {
                <div class="step-preview-row">
                  <span class="step-day-pill">{{ st.day }}</span>
                  <div class="step-desc-wrap">
                    <strong>{{ st.title }}</strong>
                    <p>{{ st.guide }}</p>
                    <div class="step-mat">📦 Vật tư: <em>{{ st.material }}</em></div>
                  </div>
                </div>
              }
            </div>

            <!-- CÁC HÀNH ĐỘNG THEO PHÂN QUYỀN -->
            @if (state.canEditProcess()) {
              <div class="process-actions">
                <button class="btn btn-secondary btn-block" (click)="cloneProcess(p)">
                  <span>📋</span> Nhân Bản Vụ Mới
                </button>
                <div class="sub-actions">
                  <button class="btn btn-secondary flex-1" (click)="openEditModal(p)">
                    <span>✏️</span> Chỉnh Sửa
                  </button>
                  <button class="btn btn-danger" (click)="confirmDelete(p)">
                    <span>🗑️</span> Xóa
                  </button>
                </div>
              </div>
            } @else {
              <div class="farmer-action-box">
                <div class="farmer-role-tag">🔒 Quy trình chuẩn do Kỹ sư HTX ban hành (Chế độ xem hướng dẫn)</div>
                <a routerLink="/production/logs" class="btn btn-primary btn-block">
                  <span>📝</span> Bác Bấm Vào Đây Để Ghi Nhật Ký Vụ Này ➔
                </a>
              </div>
            }
          </div>
        }
      </div>

      @if (filteredProcesses().length === 0) {
        <div class="empty-state">
          <span class="empty-state-icon">🌱</span>
          <div class="empty-state-title">Chưa tìm thấy quy trình nào phù hợp!</div>
          <div class="empty-state-desc">Bác có thể tạo quy trình kỹ thuật mới hoặc nhân bản từ các vụ trước.</div>
          <button class="btn btn-primary" (click)="openAddModal()">Tạo Quy Trình Mới</button>
        </div>
      } @else {
        <!-- PHÂN TRANG -->
        <div class="card p-0">
          <app-pagination 
            [totalItems]="filteredProcesses().length"
            [pageSize]="pageSize()"
            [currentPage]="currentPage()"
            [pageSizeOptions]="[3, 6, 12]"
            (pageChange)="currentPage.set($event)"
            (pageSizeChange)="pageSize.set($event)">
          </app-pagination>
        </div>
      }

      <!-- MODAL TẠO / SỬA QUY TRÌNH -->
      @if (showModal()) {
        <div class="modal-backdrop">
          <div class="modal-dialog modal-lg">
            <div class="modal-header-simple">
              <h2 class="card-title">
                {{ isEdit() ? '✏️ Chỉnh Sửa Quy Trình Nông Vụ' : '🌱 Khởi Tạo Quy Trình Nông Vụ Mới' }}
              </h2>
              <button type="button" class="btn-close-modal" (click)="showModal.set(false)" title="Đóng">✕</button>
            </div>
            
            <form (submit)="saveProcess($event)">
              <div class="form-group">
                <label class="form-label">Tên quy trình canh tác / chăn nuôi: <span class="required">*</span></label>
                <input 
                  type="text" 
                  class="form-control" 
                  placeholder="Ví dụ: Quy trình thâm canh lúa ST25 chuẩn VietGAP Vụ Xuân 2027" 
                  [(ngModel)]="activeProcess.name" 
                  name="name" 
                  required 
                />
              </div>

              <div class="form-row-2">
                <div class="form-group">
                  <label class="form-label">Mùa vụ áp dụng: <span class="required">*</span></label>
                  <input 
                    type="text" 
                    class="form-control" 
                    placeholder="Ví dụ: Vụ Xuân 2027" 
                    [(ngModel)]="activeProcess.season" 
                    name="season" 
                    required 
                  />
                </div>
                <div class="form-group">
                  <label class="form-label">Tổng chu kỳ sinh trưởng (ngày): <span class="required">*</span></label>
                  <input 
                    type="number" 
                    class="form-control" 
                    placeholder="105" 
                    [(ngModel)]="activeProcess.totalDays" 
                    name="days" 
                    required 
                  />
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Tiêu chuẩn kỹ thuật áp dụng:</label>
                <input 
                  type="text" 
                  class="form-control" 
                  placeholder="VietGAP & OCOP 4 sao Hưng Yên" 
                  [(ngModel)]="activeProcess.standard" 
                  name="standard" 
                />
              </div>

              <!-- DANH SÁCH BƯỚC KỸ THUẬT TRONG MODAL -->
              <div class="form-group">
                <div class="steps-builder-header">
                  <label class="form-label">Các giai đoạn kỹ thuật ({{ activeProcess.steps.length }} bước):</label>
                  <button type="button" class="btn btn-secondary btn-sm" (click)="addStep()">+ Thêm Bước</button>
                </div>

                <div class="steps-builder-list">
                  @for (st of activeProcess.steps; track $index) {
                    <div class="step-builder-row">
                      <div class="st-num">{{ $index + 1 }}</div>
                      <div class="st-inputs">
                        <div class="form-row-2" style="margin-bottom: 8px;">
                          <input type="text" class="form-control" placeholder="Thời gian (VD: Ngày 1 - 5)" [(ngModel)]="st.day" [name]="'day_' + $index" required />
                          <input type="text" class="form-control" placeholder="Tên công việc / Giai đoạn" [(ngModel)]="st.title" [name]="'title_' + $index" required />
                        </div>
                        <input type="text" class="form-control" style="margin-bottom: 8px;" placeholder="Hướng dẫn kỹ thuật chi tiết..." [(ngModel)]="st.guide" [name]="'guide_' + $index" />
                        <input type="text" class="form-control" placeholder="Vật tư sinh học sử dụng..." [(ngModel)]="st.material" [name]="'mat_' + $index" />
                      </div>
                      <button type="button" class="btn-remove-step" (click)="removeStep($index)" title="Xóa bước này">✕</button>
                    </div>
                  }
                </div>
              </div>

              <div class="modal-actions">
                <button type="button" class="btn btn-secondary" (click)="showModal.set(false)">Hủy Bỏ</button>
                <button type="submit" class="btn btn-primary">LƯU QUY TRÌNH</button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- MODAL XÁC NHẬN XÓA QUY TRÌNH -->
      @if (showDeleteModal()) {
        <div class="modal-backdrop">
          <div class="modal-dialog modal-confirm">
            <div class="confirm-icon">⚠️</div>
            <h2 class="confirm-title">Xác Nhận Xóa Quy Trình</h2>
            <p class="confirm-desc">
              Bác có chắc muốn xóa quy trình <strong>"{{ processToDelete?.name }}"</strong> không?
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
    .processes-page {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .p-0 { padding: 0 !important; }

    .page-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 10px;
    }

    .page-sub {
      font-size: 12px;
      font-weight: 800;
      color: var(--primary-700);
      letter-spacing: 0.5px;
    }

    .page-title {
      font-size: 21px;
      color: var(--text-main);
      margin: 0;
    }

    /* BANNER HƯỚNG DẪN DÀNH CHO XÃ VIÊN */
    .farmer-instruction-banner {
      background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
      border: 1.5px solid var(--primary-400);
      border-radius: var(--radius-sm);
      padding: 10px 14px;
      display: flex;
      align-items: center;
      gap: 12px;
      box-shadow: var(--shadow-sm);
    }

    .banner-icon {
      font-size: 24px;
      flex-shrink: 0;
    }

    .banner-content {
      flex: 1;
    }

    .banner-content strong {
      font-size: 13.5px;
      color: var(--primary-950);
      display: block;
      margin-bottom: 2px;
    }

    .banner-content p {
      font-size: 12.5px;
      color: var(--text-body);
      margin: 0;
      line-height: 1.4;
    }

    .farmer-action-box {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-top: 10px;
    }

    .farmer-role-tag {
      font-size: 11.5px;
      font-weight: 700;
      color: var(--text-muted);
      text-align: center;
      background: var(--bg-card-subtle);
      padding: 4px 8px;
      border-radius: 4px;
      border: 1px dashed var(--border-color);
    }

    .filter-bar {
      margin-bottom: 0;
      padding: 8px 12px;
    }

    .search-box {
      display: flex;
      align-items: center;
      gap: 10px;
      background: var(--bg-card-subtle);
      border: 1.5px solid var(--border-color);
      border-radius: var(--radius-sm);
      padding: 0 12px;
    }

    .search-icon {
      font-size: 16px;
      color: var(--text-muted);
    }

    .search-input {
      width: 100%;
      height: 38px;
      border: none;
      background: transparent;
      font-size: 14px;
      font-weight: 600;
      color: var(--text-main);
      outline: none;
    }

    .process-cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 12px;
    }

    .process-card {
      display: flex;
      flex-direction: column;
      border: 1.5px solid var(--border-color);
      border-top: 4px solid var(--primary-700);
      padding: 14px;
    }

    .process-card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 12px;
    }

    .badges-row {
      display: flex;
      gap: 8px;
      margin-bottom: 8px;
    }

    .p-title {
      font-size: 18px;
      font-weight: 800;
      color: var(--text-main);
      line-height: 1.3;
    }

    .p-duration {
      font-size: 13px;
      font-weight: 800;
      color: var(--primary-900);
      background: var(--primary-100);
      padding: 4px 10px;
      border-radius: var(--radius-full);
      white-space: nowrap;
    }

    .p-meta {
      display: flex;
      justify-content: space-between;
      font-size: 13px;
      color: var(--text-muted);
      padding-bottom: 12px;
      border-bottom: 1px dashed var(--border-color);
      margin-bottom: 14px;
    }

    .steps-preview {
      display: flex;
      flex-direction: column;
      gap: 12px;
      flex: 1;
      margin-bottom: 20px;
    }

    .step-preview-row {
      display: flex;
      gap: 12px;
      background: var(--bg-card-subtle);
      padding: 10px 12px;
      border-radius: var(--radius-md);
      border: 1px solid var(--border-color);
    }

    .step-day-pill {
      font-size: 11px;
      font-weight: 800;
      background: var(--primary-700);
      color: white;
      padding: 3px 8px;
      border-radius: 4px;
      height: fit-content;
      white-space: nowrap;
    }

    .step-desc-wrap {
      display: flex;
      flex-direction: column;
      gap: 2px;
      font-size: 13px;
    }

    .step-desc-wrap p {
      color: var(--text-muted);
      font-size: 12.5px;
      margin: 0;
    }

    .step-mat {
      font-size: 12px;
      color: var(--primary-800);
      margin-top: 2px;
    }

    .process-actions {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-top: auto;
    }

    .sub-actions {
      display: flex;
      gap: 8px;
    }

    .flex-1 { flex: 1; }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    .steps-builder-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .steps-builder-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
      max-height: 300px;
      overflow-y: auto;
      padding-right: 4px;
    }

    .step-builder-row {
      display: flex;
      align-items: center;
      gap: 10px;
      background: var(--bg-card-subtle);
      padding: 10px;
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
    }

    .st-num {
      width: 28px;
      height: 28px;
      background: var(--primary-700);
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 13px;
      flex-shrink: 0;
    }

    .st-inputs {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .st-line-1 {
      display: grid;
      grid-template-columns: 1fr 2fr;
      gap: 6px;
    }

    .form-control-sm {
      min-height: 36px;
      padding: 4px 8px;
      font-size: 13px;
    }

    .btn-remove-step {
      background: none;
      border: none;
      color: var(--danger-600);
      font-size: 16px;
      font-weight: 800;
      cursor: pointer;
      padding: 4px;
    }

    .btn-sm {
      min-height: 34px;
      padding: 4px 10px;
      font-size: 12.5px;
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

    @media (max-width: 768px) {
      .process-cards-grid {
        grid-template-columns: 1fr;
      }
      .form-row {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ProcessListComponent {
  state = inject(HtxStateService);
  toast = inject(ToastService);

  searchKeyword = signal('');
  currentPage = signal(1);
  pageSize = signal(3);

  showModal = signal(false);
  isEdit = signal(false);

  showDeleteModal = signal(false);
  processToDelete: ProcessItem | null = null;

  activeProcess: ProcessItem = {
    id: '',
    name: '',
    season: 'Vụ Mới 2027',
    farmingType: 'crop',
    totalDays: 105,
    stepsCount: 3,
    updatedDate: 'Hôm nay',
    standard: 'VietGAP & OCOP 4 sao',
    steps: []
  };

  processes = signal<ProcessItem[]>([
    {
      id: 'p-01',
      name: 'Quy trình thâm canh Lúa sạch ST25 Chuẩn VietGAP',
      season: 'Vụ Mùa 2026',
      farmingType: 'crop',
      totalDays: 105,
      stepsCount: 4,
      updatedDate: '15/07/2026',
      standard: 'VietGAP & OCOP 4 sao',
      steps: [
        { day: 'Ngày 1 - 5', title: 'Ngâm ủ & Gieo mạ khay', guide: 'Xử lý nước ấm 54°C và nấm đối kháng Trichoderma.', material: 'Thóc giống ST25 nguyên chủng' },
        { day: 'Ngày 15 - 18', title: 'Cấy máy giăng dây & Bón lót', guide: 'Cấy mật độ 30-35 khóm/m2, bón phân vi sinh Quế Lâm.', material: 'Phân vi sinh 350kg/ha' },
        { day: 'Ngày 40 - 45', title: 'Bón thúc đòng đợt 2 & Rút cạn nước', guide: 'Phơi nẻ chân ruộng, điều hòa oxy cho bộ rễ lúa.', material: 'NPK 12-5-10 hữu cơ' },
        { day: 'Ngày 95 - 105', title: 'Thu hoạch cơ giới & Sấy lúa mát', guide: 'Gặt đập liên hợp khi lúa chín 90%, sấy đối lưu 42°C.', material: 'Bao bì chuẩn mã QR' }
      ]
    },
    {
      id: 'p-02',
      name: 'Quy trình chăn nuôi Gà Đông Tảo an toàn sinh học thả vườn',
      season: 'Vụ Tết 2026',
      farmingType: 'livestock',
      totalDays: 240,
      stepsCount: 3,
      updatedDate: '10/01/2026',
      standard: 'An toàn sinh học HTX',
      steps: [
        { day: 'Tháng 1 - 2', title: 'Úm gà con & Tiêm phòng vắc-xin', guide: 'Làm ấm chuồng úm 32°C, vắc xin Lasota và Gumboro.', material: 'Đệm lót trấu sinh học EM' },
        { day: 'Tháng 3 - 6', title: 'Thả vườn tập tính & Bổ sung thảo dược', guide: 'Thả sân cát tự do, trộn tỏi tía và ngô quê nghiền.', material: 'Thảo dược tự nhiên tỏi tía' },
        { day: 'Tháng 7 - 8', title: 'Vỗ béo chân vảy rồng & Gắn vòng QR', guide: 'Kiểm tra cân nặng đạt 4.2-4.8kg, gắn mã QR định danh.', material: 'Vòng chip đeo chân' }
      ]
    },
    {
      id: 'p-03',
      name: 'Quy trình nuôi Thủy sản Cá Lăng Sông Hồng lồng bè nước chảy',
      season: 'Vụ 2026 - 2027',
      farmingType: 'aquaculture',
      totalDays: 360,
      stepsCount: 3,
      updatedDate: '20/03/2026',
      standard: 'VietGAP Thủy Sản',
      steps: [
        { day: 'Tháng 1 - 3', title: 'Thả cá giống F1 & thuần dưỡng', guide: 'Mật độ 25 con/m3, kiểm soát DO > 5.5 mg/L, pH 7.2.', material: 'Cá giống 100g/con' },
        { day: 'Tháng 4 - 9', title: 'Cho ăn cám viên nổi & phòng bệnh thảo dược', guide: 'Cám viên 40% đạm bổ sung men vi sinh đường ruột.', material: 'Cám nổi chuyên dụng' },
        { day: 'Tháng 10 - 12', title: 'Thu hoạch cá thương phẩm đạt 3.5kg', guide: 'Kéo lưới nhẹ nhàng, sục khí vận chuyển sống tươi.', material: 'Thùng sục khí chuyên dụng' }
      ]
    }
  ]);

  onSearchChange(kw: string) {
    this.searchKeyword.set(kw);
    this.currentPage.set(1);
  }

  filteredProcesses = computed(() => {
    const kw = this.searchKeyword().toLowerCase().trim();
    if (!kw) return this.processes();
    return this.processes().filter(p =>
      p.name.toLowerCase().includes(kw) ||
      p.season.toLowerCase().includes(kw) ||
      p.standard.toLowerCase().includes(kw)
    );
  });

  paginatedProcesses = computed(() => {
    const list = this.filteredProcesses();
    const start = (this.currentPage() - 1) * this.pageSize();
    return list.slice(start, start + this.pageSize());
  });

  openAddModal() {
    if (!this.state.canEditProcess()) {
      this.toast.warning('Giới hạn phân quyền', 'Chỉ Kỹ sư Nông nghiệp và Quản trị viên mới có quyền tạo quy trình kỹ thuật.');
      return;
    }
    this.isEdit.set(false);
    this.activeProcess = {
      id: '',
      name: `Quy trình ${this.state.currentHtx().primaryProduct} Chuẩn Nông Nghiệp`,
      season: 'Vụ Xuân 2027',
      farmingType: (this.state.currentHtx().farmingType === 'general' ? 'crop' : this.state.currentHtx().farmingType) as 'crop' | 'livestock' | 'aquaculture',
      totalDays: 105,
      stepsCount: 3,
      updatedDate: 'Hôm nay',
      standard: 'VietGAP & OCOP 4 sao',
      steps: [
        { day: 'Giai đoạn 1 (Ngày 1 - 10)', title: 'Chuẩn bị giống & xử lý sinh học', guide: 'Khử trùng nguồn giống F1 bằng vi sinh.', material: 'Giống chuẩn nguyên chủng' },
        { day: 'Giai đoạn 2 (Ngày 11 - 80)', title: 'Chăm sóc hữu cơ & phòng dịch sinh học', guide: 'Bón phân hữu cơ vi sinh, ghi chép nhật ký số.', material: 'Phân vi sinh Quế Lâm' },
        { day: 'Giai đoạn 3 (Ngày 81 - 105)', title: 'Cách ly an toàn & thu hoạch', guide: 'Đảm bảo thời gian cách ly PHI, dán tem QR.', material: 'Tem nhãn mã QR' }
      ]
    };
    this.showModal.set(true);
  }

  openEditModal(p: ProcessItem) {
    if (!this.state.canEditProcess()) {
      this.toast.warning('Giới hạn phân quyền', 'Xã viên chỉ có quyền xem quy trình, không được chỉnh sửa quy trình chuẩn.');
      return;
    }
    this.isEdit.set(true);
    this.activeProcess = {
      ...p,
      steps: p.steps.map(s => ({ ...s }))
    };
    this.showModal.set(true);
  }

  addStep() {
    this.activeProcess.steps.push({
      day: `Giai đoạn ${this.activeProcess.steps.length + 1}`,
      title: '',
      guide: '',
      material: ''
    });
  }

  removeStep(idx: number) {
    this.activeProcess.steps.splice(idx, 1);
  }

  saveProcess(e: Event) {
    e.preventDefault();
    if (!this.activeProcess.name.trim()) return;

    if (this.isEdit()) {
      this.processes.update(list =>
        list.map(p => p.id === this.activeProcess.id ? { ...this.activeProcess, stepsCount: this.activeProcess.steps.length, updatedDate: 'Hôm nay' } : p)
      );
      this.toast.success('Cập nhật quy trình', `Đã lưu thay đổi cho quy trình "${this.activeProcess.name}".`);
    } else {
      const newP: ProcessItem = {
        ...this.activeProcess,
        id: 'p-' + Date.now().toString(36),
        stepsCount: this.activeProcess.steps.length,
        updatedDate: 'Hôm nay'
      };
      this.processes.update(list => [newP, ...list]);
      this.toast.success('Tạo quy trình thành công', `Đã lưu "${newP.name}" vào cơ sở dữ liệu HTX.`);
    }
    this.showModal.set(false);
  }

  cloneProcess(p: ProcessItem) {
    if (!this.state.canEditProcess()) {
      this.toast.warning('Giới hạn phân quyền', 'Chỉ Kỹ sư Nông nghiệp mới có quyền nhân bản quy trình mùa vụ.');
      return;
    }
    const cloned: ProcessItem = {
      ...p,
      id: 'p-' + Date.now().toString(36),
      name: `${p.name} (Nhân bản Vụ Mới 2027)`,
      season: 'Vụ Xuân 2027',
      updatedDate: 'Vừa nhân bản',
      steps: p.steps.map(s => ({ ...s }))
    };
    this.processes.update(list => [cloned, ...list]);
    this.toast.success(
      'Nhân bản quy trình thành công!',
      `Đã sao chép toàn bộ ${p.steps.length} bước kỹ thuật của "${p.name}" sang vụ mùa tiếp theo.`
    );
  }

  confirmDelete(p: ProcessItem) {
    if (!this.state.canEditProcess()) {
      this.toast.warning('Giới hạn phân quyền', 'Chỉ Kỹ sư Nông nghiệp và Quản trị viên mới có quyền xóa quy trình.');
      return;
    }
    this.processToDelete = p;
    this.showDeleteModal.set(true);
  }

  executeDelete() {
    if (!this.processToDelete) return;
    const name = this.processToDelete.name;
    this.processes.update(list => list.filter(p => p.id !== this.processToDelete?.id));
    this.showDeleteModal.set(false);
    this.toast.danger('Đã xóa quy trình', `Đã xóa "${name}" khỏi danh sách.`);
  }
}
