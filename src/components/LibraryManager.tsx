import React, { useState } from 'react';
import { ClanDocument, UserRole } from '../types';
import { FileText, Folder, Download, Plus, Search, Archive, UploadCloud, Globe } from 'lucide-react';

interface LibraryProps {
  documents: ClanDocument[];
  currentUserRole: UserRole;
  onAddDocument?: (doc: ClanDocument) => void;
  onIncrementDownloads?: (docId: string) => void;
}

export default function LibraryManager({
  documents,
  currentUserRole,
  onAddDocument,
  onIncrementDownloads
}: LibraryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<'ALL' | 'gia phả' | 'tộc ước' | 'khuyến học' | 'nhà thờ'>('ALL');
  
  // New document fields
  const [docName, setDocName] = useState('');
  const [category, setCategory] = useState<'gia phả' | 'tộc ước' | 'khuyến học' | 'nhà thờ' | 'khác'>('gia phả');
  const [fileSize, setFileSize] = useState('1.5 MB');

  // Filter docs
  const filteredDocs = documents.filter(doc => {
    const matchSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchFolder = selectedFolder === 'ALL' || doc.category === selectedFolder;
    return matchSearch && matchFolder;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName) return;

    if (onAddDocument) {
      onAddDocument({
        id: `DOC_${Date.now()}`,
        name: docName.endsWith('.pdf') || docName.endsWith('.doc') ? docName : `${docName}.pdf`,
        category: category === 'khác' ? 'nhà thờ' : category, // Safe mapping
        fileType: docName.endsWith('.doc') ? 'doc' : 'pdf',
        size: fileSize,
        url: '#',
        downloadCount: 0,
        updatedAt: new Date().toISOString().split('T')[0]
      });
      alert('Đã tải lên tệp phả hệ lưu trữ thành công lên Google Drive dòng họ!');
      setDocName('');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Description title */}
      <div>
        <h2 className="text-lg font-bold font-sans text-gray-900 dark:text-zinc-100 flex items-center gap-2">
          📚 Tàng Thư Các & Thư Viện Tài Liệu
        </h2>
        <p className="text-xs text-gray-500">
          Nơi lưu giữ phả hệ bằng PDF, các bản khoán khế tộc ước, hương ước truyền đời, biên bản đại hội dòng họ qua các thế hệ.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Left Side: Directory Folders List */}
        <div className="md:col-span-1 space-y-4">
          <div className="p-4 border border-gray-150 dark:border-zinc-850 rounded-2xl bg-white dark:bg-zinc-900/40">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Thư mục hồ sơ</span>
            
            <div className="flex flex-col gap-1.5 text-xs font-semibold">
              <button type="button"
                onClick={() => setSelectedFolder('ALL')}
                className={`p-2.5 rounded-xl flex items-center gap-2 text-left transition-all ${selectedFolder === 'ALL' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-400' : 'text-gray-600 hover:bg-gray-100/50 dark:text-zinc-400 dark:hover:bg-zinc-850'}`}
              >
                <Folder className="h-4 w-4" /> Tất cả lưu trữ ({documents.length})
              </button>
              
              <button type="button"
                onClick={() => setSelectedFolder('gia phả')}
                className={`p-2.5 rounded-xl flex items-center gap-2 text-left transition-all ${selectedFolder === 'gia phả' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-400' : 'text-gray-600 hover:bg-gray-100/50 dark:text-zinc-400 dark:hover:bg-zinc-850'}`}
              >
                <Folder className="h-4 w-4 text-amber-600" /> Sổ sách Gia phả ({documents.filter(d => d.category === 'gia phả').length})
              </button>

              <button type="button"
                onClick={() => setSelectedFolder('tộc ước')}
                className={`p-2.5 rounded-xl flex items-center gap-2 text-left transition-all ${selectedFolder === 'tộc ước' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-400' : 'text-gray-600 hover:bg-gray-100/50 dark:text-zinc-400 dark:hover:bg-zinc-850'}`}
              >
                <Folder className="h-4 w-4 text-sky-600" /> Tộc ước - Hương ước ({documents.filter(d => d.category === 'tộc ước').length})
              </button>

              <button type="button"
                onClick={() => setSelectedFolder('khuyến học')}
                className={`p-2.5 rounded-xl flex items-center gap-2 text-left transition-all ${selectedFolder === 'khuyến học' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-400' : 'text-gray-600 hover:bg-gray-100/50 dark:text-zinc-400 dark:hover:bg-zinc-850'}`}
              >
                <Folder className="h-4 w-4 text-emerald-600" /> Quỹ Khuyến học ({documents.filter(d => d.category === 'khuyến học').length})
              </button>

              <button type="button"
                onClick={() => setSelectedFolder('nhà thờ')}
                className={`p-2.5 rounded-xl flex items-center gap-2 text-left transition-all ${selectedFolder === 'nhà thờ' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-400' : 'text-gray-600 hover:bg-gray-100/50 dark:text-zinc-400 dark:hover:bg-zinc-850'}`}
              >
                <Folder className="h-4 w-4 text-red-650" /> Biên bản họp Nhà thờ ({documents.filter(d => d.category === 'nhà thờ').length})
              </button>
            </div>
          </div>

          <div className="p-4 border border-blue-100 dark:border-zinc-850 rounded-2xl bg-sky-500/5 dark:bg-zinc-950/30 text-[11px] leading-relaxed text-gray-600 space-y-1">
            <span className="font-bold flex items-center gap-1 text-sky-800 dark:text-sky-400">
              <Globe className="h-3.5 w-3.5" /> Thư viện Drive liên kết
            </span>
            <p>Hệ thống tự động liên thông đồng bộ lưu trữ trực tuyến lên tài khoản Google Drive bảo mật của Nguyễn Văn dòng tộc.</p>
          </div>
        </div>

        {/* Right Side: Documents lists with filter and uploader */}
        <div className="md:col-span-3 space-y-4">
          
          {/* Filter/Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 dark:text-zinc-500" />
            <input
              type="text"
              placeholder="Tìm kiếm chính xác tên văn bản phả ký..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-8.5 pr-4 py-2 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 focus:outline-none dark:text-zinc-100"
            />
          </div>

          {/* Doc lists box */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredDocs.map((doc) => (
              <div 
                key={doc.id}
                className="group border border-gray-150 dark:border-zinc-850 rounded-2xl p-4 bg-white dark:bg-zinc-900 shadow-sm flex items-start gap-3 hover:border-amber-300 transition-colors justify-between"
              >
                <div className="flex gap-2.5 items-start">
                  <div className="p-2.5 rounded-lg bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400 mt-0.5">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <strong className="text-[11.5px] font-sans text-gray-900 dark:text-zinc-100 block truncate w-[160px] md:w-[130px] lg:w-[160px]">
                      {doc.name}
                    </strong>
                    <span className="text-[9.5px] text-gray-400 block mt-0.5 uppercase">
                      📂 {doc.category} • {doc.size}
                    </span>
                    <span className="text-[9px] text-gray-400 block mt-0.5">
                      Đưa bạ: {doc.updatedAt}
                    </span>
                  </div>
                </div>

                <div className="text-right flex flex-col justify-between h-full items-end">
                  <span className="text-[9px] text-gray-400 italic block">
                    📥 {doc.downloadCount} lượt tải
                  </span>
                  
                  <button type="button"
                    onClick={() => {
                      if (onIncrementDownloads) onIncrementDownloads(doc.id);
                      alert(`Đang tải tệp tin "${doc.name}" xuống máy từ thư mục Google Drive của dòng tộc...`);
                    }}
                    className="p-1.5 rounded-lg bg-gray-50 hover:bg-amber-100 text-gray-500 hover:text-amber-800 dark:bg-zinc-800 dark:hover:bg-amber-950 transition-all border mt-2 active:scale-95"
                    title="Mở tài liệu / Tải về Máy"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}

            {filteredDocs.length === 0 && (
              <div className="col-span-2 py-8 text-center text-xs text-gray-400 italic">
                Không tìm thấy tệp lưu trữ phù hợp trong thư mục này.
              </div>
            )}
          </div>

          {/* Admin Direct Drag-and-Upload Tool */}
          {(currentUserRole === UserRole.ADMIN || currentUserRole === UserRole.BRANCH_LEADER) && (
            <div className="pt-6 border-t border-dashed">
              <form onSubmit={handleSubmit} className="p-4 bg-amber-50/10 dark:bg-zinc-950/50 border border-amber-200/50 rounded-2xl space-y-3.5">
                <span className="text-[11px] font-bold text-amber-800 dark:text-amber-400 block uppercase tracking-wider flex items-center gap-1">
                  <UploadCloud className="h-4.5 w-4.5 text-amber-700" /> TỦ ĐỰNG TÀI LIỆU DÒNG TỘC (MÔ PHỎNG GOOGLE DRIVE)
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="sm:col-span-1">
                    <label className="block text-gray-500 font-bold mb-1">Tên tệp lưu bạ</label>
                    <input
                      type="text"
                      placeholder="Gia_pha_nganh_truong.pdf..."
                      value={docName}
                      onChange={e => setDocName(e.target.value)}
                      required
                      className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:outline-none dark:text-zinc-100"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-500 font-bold mb-1">Sắp xếp thư mục</label>
                    <select
                      value={category}
                      onChange={e => setCategory(e.target.value as any)}
                      className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:outline-none"
                    >
                      <option value="gia phả">Gia phả toàn phái</option>
                      <option value="tộc ước">Tộc ước thiết lập</option>
                      <option value="khuyến học">Quỹ khuyến học khuyến tài</option>
                      <option value="nhà thờ">Biên bản họp nhà thờ họ</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-500 font-bold mb-1">Quy cách dung lượng</label>
                    <input
                      type="text"
                      placeholder="Ví dụ: 4.8 MB"
                      value={fileSize}
                      onChange={e => setFileSize(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:outline-none dark:text-zinc-100"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold shadow flex items-center gap-1 active:scale-95 transition-transform"
                  >
                    <Plus className="h-4 w-4" /> Tải lên Lưu Thư Quán dòng họ
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}
