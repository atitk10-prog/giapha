export enum Gender {
  MALE = 'Nam',
  FEMALE = 'Nữ'
}

export enum UserRole {
  GUEST = 'Khách',
  MEMBER = 'Thành viên',
  BRANCH_LEADER = 'Trưởng chi',
  ADMIN = 'Quản trị viên'
}

export interface ClanMember {
  id: string; // NV-001 etc
  fullName: string;
  nickname?: string;
  gender: Gender;
  generation: number; // Đời thứ mấy
  branchId: string; // ID of the branch (chi họ)
  phone?: string;
  email?: string;
  dob?: string; // Ngày sinh
  isDeceased: boolean;
  dod?: string; // Ngày mất (nếu đã qua đời)
  burialPlace?: string; // Nơi an táng / Mộ phần
  birthPlace?: string;
  hometown?: string;
  profession?: string; // Nghề nghiệp
  education?: string; // Học vấn
  address?: string; // Địa chỉ hiện tại
  avatarUrl?: string; // Ảnh dại diện
  biography?: string; // Tiểu sử (markdown)
  achievements?: string[]; // Thành tích
  album?: string[]; // Album ảnh
  
  // Relations
  fatherId?: string | null;
  motherId?: string | null;
  spouseId?: string | null;
  
  // Location
  locationName?: string; // e.g. "Quảng Nam", "Đà Nẵng", "TP. Hồ Chí Minh", "Mỹ", "Nhật"
  lat?: number;
  lng?: number;
}

export interface ClanBranch {
  id: string;
  name: string;
  leaderId: string; // Leader member ID
  leaderName: string;
  description?: string;
}

export interface ClanEvent {
  id: string;
  title: string;
  description: string;
  category: 'giỗ tổ' | 'họp họ' | 'khuyến học' | 'tang lễ' | 'cưới hỏi' | 'khác';
  dateSolar: string; // Dương lịch
  dateLunar?: string; // Âm lịch (e.g. "15 tháng 3 Âm Lịch")
  location: string;
  host: string;
  image?: string;
  attendees: string[]; // List of user emails or names who registered
}

export interface FundTransaction {
  id: string;
  type: 'thu' | 'chi';
  title: string;
  amount: number;
  date: string;
  category: 'đóng góp' | 'tài trợ' | 'khuyến học' | 'sửa sang' | 'giỗ tổ' | 'khác';
  contributor?: string; // Người đóng góp/Nhận chi
}

export interface ScholarshipRecord {
  id: string;
  studentName: string;
  achievementTitle: string; // e.g. "Học sinh giỏi cấp Tỉnh", "Thủ khoa Đại học"
  awardName: string; // e.g. "Học bổng Nguyễn Văn Khuyến Học"
  year: number;
  amount?: number;
}

export interface ClanDocument {
  id: string;
  name: string;
  category: 'gia phả' | 'tộc ước' | 'khuyến học' | 'nhà thờ' | 'khác';
  fileType: 'pdf' | 'doc' | 'pdf-tree' | 'image';
  size: string;
  url: string; // Mock or real Google Drive / local assets URL
  downloadCount: number;
  updatedAt: string;
}

export interface PhotoAlbum {
  id: string;
  title: string;
  description?: string;
  photos: string[]; // List of image URLs
  comments: {
    userName: string;
    text: string;
    time: string;
  }[];
}

export interface EditSuggestion {
  id: string;
  memberId: string;
  memberName: string;
  fieldName: string; // e.g. "dod", "dob", "fatherId"
  oldValue: string;
  newValue: string;
  proposedBy: string; // Username/Email
  proposedAt: string;
  status: 'chờ duyệt' | 'đã duyệt' | 'từ chối';
}

export interface ActivityLog {
  id: string;
  user: string;
  action: string;
  target: string;
  time: string;
}

export interface ClanSettings {
  adminPassword?: string;
  recoveryEmail?: string;
}
