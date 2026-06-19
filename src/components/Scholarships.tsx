import React, { useState } from 'react';
import { ScholarshipRecord, UserRole } from '../types';
import { Award, PlusCircle, Check, Target, Bookmark, GraduationCap } from 'lucide-react';

interface ScholarshipsProps {
  scholarships: ScholarshipRecord[];
  currentUserRole: UserRole;
  onAddScholarship?: (record: ScholarshipRecord) => void;
  onUpdateScholarship?: (updatedRecord: ScholarshipRecord) => void;
  onDeleteScholarship?: (id: string) => void;
}

const CURRENCY_FORMATTER = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });
const formatCurrency = (val: number) => CURRENCY_FORMATTER.format(val);

export default function Scholarships({
  scholarships,
  currentUserRole,
  onAddScholarship,
  onUpdateScholarship,
  onDeleteScholarship
}: ScholarshipsProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [studentName, setStudentName] = useState('');
  const [achievementTitle, setAchievementTitle] = useState('');
  const [awardName, setAwardName] = useState('');
  const [year, setYear] = useState('2026');
  const [amount, setAmount] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName || !achievementTitle) return;

    if (editingId && onUpdateScholarship) {
      onUpdateScholarship({
        id: editingId,
        studentName,
        achievementTitle,
        awardName: awardName || 'Học bổng Khuyến học Nguyễn Văn',
        year: Number(year),
        amount: amount ? Number(amount) : undefined
      });
      alert('Đã cập nhật hồ sơ vinh danh thành công!');
    } else if (onAddScholarship) {
      onAddScholarship({
        id: `SCH_${Date.now()}`,
        studentName,
        achievementTitle,
        awardName: awardName || 'Học bổng Khuyến học Nguyễn Văn',
        year: Number(year),
        amount: amount ? Number(amount) : undefined
      });
      alert('Đã vinh danh thành tích học sinh giỏi thành công!');
    }

    setShowAddForm(false);
    setEditingId(null);
    setStudentName('');
    setAchievementTitle('');
    setAwardName('');
    setAmount('');
  };

  const handleEdit = (record: ScholarshipRecord) => {
    setStudentName(record.studentName);
    setAchievementTitle(record.achievementTitle);
    setAwardName(record.awardName);
    setYear(record.year.toString());
    setAmount(record.amount ? record.amount.toString() : '');
    setEditingId(record.id);
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa hồ sơ vinh danh này không?') && onDeleteScholarship) {
      onDeleteScholarship(id);
    }
  };



  return (
    <div className="space-y-6">
      
      {/* Title block */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold font-sans text-gray-900 dark:text-zinc-100 flex items-center gap-2">
            🎓 Khuyến Học & Vinh Danh Khoa Bảng
          </h2>
          <p className="text-xs text-gray-500">
            Truyền thống hiếu học của Nguyễn tộc. Khích lệ ý chí rèn đức luyện tài của con em hậu thế hằng năm.
          </p>
        </div>

        {(currentUserRole === UserRole.ADMIN || currentUserRole === UserRole.BRANCH_LEADER) && (
          <button type="button"
            onClick={() => {
              if (showAddForm) {
                setShowAddForm(false);
                setEditingId(null);
                setStudentName('');
              } else {
                setShowAddForm(true);
              }
            }}
            className="px-3.5 py-2 text-xs font-bold rounded-xl bg-amber-700 hover:bg-amber-800 text-white flex items-center gap-1 shadow hover:scale-95 transition-all"
          >
            <PlusCircle className="h-4 w-4" /> {showAddForm ? 'Hủy bỏ' : 'Vinh danh học sinh mới'}
          </button>
        )}
      </div>

      {/* Stats Board */}
      <div className="p-5 border border-amber-200 dark:border-amber-950 rounded-3xl bg-amber-500/5 dark:bg-amber-950/15 flex flex-col sm:flex-row gap-5 items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-amber-600 text-white rounded-2xl">
            <GraduationCap className="h-7 w-7" />
          </div>
          <div>
            <span className="text-xs font-bold text-amber-900 dark:text-amber-400 block uppercase tracking-wider">HỌC BỔNG QUYÊN ĐỊNH</span>
            <strong className="text-xl font-extrabold text-amber-700 dark:text-amber-300 font-sans block">Nguyễn Văn Khuyến Học</strong>
            <p className="text-[10px] text-gray-400 mt-0.5">Vinh danh định kỳ hàng niên xuân vào lễ Tổ hội đồng.</p>
          </div>
        </div>

        <div className="flex gap-4 border-t sm:border-t-0 sm:border-l pl-0 sm:pl-6 pt-4 sm:pt-0 w-full sm:w-auto justify-around">
          <div className="text-center">
            <span className="text-[10px] text-gray-400 block">KHOA BẢNG ĐẬT GIẢI</span>
            <strong className="text-lg text-gray-800 dark:text-zinc-200 block">{scholarships.length} học sinh</strong>
          </div>
          <div className="text-center">
            <span className="text-[10px] text-gray-400 block">TỔNG GIẢI THƯỞNG</span>
            <strong className="text-lg text-amber-700 dark:text-amber-400 block">
              {formatCurrency(scholarships.reduce((sum, s) => sum + (s.amount || 0), 0))}
            </strong>
          </div>
        </div>
      </div>

      {/* Add Honor Entry Form */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="p-5 bg-amber-50/10 dark:bg-zinc-950/60 border border-amber-100 dark:border-zinc-800 rounded-3xl space-y-4 max-w-2xl animate-fade-in">
          <span className="text-xs font-bold text-amber-800 dark:text-amber-400 block border-b pb-1">
            {editingId ? 'SỬA ĐỔI HỒ SƠ VINH DANH' : 'GHI DANH VINH DANH HỌC SINH GIỎI'}
          </span>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-gray-500 font-bold mb-1">Họ và tên Học sinh</label>
              <input
                type="text"
                placeholder="Ví dụ: Nguyễn Minh Thư..."
                value={studentName}
                onChange={e => setStudentName(e.target.value)}
                required
                className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:text-zinc-100"
              />
            </div>

            <div>
              <label className="block text-gray-500 font-bold mb-1">Thành tích xuất sắc</label>
              <input
                type="text"
                placeholder="Ví dụ: Thủ khoa đại học, Giải Nhì toán tỉnh..."
                value={achievementTitle}
                onChange={e => setAchievementTitle(e.target.value)}
                required
                className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:outline-none dark:text-zinc-100"
              />
            </div>

            <div>
              <label className="block text-gray-500 font-bold mb-1">Tên giải thưởng / Học bổng</label>
              <input
                type="text"
                placeholder="Mặc định: Học bổng Nguyễn Văn Khuyến tài..."
                value={awardName}
                onChange={e => setAwardName(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:outline-none dark:text-zinc-100"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-gray-500 font-bold mb-1">Năm học vinh danh</label>
                <input
                  type="number"
                  value={year}
                  onChange={e => setYear(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:outline-none dark:text-zinc-100"
                />
              </div>
              <div>
                <label className="block text-gray-500 font-bold mb-1">Mức học bổng (VND)</label>
                <input
                  type="number"
                  placeholder="Khen thưởng..."
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:outline-none dark:text-zinc-100"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-bold shadow"
          >
            {editingId ? 'Cập nhật hồ sơ' : 'Lập bảng vinh danh'}
          </button>
        </form>
      )}

      {/* Honor roll lists and certificates layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {scholarships.map((record) => (
          <div 
            key={record.id}
            className="group relative border border-gray-150 dark:border-zinc-850 hover:border-amber-300 rounded-3xl p-5 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden flex flex-col justify-between"
          >
            {/* Visual credential border */}
            <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/10 rounded-bl-full flex items-center justify-center text-amber-700 font-bold">
              <Award className="h-5 w-5 group-hover:rotate-12 transition-transform" />
            </div>

            <div className="space-y-2.5">
              <div className="flex justify-between items-start">
                <span className="text-[9.5px] font-mono text-gray-400 uppercase tracking-widest block">NĂM HỌC {record.year}</span>
                {(currentUserRole === UserRole.ADMIN || currentUserRole === UserRole.BRANCH_LEADER) && (
                  <div className="flex gap-1 z-10 relative">
                    <button onClick={() => handleEdit(record)} className="text-[9px] px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded hover:bg-blue-200">Sửa</button>
                    <button onClick={() => handleDelete(record.id)} className="text-[9px] px-1.5 py-0.5 bg-red-100 text-red-700 rounded hover:bg-red-200">Xóa</button>
                  </div>
                )}
              </div>
              
              <h3 className="text-sm font-extrabold font-sans text-gray-900 dark:text-zinc-100 flex items-center gap-1.5 mt-1">
                👨‍🎓 {record.studentName}
              </h3>

              <div className="bg-amber-50/40 dark:bg-zinc-950 p-2.5 border border-amber-100/50 rounded-xl">
                <span className="text-[10px] text-amber-800 dark:text-amber-400 block font-bold">Thành tích vẻ vang:</span>
                <p className="text-[11px] text-gray-700 dark:text-zinc-300 font-medium font-sans mt-0.5 leading-snug">
                  {record.achievementTitle}
                </p>
              </div>

              <div className="text-[10.5px] text-gray-500 flex items-center gap-1">
                <Bookmark className="h-3 w-3 text-amber-600" />
                <span>Chi khen thưởng: <strong>{record.awardName}</strong></span>
              </div>
            </div>

            {record.amount && (
              <div className="mt-4 pt-3 border-t border-gray-100 dark:border-zinc-850 flex items-center justify-between">
                <span className="text-[10px] text-gray-400">Giá trị khuyến học:</span>
                <strong className="text-xs text-amber-700 dark:text-amber-400 font-mono font-bold">
                  {formatCurrency(record.amount)}
                </strong>
              </div>
            )}
          </div>
        ))}
      </div>

    </div>
  );
}
