import React, { useState } from 'react';
import { ClanMember, Gender, UserRole } from '../types';

interface MemberProfileModalProps {
  member: ClanMember;
  allMembers: ClanMember[];
  onClose: () => void;
  onNavigateToMember: (memberId: string) => void;
  currentUserRole: UserRole;
  currentUserEmail: string;
  onProposeEdit: (memberId: string, field: string, oldValue: string, newValue: string) => void;
  onUpdateMemberDirectly?: (updated: ClanMember) => void;
  onDeleteMember?: (memberId: string) => void;
}

export default function MemberProfileModal({
  member,
  allMembers,
  onClose,
  onNavigateToMember,
  currentUserRole,
  currentUserEmail,
  onProposeEdit,
  onUpdateMemberDirectly,
  onDeleteMember
}: MemberProfileModalProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'relations' | 'propose' | 'album'>('info');

  // AI loading states
  const [isBioLoading, setIsBioLoading] = useState(false);
  const [isAiParentLoading, setIsAiParentLoading] = useState(false);
  const [aiParentReport, setAiParentReport] = useState<string | null>(null);

  // Proposal Edit fields
  const [proposalField, setProposalField] = useState('phone');
  const [proposalNewValue, setProposalNewValue] = useState('');

  // direct edit fields (for Admin or Branch Leader)
  const [directEditMode, setDirectEditMode] = useState(false);
  const [editedFields, setEditedFields] = useState<Partial<ClanMember>>({});

  const potentialFathers = allMembers.filter(m => m.gender === Gender.MALE && (m.generation === member.generation - 1 || m.id === editedFields.fatherId));
  const potentialMothers = allMembers.filter(m => m.gender === Gender.FEMALE && (m.generation === member.generation - 1 || m.id === editedFields.motherId));

  // Resolve immediate relatives
  const father = member.fatherId ? allMembers.find(m => m.id === member.fatherId) : null;
  const mother = member.motherId ? allMembers.find(m => m.id === member.motherId) : null;
  const spouse = member.spouseId ? allMembers.find(m => m.id === member.spouseId) : null;
  
  // Children
  const children = allMembers.filter(m => m.fatherId === member.id || m.motherId === member.id);
  
  // Siblings (share same father or mother, excluding self)
  const siblings = allMembers.filter(m => 
    m.id !== member.id && 
    ((member.fatherId && m.fatherId === member.fatherId) || 
     (member.motherId && m.motherId === member.motherId))
  );

  // Grandparents
  const paternalGrandfather = father?.fatherId ? allMembers.find(m => m.id === father.fatherId) : null;

  // New photo input mock
  const [newPhotoUrl, setNewPhotoUrl] = useState('');

  // Call server to generate biography using Gemini 3.5 Flash
  const handleGenerateBiographyAI = async () => {
    setIsBioLoading(true);
    try {
      const res = await fetch('/api/ai/generate-biography', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ member })
      });
      const data = await res.json();
      if (data.biography) {
        if (onUpdateMemberDirectly) {
          onUpdateMemberDirectly({ ...member, biography: data.biography });
        } else {
          // If suggestion, auto propose it
          onProposeEdit(member.id, 'biography', member.biography || '', data.biography);
          alert('Tiểu sử đề xuất gợi ý từ AI đã được soạn thảo và lưu vào hồ sơ/yêu cầu chờ duyệt!');
        }
      }
    } catch (e) {
      console.error(e);
      alert('Không kết nối được server AI lúc này. Sử dụng tiểu sử mô phỏng.');
    } finally {
      setIsBioLoading(false);
    }
  };

  // Call server to suggest parental candidate using Gemini
  const handleSuggestParentAI = async () => {
    setIsAiParentLoading(true);
    try {
      const res = await fetch('/api/ai/suggest-relationship', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId: member.id })
      });
      const data = await res.json();
      setAiParentReport(data.analysis || 'Không tìm thấy trưởng bối thích hợp.');
    } catch (e) {
      setAiParentReport('Đã xảy ra lỗi khi kết nối trí tuệ nhân tạo.');
    } finally {
      setIsAiParentLoading(false);
    }
  };

  // Submit suggestion
  const handleSubmitProposal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!proposalNewValue.trim()) return;
    
    const fieldsMap: Record<string, string> = {
      phone: 'Số điện thoại',
      address: 'Địa chỉ',
      dob: 'Ngày sinh',
      dod: 'Ngày mất',
      hometown: 'Quê quán',
      profession: 'Nghề nghiệp',
      education: 'Học bấn/Hạng khoa'
    };

    const oldValue = (member as any)[proposalField] || 'Chưa cập nhật';
    onProposeEdit(member.id, proposalField, oldValue, proposalNewValue);
    alert(`Đã gửi đề xuất cập nhật ${fieldsMap[proposalField]} cho cụ/thành viên ${member.fullName}. Quản trị viên sẽ sớm kiểm tra phê chuẩn.`);
    setProposalNewValue('');
    setActiveTab('info');
  };

  // Direct edit save
  const handleDirectSave = () => {
    if (onUpdateMemberDirectly) {
      onUpdateMemberDirectly({
        ...member,
        ...editedFields
      });
      setDirectEditMode(false);
      alert('Đã cập nhật trực tiếp dữ liệu thành viên thành công!');
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-4xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Header Summary */}
        <div className="p-6 bg-gradient-to-r from-amber-800 to-amber-900 text-white flex items-start justify-between">
          <div className="flex gap-4 items-center">
            {member.avatarUrl ? (
              <img 
                src={member.avatarUrl} 
                alt={member.fullName} 
                className="w-16 h-16 rounded-full object-cover border-2 border-amber-300"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-amber-700 flex items-center justify-center text-amber-200 text-2xl font-bold border-2 border-amber-300">
                {member.fullName.charAt(0)}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold font-sans">{member.fullName}</h2>
                <span className="px-2 py-0.5 text-[10px] uppercase font-mono bg-amber-700 rounded text-amber-100">
                  Mã: {member.id}
                </span>
              </div>
              <p className="text-xs text-amber-200 mt-1">
                Thế hệ Đời thứ {member.generation} • {member.gender === Gender.MALE ? 'Nam giới' : 'Nữ giới'} • {member.isDeceased ? `Đã mất (Thọ ${Number(member.dod) - Number(member.dob || 0)} tuổi)` : 'Còn sống'}
              </p>
              <p className="text-xs text-amber-100 italic mt-0.5">
                {member.nickname ? `Tên tự: ${member.nickname}` : ''}
              </p>
            </div>
          </div>
          <button type="button" 
            onClick={onClose} 
            className="p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-amber-100 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab switch navigation */}
        <div className="flex border-b border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-950 px-4">
          <button type="button"
            onClick={() => setActiveTab('info')}
            className={`px-4 py-3 text-xs font-semibold border-b-2 transition-all ${activeTab === 'info' ? 'border-amber-700 text-amber-800 dark:text-amber-400' : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-zinc-100'}`}
          >
            Hồ sơ chi tiết
          </button>
          <button type="button"
            onClick={() => setActiveTab('relations')}
            className={`px-4 py-3 text-xs font-semibold border-b-2 transition-all ${activeTab === 'relations' ? 'border-amber-700 text-amber-800 dark:text-amber-400' : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-zinc-100'}`}
          >
            Sơ đồ quan hệ dòng phái
          </button>
          <button type="button"
            onClick={() => setActiveTab('propose')}
            className={`px-4 py-3 text-xs font-semibold border-b-2 transition-all ${activeTab === 'propose' ? 'border-amber-700 text-amber-800 dark:text-amber-400' : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-zinc-100'}`}
          >
            Đề xuất chỉnh sửa / Đóng góp
          </button>
          <button type="button"
            onClick={() => setActiveTab('album')}
            className={`px-4 py-3 text-xs font-semibold border-b-2 transition-all ${activeTab === 'album' ? 'border-amber-700 text-amber-800 dark:text-amber-400' : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-zinc-100'}`}
          >
            Album kỷ niệm ({member.album?.length || 0})
          </button>
        </div>

        {/* Content Panel Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-300">
          
          {/* TAB 1: INFO PANEL */}
          {activeTab === 'info' && (
            <div className="space-y-6">
              {/* Kinship Static Table Box */}
              <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-full text-amber-700 dark:text-amber-400">
                    <Users className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-amber-900 dark:text-amber-100 mb-2">Bảng tra cứu xưng hô với thành viên này</h3>
                    <p className="text-[11px] text-amber-700 dark:text-amber-400/80 mb-3 italic">Dành cho người trong họ tham khảo cách gọi (tùy thuộc vào chi/nhánh lớn nhỏ có thể thay đổi Bác/Chú/Cô):</p>
                    
                    <div className="bg-white/60 dark:bg-zinc-900/50 rounded border border-amber-100 dark:border-amber-900/20 overflow-hidden text-[11px]">
                      <table className="w-full text-left">
                        <tbody>
                          <tr className="border-b border-amber-100 dark:border-zinc-800">
                            <td className="p-2 bg-amber-50/50 dark:bg-zinc-900/80 text-gray-500 w-1/3">Người Đời thứ {member.generation + 2}:</td>
                            <td className="p-2 font-semibold text-amber-800 dark:text-amber-300">Gọi là <b>Ông / Bà</b> (Ông trẻ, Bà họ)</td>
                          </tr>
                          <tr className="border-b border-amber-100 dark:border-zinc-800">
                            <td className="p-2 bg-amber-50/50 dark:bg-zinc-900/80 text-gray-500">Người Đời thứ {member.generation + 1}:</td>
                            <td className="p-2 font-semibold text-amber-800 dark:text-amber-300">Gọi là <b>Bác / Chú / Cô</b></td>
                          </tr>
                          <tr className="border-b border-amber-100 dark:border-zinc-800">
                            <td className="p-2 bg-amber-50/50 dark:bg-zinc-900/80 text-gray-500">Người Đời thứ {member.generation}:</td>
                            <td className="p-2 font-semibold text-amber-800 dark:text-amber-300">Gọi là <b>Anh / Chị / Em họ</b></td>
                          </tr>
                          <tr>
                            <td className="p-2 bg-amber-50/50 dark:bg-zinc-900/80 text-gray-500">Người Đời thứ {Math.max(1, member.generation - 1)}:</td>
                            <td className="p-2 font-semibold text-amber-800 dark:text-amber-300">Giao tiếp xưng <b>Cháu</b> (Cháu họ)</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

              {/* Direct edit notice */}
              {(currentUserRole === UserRole.ADMIN || currentUserRole === UserRole.BRANCH_LEADER) && (
                <div className="flex justify-end">
                  {!directEditMode ? (
                    <button type="button" 
                      onClick={() => { setDirectEditMode(true); setEditedFields(member); }}
                      className="px-3 py-1.5 text-xs rounded-lg border border-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/20 text-amber-700 dark:text-amber-400 font-bold transition-all"
                    >
                      Sửa nhanh với tư cách Quản trị / Trưởng chi
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      {onDeleteMember && (
                        <button type="button" 
                          onClick={() => {
                            if (window.confirm(`Bạn có chắc chắn muốn XÓA VĨNH VIỄN cụ/thành viên ${member.fullName} khỏi gia phả? Hành động này không thể hoàn tác.`)) {
                              onDeleteMember(member.id);
                            }
                          }}
                          className="px-3 py-1.5 text-xs rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold transition-all"
                        >
                          Xóa thành viên
                        </button>
                      )}
                      <button type="button" 
                        onClick={handleDirectSave}
                        className="px-3 py-1.5 text-xs rounded-lg bg-green-600 hover:bg-green-700 text-white font-bold transition-all flex items-center gap-1"
                      >
                        <Check className="h-3 w-3" /> Lưu thay đổi trực tiếp
                      </button>
                      <button type="button" 
                        onClick={() => setDirectEditMode(false)}
                        className="px-3 py-1.5 text-xs rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold transition-all"
                      >
                        Hủy bỏ
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left block: Metadata list */}
                <div className="space-y-4 bg-amber-50/10 dark:bg-zinc-950 p-4 border border-gray-150 dark:border-zinc-850 rounded-2xl">
                  <h3 className="text-sm font-bold text-amber-800 dark:text-amber-400 font-sans border-b pb-1">
                    Thông tin Gia thế nhân thân
                  </h3>
                  
                  {directEditMode ? (
                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 mb-1">Ảnh đại diện (Tải lên từ máy)</label>
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;

                            const reader = new FileReader();
                            reader.onload = (event) => {
                              const img = new Image();
                              img.onload = () => {
                                const canvas = document.createElement('canvas');
                                const MAX_SIZE = 300; // Shrink to 300px to avoid 50k char limit in Google Sheets
                                let width = img.width;
                                let height = img.height;

                                if (width > height) {
                                  if (width > MAX_SIZE) {
                                    height *= MAX_SIZE / width;
                                    width = MAX_SIZE;
                                  }
                                } else {
                                  if (height > MAX_SIZE) {
                                    width *= MAX_SIZE / height;
                                    height = MAX_SIZE;
                                  }
                                }

                                canvas.width = width;
                                canvas.height = height;
                                const ctx = canvas.getContext('2d');
                                if (ctx) {
                                  ctx.drawImage(img, 0, 0, width, height);
                                  const dataUrl = canvas.toDataURL('image/jpeg', 0.5); // Lower quality to 0.5
                                  setEditedFields(prev => ({ ...prev, avatarUrl: dataUrl }));
                                  
                                  // Auto-save avatar so users don't wonder why it didn't save
                                  if (onUpdateMemberDirectly) {
                                    onUpdateMemberDirectly({ ...member, ...editedFields, avatarUrl: dataUrl });
                                    alert('Đã cập nhật ảnh đại diện thành công!');
                                  }
                                }
                              };
                              img.src = event.target?.result as string;
                            };
                            reader.readAsDataURL(file);
                          }}
                          className="w-full text-[10px] text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 mb-1">Họ và Tên</label>
                        <input 
                          type="text" 
                          value={editedFields.fullName || ''} 
                          onChange={e => setEditedFields(prev => ({ ...prev, fullName: e.target.value }))}
                          className="w-full p-1.5 border border-gray-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-500 mb-1">Tên Tự/Thường gọi</label>
                          <input 
                            type="text" 
                            value={editedFields.nickname || ''} 
                            onChange={e => setEditedFields(prev => ({ ...prev, nickname: e.target.value }))}
                            className="w-full p-1.5 border border-gray-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded text-xs focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-500 mb-1">Giới tính</label>
                          <select 
                            value={editedFields.gender || Gender.MALE} 
                            onChange={e => setEditedFields(prev => ({ ...prev, gender: e.target.value as Gender }))}
                            className="w-full p-1.5 border border-gray-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded text-xs focus:outline-none"
                          >
                            <option value={Gender.MALE}>Nam giới</option>
                            <option value={Gender.FEMALE}>Nữ giới</option>
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-500 mb-1">Năm sinh</label>
                          <input 
                            type="text" 
                            value={editedFields.dob || ''} 
                            onChange={e => setEditedFields(prev => ({ ...prev, dob: e.target.value }))}
                            className="w-full p-1.5 border border-gray-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded text-xs focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-500 mb-1">Thứ tự sinh (1: Cả, 2: Thứ 2...)</label>
                          <input 
                            type="number" 
                            value={editedFields.birthOrder || ''} 
                            onChange={e => setEditedFields(prev => ({ ...prev, birthOrder: e.target.value ? parseInt(e.target.value) : undefined }))}
                            className="w-full p-1.5 border border-gray-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded text-xs focus:outline-none"
                            placeholder="Để trống nếu chưa rõ"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-500 mb-1">Năm mất (nếu có)</label>
                          <input 
                            type="text" 
                            value={editedFields.dod || ''} 
                            onChange={e => setEditedFields(prev => ({ ...prev, dod: e.target.value, isDeceased: !!e.target.value }))}
                            className="w-full p-1.5 border border-gray-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded text-xs focus:outline-none"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-500 mb-1">Thân phụ / Cha</label>
                          <select 
                            value={editedFields.fatherId || ''} 
                            onChange={e => setEditedFields(prev => ({ ...prev, fatherId: e.target.value || null }))}
                            className="w-full p-1.5 border border-gray-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded text-xs focus:outline-none"
                          >
                            <option value="">-- Chưa rõ --</option>
                            {potentialFathers.map(f => (
                              <option key={f.id} value={f.id}>{f.fullName} (Đời {f.generation})</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-500 mb-1">Mẫu thân / Mẹ</label>
                          <select 
                            value={editedFields.motherId || ''} 
                            onChange={e => setEditedFields(prev => ({ ...prev, motherId: e.target.value || null }))}
                            className="w-full p-1.5 border border-gray-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded text-xs focus:outline-none"
                          >
                            <option value="">-- Chưa rõ --</option>
                            {potentialMothers.map(m => (
                              <option key={m.id} value={m.id}>{m.fullName} (Đời {m.generation})</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 mb-1">Số điện thoại</label>
                        <input 
                          type="text" 
                          value={editedFields.phone || ''} 
                          onChange={e => setEditedFields(prev => ({ ...prev, phone: e.target.value }))}
                          className="w-full p-1.5 border border-gray-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded text-xs focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 mb-1">Email liên lạc</label>
                        <input 
                          type="text" 
                          value={editedFields.email || ''} 
                          onChange={e => setEditedFields(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full p-1.5 border border-gray-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded text-xs focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 mb-1">Nghề nghiệp</label>
                        <input 
                          type="text" 
                          value={editedFields.profession || ''} 
                          onChange={e => setEditedFields(prev => ({ ...prev, profession: e.target.value }))}
                          className="w-full p-1.5 border border-gray-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 mb-1">Quê quán</label>
                        <input 
                          type="text" 
                          value={editedFields.hometown || ''} 
                          onChange={e => setEditedFields(prev => ({ ...prev, hometown: e.target.value }))}
                          className="w-full p-1.5 border border-gray-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 mb-1">Học vị / Khóa bảng</label>
                        <input 
                          type="text" 
                          value={editedFields.education || ''} 
                          onChange={e => setEditedFields(prev => ({ ...prev, education: e.target.value }))}
                          className="w-full p-1.5 border border-gray-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 mb-1">Phân cư cư trú</label>
                        <input 
                          type="text" 
                          value={editedFields.address || ''} 
                          onChange={e => setEditedFields(prev => ({ ...prev, address: e.target.value }))}
                          className="w-full p-1.5 border border-gray-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded text-xs"
                        />
                      </div>
                      {editedFields.isDeceased && (
                        <div className="sm:col-span-2">
                          <label className="block text-[10px] font-bold text-gray-500 mb-1">Mộ Phần / Địa điểm an táng</label>
                          <input 
                            type="text" 
                            value={editedFields.burialPlace || ''} 
                            onChange={e => setEditedFields(prev => ({ ...prev, burialPlace: e.target.value }))}
                            className="w-full p-1.5 border border-gray-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded text-xs"
                          />
                        </div>
                      )}
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-bold text-gray-500 mb-1">Ghi nhận / Đóng góp / Công danh (Ngăn cách bằng dấu phẩy)</label>
                        <input 
                          type="text" 
                          value={editedFields.achievements?.join(', ') || ''} 
                          onChange={e => setEditedFields(prev => ({ ...prev, achievements: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))}
                          className="w-full p-1.5 border border-gray-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded text-xs"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-gray-500 block">Hương hỏa quê quán:</span>
                        <strong className="text-gray-900 dark:text-zinc-100">{member.hometown || 'Đồng Trường 2, thị trấn Trà My, Quảng Nam'}</strong>
                      </div>
                      <div>
                        <span className="text-gray-500 block font-sans">Nghề nghiệp:</span>
                        <strong className="text-gray-900 dark:text-zinc-100">{member.profession || 'Chưa cập nhật'}</strong>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Học vị khóa bảng:</span>
                        <strong className="text-gray-900 dark:text-zinc-100">{member.education || 'Tự học khoa thi'}</strong>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Thứ tự sinh:</span>
                        <strong className="text-gray-900 dark:text-zinc-100">{member.birthOrder ? (member.birthOrder === 1 ? 'Con Cả' : member.birthOrder === 10 ? 'Con Út' : `Con thứ ${member.birthOrder}`) : 'Chưa cập nhật'}</strong>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Phân cư cư trú:</span>
                        <strong className="text-gray-900 dark:text-zinc-100">{member.address || 'Quảng Nam'}</strong>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Số điện thoại:</span>
                        <strong className="text-amber-800 dark:text-amber-400 flex items-center gap-1">
                          <Phone className="h-3 w-3" /> {member.phone || 'Ẩn bảo mật'}
                        </strong>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Thư điện tử email:</span>
                        <strong className="text-amber-800 dark:text-amber-400 flex items-center gap-1">
                          <Mail className="h-3 w-3" /> {member.email || 'Ẩn bảo mật'}
                        </strong>
                      </div>
                      {member.isDeceased && (
                        <div className="sm:col-span-2 bg-slate-100 dark:bg-zinc-800/50 p-2.5 rounded-lg border">
                          <span className="text-slate-500 block font-bold text-[10px] uppercase tracking-wider">Mộ Phần / Địa điểm an táng:</span>
                          <span className="text-slate-800 dark:text-zinc-300 mt-1 block">🕯️ {member.burialPlace || 'An táng tại nghĩa trang dòng tộc Đồng Trường 2, thị trấn Trà My, Quảng Nam.'}</span>
                          <span className="text-[10px] block text-slate-400 mt-1 italic">Mộ phần đã được lập sơ đồ gắn mã QR định vị tâm phục đầu mộ.</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Achievements Badge lists */}
                  <div className="pt-2">
                    <span className="text-gray-500 text-[11px] block mb-1">Ghi nhận / Đóng góp / Công danh:</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {member.achievements && member.achievements.length > 0 ? (
                        member.achievements.map((ach, i) => (
                          <span key={i} className="px-2 py-1 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 rounded text-[10px] font-medium flex items-center gap-1 border border-amber-200/50">
                            <Award className="h-3 w-3 text-amber-600" /> {ach}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-gray-500 italic">Thành viên đức độ gương mẫu, yêu mến con cháu.</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right block: Biography & AI helper */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b pb-1">
                    <h3 className="text-sm font-bold text-amber-800 dark:text-amber-400 font-sans flex items-center gap-1.5">
                      <BookOpen className="h-4 w-4" /> Tiểu sử & Hành trạng kỷ yếu
                    </h3>
                    <button type="button"
                      onClick={handleGenerateBiographyAI}
                      disabled={isBioLoading}
                      className="px-2.5 py-1 text-[10px] font-bold rounded bg-amber-600 hover:bg-amber-700 active:scale-95 text-white flex items-center gap-1 transition-all disabled:bg-amber-800/50"
                      title="Sử dụng trí tuệ nhân tạo Gemini biên soạn gia phả kí túc"
                    >
                      <Sparkles className="h-3 w-3 animate-spin-slow" /> {isBioLoading ? 'Đang viết...' : 'AI Viết Kỷ Tiểu Sử'}
                    </button>
                  </div>

                  {directEditMode ? (
                    <div>
                      <textarea 
                        rows={6}
                        value={editedFields.biography || ''} 
                        onChange={e => setEditedFields(prev => ({ ...prev, biography: e.target.value }))}
                        className="w-full text-xs p-2.5 border border-gray-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded focus:outline-none focus:ring-1 focus:ring-amber-500 dark:text-zinc-100 font-sans"
                        placeholder="Hãy viết tiểu sử tóm tắt cuộc đời của thành viên vào đây..."
                      />
                    </div>
                  ) : (
                    <div className="text-xs leading-relaxed text-gray-600 dark:text-zinc-400 border border-amber-100 dark:border-zinc-850 p-4 bg-amber-50/10 dark:bg-zinc-950 rounded-2xl whitespace-pre-wrap italic font-sans max-h-[220px] overflow-y-auto">
                      {member.biography ? member.biography : 'Nhấn vào nút "AI Viết Kỷ Tiểu Sử" phía trên để hệ thống tự động tổng hợp thông tin, nghề nghiệp, dòng dõi của cụ và thế hệ sau để viết nên một phả chí kính bái trang văn lịch sự nhất.'}
                    </div>
                  )}

                  {/* QR code section simulated */}
                  <div className="bg-gray-50 dark:bg-zinc-950 p-3 rounded-2xl border border-gray-150 dark:border-zinc-850 flex items-center gap-3">
                    <div className="w-14 h-14 bg-white p-1 rounded-lg border flex items-center justify-center">
                      {/* Fake QR code using unicode boxes */}
                      <span className="text-[10px] font-mono leading-none tracking-tighter text-center">
                        █▀▀▀█ ▄ ▄<br />
                        █ ███ █▀▀ <br />
                        █▄▄▄█ ▄▀█<br />
                        ▄  ▄    ▄<br />
                        ▀▀▀▀▀ ▀ ▀<br />
                      </span>
                    </div>
                    <div className="text-[10px]">
                      <span className="font-bold block text-gray-800 dark:text-zinc-200">Gặp Gia Phả Truyền Số Tộc</span>
                      <p className="text-gray-500">Quét mã QR trên bia mộ hoặc sổ tay gia phả để hiển thị hồ sơ số hóa của {member.fullName} lập tức.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: RELATIONS PANEL (Highly Visual Flowchart) */}
          {activeTab === 'relations' && (
            <div className="space-y-6">
              
              <div className="bg-amber-50/10 dark:bg-zinc-950 p-4 border border-gray-150 dark:border-zinc-850 rounded-2xl">
                <span className="text-[11px] font-bold text-amber-800 dark:text-amber-400 block mb-3 uppercase tracking-wider font-sans text-center">
                  Sơ đồ Liên hệ huyết thống trực hệ
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-center text-center">
                  
                  {/* Ông Nội */}
                  <div className="flex flex-col items-center">
                    <span className="text-[9px] text-gray-500 block">Ông Nội / Tôn bối</span>
                    {paternalGrandfather ? (
                      <button type="button" 
                        onClick={() => onNavigateToMember(paternalGrandfather.id)}
                        className="mt-1.5 p-2 h-16 w-32 border border-slate-300 dark:border-zinc-800 rounded bg-slate-50 dark:bg-zinc-900 text-[10.5px] font-semibold text-gray-800 dark:text-zinc-200 shadow hover:bg-slate-100 transition-all truncate"
                      >
                        👴 {paternalGrandfather.fullName}
                        <span className="block text-[8px] italic text-gray-500">Sinh: {paternalGrandfather.dob}</span>
                      </button>
                    ) : (
                      <div className="mt-1.5 p-2 h-16 w-32 border border-dashed rounded bg-gray-50 dark:bg-zinc-950 text-[10px] text-gray-500 flex items-center justify-center">
                        Chưa ghi bạ
                      </div>
                    )}
                  </div>

                  {/* Icon connector */}
                  <div className="hidden sm:block text-gray-300 font-bold">➔</div>

                  {/* Cha mẹ và liên thông */}
                  <div className="sm:col-span-1 flex flex-col items-center gap-2">
                    {/* Cha */}
                    <div>
                      <span className="text-[9px] text-gray-500 block">Thân phụ / Cha</span>
                      {father ? (
                        <button type="button" 
                          onClick={() => onNavigateToMember(father.id)}
                          className="mt-1 p-2 h-14 w-32 border border-sky-300 dark:border-sky-950 rounded bg-sky-50/50 dark:bg-sky-950/20 text-[10.5px] font-semibold text-sky-800 dark:text-sky-300 shadow hover:bg-sky-100/50 transition-all truncate"
                        >
                          👨 {father.fullName}
                          <span className="block text-[8px]">Sinh: {father.dob}</span>
                        </button>
                      ) : (
                        <div className="mt-1 p-2 h-14 w-32 border border-dashed rounded bg-gray-50 dark:bg-zinc-950 text-[10px] text-gray-500 flex flex-col items-center justify-center">
                          <span>Chưa rõ</span>
                          <button type="button" 
                            onClick={handleSuggestParentAI} 
                            disabled={isAiParentLoading}
                            className="text-[8px] bg-amber-500 hover:bg-amber-600 text-white rounded px-1 py-0.5 mt-0.5 font-sans"
                          >
                            AI tìm Cha
                          </button>
                        </div>
                      )}
                    </div>
                    {/* Mẹ */}
                    <div>
                      <span className="text-[9px] text-gray-500 block">Mẫu thân / Mẹ</span>
                      {mother ? (
                        <button type="button" 
                          onClick={() => onNavigateToMember(mother.id)}
                          className="mt-1 p-2 h-14 w-32 border border-emerald-300 dark:border-emerald-950 rounded bg-emerald-50/50 dark:bg-emerald-950/20 text-[10.5px] font-semibold text-emerald-800 dark:text-emerald-300 shadow hover:bg-emerald-100/50 transition-all truncate"
                        >
                          👩 {mother.fullName}
                        </button>
                      ) : (
                        <div className="mt-1 p-2 h-14 w-32 border border-dashed rounded bg-gray-50 dark:bg-zinc-950 text-[10px] text-gray-500 flex items-center justify-center">
                          Chưa rõ
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Icon connector */}
                  <div className="hidden sm:block text-gray-300 font-bold">➔</div>

                  {/* Người Xem và Phối偶 */}
                  <div className="sm:col-span-1 flex flex-col items-center gap-2">
                    {/* Đương sự */}
                    <div className="p-2 h-14 w-32 bg-amber-600 border border-amber-500 rounded text-[10.5px] font-bold text-white shadow truncate">
                      👤 {member.fullName}
                      <span className="block text-[8px] font-normal text-amber-100 opacity-90">Bản thân ({member.id})</span>
                    </div>

                    {/* Vợ/Chồng */}
                    <div>
                      <span className="text-[9px] text-gray-500 block">Bạn đời (Phối ngẫu)</span>
                      {spouse ? (
                        <button type="button" 
                          onClick={() => onNavigateToMember(spouse.id)}
                          className="mt-1 p-2 h-14 w-32 border border-pink-300 dark:border-pink-950/80 rounded bg-pink-50/50 dark:bg-pink-950/20 text-[10.5px] font-semibold text-pink-700 dark:text-pink-400 shadow hover:bg-pink-100/50 transition-all truncate"
                        >
                          ❤️ {spouse.fullName}
                        </button>
                      ) : (
                        <div className="mt-1 p-2 h-14 w-32 border border-dashed rounded bg-gray-50 dark:bg-zinc-950 text-[10px] text-gray-500 flex items-center justify-center">
                          Chưa ghi lập
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </div>

              {/* AI parent suggestion report if any */}
              {isAiParentLoading && (
                <div className="p-4 bg-amber-50 dark:bg-zinc-800 border border-amber-200 rounded-2xl flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full border-2 border-amber-500 border-t-transparent animate-spin"></div>
                  <span className="text-xs text-amber-800 dark:text-amber-300">Trí tuệ nhân tạo Gemini đang tìm kiếm phân tích đời thế gia phả...</span>
                </div>
              )}
              {aiParentReport && (
                <div className="p-4 bg-amber-50/40 dark:bg-zinc-950 border border-amber-200/50 rounded-2xl space-y-2">
                  <span className="text-xs font-bold text-amber-800 dark:text-amber-400 block flex items-center gap-1">
                    <Sparkles className="h-3 w-3" /> Kết quả gợi ý dòng họ từ Cố vấn AI:
                  </span>
                  <div className="text-xs leading-relaxed text-gray-600 dark:text-zinc-400 whitespace-pre-wrap">
                    {aiParentReport}
                  </div>
                  <button type="button" 
                    onClick={() => setAiParentReport(null)}
                    className="text-[9px] text-amber-700 hover:underline hover:text-amber-800 font-bold block"
                  >
                    Đóng phân tích
                  </button>
                </div>
              )}

              {/* Relatives Tables */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Anh chị em */}
                <div className="space-y-2.5">
                  <span className="text-xs font-bold text-gray-500 block">Anh chị em ({siblings.length})</span>
                  {siblings.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                      {siblings.map(sib => (
                        <button type="button"
                          key={sib.id}
                          onClick={() => onNavigateToMember(sib.id)}
                          className="p-2 border border-gray-100 dark:border-zinc-850 hover:bg-amber-500/5 rounded-xl bg-gray-50/50 dark:bg-zinc-950 text-[11px] font-sans text-left transition-all block truncate text-gray-800 dark:text-zinc-200"
                        >
                          {sib.gender === Gender.MALE ? '👦' : '👧'} {sib.fullName}
                          <span className="block text-[8px] text-gray-500 font-mono">Đời thứ {sib.generation}</span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs italic text-gray-500 block">Thành viên là con độc nhất hoặc chưa ghi nhận anh chị em ruột.</span>
                  )}
                </div>

                {/* 2. Con cái */}
                <div className="space-y-2.5">
                  <span className="text-xs font-bold text-gray-500 block">Con cái hậu bối ({children.length})</span>
                  {children.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                      {children.map(child => (
                        <button type="button"
                          key={child.id}
                          onClick={() => onNavigateToMember(child.id)}
                          className="p-2 border border-gray-100 dark:border-zinc-850 hover:bg-amber-500/5 rounded-xl bg-gray-50/50 dark:bg-zinc-950 text-[11px] font-sans text-left transition-all block truncate text-gray-800 dark:text-zinc-200"
                        >
                          🌿 {child.fullName}
                          <span className="block text-[8px] text-gray-500 font-mono">Dòng sau • Đời {child.generation}</span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs italic text-gray-500 block">Chưa ghi nhận hậu duệ (Con cái).</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PROPOSE EDIT PANEL */}
          {activeTab === 'propose' && (
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 dark:bg-zinc-950 border border-amber-100 dark:border-zinc-850 rounded-2xl flex items-start gap-2.5">
                <ShieldAlert className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs leading-relaxed">
                  <strong className="text-amber-800 dark:text-amber-400 font-sans">Thời khóa Phân quyền Sắp đặt:</strong>
                  <p className="text-gray-500 mt-0.5">Với tư cách <strong className="text-gray-800 dark:text-gray-200">{currentUserRole}</strong>, bạn có quyền gửi các đề xuất chỉnh sửa tư liệu cũ, lỗi năm sinh, địa lý, hoặc số điện thoại. Yêu cầu của bạn sẽ được tự động xếp vào hàng đợi chờ duyệt để Trưởng tộc phê chuẩn, cam kết tính chính xác tuyệt đối của phả hệ tông thất.</p>
                </div>
              </div>

              <form onSubmit={handleSubmitProposal} className="space-y-4 max-w-lg">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400 mb-1">Cột thông tin cần sửa:</label>
                    <select
                      value={proposalField}
                      onChange={(e) => setProposalField(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-950 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    >
                      <option value="dob">Năm sinh (Ngày sinh)</option>
                      <option value="dod">Năm mất (Ngày tạ thế)</option>
                      <option value="phone">Số điện thoại</option>
                      <option value="address">Địa chỉ phân bố phân cư</option>
                      <option value="hometown">Quê quán hương hỏa</option>
                      <option value="profession">Nghề nghiệp</option>
                      <option value="education">Hạng lâm học vấn khoa cử</option>
                      <option value="burialPlace">Mộ Phần / Địa điểm an táng</option>
                      <option value="achievements">Ghi nhận / Đóng góp / Công danh</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400 mb-1">Giá trị hiện tại:</label>
                    <div className="w-full text-xs p-2.5 rounded-xl border bg-gray-100 dark:bg-zinc-800/50 text-gray-500 italic truncate">
                      {Array.isArray((member as any)[proposalField]) 
                        ? ((member as any)[proposalField].join(', ') || 'Chưa cập nhật')
                        : ((member as any)[proposalField] || 'Chưa cập nhật')}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400 mb-1">Giá trị mới đề xuất:</label>
                  <input
                    type="text"
                    placeholder="Điền thông tin chính xác mới..."
                    value={proposalNewValue}
                    onChange={(e) => setProposalNewValue(e.target.value)}
                    required
                    className="w-full text-xs p-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-950 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:text-zinc-100"
                  />
                </div>

                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-amber-700 hover:bg-amber-800 text-white rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-1"
                >
                  <Send className="h-4.5 w-4.5" /> Gửi đề xuất phê duyệt phả hệ
                </button>
              </form>
            </div>
          )}

          {/* TAB 4: ALBUM PANEL */}
          {activeTab === 'album' && (
            <div className="space-y-4">
              <span className="text-xs font-semibold text-gray-500 block border-b pb-1">Bộ sưu tập ảnh gia đình</span>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {member.album && member.album.length > 0 ? (
                  member.album.map((url, i) => (
                    <div key={i} className="group relative rounded-xl overflow-hidden border dark:border-zinc-850 aspect-square">
                      <img 
                        src={url} 
                        alt="Kỷ niệm" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button type="button" 
                          onClick={() => window.open(url, '_blank')}
                          className="px-2.5 py-1 text-[10px] bg-white text-gray-800 rounded shadow font-semibold"
                        >
                          Xem gốc
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-4 py-8 text-center text-xs text-gray-500 italic">
                    Chưa tải lên ảnh kỷ niệm gia đình cho thành viên này.
                  </div>
                )}
              </div>

              {/* Add Photo via Local Upload */}
              <div className="p-4 bg-gray-50 dark:bg-zinc-950 border border-gray-150 dark:border-zinc-850 rounded-2xl max-w-md space-y-2">
                <span className="text-xs font-bold text-gray-700 dark:text-zinc-300 flex items-center gap-1">
                  <ImageIcon className="h-4 w-4 text-amber-700" /> Tải lên ảnh kỷ niệm từ máy tính
                </span>
                <p className="text-[10px] text-gray-500">Hình cưới, hình gia đình chung vui giỗ chạp sẽ tự động nén thu gọn và bảo lưu truyền thụ.</p>
                
                <div className="flex gap-2 items-center">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;

                      const reader = new FileReader();
                      reader.onload = (event) => {
                        const img = new Image();
                        img.onload = () => {
                          const canvas = document.createElement('canvas');
                          const MAX_SIZE = 300; // Shrink to 300px to avoid 50k char limit in Google Sheets
                          let width = img.width;
                          let height = img.height;

                          if (width > height) {
                            if (width > MAX_SIZE) {
                              height *= MAX_SIZE / width;
                              width = MAX_SIZE;
                            }
                          } else {
                            if (height > MAX_SIZE) {
                              width *= MAX_SIZE / height;
                              height = MAX_SIZE;
                            }
                          }

                          canvas.width = width;
                          canvas.height = height;
                          const ctx = canvas.getContext('2d');
                          if (ctx) {
                            ctx.drawImage(img, 0, 0, width, height);
                            const dataUrl = canvas.toDataURL('image/jpeg', 0.5); // Lower quality to 0.5
                            
                            if (onUpdateMemberDirectly) {
                              const album = member.album ? [...member.album] : [];
                              album.push(dataUrl);
                              onUpdateMemberDirectly({ ...member, album });
                              alert('Đã tải đính kèm ảnh kỷ niệm thành công!');
                            } else {
                              onProposeEdit(member.id, 'album_append', 'Trống', dataUrl);
                              alert('Ảnh kỷ niệm đã được đẩy lên đề xuất phê chuẩn.');
                            }
                          }
                        };
                        img.src = event.target?.result as string;
                      };
                      reader.readAsDataURL(file);
                    }}
                    className="w-full text-[11px] text-gray-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-[11px] file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100 dark:file:bg-amber-900/20 dark:file:text-amber-400 transition-all cursor-pointer"
                  />
                </div>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
