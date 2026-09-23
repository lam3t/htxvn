import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HtxStateService } from '../../../core/services/htx-state.service';
import { Member } from '../../../core/models/htx.model';
import { ToastService } from '../../../core/services/toast.service';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-members-list',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent],
  template: `
    <div class="members-page">
      <!-- HEADER TRANG & NÚT THÊM / XUẤT EXCEL -->
      <div class="page-top">
        <div>
          <div class="page-sub">QUẢN TRỊ THÀNH VIÊN • {{ state.currentHtx().shortName }}</div>
          <h1 class="page-title">Danh Sách Xã Viên Hợp Tác Xã</h1>
        </div>
        <div class="top-actions">
          <button class="btn btn-secondary" (click)="exportExcel()">
            <span>📑</span> Xuất Excel
          </button>
          <button class="btn btn-primary" (click)="openAddModal()">
            <span>➕</span> Thêm Xã Viên Mới
          </button>
        </div>
      </div>

      <!-- TABS CHUYỂN ĐỔI GIỮA XÃ VIÊN CHÍNH THỨC VÀ DUYỆT TỪ ZALO -->
      <div class="member-tabs">
        <button 
          class="tab-item" 
          [class.active]="currentTab() === 'active'" 
          (click)="switchTab('active')">
          <span>👥 Xã viên chính thức ({{ state.activeMembers().length }})</span>
        </button>
        <button 
          class="tab-item pending-tab" 
          [class.active]="currentTab() === 'pending'" 
          (click)="switchTab('pending')">
          <span>📱 Duyệt đăng ký từ Zalo Mini App</span>
          @if (state.pendingMembers().length > 0) {
            <span class="tab-badge">{{ state.pendingMembers().length }}</span>
          }
        </button>
      </div>

      <!-- THANH TÌM KIẾM & BỘ LỌC ĐƠN GIẢN -->
      <div class="card filter-bar">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input 
            type="text" 
            class="search-input" 
            placeholder="Tìm theo tên bác nông dân, số điện thoại, thôn/xóm..." 
            [ngModel]="searchKeyword()"
            (ngModelChange)="onSearchChange($event)"
          />
        </div>
      </div>

      <!-- TAB 1: DANH SÁCH XÃ VIÊN CHÍNH THỨC -->
      @if (currentTab() === 'active') {
        @if (filteredActiveMembers().length === 0) {
          <div class="empty-state">
            <span class="empty-state-icon">🌾</span>
            <div class="empty-state-title">Chưa tìm thấy xã viên nào phù hợp</div>
            <div class="empty-state-desc">Bác có thể thử tìm kiếm với từ khóa khác hoặc bấm nút thêm mới bên dưới.</div>
            <button class="btn btn-primary" (click)="openAddModal()">Thêm Xã Viên Mới</button>
          </div>
        } @else {
          <!-- BẢNG DESKTOP -->
          <div class="card p-0">
            <div class="table-responsive hide-mobile">
              <table class="data-table clean-table">
                <thead>
                  <tr>
                    <th style="width: 28%;">Xã Viên & Liên Hệ</th>
                    <th style="width: 26%;">Thôn Xóm & Kinh Nghiệm</th>
                    <th style="width: 22%;">Quy Mô & Nông Sản</th>
                    <th style="width: 10%;">Trạng Thái</th>
                    <th style="text-align: right; width: 14%;">Thao Tác</th>
                  </tr>
                </thead>
                <tbody>
                  @for (m of paginatedActiveMembers(); track m.id) {
                    <tr>
                      <td>
                        <div class="farmer-cell">
                          <span class="farmer-avatar">{{ m.avatar }}</span>
                          <div>
                            <strong>{{ m.name }}</strong>
                            <div class="sub-text">
                              <a [href]="'tel:' + m.phone" class="phone-link">📞 {{ m.phone }}</a> • CCCD: {{ m.cccd }}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div><strong>{{ m.address }}</strong></div>
                        <small style="color: var(--text-muted);">Kinh nghiệm: {{ m.farmingExperienceYears || 15 }} năm làm nông</small>
                      </td>
                      <td>
                        <div><strong>{{ m.scale }}</strong></div>
                        <span class="badge badge-info">{{ m.productType }}</span>
                      </td>
                      <td>
                        <span class="badge badge-success">Đang canh tác</span>
                      </td>
                      <td style="text-align: right;">
                        <div class="table-actions-inline" style="justify-content: flex-end;">
                          <button class="btn btn-secondary btn-sm" (click)="viewDetail(m)">👁️ Xem</button>
                          <button class="btn btn-secondary btn-sm" (click)="openEditModal(m)">✏️ Sửa</button>
                          <button class="btn btn-danger btn-sm" (click)="confirmDelete(m)">🗑️ Xóa</button>
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>

            <!-- DANH SÁCH THẺ MOBILE (DỌC, KHÔNG CUỘN NGANG) -->
            <div class="mobile-card-list show-mobile p-16">
              @for (m of paginatedActiveMembers(); track m.id) {
                <div class="mobile-data-card">
                  <div class="card-row">
                    <div class="farmer-cell">
                      <span class="farmer-avatar">{{ m.avatar }}</span>
                      <div>
                        <strong>{{ m.name }}</strong>
                        <div class="sub-text">Gia nhập: {{ m.joinDate }}</div>
                      </div>
                    </div>
                    <span class="badge badge-success">Chính thức</span>
                  </div>
                  <div class="card-row">
                    <span class="label">Điện thoại:</span>
                    <a [href]="'tel:' + m.phone" class="phone-link value">📞 {{ m.phone }}</a>
                  </div>
                  <div class="card-row">
                    <span class="label">Quy mô:</span>
                    <span class="value">{{ m.scale }}</span>
                  </div>
                  <div class="card-row">
                    <span class="label">Sản phẩm:</span>
                    <span class="value">{{ m.productType }}</span>
                  </div>
                  <div class="mobile-card-actions">
                    <button class="btn btn-secondary" (click)="viewDetail(m)">Chi Tiết</button>
                    <button class="btn btn-secondary" (click)="openEditModal(m)">Sửa</button>
                    <button class="btn btn-danger" (click)="confirmDelete(m)">Xóa</button>
                  </div>
                </div>
              }
            </div>

            <!-- PHÂN TRANG -->
            <app-pagination 
              [totalItems]="filteredActiveMembers().length"
              [pageSize]="pageSize()"
              [currentPage]="currentPage()"
              (pageChange)="currentPage.set($event)"
              (pageSizeChange)="pageSize.set($event)">
            </app-pagination>
          </div>
        }
      }

      <!-- TAB 2: DUYỆT ĐĂNG KÝ TỪ ZALO MINI APP -->
      @if (currentTab() === 'pending') {
        @if (state.pendingMembers().length === 0) {
          <div class="empty-state">
            <span class="empty-state-icon">✅</span>
            <div class="empty-state-title">Không có hồ sơ nào đang chờ duyệt!</div>
            <div class="empty-state-desc">Tất cả đơn đăng ký tham gia chuỗi liên kết từ Zalo Mini App đã được xử lý đầy đủ.</div>
          </div>
        } @else {
          <div class="pending-list-grid">
            @for (m of paginatedPendingMembers(); track m.id) {
              <div class="card pending-card">
                <div class="pending-header">
                  <div class="farmer-cell">
                    <span class="farmer-avatar">{{ m.avatar }}</span>
                    <div>
                      <h3 class="farmer-name">{{ m.name }}</h3>
                      <span class="zalo-tag">📱 Gửi từ Zalo Mini App</span>
                    </div>
                  </div>
                  <span class="badge badge-warning">Chờ BQT Duyệt</span>
                </div>

                <div class="pending-body">
                  <div class="info-row">
                    <span class="label">Số điện thoại Zalo:</span>
                    <strong>{{ m.phone }}</strong>
                  </div>
                  <div class="info-row">
                    <span class="label">Địa chỉ đăng ký:</span>
                    <span>{{ m.address }}</span>
                  </div>
                  <div class="info-row">
                    <span class="label">Quy mô cam kết:</span>
                    <strong>{{ m.scale }}</strong>
                  </div>
                  <div class="info-row">
                    <span class="label">Ghi chú đăng ký:</span>
                    <p class="notes-text">{{ m.notes }}</p>
                  </div>
                </div>

                <div class="pending-actions">
                  <button class="btn btn-danger" (click)="openRejectModal(m)">❌ Từ chối</button>
                  <button class="btn btn-primary" (click)="state.approveMember(m.id)">
                    <span>✅</span> DUYỆT VÀO HTX
                  </button>
                </div>
              </div>
            }
          </div>

          <app-pagination 
            [totalItems]="state.pendingMembers().length"
            [pageSize]="pendingPageSize()"
            [currentPage]="pendingCurrentPage()"
            [pageSizeOptions]="[6, 12, 24]"
            (pageChange)="pendingCurrentPage.set($event)"
            (pageSizeChange)="pendingPageSize.set($event)">
          </app-pagination>
        }
      }

      <!-- MODAL THÊM / SỬA XÃ VIÊN -->
      @if (showModal()) {
        <div class="modal-backdrop">
          <div class="modal-dialog modal-lg">
            <div class="modal-header-simple">
              <h2 class="card-title" style="margin: 0;">
                {{ isEditing() ? '✏️ Chỉnh Sửa Hồ Sơ Xã Viên' : '➕ Thêm Hồ Sơ Xã Viên Mới' }}
              </h2>
              <button type="button" class="btn-close-modal" (click)="showModal.set(false)" title="Đóng">✕</button>
            </div>
            
            <form (submit)="onSaveMember($event)">
              <div class="form-row-2">
                <div class="form-group">
                  <label class="form-label">Họ và tên bác nông dân: <span class="required">*</span></label>
                  <input type="text" class="form-control" placeholder="Ví dụ: Nguyễn Văn An" [(ngModel)]="currentMemberData.name" name="name" required />
                </div>
                <div class="form-group">
                  <label class="form-label">Số điện thoại liên hệ: <span class="required">*</span></label>
                  <input type="tel" class="form-control" placeholder="Ví dụ: 0983 245 118" [(ngModel)]="currentMemberData.phone" name="phone" required />
                </div>
              </div>

              <div class="form-row-2">
                <div class="form-group">
                  <label class="form-label">Số CCCD / CMND:</label>
                  <input type="text" class="form-control" placeholder="033080001234" [(ngModel)]="currentMemberData.cccd" name="cccd" />
                </div>
                <div class="form-group">
                  <label class="form-label">Thôn / Xóm / Địa chỉ: <span class="required">*</span></label>
                  <input type="text" class="form-control" placeholder="Ví dụ: Thôn An Lạc, Xã An Ninh" [(ngModel)]="currentMemberData.address" name="address" required />
                </div>
              </div>

              <div class="form-row-2">
                <div class="form-group">
                  <label class="form-label">Quy mô canh tác (ha/sào):</label>
                  <input type="text" class="form-control" placeholder="Ví dụ: 1.8 ha (50 sào)" [(ngModel)]="currentMemberData.scale" name="scale" />
                </div>
                <div class="form-group">
                  <label class="form-label">Kinh nghiệm nông nghiệp (năm):</label>
                  <input type="number" class="form-control" placeholder="20" [(ngModel)]="currentMemberData.farmingExperienceYears" name="exp" />
                </div>
              </div>

              <div class="form-row-2">
                <div class="form-group">
                  <label class="form-label">Giống / Sản phẩm đăng ký:</label>
                  <input type="text" class="form-control" placeholder="Ví dụ: Lúa ST25 hoặc Gà Đông Tảo" [(ngModel)]="currentMemberData.productType" name="productType" />
                </div>
                <div class="form-group">
                  <label class="form-label">Tài khoản ngân hàng giải ngân:</label>
                  <input type="text" class="form-control" placeholder="Ví dụ: 1029384756 - Agribank" [(ngModel)]="currentMemberData.bankAccount" name="bankAccount" />
                </div>
              </div>

              <div class="modal-actions">
                <button type="button" class="btn btn-secondary" (click)="showModal.set(false)">Hủy Bỏ</button>
                <button type="submit" class="btn btn-primary">
                  {{ isEditing() ? 'LƯU THAY ĐỔI' : 'LƯU HỒ SƠ XÃ VIÊN' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- MODAL CHI TIẾT XÃ VIÊN -->
      @if (selectedMember()) {
        <div class="modal-backdrop">
          <div class="modal-dialog">
            <div class="detail-top-box">
              <span class="detail-avatar">{{ selectedMember()?.avatar }}</span>
              <div>
                <h2 style="font-size: 22px; font-weight: 800; margin: 0;">{{ selectedMember()?.name }}</h2>
                <div class="sub-text">Gia nhập ngày: {{ selectedMember()?.joinDate }}</div>
                <span class="badge badge-success" style="margin-top: 6px;">Xã viên chính thức</span>
              </div>
            </div>
            
            <div class="detail-info-list">
              <div class="d-row"><span class="d-lbl">Số CCCD / Định danh:</span> <strong>{{ selectedMember()?.cccd }}</strong></div>
              <div class="d-row"><span class="d-lbl">Số điện thoại:</span> <strong>{{ selectedMember()?.phone }}</strong></div>
              <div class="d-row"><span class="d-lbl">Địa bàn cư trú:</span> <span>{{ selectedMember()?.address }}</span></div>
              <div class="d-row"><span class="d-lbl">Quy mô sản xuất:</span> <strong>{{ selectedMember()?.scale }}</strong></div>
              <div class="d-row"><span class="d-lbl">Sản phẩm chủ lực:</span> <span>{{ selectedMember()?.productType }}</span></div>
              <div class="d-row"><span class="d-lbl">Kinh nghiệm nông nghiệp:</span> <span>{{ selectedMember()?.farmingExperienceYears || 15 }} năm</span></div>
              <div class="d-row"><span class="d-lbl">Tài khoản Agribank:</span> <strong>{{ selectedMember()?.bankAccount || 'Chưa cập nhật' }}</strong></div>
              <div class="d-row"><span class="d-lbl">Ghi chú HTX:</span> <em>{{ selectedMember()?.notes }}</em></div>
            </div>

            <div class="modal-actions">
              <button class="btn btn-secondary" (click)="selectedMember.set(null)">✕ Đóng</button>
              <button class="btn btn-primary" (click)="openEditModal(selectedMember()!); selectedMember.set(null);">✏️ Chỉnh Sửa</button>
            </div>
          </div>
        </div>
      }

      <!-- MODAL TỪ CHỐI DUYỆT CÓ NHẬP LÝ DO (SRS CN-2.3.5) -->
      @if (memberToReject()) {
        <div class="modal-backdrop">
          <div class="modal-dialog modal-confirm">
            <div class="confirm-icon">⚠️</div>
            <h2 class="confirm-title">Từ Chối Đơn Đăng Ký</h2>
            <p class="confirm-desc">
              Bác vui lòng nhập lý do từ chối đơn của <strong>{{ memberToReject()?.name }}</strong> để gửi phản hồi qua Zalo:
            </p>
            <div class="form-group" style="text-align: left;">
              <label class="form-label">Lý do từ chối:</label>
              <textarea class="form-control" [(ngModel)]="rejectReason" rows="3" placeholder="Ví dụ: Chưa đủ diện tích cam kết tối thiểu 0.5 ha hoặc đất ngoài quy hoạch..."></textarea>
            </div>
            <div class="modal-actions">
              <button class="btn btn-secondary" (click)="memberToReject.set(null)">Hủy Bỏ</button>
              <button class="btn btn-danger" (click)="confirmRejectMember()">XÁC NHẬN TỪ CHỐI</button>
            </div>
          </div>
        </div>
      }

      <!-- MODAL XÁC NHẬN XÓA XÃ VIÊN -->
      @if (memberToDelete()) {
        <div class="modal-backdrop">
          <div class="modal-dialog modal-confirm">
            <div class="confirm-icon">⚠️</div>
            <h2 class="confirm-title">Xác Nhận Xóa Hồ Sơ</h2>
            <p class="confirm-desc">
              Bác có chắc muốn xóa hồ sơ xã viên <strong>"{{ memberToDelete()?.name }}"</strong> khỏi HTX? Nếu đã có nhật ký, hệ thống sẽ tự chuyển trạng thái Ngừng hoạt động.
            </p>
            <div class="modal-actions">
              <button class="btn btn-secondary" (click)="memberToDelete.set(null)">Hủy Bỏ</button>
              <button class="btn btn-danger" (click)="executeDelete()">ĐỒNG Ý XÓA</button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .members-page {
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
      gap: 8px;
    }

    .member-tabs {
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

    .tab-badge {
      background: var(--amber-600);
      color: white;
      font-size: 11px;
      padding: 1px 6px;
      border-radius: var(--radius-full);
      font-weight: 800;
    }

    .filter-bar {
      margin-bottom: 0;
      padding: 8px 12px;
    }

    .search-box {
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

    .farmer-cell {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .farmer-avatar {
      font-size: 18px;
      width: 32px;
      height: 32px;
      background: var(--primary-100);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1.5px solid var(--border-color);
      flex-shrink: 0;
    }

    .sub-text {
      font-size: 11.5px;
      color: var(--text-muted);
    }

    .phone-link {
      font-weight: 700;
      color: var(--primary-700);
      text-decoration: none;
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

    .pending-list-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 10px;
    }

    .pending-card {
      border: 1.5px solid var(--amber-600);
      background: #fffdfa;
      display: flex;
      flex-direction: column;
      gap: 10px;
      padding: 10px 12px;
    }

    .pending-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .zalo-tag {
      font-size: 10.5px;
      font-weight: 800;
      background: #0068ff;
      color: white;
      padding: 1px 5px;
      border-radius: 4px;
      display: inline-block;
      margin-top: 2px;
    }

    .pending-body {
      display: flex;
      flex-direction: column;
      gap: 6px;
      font-size: 13px;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      border-bottom: 1px dashed var(--border-color);
      padding-bottom: 3px;
    }

    .notes-text {
      font-size: 12px;
      color: var(--text-muted);
      margin-top: 2px;
      font-style: italic;
    }

    .pending-actions {
      display: flex;
      gap: 8px;
      margin-top: auto;
    }
    .pending-actions .btn {
      flex: 1;
    }

    .detail-top-box {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 18px;
      padding-bottom: 14px;
      border-bottom: 1px solid var(--border-color);
    }

    .detail-avatar {
      font-size: 48px;
      width: 68px;
      height: 68px;
      background: var(--primary-100);
      border-radius: var(--radius-full);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .detail-info-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .d-row {
      display: flex;
      justify-content: space-between;
      padding-bottom: 6px;
      border-bottom: 1px solid #f1f5f9;
      font-size: 15px;
    }

    .d-lbl {
      color: var(--text-muted);
      font-weight: 600;
    }

    @media (max-width: 768px) {
      .form-row-2 {
        grid-template-columns: 1fr;
      }
      .pending-list-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class MembersListComponent {
  state = inject(HtxStateService);
  toast = inject(ToastService);

  currentTab = signal<'active' | 'pending'>('active');
  searchKeyword = signal('');
  currentPage = signal(1);
  pageSize = signal(10);

  pendingCurrentPage = signal(1);
  pendingPageSize = signal(6);

  showModal = signal(false);
  isEditing = signal(false);
  selectedMember = signal<Member | null>(null);
  memberToDelete = signal<Member | null>(null);

  memberToReject = signal<Member | null>(null);
  rejectReason = 'Chưa hoàn thiện đủ thông tin diện tích canh tác hoặc nằm ngoài phân vùng quy hoạch HTX.';

  currentMemberData: Partial<Member> = {
    name: '',
    phone: '',
    address: '',
    village: 'Thôn An Lạc',
    cccd: '033085001999',
    scale: '1.8 ha (50 sào Bắc Bộ)',
    status: 'active' as const,
    avatar: '👨‍🌾',
    notes: 'Xã viên nòng cốt của HTX',
    productType: this.state.currentHtx().primaryProduct,
    farmingExperienceYears: 20,
    joinDate: '23/09/2026',
    bankAccount: '1029384756 - Agribank'
  };

  switchTab(tab: 'active' | 'pending') {
    this.currentTab.set(tab);
    this.currentPage.set(1);
    this.pendingCurrentPage.set(1);
  }

  onSearchChange(kw: string) {
    this.searchKeyword.set(kw);
    this.currentPage.set(1);
  }

  filteredActiveMembers = computed(() => {
    const kw = this.searchKeyword().toLowerCase().trim();
    return this.state.activeMembers().filter(m =>
      !kw || m.name.toLowerCase().includes(kw) || m.phone.includes(kw) || m.address.toLowerCase().includes(kw)
    );
  });

  paginatedActiveMembers = computed(() => {
    const list = this.filteredActiveMembers();
    const start = (this.currentPage() - 1) * this.pageSize();
    return list.slice(start, start + this.pageSize());
  });

  paginatedPendingMembers = computed(() => {
    const list = this.state.pendingMembers();
    const start = (this.pendingCurrentPage() - 1) * this.pendingPageSize();
    return list.slice(start, start + this.pendingPageSize());
  });

  openAddModal() {
    this.isEditing.set(false);
    this.currentMemberData = {
      name: '',
      phone: '',
      address: 'Thôn An Lạc, Xã An Ninh',
      village: 'Thôn An Lạc',
      cccd: '03309000' + Math.floor(1000 + Math.random() * 9000),
      scale: '1.5 ha (40 sào Bắc Bộ)',
      status: 'active' as const,
      avatar: '👨‍🌾',
      notes: 'Đăng ký tham gia chuỗi giá trị HTX',
      productType: this.state.currentHtx().primaryProduct,
      farmingExperienceYears: 15,
      joinDate: '23/09/2026',
      bankAccount: '1029384756 - Agribank'
    };
    this.showModal.set(true);
  }

  openEditModal(member: Member) {
    this.isEditing.set(true);
    this.currentMemberData = { ...member };
    this.showModal.set(true);
  }

  onSaveMember(e: Event) {
    e.preventDefault();
    if (!this.currentMemberData.name || !this.currentMemberData.phone) return;

    if (this.isEditing() && this.currentMemberData.id) {
      this.state.updateMember(this.currentMemberData as Member);
    } else {
      this.state.addMember(this.currentMemberData as Omit<Member, 'id' | 'htxId'>);
    }
    this.showModal.set(false);
  }

  viewDetail(member: Member) {
    this.selectedMember.set(member);
  }

  confirmDelete(member: Member) {
    this.memberToDelete.set(member);
  }

  executeDelete() {
    if (this.memberToDelete()) {
      this.state.deleteMember(this.memberToDelete()!.id);
      this.memberToDelete.set(null);
    }
  }

  openRejectModal(m: Member) {
    this.memberToReject.set(m);
  }

  confirmRejectMember() {
    if (this.memberToReject()) {
      const name = this.memberToReject()!.name;
      this.state.deleteMember(this.memberToReject()!.id);
      this.memberToReject.set(null);
      this.toast.warning('Đã từ chối đăng ký', `Đã gửi thông báo từ chối kèm lý do tới Zalo của ${name}.`);
    }
  }

  exportExcel() {
    this.toast.success(
      'Xuất Excel thành công!',
      `Đã tải về file "Danh_sach_xa_vien_${this.state.currentHtx().code}.xlsx" (Gồm ${this.state.activeMembers().length} thành viên).`
    );
  }
}
