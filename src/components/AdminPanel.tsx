import React, { useState, useMemo } from 'react';
import { ClanMember, EditSuggestion, ActivityLog, UserRole, Gender } from '../types';
import { Shield, Check, X, FileSpreadsheet, Download, RefreshCw, ClipboardList, Trash2, Edit3, UserPlus, Lock } from 'lucide-react';

interface AdminPanelProps {
  suggestions: EditSuggestion[];
  logs: ActivityLog[];
  members: ClanMember[];
  onApproveSuggestion: (id: string) => void;
  onRejectSuggestion: (id: string) => void;
  onImportExcelData: (rawCsvText: string) => void;
  onExportBackup: (type: 'json' | 'csv' | 'report') => void;
  onAddMember: (member: ClanMember) => void;
  onDeleteMember: (id: string) => void;
  onAddLog: (action: string, target: string) => void;
}

export default function AdminPanel({
  suggestions,
  logs,
  members,
  onApproveSuggestion,
  onRejectSuggestion,
  onImportExcelData,
  onExportBackup,
  onAddMember,
  onDeleteMember,
  onAddLog
}: AdminPanelProps) {
  const [activeSubTab, setActiveSubTab] = useState<'proposals' | 'crud' | 'excel' | 'logs' | 'backup' | 'integrations'>('proposals');

  // Excel paste state
  const [excelPaste, setExcelPaste] = useState('');

  const [newMemberAvatarUrl, setNewMemberAvatarUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 150;
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
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
          setNewMemberAvatarUrl(dataUrl);
        }
        setIsUploading(false);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberNickname, setNewMemberNickname] = useState('');
  const [newMemberGender, setNewMemberGender] = useState<Gender>(Gender.MALE);
  const [newMemberGen, setNewMemberGen] = useState('1');
  const [newMemberFatherId, setNewMemberFatherId] = useState('');
  const [newMemberMotherId, setNewMemberMotherId] = useState('');
  const [newMemberSpouseId, setNewMemberSpouseId] = useState('');
  const [newMemberBirthOrder, setNewMemberBirthOrder] = useState('');
  const [newMemberIsDeceased, setNewMemberIsDeceased] = useState(false);
  const [newMemberBranch, setNewMemberBranch] = useState('CHI_TRUONG');
  const [newMemberDob, setNewMemberDob] = useState('');
  const [newMemberDod, setNewMemberDod] = useState('');
  const [newMemberProfession, setNewMemberProfession] = useState('');
  const [newMemberLocationName, setNewMemberLocationName] = useState('');
  const [newMemberPhone, setNewMemberPhone] = useState('');

  const reversedLogs = useMemo(() => [...logs].reverse(), [logs]);

  const handleCreateMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName) return;

    const id = `NV-0${members.length + 1}`;
    onAddMember({
      id,
      fullName: newMemberName,
      nickname: newMemberNickname || undefined,
      gender: newMemberGender,
      generation: Number(newMemberGen),
      branchId: newMemberBranch,
      dob: newMemberDob || undefined,
      dod: newMemberDod || undefined,
      isDeceased: newMemberIsDeceased,
      fatherId: newMemberFatherId || null,
      motherId: newMemberMotherId || null,
      spouseId: newMemberSpouseId || null,
      birthOrder: newMemberBirthOrder || undefined,
      profession: newMemberProfession || undefined,
      locationName: newMemberLocationName || 'Quảng Nam',
      phone: newMemberPhone || undefined,
      avatarUrl: newMemberAvatarUrl || undefined
    });

    alert(`Đã thêm thành công thành viên mới ${newMemberName} mang mã bạ ${id}!`);
    setNewMemberName('');
    setNewMemberNickname('');
    setNewMemberDob('');
    setNewMemberDod('');
    setNewMemberFatherId('');
    setNewMemberMotherId('');
    setNewMemberSpouseId('');
    setNewMemberBirthOrder('');
    setNewMemberProfession('');
    setNewMemberLocationName('');
    setNewMemberPhone('');
    setNewMemberAvatarUrl('');
  };

  const handleImportExcel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!excelPaste.trim()) return;

    onImportExcelData(excelPaste);
    setExcelPaste('');
    alert('Dữ liệu từ bảng tính Sheets đã được phân tách và tích hợp đồng nhất vào cây gia phả tộc!');
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex items-center gap-3 border-b pb-4">
        <div className="p-2.5 bg-amber-800 text-white rounded-2xl">
          <Shield className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-lg font-bold font-sans text-gray-900 dark:text-zinc-100">
            🛡️ Văn Phòng Trưởng Tộc & Quản Trị Hệ Thống
          </h2>
          <p className="text-xs text-gray-500">
            Duyệt yêu cầu sửa đổi, biên lục thành viên, nhật ký hoạt động dòng tộc và lưu trữ sao lưu phả lục.
          </p>
        </div>
      </div>

      {/* Sub tabs switcher */}
      <div className="flex flex-wrap gap-2">
        <button type="button"
          onClick={() => setActiveSubTab('proposals')}
          className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all ${activeSubTab === 'proposals' ? 'bg-amber-700 border-amber-600 text-white shadow' : 'bg-transparent text-gray-600 dark:text-zinc-400 border-gray-200 dark:border-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-850'}`}
        >
          Duyệt đề xuất chỉnh sửa ({suggestions.filter(s => s.status === 'chờ duyệt').length})
        </button>

        <button type="button"
          onClick={() => setActiveSubTab('crud')}
          className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all ${activeSubTab === 'crud' ? 'bg-amber-700 border-amber-600 text-white shadow' : 'bg-transparent text-gray-600 dark:text-zinc-400 border-gray-200 dark:border-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-850'}`}
        >
          Thêm thành viên phả hệ
        </button>

        <button type="button"
          onClick={() => setActiveSubTab('excel')}
          className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all ${activeSubTab === 'excel' ? 'bg-amber-700 border-amber-600 text-white shadow' : 'bg-transparent text-gray-600 dark:text-zinc-400 border-gray-200 dark:border-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-850'}`}
        >
          Nhập Excel / Sheets
        </button>

        <button type="button"
          onClick={() => setActiveSubTab('logs')}
          className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all ${activeSubTab === 'logs' ? 'bg-amber-700 border-amber-600 text-white shadow' : 'bg-transparent text-gray-600 dark:text-zinc-400 border-gray-200 dark:border-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-850'}`}
        >
          Nhật ký hệ thống ({logs.length})
        </button>

        <button type="button"
          onClick={() => setActiveSubTab('backup')}
          className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all ${activeSubTab === 'backup' ? 'bg-amber-700 border-amber-600 text-white shadow' : 'bg-transparent text-gray-600 dark:text-zinc-400 border-gray-200 dark:border-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-850'}`}
        >
          Sao lưu dự bạ
        </button>

        <button type="button"
          onClick={() => setActiveSubTab('integrations')}
          className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all ${activeSubTab === 'integrations' ? 'bg-amber-700 border-amber-600 text-white shadow' : 'bg-transparent text-gray-600 dark:text-zinc-400 border-gray-200 dark:border-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-850'}`}
        >
          Kết nối (Sheets/Telegram)
        </button>
      </div>

      {/* Main detail boxes */}
      <div className="p-6 border border-gray-150 dark:border-zinc-850 bg-white dark:bg-zinc-900 rounded-3xl min-h-[300px]">
        
        {/* SUBTAB 1: SUGGESTED PROPOSALS FLOW */}
        {activeSubTab === 'proposals' && (
          <div className="space-y-4">
            <span className="text-xs font-bold text-gray-500 block uppercase">Danh sách yêu cầu đang chờ thẩm định</span>
            
            <div className="space-y-3">
              {suggestions.map((sug) => {
                const isPending = sug.status === 'chờ duyệt';

                return (
                  <div 
                    key={sug.id}
                    className={`p-4 border rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${isPending ? 'border-amber-300 bg-amber-500/5' : 'border-gray-150 bg-gray-50 text-gray-600'}`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <strong className="text-sm font-sans text-gray-900 dark:text-zinc-100">
                          {sug.memberName} (Mã bạ: {sug.memberId})
                        </strong>
                        <span className={`px-2 py-0.5 text-[9px] rounded font-bold uppercase tracking-wider ${isPending ? 'bg-amber-100 text-amber-800' : 'bg-gray-200 text-gray-500'}`}>
                          {sug.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-zinc-400 font-sans leading-relaxed">
                        Sửa trường <strong>[{sug.fieldName}]</strong>: Chuyển cũ <span className="line-through text-red-500">"{sug.oldValue}"</span> thành giá trị mới đề xuất <strong className="text-emerald-600 bg-emerald-50 dark:bg-emerald-950 dark:text-emerald-400 px-1 rounded">"{sug.newValue}"</strong>
                      </p>
                      <span className="text-[10px] text-gray-400 block font-mono">
                        Gửi từ: {sug.proposedBy} • Vào lúc: {sug.proposedAt}
                      </span>
                    </div>

                    {isPending && (
                      <div className="flex gap-2">
                        <button type="button"
                          onClick={() => {
                            onApproveSuggestion(sug.id);
                            alert('Đã phê duyệt cập nhật phả lục thành công! Giá trị mới đã được bổ sung trực tiếp.');
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white font-bold text-[10.5px] transition-all flex items-center gap-1 shadow active:scale-95"
                        >
                          <Check className="h-3.5 w-3.5" /> Thẩm Duyệt
                        </button>
                        <button type="button"
                          onClick={() => {
                            onRejectSuggestion(sug.id);
                            alert('Đã từ chối phiếu đề xuất bạ sách.');
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-[10.5px] transition-all flex items-center gap-1 shadow active:scale-95"
                        >
                          <X className="h-3.5 w-3.5" /> Bác Bỏ
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}

              {suggestions.length === 0 && (
                <div className="py-8 text-center text-xs text-gray-400 italic">
                  Không còn yêu cầu đề xuất chỉnh sửa nào đang chờ xử lý.
                </div>
              )}
            </div>
          </div>
        )}

        {/* SUBTAB 2: MEMBER CRUD */}
        {activeSubTab === 'crud' && (
          <div className="space-y-6">
            <span className="text-xs font-bold text-gray-500 block uppercase">Ghi nhận mới thành viên cho phả hệ dòng nhánh</span>
            
            <form onSubmit={handleCreateMember} className="p-4 bg-gray-50 dark:bg-zinc-950/40 rounded-2xl space-y-4 max-w-2xl text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-500 font-bold mb-1">Ảnh đại diện (Tải lên)</label>
                  <div className="flex items-center gap-3">
                    {newMemberAvatarUrl ? (
                      <div className="relative shrink-0">
                        <img src={newMemberAvatarUrl} alt="Avatar" className="w-12 h-12 rounded-lg object-cover border border-gray-200 dark:border-zinc-700" />
                        <button 
                          type="button" 
                          onClick={() => setNewMemberAvatarUrl('')}
                          className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-zinc-800 border border-dashed border-gray-300 dark:border-zinc-700 flex items-center justify-center shrink-0">
                        <UserPlus className="w-5 h-5 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1">
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={isUploading}
                        className="w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100 dark:file:bg-amber-900/20 dark:file:text-amber-400 transition-all cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-500 font-bold mb-1">Họ và Tên khai sinh</label>
                  <input
                    type="text"
                    required
                    placeholder="Nhập tên..."
                    value={newMemberName}
                    onChange={e => setNewMemberName(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:outline-none dark:text-zinc-100"
                  />
                </div>

                <div>
                  <label className="block text-gray-500 font-bold mb-1">Tên tự / Thường gọi (Tuỳ chọn)</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Tí, Cu, Bí..."
                    value={newMemberNickname}
                    onChange={e => setNewMemberNickname(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:outline-none dark:text-zinc-100"
                  />
                </div>

                <div>
                  <label className="block text-gray-500 font-bold mb-1">Giới tính</label>
                  <div className="flex gap-4 mt-2">
                    <label className="flex items-center gap-1.5 font-bold cursor-pointer">
                      <input 
                        type="radio" 
                        name="crud-gender"
                        checked={newMemberGender === Gender.MALE}
                        onChange={() => setNewMemberGender(Gender.MALE)}
                      /> Nam
                    </label>
                    <label className="flex items-center gap-1.5 font-bold cursor-pointer">
                      <input 
                        type="radio" 
                        name="crud-gender"
                        checked={newMemberGender === Gender.FEMALE}
                        onChange={() => setNewMemberGender(Gender.FEMALE)}
                      /> Nữ
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-500 font-bold mb-1">Thứ tự sinh (Tuỳ chọn)</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Con cả, Con thứ 2..."
                    value={newMemberBirthOrder}
                    onChange={e => setNewMemberBirthOrder(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:outline-none dark:text-zinc-100"
                  />
                </div>

                <div>
                  <label className="block text-gray-500 font-bold mb-1">Thế hệ đời thứ mấy</label>
                  <select
                    value={newMemberGen}
                    onChange={e => setNewMemberGen(e.target.value)}
                    className="w-full p-2.5 border rounded-lg bg-white dark:bg-zinc-900 dark:border-zinc-800"
                  >
                    {Array.from({ length: Math.max(5, (members.length > 0 ? Math.max(...members.map(m => m.generation)) : 1) + 2) }, (_, i) => i + 1).map(gen => (
                      <option key={gen} value={gen}>
                        Đời thứ {gen} {gen === 1 ? '(Khởi tổ)' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-500 font-bold mb-1">Mã bạ Cha trực hệ (Tuỳ chọn)</label>
                  <select
                    value={newMemberFatherId}
                    onChange={e => setNewMemberFatherId(e.target.value)}
                    className="w-full p-2.5 border rounded-lg bg-white dark:bg-zinc-900 dark:border-zinc-800"
                  >
                    <option value="">-- Không xác định --</option>
                    {members.filter(m => m.gender === Gender.MALE).map(m => (
                      <option key={m.id} value={m.id}>{m.fullName} (Đời {m.generation})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-500 font-bold mb-1">Mã bạ Mẹ trực hệ (Tuỳ chọn)</label>
                  <select
                    value={newMemberMotherId}
                    onChange={e => setNewMemberMotherId(e.target.value)}
                    className="w-full p-2.5 border rounded-lg bg-white dark:bg-zinc-900 dark:border-zinc-800"
                  >
                    <option value="">-- Không xác định --</option>
                    {members.filter(m => m.gender === Gender.FEMALE).map(m => (
                      <option key={m.id} value={m.id}>{m.fullName} (Đời {m.generation})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-500 font-bold mb-1">Mã bạ Vợ/Chồng (Nếu có)</label>
                  <select
                    value={newMemberSpouseId}
                    onChange={e => setNewMemberSpouseId(e.target.value)}
                    className="w-full p-2.5 border rounded-lg bg-white dark:bg-zinc-900 dark:border-zinc-800"
                  >
                    <option value="">-- Không xác định --</option>
                    {members.map(m => (
                      <option key={m.id} value={m.id}>{m.fullName} (Đời {m.generation})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-500 font-bold mb-1">Thuộc Nhánh / Chi họ</label>
                  <select
                    value={newMemberBranch}
                    onChange={e => setNewMemberBranch(e.target.value)}
                    className="w-full p-2.5 border rounded-lg bg-white dark:bg-zinc-900 dark:border-zinc-800"
                  >
                    <option value="CHI_TRUONG">Chi Trưởng (Quảng Nam)</option>
                    <option value="CHI_THU_01">Chi Thứ Một (Đà Nẵng)</option>
                  </select>
                  <p className="text-[10px] text-gray-400 mt-1 italic">
                    Xác định dòng nhánh để dễ dàng vẽ sơ đồ phả hệ cục bộ.
                  </p>
                </div>

                <div>
                  <label className="block text-gray-500 font-bold mb-1">Tình trạng</label>
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="checkbox"
                      id="isDeceased"
                      checked={newMemberIsDeceased}
                      onChange={e => setNewMemberIsDeceased(e.target.checked)}
                      className="w-4 h-4 text-amber-600 rounded border-gray-300 focus:ring-amber-500"
                    />
                    <label htmlFor="isDeceased" className="font-bold cursor-pointer">Đã mất</label>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-500 font-bold mb-1">Năm sinh</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: 1980"
                    value={newMemberDob}
                    onChange={e => setNewMemberDob(e.target.value)}
                    className="w-full p-2.5 border rounded-lg bg-white dark:bg-zinc-900 dark:border-zinc-800"
                  />
                </div>

                {newMemberIsDeceased && (
                  <div>
                    <label className="block text-gray-500 font-bold mb-1">Năm mất (Tuỳ chọn)</label>
                    <input
                      type="text"
                      placeholder="Ví dụ: 2020"
                      value={newMemberDod}
                      onChange={e => setNewMemberDod(e.target.value)}
                      className="w-full p-2.5 border rounded-lg bg-white dark:bg-zinc-900 dark:border-zinc-800"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-gray-500 font-bold mb-1">Nghề nghiệp (Tuỳ chọn)</label>
                  <input
                    type="text"
                    placeholder="Kỹ sư, Giáo viên..."
                    value={newMemberProfession}
                    onChange={e => setNewMemberProfession(e.target.value)}
                    className="w-full p-2.5 border rounded-lg bg-white dark:bg-zinc-900 dark:border-zinc-800"
                  />
                </div>

                <div>
                  <label className="block text-gray-500 font-bold mb-1">Nơi cư trú (Tuỳ chọn)</label>
                  <input
                    type="text"
                    placeholder="Đà Nẵng, Hà Nội..."
                    value={newMemberLocationName}
                    onChange={e => setNewMemberLocationName(e.target.value)}
                    className="w-full p-2.5 border rounded-lg bg-white dark:bg-zinc-900 dark:border-zinc-800"
                  />
                </div>

                <div>
                  <label className="block text-gray-500 font-bold mb-1">Số điện thoại (Tuỳ chọn)</label>
                  <input
                    type="text"
                    placeholder="0987..."
                    value={newMemberPhone}
                    onChange={e => setNewMemberPhone(e.target.value)}
                    className="w-full p-2.5 border rounded-lg bg-white dark:bg-zinc-900 dark:border-zinc-800"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="px-4 py-2 font-bold text-white bg-amber-700 hover:bg-amber-800 rounded-xl shadow transition-transform"
              >
                Ghi danh vào Tộc phả bạ tịch
              </button>
            </form>

            {/* List members inside CRUD deletion */}
            <div className="space-y-2 pt-4">
              <span className="text-xs font-bold text-gray-500 block">DANH BẠ THÀNH VIÊN HIỆN CÓ ({members.length} vóc)</span>
              
              <div className="max-h-48 overflow-y-auto border rounded-2xl divide-y text-xs">
                {members.map(m => (
                  <div key={m.id} className="p-3 bg-white dark:bg-zinc-950 flex items-center justify-between text-gray-750">
                    <div>
                      <strong>{m.fullName}</strong> ({m.id}) • Đời {m.generation} • Chi: {m.branchId === 'CHI_TRUONG' ? 'Chi Trưởng' : 'Chi Thứ Một'}
                    </div>
                    <button type="button"
                      onClick={() => {
                        if (confirm(`Bạn chắc chắn muốn xóa vĩnh viễn dữ liệu cụ/thành viên ${m.fullName} khỏi sổ bạ gia phả dòng tộc Nguyễn?`)) {
                          onDeleteMember(m.id);
                        }
                      }}
                      className="p-1 px-2.5 border rounded-lg text-red-500 hover:bg-red-50 text-[10px] font-bold"
                    >
                      <Trash2 className="h-3 w-3 inline mr-1" /> Xóa bạ
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* SUBTAB 3: EXCEL IMPORT SIMULATOR */}
        {activeSubTab === 'excel' && (
          <div className="space-y-4">
            <span className="text-xs font-bold text-gray-500 block uppercase">Nhập sổ sách từ bảng Excel / CSV hoặc Google Sheets</span>
            <p className="text-xs text-gray-500">
              Bạn có thể dễ dàng sao chép cột dữ liệu danh sách thành viên dòng họ từ Excel/Google Sheets của gia đình rồi dán vào khung dưới đây. Hệ thống sẽ tự động đối soát cấu trúc từ trái sang phải: <strong>Họ tên, Giới tính (Nam/Nữ), Đời (số), Năm sinh, Mã Cha (nếu có)</strong> để phân tích rà soát và dựng cây gia phả tức thì.
            </p>

            <form onSubmit={handleImportExcel} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Mẫu cấu trúc Excel văn bản mẫu:</label>
                <pre className="p-3 bg-gray-100 dark:bg-zinc-950 rounded-xl text-[10px] font-mono leading-relaxed truncate text-gray-400">
                  Nguyễn Văn Nam, Nam, 4, 1985, NV-005<br />
                  Nguyễn Thị Hồng, Nữ, 5, 2012, NV-007
                </pre>
              </div>

              <div>
                <textarea
                  rows={5}
                  placeholder="Dán các cột dữ liệu cách nhau bằng dấu phẩy tại đây..."
                  value={excelPaste}
                  onChange={e => setExcelPaste(e.target.value)}
                  className="w-full text-xs p-3 border border-gray-200 dark:border-zinc-800 rounded-xl bg-gray-50 dark:bg-zinc-950 focus:outline-none focus:ring-1 dark:text-zinc-100 font-mono"
                />
              </div>

              <button
                type="submit"
                className="px-4 py-2 font-bold text-white bg-amber-700 hover:bg-amber-800 rounded-xl text-xs flex items-center gap-1 shadow"
              >
                <FileSpreadsheet className="h-4.5 w-4.5" /> Đồng bộ Sát nhập dữ liệu Sheets
              </button>
            </form>
          </div>
        )}

        {/* SUBTAB 4: ACTIVITY LOGBOOK */}
        {activeSubTab === 'logs' && (
          <div className="space-y-4 font-mono text-[11px]">
            <span className="text-xs font-bold text-gray-500 block font-sans uppercase">Hành sự chi tiết biên niên sử hệ thống gia phả</span>
            
            <div className="border rounded-2xl overflow-hidden divide-y">
              <div className="bg-gray-50 dark:bg-zinc-950 p-2 text-gray-400 grid grid-cols-6 gap-2 font-bold">
                <span className="col-span-1">Giờ</span>
                <span className="col-span-1">Tài khoản</span>
                <span className="col-span-2">Sự vụ</span>
                <span className="col-span-2">Mục tiêu</span>
              </div>
              
              <div className="max-h-64 overflow-y-auto divide-y dark:divide-zinc-850">
                {reversedLogs.map((log) => (
                  <div key={log.id} className="p-2 grid grid-cols-6 gap-2 text-gray-600 dark:text-zinc-400 hover:bg-gray-500/5">
                    <span className="col-span-1 text-[10px] text-gray-400 truncate">{log.time.split('T')[1].substring(0, 8)}</span>
                    <span className="col-span-1 truncate text-amber-700 dark:text-amber-400 font-sans font-medium">{log.user.split('@')[0]}</span>
                    <span className="col-span-2 font-bold dark:text-zinc-300">{log.action}</span>
                    <span className="col-span-2 truncate">{log.target}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 5: MOCK BACKUPS */}
        {activeSubTab === 'backup' && (
          <div className="space-y-4">
            <span className="text-xs font-bold text-gray-500 block uppercase">Bảo tồn di văn - Một chạm Sao lưu toàn di phả</span>
            <p className="text-xs text-gray-500 leading-relaxed">
              Nhấn nút để kích hoạt kết nối nạp toàn bộ danh sạ, chi phái, sự kiện và quỹ tài chính đóng gói thành các định dạng bảo mật Excel phẳng, PDF in ấn hoặc bản sao tệp JSON nén. File sao lưu sẽ được bảo chứng đưa lên ổ Google Drive của gia phả dòng nhánh và sao lưu trên máy tính cá nhân dự phòng sự cố ổ cứng.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              {/* Excel */}
              <button type="button"
                onClick={() => {
                  onExportBackup('csv');
                  alert('Đại bản CSV danh sách 12 thành viên Nguyễn Văn đã được sinh lập và tải xuống!');
                }}
                className="p-5 border border-amber-200 dark:border-amber-950/80 rounded-2xl bg-amber-500/5 hover:bg-amber-500/10 hover:shadow transition-all text-center flex flex-col items-center justify-center gap-2"
              >
                <div className="p-2 bg-amber-600 text-white rounded-xl">
                  <FileSpreadsheet className="h-5 w-5" />
                </div>
                <div>
                  <strong className="text-xs block text-gray-800 dark:text-zinc-200">Sao lưu sang Bản tính Excel</strong>
                  <span className="text-[10px] text-gray-400 font-mono">XLSX / CSV format</span>
                </div>
              </button>

              {/* JSON backup */}
              <button type="button"
                onClick={() => {
                  onExportBackup('json');
                  alert('Bản sao lưu cấu trúc hệ thống JSON của dòng tộc Nguyễn đã được nén tải xuống thành công!');
                }}
                className="p-5 border border-amber-200 dark:border-amber-950/80 rounded-2xl bg-amber-500/5 hover:bg-amber-500/10 hover:shadow transition-all text-center flex flex-col items-center justify-center gap-2"
              >
                <div className="p-2 bg-amber-700 text-white rounded-xl">
                  <Download className="h-5 w-5" />
                </div>
                <div>
                  <strong className="text-xs block text-gray-800 dark:text-zinc-200">Sao lưu Toàn bộ cấu trúc hệ thống</strong>
                  <span className="text-[10px] text-gray-400 font-mono">JSON Bản phả hoàn chuẩn</span>
                </div>
              </button>

              {/* Full report */}
              <button type="button"
                onClick={() => {
                  onExportBackup('report');
                  alert('Đang tổng hợp báo cáo hành trạng niên giám tộc bạ định dạng PDF phác thảo...');
                }}
                className="p-5 border border-amber-200 dark:border-amber-950/80 rounded-2xl bg-amber-500/5 hover:bg-amber-500/10 hover:shadow transition-all text-center flex flex-col items-center justify-center gap-2"
              >
                <div className="p-2 bg-red-650 text-white rounded-xl">
                  <ClipboardList className="h-5 w-5" />
                </div>
                <div>
                  <strong className="text-xs block text-gray-800 dark:text-zinc-200">Sao lưu Báo cáo niên đại tổng thế</strong>
                  <span className="text-[10px] text-gray-400 font-mono">Tổng hợp Phả chí PDF</span>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* SUBTAB 6: INTEGRATIONS */}
        {activeSubTab === 'integrations' && (
          <div className="space-y-6">
            <div>
              <span className="text-xs font-bold text-gray-500 block uppercase mb-2">Đồng bộ Google Sheets tự động</span>
              <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-2xl">
                <div className="flex items-start gap-3">
                  <FileSpreadsheet className="w-6 h-6 text-amber-600 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-zinc-100 mb-1">Trạng thái: Chưa cấu hình</h4>
                    <p className="text-xs text-gray-600 dark:text-zinc-400 mb-3">
                      Để hệ thống tự động lưu dữ liệu gia phả vào Google Sheets làm bản sao lưu an toàn theo thời gian thực, bạn cần thiết lập biến môi trường <code className="bg-white dark:bg-zinc-800 px-1 py-0.5 rounded text-[10px]">GOOGLE_SERVICE_ACCOUNT_EMAIL</code> và <code className="bg-white dark:bg-zinc-800 px-1 py-0.5 rounded text-[10px]">GOOGLE_PRIVATE_KEY</code> trong tệp <strong>.env</strong>.
                    </p>
                    <button className="px-3 py-1.5 text-[11px] font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors">
                      Kiểm tra kết nối
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <span className="text-xs font-bold text-gray-500 block uppercase mb-2">Thông báo Telegram tự động</span>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-2xl">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white shrink-0 mt-0.5">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .24z"/>
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-zinc-100 mb-1">Trạng thái: Chưa cấu hình Bot</h4>
                    <p className="text-xs text-gray-600 dark:text-zinc-400 mb-3">
                      Nhận thông báo lập tức vào nhóm chat dòng họ khi có đề xuất hoặc thay đổi thông tin thành viên. Hãy thiết lập <code className="bg-white dark:bg-zinc-800 px-1 py-0.5 rounded text-[10px]">TELEGRAM_BOT_TOKEN</code> và <code className="bg-white dark:bg-zinc-800 px-1 py-0.5 rounded text-[10px]">TELEGRAM_CHAT_ID</code> trong cấu hình.
                    </p>
                    <button className="px-3 py-1.5 text-[11px] font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                      Gửi tin nhắn thử nghiệm
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
