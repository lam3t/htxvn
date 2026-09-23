import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HtxStateService } from '../../core/services/htx-state.service';
import { ToastService } from '../../core/services/toast.service';
import { HTXInfo, FarmingType } from '../../core/models/htx.model';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-htx-management',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent],
  template: `
    <div class="htx-mgmt-page">
      <!-- HEADER TRANG -->
      <div class="page-top">
        <div>
          <div class="page-sub">HỆ THỐNG QUẢN TRỊ NÔNG NGHIỆP TỈNH HƯNG YÊN</div>
          <h1 class="page-title">Mạng Lưới 03 Hợp Tác Xã Thí Điểm</h1>
          <p class="page-intro">Bác chọn HTX để vào làm việc hoặc bấm "Thêm HTX" để cập nhật hợp tác xã mới vào hệ thống.</p>
        </div>
        @if (state.canManageAllHtx()) {
          <button class="btn btn-primary btn-lg" (click)="openAddModal()">
            <span>➕</span> Thêm Hợp Tác Xã Mới
          </button>
        }
      </div>

      <!-- DẢI BANNER NỔI BẬT: HTX ĐANG TRỰC TIẾP LÀM VIỆC HIỆN TẠI -->
      <div class="active-workspace-hero-banner">
        <div class="banner-left">
          <div class="pulse-indicator">
            <span class="live-dot-lg">●</span>
          </div>
          <div>
            <div class="banner-tag">KHÔNG GIAN LÀM VIỆC HIỆN TẠI TRÊN TOÀN BỘ PHẦN MỀM:</div>
            <div class="banner-htx-name">
              <span class="b-logo">{{ state.currentHtx().logo }}</span>
              {{ state.currentHtx().name }}
            </div>
            <div class="banner-meta">
              📍 Trụ sở: <strong>{{ state.currentHtx().district }}</strong> ({{ state.currentHtx().address }}) • 
              🌾 Nông sản: <strong>{{ state.currentHtx().primaryProduct }}</strong> • 
              ⭐ <span class="badge badge-success">{{ state.currentHtx().ocopLevel }}</span>
            </div>
          </div>
        </div>
        <div class="banner-right">
          <button class="btn btn-primary" (click)="goToDashboard()">
            <span>📊</span> Vào Bàn Làm Việc Của HTX Này ➔
          </button>
        </div>
      </div>

      <!-- TỔNG HỢP NĂNG LỰC MẠNG LƯỚI HTX -->
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-header">
            <span class="kpi-title">Hợp Tác Xã</span>
            <span class="kpi-icon">🏢</span>
          </div>
          <div class="kpi-value">{{ state.cooperatives().length }} <span class="unit">HTX</span></div>
          <span class="status-pill green">✓ 3 HTX Thí Điểm</span>
        </div>

        <div class="kpi-card">
          <div class="kpi-header">
            <span class="kpi-title">Tổng Xã Viên</span>
            <span class="kpi-icon">👥</span>
          </div>
          <div class="kpi-value">{{ totalMembersAll() }} <span class="unit">hộ dân</span></div>
          <span class="status-pill amber">Đang sản xuất chuỗi</span>
        </div>

        <div class="kpi-card">
          <div class="kpi-header">
            <span class="kpi-title">Tổng Quy Mô</span>
            <span class="kpi-icon">📐</span>
          </div>
          <div class="kpi-value">{{ totalAreaAll() | number:'1.1-1' }} <span class="unit">héc-ta</span></div>
          <span class="status-pill blue">Cấp mã số vùng trồng</span>
        </div>

        <div class="kpi-card">
          <div class="kpi-header">
            <span class="kpi-title">Chứng Nhận</span>
            <span class="kpi-icon">⭐</span>
          </div>
          <div class="kpi-value">100% <span class="unit">đạt chuẩn</span></div>
          <span class="status-pill purple">OCOP 4 sao & VietGAP</span>
        </div>
      </div>

      <!-- THANH TÌM KIẾM & CHỌN CHẾ ĐỘ XEM -->
      <div class="card p-16 filter-bar-simple">
        <div class="filter-left">
          <input 
            type="text" 
            class="form-control" 
            placeholder="🔍 Tìm nhanh theo tên HTX, huyện, người đại diện..." 
            [ngModel]="searchKeyword()" 
            (ngModelChange)="onSearchChange($event)"
          />
        </div>
        <div class="view-toggle-group">
          <button 
            type="button" 
            class="btn btn-sm" 
            [class.btn-primary]="viewMode() === 'cards'" 
            [class.btn-secondary]="viewMode() !== 'cards'"
            (click)="viewMode.set('cards')">
            🗂️ Dạng Thẻ To Rõ
          </button>
          <button 
            type="button" 
            class="btn btn-sm" 
            [class.btn-primary]="viewMode() === 'table'" 
            [class.btn-secondary]="viewMode() !== 'table'"
            (click)="viewMode.set('table')">
            📋 Dạng Danh Sách Gọn
          </button>
        </div>
      </div>

      <!-- 1. DẠNG THẺ TO RÕ DỄ DÙNG CHO NÔNG DÂN -->
      @if (viewMode() === 'cards') {
        <div class="htx-cards-container">
          @if (filteredHtxList().length === 0) {
            <div class="card empty-box">
              <span class="empty-icon">🔍</span>
              <h3>Không tìm thấy Hợp tác xã nào</h3>
              <p>Bác hãy xóa từ khóa tìm kiếm hoặc kiểm tra lại nhé.</p>
            </div>
          }
          @for (h of paginatedHtxList(); track h.id) {
            <div class="card htx-item-card" [class.htx-selected-card]="state.selectedHtxId() === h.id">
              <!-- TOP RIBBON ĐÁNH DẤU TRẠNG THÁI -->
              @if (state.selectedHtxId() === h.id) {
                <div class="active-htx-top-ribbon">
                  <span class="live-dot">●</span> ĐANG TRỰC TIẾP QUẢN TRỊ & LÀM VIỆC VỚI HTX NÀY
                </div>
              }

              <!-- TOP CARD -->
              <div class="htx-card-top">
                <div class="htx-card-logo-wrap">
                  <span class="htx-card-logo">{{ h.logo }}</span>
                </div>
                <div class="htx-card-heading">
                  <div class="htx-card-badges">
                    <span class="badge" [ngClass]="getFarmingTypeClass(h.farmingType)">
                      {{ getFarmingTypeName(h.farmingType) }}
                    </span>
                    <span class="badge badge-success">{{ h.ocopLevel }}</span>
                  </div>
                  <h2 class="htx-card-name">{{ h.name }}</h2>
                  <div class="htx-card-subname">Tên thường gọi: <strong>{{ h.shortName }}</strong> • Mã: <span class="code-pill">{{ h.code }}</span></div>
                </div>
              </div>

              <!-- THÔNG TIN CHÍNH -->
              <div class="htx-card-body">
                <div class="info-row">
                  <span class="info-label">📍 Trụ sở HTX:</span>
                  <span class="info-value"><strong>{{ h.district }}</strong> — {{ h.address }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">👤 Đại diện pháp luật:</span>
                  <span class="info-value">
                    <strong>{{ h.representative }}</strong> • 
                    <a [href]="'tel:' + h.phone" class="phone-link">📞 {{ h.phone }}</a>
                  </span>
                </div>
                <div class="info-row">
                  <span class="info-label">🌾 Nông sản chủ lực:</span>
                  <span class="info-value"><strong class="highlight-product">{{ h.primaryProduct }}</strong></span>
                </div>
                <div class="info-row">
                  <span class="info-label">📊 Quy mô sản xuất:</span>
                  <span class="info-value"><strong>{{ h.totalMembers }} hộ xã viên</strong> liên kết trên <strong>{{ h.totalAreaHa }} héc-ta</strong></span>
                </div>
              </div>

              <!-- NÚT THAO TÁC THEO PHÂN QUYỀN RBAC -->
              <div class="htx-card-actions">
                @if (state.selectedHtxId() === h.id) {
                  <button class="btn btn-action-main btn-working" (click)="goToDashboard()">
                    ✅ Đang Làm Việc • Vào Bảng Điều Khiển ➔
                  </button>
                  @if (canEditThisHtx(h)) {
                    <button class="btn btn-secondary" (click)="openEditModal(h)">✏️ Sửa</button>
                  }
                  @if (state.canManageAllHtx()) {
                    <button class="btn btn-danger" (click)="confirmDelete(h)">🗑️ Xóa</button>
                  }
                } @else {
                  @if (state.canSwitchHtx()) {
                    <button class="btn btn-action-main btn-primary" (click)="switchToHtx(h)">
                      👉 Chuyển Sang Làm Việc Với HTX Này
                    </button>
                    <button class="btn btn-secondary" (click)="openEditModal(h)">✏️ Sửa</button>
                    <button class="btn btn-danger" (click)="confirmDelete(h)">🗑️ Xóa</button>
                  } @else {
                    <button class="btn btn-action-main btn-secondary" style="cursor: not-allowed; opacity: 0.8;" (click)="showScopeWarning(h)">
                      🔒 HTX Khác (Tài khoản chỉ thao tác tại {{ state.currentHtx().shortName }})
                    </button>
                  }
                }
              </div>
            </div>
          }
        </div>
      }

      <!-- 2. DẠNG BẢNG GỌN KHÔNG BỊ TRÀN NGANG -->
      @if (viewMode() === 'table') {
        <div class="card p-0">
          <div class="table-responsive">
            <table class="data-table clean-table">
              <thead>
                <tr>
                  <th style="width: 32%;">Hợp Tác Xã & Lĩnh Vực</th>
                  <th style="width: 25%;">Trụ Sở & Người Đại Diện</th>
                  <th style="width: 23%;">Quy Mô & Nông Sản</th>
                  <th style="text-align: right; width: 20%;">Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                @if (paginatedHtxList().length === 0) {
                  <tr>
                    <td colspan="4" style="text-align: center; padding: 32px; color: var(--text-muted);">
                      Không tìm thấy Hợp tác xã nào phù hợp với từ khóa "{{ searchKeyword() }}".
                    </td>
                  </tr>
                }
                @for (h of paginatedHtxList(); track h.id) {
                  <tr [class.active-row]="state.selectedHtxId() === h.id">
                    <td>
                      <div class="htx-name-cell">
                        <span class="htx-logo-sm">{{ h.logo }}</span>
                        <div>
                          <strong>{{ h.name }}</strong>
                          @if (state.selectedHtxId() === h.id) {
                            <span class="badge badge-active-status" style="margin-left: 6px;">● ĐANG LÀM VIỆC</span>
                          }
                          <div class="sub-text">
                            <span class="code-pill">{{ h.code }}</span> • 
                            <span class="badge" [ngClass]="getFarmingTypeClass(h.farmingType)">{{ getFarmingTypeName(h.farmingType) }}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div><strong>{{ h.representative }}</strong> (<a [href]="'tel:' + h.phone" class="phone-link">{{ h.phone }}</a>)</div>
                      <small style="color: var(--text-muted);">{{ h.district }}, Hưng Yên</small>
                    </td>
                    <td>
                      <div><strong>{{ h.totalMembers }} hộ</strong> • {{ h.totalAreaHa }} ha</div>
                      <div class="highlight-product">{{ h.primaryProduct }}</div>
                    </td>
                    <td style="text-align: right;">
                      <div class="table-actions-inline" style="justify-content: flex-end;">
                        @if (state.selectedHtxId() === h.id) {
                          <button class="btn btn-sm btn-success-active" (click)="goToDashboard()">
                            ✓ Đang làm việc ➔
                          </button>
                          @if (canEditThisHtx(h)) {
                            <button class="btn btn-secondary btn-sm" (click)="openEditModal(h)">✏️ Sửa</button>
                          }
                          @if (state.canManageAllHtx()) {
                            <button class="btn btn-danger btn-sm" (click)="confirmDelete(h)">🗑️ Xóa</button>
                          }
                        } @else {
                          @if (state.canSwitchHtx()) {
                            <button class="btn btn-sm btn-primary" (click)="switchToHtx(h)">
                              👉 Chọn HTX này
                            </button>
                            <button class="btn btn-secondary btn-sm" (click)="openEditModal(h)">✏️ Sửa</button>
                            <button class="btn btn-danger btn-sm" (click)="confirmDelete(h)">🗑️ Xóa</button>
                          } @else {
                            <button class="btn btn-sm btn-secondary" style="opacity: 0.7;" (click)="showScopeWarning(h)">
                              🔒 Khác HTX
                            </button>
                          }
                        }
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <!-- PHÂN TRANG -->
      <app-pagination 
        [totalItems]="filteredHtxList().length"
        [pageSize]="pageSize()"
        [currentPage]="currentPage()"
        [itemName]="'hợp tác xã'"
        (pageChange)="currentPage.set($event)"
        (pageSizeChange)="pageSize.set($event)">
      </app-pagination>

      <!-- MODAL THÊM / SỬA HỢP TÁC XÃ -->
      @if (showModal()) {
        <div class="modal-backdrop">
          <div class="modal-dialog modal-lg">
            <div class="modal-header-simple">
              <h2 class="card-title" style="margin: 0;">
                {{ isEdit() ? '✏️ Chỉnh Sửa Thông Tin Hợp Tác Xã' : '🏢 Khởi Tạo Hợp Tác Xã Mới Vào Hệ Thống' }}
              </h2>
              <button type="button" class="btn-close-modal" (click)="showModal.set(false)" title="Đóng">✕</button>
            </div>
            
            <form (submit)="saveHTX($event)">
              <div class="form-row-2">
                <div class="form-group">
                  <label class="form-label">Tên đầy đủ Hợp tác xã: <span class="required">*</span></label>
                  <input type="text" class="form-control" placeholder="Ví dụ: HTX Nông nghiệp Công nghệ cao Phù Cừ" [(ngModel)]="activeHtx.name" name="name" required />
                </div>
                <div class="form-group">
                  <label class="form-label">Tên viết tắt / Thương hiệu: <span class="required">*</span></label>
                  <input type="text" class="form-control" placeholder="Ví dụ: HTX Phù Cừ" [(ngModel)]="activeHtx.shortName" name="shortName" required />
                </div>
              </div>

              <div class="form-row-2">
                <div class="form-group">
                  <label class="form-label">Mã định danh HTX: <span class="required">*</span></label>
                  <input type="text" class="form-control" placeholder="HTX-PC-HY" [(ngModel)]="activeHtx.code" name="code" required />
                </div>
                <div class="form-group">
                  <label class="form-label">Loại hình sản xuất:</label>
                  <select class="form-control" [(ngModel)]="activeHtx.farmingType" name="farmingType">
                    <option value="crop">🌾 Trồng trọt (Lúa, Cây ăn quả)</option>
                    <option value="livestock">🐓 Chăn nuôi (Gia cầm, Gia súc)</option>
                    <option value="aquaculture">🐟 Nuôi trồng Thủy sản</option>
                    <option value="general">🌳 Nông nghiệp Tổng hợp</option>
                  </select>
                </div>
              </div>

              <div class="form-row-2">
                <div class="form-group">
                  <label class="form-label">Địa bàn Huyện / Thị xã: <span class="required">*</span></label>
                  <input type="text" class="form-control" placeholder="Ví dụ: Huyện Phù Cừ" [(ngModel)]="activeHtx.district" name="district" required />
                </div>
                <div class="form-group">
                  <label class="form-label">Địa chỉ trụ sở chính: <span class="required">*</span></label>
                  <input type="text" class="form-control" placeholder="Xã Tam Đa, Huyện Phù Cừ, Hưng Yên" [(ngModel)]="activeHtx.address" name="address" required />
                </div>
              </div>

              <div class="form-row-2">
                <div class="form-group">
                  <label class="form-label">Chủ tịch / Giám đốc HTX: <span class="required">*</span></label>
                  <input type="text" class="form-control" placeholder="Họ và tên người đại diện..." [(ngModel)]="activeHtx.representative" name="rep" required />
                </div>
                <div class="form-group">
                  <label class="form-label">Số điện thoại liên hệ: <span class="required">*</span></label>
                  <input type="text" class="form-control" placeholder="0988 123 456" [(ngModel)]="activeHtx.phone" name="phone" required />
                </div>
              </div>

              <div class="form-row-2">
                <div class="form-group">
                  <label class="form-label">Tổng số thành viên (hộ):</label>
                  <input type="number" class="form-control" placeholder="30" [(ngModel)]="activeHtx.totalMembers" name="members" />
                </div>
                <div class="form-group">
                  <label class="form-label">Tổng diện tích canh tác (ha):</label>
                  <input type="number" step="0.1" class="form-control" placeholder="20.5" [(ngModel)]="activeHtx.totalAreaHa" name="area" />
                </div>
              </div>

              <div class="form-row-2">
                <div class="form-group">
                  <label class="form-label">Sản phẩm chủ lực OCOP: <span class="required">*</span></label>
                  <input type="text" class="form-control" placeholder="Ví dụ: Cam đường Canh OCOP" [(ngModel)]="activeHtx.primaryProduct" name="product" required />
                </div>
                <div class="form-group">
                  <label class="form-label">Hạng sao & Tiêu chuẩn:</label>
                  <input type="text" class="form-control" placeholder="OCOP 4 sao & VietGAP" [(ngModel)]="activeHtx.ocopLevel" name="ocop" />
                </div>
              </div>

              <div class="modal-actions">
                <button type="button" class="btn btn-secondary" (click)="showModal.set(false)">Hủy Bỏ</button>
                <button type="submit" class="btn btn-primary">
                  {{ isEdit() ? 'LƯU THAY ĐỔI HTX' : 'LƯU HỢP TÁC XÃ MỚI' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- MODAL XÁC NHẬN XÓA HTX -->
      @if (showDeleteModal()) {
        <div class="modal-backdrop">
          <div class="modal-dialog modal-confirm">
            <div class="confirm-icon">⚠️</div>
            <h2 class="confirm-title">Xác Nhận Xóa Hợp Tác Xã</h2>
            <p class="confirm-desc">
              Bác có chắc chắn muốn xóa Hợp tác xã <strong>"{{ htxToDelete?.name }}"</strong> khỏi hệ thống không?
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
    .htx-mgmt-page {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .p-0 { padding: 0 !important; }
    .p-20 { padding: 20px !important; }
    .p-16 { padding: 16px !important; }

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
      margin: 1px 0 2px;
    }

    .page-intro {
      font-size: 12.5px;
      color: var(--text-muted);
      margin: 0;
    }

    /* BANNER NỔI BẬT KHÔNG GIAN HTX ĐANG LÀM VIỆC */
    .active-workspace-hero-banner {
      background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
      border: 2px solid var(--primary-600);
      border-radius: var(--radius-md);
      padding: 14px 18px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      box-shadow: 0 4px 12px rgba(22, 101, 52, 0.12);
    }

    .banner-left {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .pulse-indicator {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .live-dot-lg {
      color: var(--primary-600);
      font-size: 24px;
      line-height: 1;
      animation: pulse 1.5s infinite;
    }

    .banner-tag {
      font-size: 11px;
      font-weight: 800;
      color: var(--primary-800);
      letter-spacing: 0.5px;
    }

    .banner-htx-name {
      font-size: 18px;
      font-weight: 800;
      color: var(--primary-950);
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 2px 0 4px;
    }

    .b-logo {
      font-size: 22px;
    }

    .banner-meta {
      font-size: 13px;
      color: var(--text-body);
    }

    .banner-right {
      flex-shrink: 0;
    }

    /* TOP RIBBON TRÊN THẺ HTX ĐANG CHỌN */
    .active-htx-top-ribbon {
      background: #15803d;
      color: #ffffff;
      font-size: 11.5px;
      font-weight: 800;
      padding: 5px 10px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      gap: 6px;
      letter-spacing: 0.3px;
      margin-bottom: 4px;
    }

    .live-dot {
      color: #86efac;
      font-size: 12px;
      animation: pulse 1.5s infinite;
    }

    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 10px;
    }

    .kpi-card {
      background: white;
      border: 1.5px solid var(--border-color);
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
    .status-pill.amber { background: #fef3c7; color: #92400e; }
    .status-pill.blue { background: #dbeafe; color: #1e40af; }
    .status-pill.purple { background: #f3e8ff; color: #6b21a8; }

    .filter-bar-simple {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 8px;
    }

    .filter-left {
      flex: 1;
      min-width: 200px;
    }

    .view-toggle-group {
      display: flex;
      gap: 4px;
    }

    /* CARDS VIEW */
    .htx-cards-container {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 10px;
    }

    .htx-item-card {
      border: 1.5px solid var(--border-color);
      border-radius: var(--radius-sm);
      padding: 12px 14px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      background: #ffffff;
      transition: all 0.2s ease-in-out;
      box-shadow: var(--shadow-sm);
    }

    .htx-item-card:hover {
      border-color: var(--primary-600);
      box-shadow: var(--shadow-md);
    }

    .htx-selected-card {
      border-color: var(--primary-700);
      background: #f0fdf4;
      box-shadow: 0 0 0 2px var(--primary-600);
    }

    .htx-card-top {
      display: flex;
      gap: 10px;
      align-items: flex-start;
    }

    .htx-card-logo-wrap {
      flex-shrink: 0;
    }

    .htx-card-logo {
      font-size: 22px;
      width: 38px;
      height: 38px;
      background: var(--primary-100);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .htx-card-heading {
      flex: 1;
    }

    .htx-card-badges {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-bottom: 6px;
    }

    .badge-active-status {
      background: #166534;
      color: #ffffff;
      font-weight: 800;
    }

    .htx-card-name {
      font-size: 18px;
      font-weight: 800;
      color: var(--text-main);
      margin: 0 0 4px;
      line-height: 1.35;
    }

    .htx-card-subname {
      font-size: 13.5px;
      color: var(--text-muted);
    }

    .code-pill {
      font-weight: 800;
      color: var(--primary-900);
      background: var(--primary-100);
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 12px;
    }

    .htx-card-body {
      display: flex;
      flex-direction: column;
      gap: 8px;
      background: #fafafa;
      padding: 12px 14px;
      border-radius: var(--radius-md);
      border: 1px solid var(--border-color);
      flex: 1;
    }

    .htx-selected-card .htx-card-body {
      background: #ffffff;
    }

    .info-row {
      display: flex;
      flex-direction: column;
      gap: 2px;
      font-size: 13.5px;
    }

    .info-label {
      font-weight: 700;
      color: var(--text-muted);
      font-size: 12px;
    }

    .info-value {
      color: var(--text-main);
    }

    .highlight-product {
      color: var(--primary-800);
      font-size: 14.5px;
    }

    .phone-link {
      color: var(--primary-800);
      font-weight: 700;
      text-decoration: none;
    }

    .phone-link:hover {
      text-decoration: underline;
    }

    .htx-card-actions {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .btn-action-main {
      flex: 1;
      font-size: 14px;
      font-weight: 800;
      padding: 10px 14px;
    }

    .btn-working {
      background-color: #15803d;
      color: white;
      border-color: #15803d;
    }

    /* TABLE VIEW */
    .clean-table th, .clean-table td {
      padding: 12px 16px;
      vertical-align: middle;
    }

    .active-row {
      background-color: #f0fdf4 !important;
    }

    .htx-name-cell {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .htx-logo-sm {
      font-size: 24px;
      width: 40px;
      height: 40px;
      background: var(--primary-100);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .sub-text {
      font-size: 12.5px;
      color: var(--text-muted);
      margin-top: 3px;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .btn-success-active {
      background-color: #15803d;
      color: white;
      border-color: #15803d;
    }

    .empty-box {
      grid-column: 1 / -1;
      text-align: center;
      padding: 40px;
      color: var(--text-muted);
    }

    .empty-icon {
      font-size: 40px;
      display: block;
      margin-bottom: 8px;
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
      max-width: 720px;
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
      .htx-cards-container {
        grid-template-columns: 1fr;
      }
      .form-row-2, .form-row-3 {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class HtxManagementComponent {
  state = inject(HtxStateService);
  toast = inject(ToastService);
  private router = inject(Router);

  viewMode = signal<'cards' | 'table'>('cards');
  searchKeyword = signal('');
  currentPage = signal(1);
  pageSize = signal(6);

  showModal = signal(false);
  isEdit = signal(false);

  showDeleteModal = signal(false);
  htxToDelete: HTXInfo | null = null;

  activeHtx: HTXInfo = {
    id: '',
    name: '',
    shortName: '',
    code: 'HTX-',
    farmingType: 'crop',
    category: 'Lúa sạch & Gạo',
    primaryProduct: '',
    address: '',
    district: '',
    representative: '',
    phone: '',
    email: '',
    logo: '🌾',
    ocopLevel: 'OCOP 4 sao',
    establishedYear: 2026,
    totalMembers: 30,
    totalAreaHa: 20.0,
    description: '',
    bannerImage: 'assets/images/banner-rice.jpg',
    status: 'active'
  };

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }

  totalMembersAll() {
    return this.state.cooperatives().reduce((sum, h) => sum + (h.totalMembers || 0), 0);
  }

  totalAreaAll() {
    return this.state.cooperatives().reduce((sum, h) => sum + (h.totalAreaHa || 0), 0);
  }

  onSearchChange(kw: string) {
    this.searchKeyword.set(kw);
    this.currentPage.set(1);
  }

  filteredHtxList = computed(() => {
    const kw = this.searchKeyword().toLowerCase().trim();
    if (!kw) return this.state.cooperatives();
    return this.state.cooperatives().filter(h =>
      h.name.toLowerCase().includes(kw) ||
      h.shortName.toLowerCase().includes(kw) ||
      h.code.toLowerCase().includes(kw) ||
      h.district.toLowerCase().includes(kw) ||
      h.representative.toLowerCase().includes(kw)
    );
  });

  paginatedHtxList = computed(() => {
    const list = this.filteredHtxList();
    const start = (this.currentPage() - 1) * this.pageSize();
    return list.slice(start, start + this.pageSize());
  });

  getFarmingTypeClass(t: FarmingType) {
    switch (t) {
      case 'crop': return 'badge-success';
      case 'livestock': return 'badge-warning';
      case 'aquaculture': return 'badge-info';
      default: return 'badge-primary';
    }
  }

  getFarmingTypeName(t: FarmingType) {
    switch (t) {
      case 'crop': return '🌾 Trồng trọt';
      case 'livestock': return '🐓 Chăn nuôi';
      case 'aquaculture': return '🐟 Thủy sản';
      default: return '🌳 Tổng hợp';
    }
  }

  switchToHtx(h: HTXInfo) {
    if (this.state.selectedHtxId() === h.id) {
      this.toast.info('Không gian làm việc', `Bác đang ở không gian làm việc của ${h.shortName}`);
      this.router.navigate(['/dashboard']);
    } else {
      this.state.switchHtx(h.id);
      this.toast.success('Đổi Hợp tác xã thành công', `Đã chuyển sang làm việc với ${h.name}`);
    }
  }

  canEditThisHtx(h: HTXInfo): boolean {
    if (this.state.canManageAllHtx()) return true;
    if (this.state.currentUser().role === 'director' && this.state.currentUser().htxId === h.id) return true;
    return false;
  }

  showScopeWarning(h: HTXInfo) {
    this.toast.warning(
      'Giới hạn phạm vi quản trị HTX',
      `Tài khoản "${this.state.currentUser().name}" (${this.state.currentUser().roleTitle}) chỉ được thao tác tại ${this.state.currentHtx().name}.`
    );
  }

  openAddModal() {
    if (!this.state.canManageAllHtx()) {
      this.toast.warning('Giới hạn phân quyền', 'Chỉ Quản trị viên Sở/Hệ thống mới có quyền thêm Hợp tác xã mới vào mạng lưới.');
      return;
    }
    this.isEdit.set(false);
    this.activeHtx = {
      id: '',
      name: '',
      shortName: '',
      code: 'HTX-' + Date.now().toString(36).toUpperCase().slice(-3) + '-HY',
      farmingType: 'crop',
      category: 'Lúa sạch & Gạo',
      primaryProduct: '',
      address: '',
      district: 'Tỉnh Hưng Yên',
      representative: '',
      phone: '',
      email: '',
      logo: '🌾',
      ocopLevel: 'OCOP 4 sao & VietGAP',
      establishedYear: 2026,
      totalMembers: 25,
      totalAreaHa: 15.0,
      description: 'Hợp tác xã kiểu mới áp dụng nhật ký điện tử và liên kết chuỗi giá trị.',
      bannerImage: 'assets/images/banner-rice.jpg',
      status: 'active'
    };
    this.showModal.set(true);
  }

  openEditModal(h: HTXInfo) {
    if (!this.canEditThisHtx(h)) {
      this.toast.warning('Giới hạn phân quyền', `Bác chỉ có quyền chỉnh sửa hồ sơ của ${this.state.currentHtx().name}.`);
      return;
    }
    this.isEdit.set(true);
    this.activeHtx = { ...h };
    this.showModal.set(true);
  }

  saveHTX(e: Event) {
    e.preventDefault();
    if (!this.activeHtx.name.trim() || !this.activeHtx.code.trim()) return;

    if (this.activeHtx.farmingType === 'livestock') {
      this.activeHtx.logo = '🐓';
      this.activeHtx.category = 'Gà Đông Tảo thuần chủng';
    } else if (this.activeHtx.farmingType === 'aquaculture') {
      this.activeHtx.logo = '🐟';
      this.activeHtx.category = 'Nhãn lồng & Thủy sản';
    } else {
      this.activeHtx.logo = '🌾';
      this.activeHtx.category = 'Lúa sạch & Gạo';
    }

    if (this.isEdit()) {
      this.state.updateHTX(this.activeHtx);
    } else {
      this.state.addHTX(this.activeHtx);
    }
    this.showModal.set(false);
  }

  confirmDelete(h: HTXInfo) {
    if (!this.state.canManageAllHtx()) {
      this.toast.warning('Giới hạn phân quyền', 'Chỉ Quản trị viên Sở/Hệ thống mới có quyền xóa Hợp tác xã.');
      return;
    }
    this.htxToDelete = h;
    this.showDeleteModal.set(true);
  }

  executeDelete() {
    if (!this.state.canManageAllHtx()) {
      this.toast.warning('Giới hạn phân quyền', 'Bác không có quyền xóa Hợp tác xã.');
      this.showDeleteModal.set(false);
      return;
    }
    if (this.htxToDelete) {
      this.state.deleteHTX(this.htxToDelete.id);
      this.showDeleteModal.set(false);
    }
  }
}
