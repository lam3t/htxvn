import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../../core/services/toast.service';

interface PermissionRow {
  module: string;
  action: string;
  admin: boolean;
  director: boolean;
  technician: boolean;
  accountant: boolean;
  member: boolean;
}

@Component({
  selector: 'app-roles-matrix',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="roles-matrix-page">
      <!-- HEADER TRANG -->
      <div class="page-top">
        <div>
          <div class="page-sub">QUẢN TRỊ HỆ THỐNG • CẤU HÌNH PHÂN QUYỀN HTX</div>
          <h1 class="page-title">Ma Trận Phân Quyền Theo Nhóm Chức Năng</h1>
        </div>
        <button class="btn btn-primary" (click)="savePermissions()">
          <span>💾</span> Lưu Cấu Hình Phân Quyền
        </button>
      </div>

      <!-- BẢNG MA TRẬN PHÂN QUYỀN DẠNG CHECKBOX -->
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">🛡️ Bảng Ma Trận Phân Quyền Chi Tiết</h2>
          <span class="badge badge-info">Áp dụng cho 3 HTX Thí Điểm</span>
        </div>

        <div class="table-responsive">
          <table class="data-table matrix-table">
            <thead>
              <tr>
                <th>Phân Hệ / Module</th>
                <th>Quyền Hạn / Tác Vụ</th>
                <th class="col-role">Admin Sở</th>
                <th class="col-role">Giám Đốc HTX</th>
                <th class="col-role">Kỹ Sư HTX</th>
                <th class="col-role">Kế Toán</th>
                <th class="col-role">Xã Viên</th>
              </tr>
            </thead>
            <tbody>
              @for (row of permissions; track row.module + row.action) {
                <tr>
                  <td><strong>{{ row.module }}</strong></td>
                  <td>{{ row.action }}</td>
                  <td class="col-role"><input type="checkbox" [(ngModel)]="row.admin" class="matrix-check" /></td>
                  <td class="col-role"><input type="checkbox" [(ngModel)]="row.director" class="matrix-check" /></td>
                  <td class="col-role"><input type="checkbox" [(ngModel)]="row.technician" class="matrix-check" /></td>
                  <td class="col-role"><input type="checkbox" [(ngModel)]="row.accountant" class="matrix-check" /></td>
                  <td class="col-role"><input type="checkbox" [(ngModel)]="row.member" class="matrix-check" /></td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .roles-matrix-page {
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

    .matrix-table th, .matrix-table td {
      padding: 8px 10px;
      font-size: 13px;
    }

    .col-role {
      text-align: center;
      width: 110px;
    }

    .matrix-check {
      width: 18px;
      height: 18px;
      accent-color: var(--primary-700);
      cursor: pointer;
    }
  `]
})
export class RolesMatrixComponent {
  toast = inject(ToastService);

  permissions: PermissionRow[] = [
    { module: 'Bảng điều khiển', action: 'Xem KPI toàn cảnh HTX', admin: true, director: true, technician: true, accountant: true, member: false },
    { module: 'Bảng điều khiển', action: 'Xem trang cá nhân hộ nông dân', admin: true, director: false, technician: false, accountant: false, member: true },
    { module: 'Quản lý Thành viên', action: 'Thêm/Sửa/Xóa hồ sơ xã viên', admin: true, director: true, technician: false, accountant: false, member: false },
    { module: 'Quản lý Thành viên', action: 'Phê duyệt đăng ký từ Zalo Mini App', admin: true, director: true, technician: false, accountant: false, member: false },
    { module: 'Quản lý Sản xuất', action: 'Cấu hình vùng trồng / chăn nuôi', admin: true, director: true, technician: true, accountant: false, member: false },
    { module: 'Quy trình Mùa vụ', action: 'Tạo / Sửa / Xóa quy trình chuẩn VietGAP', admin: true, director: false, technician: true, accountant: false, member: false },
    { module: 'Quy trình Mùa vụ', action: 'Xem sổ tay quy trình & học tập kỹ thuật', admin: true, director: true, technician: true, accountant: true, member: true },
    { module: 'Nhật ký Sản xuất', action: 'Ghi nhật ký canh tác của hộ gia đình', admin: true, director: true, technician: true, accountant: false, member: true },
    { module: 'Nhật ký Sản xuất', action: 'Ký duyệt & Đóng dấu Timestamp Hash', admin: true, director: true, technician: true, accountant: false, member: false },
    { module: 'Kho Vật tư', action: 'Nhập / Xuất kho vật tư nông nghiệp', admin: true, director: true, technician: false, accountant: true, member: false },
    { module: 'Đóng gói & Tem QR', action: 'Sinh mã QR Code & In tem HTX', admin: true, director: true, technician: true, accountant: true, member: false },
    { module: 'Bán hàng', action: 'Tạo đơn hàng & Xuất hóa đơn điện tử', admin: true, director: true, technician: false, accountant: true, member: false },
    { module: 'Quản trị Hệ thống HTX', action: 'Cấu hình Master Data & Phân quyền', admin: true, director: false, technician: false, accountant: false, member: false }
  ];

  savePermissions() {
    this.toast.success('Lưu phân quyền thành công', 'Cấu hình ma trận phân quyền đã được cập nhật toàn hệ thống.');
  }
}
