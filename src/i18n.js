// ============================================
// INTERNATIONALIZATION (i18n) SYSTEM
// Supports: Vietnamese (vi) and English (en)
// ============================================

const translations = {
  vi: {
    // ─── Meta / SEO ───
    'meta.title': 'Tiến Thịnh JSC — Công ty CP Phát triển Đầu tư và Xây lắp Tiến Thịnh',
    'meta.description': 'Chuyên thi công kết cấu thép, nhà xưởng, nhà công nghiệp, cầu thép và các công trình xây dựng dân dụng & công nghiệp.',

    // ─── Header Navigation ───
    'nav.home': 'TRANG CHỦ',
    'nav.about': 'GIỚI THIỆU',
    'nav.about.letter': 'THƯ NGỎ',
    'nav.about.vision': 'TẦM NHÌN SỨ MỆNH',
    'nav.about.values': 'GIÁ TRỊ CỐT LÕI',
    'nav.about.history': 'LỊCH SỬ',
    'nav.about.org': 'SƠ ĐỒ TỔ CHỨC',
    'nav.about.cert': 'CHỨNG CHỈ',
    'nav.about.awards': 'GIẢI THƯỞNG',
    'nav.capability': 'NĂNG LỰC',
    'nav.cap.hr': 'NĂNG LỰC NHÂN SỰ',
    'nav.cap.prod': 'NĂNG LỰC SẢN XUẤT',
    'nav.cap.construct': 'NĂNG LỰC THI CÔNG',
    'nav.cap.factory': 'NĂNG LỰC NHÀ MÁY THIẾT BỊ',
    'nav.cap.safety': 'QUẢN LÝ AN TOÀN LAO ĐỘNG',
    'nav.services': 'DỊCH VỤ',
    'nav.svc.general': 'TỔNG THẦU XÂY DỰNG',
    'nav.svc.fdi': 'TƯ VẤN ĐẦU TƯ DỰ ÁN FDI',
    'nav.svc.steel': 'SẢN XUẤT KẾT CẤU THÉP',
    'nav.svc.design': 'TƯ VẤN THIẾT KẾ',
    'nav.svc.trade': 'KINH DOANH THƯƠNG MẠI',
    'nav.projects': 'DỰ ÁN',
    'nav.proj.done': 'DỰ ÁN ĐÃ TRIỂN KHAI',
    'nav.proj.ongoing': 'DỰ ÁN ĐANG TRIỂN KHAI',
    'nav.proj.featured': 'DỰ ÁN TIÊU BIỂU',
    'nav.proj.country': 'THEO QUỐC GIA',
    'nav.proj.field': 'THEO LĨNH VỰC',
    'nav.news': 'TIN TỨC',
    'nav.news.company': 'TIN CÔNG TY',
    'nav.news.site': 'TIN CÔNG TRƯỜNG',
    'nav.news.recruit': 'TIN TUYỂN DỤNG',
    'nav.news.knowledge': 'KIẾN THỨC CHUYÊN MÔN',
    'nav.contact': 'LIÊN HỆ',
    'nav.documents': 'TÀI LIỆU',

    // ─── Mobile Nav Overlay ───
    'navOverlay.home': 'Trang chủ',
    'navOverlay.about': 'Giới thiệu',
    'navOverlay.about.letter': 'Thư ngỏ',
    'navOverlay.about.vision': 'Tầm nhìn sứ mệnh',
    'navOverlay.about.values': 'Giá trị cốt lõi',
    'navOverlay.about.history': 'Lịch sử',
    'navOverlay.about.org': 'Sơ đồ tổ chức',
    'navOverlay.about.cert': 'Chứng chỉ',
    'navOverlay.about.awards': 'Giải thưởng',
    'navOverlay.capability': 'Năng lực',
    'navOverlay.cap.hr': 'Năng lực nhân sự',
    'navOverlay.cap.prod': 'Năng lực sản xuất',
    'navOverlay.cap.construct': 'Năng lực thi công',
    'navOverlay.cap.factory': 'Năng lực nhà máy thiết bị',
    'navOverlay.cap.safety': 'Quản lý an toàn lao động',
    'navOverlay.services': 'Dịch vụ',
    'navOverlay.svc.general': 'Tổng thầu xây dựng',
    'navOverlay.svc.fdi': 'Tư vấn đầu tư dự án FDI',
    'navOverlay.svc.steel': 'Sản xuất kết cấu thép',
    'navOverlay.svc.design': 'Tư vấn thiết kế',
    'navOverlay.svc.trade': 'Kinh doanh thương mại',
    'navOverlay.projects': 'Dự án',
    'navOverlay.proj.done': 'Dự án đã triển khai',
    'navOverlay.proj.ongoing': 'Dự án đang triển khai',
    'navOverlay.proj.featured': 'Dự án tiêu biểu',
    'navOverlay.proj.country': 'Theo quốc gia',
    'navOverlay.proj.field': 'Theo lĩnh vực',
    'navOverlay.news': 'Tin tức',
    'navOverlay.news.company': 'Tin công ty',
    'navOverlay.news.site': 'Tin công trường',
    'navOverlay.news.recruit': 'Tin tuyển dụng',
    'navOverlay.news.knowledge': 'Kiến thức chuyên môn',
    'navOverlay.contact': 'Liên hệ',
    'navOverlay.documents': 'Tài liệu',
    'navOverlay.newsletter': 'Đăng ký nhận tin',
    'navOverlay.privacy': 'Chính sách bảo mật',

    // ─── View Toggle ───
    'view.space': 'KHÔNG GIAN',
    'view.road': 'HÀNH TRÌNH',
    'view.grid': 'LƯỚI',
    'road.scrollHint': 'Cuộn để khám phá hành trình',

    // ─── Stats Bar ───
    'stats.experience': 'Năm kinh nghiệm',
    'stats.projects': 'Dự án hoàn thành',
    'stats.steel': 'Tấn thép',
    'stats.staff': 'Nhân sự',

    // ─── Search ───
    'search.placeholder': 'Tìm kiếm công trình, dự án...',
    'theme.toggle': 'Chuyển chế độ sáng/tối',

    // ─── Product Detail ───
    'product.history': 'LỊCH SỬ',
    'product.history.desc': 'Thông tin lịch sử công trình sẽ được cập nhật.',
    'product.specs': 'THÔNG SỐ KỸ THUẬT',
    'product.specs.desc': 'Thông số kỹ thuật sẽ được cập nhật.',
    'product.scope': 'PHẠM VI CÔNG VIỆC',
    'product.scope.desc': 'Phạm vi công việc sẽ được cập nhật.',
    'product.gallery': 'HÌNH ẢNH THÊM',
    'product.gallery.desc': 'Hình ảnh bổ sung sẽ được cập nhật.',
    'product.dragHint': '🔄 Kéo chuột để xoay 3D',

    // ─── History Page ───
    'history.title': 'Lịch Sử',
    'history.intro': 'Hành trình hơn 20 năm xây dựng và phát triển của Tiến Thịnh JSC — từ một doanh nghiệp nhỏ đến thương hiệu hàng đầu trong lĩnh vực kết cấu thép và xây lắp công nghiệp.',
    'history.2005.title': 'Thành lập công ty',
    'history.2005.desc': 'Công ty Cổ phần Phát triển Đầu tư và Xây lắp Tiến Thịnh được thành lập tại Hà Nội, chuyên thi công kết cấu thép nhà xưởng công nghiệp với đội ngũ 15 kỹ sư và công nhân lành nghề.',
    'history.2008.title': 'Mở rộng quy mô',
    'history.2008.desc': 'Đầu tư xưởng sản xuất kết cấu thép 5.000m² tại KCN Từ Liêm, nâng công suất lên 500 tấn/tháng. Hoàn thành dự án nhà máy Samsung Electronics Bắc Ninh.',
    'history.2012.title': 'Đạt chứng nhận ISO 9001:2008',
    'history.2012.desc': 'Tiêu chuẩn hóa quy trình sản xuất và thi công. Trở thành nhà thầu phụ uy tín cho các tổng thầu Nhật Bản, Hàn Quốc tại Việt Nam.',
    'history.2015.title': 'Bước ngoặt phát triển',
    'history.2015.desc': 'Nâng cấp xưởng sản xuất lên 12.000m², công suất 1.500 tấn/tháng. Thực hiện thành công dự án cầu thép vượt sông dài 200m và nhà máy điện mặt trời 50MW.',
    'history.2018.title': 'Vươn tầm khu vực',
    'history.2018.desc': 'Mở rộng sang thị trường Lào và Campuchia. Hoàn thành hơn 200 dự án lớn nhỏ, tổng khối lượng kết cấu thép vượt 50.000 tấn.',
    'history.2021.title': 'Chuyển đổi số',
    'history.2021.desc': 'Áp dụng BIM trong thiết kế và quản lý dự án. Đầu tư dây chuyền tự động hóa cắt, khoan CNC nhập khẩu từ Đức, nâng cao độ chính xác và năng suất.',
    'history.2024.title': 'Khẳng định vị thế',
    'history.2024.desc': 'Đội ngũ 350+ nhân sự, xưởng sản xuất 20.000m², công suất 3.000 tấn/tháng. Đối tác chiến lược của các tập đoàn FDI hàng đầu tại Việt Nam.',

    // ─── HR / Team Page ───
    'capHr.title': 'Năng Lực Nhân Sự',
    'capHr.intro': 'Đội ngũ kỹ sư và chuyên gia giàu kinh nghiệm — nền tảng vững chắc cho mọi công trình của Tiến Thịnh JSC.',
    'capHr.ceo': 'Tổng Giám đốc',
    'capHr.ceo.bio': '25 năm kinh nghiệm trong lĩnh vực xây dựng và kết cấu thép. Thạc sĩ Xây dựng — ĐH Bách Khoa Hà Nội.',
    'capHr.cto': 'Giám đốc Kỹ thuật',
    'capHr.cto.bio': '20 năm kinh nghiệm thiết kế kết cấu thép. Chuyên gia BIM. Tiến sĩ Kỹ thuật Công trình — ĐH Xây dựng.',
    'capHr.pm': 'Giám đốc Dự án',
    'capHr.pm.bio': '15 năm quản lý các dự án lớn. Chuyên gia PMI-PMP. Cử nhân Quản lý Xây dựng — ĐH GTVT.',
    'capHr.design': 'Trưởng phòng Thiết kế',
    'capHr.design.bio': '12 năm kinh nghiệm thiết kế chi tiết kết cấu thép. Thành thạo Tekla Structures, AutoCAD.',
    'capHr.prod': 'Trưởng phòng Sản xuất',
    'capHr.prod.bio': '18 năm kinh nghiệm sản xuất kết cấu thép. Chuyên gia hàn AWS-CWI. Quản lý xưởng 20.000m².',
    'capHr.cfo': 'Giám đốc Tài chính',
    'capHr.cfo.bio': '15 năm kinh nghiệm quản lý tài chính doanh nghiệp xây dựng. Thạc sĩ Tài chính — ĐH Kinh tế Quốc dân.',

    // ─── Exhibitions Page ───
    'exhibitions.title': 'Dự Án Tiêu Biểu',
    'exhibitions.intro': 'Những công trình đáng tự hào — minh chứng cho năng lực và uy tín của Tiến Thịnh JSC trong suốt hành trình phát triển.',
    'exhibitions.samsung.title': 'Nhà máy Samsung Display — Bắc Ninh',
    'exhibitions.samsung.desc': 'Thi công kết cấu thép nhà xưởng 25.000m², khối lượng 3.500 tấn thép. Hoàn thành đúng tiến độ 6 tháng.',
    'exhibitions.bridge.title': 'Cầu vượt thép — Quốc lộ 1A',
    'exhibitions.bridge.desc': 'Cầu thép dài 180m, tải trọng HL-93. Thiết kế và thi công trọn gói theo tiêu chuẩn TCVN.',
    'exhibitions.solar.title': 'Nhà máy Điện mặt trời — Ninh Thuận',
    'exhibitions.solar.desc': 'Cung cấp và lắp đặt khung kết cấu thép cho hệ thống pin năng lượng mặt trời 50MW trên diện tích 60ha.',
    'exhibitions.highrise.title': 'Tòa nhà văn phòng 25 tầng — Hà Nội',
    'exhibitions.highrise.desc': 'Kết cấu thép composite, khối lượng 4.200 tấn. Đạt giải thưởng Công trình chất lượng cao 2020.',

    // ─── News Page ───
    'news.title': 'Tin Tức',
    'news.intro': 'Cập nhật thông tin mới nhất về hoạt động, dự án và các sự kiện của Tiến Thịnh JSC.',
    'news.readMore': 'Đọc thêm',
    'news.readArticle': 'Đọc bài viết',
    'news.relatedPosts': 'Bài viết liên quan',
    'news.breadcrumb': 'Tin Tức',

    // ─── Contact Page ───
    'contact.title': 'Liên Hệ',
    'contact.intro': 'Hãy liên hệ với chúng tôi để được tư vấn giải pháp kết cấu thép và xây lắp tốt nhất cho dự án của bạn.',
    'contact.name': 'Họ và tên *',
    'contact.email': 'Email *',
    'contact.phone': 'Số điện thoại',
    'contact.subject': 'Chủ đề',
    'contact.subject.select': 'Chọn chủ đề',
    'contact.subject.quote': 'Báo giá dự án',
    'contact.subject.partner': 'Hợp tác kinh doanh',
    'contact.subject.career': 'Tuyển dụng',
    'contact.subject.other': 'Khác',
    'contact.message': 'Nội dung *',
    'contact.submit': 'Gửi liên hệ',
    'contact.submitting': 'Đang gửi...',
    'contact.success': '✓ Đã gửi thành công!',
    'contact.error': '✗ Lỗi gửi, thử lại',
    'contact.hq': 'Trụ sở chính',
    'contact.hqName': 'Công ty CP Phát triển Đầu tư và Xây lắp Tiến Thịnh',
    'contact.hqAddress': 'Số 88, Đường Láng, Quận Đống Đa',
    'contact.factory': 'Xưởng sản xuất',
    'contact.factoryAddress': 'Lô C5, KCN Đông Anh',
    'contact.direct': 'Liên hệ trực tiếp',
    'contact.social': 'Mạng xã hội',
    'contact.mapTitle': 'Vị trí trên bản đồ',

    // ─── About Letter Page ───
    'letter.title': 'Thư Ngỏ',
    'letter.subtitle': 'Thông điệp từ Ban Lãnh đạo Tiến Thịnh JSC',
    'letter.greeting': 'Kính gửi Quý Đối tác, Quý Khách hàng,',
    'letter.body1': 'Trải qua hơn <strong>20 năm</strong> hình thành và phát triển, Công ty Cổ phần Phát triển Đầu tư và Xây lắp Tiến Thịnh đã không ngừng nỗ lực vươn lên, khẳng định vị thế là một trong những đơn vị hàng đầu trong lĩnh vực <strong>sản xuất kết cấu thép và xây lắp công nghiệp</strong> tại Việt Nam.',
    'letter.quote': '"Chất lượng là nền tảng — Uy tín là giá trị — Đổi mới là động lực phát triển."',
    'letter.body2': 'Với đội ngũ hơn <strong>350 kỹ sư và công nhân lành nghề</strong>, hệ thống nhà xưởng sản xuất <strong>20.000m²</strong> được trang bị dây chuyền CNC hiện đại, chúng tôi tự hào đã hoàn thành hơn <strong>500 dự án</strong> lớn nhỏ trên khắp Việt Nam và khu vực Đông Nam Á.',
    'letter.body3': 'Tiến Thịnh JSC luôn lấy chất lượng công trình làm kim chỉ nam, lấy sự hài lòng của khách hàng làm thước đo thành công. Chúng tôi cam kết mang đến những giải pháp kết cấu thép tối ưu nhất — từ tư vấn thiết kế, gia công chế tạo đến lắp đặt hoàn thiện tại công trường.',
    'letter.body4': 'Chúng tôi tin tưởng rằng sự hợp tác giữa Tiến Thịnh JSC và Quý Đối tác sẽ ngày càng bền chặt, cùng nhau kiến tạo những công trình bền vững cho tương lai.',
    'letter.regards': 'Trân trọng,',
    'letter.signName': 'Nguyễn Văn Thịnh',
    'letter.signRole': 'Tổng Giám đốc — Tiến Thịnh JSC',

    // ─── Values Page ───
    'values.title': 'Giá Trị Cốt Lõi',
    'values.subtitle': 'Nền tảng cho mọi thành công',
    'values.intro': 'Tiến Thịnh JSC xây dựng văn hóa doanh nghiệp dựa trên 5 giá trị cốt lõi — là kim chỉ nam cho mọi hoạt động và quyết định.',
    'values.quality': 'Chất Lượng',
    'values.quality.desc': 'Không thỏa hiệp về chất lượng. Mọi sản phẩm đều đạt tiêu chuẩn ISO 9001:2015 và AWS D1.1 trước khi xuất xưởng.',
    'values.trust': 'Uy Tín',
    'values.trust.desc': 'Cam kết đúng tiến độ, đúng ngân sách. Lời nói đi đôi với việc làm — xây dựng niềm tin qua từng dự án.',
    'values.innovation': 'Đổi Mới',
    'values.innovation.desc': 'Tiên phong ứng dụng công nghệ BIM, CNC tự động hóa và phương pháp quản lý dự án hiện đại.',
    'values.safety': 'An Toàn',
    'values.safety.desc': 'An toàn lao động là ưu tiên hàng đầu. Zero accident là mục tiêu, không phải khẩu hiệu.',
    'values.sustainability': 'Bền Vững',
    'values.sustainability.desc': 'Phát triển hài hòa với môi trường. Chứng nhận ISO 14001:2015 — tối ưu tài nguyên, giảm thiểu phát thải.',

    // ─── Subpages (common) ───
    'subpage.updating': 'Nội dung trang đang được cập nhật. Vui lòng quay lại sau.',
    'page.vision.title': 'Tầm Nhìn & Sứ Mệnh',
    'page.vision.intro': 'Định hướng phát triển bền vững và sứ mệnh của Tiến Thịnh JSC trong ngành xây dựng.',
    'page.org.title': 'Sơ Đồ Tổ Chức',
    'page.org.intro': 'Cơ cấu tổ chức và bộ máy điều hành của Tiến Thịnh JSC.',
    'page.cert.title': 'Chứng Chỉ',
    'page.cert.intro': 'Các chứng chỉ năng lực, ISO và giấy phép hành nghề của Tiến Thịnh JSC.',
    'page.awards.title': 'Giải Thưởng',
    'page.awards.intro': 'Những giải thưởng và danh hiệu ghi nhận thành tựu của Tiến Thịnh JSC.',
    'page.capProd.title': 'Năng Lực Sản Xuất',
    'page.capProd.intro': 'Hệ thống nhà xưởng, dây chuyền sản xuất kết cấu thép hiện đại của Tiến Thịnh JSC.',
    'page.capConstruct.title': 'Năng Lực Thi Công',
    'page.capConstruct.intro': 'Năng lực thi công lắp đặt kết cấu thép tại công trường của Tiến Thịnh JSC.',
    'page.capFactory.title': 'Năng Lực Nhà Máy & Thiết Bị',
    'page.capFactory.intro': 'Trang thiết bị, máy móc hiện đại phục vụ sản xuất và thi công.',
    'page.capSafety.title': 'Quản Lý An Toàn Lao Động',
    'page.capSafety.intro': 'Chính sách và quy trình đảm bảo an toàn lao động tại Tiến Thịnh JSC.',
    'page.svcGeneral.title': 'Tổng Thầu Xây Dựng',
    'page.svcGeneral.intro': 'Dịch vụ tổng thầu xây dựng công trình công nghiệp và dân dụng.',
    'page.svcFdi.title': 'Tư Vấn Đầu Tư Dự Án FDI',
    'page.svcFdi.intro': 'Hỗ trợ tư vấn toàn diện cho các dự án đầu tư trực tiếp nước ngoài.',
    'page.svcSteel.title': 'Sản Xuất Kết Cấu Thép',
    'page.svcSteel.intro': 'Dịch vụ gia công, chế tạo kết cấu thép chất lượng cao.',
    'page.svcDesign.title': 'Tư Vấn Thiết Kế',
    'page.svcDesign.intro': 'Dịch vụ tư vấn thiết kế kết cấu thép và kiến trúc công trình.',
    'page.svcTrade.title': 'Kinh Doanh Thương Mại',
    'page.svcTrade.intro': 'Cung cấp vật tư, thiết bị xây dựng và kết cấu thép.',
    'page.projDone.title': 'Dự Án Đã Triển Khai',
    'page.projDone.intro': 'Danh sách các dự án đã hoàn thành thành công bởi Tiến Thịnh JSC.',
    'page.projOngoing.title': 'Dự Án Đang Triển Khai',
    'page.projOngoing.intro': 'Các dự án đang được Tiến Thịnh JSC thi công và triển khai.',
    'page.projCountry.title': 'Dự Án Theo Quốc Gia',
    'page.projCountry.intro': 'Phân loại dự án theo quốc gia và khu vực triển khai.',
    'page.projField.title': 'Dự Án Theo Lĩnh Vực',
    'page.projField.intro': 'Phân loại dự án theo lĩnh vực: công nghiệp, dân dụng, hạ tầng, năng lượng.',
    'page.newsSite.title': 'Tin Công Trường',
    'page.newsSite.intro': 'Cập nhật tiến độ và hoạt động tại các công trường của Tiến Thịnh JSC.',
    'page.newsRecruit.title': 'Tin Tuyển Dụng',
    'page.newsRecruit.intro': 'Cơ hội nghề nghiệp và tuyển dụng tại Tiến Thịnh JSC.',
    'page.newsKnowledge.title': 'Kiến Thức Chuyên Môn',
    'page.newsKnowledge.intro': 'Chia sẻ kinh nghiệm, kiến thức chuyên ngành kết cấu thép và xây dựng.',
    'page.documents.title': 'Tài Liệu',
    'page.documents.intro': 'Catalogue, hồ sơ năng lực và tài liệu kỹ thuật của Tiến Thịnh JSC.',

    // ─── Footer ───
    'footer.cta.title': 'Bạn có dự án cần tư vấn?',
    'footer.cta.desc': 'Đội ngũ chuyên gia của Tiến Thịnh JSC sẵn sàng đồng hành cùng bạn — từ tư vấn thiết kế đến thi công hoàn thiện.',
    'footer.cta.btn': 'LIÊN HỆ NGAY',
    'footer.tagline': 'Công ty CP Phát triển Đầu tư và Xây lắp Tiến Thịnh — Đối tác tin cậy trong lĩnh vực kết cấu thép và xây lắp công nghiệp.',
    'footer.nav': 'Điều hướng',
    'footer.nav.home': 'Trang chủ',
    'footer.nav.about': 'Giới thiệu',
    'footer.nav.history': 'Lịch sử',
    'footer.nav.capability': 'Năng lực',
    'footer.nav.projects': 'Dự án',
    'footer.info': 'Thông tin',
    'footer.info.news': 'Tin tức',
    'footer.info.contact': 'Liên hệ',
    'footer.info.documents': 'Tài liệu',
    'footer.contact': 'Liên hệ',
    'footer.copyright': '© 2024 Tiến Thịnh JSC. All rights reserved.',

    // ─── Documents ───
    'docs.empty': 'Chưa có tài liệu',
    'docs.emptyDesc': 'Tài liệu kỹ thuật sẽ sớm được cập nhật. Vui lòng quay lại sau.',
    'docs.download': 'Tải xuống',
    'docs.downloads': 'lượt tải',

    // ─── Route Titles ───
    'route.home': 'Trang chủ',
  },

  en: {
    // ─── Meta / SEO ───
    'meta.title': 'Tien Thinh JSC — Investment Development & Construction Joint Stock Company',
    'meta.description': 'Specialized in steel structure construction, industrial factories, steel bridges, and civil & industrial construction projects.',

    // ─── Header Navigation ───
    'nav.home': 'HOME',
    'nav.about': 'ABOUT US',
    'nav.about.letter': 'OPEN LETTER',
    'nav.about.vision': 'VISION & MISSION',
    'nav.about.values': 'CORE VALUES',
    'nav.about.history': 'HISTORY',
    'nav.about.org': 'ORGANIZATION',
    'nav.about.cert': 'CERTIFICATES',
    'nav.about.awards': 'AWARDS',
    'nav.capability': 'CAPABILITY',
    'nav.cap.hr': 'HUMAN RESOURCES',
    'nav.cap.prod': 'PRODUCTION CAPACITY',
    'nav.cap.construct': 'CONSTRUCTION CAPACITY',
    'nav.cap.factory': 'FACTORY & EQUIPMENT',
    'nav.cap.safety': 'SAFETY MANAGEMENT',
    'nav.services': 'SERVICES',
    'nav.svc.general': 'GENERAL CONTRACTOR',
    'nav.svc.fdi': 'FDI INVESTMENT CONSULTING',
    'nav.svc.steel': 'STEEL FABRICATION',
    'nav.svc.design': 'DESIGN CONSULTING',
    'nav.svc.trade': 'TRADING',
    'nav.projects': 'PROJECTS',
    'nav.proj.done': 'COMPLETED PROJECTS',
    'nav.proj.ongoing': 'ONGOING PROJECTS',
    'nav.proj.featured': 'FEATURED PROJECTS',
    'nav.proj.country': 'BY COUNTRY',
    'nav.proj.field': 'BY SECTOR',
    'nav.news': 'NEWS',
    'nav.news.company': 'COMPANY NEWS',
    'nav.news.site': 'SITE NEWS',
    'nav.news.recruit': 'RECRUITMENT',
    'nav.news.knowledge': 'EXPERTISE',
    'nav.contact': 'CONTACT',
    'nav.documents': 'DOCUMENTS',

    // ─── Mobile Nav Overlay ───
    'navOverlay.home': 'Home',
    'navOverlay.about': 'About Us',
    'navOverlay.about.letter': 'Open Letter',
    'navOverlay.about.vision': 'Vision & Mission',
    'navOverlay.about.values': 'Core Values',
    'navOverlay.about.history': 'History',
    'navOverlay.about.org': 'Organization',
    'navOverlay.about.cert': 'Certificates',
    'navOverlay.about.awards': 'Awards',
    'navOverlay.capability': 'Capability',
    'navOverlay.cap.hr': 'Human Resources',
    'navOverlay.cap.prod': 'Production Capacity',
    'navOverlay.cap.construct': 'Construction Capacity',
    'navOverlay.cap.factory': 'Factory & Equipment',
    'navOverlay.cap.safety': 'Safety Management',
    'navOverlay.services': 'Services',
    'navOverlay.svc.general': 'General Contractor',
    'navOverlay.svc.fdi': 'FDI Investment Consulting',
    'navOverlay.svc.steel': 'Steel Fabrication',
    'navOverlay.svc.design': 'Design Consulting',
    'navOverlay.svc.trade': 'Trading',
    'navOverlay.projects': 'Projects',
    'navOverlay.proj.done': 'Completed Projects',
    'navOverlay.proj.ongoing': 'Ongoing Projects',
    'navOverlay.proj.featured': 'Featured Projects',
    'navOverlay.proj.country': 'By Country',
    'navOverlay.proj.field': 'By Sector',
    'navOverlay.news': 'News',
    'navOverlay.news.company': 'Company News',
    'navOverlay.news.site': 'Site News',
    'navOverlay.news.recruit': 'Recruitment',
    'navOverlay.news.knowledge': 'Expertise',
    'navOverlay.contact': 'Contact',
    'navOverlay.documents': 'Documents',
    'navOverlay.newsletter': 'Subscribe to Newsletter',
    'navOverlay.privacy': 'Privacy Policy',

    // ─── View Toggle ───
    'view.space': 'SPACE',
    'view.road': 'JOURNEY',
    'view.grid': 'GRID',
    'road.scrollHint': 'Scroll to explore the journey',

    // ─── Stats Bar ───
    'stats.experience': 'Years of Experience',
    'stats.projects': 'Completed Projects',
    'stats.steel': 'Tons of Steel',
    'stats.staff': 'Employees',

    // ─── Search ───
    'search.placeholder': 'Search projects, constructions...',
    'theme.toggle': 'Toggle light/dark mode',

    // ─── Product Detail ───
    'product.history': 'HISTORY',
    'product.history.desc': 'Project history information will be updated.',
    'product.specs': 'TECHNICAL SPECS',
    'product.specs.desc': 'Technical specifications will be updated.',
    'product.scope': 'SCOPE OF WORK',
    'product.scope.desc': 'Scope of work will be updated.',
    'product.gallery': 'MORE IMAGES',
    'product.gallery.desc': 'Additional images will be updated.',
    'product.dragHint': '🔄 Drag to rotate 3D',

    // ─── History Page ───
    'history.title': 'Our History',
    'history.intro': 'A journey of over 20 years of building and development — from a small enterprise to a leading brand in steel structure and industrial construction.',
    'history.2005.title': 'Company Established',
    'history.2005.desc': 'Tien Thinh Investment Development & Construction JSC was established in Hanoi, specializing in steel structure construction for industrial factories with a team of 15 engineers and skilled workers.',
    'history.2008.title': 'Scale Expansion',
    'history.2008.desc': 'Invested in a 5,000m² steel fabrication workshop in Tu Liem Industrial Zone, increasing capacity to 500 tons/month. Completed Samsung Electronics Bac Ninh factory project.',
    'history.2012.title': 'ISO 9001:2008 Certified',
    'history.2012.desc': 'Standardized production and construction processes. Became a trusted subcontractor for Japanese and Korean general contractors in Vietnam.',
    'history.2015.title': 'Breakthrough Development',
    'history.2015.desc': 'Upgraded workshop to 12,000m², capacity 1,500 tons/month. Successfully completed a 200m river-crossing steel bridge and 50MW solar power plant.',
    'history.2018.title': 'Regional Expansion',
    'history.2018.desc': 'Expanded to Laos and Cambodia markets. Completed over 200 projects with total steel structure volume exceeding 50,000 tons.',
    'history.2021.title': 'Digital Transformation',
    'history.2021.desc': 'Applied BIM in design and project management. Invested in automated CNC cutting and drilling lines imported from Germany, enhancing precision and productivity.',
    'history.2024.title': 'Affirming Position',
    'history.2024.desc': '350+ employees, 20,000m² workshop, 3,000 tons/month capacity. Strategic partner of leading FDI corporations in Vietnam.',

    // ─── HR / Team Page ───
    'capHr.title': 'Human Resources',
    'capHr.intro': 'Experienced team of engineers and experts — the solid foundation for every construction project of Tien Thinh JSC.',
    'capHr.ceo': 'Chief Executive Officer',
    'capHr.ceo.bio': '25 years of experience in construction and steel structures. Master of Construction — Hanoi University of Science and Technology.',
    'capHr.cto': 'Chief Technical Officer',
    'capHr.cto.bio': '20 years of steel structure design experience. BIM Expert. PhD in Structural Engineering — National University of Civil Engineering.',
    'capHr.pm': 'Project Director',
    'capHr.pm.bio': '15 years managing major projects. PMI-PMP certified. Bachelor of Construction Management — University of Transport.',
    'capHr.design': 'Head of Design Department',
    'capHr.design.bio': '12 years of steel structure detail design experience. Proficient in Tekla Structures, AutoCAD.',
    'capHr.prod': 'Head of Production',
    'capHr.prod.bio': '18 years of steel fabrication experience. AWS-CWI certified welder inspector. Managing 20,000m² workshop.',
    'capHr.cfo': 'Chief Financial Officer',
    'capHr.cfo.bio': '15 years of financial management in construction enterprises. Master of Finance — National Economics University.',

    // ─── Exhibitions Page ───
    'exhibitions.title': 'Featured Projects',
    'exhibitions.intro': 'Proud achievements — testaments to the capability and credibility of Tien Thinh JSC throughout our development journey.',
    'exhibitions.samsung.title': 'Samsung Display Factory — Bac Ninh',
    'exhibitions.samsung.desc': 'Steel structure construction for 25,000m² factory, 3,500 tons of steel. Completed on schedule in 6 months.',
    'exhibitions.bridge.title': 'Steel Overpass — National Highway 1A',
    'exhibitions.bridge.desc': '180m steel bridge, HL-93 load capacity. Design and turnkey construction per TCVN standards.',
    'exhibitions.solar.title': 'Solar Power Plant — Ninh Thuan',
    'exhibitions.solar.desc': 'Supply and installation of steel frame structure for 50MW solar panel system on 60 hectares.',
    'exhibitions.highrise.title': '25-Story Office Building — Hanoi',
    'exhibitions.highrise.desc': 'Composite steel structure, 4,200 tons. Won the 2020 High-Quality Construction Award.',

    // ─── News Page ───
    'news.title': 'News',
    'news.intro': 'Latest updates on activities, projects and events of Tien Thinh JSC.',
    'news.readMore': 'Read more',
    'news.readArticle': 'Read article',
    'news.relatedPosts': 'Related Articles',
    'news.breadcrumb': 'News',

    // ─── Contact Page ───
    'contact.title': 'Contact Us',
    'contact.intro': 'Contact us for the best steel structure and construction solutions for your project.',
    'contact.name': 'Full Name *',
    'contact.email': 'Email *',
    'contact.phone': 'Phone Number',
    'contact.subject': 'Subject',
    'contact.subject.select': 'Select subject',
    'contact.subject.quote': 'Project Quote',
    'contact.subject.partner': 'Business Partnership',
    'contact.subject.career': 'Career',
    'contact.subject.other': 'Other',
    'contact.message': 'Message *',
    'contact.submit': 'Send Message',
    'contact.submitting': 'Sending...',
    'contact.success': '✓ Sent successfully!',
    'contact.error': '✗ Send failed, try again',
    'contact.hq': 'Headquarters',
    'contact.hqName': 'Tien Thinh Investment Development & Construction JSC',
    'contact.hqAddress': '88 Lang Street, Dong Da District',
    'contact.factory': 'Factory',
    'contact.factoryAddress': 'Lot C5, Dong Anh Industrial Zone',
    'contact.direct': 'Direct Contact',
    'contact.social': 'Social Media',
    'contact.mapTitle': 'Location on Map',

    // ─── About Letter Page ───
    'letter.title': 'Open Letter',
    'letter.subtitle': 'Message from the Board of Directors of Tien Thinh JSC',
    'letter.greeting': 'Dear Partners and Valued Customers,',
    'letter.body1': 'Over <strong>20 years</strong> of establishment and development, Tien Thinh Investment Development & Construction JSC has continuously strived to affirm its position as one of the leading companies in <strong>steel structure manufacturing and industrial construction</strong> in Vietnam.',
    'letter.quote': '"Quality is the foundation — Trust is the value — Innovation is the driving force for development."',
    'letter.body2': 'With a team of over <strong>350 engineers and skilled workers</strong>, a <strong>20,000m²</strong> production facility equipped with modern CNC lines, we are proud to have completed over <strong>500 projects</strong> across Vietnam and Southeast Asia.',
    'letter.body3': 'Tien Thinh JSC always takes construction quality as our compass and customer satisfaction as our measure of success. We commit to delivering the most optimal steel structure solutions — from design consulting, fabrication to on-site installation.',
    'letter.body4': 'We believe that the partnership between Tien Thinh JSC and our valued partners will continue to grow stronger, together building sustainable structures for the future.',
    'letter.regards': 'Best regards,',
    'letter.signName': 'Nguyen Van Thinh',
    'letter.signRole': 'CEO — Tien Thinh JSC',

    // ─── Values Page ───
    'values.title': 'Core Values',
    'values.subtitle': 'The foundation for every success',
    'values.intro': 'Tien Thinh JSC builds its corporate culture on 5 core values — guiding principles for all activities and decisions.',
    'values.quality': 'Quality',
    'values.quality.desc': 'No compromise on quality. Every product meets ISO 9001:2015 and AWS D1.1 standards before leaving the factory.',
    'values.trust': 'Credibility',
    'values.trust.desc': 'Committed to schedule and budget. Actions speak louder than words — building trust through every project.',
    'values.innovation': 'Innovation',
    'values.innovation.desc': 'Pioneering in BIM technology, CNC automation, and modern project management methods.',
    'values.safety': 'Safety',
    'values.safety.desc': 'Workplace safety is the top priority. Zero accident is a goal, not a slogan.',
    'values.sustainability': 'Sustainability',
    'values.sustainability.desc': 'Harmonious development with the environment. ISO 14001:2015 certified — optimizing resources, minimizing emissions.',

    // ─── Subpages (common) ───
    'subpage.updating': 'Page content is being updated. Please check back later.',
    'page.vision.title': 'Vision & Mission',
    'page.vision.intro': 'Sustainable development orientation and mission of Tien Thinh JSC in the construction industry.',
    'page.org.title': 'Organization Chart',
    'page.org.intro': 'Organizational structure and management apparatus of Tien Thinh JSC.',
    'page.cert.title': 'Certificates',
    'page.cert.intro': 'Competency certificates, ISO certifications and professional licenses of Tien Thinh JSC.',
    'page.awards.title': 'Awards',
    'page.awards.intro': 'Awards and honors recognizing the achievements of Tien Thinh JSC.',
    'page.capProd.title': 'Production Capacity',
    'page.capProd.intro': 'Modern steel structure fabrication workshop and production lines of Tien Thinh JSC.',
    'page.capConstruct.title': 'Construction Capacity',
    'page.capConstruct.intro': 'Steel structure installation and on-site construction capabilities of Tien Thinh JSC.',
    'page.capFactory.title': 'Factory & Equipment',
    'page.capFactory.intro': 'Modern equipment and machinery for production and construction.',
    'page.capSafety.title': 'Safety Management',
    'page.capSafety.intro': 'Workplace safety policies and procedures at Tien Thinh JSC.',
    'page.svcGeneral.title': 'General Contractor',
    'page.svcGeneral.intro': 'General contracting services for industrial and civil construction projects.',
    'page.svcFdi.title': 'FDI Investment Consulting',
    'page.svcFdi.intro': 'Comprehensive consulting support for foreign direct investment projects.',
    'page.svcSteel.title': 'Steel Fabrication',
    'page.svcSteel.intro': 'High-quality steel structure fabrication and manufacturing services.',
    'page.svcDesign.title': 'Design Consulting',
    'page.svcDesign.intro': 'Steel structure and architectural design consulting services.',
    'page.svcTrade.title': 'Trading',
    'page.svcTrade.intro': 'Supply of construction materials, equipment and steel structures.',
    'page.projDone.title': 'Completed Projects',
    'page.projDone.intro': 'List of projects successfully completed by Tien Thinh JSC.',
    'page.projOngoing.title': 'Ongoing Projects',
    'page.projOngoing.intro': 'Projects currently being constructed and implemented by Tien Thinh JSC.',
    'page.projCountry.title': 'Projects by Country',
    'page.projCountry.intro': 'Projects categorized by country and deployment region.',
    'page.projField.title': 'Projects by Sector',
    'page.projField.intro': 'Projects categorized by sector: industrial, civil, infrastructure, energy.',
    'page.newsSite.title': 'Site News',
    'page.newsSite.intro': 'Progress updates and activities at Tien Thinh JSC construction sites.',
    'page.newsRecruit.title': 'Recruitment',
    'page.newsRecruit.intro': 'Career opportunities and recruitment at Tien Thinh JSC.',
    'page.newsKnowledge.title': 'Technical Knowledge',
    'page.newsKnowledge.intro': 'Sharing experience and expertise in steel structure and construction.',
    'page.documents.title': 'Documents',
    'page.documents.intro': 'Catalogues, company profiles and technical documents of Tien Thinh JSC.',

    // ─── Footer ───
    'footer.cta.title': 'Have a project that needs consulting?',
    'footer.cta.desc': 'Our team of experts at Tien Thinh JSC is ready to accompany you — from design consulting to construction completion.',
    'footer.cta.btn': 'CONTACT NOW',
    'footer.tagline': 'Tien Thinh Investment Development & Construction JSC — Trusted partner in steel structure and industrial construction.',
    'footer.nav': 'Navigation',
    'footer.nav.home': 'Home',
    'footer.nav.about': 'About Us',
    'footer.nav.history': 'History',
    'footer.nav.capability': 'Capability',
    'footer.nav.projects': 'Projects',
    'footer.info': 'Information',
    'footer.info.news': 'News',
    'footer.info.contact': 'Contact',
    'footer.info.documents': 'Documents',
    'footer.contact': 'Contact',
    'footer.copyright': '© 2024 Tien Thinh JSC. All rights reserved.',

    // ─── Documents ───
    'docs.empty': 'No documents yet',
    'docs.emptyDesc': 'Technical documents will be updated soon. Please check back later.',
    'docs.download': 'Download',
    'docs.downloads': 'downloads',

    // ─── Route Titles ───
    'route.home': 'Home',
  },

  zh: {
    // ─── Meta / SEO ───
    'meta.title': '进盛建设股份公司 — 投资发展与建筑安装股份有限公司',
    'meta.description': '专业从事钢结构施工、工业厂房、钢桥及民用与工业建筑工程。',

    // ─── Header Navigation ───
    'nav.home': '首页',
    'nav.about': '关于我们',
    'nav.about.letter': '公开信',
    'nav.about.vision': '愿景与使命',
    'nav.about.values': '核心价值',
    'nav.about.history': '历史',
    'nav.about.org': '组织架构',
    'nav.about.cert': '资质证书',
    'nav.about.awards': '荣誉奖项',
    'nav.capability': '实力',
    'nav.cap.hr': '人力资源',
    'nav.cap.prod': '生产能力',
    'nav.cap.construct': '施工能力',
    'nav.cap.factory': '工厂与设备',
    'nav.cap.safety': '安全管理',
    'nav.services': '服务',
    'nav.svc.general': '总承包商',
    'nav.svc.fdi': 'FDI投资咨询',
    'nav.svc.steel': '钢结构制造',
    'nav.svc.design': '设计咨询',
    'nav.svc.trade': '贸易',
    'nav.projects': '项目',
    'nav.proj.done': '已完成项目',
    'nav.proj.ongoing': '进行中项目',
    'nav.proj.featured': '精选项目',
    'nav.proj.country': '按国家',
    'nav.proj.field': '按行业',
    'nav.news': '新闻',
    'nav.news.company': '公司新闻',
    'nav.news.site': '工地新闻',
    'nav.news.recruit': '招聘信息',
    'nav.news.knowledge': '专业知识',
    'nav.contact': '联系我们',
    'nav.documents': '资料',

    // ─── Mobile Nav Overlay ───
    'navOverlay.home': '首页',
    'navOverlay.about': '关于我们',
    'navOverlay.about.letter': '公开信',
    'navOverlay.about.vision': '愿景与使命',
    'navOverlay.about.values': '核心价值',
    'navOverlay.about.history': '历史',
    'navOverlay.about.org': '组织架构',
    'navOverlay.about.cert': '资质证书',
    'navOverlay.about.awards': '荣誉奖项',
    'navOverlay.capability': '实力',
    'navOverlay.cap.hr': '人力资源',
    'navOverlay.cap.prod': '生产能力',
    'navOverlay.cap.construct': '施工能力',
    'navOverlay.cap.factory': '工厂与设备',
    'navOverlay.cap.safety': '安全管理',
    'navOverlay.services': '服务',
    'navOverlay.svc.general': '总承包商',
    'navOverlay.svc.fdi': 'FDI投资咨询',
    'navOverlay.svc.steel': '钢结构制造',
    'navOverlay.svc.design': '设计咨询',
    'navOverlay.svc.trade': '贸易',
    'navOverlay.projects': '项目',
    'navOverlay.proj.done': '已完成项目',
    'navOverlay.proj.ongoing': '进行中项目',
    'navOverlay.proj.featured': '精选项目',
    'navOverlay.proj.country': '按国家',
    'navOverlay.proj.field': '按行业',
    'navOverlay.news': '新闻',
    'navOverlay.news.company': '公司新闻',
    'navOverlay.news.site': '工地新闻',
    'navOverlay.news.recruit': '招聘信息',
    'navOverlay.news.knowledge': '专业知识',
    'navOverlay.contact': '联系我们',
    'navOverlay.documents': '资料',
    'navOverlay.newsletter': '订阅新闻',
    'navOverlay.privacy': '隐私政策',

    // ─── View Toggle ───
    'view.space': '空间',
    'view.road': '历程',
    'view.grid': '网格',
    'road.scrollHint': '滚动探索发展历程',

    // ─── Stats Bar ───
    'stats.experience': '年经验',
    'stats.projects': '已完成项目',
    'stats.steel': '吨钢材',
    'stats.staff': '员工',

    // ─── Search ───
    'search.placeholder': '搜索工程、项目...',
    'theme.toggle': '切换明暗模式',

    // ─── Product Detail ───
    'product.history': '历史',
    'product.history.desc': '工程历史信息将会更新。',
    'product.specs': '技术参数',
    'product.specs.desc': '技术参数将会更新。',
    'product.scope': '工作范围',
    'product.scope.desc': '工作范围将会更新。',
    'product.gallery': '更多图片',
    'product.gallery.desc': '补充图片将会更新。',
    'product.dragHint': '🔄 拖动鼠标旋转3D',

    // ─── History Page ───
    'history.title': '公司历史',
    'history.intro': '超过20年的建设与发展历程——从一家小型企业成长为钢结构和工业建筑领域的领先品牌。',
    'history.2005.title': '公司成立',
    'history.2005.desc': '进盛投资发展与建筑安装股份公司在河内成立，专业从事工业厂房钢结构施工，初始团队15名工程师和技术工人。',
    'history.2008.title': '规模扩大',
    'history.2008.desc': '投资建设5,000平方米钢结构加工车间，月产能提升至500吨。完成三星电子北宁工厂项目。',
    'history.2012.title': '获得ISO 9001:2008认证',
    'history.2012.desc': '生产和施工流程标准化。成为日本和韩国总承包商在越南的信赖分包商。',
    'history.2015.title': '突破性发展',
    'history.2015.desc': '车间升级至12,000平方米，月产能1,500吨。成功完成200米跨河钢桥和50兆瓦太阳能电站项目。',
    'history.2018.title': '区域扩展',
    'history.2018.desc': '拓展至老挝和柬埔寨市场。完成200多个项目，钢结构总量超过50,000吨。',
    'history.2021.title': '数字化转型',
    'history.2021.desc': '在设计和项目管理中应用BIM技术。投资引进德国自动化CNC切割和钻孔生产线，提高精度和生产力。',
    'history.2024.title': '确立地位',
    'history.2024.desc': '350+员工，20,000平方米车间，月产能3,000吨。越南领先FDI企业的战略合作伙伴。',

    // ─── HR / Team Page ───
    'capHr.title': '人力资源',
    'capHr.intro': '经验丰富的工程师和专家团队——进盛建设每一个工程项目的坚实基础。',
    'capHr.ceo': '总经理',
    'capHr.ceo.bio': '25年建筑和钢结构行业经验。河内理工大学建筑学硕士。',
    'capHr.cto': '技术总监',
    'capHr.cto.bio': '20年钢结构设计经验。BIM专家。国家建筑大学工程技术博士。',
    'capHr.pm': '项目总监',
    'capHr.pm.bio': '15年大型项目管理经验。PMI-PMP认证。交通大学建筑管理学士。',
    'capHr.design': '设计部主管',
    'capHr.design.bio': '12年钢结构详细设计经验。精通Tekla Structures和AutoCAD。',
    'capHr.prod': '生产部主管',
    'capHr.prod.bio': '18年钢结构制造经验。AWS-CWI认证焊接检验师。管理20,000平方米车间。',
    'capHr.cfo': '财务总监',
    'capHr.cfo.bio': '15年建筑企业财务管理经验。国民经济大学财务学硕士。',

    // ─── Exhibitions Page ───
    'exhibitions.title': '精选项目',
    'exhibitions.intro': '令人骄傲的成就——见证进盛建设在发展历程中的实力与信誉。',
    'exhibitions.samsung.title': '三星显示工厂 — 北宁',
    'exhibitions.samsung.desc': '25,000平方米厂房钢结构施工，3,500吨钢材。6个月内按时完工。',
    'exhibitions.bridge.title': '钢制立交桥 — 1号国道',
    'exhibitions.bridge.desc': '180米钢桥，HL-93荷载等级。按TCVN标准设计和交钥匙施工。',
    'exhibitions.solar.title': '太阳能电站 — 宁顺',
    'exhibitions.solar.desc': '为60公顷区域的50兆瓦太阳能板系统提供和安装钢框架结构。',
    'exhibitions.highrise.title': '25层办公楼 — 河内',
    'exhibitions.highrise.desc': '组合钢结构，4,200吨。荣获2020年优质工程奖。',

    // ─── News Page ───
    'news.title': '新闻',
    'news.intro': '进盛建设活动、项目和事件的最新动态。',
    'news.readMore': '阅读更多',
    'news.readArticle': '阅读文章',
    'news.relatedPosts': '相关文章',
    'news.breadcrumb': '新闻',

    // ─── Contact Page ───
    'contact.title': '联系我们',
    'contact.intro': '联系我们获取最佳钢结构和建筑解决方案。',
    'contact.name': '姓名 *',
    'contact.email': '电子邮箱 *',
    'contact.phone': '电话号码',
    'contact.subject': '主题',
    'contact.subject.select': '选择主题',
    'contact.subject.quote': '项目报价',
    'contact.subject.partner': '商务合作',
    'contact.subject.career': '招聘',
    'contact.subject.other': '其他',
    'contact.message': '内容 *',
    'contact.submit': '发送消息',
    'contact.submitting': '发送中...',
    'contact.success': '✓ 发送成功！',
    'contact.error': '✗ 发送失败，请重试',
    'contact.hq': '总部',
    'contact.hqName': '进盛投资发展与建筑安装股份公司',
    'contact.hqAddress': '栋多郡朗街88号',
    'contact.factory': '工厂',
    'contact.factoryAddress': '东英工业区C5地块',
    'contact.direct': '直接联系',
    'contact.social': '社交媒体',
    'contact.mapTitle': '地图位置',

    // ─── About Letter Page ───
    'letter.title': '公开信',
    'letter.subtitle': '进盛建设董事会致辞',
    'letter.greeting': '尊敬的合作伙伴和客户：',
    'letter.body1': '经过<strong>20多年</strong>的创立和发展，进盛投资发展与建筑安装股份公司不断努力，确立了在越南<strong>钢结构制造和工业建筑</strong>领域的领先地位。',
    'letter.quote': '"质量是基础——信誉是价值——创新是发展的驱动力。"',
    'letter.body2': '凭借<strong>350多名工程师和技术工人</strong>的团队，配备现代化CNC生产线的<strong>20,000平方米</strong>生产设施，我们自豪地完成了遍布越南和东南亚的<strong>500多个项目</strong>。',
    'letter.body3': '进盛建设始终以工程质量为指南，以客户满意度为成功的衡量标准。我们致力于提供最优质的钢结构解决方案——从设计咨询、加工制造到现场安装。',
    'letter.body4': '我们相信，进盛建设与尊贵合作伙伴之间的合作关系将日益巩固，携手为未来建设可持续的工程。',
    'letter.regards': '此致敬礼，',
    'letter.signName': '阮文盛',
    'letter.signRole': '总经理 — 进盛建设',

    // ─── Values Page ───
    'values.title': '核心价值',
    'values.subtitle': '每一次成功的基石',
    'values.intro': '进盛建设以5大核心价值构建企业文化——作为所有活动和决策的指导原则。',
    'values.quality': '质量',
    'values.quality.desc': '对质量绝不妥协。每件产品出厂前均符合ISO 9001:2015和AWS D1.1标准。',
    'values.trust': '信誉',
    'values.trust.desc': '承诺按时按预算完成。言行一致——通过每个项目建立信任。',
    'values.innovation': '创新',
    'values.innovation.desc': '在BIM技术、CNC自动化和现代项目管理方法方面走在前列。',
    'values.safety': '安全',
    'values.safety.desc': '工作场所安全是首要任务。零事故是目标，而非口号。',
    'values.sustainability': '可持续性',
    'values.sustainability.desc': '与环境和谐发展。获ISO 14001:2015认证——优化资源，减少排放。',

    // ─── Subpages (common) ───
    'subpage.updating': '页面内容正在更新中，请稍后再来。',
    'page.vision.title': '愿景与使命',
    'page.vision.intro': '进盛建设在建筑行业的可持续发展方向和使命。',
    'page.org.title': '组织架构',
    'page.org.intro': '进盛建设的组织结构和管理体系。',
    'page.cert.title': '资质证书',
    'page.cert.intro': '进盛建设的资质证书、ISO认证和专业执照。',
    'page.awards.title': '荣誉奖项',
    'page.awards.intro': '表彰进盛建设成就的荣誉和奖项。',
    'page.capProd.title': '生产能力',
    'page.capProd.intro': '进盛建设现代化钢结构加工车间和生产线。',
    'page.capConstruct.title': '施工能力',
    'page.capConstruct.intro': '进盛建设的钢结构安装和现场施工能力。',
    'page.capFactory.title': '工厂与设备',
    'page.capFactory.intro': '用于生产和施工的现代化设备和机械。',
    'page.capSafety.title': '安全管理',
    'page.capSafety.intro': '进盛建设的工作安全政策和程序。',
    'page.svcGeneral.title': '总承包商',
    'page.svcGeneral.intro': '工业和民用建筑项目总承包服务。',
    'page.svcFdi.title': 'FDI投资咨询',
    'page.svcFdi.intro': '为外商直接投资项目提供全面咨询支持。',
    'page.svcSteel.title': '钢结构制造',
    'page.svcSteel.intro': '高质量钢结构加工制造服务。',
    'page.svcDesign.title': '设计咨询',
    'page.svcDesign.intro': '钢结构和建筑设计咨询服务。',
    'page.svcTrade.title': '贸易',
    'page.svcTrade.intro': '建筑材料、设备和钢结构供应。',
    'page.projDone.title': '已完成项目',
    'page.projDone.intro': '进盛建设成功完成的项目列表。',
    'page.projOngoing.title': '进行中项目',
    'page.projOngoing.intro': '进盛建设正在施工和实施的项目。',
    'page.projCountry.title': '按国家分类项目',
    'page.projCountry.intro': '按国家和部署区域分类的项目。',
    'page.projField.title': '按行业分类项目',
    'page.projField.intro': '按行业分类的项目：工业、民用、基础设施、能源。',
    'page.newsSite.title': '工地新闻',
    'page.newsSite.intro': '进盛建设工地的进度更新和活动。',
    'page.newsRecruit.title': '招聘信息',
    'page.newsRecruit.intro': '进盛建设的职业机会和招聘信息。',
    'page.newsKnowledge.title': '专业知识',
    'page.newsKnowledge.intro': '钢结构和建筑领域的经验和专业知识分享。',
    'page.documents.title': '资料',
    'page.documents.intro': '进盛建设的产品目录、公司简介和技术文件。',

    // ─── Footer ───
    'footer.cta.title': '有项目需要咨询？',
    'footer.cta.desc': '进盛建设专家团队随时准备为您服务——从设计咨询到施工完成。',
    'footer.cta.btn': '立即联系',
    'footer.tagline': '进盛投资发展与建筑安装股份公司——钢结构和工业建筑领域的可信赖合作伙伴。',
    'footer.nav': '导航',
    'footer.nav.home': '首页',
    'footer.nav.about': '关于我们',
    'footer.nav.history': '历史',
    'footer.nav.capability': '实力',
    'footer.nav.projects': '项目',
    'footer.info': '信息',
    'footer.info.news': '新闻',
    'footer.info.contact': '联系',
    'footer.info.documents': '资料',
    'footer.contact': '联系',
    'footer.copyright': '© 2024 进盛建设股份公司 版权所有。',

    // ─── Documents ───
    'docs.empty': '暂无资料',
    'docs.emptyDesc': '技术资料即将更新，请稍后再来。',
    'docs.download': '下载',
    'docs.downloads': '次下载',

    // ─── Route Titles ───
    'route.home': '首页',
  }
};

// ============================================
// i18n ENGINE
// ============================================
let currentLang = localStorage.getItem('tt-lang') || 'vi';

/**
 * Get current language
 */
export function getLang() {
  return currentLang;
}

/**
 * Get a translated string by key
 */
export function t(key, fallback) {
  return translations[currentLang]?.[key] || translations['vi']?.[key] || fallback || key;
}

/**
 * Switch language and update the entire page
 */
export function setLang(lang) {
  if (!translations[lang]) return;
  currentLang = lang;
  localStorage.setItem('tt-lang', lang);
  document.documentElement.lang = lang;

  // Update all elements with data-i18n attribute
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const val = t(key);
    if (val !== key) {
      // Check if the element has HTML content (data-i18n-html)
      if (el.hasAttribute('data-i18n-html')) {
        el.innerHTML = val;
      } else {
        el.textContent = val;
      }
    }
  });

  // Update placeholders
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    el.placeholder = t(key);
  });

  // Update aria-labels
  document.querySelectorAll('[data-i18n-label]').forEach(el => {
    const key = el.getAttribute('data-i18n-label');
    el.setAttribute('aria-label', t(key));
  });

  // Update document title
  document.title = t('meta.title');

  // Update language switcher active states
  document.querySelectorAll('[data-lang-switch]').forEach(btn => {
    const btnLang = btn.getAttribute('data-lang-switch');
    btn.classList.toggle('active', btnLang === lang);
  });

  // Dispatch custom event for JS-rendered content to re-render
  window.dispatchEvent(new CustomEvent('langchange', { detail: { lang } }));
}

/**
 * Initialize the i18n system — call once on DOMContentLoaded
 */
export function initI18n() {
  // Set initial lang attribute
  document.documentElement.lang = currentLang;

  // Apply translations to existing DOM
  if (currentLang !== 'vi') {
    setLang(currentLang);
  }

  // Setup language switcher buttons
  document.querySelectorAll('[data-lang-switch]').forEach(btn => {
    const lang = btn.getAttribute('data-lang-switch');
    btn.classList.toggle('active', lang === currentLang);
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      setLang(lang);
    });
  });
}

/**
 * Get the English/Vietnamese route title for navigation
 */
export function getRouteTitle(page) {
  const ROUTE_TITLES = {
    vi: {
      'home': 'Trang chủ',
      'about-letter': 'Thư Ngỏ',
      'about-vision': 'Tầm Nhìn & Sứ Mệnh',
      'about-values': 'Giá Trị Cốt Lõi',
      'history': 'Lịch Sử Hình Thành',
      'about-org': 'Sơ Đồ Tổ Chức',
      'about-cert': 'Chứng Chỉ',
      'about-awards': 'Giải Thưởng',
      'cap-hr': 'Năng Lực Nhân Sự',
      'cap-prod': 'Năng Lực Sản Xuất',
      'cap-construct': 'Năng Lực Thi Công',
      'cap-factory': 'Năng Lực Nhà Máy Thiết Bị',
      'cap-safety': 'Quản Lý An Toàn Lao Động',
      'svc-general': 'Tổng Thầu Xây Dựng',
      'svc-fdi': 'Tư Vấn Đầu Tư Dự Án FDI',
      'svc-steel': 'Sản Xuất Kết Cấu Thép',
      'svc-design': 'Tư Vấn Thiết Kế',
      'svc-trade': 'Kinh Doanh Thương Mại',
      'proj-done': 'Dự Án Đã Triển Khai',
      'proj-ongoing': 'Dự Án Đang Triển Khai',
      'exhibitions': 'Dự Án Tiêu Biểu',
      'proj-country': 'Dự Án Theo Quốc Gia',
      'proj-field': 'Dự Án Theo Lĩnh Vực',
      'news': 'Tin Công Ty',
      'news-site': 'Tin Công Trường',
      'news-recruit': 'Tin Tuyển Dụng',
      'news-knowledge': 'Kiến Thức Chuyên Môn',
      'contact': 'Liên Hệ',
      'documents': 'Tài Liệu',
    },
    en: {
      'home': 'Home',
      'about-letter': 'Open Letter',
      'about-vision': 'Vision & Mission',
      'about-values': 'Core Values',
      'history': 'Our History',
      'about-org': 'Organization Chart',
      'about-cert': 'Certificates',
      'about-awards': 'Awards',
      'cap-hr': 'Human Resources',
      'cap-prod': 'Production Capacity',
      'cap-construct': 'Construction Capacity',
      'cap-factory': 'Factory & Equipment',
      'cap-safety': 'Safety Management',
      'svc-general': 'General Contractor',
      'svc-fdi': 'FDI Investment Consulting',
      'svc-steel': 'Steel Fabrication',
      'svc-design': 'Design Consulting',
      'svc-trade': 'Trading',
      'proj-done': 'Completed Projects',
      'proj-ongoing': 'Ongoing Projects',
      'exhibitions': 'Featured Projects',
      'proj-country': 'Projects by Country',
      'proj-field': 'Projects by Sector',
      'news': 'Company News',
      'news-site': 'Site News',
      'news-recruit': 'Recruitment',
      'news-knowledge': 'Technical Knowledge',
      'contact': 'Contact Us',
      'documents': 'Documents',
    },
    zh: {
      'home': '首页',
      'about-letter': '公开信',
      'about-vision': '愿景与使命',
      'about-values': '核心价值',
      'history': '公司历史',
      'about-org': '组织架构',
      'about-cert': '资质证书',
      'about-awards': '荣誉奖项',
      'cap-hr': '人力资源',
      'cap-prod': '生产能力',
      'cap-construct': '施工能力',
      'cap-factory': '工厂与设备',
      'cap-safety': '安全管理',
      'svc-general': '总承包商',
      'svc-fdi': 'FDI投资咨询',
      'svc-steel': '钢结构制造',
      'svc-design': '设计咨询',
      'svc-trade': '贸易',
      'proj-done': '已完成项目',
      'proj-ongoing': '进行中项目',
      'exhibitions': '精选项目',
      'proj-country': '按国家分类项目',
      'proj-field': '按行业分类项目',
      'news': '公司新闻',
      'news-site': '工地新闻',
      'news-recruit': '招聘信息',
      'news-knowledge': '专业知识',
      'contact': '联系我们',
      'documents': '资料',
    }
  };

  return ROUTE_TITLES[currentLang]?.[page] || ROUTE_TITLES['vi']?.[page] || 'Trang chủ';
}

export { translations };
export default { t, getLang, setLang, initI18n, getRouteTitle, translations };
