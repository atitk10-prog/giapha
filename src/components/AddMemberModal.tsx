import React, { useState } from 'react';
import { ClanMember, Gender } from '../types';
import { X, User, Users, Calendar, MapPin, Briefcase, Link2 } from 'lucide-react';

interface AddMemberModalProps {
  parentId?: string;
  spouseId?: string;
  parentName?: string;
  spouseName?: string;
  onClose: () => void;
  onSave: (newMember: ClanMember) => void;
  currentBranchId: string;
}

export default function AddMemberModal({ 
  parentId, 
  spouseId, 
  parentName, 
  spouseName, 
  onClose, 
  onSave, 
  currentBranchId 
}: AddMemberModalProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    nickname: '',
    gender: spouseId ? (spouseName ? '' : Gender.FEMALE) : Gender.MALE, // Default based on relation type later
    dob: '',
    locationName: '',
    profession: '',
    avatarUrl: ''
  });

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
        const MAX_SIZE = 150; // max width/height for compression
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
          setFormData(prev => ({ ...prev, avatarUrl: dataUrl }));
        }
        setIsUploading(false);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim()) return;

    const newMember: ClanMember = {
      id: `MEM_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      fullName: formData.fullName,
      nickname: formData.nickname,
      gender: formData.gender as Gender,
      generation: 1, // This will be calculated in the parent
      branchId: currentBranchId,
      dob: formData.dob,
      isDeceased: false,
      locationName: formData.locationName,
      profession: formData.profession,
      avatarUrl: formData.avatarUrl,
      fatherId: parentId || null,
      spouseId: spouseId || null,
    };

    onSave(newMember);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-gray-100 dark:border-zinc-800">
        <div className="flex items-center justify-between p-5 bg-gray-50/50 dark:bg-zinc-800/50 border-b border-gray-100 dark:border-zinc-800">
          <h3 className="text-lg font-bold text-gray-900 dark:text-zinc-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-600" />
            {spouseId ? 'Thêm Vợ / Chồng' : 'Thêm Con Cháu'}
          </h3>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Relation Info Context */}
          <div className="px-3 py-2 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 rounded-lg text-sm flex items-center gap-2 mb-2">
            <Link2 className="w-4 h-4 shrink-0" />
            {spouseId 
              ? <span>Kết hôn với: <strong className="font-semibold">{spouseName || 'Thành viên'}</strong></span>
              : <span>Con của: <strong className="font-semibold">{parentName || 'Thành viên'}</strong></span>
            }
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
              Họ và Tên <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="w-4 h-4 text-gray-400" />
              </div>
              <input 
                type="text" 
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
                placeholder="Nhập họ và tên..."
                value={formData.fullName}
                onChange={e => setFormData({...formData, fullName: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
                Giới tính
              </label>
              <select 
                className="w-full px-3 py-2 border border-gray-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
                value={formData.gender}
                onChange={e => setFormData({...formData, gender: e.target.value as Gender})}
              >
                <option value={Gender.MALE}>Nam</option>
                <option value={Gender.FEMALE}>Nữ</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
                Năm sinh
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="w-4 h-4 text-gray-400" />
                </div>
                <input 
                  type="text" 
                  className="w-full pl-10 pr-3 py-2 border border-gray-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
                  placeholder="VD: 1990"
                  value={formData.dob}
                  onChange={e => setFormData({...formData, dob: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
              Hình ảnh (Tải lên từ máy tính)
            </label>
            <div className="flex items-center gap-3">
              {formData.avatarUrl ? (
                <div className="relative shrink-0">
                  <img src={formData.avatarUrl} alt="Avatar" className="w-12 h-12 rounded-xl object-cover border border-gray-200 dark:border-zinc-700" />
                  <button 
                    type="button" 
                    onClick={() => setFormData({...formData, avatarUrl: ''})}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-zinc-800 border border-dashed border-gray-300 dark:border-zinc-700 flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 text-gray-400" />
                </div>
              )}
              <div className="flex-1">
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUploading}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100 dark:file:bg-amber-900/20 dark:file:text-amber-400 transition-all cursor-pointer"
                />
                <p className="text-[11px] text-gray-400 mt-1">Ảnh sẽ tự động nén dung lượng nhỏ gọn để lưu trữ an toàn.</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
                Nghề nghiệp
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Briefcase className="w-4 h-4 text-gray-400" />
                </div>
                <input 
                  type="text" 
                  className="w-full pl-10 pr-3 py-2 border border-gray-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
                  placeholder="Kỹ sư, Giáo viên..."
                  value={formData.profession}
                  onChange={e => setFormData({...formData, profession: e.target.value})}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
                Nơi ở / Quê quán
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="w-4 h-4 text-gray-400" />
                </div>
                <input 
                  type="text" 
                  className="w-full pl-10 pr-3 py-2 border border-gray-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
                  placeholder="VD: Hà Nội"
                  value={formData.locationName}
                  onChange={e => setFormData({...formData, locationName: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-700 dark:text-zinc-300 rounded-xl font-medium transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-medium shadow-lg shadow-amber-600/20 transition-all active:scale-[0.98]"
            >
              Lưu thành viên
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
