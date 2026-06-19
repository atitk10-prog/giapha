import { Gender, ClanMember, ClanBranch, ClanEvent, FundTransaction, ScholarshipRecord, ClanDocument, PhotoAlbum } from './types.js';

export const initialBranches: ClanBranch[] = [
  {
    id: 'CHI_TRUONG',
    name: 'Chi Trưởng (Nguyễn Văn Cường)',
    leaderId: 'NV-005',
    leaderName: 'Nguyễn Văn Hùng',
    description: 'Chi họ ngành trưởng cư trú chính tại dòng tộc hương hỏa Đồng Trường, Xã Trà My, TP. Đà Nẵng (trước đây thuộc Quảng Nam).'
  },
  {
    id: 'CHI_THU_01',
    name: 'Chi Thứ Một (Nguyễn Văn Đức)',
    leaderId: 'NV-006',
    leaderName: 'Nguyễn Nam Sơn',
    description: 'Chi họ ngành thứ cư trú chính tại TP. Đà Nẵng và các tỉnh phía Nam.'
  }
];

export const initialMembers: ClanMember[] = [
  // ĐỜI 1
  {
    id: 'NV-001',
    fullName: 'Nguyễn Văn An',
    nickname: 'Cụ Tổ đời thứ 1',
    gender: Gender.MALE,
    generation: 1,
    branchId: 'CHI_TRUONG',
    dob: '1890',
    isDeceased: true,
    dod: '1970',
    burialPlace: 'Bản tộc Lăng mộ, Đồng Trường 2, thị trấn Trà My, Quảng Nam',
    birthPlace: 'Đồng Trường 2, thị trấn Trà My, Quảng Nam',
    hometown: 'Đồng Trường 2, thị trấn Trà My, Quảng Nam',
    profession: 'Nhà nho, Nông nghiệp',
    education: 'Hán học Khấm khoa',
    address: 'Đồng Trường 2, thị trấn Trà My, Quảng Nam',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
    biography: 'Đồng chí khởi đầu gầy dựng gia nghiệp tộc họ Nguyễn tại xã Duy Xuyên, là người nhân hậu, tiếng thơm xa gần.',
    achievements: ['Khai sơn lập tộc họ Nguyễn', 'Được sắc phong Tộc Trưởng hiếu nhân'],
    locationName: 'Quảng Nam (nay TP. Đà Nẵng)',
    lat: 15.3417,
    lng: 108.2503,
    spouseId: 'NV-001W'
  },
  {
    id: 'NV-001W',
    fullName: 'Lê Thị Bình',
    nickname: 'Cụ Bà',
    gender: Gender.FEMALE,
    generation: 1,
    branchId: 'CHI_TRUONG',
    dob: '1893',
    isDeceased: true,
    dod: '1975',
    burialPlace: 'Đồng Trường 2, thị trấn Trà My, Quảng Nam',
    birthPlace: 'Nghệ An',
    hometown: 'Nghệ An',
    profession: 'Nội trợ, Nông nghiệp',
    address: 'Đồng Trường 2, thị trấn Trà My, Quảng Nam',
    avatarUrl: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&q=80&w=200',
    biography: 'Cụ bà tào khang tần tảo nuôi dưỡng con cháu đỗ đạt.',
    spouseId: 'NV-001'
  },

  // ĐỜI 2
  {
    id: 'NV-002',
    fullName: 'Nguyễn Văn Cường',
    nickname: 'Ông Hai Cường',
    gender: Gender.MALE,
    generation: 2,
    branchId: 'CHI_TRUONG',
    dob: '1915',
    isDeceased: true,
    dod: '1995',
    burialPlace: 'Nghĩa trang Đồng Trường 2, thị trấn Trà My, Quảng Nam',
    birthPlace: 'Đồng Trường 2, thị trấn Trà My, Quảng Nam',
    hometown: 'Đồng Trường 2, thị trấn Trà My, Quảng Nam',
    profession: 'Dạy học, Lương y',
    education: 'Tú Tài',
    address: 'Đồng Trường, Xã Trà My, TP. Đà Nẵng',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    biography: 'Người khai sáng phong trào học tập của chi nhà, từng tham gia cứu tế năm 1945.',
    achievements: ['Bằng khen vì sự nghiệp Giáo dục dòng họ', 'Thầy thuốc nhân dân uy tín'],
    locationName: 'Quảng Nam (nay TP. Đà Nẵng)',
    lat: 15.3417,
    lng: 108.2503,
    fatherId: 'NV-001',
    motherId: 'NV-001W',
    spouseId: 'NV-002W'
  },
  {
    id: 'NV-002W',
    fullName: 'Trần Thị Dung',
    nickname: 'Bà Hai Cường',
    gender: Gender.FEMALE,
    generation: 2,
    branchId: 'CHI_TRUONG',
    dob: '1918',
    isDeceased: true,
    dod: '2001',
    burialPlace: 'Quảng Nam',
    birthPlace: 'Hòa Vang, Đà Nẵng',
    hometown: 'Hòa Vang, Đà Nẵng',
    spouseId: 'NV-002'
  },
  {
    id: 'NV-003',
    fullName: 'Nguyễn Văn Đức',
    nickname: 'Ông Ba Đức',
    gender: Gender.MALE,
    generation: 2,
    branchId: 'CHI_THU_01',
    dob: '1918',
    isDeceased: true,
    dod: '1988',
    burialPlace: 'Nghĩa trang Hòa Sơn, Đà Nẵng',
    birthPlace: 'Đồng Trường 2, thị trấn Trà My, Quảng Nam',
    hometown: 'Đồng Trường 2, thị trấn Trà My, Quảng Nam',
    profession: 'Kinh doanh gỗ',
    education: 'Trung học',
    address: 'Đà Nẵng',
    avatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=200',
    biography: 'Sáng lập nên Chi Thứ Một lập nghiệp tại Đà Nẵng.',
    locationName: 'Đà Nẵng',
    lat: 16.0544,
    lng: 108.2022,
    fatherId: 'NV-001',
    motherId: 'NV-001W',
    spouseId: 'NV-003W'
  },
  {
    id: 'NV-003W',
    fullName: 'Phạm Thị Em',
    nickname: 'Bà Ba Đức',
    gender: Gender.FEMALE,
    generation: 2,
    branchId: 'CHI_THU_01',
    dob: '1921',
    isDeceased: true,
    dod: '2005',
    spouseId: 'NV-003'
  },

  // ĐỜI 3
  {
    id: 'NV-004',
    fullName: 'Nguyễn Văn Hải',
    nickname: 'Bác Tư Hải',
    gender: Gender.MALE,
    generation: 3,
    branchId: 'CHI_TRUONG',
    dob: '1945',
    isDeceased: true,
    dod: '2020',
    burialPlace: 'Hương hỏa tộc viên Đồng Trường 2, thị trấn Trà My, Quảng Nam',
    birthPlace: 'Quảng Nam',
    hometown: 'Đồng Trường 2, thị trấn Trà My, Quảng Nam',
    profession: 'Kỹ sư cầu đường',
    education: 'Đại học Bách Khoa',
    address: 'Hải Châu, Đà Nẵng',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    biography: 'Tham gia xây dựng nhiều cung đường huyết mạch quốc gia.',
    achievements: ['Huân chương lao động hạng III', 'Kỹ sư xuất sắc'],
    locationName: 'Đà Nẵng',
    lat: 16.0544,
    lng: 108.2022,
    fatherId: 'NV-002',
    motherId: 'NV-002W',
    spouseId: 'NV-004W'
  },
  {
    id: 'NV-004W',
    fullName: 'Hoàng Thị Hoa',
    gender: Gender.FEMALE,
    generation: 3,
    branchId: 'CHI_TRUONG',
    dob: '1948',
    isDeceased: false,
    address: 'Hải Châu, Đà Nẵng',
    spouseId: 'NV-004'
  },
  {
    id: 'NV-005',
    fullName: 'Nguyễn Văn Hùng',
    nickname: 'Chú Năm Hùng',
    gender: Gender.MALE,
    generation: 3,
    branchId: 'CHI_TRUONG',
    dob: '1948',
    isDeceased: false,
    birthPlace: 'Quảng Nam',
    hometown: 'Đồng Trường 2, thị trấn Trà My, Quảng Nam',
    profession: 'Cựu thanh niên xung phong, Trưởng tộc',
    education: 'Cử nhân Sử học',
    address: 'Đồng Trường 2, thị trấn Trà My, Quảng Nam',
    phone: '0905123456',
    email: 'hung.nguyenvan@gmail.com',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    biography: 'Đang đảm đương ngôi vị Trưởng chi họ Trưởng tộc họ Nguyễn tại Đồng Trường, Xã Trà My. Lưu giữ hương hỏa, tộc phả dòng tộc.',
    achievements: ['Cựu chiến binh gương mẫu', 'Trưởng chi tích cực 10 năm liền dóng góp dòng họ'],
    locationName: 'Quảng Nam (nay TP. Đà Nẵng)',
    lat: 15.3417,
    lng: 108.2503,
    fatherId: 'NV-002',
    motherId: 'NV-002W',
    spouseId: 'NV-005W'
  },
  {
    id: 'NV-005W',
    fullName: 'Vũ Thị Hương',
    gender: Gender.FEMALE,
    generation: 3,
    branchId: 'CHI_TRUONG',
    dob: '1952',
    isDeceased: false,
    address: 'Đồng Trường 2, thị trấn Trà My, Quảng Nam',
    spouseId: 'NV-005'
  },
  {
    id: 'NV-006',
    fullName: 'Nguyễn Nam Sơn',
    nickname: 'Chú Sáu Sơn',
    gender: Gender.MALE,
    generation: 3,
    branchId: 'CHI_THU_01',
    dob: '1952',
    isDeceased: false,
    birthPlace: 'Đà Nẵng',
    hometown: 'Đồng Trường 2, thị trấn Trà My, Quảng Nam',
    profession: 'Nguyên Chủ tịch phường Hải Châu',
    education: 'Cử nhân Luật',
    address: 'Liên Chiểu, Đà Nẵng',
    phone: '0905999888',
    email: 'son.nguyennam@danang.gov.vn',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200',
    biography: 'Đứng đầu chi Thứ lập nghiệp thịnh vượng tại thành phố Đà Nẵng, tích cực quyên góp quỹ khuyến học.',
    achievements: ['Vì sự nghiệp xây dựng đô thị', 'Bằng khen của Chủ tịch UBND Thành phố'],
    locationName: 'Đà Nẵng',
    lat: 16.0544,
    lng: 108.2022,
    fatherId: 'NV-003',
    motherId: 'NV-003W',
    spouseId: 'NV-006W'
  },
  {
    id: 'NV-006W',
    fullName: 'Trịnh Thị Lâm',
    gender: Gender.FEMALE,
    generation: 3,
    branchId: 'CHI_THU_01',
    dob: '1955',
    isDeceased: false,
    address: 'Liên Chiểu, Đà Nẵng',
    spouseId: 'NV-006'
  },

  // ĐỜI 4
  {
    id: 'NV-007',
    fullName: 'Nguyễn Văn Minh',
    gender: Gender.MALE,
    generation: 4,
    branchId: 'CHI_TRUONG',
    dob: '1972',
    isDeceased: false,
    birthPlace: 'Quảng Nam',
    hometown: 'Quảng Nam',
    profession: 'Trưởng phòng báo chí',
    education: 'Thạc sĩ Báo chí học',
    address: 'Quận 3, TP. Hồ Chí Minh',
    phone: '0913444555',
    email: 'minh.nguyenwriter@gmail.com',
    avatarUrl: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&q=80&w=200',
    biography: 'Chuyển cư vào phát triển sự nghiệp tại TP. Hồ Chí Minh và thường xuyên hướng về quê nhà trong các dịp Giỗ tổ.',
    achievements: ['Cây bút vàng báo chí cách mạng 2018'],
    locationName: 'TP. Hồ Chí Minh',
    lat: 10.7769,
    lng: 106.7009,
    fatherId: 'NV-004',
    motherId: 'NV-004W',
    spouseId: 'NV-007W'
  },
  {
    id: 'NV-007W',
    fullName: 'Lê Thị Nguyệt',
    gender: Gender.FEMALE,
    generation: 4,
    branchId: 'CHI_TRUONG',
    dob: '1975',
    isDeceased: false,
    address: 'Quận 3, TP. Hồ Chí Minh',
    spouseId: 'NV-007'
  },
  {
    id: 'NV-008',
    fullName: 'Nguyễn Thị Lan',
    gender: Gender.FEMALE,
    generation: 4,
    branchId: 'CHI_TRUONG',
    dob: '1975',
    isDeceased: false,
    birthPlace: 'Hải Châu, Đà Nẵng',
    hometown: 'Đồng Trường 2, thị trấn Trà My, Quảng Nam',
    profession: 'Giáo viên THPT cấp Quốc gia',
    education: 'Thạc sĩ Sư phạm Vật lý',
    address: 'Hải Châu, Đà Nẵng',
    phone: '0983111222',
    email: 'lan.physics@outlook.com',
    avatarUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=200',
    biography: 'Giáo viên kỳ cựu bồi dưỡng nhiều học sinh thi IOE và kỳ thi cấp tỉnh.',
    achievements: ['Giáo viên giỏi cấp quốc gia 2021'],
    locationName: 'Đà Nẵng',
    lat: 16.0544,
    lng: 108.2022,
    fatherId: 'NV-004',
    motherId: 'NV-004W'
  },
  {
    id: 'NV-009',
    fullName: 'Nguyễn Văn Anh',
    gender: Gender.MALE,
    generation: 4,
    branchId: 'CHI_TRUONG',
    dob: '1978',
    isDeceased: false,
    birthPlace: 'Quảng Nam',
    hometown: 'Đồng Trường 2, thị trấn Trà My, Quảng Nam',
    profession: 'Kỹ sư IT tại Thung lũng Silicon',
    education: 'Thạc sĩ CS, Đại học Stanford',
    address: 'San Jose, California, Mỹ',
    phone: '+1-408-111-222',
    email: 'anh.nguyen.it@stanford.edu',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200',
    biography: 'Kỹ sư cao cấp đóng góp phần nhiều chi tài trợ hàng năm cho Quỹ bảo trợ, tu bổ di tích nhà thờ tổ dòng họ.',
    achievements: ['Bằng khen Kiều bào đóng góp tiêu biểu quê nhà'],
    locationName: 'Mỹ',
    lat: 37.3382,
    lng: -121.8863,
    fatherId: 'NV-005',
    motherId: 'NV-005W',
    spouseId: 'NV-009W'
  },
  {
    id: 'NV-009W',
    fullName: 'Trần Thị Mai',
    gender: Gender.FEMALE,
    generation: 4,
    branchId: 'CHI_TRUONG',
    dob: '1981',
    isDeceased: false,
    address: 'San Jose, California, Mỹ',
    spouseId: 'NV-009'
  },

  // ĐỜI 5
  {
    id: 'NV-010',
    fullName: 'Nguyễn Minh Quân',
    gender: Gender.MALE,
    generation: 5,
    branchId: 'CHI_TRUONG',
    dob: '1998',
    isDeceased: false,
    birthPlace: 'TP. Hồ Chí Minh',
    hometown: 'Quảng Nam',
    profession: 'Kỹ sư AI Đột phá',
    education: 'Kỹ sư CNTT, ĐTQG',
    address: 'Quận 1, TP. Hồ Chí Minh',
    phone: '0935555444',
    email: 'quan.nguyenai@gmail.com',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200',
    biography: 'Xây dựng cốt lõi giải thuật số hóa phả hệ cho dòng tộc, yêu thích nghiên cứu văn hóa truyền thống.',
    achievements: ['Giải Nhất Nhân tài Đất Việt ngành phần mềm', 'Gương mặt trẻ Công nghệ tiêu biểu'],
    locationName: 'TP. Hồ Chí Minh',
    lat: 10.7769,
    lng: 106.7009,
    fatherId: 'NV-007',
    motherId: 'NV-007W'
  },
  {
    id: 'NV-011',
    fullName: 'Nguyễn Minh Khánh',
    gender: Gender.MALE,
    generation: 5,
    branchId: 'CHI_TRUONG',
    dob: '2002',
    isDeceased: false,
    birthPlace: 'TP. Hồ Chí Minh',
    hometown: 'Quảng Nam',
    profession: 'Nghiên cứu sinh thạc sĩ Robotics',
    education: 'Cử nhân CNTT xuất sắc',
    address: 'Tokyo, Nhật Bản',
    phone: '+81-80-1234-5678',
    email: 'khanh.robotics@u-tokyo.ac.jp',
    avatarUrl: 'https://images.unsplash.com/photo-1502685759131-71035660d19f?auto=format&fit=crop&q=80&w=200',
    biography: 'Học bổng toàn phần của chính phủ Nhật Bản, nghiên cứu phát triển mô hình robot thông minh hỗ trợ y tế.',
    achievements: ['Thủ khoa tốt nghiệp ĐH Khoa học Tự nhiên', 'Học bổng MEXT danh giá'],
    locationName: 'Nhật Bản',
    lat: 35.6762,
    lng: 139.6503,
    fatherId: 'NV-007',
    motherId: 'NV-007W'
  },
  {
    id: 'NV-012',
    fullName: 'Nguyễn Văn Khải',
    gender: Gender.MALE,
    generation: 5,
    branchId: 'CHI_TRUONG',
    dob: '2005',
    isDeceased: false,
    birthPlace: 'Silicon Valley, Mỹ',
    hometown: 'Quảng Nam',
    profession: 'Học sinh, Lập trình viên trẻ',
    education: 'Học sinh trung học xuất sắc',
    address: 'San Jose, California, Mỹ',
    email: 'khai.nguyen@gmail.com',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
    biography: 'Tham dự cuộc thi Olympic tin học bang California quốc gia Mỹ đạt kết quả ấn tượng.',
    achievements: ['Giải Nhì Tin học trẻ cấp bang California', 'Đoạt vé vàng khoa học Silicon Valley'],
    locationName: 'Mỹ',
    lat: 37.3382,
    lng: -121.8863,
    fatherId: 'NV-009',
    motherId: 'NV-009W'
  }
];

export const initialEvents: ClanEvent[] = [
  {
    id: 'EV_001',
    title: 'Đại Lễ Giỗ tổ Tộc họ Nguyễn',
    description: 'Đại lễ giỗ tổ toàn tộc năm 2026. Tất cả các đời con cháu hội ngộ tưởng nhớ Cụ Tổ lập phái, sửa soạn dâng hương báo cáo thành tích.',
    category: 'giỗ tổ',
    dateSolar: '2026-04-30',
    dateLunar: 'Ngày 14 tháng 3 Âm Lịch',
    location: 'Từ Đường Tộc họ Nguyễn, Đồng Trường, Xã Trà My, TP. Đà Nẵng',
    host: 'Trưởng tộc họ Nguyễn Hùng',
    image: 'https://images.unsplash.com/photo-1598971861713-54ad16a7e72e?auto=format&fit=crop&q=80&w=800',
    attendees: ['atnguyen.skayer@gmail.com', 'quan.nguyenai@gmail.com', 'anh.nguyen.it@stanford.edu']
  },
  {
    id: 'EV_002',
    title: 'Họp Họ Tổng Kết Quy Tộc & Vinh Danh Khuyến Học',
    description: 'Họp quyết toán niên độ, lập báo cáo tu bổ lăng tự dòng tộc và trao học bổng khuyến tài cho học sinh giỏi đạt giải cấp tỉnh trở lên.',
    category: 'khuyến học',
    dateSolar: '2026-07-25',
    dateLunar: 'Mùng 5 tháng 5 Âm Lịch',
    location: 'Sân trung tâm Từ Đường họ, Đồng Trường, Xã Trà My, TP. Đà Nẵng',
    host: 'Trưởng chi Nguyễn Nam Sơn',
    attendees: ['atnguyen.skayer@gmail.com']
  }
];

export const initialFundTransactions: FundTransaction[] = [
  {
    id: 'TX_001',
    type: 'thu',
    title: 'Đóng góp tu tạo Từ đường',
    amount: 50000000,
    date: '2026-02-15',
    category: 'tài trợ',
    contributor: 'Nguyễn Văn Anh (Mỹ)'
  },
  {
    id: 'TX_002',
    type: 'thu',
    title: 'Quỹ khuyến học Chi Thứ Một quyên góp',
    amount: 15000000,
    date: '2025-11-20',
    category: 'đóng góp',
    contributor: 'Nguyễn Nam Sơn'
  },
  {
    id: 'TX_003',
    type: 'chi',
    title: 'Ủng hộ học bổng khuyến tài năm học vừa qua',
    amount: 12000000,
    date: '2025-11-25',
    category: 'khuyến học',
    contributor: 'Đội Khuyến học Tộc viên'
  },
  {
    id: 'TX_004',
    type: 'chi',
    title: 'Chi phí mua sắm lễ thặng Giỗ tổ quý xuân',
    amount: 8000000,
    date: '2026-04-28',
    category: 'giỗ tổ',
    contributor: 'Ban khánh tiết Tổ đường'
  }
];

export const initialScholarships: ScholarshipRecord[] = [
  {
    id: 'SCH_001',
    studentName: 'Nguyễn Minh Quân',
    achievementTitle: 'Giải Nhất Nhân tài Đất Việt phát triển giải thuật',
    awardName: 'Học bổng Tộc họ Nguyễn - Đột Phá Công Nghệ',
    year: 2025,
    amount: 5000000
  },
  {
    id: 'SCH_002',
    studentName: 'Nguyễn Minh Khánh',
    achievementTitle: 'Thủ khoa tốt nghiệp ĐH Khoa học Tự nhiên Hà Nội',
    awardName: 'Gương sáng đỗ đầu dòng học Tôn vinh',
    year: 2024,
    amount: 5000000
  },
  {
    id: 'SCH_003',
    studentName: 'Nguyễn Văn Khải',
    achievementTitle: 'Giải Nhì Olympic Tin học trẻ Silicon Valley',
    awardName: 'Học bổng Kiều bào trẻ tài đức',
    year: 2025,
    amount: 3000000
  }
];

export const initialDocuments: ClanDocument[] = [
  {
    id: 'DOC_001',
    name: 'Gia_Pha_Nguyen_Van_Toan_Phai.pdf',
    category: 'gia phả',
    fileType: 'pdf',
    size: '14.2 MB',
    url: '#',
    downloadCount: 342,
    updatedAt: '2026-01-05'
  },
  {
    id: 'DOC_002',
    name: 'Toc_Uoc_Kien_To_Chi_Ngon.pdf',
    category: 'tộc ước',
    fileType: 'pdf',
    size: '2.5 MB',
    url: '#',
    downloadCount: 188,
    updatedAt: '2012-05-18'
  },
  {
    id: 'DOC_003',
    name: 'Bien_Ban_Dong_Gop_Tu_Bao_Y_Y7.doc',
    category: 'nhà thờ',
    fileType: 'doc',
    size: '412 KB',
    url: '#',
    downloadCount: 45,
    updatedAt: '2026-04-30'
  }
];

export const initialAlbums: PhotoAlbum[] = [
  {
    id: 'ALB_001',
    title: 'Kỷ niệm dâng hương Từ đường xuân 2026',
    description: 'Khoảng thời gian linh thiêng bái phật dâng hương Tổ Tiên đầy khí thế ấm áp.',
    photos: [
      'https://images.unsplash.com/photo-1583037189850-1921ae7c6c22?auto=format&fit=crop&q=80&w=400',
      'https://images.unsplash.com/photo-1601058268499-e52658b8bb88?auto=format&fit=crop&q=80&w=400'
    ],
    comments: [
      {
        userName: 'Nguyễn Minh Quân',
        text: 'Năm sau cháu nhất quyết sẽ bay từ Sài Gòn về để dâng hoa cùng các bác.',
        time: '2026-05-01 09:30'
      }
    ]
  }
];
