import { Injectable, computed, signal, inject } from '@angular/core';
import {
  HTXInfo, User, Member, ProductionZone, ProductionProcess,
  ProductionLog, InventoryItem, StockTransaction, HarvestBatch,
  PackagedProduct, SalesOrder, NotificationItem, TechnicalManual,
  MasterDataItem, PartnerInfo, ProductInfo, PartnerCommitment
} from '../models/htx.model';
import { MockDataService } from './mock-data.service';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root'
})
export class HtxStateService {
  private mockData = inject(MockDataService);
  private toast = inject(ToastService);

  // Danh sách HTX và HTX đang chọn (Có thể mở rộng thêm hàng chục / hàng trăm HTX)
  readonly cooperatives = signal<HTXInfo[]>([...this.mockData.cooperatives]);
  readonly selectedHtxId = signal<string>('htx-anninh');

  // Người dùng hiện tại
  readonly currentUser = signal<User>(this.mockData.demoUsers[0]);

  // Master Data Danh mục dùng chung chuẩn
  readonly masterDataItems = signal<MasterDataItem[]>([...this.mockData.masterDataItems]);

  // Danh mục Thương phẩm & Nông sản OCOP Số hóa
  readonly products = signal<ProductInfo[]>([...this.mockData.products]);

  // Danh bạ Đối tác & Kênh phân phối tổng quan (Cam kết số hóa)
  readonly partners = signal<PartnerInfo[]>([...this.mockData.partners]);

  // Các danh sách dữ liệu phản ứng (Signals)
  readonly members = signal<Member[]>([...this.mockData.members]);
  readonly productionZones = signal<ProductionZone[]>([...this.mockData.productionZones]);
  readonly productionLogs = signal<ProductionLog[]>([...this.mockData.productionLogs]);
  readonly inventoryItems = signal<InventoryItem[]>([...this.mockData.inventoryItems]);
  readonly harvestBatches = signal<HarvestBatch[]>([...this.mockData.harvestBatches]);
  readonly packagedProducts = signal<PackagedProduct[]>([...this.mockData.packagedProducts]);
  readonly salesOrders = signal<SalesOrder[]>([...this.mockData.salesOrders]);
  readonly notifications = signal<NotificationItem[]>([...this.mockData.notifications]);
  readonly technicalManuals = signal<TechnicalManual[]>([...this.mockData.technicalManuals]);

  // Computed properties theo HTX đang chọn
  readonly currentHtx = computed(() => {
    return this.cooperatives().find(h => h.id === this.selectedHtxId()) || this.cooperatives()[0];
  });

  readonly currentHtxProducts = computed(() => {
    return this.products().filter(p => p.htxId === this.selectedHtxId() || p.htxId === 'all');
  });

  readonly currentMembers = computed(() => {
    return this.members().filter(m => m.htxId === this.selectedHtxId());
  });

  readonly pendingMembers = computed(() => {
    return this.currentMembers().filter(m => m.status === 'pending');
  });

  readonly activeMembers = computed(() => {
    return this.currentMembers().filter(m => m.status === 'active');
  });

  readonly currentZones = computed(() => {
    return this.productionZones().filter(z => z.htxId === this.selectedHtxId());
  });

  readonly currentLogs = computed(() => {
    return this.productionLogs().filter(l => l.htxId === this.selectedHtxId());
  });

  readonly currentInventory = computed(() => {
    return this.inventoryItems().filter(i => i.htxId === this.selectedHtxId());
  });

  readonly currentHarvestBatches = computed(() => {
    return this.harvestBatches().filter(b => b.htxId === this.selectedHtxId());
  });

  readonly currentPackages = computed(() => {
    return this.packagedProducts().filter(p => p.htxId === this.selectedHtxId());
  });

  readonly currentOrders = computed(() => {
    return this.salesOrders().filter(o => o.htxId === this.selectedHtxId());
  });

  readonly unreadNotifications = computed(() => {
    return this.notifications().filter(n => !n.isRead);
  });

  // --- HỆ THỐNG PHÂN QUYỀN VAI TRÒ & PHẠM VI DỮ LIỆU (RBAC & MULTI-TENANCY THEO SRS MỤC 7) ---
  readonly canSwitchHtx = computed(() => {
    return this.currentUser().role === 'admin' || this.currentUser().isSystemAdmin === true;
  });

  readonly canManageAllHtx = computed(() => {
    return this.currentUser().role === 'admin';
  });

  readonly canManageCurrentHtx = computed(() => {
    return this.currentUser().role === 'admin' || this.currentUser().role === 'director';
  });

  readonly canEditProcess = computed(() => {
    // Chỉ Kỹ sư Nông nghiệp (R03) hoặc Admin (R01) mới có quyền tạo/sửa/nhân bản quy trình mùa vụ
    return this.currentUser().role === 'admin' || this.currentUser().role === 'technician';
  });

  readonly canApproveMembers = computed(() => {
    // Ban Quản trị HTX (R02) và Admin (R01) có quyền duyệt thành viên
    return this.currentUser().role === 'admin' || this.currentUser().role === 'director';
  });

  readonly canManageWarehouse = computed(() => {
    return this.currentUser().role === 'admin' || this.currentUser().role === 'accountant';
  });

  readonly isFarmer = computed(() => {
    return this.currentUser().role === 'member';
  });

  // Chuyển đổi HTX (Chỉ Admin Sở/Hệ thống mới được chuyển tự do; GĐ/Xã viên bị khóa vào HTX của mình)
  switchHtx(htxId: string) {
    const user = this.currentUser();
    const isSuperAdmin = user.role === 'admin' || user.isSystemAdmin === true;

    if (!isSuperAdmin && user.htxId && user.htxId !== htxId) {
      const currentHtxObj = this.cooperatives().find(h => h.id === user.htxId);
      this.toast.warning(
        'Giới hạn phạm vi HTX', 
        `Tài khoản "${user.name}" (${user.roleTitle}) chỉ được thao tác trong nội bộ ${currentHtxObj?.name || user.htxId}.`
      );
      return;
    }

    this.selectedHtxId.set(htxId);
    const htx = this.cooperatives().find(h => h.id === htxId);
    this.toast.info('Đã chuyển HTX', `Đang xem không gian làm việc của ${htx?.name || htxId}`);
  }

  // Chuyển đổi người dùng & vai trò
  switchUser(user: User) {
    this.currentUser.set(user);
    if (!user.isSystemAdmin && user.role !== 'admin' && user.htxId) {
      this.selectedHtxId.set(user.htxId);
    }
    this.toast.success('Đổi vai trò thành công', `Chào mừng ${user.name} (${user.roleTitle})`);
  }

  // --- CRUD QUẢN TRỊ HTX (MỞ RỘNG MẠNG LƯỚI HTX) ---
  addHTX(newHtx: Omit<HTXInfo, 'id'>) {
    const id = 'htx-' + Date.now().toString(36);
    const fullHtx: HTXInfo = {
      ...newHtx,
      id
    };
    this.cooperatives.update(list => [...list, fullHtx]);
    this.toast.success('Thêm Hợp tác xã mới', `Đã khởi tạo thành công "${fullHtx.name}".`);
  }

  updateHTX(htx: HTXInfo) {
    this.cooperatives.update(list =>
      list.map(h => (h.id === htx.id ? { ...htx } : h))
    );
    this.toast.success('Cập nhật HTX', `Đã lưu thay đổi cho "${htx.name}".`);
  }

  deleteHTX(htxId: string) {
    const htx = this.cooperatives().find(h => h.id === htxId);
    this.cooperatives.update(list => list.filter(h => h.id !== htxId));
    if (this.selectedHtxId() === htxId && this.cooperatives().length > 0) {
      this.selectedHtxId.set(this.cooperatives()[0].id);
    }
    this.toast.danger('Đã xóa HTX', `Đã gỡ bỏ "${htx?.name}" khỏi hệ thống.`);
  }

  // --- CRUD MASTER DATA DÙNG CHUNG ---
  addMasterItem(item: Omit<MasterDataItem, 'id'>) {
    const id = 'md-' + Date.now().toString(36);
    const fullItem: MasterDataItem = {
      ...item,
      id
    };
    this.masterDataItems.update(list => [fullItem, ...list]);
    this.toast.success('Thêm danh mục chuẩn', `Đã thêm "${fullItem.name}" (${fullItem.code}) vào Master Data.`);
  }

  updateMasterItem(item: MasterDataItem) {
    this.masterDataItems.update(list =>
      list.map(i => (i.id === item.id ? { ...item } : i))
    );
    this.toast.success('Cập nhật danh mục chuẩn', `Đã lưu thay đổi cho "${item.name}".`);
  }

  deleteMasterItem(id: string) {
    const item = this.masterDataItems().find(i => i.id === id);
    this.masterDataItems.update(list => list.filter(i => i.id !== id));
    this.toast.danger('Đã xóa mục danh mục', `Đã gỡ bỏ "${item?.name}" khỏi Master Data.`);
  }

  toggleMasterItemStatus(id: string) {
    this.masterDataItems.update(list =>
      list.map(i => (i.id === id ? { ...i, status: i.status === 'active' ? 'inactive' : 'active' } : i))
    );
    const item = this.masterDataItems().find(i => i.id === id);
    this.toast.info('Cập nhật trạng thái', `Mục "${item?.name}" hiện đang ở trạng thái: ${item?.status === 'active' ? 'Áp dụng' : 'Tạm dừng'}`);
  }

  // --- CRUD SẢN PHẨM & NÔNG SẢN SỐ HÓA ---
  addProduct(prod: Omit<ProductInfo, 'id'>) {
    const id = 'sp-' + Date.now().toString(36);
    const fullProd: ProductInfo = {
      ...prod,
      id
    };
    this.products.update(list => [fullProd, ...list]);
    this.toast.success('Số hóa sản phẩm thành công', `Đã thêm sản phẩm "${fullProd.name}" (${fullProd.code}) vào CSDL.`);
  }

  updateProduct(prod: ProductInfo) {
    this.products.update(list =>
      list.map(p => (p.id === prod.id ? { ...prod } : p))
    );
    this.toast.success('Cập nhật sản phẩm', `Đã lưu thay đổi cho "${prod.name}".`);
  }

  deleteProduct(id: string) {
    const p = this.products().find(item => item.id === id);
    this.products.update(list => list.filter(item => item.id !== id));
    this.toast.danger('Đã xóa sản phẩm', `Đã gỡ bỏ sản phẩm "${p?.name}" khỏi CSDL.`);
  }

  toggleProductStatus(id: string) {
    this.products.update(list =>
      list.map(p => (p.id === id ? { ...p, status: p.status === 'active' ? 'inactive' : 'active' } : p))
    );
    const p = this.products().find(item => item.id === id);
    this.toast.info('Trạng thái sản phẩm', `Sản phẩm "${p?.name}": ${p?.status === 'active' ? 'Đang kinh doanh' : 'Tạm dừng kinh doanh'}`);
  }

  // --- CRUD ĐỐI TÁC & KÊNH PHÂN PHỐI ---
  addPartner(partner: Omit<PartnerInfo, 'id'>) {
    const id = 'part-' + Date.now().toString(36);
    const fullP: PartnerInfo = {
      ...partner,
      id
    };
    this.partners.update(list => [fullP, ...list]);
    this.toast.success('Thêm đối tác mới', `Đã thêm đối tác "${fullP.name}" vào danh bạ.`);
  }

  updatePartner(partner: PartnerInfo) {
    this.partners.update(list =>
      list.map(p => (p.id === partner.id ? { ...partner } : p))
    );
    this.toast.success('Cập nhật đối tác', `Đã lưu thay đổi cho đối tác "${partner.name}".`);
  }

  deletePartner(id: string) {
    const p = this.partners().find(item => item.id === id);
    this.partners.update(list => list.filter(item => item.id !== id));
    this.toast.danger('Đã xóa đối tác', `Đã gỡ bỏ "${p?.name}" khỏi danh bạ đối tác.`);
  }

  // --- CRUD THÀNH VIÊN ---
  addMember(newMember: Omit<Member, 'id' | 'htxId'>) {
    const id = 'm-' + Date.now().toString(36);
    const fullMember: Member = {
      ...newMember,
      id,
      htxId: this.selectedHtxId()
    };
    this.members.update(list => [fullMember, ...list]);
    this.toast.success('Thêm thành viên mới', `Đã lưu hồ sơ của ${fullMember.name} thành công.`);
  }

  updateMember(member: Member) {
    this.members.update(list =>
      list.map(m => (m.id === member.id ? { ...member } : m))
    );
    this.toast.success('Cập nhật thành công', `Đã cập nhật hồ sơ của bác ${member.name}.`);
  }

  deleteMember(memberId: string) {
    const member = this.members().find(m => m.id === memberId);
    this.members.update(list => list.filter(m => m.id !== memberId));
    this.toast.danger('Đã xóa thành viên', `Đã xóa hồ sơ của ${member?.name} khỏi HTX.`);
  }

  approveMember(memberId: string) {
    this.members.update(list =>
      list.map(m => (m.id === memberId ? { ...m, status: 'active' } : m))
    );
    const member = this.members().find(m => m.id === memberId);
    this.toast.success(
      'Phê duyệt thành công!',
      `Đã duyệt bác ${member?.name} vào danh sách xã viên chính thức của ${this.currentHtx().shortName}.`
    );
  }

  // --- CRUD VÙNG SẢN XUẤT ---
  addZone(zone: Omit<ProductionZone, 'id' | 'htxId'>) {
    const id = 'z-' + Date.now().toString(36);
    const fullZone: ProductionZone = {
      ...zone,
      id,
      htxId: this.selectedHtxId()
    };
    this.productionZones.update(list => [fullZone, ...list]);
    this.toast.success('Thêm vùng sản xuất', `Đã thêm ${fullZone.name} vào danh sách.`);
  }

  updateZone(zone: ProductionZone) {
    this.productionZones.update(list =>
      list.map(z => (z.id === zone.id ? { ...zone } : z))
    );
    this.toast.success('Cập nhật vùng sản xuất', `Đã lưu thay đổi cho ${zone.name}.`);
  }

  deleteZone(zoneId: string) {
    const zone = this.productionZones().find(z => z.id === zoneId);
    this.productionZones.update(list => list.filter(z => z.id !== zoneId));
    this.toast.danger('Đã xóa vùng sản xuất', `Đã xóa ${zone?.name} khỏi hệ thống.`);
  }

  // --- CRUD NHẬT KÝ SẢN XUẤT ---
  addProductionLog(log: Omit<ProductionLog, 'id' | 'htxId' | 'isSecured' | 'hashString'>) {
    const id = 'log-' + Date.now().toString(36);
    const randomHash = '0x' + Array.from({length: 16}, () => Math.floor(Math.random()*16).toString(16)).join('');
    const fullLog: ProductionLog = {
      ...log,
      id,
      htxId: this.selectedHtxId(),
      isSecured: true,
      hashString: `${randomHash}... (Đã lưu vết bảo mật HTX)`
    };
    this.productionLogs.update(list => [fullLog, ...list]);
    this.toast.success(
      'Ghi nhật ký thành công!',
      `Đã lưu nhật ký: "${fullLog.taskTitle}" kèm mã hash bảo mật.`
    );
  }

  updateProductionLog(log: ProductionLog) {
    this.productionLogs.update(list =>
      list.map(l => (l.id === log.id ? { ...log } : l))
    );
    this.toast.success('Cập nhật nhật ký', `Đã cập nhật nhật ký: "${log.taskTitle}".`);
  }

  deleteProductionLog(logId: string) {
    this.productionLogs.update(list => list.filter(l => l.id !== logId));
    this.toast.danger('Đã xóa nhật ký', 'Bản ghi nhật ký đã được xóa.');
  }

  // --- CRUD KHO VẬT TƯ ---
  addInventoryItem(item: Omit<InventoryItem, 'id' | 'htxId'>) {
    const id = 'inv-' + Date.now().toString(36);
    const fullItem: InventoryItem = {
      ...item,
      id,
      htxId: this.selectedHtxId()
    };
    this.inventoryItems.update(list => [fullItem, ...list]);
    this.toast.success('Đã thêm vật tư mới', `Vật tư ${fullItem.name} đã được cập nhật vào kho.`);
  }

  updateInventoryItem(item: InventoryItem) {
    this.inventoryItems.update(list =>
      list.map(i => (i.id === item.id ? { ...item } : i))
    );
    this.toast.success('Cập nhật vật tư', `Đã lưu thay đổi cho vật tư ${item.name}.`);
  }

  deleteInventoryItem(itemId: string) {
    const item = this.inventoryItems().find(i => i.id === itemId);
    this.inventoryItems.update(list => list.filter(i => i.id !== itemId));
    this.toast.danger('Đã xóa vật tư', `Đã xóa ${item?.name} khỏi kho.`);
  }

  // --- CRUD LÔ THU HOẠCH & ĐÓNG GÓI QR ---
  addHarvestBatch(batch: Omit<HarvestBatch, 'id' | 'htxId'>) {
    const id = 'hb-' + Date.now().toString(36);
    const fullBatch: HarvestBatch = {
      ...batch,
      id,
      htxId: this.selectedHtxId()
    };
    this.harvestBatches.update(list => [fullBatch, ...list]);
    this.toast.success('Thêm lô thu hoạch', `Lô thu hoạch ${fullBatch.batchCode} đã được tạo.`);
  }

  updateHarvestBatch(batch: HarvestBatch) {
    this.harvestBatches.update(list =>
      list.map(b => (b.id === batch.id ? { ...batch } : b))
    );
    this.toast.success('Cập nhật lô thu hoạch', `Đã cập nhật ${batch.batchCode}.`);
  }

  deleteHarvestBatch(batchId: string) {
    this.harvestBatches.update(list => list.filter(b => b.id !== batchId));
    this.toast.danger('Đã xóa lô thu hoạch', 'Lô thu hoạch đã được xóa.');
  }

  addPackagedProduct(pkg: Omit<PackagedProduct, 'id' | 'htxId'>) {
    const id = 'pack-' + Date.now().toString(36);
    const fullPkg: PackagedProduct = {
      ...pkg,
      id,
      htxId: this.selectedHtxId()
    };
    this.packagedProducts.update(list => [fullPkg, ...list]);
    this.toast.success('Tạo tem QR thành công', `Mã truy xuất ${fullPkg.qrCode} đã sẵn sàng để in tem.`);
  }

  deletePackagedProduct(id: string) {
    this.packagedProducts.update(list => list.filter(p => p.id !== id));
    this.toast.danger('Đã xóa tem QR', 'Mã tem nhãn đã được xóa khỏi hệ thống.');
  }

  // --- CRUD ĐƠN HÀNG BÁN ---
  addSalesOrder(order: Omit<SalesOrder, 'id' | 'htxId'>) {
    const id = 'ord-' + Date.now().toString(36);
    const fullOrder: SalesOrder = {
      ...order,
      id,
      htxId: this.selectedHtxId()
    };
    this.salesOrders.update(list => [fullOrder, ...list]);
    this.toast.success('Tạo đơn hàng thành công', `Đơn hàng ${fullOrder.orderCode} trị giá ${fullOrder.totalAmount.toLocaleString('vi-VN')} đ đã được lưu.`);
  }

  updateSalesOrder(order: SalesOrder) {
    this.salesOrders.update(list =>
      list.map(o => (o.id === order.id ? { ...order } : o))
    );
    this.toast.success('Cập nhật đơn hàng', `Đã cập nhật đơn hàng ${order.orderCode}.`);
  }

  deleteSalesOrder(orderId: string) {
    this.salesOrders.update(list => list.filter(o => o.id !== orderId));
    this.toast.danger('Đã xóa đơn hàng', 'Đơn hàng đã được xóa khỏi hệ thống.');
  }

  // --- CRUD THÔNG BÁO ---
  addNotification(title: string, content: string, type: 'urgent' | 'warning' | 'info', receiverGroup: string) {
    const id = 'notif-' + Date.now().toString(36);
    const newNotif: NotificationItem = {
      id,
      title,
      content,
      type,
      createdAt: 'Vừa xong',
      isRead: false,
      sender: this.currentUser().name,
      receiverGroup
    };
    this.notifications.update(list => [newNotif, ...list]);
    this.toast.success('Đã phát thông báo!', `Thông báo đã được phát tới "${receiverGroup}".`);
  }

  deleteNotification(id: string) {
    this.notifications.update(list => list.filter(n => n.id !== id));
    this.toast.danger('Đã xóa thông báo', 'Thông báo đã được xóa.');
  }

  markNotificationAsRead(id: string) {
    this.notifications.update(list =>
      list.map(n => (n.id === id ? { ...n, isRead: true } : n))
    );
  }
}
