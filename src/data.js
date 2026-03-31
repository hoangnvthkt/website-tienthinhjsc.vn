// Product data for Tiến Thịnh JSC
// Construction & Steel Structure projects

export const products = [
  {
    id: 'nha-xuong-samsung',
    name: 'Nhà Xưởng Samsung',
    subtitle: 'Khu công nghiệp Bắc Ninh',
    category: 'Nhà xưởng',
    author: 'Đội kỹ thuật A',
    year: '2023',
    image: '/images/steel-warehouse.png',
    images: ['/images/steel-warehouse.png', '/images/factory-interior.png', '/images/steel-roof-structure.png'],
    description: 'Dự án thi công kết cấu thép nhà xưởng sản xuất Samsung Electronics tại KCN Yên Phong, Bắc Ninh. Tổng diện tích 25.000m², sử dụng hệ kết cấu thép tiền chế PEB với khẩu độ lớn 36m, đảm bảo không gian sản xuất linh hoạt. Khối lượng thép tổng cộng 3.500 tấn, hoàn thành trong 6 tháng.',
    specs: 'Diện tích: 25.000m² | Khẩu độ: 36m | Thép: 3.500 tấn | Tiêu chuẩn: AISC/ASTM',
    variants: [
      { color: '#4A90A4', label: 'Thép CT3' },
      { color: '#8B4513', label: 'Thép SN400B' },
      { color: '#2F4F4F', label: 'Thép SS400' }
    ],
    size: { w: 220, h: 160 },
    spacePos: { x: 15, y: 12 }
  },
  {
    id: 'cau-thep-vuot-song',
    name: 'Cầu Thép Vượt Sông',
    subtitle: 'Quốc lộ 1A — Thanh Hóa',
    category: 'Cầu thép',
    author: 'Đội kỹ thuật B',
    year: '2022',
    image: '/images/steel-bridge.png',
    images: ['/images/steel-bridge.png', '/images/steel-structure-detail.png'],
    description: 'Thiết kế và thi công cầu thép dầm hộp vượt sông dài 180m trên Quốc lộ 1A. Kết cấu chính sử dụng dầm thép hộp chữ I tổ hợp, mặt cầu bê tông cốt thép liên hợp. Tải trọng thiết kế HL-93, đạt tiêu chuẩn TCVN 11823:2017.',
    specs: 'Chiều dài: 180m | Nhịp chính: 60m | Tải trọng: HL-93 | Thép: 1.800 tấn',
    variants: [
      { color: '#708090', label: 'Thép Q345B' },
      { color: '#B8860B', label: 'Thép chịu thời tiết' }
    ],
    size: { w: 260, h: 140 },
    spacePos: { x: 55, y: 8 }
  },
  {
    id: 'khung-thep-nang-luong',
    name: 'Khung Năng Lượng Mặt Trời',
    subtitle: 'Ninh Thuận — 50MW',
    category: 'Năng lượng',
    author: 'Đội kỹ thuật C',
    year: '2021',
    image: '/images/solar-steel-frame.png',
    images: ['/images/solar-steel-frame.png', '/images/steel-structure-detail.png'],
    description: 'Cung cấp và lắp đặt hệ thống khung kết cấu thép cho nhà máy điện mặt trời công suất 50MW tại Ninh Thuận. Sử dụng hệ khung thép mạ kẽm nhúng nóng chịu thời tiết, thiết kế tối ưu để chịu tải trọng gió vùng IV-B theo TCVN 2737:2023.',
    specs: 'Công suất: 50MW | Diện tích: 60ha | Khung thép: 2.000 tấn | Mạ kẽm: 85μm',
    variants: [
      { color: '#C0C0C0', label: 'Mạ kẽm' },
      { color: '#228B22', label: 'Sơn xanh' }
    ],
    size: { w: 200, h: 150 },
    spacePos: { x: 35, y: 40 }
  },
  {
    id: 'cao-oc-25-tang',
    name: 'Cao Ốc 25 Tầng',
    subtitle: 'Trung tâm Hà Nội',
    category: 'Cao tầng',
    author: 'Đội kỹ thuật A',
    year: '2020',
    image: '/images/high-rise-steel.png',
    images: ['/images/high-rise-steel.png', '/images/steel-structure-detail.png', '/images/steel-roof-structure.png'],
    description: 'Thi công kết cấu thép composite cho tòa nhà văn phòng hạng A 25 tầng tại trung tâm Hà Nội. Hệ kết cấu khung thép kết hợp lõi bê tông cốt thép, sàn composite deck. Đạt giải thưởng Công trình chất lượng cao năm 2020.',
    specs: 'Số tầng: 25 | Chiều cao: 95m | Thép: 4.200 tấn | Sàn: Composite deck',
    variants: [
      { color: '#4682B4', label: 'Thép SN490B' },
      { color: '#2E2E2E', label: 'Thép SM490' },
      { color: '#CD853F', label: 'Thép chịu lửa' }
    ],
    size: { w: 160, h: 240 },
    spacePos: { x: 75, y: 25 }
  },
  {
    id: 'ket-cau-mai',
    name: 'Kết Cấu Mái Không Gian',
    subtitle: 'Trung tâm Hội nghị Quốc gia',
    category: 'Kết cấu đặc biệt',
    author: 'Đội kỹ thuật D',
    year: '2019',
    image: '/images/steel-roof-structure.png',
    images: ['/images/steel-roof-structure.png', '/images/steel-structure-detail.png'],
    description: 'Thiết kế và thi công hệ kết cấu mái không gian dạng vỏ trụ cho hội trường 3.000 chỗ ngồi. Khẩu độ vượt nhịp 72m không cột trung gian, sử dụng hệ thanh ống thép tròn liên kết bằng gối cầu. Trọng lượng mái chỉ 35kg/m².',
    specs: 'Khẩu độ: 72m | Diện tích mái: 5.400m² | Thép ống: 800 tấn | Tải: 35kg/m²',
    variants: [
      { color: '#A0A0A0', label: 'Thép ống' },
      { color: '#778899', label: 'Sơn chống cháy' }
    ],
    size: { w: 240, h: 180 },
    spacePos: { x: 10, y: 55 }
  },
  {
    id: 'nha-may-interior',
    name: 'Nhà Máy Sản Xuất',
    subtitle: 'KCN Đông Anh — Hà Nội',
    category: 'Nhà xưởng',
    author: 'Đội kỹ thuật B',
    year: '2023',
    image: '/images/factory-interior.png',
    images: ['/images/factory-interior.png', '/images/steel-warehouse.png', '/images/steel-roof-structure.png'],
    description: 'Xưởng sản xuất kết cấu thép hiện đại 20.000m² tại KCN Đông Anh. Trang bị dây chuyền CNC cắt, khoan tự động nhập khẩu từ Đức, cầu trục 50 tấn, hệ thống hàn tự động. Công suất sản xuất đạt 3.000 tấn/tháng.',
    specs: 'Diện tích: 20.000m² | Cầu trục: 50 tấn | Công suất: 3.000 tấn/tháng',
    variants: [
      { color: '#DAA520', label: 'Sơn vàng CN' },
      { color: '#808080', label: 'Mái tôn' }
    ],
    size: { w: 200, h: 150 },
    spacePos: { x: 50, y: 60 }
  },
  {
    id: 'khung-thep-tien-che',
    name: 'Khung Thép Tiền Chế PEB',
    subtitle: 'Giải pháp nhà xưởng nhanh',
    category: 'PEB',
    author: 'Đội kỹ thuật C',
    year: '2024',
    image: '/images/steel-frame-building.png',
    images: ['/images/steel-frame-building.png', '/images/steel-warehouse.png', '/images/steel-structure-detail.png'],
    description: 'Hệ thống nhà thép tiền chế (Pre-Engineered Building) thiết kế theo tiêu chuẩn MBMA. Giải pháp tối ưu cho nhà xưởng công nghiệp: thời gian thi công nhanh gấp 3 lần, tiết kiệm 20-30% chi phí so với kết cấu truyền thống.',
    specs: 'Khẩu độ: 12-60m | Chiều cao: tùy biến | Tiêu chuẩn: MBMA | Lắp đặt: 45 ngày',
    variants: [
      { color: '#4169E1', label: 'Xanh dương' },
      { color: '#DC143C', label: 'Đỏ' },
      { color: '#F0F0F0', label: 'Trắng' },
      { color: '#228B22', label: 'Xanh lá' }
    ],
    size: { w: 220, h: 180 },
    spacePos: { x: 30, y: 75 }
  },
  {
    id: 'chi-tiet-ket-cau',
    name: 'Chi Tiết Kết Cấu Thép',
    subtitle: 'Liên kết bu-lông cường độ cao',
    category: 'Chi tiết',
    author: 'Phòng Thiết kế',
    year: '2024',
    image: '/images/steel-structure-detail.png',
    images: ['/images/steel-structure-detail.png', '/images/steel-frame-building.png'],
    description: 'Chuyên gia trong thiết kế và gia công chi tiết liên kết kết cấu thép: liên kết bu-lông cường độ cao F10T, liên kết hàn đối đầu CJP, liên kết hàn góc theo tiêu chuẩn AWS D1.1. Kiểm tra chất lượng bằng NDT (siêu âm, chụp phim X-ray).',
    specs: 'Bu-lông: F10T M20-M30 | Hàn: AWS D1.1/D1.8 | NDT: UT/RT 100%',
    variants: [
      { color: '#696969', label: 'Mạ kẽm điện' },
      { color: '#B22222', label: 'Sơn chống gỉ' }
    ],
    size: { w: 160, h: 160 },
    spacePos: { x: 70, y: 70 }
  },
  {
    id: 'doi-ngu-thi-cong',
    name: 'Đội Ngũ Thi Công',
    subtitle: '350+ Kỹ sư & Công nhân',
    category: 'Năng lực',
    author: 'Tiến Thịnh JSC',
    year: '2024',
    image: '/images/construction-team.png',
    images: ['/images/construction-team.png', '/images/factory-interior.png'],
    description: 'Đội ngũ hơn 350 kỹ sư, giám sát và công nhân lành nghề. 100% thợ hàn có chứng chỉ AWS/ASME. Đội ngũ kỹ sư thiết kế thành thạo Tekla Structures, SAP2000, ETABS. Kinh nghiệm thi công tại 28 tỉnh thành và 3 quốc gia trong khu vực.',
    specs: 'Nhân sự: 350+ | Thợ hàn AWS: 120 | Kỹ sư: 45 | Hoạt động: 28 tỉnh',
    variants: [],
    size: { w: 200, h: 140 },
    spacePos: { x: 55, y: 85 }
  }
];

export default products;
