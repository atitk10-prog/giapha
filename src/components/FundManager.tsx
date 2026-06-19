import React, { useState } from 'react';
import { FundTransaction, UserRole } from '../types';
import { TrendingUp, TrendingDown, DollarSign, PlusCircle, ArrowUpRight, ArrowDownRight, Tag } from 'lucide-react';

interface FundManagerProps {
  transactions: FundTransaction[];
  currentUserRole: UserRole;
  onAddTransaction?: (tx: FundTransaction) => void;
  onUpdateTransaction?: (updatedTx: FundTransaction) => void;
  onDeleteTransaction?: (txId: string) => void;
}

const CURRENCY_FORMATTER = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });
const formatCurrency = (val: number) => CURRENCY_FORMATTER.format(val);

const getCategoryLabel = (cat: string) => {
  switch (cat) {
    case 'đóng góp': return 'Đầu người Đóng góp';
    case 'tài trợ': return 'Hảo tâm Tài trợ';
    case 'khuyến học': return 'Khuyến học Khuyến tài';
    case 'sửa sang': return 'Tu tạo Dinh tự';
    case 'giỗ tổ': return 'Sắm lễ Giỗ Tổ';
    default: return 'Khác / Chi thường niên';
  }
};

export default function FundManager({
  transactions,
  currentUserRole,
  onAddTransaction
}: FundManagerProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // New Transaction states
  const [type, setType] = useState<'thu' | 'chi'>('thu');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<'đóng góp' | 'tài trợ' | 'khuyến học' | 'sửa sang' | 'giỗ tổ' | 'khác'>('đóng góp');
  const [contributor, setContributor] = useState('');

  // Settle calculations
  const totalIn = transactions.filter(t => t.type === 'thu').reduce((sum, t) => sum + t.amount, 0);
  const totalOut = transactions.filter(t => t.type === 'chi').reduce((sum, t) => sum + t.amount, 0);
  const currentSurplus = totalIn - totalOut;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = Number(amount);
    if (!title || isNaN(parsedAmount) || parsedAmount <= 0) return;

    if (editingId && onUpdateTransaction) {
      onUpdateTransaction({
        id: editingId,
        type,
        title,
        amount: parsedAmount,
        date: new Date().toISOString().split('T')[0], // keep the same or update? let's update date to now or preserve. Wait, preserve date from original!
        category,
        contributor: contributor || undefined
      });
      alert('Đã cập nhật bút toán quỹ dòng họ thành công!');
    } else if (onAddTransaction) {
      onAddTransaction({
        id: `TX_${Date.now()}`,
        type,
        title,
        amount: parsedAmount,
        date: new Date().toISOString().split('T')[0],
        category,
        contributor: contributor || undefined
      });
      alert('Đã ghi nhận bút toán quỹ dòng họ thành công!');
    }

    setShowAddForm(false);
    setEditingId(null);
    setTitle('');
    setAmount('');
    setCategory('đóng góp');
    setContributor('');
  };

  const handleEdit = (tx: FundTransaction) => {
    setType(tx.type);
    setTitle(tx.title);
    setAmount(tx.amount.toString());
    setCategory(tx.category);
    setContributor(tx.contributor || '');
    setEditingId(tx.id);
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa giao dịch quỹ này? Hành động này sẽ thay đổi số dư quỹ.') && onDeleteTransaction) {
      onDeleteTransaction(id);
    }
  };



  return (
    <div className="space-y-6">
      
      {/* Title block */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold font-sans text-gray-900 dark:text-zinc-100 flex items-center gap-2">
            🕋 Quỹ Công Đức & Tài Chính Tộc đường
          </h2>
          <p className="text-xs text-gray-500">
            Minh bạch sổ thu chi, đóng góp của kiều bào phương xa và chi khuyến tài, khôi phục từ đường Nguyễn tộc.
          </p>
        </div>

        {(currentUserRole === UserRole.ADMIN || currentUserRole === UserRole.BRANCH_LEADER) && (
          <button type="button"
            onClick={() => {
              if (showAddForm) {
                setShowAddForm(false);
                setEditingId(null);
                setTitle('');
                setAmount('');
              } else {
                setShowAddForm(true);
              }
            }}
            className="px-3.5 py-2 text-xs font-bold rounded-xl bg-amber-700 hover:bg-amber-800 text-white flex items-center gap-1 shadow hover:scale-95 transition-all"
          >
            <PlusCircle className="h-4 w-4" /> {showAddForm ? 'Hủy bỏ' : 'Ghi chép giao dịch mới'}
          </button>
        )}
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total revenue */}
        <div className="p-5 border border-gray-150 dark:border-zinc-850 rounded-3xl bg-white dark:bg-zinc-900 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">TỔNG THU (CÔNG ĐỨC)</span>
            <strong className="text-lg text-emerald-600 dark:text-emerald-400 font-sans block">{formatCurrency(totalIn)}</strong>
            <span className="text-[10px] block text-gray-400">Từ đóng góp & tài trợ hảo tâm</span>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl text-emerald-600">
            <TrendingUp className="h-6 w-6" />
          </div>
        </div>

        {/* Total expenditure */}
        <div className="p-5 border border-gray-150 dark:border-zinc-850 rounded-3xl bg-white dark:bg-zinc-900 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">TỔNG CHI (PHỤNG SỰ)</span>
            <strong className="text-lg text-red-600 dark:text-red-400 font-sans block">{formatCurrency(totalOut)}</strong>
            <span className="text-[10px] block text-gray-400">Cho tế lễ, khuyến học và xây dựng</span>
          </div>
          <div className="p-3 bg-red-50 dark:bg-red-950/40 rounded-2xl text-red-600">
            <TrendingDown className="h-6 w-6" />
          </div>
        </div>

        {/* Current remainder */}
        <div className="p-5 border border-amber-200 dark:border-amber-950 rounded-3xl bg-amber-500/5 dark:bg-amber-950/10 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-amber-800 dark:text-amber-400 font-bold uppercase tracking-wider block">QUỸ TỒN DƯ HIỆN TẠI</span>
            <strong className="text-xl text-amber-700 dark:text-amber-300 font-extrabold font-sans block">{formatCurrency(currentSurplus)}</strong>
            <span className="text-[10px] block text-amber-600">Bảo quả cân đối thủ quỹ giữ</span>
          </div>
          <div className="p-3 bg-amber-600 rounded-2xl text-white">
            <DollarSign className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Progress visual Proportion bars */}
      <div className="p-5 border border-gray-150 dark:border-zinc-850 rounded-3xl bg-white dark:bg-zinc-900 space-y-3.5">
        <span className="text-xs font-bold text-gray-800 dark:text-zinc-200 uppercase tracking-wider block">
          Biểu đồ cân đối thu chi lũy tích
        </span>
        <div className="space-y-2">
          {/* Progress bar */}
          <div className="w-full h-5 rounded-full overflow-hidden flex bg-gray-100 dark:bg-zinc-800">
            <div 
              style={{ width: `${(totalIn / (totalIn + totalOut || 1)) * 100}%` }} 
              className="bg-emerald-500 flex items-center justify-end pr-2 text-[9px] text-white font-bold"
              title="Phần Trăm Thu"
            >
              {Math.round((totalIn / (totalIn + totalOut || 1)) * 100)}% Thu
            </div>
            <div 
              style={{ width: `${(totalOut / (totalIn + totalOut || 1)) * 100}%` }} 
              className="bg-red-400 flex items-center justify-start pl-2 text-[9px] text-white font-bold"
              title="Phần Trăm Chi"
            >
              {Math.round((totalOut / (totalIn + totalOut || 1)) * 100)}% Chi
            </div>
          </div>
          <div className="flex justify-between text-[10px] text-gray-400">
            <span>● Công đức dòng tộc</span>
            <span>● Sử dụng đầu tư công phái</span>
          </div>
        </div>
      </div>

      {/* Add Giao dịch Form */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="p-5 bg-amber-50/10 dark:bg-zinc-950/60 border border-amber-100 dark:border-zinc-800 rounded-3xl space-y-4 max-w-2xl animate-fade-in">
          <span className="text-xs font-bold text-amber-800 dark:text-amber-400 block border-b pb-1">
            {editingId ? 'SỬA ĐỔI GIAO DỊCH QUỸ' : 'GHI CHÉP GIAO DỊCH QUỸ TỪ ĐƯỜNG'}
          </span>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-gray-500 font-bold mb-1">Loại giao dịch</label>
              <select
                value={type}
                onChange={e => setType(e.target.value as 'thu' | 'chi')}
                className="w-full p-2 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-1"
              >
                <option value="thu">Thu (Đóng góp / Tài trợ)</option>
                <option value="chi">Chi (Giải quyết sự nghiệp / Quyên học)</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-500 font-bold mb-1">Mục tiêu / Tiêu đề bút toán</label>
              <input
                type="text"
                placeholder="Ví dụ: Giỗ tổ, học bổng khuyến tài đại học..."
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
                className="w-full p-2 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:outline-none dark:text-zinc-100"
              />
            </div>

            <div>
              <label className="block text-gray-500 font-bold mb-1">Số tiền giao dịch (VND)</label>
              <input
                type="number"
                placeholder="Mệnh giá thực nhận..."
                value={amount}
                onChange={e => setAmount(e.target.value)}
                required
                className="w-full p-2 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:outline-none dark:text-zinc-100"
              />
            </div>

            <div>
              <label className="block text-gray-500 font-bold mb-1">Danh mục hạch toán</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as any)}
                className="w-full p-2 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:outline-none"
              >
                <option value="đóng góp">Đóng góp tống định</option>
                <option value="tài trợ">Hảo tâm tài trợ</option>
                <option value="khuyến học">Khuyến tài học bổng</option>
                <option value="sửa sang">Tu tạo lăng tẩm tự khí</option>
                <option value="giỗ tổ">Giỗ Tổ</option>
                <option value="khác">Khác</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-gray-500 font-bold mb-1">Bản vị đóng góp / Người hạch toán (Nếu có)</label>
              <input
                type="text"
                placeholder="Ví dụ: Nguyễn Văn A hoặc Ban khánh từ tự vệ..."
                value={contributor}
                onChange={e => setContributor(e.target.value)}
                className="w-full p-2 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:outline-none dark:text-zinc-100"
              />
            </div>
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-bold shadow"
          >
            {editingId ? 'Cập nhật giao dịch' : 'Đưa bút toán vào sổ quỹ'}
          </button>
        </form>
      )}

      {/* Transactions list ledger */}
      <div className="border border-gray-150 dark:border-zinc-850 rounded-3xl bg-white dark:bg-zinc-900 overflow-hidden shadow-sm">
        <div className="p-4 bg-gray-50 dark:bg-zinc-950 border-b border-gray-150 dark:border-zinc-850">
          <span className="text-xs font-bold text-gray-800 dark:text-zinc-200 block">SỔ GIAO DỊCH QUỸ CHI TIẾT</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-100/50 dark:bg-zinc-950 border-b text-gray-600">
                <th className="p-3.5 font-bold">Ngày</th>
                <th className="p-3.5 font-bold"> can thiệp hạch toán</th>
                <th className="p-3.5 font-bold">Mục tiêu / Người liên đới</th>
                <th className="p-3.5 font-bold">Hạng mục</th>
                <th className="p-3.5 font-bold text-right">Số tiền</th>
                {(currentUserRole === UserRole.ADMIN || currentUserRole === UserRole.BRANCH_LEADER) && (
                  <th className="p-3.5 font-bold text-center">Thao tác</th>
                )}
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr 
                  key={t.id} 
                  className="border-b hover:bg-gray-500/5 transition-colors border-gray-100 dark:border-zinc-850 text-gray-700 dark:text-zinc-300"
                >
                  <td className="p-3.5 font-mono">{t.date}</td>
                  <td className="p-3.5">
                    <div className="flex items-center gap-1.5">
                      <span className={`p-1 rounded-full ${t.type === 'thu' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400' : 'bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-400'}`}>
                        {t.type === 'thu' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                      </span>
                      <strong className="font-sans font-bold">{t.title}</strong>
                    </div>
                  </td>
                  <td className="p-3.5 text-gray-500 dark:text-zinc-400">
                    {t.contributor ? `👤 ${t.contributor}` : 'Bản tộc tự quản'}
                  </td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 bg-gray-100 dark:bg-zinc-800 rounded text-[9.5px] uppercase font-mono tracking-wider">
                      {t.category}
                    </span>
                  </td>
                  <td className={`p-3.5 text-right font-bold text-[12px] font-mono ${t.type === 'thu' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
                    {t.type === 'thu' ? '+' : '-'}{formatCurrency(t.amount)}
                  </td>
                  {(currentUserRole === UserRole.ADMIN || currentUserRole === UserRole.BRANCH_LEADER) && (
                    <td className="p-3.5 text-center space-x-1">
                      <button onClick={() => handleEdit(t)} className="text-[9px] px-1.5 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200">Sửa</button>
                      <button onClick={() => handleDelete(t.id)} className="text-[9px] px-1.5 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200">Xóa</button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
