import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { DemoHubComponent } from './features/demo-hub/demo-hub.component';
import { LoginComponent } from './features/auth/login/login.component';
import { NotificationsComponent } from './features/notifications/notifications.component';
import { DirectorDashboardComponent } from './features/dashboard/director-dashboard/director-dashboard.component';
import { MemberDashboardComponent } from './features/dashboard/member-dashboard/member-dashboard.component';
import { MembersListComponent } from './features/members/members-list/members-list.component';
import { HtxManagementComponent } from './features/htx-management/htx-management.component';
import { HtxProfileComponent } from './features/htx-profile/htx-profile.component';
import { PartnersListComponent } from './features/partners/partners-list/partners-list.component';
import { ZonesListComponent } from './features/production/zones-list/zones-list.component';
import { LogsListComponent } from './features/production/logs-list/logs-list.component';
import { ProcessListComponent } from './features/production/process-list/process-list.component';
import { WarehouseListComponent } from './features/warehouse/warehouse-list/warehouse-list.component';
import { HarvestPackagingComponent } from './features/harvest-packaging/harvest-packaging.component';
import { SalesListComponent } from './features/sales/sales-list/sales-list.component';
import { ReportsComponent } from './features/reports/reports.component';
import { RolesMatrixComponent } from './features/system-admin/roles-matrix/roles-matrix.component';
import { MasterDataComponent } from './features/system-admin/master-data/master-data.component';
import { TechnicalManualsComponent } from './features/system-admin/technical-manuals/technical-manuals.component';
import { SystemParametersComponent } from './features/system-admin/system-parameters/system-parameters.component';
import { PublicTraceComponent } from './features/traceability/public-trace/public-trace.component';

export const routes: Routes = [
  // Tuyến đường đăng nhập
  {
    path: 'auth/login',
    component: LoginComponent,
    title: 'Đăng Nhập • CSDL Quản Trị HTX Hưng Yên'
  },

  // Tuyến đường công khai cho người tiêu dùng quét mã QR
  {
    path: 'trace/:qrCode',
    component: PublicTraceComponent,
    title: 'Truy Xuất Nguồn Gốc Sản Phẩm • OCOP Hưng Yên'
  },
  {
    path: 'trace',
    redirectTo: 'trace/HY-AN-ST25-2026-0988',
    pathMatch: 'full'
  },

  // Các tuyến đường nằm trong khung làm việc chính của cán bộ / xã viên HTX
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'demo-hub',
        pathMatch: 'full'
      },
      {
        path: 'demo-hub',
        component: DemoHubComponent,
        title: 'Mục Lục Tổng Quan Demo • CSDL HTX Hưng Yên'
      },
      {
        path: 'dashboard',
        component: DirectorDashboardComponent,
        title: 'Bảng Điều Khiển HTX • CSDL Nông Nghiệp'
      },
      {
        path: 'dashboard/member',
        component: MemberDashboardComponent,
        title: 'Trang Chủ Xã Viên • Sổ Tay Nông Vụ'
      },
      {
        path: 'htx-network',
        component: HtxManagementComponent,
        title: 'Mạng Lưới Hợp Tác Xã • Quản Trị Quy Mô HTX'
      },
      {
        path: 'notifications',
        component: NotificationsComponent,
        title: 'Thông Báo Nông Vụ • HTX Hưng Yên'
      },
      {
        path: 'members',
        component: MembersListComponent,
        title: 'Quản Lý Thành Viên & Duyệt Zalo • HTX Hưng Yên'
      },
      {
        path: 'htx-profile',
        component: HtxProfileComponent,
        title: 'Hồ Sơ & Chứng Nhận HTX • OCOP Hưng Yên'
      },
      {
        path: 'partners',
        component: PartnersListComponent,
        title: 'Đối Tác & Kênh Phân Phối • HTX Hưng Yên'
      },
      {
        path: 'production/zones',
        component: ZonesListComponent,
        title: 'Vùng Trồng & Dự Báo Sản Lượng • HTX Hưng Yên'
      },
      {
        path: 'production/logs',
        component: LogsListComponent,
        title: 'Nhật Ký Sản Xuất Điện Tử (Lưu vết) • HTX Hưng Yên'
      },
      {
        path: 'production/processes',
        component: ProcessListComponent,
        title: 'Quy Trình & Mùa Vụ • HTX Hưng Yên'
      },
      {
        path: 'warehouse',
        component: WarehouseListComponent,
        title: 'Quản Lý Kho Vật Tư • HTX Hưng Yên'
      },
      {
        path: 'harvest-packaging',
        component: HarvestPackagingComponent,
        title: 'Thu Hoạch & Tem QR Code • HTX Hưng Yên'
      },
      {
        path: 'sales',
        component: SalesListComponent,
        title: 'Bán Hàng & Hóa Đơn Điện Tử • HTX Hưng Yên'
      },
      {
        path: 'reports',
        component: ReportsComponent,
        title: 'Báo Cáo Quản Trị • HTX Hưng Yên'
      },
      {
        path: 'system-admin/roles',
        component: RolesMatrixComponent,
        title: 'Ma Trận Phân Quyền • Quản Trị Hệ Thống'
      },
      {
        path: 'system-admin/master-data',
        component: MasterDataComponent,
        title: 'Danh Mục Dùng Chung • Master Data Nông Nghiệp'
      },
      {
        path: 'system-admin/technical-manuals',
        component: TechnicalManualsComponent,
        title: 'Thư Viện Hướng Dẫn Kỹ Thuật Nông Nghiệp'
      },
      {
        path: 'system-admin/parameters',
        component: SystemParametersComponent,
        title: 'Cấu Hình Tham Số Hệ Thống • Quản Trị HTX'
      }
    ]

  },

  // Fallback route
  {
    path: '**',
    redirectTo: 'demo-hub'
  }
];
