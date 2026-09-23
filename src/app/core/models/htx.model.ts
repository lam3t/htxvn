export type UserRole = 'admin' | 'director' | 'technician' | 'accountant' | 'member';
export type FarmingType = 'crop' | 'livestock' | 'aquaculture' | 'general'; // Trồng trọt | Chăn nuôi | Thủy sản | Tổng hợp

export interface HTXInfo {
  id: string;
  name: string;
  shortName: string;
  code: string;
  farmingType: FarmingType;
  category: 'Lúa sạch & Gạo' | 'Gà Đông Tảo thuần chủng' | 'Nhãn lồng & Thủy sản' | 'Nông sản Tổng hợp';
  primaryProduct: string;
  address: string;
  district: string;
  representative: string;
  phone: string;
  email: string;
  taxCode?: string;
  logo: string;
  ocopLevel: string;
  establishedYear: number;
  totalMembers: number;
  totalAreaHa: number;
  description: string;
  bannerImage: string;
  status?: 'active' | 'pending' | 'suspended';
}

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  roleTitle: string;
  htxId: string;
  phone: string;
  avatar: string;
  isSystemAdmin?: boolean;
}

export interface Member {
  id: string;
  htxId: string;
  name: string;
  phone: string;
  address: string;
  village: string;
  cccd: string;
  scale: string; // e.g., "1.8 ha (50 sào Bắc Bộ)" | "650 con gà" | "16 lồng cá"
  joinDate: string;
  status: 'active' | 'pending' | 'inactive';
  avatar: string;
  notes: string;
  productType: string;
  farmingExperienceYears?: number;
  bankAccount?: string;
}

export interface ProductInfo {
  id: string;
  code: string; // Mã SP số hóa: SP-GAO-ST25, SP-GA-DT01, SP-NHAN-MT01...
  name: string; // Tên thương phẩm
  category: 'Lúa gạo & Nông sản khô' | 'Gia cầm & Thịt đặc sản' | 'Trái cây & Nông sản tươi' | 'Thủy hải sản Sông Hồng' | 'Chế biến & Đặc sản';
  farmingType: FarmingType;
  htxId: string; // 'htx-anninh' | 'htx-dongtao' | 'htx-quyetthang' | 'all'
  htxName?: string;
  unit: string; // 'kg', 'tấn', 'con', 'khay 500g', 'hộp 1kg', 'túi 5kg', 'lít'
  standard: string; // 'OCOP 4 Sao', 'VietGAP', 'Hữu cơ', 'Chỉ dẫn địa lý'
  defaultUnitPrice: number; // Giá bán lẻ niêm yết (VNĐ)
  varietyCode?: string; // G-ST25, G-DT01, G-NL01, G-CL01
  varietyName?: string;
  packagingSpec?: string; // Quy cách: 'Túi 5kg hút chân không', 'Khay 500g bảo quản mát'...
  shelfLifeDays?: number;
  description: string;
  image?: string;
  status: 'active' | 'inactive';
}

export interface MasterDataItem {
  id: string;
  categoryCode: 'MD-SAN-PHAM' | 'MD-GIONG' | 'MD-MUA-VU' | 'MD-PHAN-BVTV' | 'MD-VACXIN-THUCAN' | 'MD-STANDARDS' | 'MD-DVT' | 'MD-TASKS';
  code: string;
  name: string;
  subType: string; // Phân loại con (Lúa, Cây ăn quả, Phân vi sinh, Vắc-xin...)
  unit?: string;
  standard?: string;
  status: 'active' | 'inactive';
  effectiveDate?: string;
  description?: string;
}

export interface SeasonInfo {
  id: string;
  code: string;
  name: string;
  year: number;
  startDate: string;
  endDate: string;
  status: 'Đang diễn ra' | 'Sắp tới' | 'Đã kết thúc';
}

export interface VarietyInfo {
  id: string;
  code: string;
  name: string;
  farmingType: FarmingType;
  origin: string;
  growthDays: number;
  potentialYield: string;
  standard: string;
}

export interface PartnerCommitment {
  id?: string;
  productId: string;          // ID tham chiếu đối tượng sản phẩm số hóa
  productCode: string;        // Mã sản phẩm
  productName: string;        // Tên sản phẩm
  targetQuantity: number;     // Định lượng số: e.g. 850, 30, 3500
  unit: string;               // Đơn vị tính: 'tấn', 'con', 'khay', 'kg', 'lít'
  period: 'năm' | 'vụ' | 'tháng'; // Kỳ cam kết
  contractPrice?: number;     // Đơn giá thỏa thuận (VNĐ/đơn vị)
  totalCommittedValue?: number; // Giá trị cam kết (VNĐ)
  notes?: string;
}

export interface PartnerInfo {
  id: string;
  htxId?: string; // Gán theo HTX hoặc dùng chung toàn hệ thống
  code: string;
  name: string;
  type: 'Siêu thị / Bán lẻ' | 'Doanh nghiệp bao tiêu' | 'Nhà cung ứng vật tư' | 'Đại lý phân phối' | 'Chế biến & Vận chuyển';
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  commitments: PartnerCommitment[]; // Mảng đối tượng cam kết số hóa có cấu trúc
  productsLinked?: string[]; // Danh sách tên sản phẩm (tương thích ngược)
  annualCommitment?: string; // Tóm tắt cam kết (tương thích ngược)
  contractStatus: 'Đang hiệu lực' | 'Sắp hết hạn' | 'Tạm dừng';
  contractNumber?: string;
  contractSignDate?: string;
  contractExpiryDate?: string;
  debtStatus?: string;
  notes?: string;
}

export interface ProductionZone {
  id: string;
  htxId: string;
  code: string; // Mã số vùng trồng (MSVT) / Mã cơ sở chăn nuôi
  name: string;
  farmingType: FarmingType;
  areaHa: number; // Diện tích (ha) hoặc quy mô lồng nuôi / chuồng trại
  managerName: string;
  managerPhone: string;
  currentCrop: string; // Giống cây trồng / con nuôi
  varietyName: string; // Tên giống chi tiết (Bắc Thơm 7, ST25, Gà Đông Tảo F1, Nhãn Miền Thiết)
  seasonName?: string; // Tên mùa vụ (Vụ Mùa 2026, Vụ Tết 2026...)
  soilOrWaterType: string; // Loại đất / Nguồn nước
  plantingDate: string; // Ngày gieo cấy / ngày vào đàn
  expectedHarvestDate: string;
  expectedYieldKg: number;
  status: 'Đang sinh trưởng' | 'Sắp thu hoạch' | 'Đang thu hoạch' | 'Nghỉ vụ/Làm đất';
  statusType: 'good' | 'warning' | 'harvest' | 'rest';
  locationDesc: string;
}

export interface ProcessStep {
  stepNumber: number;
  dayFromStart: string;
  title: string;
  techniqueGuide: string;
  requiredMaterials: string;
  isolationDays?: number; // Thời gian cách ly PHI
}

export interface ProductionProcess {
  id: string;
  htxId: string;
  name: string;
  cropName: string;
  season: string;
  totalDurationDays: number;
  steps: ProcessStep[];
  updatedAt: string;
}

export interface ProductionLog {
  id: string;
  htxId: string;
  zoneId: string;
  zoneName: string;
  date: string;
  farmerName: string;
  farmerPhone: string;
  taskTitle: string;
  workDescription: string;
  materialsUsed: string; // Phân bón / Thuốc sinh học / Thảo dược / Thức ăn
  quantity: string;
  isolationDays: number; // Thời gian cách ly (ngày)
  weather: string;
  photos: string[];
  isSecured: boolean;
  hashString: string;
  verifiedBy: string;
}

export interface InventoryItem {
  id: string;
  htxId: string;
  code: string;
  name: string;
  category: 'Phân bón vi sinh' | 'Hạt giống & Cây/Con giống' | 'Chế phẩm sinh học BVTV' | 'Thức ăn chăn nuôi' | 'Bao bì & Tem nhãn';
  unit: string;
  stockQty: number;
  minStockAlert: number;
  unitPrice: number;
  supplier: string;
  location: string;
  expiryDate?: string;
}

export interface StockTransaction {
  id: string;
  htxId: string;
  type: 'in' | 'out';
  date: string;
  code: string;
  itemName: string;
  quantity: number;
  unit: string;
  partnerName: string;
  actorName: string;
  notes: string;
}

export interface HarvestBatch {
  id: string;
  htxId: string;
  batchCode: string;
  zoneId?: string;
  zoneName: string;
  productName: string;
  varietyCode?: string;
  seasonCode?: string;
  harvestDate: string;
  totalWeightKg: number;
  grade1Kg: number;
  grade2Kg: number;
  moistureOrFatRate: string; // Độ ẩm thóc (%) / Tỷ lệ nạc / Độ Brix ngọt của nhãn
  status: 'Mới thu hoạch' | 'Đã sơ chế' | 'Đã đóng gói QR';
  leadFarmer: string;
}

export interface PackagedProduct {
  id: string;
  htxId: string;
  qrCode: string;
  batchCode: string;
  productName: string;
  weightSpec: string;
  packDate: string;
  expiryDate: string;
  status: 'Sẵn sàng bán' | 'Đang lưu kho' | 'Đã xuất kho';
  standard: string;
  sampleImg: string;
}

export interface OrderItem {
  productName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  amount: number;
}

export interface SalesOrder {
  id: string;
  htxId: string;
  orderCode: string;
  partnerId?: string;
  customerName: string;
  customerPhone: string;
  customerType: 'Đại lý phân phối' | 'Siêu thị' | 'Thương lái' | 'Khách lẻ tiêu dùng';
  orderDate: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'Đã thanh toán' | 'Chờ giao hàng' | 'Đang xử lý';
  invoiceCode: string;
}

export interface NotificationItem {
  id: string;
  htxId?: string;
  title: string;
  content: string;
  type: 'urgent' | 'warning' | 'info';
  createdAt: string;
  isRead: boolean;
  sender: string;
  receiverGroup: string;
}

export interface TechnicalManual {
  id: string;
  title: string;
  category: 'Trồng trọt' | 'Chăn nuôi' | 'Thủy sản' | 'Tiêu chuẩn VietGAP';
  author: string;
  publishedDate: string;
  fileSize: string;
  summary: string;
  downloadUrl?: string;
  fileName?: string;
  fileType?: string;
  fileDataUrl?: string;
  steps?: { step: string; title: string; detail: string }[];
}
