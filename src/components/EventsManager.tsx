import React, { useState } from 'react';
import { ClanEvent, UserRole } from '../types';
import { Calendar, MapPin, User, Users, PlusCircle, CheckCircle2, ChevronRight } from 'lucide-react';

interface EventsManagerProps {
  events: ClanEvent[];
  onRegisterAttendance: (eventId: string, email: string) => void;
  currentUserEmail: string;
  currentUserRole: UserRole;
  onAddEvent?: (newEvent: ClanEvent) => void;
  onUpdateEvent?: (updatedEvent: ClanEvent) => void;
  onDeleteEvent?: (eventId: string) => void;
}

const getCategoryTheme = (cat: string) => {
  switch (cat) {
    case 'giỗ tổ': return 'bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-400 border-red-200';
    case 'họp họ': return 'bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-400 border-blue-200';
    case 'khuyến học': return 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-400 border-amber-200';
    case 'tang lễ': return 'bg-gray-150 text-gray-800 dark:bg-zinc-800 dark:text-zinc-400 border-gray-300';
    case 'cưới hỏi': return 'bg-pink-100 text-pink-800 dark:bg-pink-950/50 dark:text-pink-400 border-pink-200';
    default: return 'bg-purple-100 text-purple-800 dark:bg-purple-950/50 dark:text-purple-400 border-purple-200';
  }
};

export default function EventsManager({
  events,
  onRegisterAttendance,
  currentUserEmail,
  currentUserRole,
  onAddEvent,
  onUpdateEvent,
  onDeleteEvent
}: EventsManagerProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // New event inputs
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'giỗ tổ' | 'họp họ' | 'khuyến học' | 'tang lễ' | 'cưới hỏi' | 'khác'>('giỗ tổ');
  const [dateSolar, setDateSolar] = useState('');
  const [dateLunar, setDateLunar] = useState('');

  const getLunarDateString = (solarDateStr: string) => {
    if (!solarDateStr) return '';
    try {
      const d = new Date(solarDateStr);
      if (isNaN(d.getTime())) return '';
      const lunarStr = new Intl.DateTimeFormat('vi-VN-u-ca-chinese', { day: 'numeric', month: 'long', year: 'numeric' }).format(d);
      return lunarStr.charAt(0).toUpperCase() + lunarStr.slice(1);
    } catch {
      return '';
    }
  };
  const [location, setLocation] = useState('');
  const [host, setHost] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !dateSolar) return;

    if (editingId && onUpdateEvent) {
      onUpdateEvent({
        id: editingId,
        title,
        description,
        category,
        dateSolar,
        dateLunar: dateLunar || undefined,
        location,
        host,
        attendees: events.find(ev => ev.id === editingId)?.attendees || []
      });
      alert('Đã cập nhật sự kiện thành công!');
    } else if (onAddEvent) {
      onAddEvent({
        id: `EV_${Date.now()}`,
        title,
        description,
        category,
        dateSolar,
        dateLunar: dateLunar || undefined,
        location,
        host,
        attendees: []
      });
      alert('Đã thêm sự kiện dòng tộc mới thành công!');
    }

    setShowAddForm(false);
    setEditingId(null);
    setTitle('');
    setDescription('');
    setDateSolar('');
    setDateLunar('');
    setLocation('');
    setHost('');
  };

  const handleEdit = (event: ClanEvent) => {
    setTitle(event.title);
    setDescription(event.description || '');
    setCategory(event.category);
    setDateSolar(event.dateSolar);
    setDateLunar(event.dateLunar || '');
    setLocation(event.location || '');
    setHost(event.host || '');
    setEditingId(event.id);
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sự kiện này? Hành động này không thể hoàn tác.') && onDeleteEvent) {
      onDeleteEvent(id);
    }
  };



  return (
    <div className="space-y-6">
      
      {/* Header and Creator Option */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold font-sans text-gray-900 dark:text-zinc-100 flex items-center gap-2">
            📆 Sự Kiện & Hội Ngộ Tộc viên
          </h2>
          <p className="text-xs text-gray-500">
            Theo dõi, đăng ký tham gia các hoạt động thờ tự tổ tiên, khuyến học khuyến tài và họp thường niên.
          </p>
        </div>

        {(currentUserRole === UserRole.ADMIN || currentUserRole === UserRole.BRANCH_LEADER) && (
          <button type="button"
            onClick={() => {
              if (showAddForm) {
                setShowAddForm(false);
                setEditingId(null);
                setTitle('');
              } else {
                setShowAddForm(true);
              }
            }}
            className="px-3.5 py-2 text-xs font-bold rounded-xl bg-amber-700 hover:bg-amber-800 text-white flex items-center gap-1 shadow hover:scale-95 transition-all"
          >
            <PlusCircle className="h-4 w-4" /> {showAddForm ? 'Hủy bỏ' : 'Đăng sự kiện mới'}
          </button>
        )}
      </div>

      {/* Add Event Form Box */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="p-5 bg-amber-50/10 dark:bg-zinc-950/60 border border-amber-100 dark:border-zinc-800 rounded-3xl space-y-4 max-w-2xl animate-fade-in">
          <span className="text-xs font-bold text-amber-800 dark:text-amber-400 block border-b pb-1">
            {editingId ? 'SỬA ĐỔI THÔNG TIN SỰ KIỆN' : 'MỞ SỔ ĐĂNG KÝ SỰ KIỆN GIA TỘC'}
          </span>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-gray-500 font-bold mb-1">Tiêu chí sự kiện</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Ví dụ: Đại lễ giỗ tổ, Trấn bách niên lập tự..."
                required
                className="w-full p-2 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:text-zinc-100"
              />
            </div>

            <div>
              <label className="block text-gray-500 font-bold mb-1">Thể loại</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as any)}
                className="w-full p-2 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-1"
              >
                <option value="giỗ tổ">Giỗ Tổ dòng họ</option>
                <option value="họp họ">Họp họ hội nghị</option>
                <option value="khuyến học">Khuyến học khuyến tài</option>
                <option value="tang lễ">Hiếu sự Tang tế</option>
                <option value="cưới hỏi">Hôn sự Cưới hỏi</option>
                <option value="khác">Khác / Giao lưu</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-500 font-bold mb-1">Ngày Dương lịch</label>
              <input
                type="date"
                value={dateSolar}
                onChange={e => {
                  setDateSolar(e.target.value);
                  const lunar = getLunarDateString(e.target.value);
                  if (lunar) setDateLunar(lunar);
                }}
                required
                className="w-full p-2 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:outline-none dark:text-zinc-100"
              />
            </div>

            <div>
              <label className="block text-gray-500 font-bold mb-1">Ngày Âm lịch (Nếu có)</label>
              <input
                type="text"
                placeholder="Ví dụ: Ngày 14 tháng 3 Âm Lịch"
                value={dateLunar}
                onChange={e => setDateLunar(e.target.value)}
                className="w-full p-2 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:outline-none dark:text-zinc-100"
              />
            </div>

            <div>
              <label className="block text-gray-500 font-bold mb-1">Địa điểm tổ chức</label>
              <input
                type="text"
                placeholder="Địa chỉ cụ thể..."
                value={location}
                onChange={e => setLocation(e.target.value)}
                className="w-full p-2 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:outline-none dark:text-zinc-100"
              />
            </div>

            <div>
              <label className="block text-gray-500 font-bold mb-1">Người đứng cai trì / Phụ trách</label>
              <input
                type="text"
                placeholder="Ví dụ: Trưởng tộc Nguyễn Văn Hùng"
                value={host}
                onChange={e => setHost(e.target.value)}
                className="w-full p-2 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:outline-none dark:text-zinc-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-500 font-bold mb-1">Nội dung chi tiết chương trình cuộc gặp:</label>
            <textarea
              rows={3}
              placeholder="Ghi nhận giờ dâng hương, chương trình lễ tế, thụ lộc hoặc đóng góp quy định..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full text-xs p-2.5 border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-lg focus:outline-none focus:ring-1 dark:text-zinc-100 font-sans"
            />
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-bold shadow"
          >
            {editingId ? 'Cập nhật sự kiện' : 'Lập bảng sự kiện dòng tộc'}
          </button>
        </form>
      )}

      {/* Events List Box Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {events.map((event) => {
          const isRegistered = event.attendees.includes(currentUserEmail);

          return (
            <div
              key={event.id}
              className="group flex flex-col justify-between border border-gray-150 dark:border-zinc-850 hover:border-amber-300 dark:hover:border-amber-950 rounded-3xl p-5 bg-white dark:bg-zinc-900 transition-all shadow-sm hover:shadow-lg"
            >
              <div className="space-y-3">
                {/* Header categories */}
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <span className={`px-2.5 py-0.5 text-[9px] uppercase font-bold tracking-wider rounded-full border ${getCategoryTheme(event.category)}`}>
                      {event.category}
                    </span>
                    {(currentUserRole === UserRole.ADMIN || currentUserRole === UserRole.BRANCH_LEADER) && (
                      <div className="flex gap-1">
                        <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleEdit(event); }} className="text-[9px] px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200">Sửa</button>
                        <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(event.id); }} className="text-[9px] px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200">Xóa</button>
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] font-mono text-gray-400 block">
                    ID: {event.id}
                  </span>
                </div>

                {/* Event Title */}
                <h3 className="text-sm font-extrabold font-sans text-gray-900 dark:text-zinc-100 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                  {event.title}
                </h3>

                {/* Subtitle Dates */}
                <div className="flex items-center gap-2.5 text-[11px] text-gray-500 dark:text-zinc-400">
                  <div className="flex items-center gap-1 bg-amber-50 dark:bg-zinc-800 px-2 py-1 rounded">
                    <Calendar className="h-3.5 w-3.5 text-amber-600" />
                    <strong>{event.dateSolar}</strong> {event.dateLunar ? `(Âm: ${event.dateLunar})` : ''}
                  </div>
                </div>

                {/* Description info */}
                <p className="text-xs text-gray-600 dark:text-zinc-400 leading-relaxed font-sans max-h-20 overflow-y-auto">
                  {event.description}
                </p>

                {/* Logistics */}
                <div className="space-y-1.5 pt-2 border-t border-dashed border-gray-100 dark:border-zinc-800">
                  <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-zinc-400">
                    <MapPin className="h-3.5 w-3.5 text-amber-700 flex-shrink-0" />
                    <span className="truncate"><strong>Vị trí: </strong> {event.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-zinc-400">
                    <User className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
                    <span className="truncate"><strong>Chủ tế: </strong> {event.host}</span>
                  </div>
                </div>
              </div>

              {/* RSVP Actions footer */}
              <div className="mt-5 pt-3.5 border-t border-gray-100 dark:border-zinc-850 flex items-center justify-between">
                
                {/* Count registered */}
                <span className="text-[10.5px] text-gray-400 flex items-center gap-1">
                  <Users className="h-3 w-3.5 text-amber-600" /> 
                  <strong className="text-gray-700 dark:text-zinc-300">{event.attendees.length}</strong> người trong tộc đã đăng bạ dự lễ
                </span>

                {/* Join toggle button */}
                {isRegistered ? (
                  <button type="button"
                    onClick={() => onRegisterAttendance(event.id, currentUserEmail)}
                    className="px-3 py-1.5 text-[10px] font-extrabold rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-red-500/10 hover:text-red-600 border border-emerald-200 dark:border-emerald-950 flex items-center gap-1 active:scale-95 transition-all"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" /> Chắc chắn dự lễ
                  </button>
                ) : (
                  <button type="button"
                    onClick={() => onRegisterAttendance(event.id, currentUserEmail)}
                    className="px-3 py-1.5 text-[10px] font-extrabold rounded-xl bg-amber-700 hover:bg-amber-800 text-white flex items-center gap-1 active:scale-95 shadow transition-all"
                  >
                    Đăng bạ báo danh dự lễ
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
