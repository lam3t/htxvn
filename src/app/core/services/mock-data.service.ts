import { Injectable } from '@angular/core';
import {
  HTXInfo, User, Member, ProductionZone, ProductionProcess,
  ProductionLog, InventoryItem, HarvestBatch,
  PackagedProduct, SalesOrder, NotificationItem, TechnicalManual,
  MasterDataItem, SeasonInfo, VarietyInfo, PartnerInfo,
  ProductInfo, PartnerCommitment
} from '../models/htx.model';

@Injectable({
  providedIn: 'root'
})
export class MockDataService {
  // DANH SÁCH CÁC HỢP TÁC XÃ (HỖ TRỢ MỞ RỘNG VÔ HẠN HTX MỚI)
  readonly cooperatives: HTXInfo[] = [
    {
      id: 'htx-anninh',
      name: 'HTX Dịch vụ Nông nghiệp An Ninh',
      shortName: 'HTX Lúa An Ninh',
      code: 'HTX-AN-HY',
      farmingType: 'crop',
      category: 'Lúa sạch & Gạo',
      primaryProduct: 'Gạo sạch Bắc Thơm 7 & ST25 Hưng Yên',
      address: 'Thôn An Lạc, Xã An Ninh, Huyện Tiên Lữ, Tỉnh Hưng Yên',
      district: 'Huyện Tiên Lữ',
      representative: 'Vũ Văn Thiện (Chủ tịch HĐQT kiêm GĐ)',
      phone: '0983 245 118',
      email: 'htx.anninh.hungyen@gmail.com',
      taxCode: '0900889988',
      logo: '🌾',
      ocopLevel: 'OCOP 4 sao & VietGAP',
      establishedYear: 2016,
      totalMembers: 48,
      totalAreaHa: 45.5,
      description: 'Chuyên canh lúa chất lượng cao theo tiêu chuẩn hữu cơ và VietGAP, liên kết chuỗi giá trị từ giống đến bao tiêu sản phẩm.',
      bannerImage: 'assets/images/banner-rice.jpg',
      status: 'active'
    },
    {
      id: 'htx-dongtao',
      name: 'HTX Chăn nuôi và Kinh doanh Gà Đông Tảo',
      shortName: 'HTX Gà Đông Tảo',
      code: 'HTX-DT-HY',
      farmingType: 'livestock',
      category: 'Gà Đông Tảo thuần chủng',
      primaryProduct: 'Gà Đông Tảo giống thuần & Gà thịt thả vườn OCOP',
      address: 'Xóm Đông, Xã Đông Tảo, Huyện Khoái Châu, Tỉnh Hưng Yên',
      district: 'Huyện Khoái Châu',
      representative: 'Lê Quang Thắng (Giám đốc HTX)',
      phone: '0912 688 339',
      email: 'gadongtao.hungyen@htx.vn',
      taxCode: '0900776655',
      logo: '🐓',
      ocopLevel: 'OCOP 4 sao',
      establishedYear: 2015,
      totalMembers: 32,
      totalAreaHa: 18.2,
      description: 'Bảo tồn nguồn gen quý gà Đông Tảo tiến vua thuần chủng, quy trình chăn thả tự nhiên đạt chuẩn an toàn sinh học.',
      bannerImage: 'assets/images/banner-chicken.jpg',
      status: 'active'
    },
    {
      id: 'htx-quyetthang',
      name: 'HTX Cây ăn quả đặc sản & Nuôi trồng Thủy sản Quyết Thắng',
      shortName: 'HTX Quyết Thắng',
      code: 'HTX-QT-HY',
      farmingType: 'crop',
      category: 'Nhãn lồng & Thủy sản',
      primaryProduct: 'Nhãn lồng Miền Thiết OCOP & Cá lăng sông Hồng',
      address: 'Thôn Tam Đa, Xã Tân Hưng, Thành phố Hưng Yên, Tỉnh Hưng Yên',
      district: 'TP Hưng Yên',
      representative: 'Trần Văn Mỹ (Chủ tịch HĐQT)',
      phone: '0978 112 556',
      email: 'nhanlongquyetthang@htx.vn',
      taxCode: '0900665544',
      logo: '🌳',
      ocopLevel: 'OCOP 4 sao & VietGAP Global',
      establishedYear: 2018,
      totalMembers: 36,
      totalAreaHa: 32.0,
      description: 'Vùng trồng nhãn lồng cổ thụ kết hợp nuôi thủy sản ven sông Hồng, áp dụng công nghệ số và nhật ký điện tử.',
      bannerImage: 'assets/images/banner-longan.jpg',
      status: 'active'
    }
  ];

  // DANH MỤC THƯƠNG PHẨM & NÔNG SẢN SỐ HÓA ĐỐI TƯỢNG (DIGITIZED PRODUCTS MASTER)
  readonly products: ProductInfo[] = [
    {
      id: 'sp-st25',
      code: 'SP-GAO-ST25',
      name: 'Gạo sạch ST25 An Ninh (Túi 5kg)',
      category: 'Lúa gạo & Nông sản khô',
      farmingType: 'crop',
      htxId: 'htx-anninh',
      htxName: 'HTX Nông nghiệp An Ninh',
      unit: 'túi 5kg',
      standard: 'OCOP 4 Sao & VietGAP',
      defaultUnitPrice: 165000,
      varietyCode: 'G-ST25',
      varietyName: 'Giống lúa ST25 Thượng Hạng',
      packagingSpec: 'Túi 5kg PA hút chân không chống ẩm mốc',
      shelfLifeDays: 365,
      description: 'Gạo thơm dẻo đậm đà, đạt giải nhì gạo ngon thế giới, canh tác theo quy chuẩn VietGAP hữu cơ tại cánh đồng mẫu lớn An Ninh.',
      status: 'active'
    },
    {
      id: 'sp-bt07',
      code: 'SP-GAO-BT07',
      name: 'Gạo Bắc Thơm số 7 Tiên Lữ Thượng Hạng',
      category: 'Lúa gạo & Nông sản khô',
      farmingType: 'crop',
      htxId: 'htx-anninh',
      htxName: 'HTX Nông nghiệp An Ninh',
      unit: 'túi 5kg',
      standard: 'VietGAP Trồng Trọt',
      defaultUnitPrice: 125000,
      varietyCode: 'G-BT07',
      varietyName: 'Giống lúa Bắc Thơm số 7 Kháng Bạc Lá',
      packagingSpec: 'Bao 5kg / Bao 10kg dệt PE màng ghép',
      shelfLifeDays: 180,
      description: 'Cơm dẻo mềm, thơm dịu hương lúa mới phù sa sông Luộc, canh tác không thuốc trừ sâu hóa học độc hại.',
      status: 'active'
    },
    {
      id: 'sp-ga-khay',
      code: 'SP-GA-DT-KHAY',
      name: 'Thịt Gà Đông Tảo Làm Sẵn Đóng Khay Fresh',
      category: 'Gia cầm & Thịt đặc sản',
      farmingType: 'livestock',
      htxId: 'htx-dongtao',
      htxName: 'HTX Gà Đông Tảo',
      unit: 'khay 1 con (1.8 - 2.2kg)',
      standard: 'OCOP 4 Sao & Chuỗi An Toàn',
      defaultUnitPrice: 580000,
      varietyCode: 'G-DT01',
      varietyName: 'Gà Đông Tảo thuần chủng F1',
      packagingSpec: 'Khay xốp thực phẩm bọc màng co hút chân không cấp đông',
      shelfLifeDays: 30,
      description: 'Gà chăn thả tự nhiên ăn ngô mầm và thảo dược, thịt chắc ngọt, da giòn sần sật, đã qua kiểm dịch thú y.',
      status: 'active'
    },
    {
      id: 'sp-ga-bieu',
      code: 'SP-GA-DT-BIEU',
      name: 'Gà Đông Tảo Tiến Vua Chân Khủng Biếu Tết',
      category: 'Gia cầm & Thịt đặc sản',
      farmingType: 'livestock',
      htxId: 'htx-dongtao',
      htxName: 'HTX Gà Đông Tảo',
      unit: 'con (3.8 - 5.0kg)',
      standard: 'Nguồn gen quý bản địa OCOP 4 Sao',
      defaultUnitPrice: 2500000,
      varietyCode: 'G-DT01',
      varietyName: 'Gà Đông Tảo thuần chủng F1 chân vảy rồng',
      packagingSpec: 'Lồng mây nan tre truyền thống kèm giấy chứng nhận nguồn gen',
      shelfLifeDays: 90,
      description: 'Cặp chân to vảy rồng đỏ tía, ngực nở mã đẹp, nuôi thả 12-16 tháng chuyên phục vụ biếu tặng ngoại giao & Tết.',
      status: 'active'
    },
    {
      id: 'sp-nhan-mt',
      code: 'SP-NHAN-MIENTHIET',
      name: 'Nhãn Lồng Miền Thiết Hưng Chi OCOP 4 Sao',
      category: 'Trái cây & Nông sản tươi',
      farmingType: 'crop',
      htxId: 'htx-quyetthang',
      htxName: 'HTX Cây ăn quả Quyết Thắng',
      unit: 'hộp 2kg',
      standard: 'OCOP 4 Sao & Chỉ dẫn địa lý',
      defaultUnitPrice: 110000,
      varietyCode: 'G-NL01',
      varietyName: 'Nhãn lồng Miền Thiết Hương Chi',
      packagingSpec: 'Hộp carton quai xách in nhận diện nhãn lồng Hưng Yên',
      shelfLifeDays: 14,
      description: 'Cùi dày giòn, ráo nước, vân múi rõ rệt, vị ngọt thanh lưu luyến đặc trưng của đất Phố Hiến.',
      status: 'active'
    },
    {
      id: 'sp-long-nhan',
      code: 'SP-LONG-NHAN-PH',
      name: 'Long Nhãn Ôm Hạt Sen Sấy Dẻo Thượng Hạng',
      category: 'Chế biến & Đặc sản',
      farmingType: 'crop',
      htxId: 'htx-quyetthang',
      htxName: 'HTX Cây ăn quả Quyết Thắng',
      unit: 'hộp 500g',
      standard: 'OCOP 4 Sao & ISO 22000',
      defaultUnitPrice: 180000,
      varietyCode: 'G-NL01',
      varietyName: 'Nhãn lồng Miền Thiết',
      packagingSpec: 'Hũ PET nắp nhôm xé màng seal cao cấp',
      shelfLifeDays: 365,
      description: 'Sấy nhiệt lạnh giữ trọn hương thơm mật ong tự nhiên, kết hợp hạt sen khô bùi ngậy.',
      status: 'active'
    },
    {
      id: 'sp-ca-lang',
      code: 'SP-CA-LANG-SH',
      name: 'Cá Lăng Đen Sông Hồng Sống Sục Khí',
      category: 'Thủy hải sản Sông Hồng',
      farmingType: 'aquaculture',
      htxId: 'htx-quyetthang',
      htxName: 'HTX Cây ăn quả & NTTS Quyết Thắng',
      unit: 'kg',
      standard: 'VietGAP Thủy sản',
      defaultUnitPrice: 145000,
      varietyCode: 'G-CL01',
      varietyName: 'Cá Lăng Đen F1 giống khỏe',
      packagingSpec: 'Thùng oxy nước tuần hoàn vận chuyển tận nhà hàng',
      shelfLifeDays: 3,
      description: 'Nuôi lồng bè nước chảy sông Hồng, thịt cá trắng ngần, không mỡ, giàu đạm và collagen.',
      status: 'active'
    }
  ];

  // DANH MỤC DÙNG CHUNG PHÂN CẤP CHUẨN (MASTER DATA ITEMS)
  readonly masterDataItems: MasterDataItem[] = [
    // 0. Sản phẩm & Nông sản thương phẩm OCOP số hóa
    { id: 'md-sp-01', categoryCode: 'MD-SAN-PHAM', code: 'SP-GAO-ST25', name: 'Gạo sạch ST25 An Ninh (Túi 5kg)', subType: 'Lúa gạo & Nông sản khô', unit: 'Túi 5kg', standard: 'OCOP 4 Sao & VietGAP', status: 'active', effectiveDate: '01/01/2026', description: 'Gạo ST25 chuẩn cơm dẻo thơm, đóng túi hút chân không bảo quản 1 năm' },
    { id: 'md-sp-02', categoryCode: 'MD-SAN-PHAM', code: 'SP-GAO-BT07', name: 'Gạo Bắc Thơm số 7 Tiên Lữ Thượng Hạng', subType: 'Lúa gạo & Nông sản khô', unit: 'Túi 5kg', standard: 'VietGAP Trồng Trọt', status: 'active', effectiveDate: '01/01/2026', description: 'Gạo Bắc Thơm 7 hạt nhỏ dẻo đậm phù sa sông Luộc' },
    { id: 'md-sp-03', categoryCode: 'MD-SAN-PHAM', code: 'SP-GA-DT-KHAY', name: 'Thịt Gà Đông Tảo Làm Sẵn Đóng Khay Fresh', subType: 'Gia cầm & Thịt đặc sản', unit: 'Khay 1 con', standard: 'OCOP 4 Sao', status: 'active', effectiveDate: '01/01/2026', description: 'Gà Đông Tảo thịt săn ngọt bọc màng co hút chân không cấp đông' },
    { id: 'md-sp-04', categoryCode: 'MD-SAN-PHAM', code: 'SP-GA-DT-BIEU', name: 'Gà Đông Tảo Tiến Vua Chân Khủng Biếu Tết', subType: 'Gia cầm & Thịt đặc sản', unit: 'Con (3.8-5kg)', standard: 'Bảo tồn nguồn gen quý', status: 'active', effectiveDate: '01/01/2026', description: 'Gà trống biếu Tết chân to vảy rồng quý hiếm' },
    { id: 'md-sp-05', categoryCode: 'MD-SAN-PHAM', code: 'SP-NHAN-MIENTHIET', name: 'Nhãn Lồng Miền Thiết Hưng Chi OCOP 4 Sao', subType: 'Trái cây & Nông sản tươi', unit: 'Hộp 2kg', standard: 'OCOP 4 Sao & CDĐL', status: 'active', effectiveDate: '01/01/2026', description: 'Cùi dày giòn, ráo nước ngọt thanh đặc trưng Hưng Yên' },
    { id: 'md-sp-06', categoryCode: 'MD-SAN-PHAM', code: 'SP-LONG-NHAN-PH', name: 'Long Nhãn Ôm Hạt Sen Sấy Dẻo Thượng Hạng', subType: 'Chế biến & Đặc sản', unit: 'Hộp 500g', standard: 'OCOP 4 Sao & ISO 22000', status: 'active', effectiveDate: '01/01/2026', description: 'Long nhãn sấy nhiệt lạnh ôm hạt sen bùi béo' },
    { id: 'md-sp-07', categoryCode: 'MD-SAN-PHAM', code: 'SP-CA-LANG-SH', name: 'Cá Lăng Đen Sông Hồng Sống Sục Khí', subType: 'Thủy hải sản Sông Hồng', unit: 'kg', standard: 'VietGAP Thủy sản', status: 'active', effectiveDate: '01/01/2026', description: 'Cá lăng nuôi lồng bè ven sông Hồng giao tươi sống tận nơi' },

    // 1. Giống cây trồng & vật nuôi
    { id: 'md-g-01', categoryCode: 'MD-GIONG', code: 'G-ST25', name: 'Giống lúa ST25 Thượng Hạng', subType: 'Lúa thơm chất lượng cao', unit: 'kg giống', standard: 'TCVN 11892-1:2017', status: 'active', effectiveDate: '01/01/2026', description: 'Gạo ngon nhất thế giới, khả năng chống chịu mặn và sâu bệnh tốt' },
    { id: 'md-g-02', categoryCode: 'MD-GIONG', code: 'G-BT07', name: 'Giống lúa Bắc Thơm số 7 Kháng Bạc Lá', subType: 'Lúa thuần', unit: 'kg giống', standard: 'Chuẩn Bộ NN&PTNT', status: 'active', effectiveDate: '01/01/2026', description: 'Cơm mềm thơm đậm đà, thích hợp thổ nhưỡng phù sa Hưng Yên' },
    { id: 'md-g-03', categoryCode: 'MD-GIONG', code: 'G-DT01', name: 'Gà Đông Tảo thuần chủng F1 chân vảy rồng', subType: 'Gia cầm đặc sản', unit: 'con giống', standard: 'Quy chuẩn giống bản địa', status: 'active', effectiveDate: '01/01/2026', description: 'Nguồn gen quý tiến vua, chân to đỏ tía, thịt chắc ngọt' },
    { id: 'md-g-04', categoryCode: 'MD-GIONG', code: 'G-NL01', name: 'Nhãn lồng Miền Thiết Hương Chi', subType: 'Cây ăn quả đặc sản', unit: 'cây giống', standard: 'Chỉ dẫn địa lý Hưng Yên', status: 'active', effectiveDate: '01/01/2026', description: 'Cùi dày, ráo nước, độ ngọt 22-23°Bx, quả to đều' },
    { id: 'md-g-05', categoryCode: 'MD-GIONG', code: 'G-CL01', name: 'Cá Lăng Đen Sông Hồng giống F1', subType: 'Thủy sản nước ngọt', unit: 'con giống (100g)', standard: 'VietGAP Thủy sản', status: 'active', effectiveDate: '01/01/2026', description: 'Cá khỏe, lớn nhanh trong lồng nước chảy, thịt săn chắc không mỡ' },

    // 2. Mùa vụ sản xuất chuẩn
    { id: 'md-mv-01', categoryCode: 'MD-MUA-VU', code: 'VU-XUAN-2026', name: 'Vụ Đông Xuân 2026', subType: 'Trồng trọt', standard: 'Khung lịch thời vụ Sở NN', status: 'active', effectiveDate: '15/01/2026', description: 'Gieo cấy mạ xuân muộn tháng 1-2, thu hoạch tháng 5-6' },
    { id: 'md-mv-02', categoryCode: 'MD-MUA-VU', code: 'VU-MUA-2026', name: 'Vụ Mùa 2026 (Chính vụ)', subType: 'Trồng trọt', standard: 'Khung lịch thời vụ Sở NN', status: 'active', effectiveDate: '15/06/2026', description: 'Gieo cấy tháng 6-7, thu hoạch tháng 10-11' },
    { id: 'md-mv-03', categoryCode: 'MD-MUA-VU', code: 'VU-TET-2026', name: 'Vụ Chăn Nuôi Phục Vụ Tết 2026', subType: 'Chăn nuôi', standard: 'An toàn sinh học', status: 'active', effectiveDate: '01/03/2026', description: 'Vào đàn tháng 3-4, xuất bán phục vụ Tết Nguyên Đán' },
    { id: 'md-mv-04', categoryCode: 'MD-MUA-VU', code: 'VU-THUY-SAN-2026', name: 'Vụ Thủy Sản Sông Hồng 2026-2027', subType: 'Thủy sản', standard: 'VietGAP Lồng Bè', status: 'active', effectiveDate: '01/04/2026', description: 'Chu kỳ nuôi 12-18 tháng đạt thương phẩm 3-4kg' },

    // 3. Phân bón & Thuốc BVTV Sinh học cho phép
    { id: 'md-vt-01', categoryCode: 'MD-PHAN-BVTV', code: 'VT-PB-QL01', name: 'Phân vi sinh Quế Lâm NPK 12-5-10 hữu cơ', subType: 'Phân bón vi sinh', unit: 'Bao (50kg)', standard: 'Hợp chuẩn hữu cơ VN', status: 'active', effectiveDate: '01/01/2026', description: 'Bổ sung chủng vi sinh vật phân giải lân và đối kháng nấm bệnh' },
    { id: 'md-vt-02', categoryCode: 'MD-PHAN-BVTV', code: 'VT-PB-TQ02', name: 'Phân hữu cơ trùn quế cao cấp', subType: 'Phân bón hữu cơ', unit: 'Bao (25kg)', standard: 'Hữu cơ vi sinh', status: 'active', effectiveDate: '01/01/2026', description: 'Cải tạo độ phì nhiêu đất, giữ ẩm rễ lúa và cây ăn quả' },
    { id: 'md-vt-03', categoryCode: 'MD-PHAN-BVTV', code: 'VT-SH-TRI01', name: 'Chế phẩm sinh học Trichoderma Bacillus', subType: 'Chế phẩm phòng trừ sinh học', unit: 'Lít / Chai', standard: 'Danh mục BVTV sinh học', status: 'active', effectiveDate: '01/01/2026', description: 'Đối kháng nấm đạo ôn, vàng lùn, phòng bệnh thối rễ' },
    { id: 'md-vt-04', categoryCode: 'MD-PHAN-BVTV', code: 'VT-EM-01', name: 'Chế phẩm vi sinh EM gốc (Ủ phân & Đệm lót)', subType: 'Men ủ vi sinh', unit: 'Lít', standard: 'Vi sinh an toàn', status: 'active', effectiveDate: '01/01/2026', description: 'Lên men phân chuồng, làm đệm lót trấu khử mùi chuồng gà 100%' },

    // 4. Vắc-xin & Thức ăn chăn nuôi
    { id: 'md-vx-01', categoryCode: 'MD-VACXIN-THUCAN', code: 'VX-LASOTA', name: 'Vắc-xin phòng bệnh Newcastle (La Sota)', subType: 'Vắc-xin gia cầm', unit: 'Lọ (100 liều)', standard: 'Thú y quốc gia', status: 'active', effectiveDate: '01/01/2026', description: 'Nhỏ mắt mũi định kỳ cho gà con 7 và 21 ngày tuổi' },
    { id: 'md-vx-02', categoryCode: 'MD-VACXIN-THUCAN', code: 'VX-GUMBORO', name: 'Vắc-xin phòng bệnh Gumboro chủng trung bình', subType: 'Vắc-xin gia cầm', unit: 'Lọ (100 liều)', standard: 'Thú y quốc gia', status: 'active', effectiveDate: '01/01/2026', description: 'Uống định kỳ phòng suy giảm miễn dịch đàn gà' },
    { id: 'md-ta-01', categoryCode: 'MD-VACXIN-THUCAN', code: 'TA-NGO-01', name: 'Ngô mảnh quê ủ mầm lên men men tiêu hóa', subType: 'Thức ăn tự phối trộn', unit: 'Bao (40kg)', standard: 'Không kháng sinh', status: 'active', effectiveDate: '01/01/2026', description: 'Dinh dưỡng tự nhiên giúp thịt thơm ngon, chân đỏ vàng' },
    { id: 'md-ta-02', categoryCode: 'MD-VACXIN-THUCAN', code: 'TA-CAM-CA01', name: 'Cám viên nổi đạm 40% chuyên dụng cho Cá Lăng', subType: 'Thức ăn thủy sản', unit: 'Bao (25kg)', standard: 'Độ đạm cao không tan nước', status: 'active', effectiveDate: '01/01/2026', description: 'Kích thích cá tăng trọng nhanh, không gây đục môi trường nước lồng' },

    // 5. Tiêu chuẩn chất lượng
    { id: 'md-tc-01', categoryCode: 'MD-STANDARDS', code: 'TC-OCOP-4S', name: 'Chứng nhận Sản Phẩm OCOP 4 Sao', subType: 'Xếp hạng quốc gia', standard: 'Quyết định UBND', status: 'active', effectiveDate: '01/01/2024', description: 'Sản phẩm đặc sản đạt chuẩn tham gia chuỗi bán lẻ hiện đại' },
    { id: 'md-tc-02', categoryCode: 'MD-STANDARDS', code: 'TC-VIETGAP-TT', name: 'Tiêu chuẩn VietGAP Trồng Trọt', subType: 'Quy chuẩn nông nghiệp', standard: 'TCVN 11892-1:2017', status: 'active', effectiveDate: '01/01/2025', description: 'Quy trình thực hành sản xuất nông nghiệp tốt cho lúa và cây ăn quả' },
    { id: 'md-tc-03', categoryCode: 'MD-STANDARDS', code: 'TC-CDDL-HY', name: 'Chỉ Dẫn Địa Lý Hưng Yên', subType: 'Bảo hộ nhãn hiệu', standard: 'Cục Sở hữu Trí tuệ', status: 'active', effectiveDate: '01/01/2023', description: 'Văn bằng bảo hộ nguồn gốc xuất xứ đặc sản địa phương' },

    // 6. Đơn vị đo lường
    { id: 'md-dvt-01', categoryCode: 'MD-DVT', code: 'DVT-SAO-BB', name: 'Sào Bắc Bộ', subType: 'Diện tích', unit: '360 m²', status: 'active', description: 'Đơn vị đo lường ruộng đất truyền thống miền Bắc' },
    { id: 'md-dvt-02', categoryCode: 'MD-DVT', code: 'DVT-HA', name: 'Héc-ta', subType: 'Diện tích', unit: '10,000 m² (27.78 sào)', status: 'active', description: 'Đơn vị đo lường diện tích chuẩn quốc tế' },
    { id: 'md-dvt-03', categoryCode: 'MD-DVT', code: 'DVT-TAN', name: 'Tấn', subType: 'Khối lượng', unit: '1,000 kg', status: 'active', description: 'Đơn vị tính sản lượng thu hoạch lớn' }
  ];

  // DANH SÁCH ĐỐI TÁC & KÊNH PHÂN PHỐI TỔNG QUAN (SỐ HÓA CAM KẾT THEO SẢN PHẨM)
  readonly partners: PartnerInfo[] = [
    {
      id: 'part-01',
      code: 'DT-WINMART',
      name: 'Tập đoàn WinCommerce (Chuỗi Siêu Thị WinMart / WinMart+)',
      type: 'Siêu thị / Bán lẻ',
      contactPerson: 'Nguyễn Thị Thu Hà (Giám đốc Thu mua Nông sản Miền Bắc)',
      phone: '024 7109 8888',
      email: 'thumua.nongsan@wincommerce.com',
      address: 'Tầng 5, Tòa nhà Century Tower, Times City, Hà Nội',
      contractNumber: 'HĐ-WCM-HY-2026/01',
      contractSignDate: '01/01/2026',
      contractExpiryDate: '31/12/2026',
      contractStatus: 'Đang hiệu lực',
      debtStatus: 'Thanh toán đúng hạn (T+15)',
      productsLinked: ['Gạo sạch ST25 An Ninh', 'Nhãn Lồng Miền Thiết OCOP', 'Thịt Gà Đông Tảo Làm Sẵn Đóng Khay Fresh'],
      annualCommitment: '850 tấn gạo + 30 tấn nhãn/năm + 5.000 khay gà',
      commitments: [
        {
          id: 'cm-01',
          productId: 'sp-st25',
          productCode: 'SP-GAO-ST25',
          productName: 'Gạo sạch ST25 An Ninh',
          targetQuantity: 850,
          unit: 'tấn',
          period: 'năm',
          contractPrice: 28000000, // 28.000 đ/kg = 28tr/tấn
          totalCommittedValue: 23800000000, // 23.8 tỷ
          notes: 'Giao hàng định kỳ 2 lần/tháng tới tổng kho Mê Linh'
        },
        {
          id: 'cm-02',
          productId: 'sp-nhan-mt',
          productCode: 'SP-NHAN-MIENTHIET',
          productName: 'Nhãn Lồng Miền Thiết OCOP',
          targetQuantity: 30,
          unit: 'tấn',
          period: 'vụ',
          contractPrice: 48000000, // 48.000 đ/kg
          totalCommittedValue: 1440000000, // 1.44 tỷ
          notes: 'Thu mua toàn bộ chính vụ tháng 7-8'
        },
        {
          id: 'cm-03',
          productId: 'sp-ga-khay',
          productCode: 'SP-GA-DT-KHAY',
          productName: 'Gà Đông Tảo đóng khay Fresh',
          targetQuantity: 5000,
          unit: 'khay',
          period: 'năm',
          contractPrice: 480000,
          totalCommittedValue: 2400000000, // 2.4 tỷ
          notes: 'Phân phối 50 siêu thị WinMart Premium nội thành Hà Nội'
        }
      ]
    },
    {
      id: 'part-02',
      code: 'DT-BACTOM',
      name: 'Chuỗi Cửa Hàng Thực Phẩm Sạch Bác Tôm',
      type: 'Doanh nghiệp bao tiêu',
      contactPerson: 'Trần Mạnh Cường (Tổng Giám đốc)',
      phone: '0903 221 445',
      email: 'bactom.organic@gmail.com',
      address: 'Số 11 Hoa Lư, Quận Hai Bà Trưng, Hà Nội',
      contractNumber: 'HĐ-BT-HY-2026/08',
      contractSignDate: '15/01/2026',
      contractExpiryDate: '15/01/2027',
      contractStatus: 'Đang hiệu lực',
      debtStatus: 'Đã quyết toán tháng gần nhất',
      productsLinked: ['Gạo Bắc Thơm số 7 Tiên Lữ', 'Gà Đông Tảo thả vườn', 'Cá Lăng Đen Sông Hồng Sống'],
      annualCommitment: '120 tấn gạo + 3.000 con gà + 10 tấn cá lăng',
      commitments: [
        {
          id: 'cm-04',
          productId: 'sp-bt07',
          productCode: 'SP-GAO-BT07',
          productName: 'Gạo Bắc Thơm số 7 Tiên Lữ',
          targetQuantity: 120,
          unit: 'tấn',
          period: 'năm',
          contractPrice: 22000000,
          totalCommittedValue: 2640000000,
          notes: 'Bao tiêu độc quyền chuỗi 25 điểm bán Bác Tôm'
        },
        {
          id: 'cm-05',
          productId: 'sp-ga-khay',
          productCode: 'SP-GA-DT-KHAY',
          productName: 'Gà Đông Tảo thả vườn',
          targetQuantity: 3000,
          unit: 'con',
          period: 'năm',
          contractPrice: 450000,
          totalCommittedValue: 1350000000,
          notes: 'Giao hàng tươi sống hàng ngày'
        },
        {
          id: 'cm-06',
          productId: 'sp-ca-lang',
          productCode: 'SP-CA-LANG-SH',
          productName: 'Cá Lăng Đen Sông Hồng sống',
          targetQuantity: 10,
          unit: 'tấn',
          period: 'năm',
          contractPrice: 135000000,
          totalCommittedValue: 1350000000,
          notes: 'Cá sống sục khí giao tại 8 cửa hàng trọng điểm'
        }
      ]
    },
    {
      id: 'part-03',
      code: 'DT-QUELAM',
      name: 'Tập đoàn Nông nghiệp Hữu cơ Quế Lâm Miền Bắc',
      type: 'Nhà cung ứng vật tư',
      contactPerson: 'Kỹ sư Hoàng Văn Thành',
      phone: '024 3822 5566',
      email: 'quelam.nongnghiep@gmail.com',
      address: 'KCN Phố Nối A, Huyện Văn Lâm, Tỉnh Hưng Yên',
      contractNumber: 'HĐ-QL-HY-2026/VT03',
      contractSignDate: '01/01/2026',
      contractExpiryDate: '31/12/2027',
      contractStatus: 'Đang hiệu lực',
      debtStatus: 'Hạn mức tín dụng 2 tỷ đồng',
      productsLinked: ['Phân vi sinh Quế Lâm NPK', 'Men ủ vi sinh EM gốc'],
      annualCommitment: 'Cung ứng 450 tấn phân vi sinh/năm (Hỗ trợ trả chậm)',
      commitments: [
        {
          id: 'cm-07',
          productId: 'vt-pb-ql01',
          productCode: 'VT-PB-QL01',
          productName: 'Phân vi sinh Quế Lâm NPK 12-5-10',
          targetQuantity: 450,
          unit: 'tấn',
          period: 'năm',
          contractPrice: 12500000,
          totalCommittedValue: 5625000000,
          notes: 'Cung ứng theo thời vụ gieo cấy lúa & chăm nhãn'
        },
        {
          id: 'cm-08',
          productId: 'vt-em-01',
          productCode: 'VT-EM-01',
          productName: 'Men ủ vi sinh EM gốc',
          targetQuantity: 2500,
          unit: 'lít',
          period: 'năm',
          contractPrice: 85000,
          totalCommittedValue: 212500000,
          notes: 'Phục vụ xử lý đệm lót chuồng chăn nuôi gà an toàn sinh học'
        }
      ]
    },
    {
      id: 'part-04',
      code: 'DT-PHOHIEN-REST',
      name: 'Chuỗi Nhà Hàng Ẩm Thực Phố Hiến & Đặc Sản Hưng Yên',
      type: 'Đại lý phân phối',
      contactPerson: 'Lê Thanh Bình (Chủ nhà hàng)',
      phone: '0988 776 554',
      email: 'amthucphohien@gmail.com',
      address: 'Đường Chu Mạnh Trinh, Phường Hiến Nam, TP Hưng Yên',
      contractNumber: 'HĐ-PH-HY-2026/05',
      contractSignDate: '10/02/2026',
      contractExpiryDate: '10/02/2027',
      contractStatus: 'Đang hiệu lực',
      debtStatus: 'Thanh toán theo tuần',
      productsLinked: ['Gà Đông Tảo chân khủng biếu Tết', 'Cá Lăng Đen Sông Hồng sống', 'Long Nhãn Ôm Sen'],
      annualCommitment: '3.500 con gà + 15 tấn cá sống + 2.000 hộp long nhãn',
      commitments: [
        {
          id: 'cm-09',
          productId: 'sp-ga-bieu',
          productCode: 'SP-GA-DT-BIEU',
          productName: 'Gà Đông Tảo chân khủng biếu Tết',
          targetQuantity: 3500,
          unit: 'con',
          period: 'năm',
          contractPrice: 1800000,
          totalCommittedValue: 6300000000,
          notes: 'Thu mua gà trống chân to phục vụ tiệc & khách du lịch'
        },
        {
          id: 'cm-10',
          productId: 'sp-ca-lang',
          productCode: 'SP-CA-LANG-SH',
          productName: 'Cá Lăng Đen Sông Hồng sống sục khí',
          targetQuantity: 15,
          unit: 'tấn',
          period: 'năm',
          contractPrice: 140000000,
          totalCommittedValue: 2100000000,
          notes: 'Tiêu thụ tại 3 nhà hàng lớn ven đầm Bán Nguyệt'
        },
        {
          id: 'cm-11',
          productId: 'sp-long-nhan',
          productCode: 'SP-LONG-NHAN-PH',
          productName: 'Long Nhãn Ôm Sen Phố Hiến',
          targetQuantity: 2000,
          unit: 'hộp',
          period: 'năm',
          contractPrice: 160000,
          totalCommittedValue: 320000000,
          notes: 'Làm quà tặng đặc sản du khách'
        }
      ]
    }
  ];

  // TÀI KHOẢN ĐĂNG NHẬP MẪU
  readonly demoUsers: User[] = [
    {
      id: 'u-admin',
      username: 'admin',
      name: 'Trần Quang Minh',
      role: 'admin',
      roleTitle: 'Quản trị viên Hệ thống HTX',
      htxId: 'htx-anninh',
      phone: '0904 888 999',
      avatar: '👨‍💼',
      isSystemAdmin: true
    },
    {
      id: 'u-dir-anninh',
      username: 'director_anninh',
      name: 'Vũ Văn Thiện',
      role: 'director',
      roleTitle: 'Giám đốc HTX An Ninh',
      htxId: 'htx-anninh',
      phone: '0983 245 118',
      avatar: '👨‍🌾'
    },
    {
      id: 'u-tech-anninh',
      username: 'tech_anninh',
      name: 'Đặng Văn Hùng',
      role: 'technician',
      roleTitle: 'Kỹ sư Nông nghiệp HTX',
      htxId: 'htx-anninh',
      phone: '0977 345 678',
      avatar: '🧑‍🔬'
    },
    {
      id: 'u-acc-anninh',
      username: 'sales_anninh',
      name: 'Nguyễn Thị Mai',
      role: 'accountant',
      roleTitle: 'Kế toán & Bán hàng',
      htxId: 'htx-anninh',
      phone: '0912 345 679',
      avatar: '👩‍💼'
    },
    {
      id: 'u-dir-dongtao',
      username: 'director_dongtao',
      name: 'Lê Quang Thắng',
      role: 'director',
      roleTitle: 'Giám đốc HTX Gà Đông Tảo',
      htxId: 'htx-dongtao',
      phone: '0912 688 339',
      avatar: '👨‍🌾'
    },
    {
      id: 'u-dir-quyetthang',
      username: 'director_quyetthang',
      name: 'Trần Văn Mỹ',
      role: 'director',
      roleTitle: 'Giám đốc HTX Quyết Thắng',
      htxId: 'htx-quyetthang',
      phone: '0978 112 556',
      avatar: '👨‍🌾'
    },
    {
      id: 'u-mem-lan',
      username: 'member_lan',
      name: 'Nguyễn Thị Lan',
      role: 'member',
      roleTitle: 'Xã viên Canh tác Đội 2',
      htxId: 'htx-anninh',
      phone: '0965 223 881',
      avatar: '👵'
    }
  ];

  // DANH SÁCH XÃ VIÊN
  readonly members: Member[] = [
    {
      id: 'm-an-01',
      htxId: 'htx-anninh',
      name: 'Vũ Văn Thiện',
      phone: '0983 245 118',
      address: 'Đội 1, Thôn An Lạc, Xã An Ninh, Tiên Lữ',
      village: 'Thôn An Lạc',
      cccd: '033080001234',
      scale: '2.5 ha (70 sào Bắc Bộ)',
      joinDate: '15/03/2016',
      status: 'active',
      avatar: '👨‍🌾',
      notes: 'Hộ nông dân sản xuất giỏi, đạt chuẩn VietGAP',
      productType: 'Lúa Bắc Thơm 7 & ST25',
      farmingExperienceYears: 25,
      bankAccount: '1029384756 - Agribank Tiên Lữ'
    },
    {
      id: 'm-an-02',
      htxId: 'htx-anninh',
      name: 'Nguyễn Thị Lan',
      phone: '0965 223 881',
      address: 'Đội 2, Thôn An Lạc, Xã An Ninh, Tiên Lữ',
      village: 'Thôn An Lạc',
      cccd: '033182005678',
      scale: '1.8 ha (50 sào Bắc Bộ)',
      joinDate: '20/04/2017',
      status: 'active',
      avatar: '👵',
      notes: 'Tuân thủ 100% nhật ký bón phân hữu cơ vi sinh',
      productType: 'Lúa ST25',
      farmingExperienceYears: 30
    },
    {
      id: 'm-an-03',
      htxId: 'htx-anninh',
      name: 'Trần Bá Thắng',
      phone: '0979 123 456',
      address: 'Đội 3, Thôn Dưỡng Phú, Xã An Ninh, Tiên Lữ',
      village: 'Thôn Dưỡng Phú',
      cccd: '033078009876',
      scale: '3.2 ha cánh đồng mẫu lớn',
      joinDate: '10/01/2018',
      status: 'active',
      avatar: '👨‍🌾',
      notes: 'Tổ trưởng tổ máy gặt đập liên hợp',
      productType: 'Lúa Đài Thơm 8',
      farmingExperienceYears: 18
    },
    {
      id: 'm-an-04',
      htxId: 'htx-anninh',
      name: 'Bùi Văn Tuấn (Đăng ký từ Zalo)',
      phone: '0984 667 889',
      address: 'Thôn An Lạc, Xã An Ninh, Tiên Lữ',
      village: 'Thôn An Lạc',
      cccd: '033090003456',
      scale: '1.5 ha ruộng lúa',
      joinDate: '22/09/2026',
      status: 'pending',
      avatar: '🧑‍🌾',
      notes: 'Đăng ký tham gia chuỗi lúa sạch từ Zalo Mini App. Đang chờ Ban quản trị duyệt.',
      productType: 'Lúa Bắc Thơm 7',
      farmingExperienceYears: 12
    },
    {
      id: 'm-dt-01',
      htxId: 'htx-dongtao',
      name: 'Lê Quang Thắng',
      phone: '0912 688 339',
      address: 'Xóm Đông, Xã Đông Tảo, Khoái Châu',
      village: 'Xóm Đông',
      cccd: '033075001122',
      scale: '1,200 con gà giống F1 & 500 gà biếu Tết',
      joinDate: '01/04/2015',
      status: 'active',
      avatar: '👨‍🌾',
      notes: 'Nghệ nhân nuôi gà Đông Tảo chân vảy rồng thuần chủng',
      productType: 'Gà Đông Tảo giống & thịt',
      farmingExperienceYears: 20
    },
    {
      id: 'm-dt-02',
      htxId: 'htx-dongtao',
      name: 'Tạ Văn Khanh',
      phone: '0978 445 221',
      address: 'Xóm Nam, Xã Đông Tảo, Khoái Châu',
      village: 'Xóm Nam',
      cccd: '033081003344',
      scale: '800 con gà thương phẩm thả vườn',
      joinDate: '15/06/2016',
      status: 'active',
      avatar: '👨‍🌾',
      notes: 'Ứng dụng đệm lót sinh học trấu EM khử mùi 100%',
      productType: 'Gà Đông Tảo thịt',
      farmingExperienceYears: 15
    },
    {
      id: 'm-qt-01',
      htxId: 'htx-quyetthang',
      name: 'Trần Văn Mỹ',
      phone: '0978 112 556',
      address: 'Thôn Tam Đa, Xã Tân Hưng, TP Hưng Yên',
      village: 'Thôn Tam Đa',
      cccd: '033074001999',
      scale: '3.5 ha nhãn lồng Miền Thiết VietGAP',
      joinDate: '10/05/2018',
      status: 'active',
      avatar: '👨‍🌾',
      notes: 'Nhãn đạt chuẩn OCOP 4 sao, độ ngọt 22°Bx',
      productType: 'Nhãn lồng Miền Thiết',
      farmingExperienceYears: 28
    },
    {
      id: 'm-qt-02',
      htxId: 'htx-quyetthang',
      name: 'Nguyễn Văn Lăng',
      phone: '0912 889 001',
      address: 'Bãi bồi Sông Hồng, Xã Tân Hưng, TP Hưng Yên',
      village: 'Bãi Bồi Sông Hồng',
      cccd: '033079004555',
      scale: '16 lồng nuôi cá lăng Sông Hồng (1,200m³)',
      joinDate: '05/03/2019',
      status: 'active',
      avatar: '👨‍🌾',
      notes: 'Cá lồng nước chảy sông Hồng đạt chuẩn VietGAP',
      productType: 'Cá lăng & Thủy sản',
      farmingExperienceYears: 16
    }
  ];

  // DANH SÁCH VÙNG CANH TÁC / TRẠI NUÔI (LIÊN KẾT GIỐNG & MÙA VỤ)
  readonly productionZones: ProductionZone[] = [
    {
      id: 'z-an-01',
      htxId: 'htx-anninh',
      code: 'MSVT-AN-01',
      name: 'Cánh đồng mẫu lớn An Lạc 1 (Lúa ST25)',
      farmingType: 'crop',
      areaHa: 15.0,
      managerName: 'Vũ Văn Thiện',
      managerPhone: '0983 245 118',
      currentCrop: 'Lúa ST25 Thượng Hạng',
      varietyName: 'ST25 Nguyên Chủng F1',
      seasonName: 'Vụ Mùa 2026',
      soilOrWaterType: 'Đất phù sa sông Luộc giàu dinh dưỡng',
      plantingDate: '10/07/2026',
      expectedHarvestDate: '25/10/2026',
      expectedYieldKg: 95000,
      status: 'Sắp thu hoạch',
      statusType: 'harvest',
      locationDesc: 'Thửa đất số 45-80, Tờ bản đồ số 3, Xã An Ninh'
    },
    {
      id: 'z-an-02',
      htxId: 'htx-anninh',
      code: 'MSVT-AN-02',
      name: 'Vùng chuyên canh Bắc Thơm 7 Hữu Cơ',
      farmingType: 'crop',
      areaHa: 18.5,
      managerName: 'Trần Bá Thắng',
      managerPhone: '0979 123 456',
      currentCrop: 'Lúa Bắc Thơm 7 Kháng Bạc Lá',
      varietyName: 'Bắc Thơm số 7 Siêu Nguyên Chủng',
      seasonName: 'Vụ Mùa 2026',
      soilOrWaterType: 'Đất thịt nhẹ phù sa cổ',
      plantingDate: '18/07/2026',
      expectedHarvestDate: '05/11/2026',
      expectedYieldKg: 110000,
      status: 'Đang sinh trưởng',
      statusType: 'good',
      locationDesc: 'Thôn Dưỡng Phú, Xã An Ninh, Tiên Lữ'
    },
    {
      id: 'z-dt-01',
      htxId: 'htx-dongtao',
      code: 'MSCS-DT-01',
      name: 'Trại nuôi Gà giống thuần chủng F1 Xóm Đông',
      farmingType: 'livestock',
      areaHa: 5.5,
      managerName: 'Lê Quang Thắng',
      managerPhone: '0912 688 339',
      currentCrop: 'Gà Đông Tảo thuần chủng 8 tháng tuổi',
      varietyName: 'Gà Đông Tảo F1 Chân Vảy Rồng',
      seasonName: 'Vụ Tết 2026',
      soilOrWaterType: 'Đệm lót trấu vi sinh EM sinh học',
      plantingDate: '15/01/2026',
      expectedHarvestDate: '20/12/2026 (Phục vụ Tết)',
      expectedYieldKg: 4200,
      status: 'Đang sinh trưởng',
      statusType: 'good',
      locationDesc: 'Trại quy chuẩn an toàn sinh học Xóm Đông, Đông Tảo'
    },
    {
      id: 'z-dt-02',
      htxId: 'htx-dongtao',
      code: 'MSCS-DT-02',
      name: 'Vùng thả vườn đệm sinh học Xóm Nam',
      farmingType: 'livestock',
      areaHa: 7.2,
      managerName: 'Tạ Văn Khanh',
      managerPhone: '0978 445 221',
      currentCrop: 'Gà thịt thương phẩm 5 tháng tuổi',
      varietyName: 'Gà Đông Tảo thương phẩm',
      seasonName: 'Vụ Mùa 2026',
      soilOrWaterType: 'Vườn cây bóng mát kết hợp đệm sinh học',
      plantingDate: '10/05/2026',
      expectedHarvestDate: '15/10/2026',
      expectedYieldKg: 6500,
      status: 'Sắp thu hoạch',
      statusType: 'harvest',
      locationDesc: 'Vườn cây ăn quả kết hợp chăn thả, Đông Tảo'
    },
    {
      id: 'z-qt-01',
      htxId: 'htx-quyetthang',
      code: 'MSVT-QT-01',
      name: 'Vườn nhãn lồng Miền Thiết VietGAP Tam Đa',
      farmingType: 'crop',
      areaHa: 14.5,
      managerName: 'Trần Văn Mỹ',
      managerPhone: '0978 112 556',
      currentCrop: 'Nhãn muộn Miền Thiết OCOP 4 sao',
      varietyName: 'Nhãn lồng Miền Thiết Hương Chi',
      seasonName: 'Mùa Vụ Nhãn 2026',
      soilOrWaterType: 'Đất phù sa bãi bồi ven sông Hồng',
      plantingDate: 'Mùa vụ thu hoạch hàng năm',
      expectedHarvestDate: '25/08/2026',
      expectedYieldKg: 180000,
      status: 'Nghỉ vụ/Làm đất',
      statusType: 'rest',
      locationDesc: 'Thôn Tam Đa, Xã Tân Hưng, TP Hưng Yên'
    },
    {
      id: 'z-qt-02',
      htxId: 'htx-quyetthang',
      code: 'MST-QT-02',
      name: 'Khu lồng nuôi Thủy sản Sông Hồng (16 lồng)',
      farmingType: 'aquaculture',
      areaHa: 8.0,
      managerName: 'Nguyễn Văn Lăng',
      managerPhone: '0912 889 001',
      currentCrop: 'Cá Lăng Đen Sông Hồng',
      varietyName: 'Cá lăng đen giống F1',
      seasonName: 'Vụ Thủy Sản 2026-2027',
      soilOrWaterType: 'Nước chảy Sông Hồng (DO: 6.5 mg/L, pH: 7.2)',
      plantingDate: '15/03/2026',
      expectedHarvestDate: '15/11/2026',
      expectedYieldKg: 45000,
      status: 'Đang sinh trưởng',
      statusType: 'good',
      locationDesc: 'Cụm 16 lồng cá ven đê Sông Hồng, Tân Hưng'
    }
  ];

  // NHẬT KÝ SẢN XUẤT ĐIỆN TỬ (HASH NỘI BỘ HTX)
  readonly productionLogs: ProductionLog[] = [
    {
      id: 'log-an-01',
      htxId: 'htx-anninh',
      zoneId: 'z-an-01',
      zoneName: 'Cánh đồng mẫu lớn An Lạc 1 (Lúa ST25)',
      date: '20/09/2026 07:30',
      farmerName: 'Vũ Văn Thiện',
      farmerPhone: '0983 245 118',
      taskTitle: 'Bón thúc đòng đợt 2 & Rút nước phơi nẻ ruộng',
      workDescription: 'Bón phân hữu cơ vi sinh Quế Lâm NPK 12-5-10 kết hợp rút cạn nước ruộng phơi nẻ gốc lúa. Cây lúa sinh trưởng khỏe, không phát hiện sâu cuốn lá nhỏ.',
      materialsUsed: 'Phân vi sinh Quế Lâm NPK 12-5-10',
      quantity: '450 kg (cho 3 ha)',
      isolationDays: 14,
      weather: 'Nắng nhẹ, gió đông nam 28°C',
      photos: [
        'assets/images/gao-st25.jpg'
      ],
      isSecured: true,
      hashString: '0x8f2a9e...e3b1c4 (Đã lưu vết bảo mật HTX)',
      verifiedBy: 'Đặng Văn Hùng (Kỹ sư HTX)'
    },
    {
      id: 'log-an-02',
      htxId: 'htx-anninh',
      zoneId: 'z-an-01',
      zoneName: 'Cánh đồng mẫu lớn An Lạc 1 (Lúa ST25)',
      date: '12/09/2026 16:00',
      farmerName: 'Nguyễn Thị Lan',
      farmerPhone: '0965 223 881',
      taskTitle: 'Phun chế phẩm sinh học phòng ngừa đạo ôn cổ bông',
      workDescription: 'Phun thuốc sinh học nấm đối kháng Trichoderma bằng máy bay không người lái (Drone). Đảm bảo thời gian cách ly PHI 14 ngày theo chuẩn VietGAP.',
      materialsUsed: 'Chế phẩm Trichoderma Bacillus',
      quantity: '15 lít dung dịch vi sinh',
      isolationDays: 14,
      weather: 'Trời râm mát, 29°C',
      photos: [
        'assets/images/gao-st25.jpg'
      ],
      isSecured: true,
      hashString: '0x3c7d1a...a994ef (Đã lưu vết bảo mật HTX)',
      verifiedBy: 'Đặng Văn Hùng (Kỹ sư HTX)'
    },
    {
      id: 'log-dt-01',
      htxId: 'htx-dongtao',
      zoneId: 'z-dt-01',
      zoneName: 'Trại nuôi Gà giống thuần chủng F1 Xóm Đông',
      date: '21/09/2026 08:00',
      farmerName: 'Lê Quang Thắng',
      farmerPhone: '0912 688 339',
      taskTitle: 'Bổ sung thảo dược tỏi đen & kiểm tra thể trọng gà biếu Tết',
      workDescription: 'Trộn bột tỏi tía và men vi sinh vào thức ăn ngô nghiền. Đàn gà 8 tháng tuổi chân to đỏ au, vảy rồng phát triển đồng đều, cân nặng bình quân 4.2 kg/con.',
      materialsUsed: 'Tỏi lên men tự nhiên + Ngô quê Hưng Yên',
      quantity: '120 kg thức ăn tự phối trộn',
      isolationDays: 0,
      weather: 'Mát mẻ, 27°C',
      photos: [
        'assets/images/ga-dong-tao.jpg'
      ],
      isSecured: true,
      hashString: '0x99a1bc...f44321 (Đã lưu vết bảo mật HTX)',
      verifiedBy: 'Kỹ sư Thú Y HTX Đông Tảo'
    },
    {
      id: 'log-qt-01',
      htxId: 'htx-quyetthang',
      zoneId: 'z-qt-01',
      zoneName: 'Vùng trồng Nhãn lồng Miền Thiết Cổ Thụ (MSVT: VN-HY-ORCH-0045)',
      date: '22/09/2026 09:00',
      farmerName: 'Trần Văn Mỹ',
      farmerPhone: '0978 112 556',
      taskTitle: 'Tỉa cành tạo tán & Bón hữu cơ vi sinh sau thu hoạch',
      workDescription: 'Cắt tỉa cành sâu bệnh sau vụ mùa thu hoạch nhãn chính vụ. Bón bổ sung phân chuồng hoai mục kết hợp chế phẩm sinh học Trichoderma nhằm dưỡng cây, phục hồi rễ.',
      materialsUsed: 'Phân vi sinh hữu cơ vi lượng Quế Lâm',
      quantity: '600 kg (cho 2.5 ha)',
      isolationDays: 0,
      weather: 'Nắng ấm nhẹ, 29°C',
      photos: [
        'assets/images/nhan-long.jpg'
      ],
      isSecured: true,
      hashString: '0x7e1d4b...c82a10 (Đã lưu vết bảo mật HTX)',
      verifiedBy: 'Trần Văn Mỹ (Tổ trưởng kỹ thuật)'
    }
  ];

  // KHO VẬT TƯ
  readonly inventoryItems: InventoryItem[] = [
    {
      id: 'inv-01',
      htxId: 'htx-anninh',
      code: 'VT-PB-01',
      name: 'Phân bón vi sinh Quế Lâm NPK 12-5-10',
      category: 'Phân bón vi sinh',
      unit: 'Bao (50kg)',
      stockQty: 180,
      minStockAlert: 50,
      unitPrice: 420000,
      supplier: 'Công ty CP Tập đoàn Quế Lâm',
      location: 'Kho A - Dãy 1',
      expiryDate: '12/2027'
    },
    {
      id: 'inv-02',
      htxId: 'htx-anninh',
      code: 'VT-G-02',
      name: 'Thóc giống ST25 Nguyên Chủng',
      category: 'Hạt giống & Cây/Con giống',
      unit: 'Bao (25kg)',
      stockQty: 85,
      minStockAlert: 20,
      unitPrice: 850000,
      supplier: 'Viện Cây lương thực & Cây thực phẩm',
      location: 'Kho Lạnh Giống - Dãy 2',
      expiryDate: '06/2027'
    },
    {
      id: 'inv-03',
      htxId: 'htx-anninh',
      code: 'VT-BB-03',
      name: 'Bao bì túi hút chân không 5kg (Có mã QR)',
      category: 'Bao bì & Tem nhãn',
      unit: 'Chiếc',
      stockQty: 5400,
      minStockAlert: 1000,
      unitPrice: 4500,
      supplier: 'Xưởng in Bao bì Nông sản Hà Nội',
      location: 'Kho B - Dãy 3'
    },
    {
      id: 'inv-04',
      htxId: 'htx-dongtao',
      code: 'VT-TA-01',
      name: 'Bột ngô quê sấy hạt nghiền mịn',
      category: 'Thức ăn chăn nuôi',
      unit: 'Bao (40kg)',
      stockQty: 120,
      minStockAlert: 30,
      unitPrice: 320000,
      supplier: 'HTX Nông sản Khoái Châu',
      location: 'Kho Cám Đông Tảo'
    },
    {
      id: 'inv-05',
      htxId: 'htx-dongtao',
      code: 'VT-TEM-02',
      name: 'Vòng đeo chân định danh mã QR Gà Đông Tảo',
      category: 'Bao bì & Tem nhãn',
      unit: 'Chiếc',
      stockQty: 1800,
      minStockAlert: 500,
      unitPrice: 3500,
      supplier: 'Công ty Giải pháp Số Nông nghiệp VN',
      location: 'Kho Tem Thú Y'
    }
  ];

  // LÔ THU HOẠCH
  readonly harvestBatches: HarvestBatch[] = [
    {
      id: 'hb-01',
      htxId: 'htx-anninh',
      batchCode: 'LÔ-TH-AN26-01',
      zoneId: 'z-an-01',
      zoneName: 'Cánh đồng mẫu lớn An Lạc 1 (Lúa ST25)',
      productName: 'Lúa thơm ST25 Hưng Yên',
      varietyCode: 'G-ST25',
      seasonCode: 'VU-MUA-2026',
      harvestDate: '15/09/2026',
      totalWeightKg: 42000,
      grade1Kg: 38000,
      grade2Kg: 4000,
      moistureOrFatRate: 'Độ ẩm 14.2% (Chuẩn xuất khẩu)',
      status: 'Đã đóng gói QR',
      leadFarmer: 'Vũ Văn Thiện'
    },
    {
      id: 'hb-02',
      htxId: 'htx-dongtao',
      batchCode: 'LÔ-TH-DT26-08',
      zoneId: 'z-dt-01',
      zoneName: 'Trại nuôi Gà giống thuần chủng F1',
      productName: 'Gà Đông Tảo xuất chuồng đợt 1',
      varietyCode: 'G-DT01',
      seasonCode: 'VU-TET-2026',
      harvestDate: '18/09/2026',
      totalWeightKg: 1850,
      grade1Kg: 1600,
      grade2Kg: 250,
      moistureOrFatRate: 'Trọng lượng 4.3 - 4.6 kg/con',
      status: 'Đã đóng gói QR',
      leadFarmer: 'Lê Quang Thắng'
    },
    {
      id: 'hb-03',
      htxId: 'htx-quyetthang',
      batchCode: 'LÔ-TH-QT26-05',
      zoneId: 'z-qt-01',
      zoneName: 'Vườn nhãn lồng Miền Thiết VietGAP',
      productName: 'Nhãn lồng Miền Thiết OCOP 4 sao',
      varietyCode: 'G-NL01',
      seasonCode: 'VU-MUA-2026',
      harvestDate: '25/08/2026',
      totalWeightKg: 35000,
      grade1Kg: 32000,
      grade2Kg: 3000,
      moistureOrFatRate: 'Độ ngọt 22.5°Bx (Hương Chi đậm đà)',
      status: 'Đã đóng gói QR',
      leadFarmer: 'Trần Văn Mỹ'
    }
  ];

  // SẢN PHẨM ĐÓNG GÓI TEM QR (DÙNG ẢNH NÔNG SẢN THẬT 100%)
  readonly packagedProducts: PackagedProduct[] = [
    {
      id: 'pack-01',
      htxId: 'htx-anninh',
      qrCode: 'HY-AN-ST25-2026-0988',
      batchCode: 'LÔ-TH-AN26-01',
      productName: 'Gạo sạch ST25 Thượng Hạng An Ninh (Hộp 5kg)',
      weightSpec: '5.0 kg / túi hút chân không',
      packDate: '18/09/2026',
      expiryDate: '18/09/2027',
      status: 'Sẵn sàng bán',
      standard: 'OCOP 4 sao - VietGAP TCVN 11892-1:2017',
      sampleImg: 'assets/images/gao-st25.jpg'
    },
    {
      id: 'pack-02',
      htxId: 'htx-dongtao',
      qrCode: 'HY-DT-GA-2026-0112',
      batchCode: 'LÔ-TH-DT26-08',
      productName: 'Gà Đông Tảo Thuần Chủng Tiến Vua (Gắn vòng QR)',
      weightSpec: '4.2 kg - 4.8 kg / con nguyên con',
      packDate: '20/09/2026',
      expiryDate: 'Ăn tươi hoặc bảo quản lạnh 7 ngày',
      status: 'Sẵn sàng bán',
      standard: 'OCOP 4 sao - An toàn sinh học HTX',
      sampleImg: 'assets/images/ga-dong-tao.jpg'
    },
    {
      id: 'pack-03',
      htxId: 'htx-quyetthang',
      qrCode: 'HY-QT-NHAN-2026-3341',
      batchCode: 'LÔ-TH-QT26-05',
      productName: 'Nhãn Lồng Hưng Yên Miền Thiết OCOP (Hộp quà biếu 5kg)',
      weightSpec: '5.0 kg / thùng carton cao cấp',
      packDate: '26/08/2026',
      expiryDate: 'Bảo quản mát 15 ngày',
      status: 'Sẵn sàng bán',
      standard: 'Chỉ dẫn địa lý Nhãn Lồng Hưng Yên - OCOP 4 sao',
      sampleImg: 'assets/images/nhan-long.jpg'
    }
  ];

  // ĐƠN HÀNG BÁN
  readonly salesOrders: SalesOrder[] = [
    {
      id: 'ord-01',
      htxId: 'htx-anninh',
      orderCode: 'ĐH-AN-2026-0089',
      partnerId: 'part-01',
      customerName: 'Tập đoàn WinCommerce (Chuỗi Siêu Thị WinMart)',
      customerPhone: '024 7109 8888',
      customerType: 'Siêu thị',
      orderDate: '21/09/2026',
      items: [
        { productName: 'Gạo sạch ST25 An Ninh (Túi 5kg)', quantity: 1500, unit: 'Túi', unitPrice: 180000, amount: 270000000 },
        { productName: 'Gạo Bắc Thơm 7 Tiên Lữ (Túi 5kg)', quantity: 2000, unit: 'Túi', unitPrice: 125000, amount: 250000000 }
      ],
      totalAmount: 520000000,
      status: 'Đã thanh toán',
      invoiceCode: 'HD-AN26-8831'
    },
    {
      id: 'ord-02',
      htxId: 'htx-anninh',
      orderCode: 'ĐH-AN-2026-0090',
      partnerId: 'part-02',
      customerName: 'Chuỗi Cửa Hàng Thực Phẩm Sạch Bác Tôm',
      customerPhone: '0903 221 445',
      customerType: 'Đại lý phân phối',
      orderDate: '22/09/2026',
      items: [
        { productName: 'Gạo sạch ST25 An Ninh (Túi 5kg)', quantity: 400, unit: 'Túi', unitPrice: 180000, amount: 72000000 }
      ],
      totalAmount: 72000000,
      status: 'Chờ giao hàng',
      invoiceCode: 'HD-AN26-8832'
    },
    {
      id: 'ord-03',
      htxId: 'htx-dongtao',
      orderCode: 'ĐH-DT-2026-0045',
      partnerId: 'part-04',
      customerName: 'Chuỗi Nhà Hàng Ẩm Thực Phố Hiến (TP Hưng Yên)',
      customerPhone: '0988 776 554',
      customerType: 'Thương lái',
      orderDate: '20/09/2026',
      items: [
        { productName: 'Gà Đông Tảo thịt thả vườn loại 1', quantity: 65, unit: 'Con', unitPrice: 850000, amount: 55250000 }
      ],
      totalAmount: 55250000,
      status: 'Đã thanh toán',
      invoiceCode: 'HD-DT26-1120'
    }
  ];

  // THÔNG BÁO NÔNG VỤ
  readonly notifications: NotificationItem[] = [
    {
      id: 'notif-01',
      title: 'CẢNH BÁO MƯA LỚN & ĐỀ PHÒNG NGẬP ÚNG LÚA MÙA',
      content: 'Dự báo có đợt mưa to 100-150mm. Đề nghị các tổ trưởng và xã viên khơi thông mương máng, sẵn sàng trạm bơm tiêu An Ninh.',
      type: 'urgent',
      createdAt: '22/09/2026 14:00',
      isRead: false,
      sender: 'Ban Quản Trị HTX An Ninh',
      receiverGroup: 'Toàn thể xã viên HTX An Ninh'
    },
    {
      id: 'notif-02',
      title: 'Lịch tập huấn Quy trình Truy xuất Nguồn gốc điện tử & Mã QR',
      content: 'HTX tổ chức lớp hướng dẫn ghi nhật ký trên điện thoại cho xã viên vào 8h00 ngày 26/09/2026 tại Nhà văn hóa xã.',
      type: 'info',
      createdAt: '21/09/2026 09:30',
      isRead: false,
      sender: 'Ban Kỹ Thuật HTX',
      receiverGroup: 'Tất cả thành viên HTX'
    },
    {
      id: 'notif-03',
      title: 'Thông báo kết quả kiểm nghiệm mẫu Lúa ST25 đạt chuẩn VietGAP',
      content: 'Mẫu kiểm nghiệm đạt 100% chỉ tiêu ATTP: Không tồn dư thuốc BVTV, đủ điều kiện xuất khẩu và vào siêu thị.',
      type: 'info',
      createdAt: '19/09/2026 10:15',
      isRead: true,
      sender: 'Ban Kỹ Thuật HTX',
      receiverGroup: 'Ban Quản Trị & Xã viên'
    }
  ];

  // TÀI LIỆU KỸ THUẬT
  readonly technicalManuals: TechnicalManual[] = [
    {
      id: 'tm-01',
      title: 'Quy trình kỹ thuật thâm canh lúa chất lượng cao theo tiêu chuẩn VietGAP Hưng Yên',
      category: 'Trồng trọt',
      author: 'Ban Kỹ Thuật Nông Nghiệp HTX',
      publishedDate: '15/05/2026',
      fileSize: '4.2 MB (PDF)',
      summary: 'Hướng dẫn chi tiết từ khâu xử lý hạt giống, cấy giăng dây, bón phân 3 giảm 3 tăng đến thu hoạch bảo quản.',
      downloadUrl: '#'
    },
    {
      id: 'tm-02',
      title: 'Sổ tay hướng dẫn an toàn sinh học trong chăn nuôi Gà Đông Tảo đặc sản',
      category: 'Chăn nuôi',
      author: 'Ban Thú Y HTX Gà Đông Tảo',
      publishedDate: '10/06/2026',
      fileSize: '6.8 MB (PDF)',
      summary: 'Kỹ thuật làm đệm lót sinh học, phối trộn thảo dược kháng sinh tự nhiên, tiêm phòng vắc xin đúng chu kỳ.',
      downloadUrl: '#'
    },
    {
      id: 'tm-03',
      title: 'Hướng dẫn kỹ thuật thâm canh nhãn lồng VietGAP & công nghệ bảo quản sau thu hoạch',
      category: 'Trồng trọt',
      author: 'Ban Kỹ Thuật HTX Quyết Thắng',
      publishedDate: '20/04/2026',
      fileSize: '5.1 MB (PDF)',
      summary: 'Kỹ thuật tỉa cành tạo tán, khoanh vỏ đón hoa, bao chùm quả chống sâu đục cuống và sấy long nhãn sạch.',
      downloadUrl: '#'
    }
  ];
}
