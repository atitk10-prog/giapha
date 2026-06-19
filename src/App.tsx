import React, { useState, useEffect, useMemo } from 'react';
import { 
  Gender, 
  UserRole, 
  ClanMember, 
  ClanBranch, 
  ClanEvent, 
  FundTransaction, 
  ScholarshipRecord, 
  ClanDocument, 
  EditSuggestion, 
  ActivityLog 
} from './types';
import FamilyTree from './components/FamilyTree';
import MemberProfileModal from './components/MemberProfileModal';
import EventsManager from './components/EventsManager';
import FundManager from './components/FundManager';
import Scholarships from './components/Scholarships';
import LibraryManager from './components/LibraryManager';
import DistributionMap from './components/DistributionMap';
import AdminPanel from './components/AdminPanel';
import AddMemberModal from './components/AddMemberModal';
import { 
  Moon, Sun, ShieldCheck, Users, TreeDeciduous, 
  Coins, FileText, Map, Settings, GraduationCap, 
  Award, Heart, CalendarCheck, HelpCircle, BellRing, Printer, Sparkles, CheckCircle, Share2 
} from 'lucide-react';

const currencyFormatter = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumSignificantDigits: 3 });

export default function App() {
  // Theme state
  const [darkMode, setDarkMode] = useState<boolean>(false);

  // Tab navigation State
  const [activeTab, setActiveTab] = useState<'tree' | 'events' | 'funds' | 'scholarships' | 'library' | 'map' | 'admin'>('tree');

  // Simulated account states
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>(UserRole.GUEST); // Default to guest
  const currentUserEmail = "atnguyen.skayer@gmail.com"; // Real user details from metadata

  // Core Database state
  const [members, setMembers] = useState<ClanMember[]>([]);
  const [branches, setBranches] = useState<ClanBranch[]>([]);
  const [events, setEvents] = useState<ClanEvent[]>([]);
  const [fundTransactions, setFundTransactions] = useState<FundTransaction[]>([]);
  const [scholarships, setScholarships] = useState<ScholarshipRecord[]>([]);
  const [documents, setDocuments] = useState<ClanDocument[]>([]);
  const [suggestions, setSuggestions] = useState<EditSuggestion[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);

  // Selection states
  const [selectedMemberId, setSelectedMemberId] = useState<string | undefined>(undefined);
  const [isDataLoading, setIsDataLoading] = useState(true);

  // AI duplication alarm alerts
  const [aiDuplicateAlerts, setAiDuplicateAlerts] = useState<string[]>([]);

  // Add Member Modal state from tree
  const [addingRelation, setAddingRelation] = useState<{ parentId?: string; spouseId?: string; parentName?: string; spouseName?: string } | null>(null);

  // Sync Toast State
  const [syncToast, setSyncToast] = useState<{ show: boolean, message: string }>({ show: false, message: '' });

  // Admin authentication state
  const [adminPasswordVerified, setAdminPasswordVerified] = useState<boolean>(false);
  const [showAdminLogin, setShowAdminLogin] = useState<boolean>(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState<string>('');
  const [adminLoginError, setAdminLoginError] = useState<string>('');
  const [isAdminLoggingIn, setIsAdminLoggingIn] = useState<boolean>(false);
  const [loginMode, setLoginMode] = useState<'login' | 'forgot' | 'change'>('login');
  const [recoveryEmailInput, setRecoveryEmailInput] = useState<string>('');
  const [newPasswordInput, setNewPasswordInput] = useState<string>('');
  const [recoveryHint, setRecoveryHint] = useState<string>('at*******@g***.com');

  // Fetch initial family data on program boot
  useEffect(() => {
    fetchFamilyDatabase();
  }, []);

  const fetchFamilyDatabase = async () => {
    setIsDataLoading(true);
    try {
      const res = await fetch('/api/family-data');
      const data = await res.json();
      if (data) {
        setMembers(data.members || []);
        setBranches(data.branches || []);
        setEvents(data.events || []);
        setFundTransactions(data.fundTransactions || []);
        setScholarships(data.scholarships || []);
        setDocuments(data.documents || []);
        setSuggestions(data.suggestions || []);
        setLogs(data.logs || []);
        if (data.settings && data.settings[0] && data.settings[0].recoveryEmailHint) {
          setRecoveryHint(data.settings[0].recoveryEmailHint);
        }
      }
    } catch (e) {
      console.error("Failed to load family database from Express API", e);
    } finally {
      setIsDataLoading(false);
    }
  };


  const pushStateUpdate = async (newState: any) => {
    try {
      const res = await fetch('/api/family-data', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-admin-password': adminPasswordInput 
        },
        body: JSON.stringify(newState)
      });
      const data = await res.json();
      if (!data.success && data.error) {
        if (data.error.includes("Unauthorized")) {
           alert("Lỗi bảo mật: Sai mật mã quản trị. Vui lòng đăng nhập lại.");
           setAdminPasswordVerified(false);
           return;
        }
        throw new Error(data.error);
      }
      setSyncToast({ show: true, message: `Lưu trữ ${members.length} Đinh thành công!` });
      setTimeout(() => setSyncToast({ show: false, message: '' }), 3000);
    } catch (e: any) {
      alert("Chưa thể cập nhật! Lỗi: " + e.message);
    }
  };

  const handleAdminLogin = async () => {
    setIsAdminLoggingIn(true);
    setAdminLoginError('');
    try {
      if (loginMode === 'forgot') {
        const res = await fetch('/api/recover-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: recoveryEmailInput, newPassword: newPasswordInput })
        });
        const data = await res.json();
        if (data.success) {
          alert('Thiết lập mật khẩu mới thành công! Vui lòng đăng nhập lại bằng mật khẩu mới.');
          setLoginMode('login');
          setAdminPasswordInput('');
          setNewPasswordInput('');
          setRecoveryEmailInput('');
        } else {
          setAdminLoginError(data.error || 'Email khôi phục không chính xác.');
        }
      } else if (loginMode === 'change') {
        const res = await fetch('/api/change-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-admin-password': adminPasswordInput },
          body: JSON.stringify({ newPassword: newPasswordInput })
        });
        const data = await res.json();
        if (data.success) {
          alert('Đổi mật khẩu thành công! Vui lòng sử dụng mật khẩu mới cho các lần sau.');
          setLoginMode('login');
          setAdminPasswordInput(newPasswordInput);
          setNewPasswordInput('');
          handleAdminLogin(); // Auto login with new password
        } else {
          setAdminLoginError(data.error || 'Mật khẩu cũ không chính xác.');
        }
      } else {
        const res = await fetch('/api/verify-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: adminPasswordInput })
        });
        const data = await res.json();
        if (data.success) {
          setAdminPasswordVerified(true);
          setCurrentUserRole(UserRole.ADMIN);
          setShowAdminLogin(false);
          setActiveTab('admin');
        } else {
          setAdminLoginError(data.error || 'Mật mã không chính xác!');
        }
      }
    } catch (e) {
      setAdminLoginError('Lỗi kết nối máy chủ.');
    } finally {
      setIsAdminLoggingIn(false);
    }
  };

  // Generate logs helper
  const handleAddLog = (action: string, target: string, bypassPush: boolean = false) => {
    const newLog: ActivityLog = {
      id: `LOG_${Date.now()}`,
      user: currentUserEmail,
      action,
      target,
      time: new Date().toISOString()
    };
    const updatedLogs = [...logs, newLog];
    setLogs(updatedLogs);

    if (!bypassPush) {
      pushStateUpdate({
        members, branches: branches, events, fundTransactions, scholarships, documents, suggestions,
        logs: updatedLogs
      });
    }
    
    return updatedLogs;
  };

  // Direct edit update (for Admin / Branch Lead)
  const handleUpdateMemberDirectly = (updatedMember: ClanMember) => {
    const updatedMembers = members.map(m => m.id === updatedMember.id ? updatedMember : m);
    setMembers(updatedMembers);
    const updatedLogs = handleAddLog(`Cập nhật trực tiếp hồ sơ`, updatedMember.fullName, true);

    pushStateUpdate({
      members: updatedMembers,
      branches: branches, events, fundTransactions, scholarships, documents, suggestions, 
      logs: updatedLogs
    });
  };

  // Suggest edit (for Member role)
  const handleProposeEdit = (memberId: string, field: string, oldValue: string, newValue: string) => {
    const member = members.find(m => m.id === memberId);
    if (!member) return;

    const newSuggestion: EditSuggestion = {
      id: `SUG_${Date.now()}`,
      memberId,
      memberName: member.fullName,
      fieldName: field,
      oldValue,
      newValue,
      proposedBy: currentUserEmail,
      proposedAt: new Date().toISOString(),
      status: 'chờ duyệt'
    };

    const updatedSuggestions = [...suggestions, newSuggestion];
    setSuggestions(updatedSuggestions);
    const updatedLogs = handleAddLog(`Gửi đề nghị sửa đổi thông tin`, member.fullName, true);

    pushStateUpdate({
      members, branches: branches, events, fundTransactions, scholarships, documents,
      suggestions: updatedSuggestions,
      logs: updatedLogs
    });
  };

  // Approve Suggestion
  const handleApproveSuggestion = (id: string) => {
    const sug = suggestions.find(s => s.id === id);
    if (!sug) return;

    // Apply the change
    const updatedMembers = members.map(m => {
      if (m.id === sug.memberId) {
        let finalValue: any = sug.newValue;
        if (sug.fieldName === 'achievements') {
          finalValue = sug.newValue.split(',').map(s => s.trim()).filter(Boolean);
        }
        return {
          ...m,
          [sug.fieldName]: finalValue
        };
      }
      return m;
    });

    const updatedSuggestions = suggestions.map(s => {
      if (s.id === id) return { ...s, status: 'đã duyệt' as any };
      return s;
    });

    setMembers(updatedMembers);
    setSuggestions(updatedSuggestions);
    const updatedLogs = handleAddLog(`Phê duyệt sửa phả bạ [${sug.fieldName}]`, sug.memberName, true);

    pushStateUpdate({
      members: updatedMembers,
      branches: branches, events, fundTransactions, scholarships, documents,
      suggestions: updatedSuggestions,
      logs: updatedLogs
    });
  };

  // Reject Suggestion
  const handleRejectSuggestion = (id: string) => {
    const updatedSuggestions = suggestions.map(s => {
      if (s.id === id) return { ...s, status: 'từ chối' as any };
      return s;
    });

    setSuggestions(updatedSuggestions);
    const updatedLogs = handleAddLog(`Từ chối đề nghị sửa bạ phả`, id, true);

    pushStateUpdate({
      members, branches: branches, events, fundTransactions, scholarships, documents,
      suggestions: updatedSuggestions,
      logs: updatedLogs
    });
  };

  // Import excel sheets simulate
  const handleImportExcelData = (rawText: string) => {
    const rows = rawText.trim().split('\n');
    const newMembersList = [...members];

    rows.forEach((row, index) => {
      const parts = row.split(',').map(p => p.trim());
      if (parts.length >= 4) {
        const name = parts[0];
        const sex = parts[1] === 'Nữ' ? Gender.FEMALE : Gender.MALE;
        const gen = Number(parts[2]) || 4;
        const dob = parts[3] || '';
        const fatherId = parts[4] || null;

        newMembersList.push({
          id: `EXC_${Date.now()}_${index}`,
          fullName: name,
          gender: sex,
          generation: gen,
          branchId: 'CHI_TRUONG',
          dob,
          isDeceased: false,
          fatherId,
          locationName: 'Quảng Nam'
        });
      }
    });

    setMembers(newMembersList);
    const updatedLogs = handleAddLog(`Nhập danh bạ Excel tệp hàng loạt`, `${rows.length} người mới`, true);

    pushStateUpdate({
      members: newMembersList,
      branches: branches, events, fundTransactions, scholarships, documents, suggestions, 
      logs: updatedLogs
    });
  };

  // Backups download simulation
  const handleExportBackup = (type: 'json' | 'csv' | 'report') => {
    let rawContent = "";
    let fileTitle = "";

    if (type === 'json') {
      rawContent = JSON.stringify({ members, branches, events, fundTransactions, scholarships, documents }, null, 2);
      fileTitle = "Gia_Pha_Backup_Ho_Nguyen.json";
    } else if (type === 'csv') {
      rawContent = "Mã bạ, Họ tên, Giới tính, Đời, Năm sinh\n" + members.map(m => `${m.id}, ${m.fullName}, ${m.gender}, ${m.generation}, ${m.dob || 'Chưa rõ'}`).join('\n');
      fileTitle = "Danh_Sa_Toan_Phai_Ho_Nguyen.csv";
    } else {
      rawContent = `ĐẠI NIÊN GIÁM PHẢ CHÍ TỘC HỌ NGUYỄN\nNgày in phả chí: 2026-06-18\n` + 
        `Tổng vương phả hệ: ${members.length} Đinh\n` +
        `Danh sách anh linh Tổ tiên truyền đời phụng tự:\n` +
        members.map(m => `- Cụ ${m.fullName} (${m.dob || 'Không rõ'} - ${m.isDeceased ? m.dod : 'Hưởng thọ an nhiên'}) đời thế ${m.generation}`).join('\n');
      fileTitle = "Ao_Nien_Ky_Nguyen_Van.txt";
    }

    const blob = new Blob([rawContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileTitle;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    handleAddLog(`Trích xuất sao lưu đĩa bạ dạng ${type}`, fileTitle);
  };

  // Download increment
  const handleIncrementDownloads = (docId: string) => {
    const updatedDocs = documents.map(doc => {
      if (doc.id === docId) return { ...doc, downloadCount: doc.downloadCount + 1 };
      return doc;
    });
    setDocuments(updatedDocs);
    pushStateUpdate({
      members, branches, events, fundTransactions, scholarships,
      documents: updatedDocs,
      suggestions, logs
    });
  };

  // RSVP register
  const handleRegisterAttendance = (eventId: string, email: string) => {
    const updatedEvents = events.map(ev => {
      if (ev.id === eventId) {
        const attendees = ev.attendees.includes(email)
          ? ev.attendees.filter(e => e !== email)
          : [...ev.attendees, email];
        return { ...ev, attendees };
      }
      return ev;
    });
    setEvents(updatedEvents);
    const updatedLogs = handleAddLog(`Cập nhật báo danh dự lễ`, eventId, true);

    pushStateUpdate({
      members, branches,
      events: updatedEvents,
      fundTransactions, scholarships, documents, suggestions, 
      logs: updatedLogs
    });
  };

  // Add Event
  const handleAddEvent = (newEvent: ClanEvent) => {
    const updatedEvents = [...events, newEvent];
    setEvents(updatedEvents);
    const updatedLogs = handleAddLog(`Khởi tạo sự kiện mới dòng tộc`, newEvent.title, true);

    pushStateUpdate({
      members, branches,
      events: updatedEvents,
      fundTransactions, scholarships, documents, suggestions, 
      logs: updatedLogs
    });
  };

  // Add transaction
  const handleAddTransaction = (newTx: FundTransaction) => {
    const updatedTxs = [newTx, ...fundTransactions];
    setFundTransactions(updatedTxs);
    const updatedLogs = handleAddLog(`Hạch toán ghi chép sổ quỹ [${newTx.type}]`, newTx.title, true);

    pushStateUpdate({
      members, branches, events,
      fundTransactions: updatedTxs,
      scholarships, documents, suggestions, 
      logs: updatedLogs
    });
  };

  // Add scholarship
  const handleAddScholarship = (record: ScholarshipRecord) => {
    const updatedScholarships = [...scholarships, record];
    setScholarships(updatedScholarships);
    const updatedLogs = handleAddLog(`Ghi sổ vàng vinh danh khuyến học`, record.studentName, true);

    pushStateUpdate({
      members, branches, events, fundTransactions,
      scholarships: updatedScholarships,
      documents, suggestions, 
      logs: updatedLogs
    });
  };

  // Add Member
  const handleAddMember = (m: ClanMember) => {
    const updatedMembers = [...members, m];
    setMembers(updatedMembers);
    const updatedLogs = handleAddLog(`Thêm mới thành viên phả bạ`, m.fullName, true);

    pushStateUpdate({
      members: updatedMembers,
      branches, events, fundTransactions, scholarships, documents, suggestions, 
      logs: updatedLogs
    });

    // Run AI duplicate check for newly created members dynamically
    checkAiDuplicates(m);
  };

  // Delete Member
  const handleDeleteMember = (memberId: string) => {
    const updatedMembers = members.filter(m => m.id !== memberId);
    setMembers(updatedMembers);
    const updatedLogs = handleAddLog(`Xóa vĩnh viễn phả lục nhân thân`, memberId, true);

    pushStateUpdate({
      members: updatedMembers,
      branches, events, fundTransactions, scholarships, documents, suggestions, 
      logs: updatedLogs
    });
  };

  // Sổ vàng vinh danh khuyến học document upload
  const handleAddDocument = (doc: ClanDocument) => {
    const updatedDocs = [...documents, doc];
    setDocuments(updatedDocs);
    const updatedLogs = handleAddLog(`Tải lên tài liệu Google Drive mới`, doc.name, true);

    pushStateUpdate({
      members, branches, events, fundTransactions, scholarships,
      documents: updatedDocs,
      suggestions, 
      logs: updatedLogs
    });
  };

  // Check AI duplicates dynamically using Express + Gemini
  const checkAiDuplicates = async (newM: ClanMember) => {
    try {
      const res = await fetch('/api/ai/analyze-duplicate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberName: newM.fullName,
          dob: newM.dob,
          gender: newM.gender,
          branchId: newM.branchId
        })
      });
      const data = await res.json();
      if (data.isDuplicate) {
        setAiDuplicateAlerts(prev => [
          ...prev, 
          `Cảnh báo AI phát hiện trùng lặp cho $[${newM.fullName}]: ` + data.analysis
        ]);
        alert(`Cảnh báo Hội đồng AI phát hiện trùng lặp phả hệ cho ${newM.fullName}! Vui lòng kiềm duyệt bạ sách.`);
      }
    } catch (e) {
      console.warn("Could not check duplication alerts", e);
    }
  };

  // Nav to member in modal
  const handleNavigateToMember = (id: string) => {
    setSelectedMemberId(id);
  };

  // Calculate quick stats totals
  const totalCount = members.length;
  const livingCount = members.filter(m => !m.isDeceased).length;
  const deceasedCount = totalCount - livingCount;
  const abroadCount = members.filter(m => m.locationName === 'Mỹ' || m.locationName === 'Nhật Bản').length;
  const maxGenerationNum = members.reduce((max, m) => m.generation > max ? m.generation : max, 1);
  const totalFund = fundTransactions.filter(t => t.type === 'thu').reduce((sum, t) => sum + t.amount, 0) -
                    fundTransactions.filter(t => t.type === 'chi').reduce((sum, t) => sum + t.amount, 0);

  // Quick navigation select component matching tab
  const activeComponent = useMemo(() => {
    switch (activeTab) {
      case 'events':
        return (
          <EventsManager 
            events={events} 
            onRegisterAttendance={handleRegisterAttendance}
            currentUserEmail={currentUserEmail}
            currentUserRole={currentUserRole}
            onAddEvent={handleAddEvent}
          />
        );
      case 'funds':
        return (
          <FundManager 
            transactions={fundTransactions} 
            currentUserRole={currentUserRole}
            onAddTransaction={handleAddTransaction}
          />
        );
      case 'scholarships':
        return (
          <Scholarships 
            scholarships={scholarships} 
            currentUserRole={currentUserRole}
            onAddScholarship={handleAddScholarship}
          />
        );
      case 'library':
        return (
          <LibraryManager 
            documents={documents} 
            currentUserRole={currentUserRole}
            onAddDocument={handleAddDocument}
            onIncrementDownloads={handleIncrementDownloads}
          />
        );
      case 'map':
        return (
          <DistributionMap 
            members={members} 
            onSelectMember={(id) => setSelectedMemberId(id)}
          />
        );
      case 'admin':
        return (
          <AdminPanel 
            suggestions={suggestions}
            logs={logs}
            members={members}
            onApproveSuggestion={handleApproveSuggestion}
            onRejectSuggestion={handleRejectSuggestion}
            onImportExcelData={handleImportExcelData}
            onExportBackup={handleExportBackup}
            onAddMember={handleAddMember}
            onDeleteMember={handleDeleteMember}
            onAddLog={handleAddLog}
          />
        );
      default:
        return (
          <FamilyTree 
            members={members} 
            selectedMemberId={selectedMemberId}
            onSelectMember={(id) => setSelectedMemberId(id)}
            onAddMember={currentUserRole === UserRole.ADMIN || currentUserRole === UserRole.BRANCH_LEADER ? ((id, type) => {
              const member = members.find(m => m.id === id);
              if (type === 'child') {
                setAddingRelation({ parentId: id, parentName: member?.fullName });
              } else {
                setAddingRelation({ spouseId: id, spouseName: member?.fullName });
              }
            }) : undefined}
          />
        );
    }
  }, [activeTab, members, events, fundTransactions, scholarships, documents, suggestions, logs, currentUserRole]);

  return (
    <div className={`${darkMode ? 'dark bg-zinc-950 text-zinc-100' : 'bg-amber-50/15 text-gray-800'} min-h-screen font-sans antialiased transition-colors duration-200`}>
      
      {/* Google Sheets Sync Toast */}
      {syncToast.show && (
        <div className="fixed bottom-6 right-6 z-[100] animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-xl shadow-emerald-900/20 flex items-center gap-3 border border-emerald-500">
            <CheckCircle className="w-5 h-5 text-emerald-100" />
            <span className="font-medium text-sm">{syncToast.message}</span>
          </div>
        </div>
      )}

      {/* Adding Member Modal */}
      {addingRelation && (
        <AddMemberModal
          parentId={addingRelation.parentId}
          spouseId={addingRelation.spouseId}
          parentName={addingRelation.parentName}
          spouseName={addingRelation.spouseName}
          parentGender={addingRelation.parentId ? members.find(m => m.id === addingRelation.parentId)?.gender : undefined}
          parentSpouses={addingRelation.parentId ? members.filter(m => m.spouseId === addingRelation.parentId || addingRelation.parentId === m.spouseId) : []}
          currentBranchId={members.find(m => m.id === (addingRelation.parentId || addingRelation.spouseId))?.branchId || 'CHI_TRUONG'}
          onClose={() => setAddingRelation(null)}
          onSave={(newMember) => {
            // Calculate generation for child
            if (addingRelation.parentId) {
              const parent = members.find(m => m.id === addingRelation.parentId);
              newMember.generation = parent ? parent.generation + 1 : 1;
            } else if (addingRelation.spouseId) {
              const spouse = members.find(m => m.id === addingRelation.spouseId);
              newMember.generation = spouse ? spouse.generation : 1;
            }
            
            handleAddMember(newMember);
            
            // If adding spouse, we must also update the other member's spouseId link
            if (addingRelation.spouseId) {
              const updatedMembers = members.map(m => {
                if (m.id === addingRelation.spouseId) {
                  return { ...m, spouseId: newMember.id };
                }
                return m;
              });
              setMembers(updatedMembers);
              pushStateUpdate({
                members: updatedMembers,
                branches, events, fundTransactions, scholarships, documents, suggestions, logs
              });
            }
            
            setAddingRelation(null);
          }}
        />
      )}

      {/* Top Main Banner and Session switcher */}
      <header className="border-b border-gray-150 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 backdrop-blur sticky top-0 z-40 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3.5">
          
          {/* Logo clan */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-amber-800 text-amber-100 shadow-md">
              <TreeDeciduous className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[9.5px] uppercase tracking-widest text-amber-700 dark:text-amber-400 font-bold font-mono">ĐẠI TỘC CHÍ VĂN HÓA</span>
              <h1 className="text-sm font-black font-sans leading-none text-gray-900 dark:text-white">GIA PHẢ SỐ TỘC HỌ NGUYỄN</h1>
            </div>
          </div>

          {/* Theme, Account setup & print controllers */}
          <div className="flex flex-wrap items-center gap-2.5">
            
            {/* Quick RSVP or Alert warnings */}
            {aiDuplicateAlerts.length > 0 && (
              <button 
                type="button"
                onClick={() => {
                  alert(aiDuplicateAlerts[aiDuplicateAlerts.length - 1]);
                  setAiDuplicateAlerts([]);
                }}
                className="px-2.5 py-1 text-[10px] bg-red-500/10 hover:bg-red-500/20 text-red-650 cursor-pointer rounded-lg border-red-200 animate-pulse font-sans font-bold flex items-center gap-1"
                title="Cảnh báo phát hiện trùng bạ hệ tộc"
              >
                <BellRing className="h-3.5 w-3.5" /> Có nhắc nhở AI trùng lặp!
              </button>
            )}

            {/* Visual Session Level dropdown */}
            <div 
              className="flex items-center gap-1.5 bg-gray-50 dark:bg-zinc-950 px-2.5 py-1.5 rounded-xl border border-gray-200 dark:border-zinc-800 cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => {
                if (currentUserRole !== UserRole.ADMIN) {
                  setLoginMode('login');
                  setAdminPasswordInput('');
                  setAdminLoginError('');
                  setShowAdminLogin(true);
                } else {
                  if(window.confirm('Bạn có muốn thoát quyền Quản trị viên và trở về chế độ Khách?')) {
                    setCurrentUserRole(UserRole.GUEST);
                    setAdminPasswordVerified(false);
                    if (activeTab === 'admin') setActiveTab('tree');
                    handleAddLog('Thoát chế độ Quản trị', 'Guest');
                  }
                }
              }}
              title="Nhấn để đổi quyền"
            >
              <ShieldCheck className={`h-4 w-4 ${currentUserRole === UserRole.ADMIN ? 'text-emerald-600 dark:text-emerald-500' : 'text-gray-400 dark:text-zinc-600'}`} />
              <div className="text-left text-[10px] trailing-none">
                <span className="text-gray-400 block font-mono">Chế độ hiển thị:</span>
                <div className="font-bold text-gray-950 dark:text-zinc-100 select-none">
                  {currentUserRole === UserRole.ADMIN ? 'Quản trị viên (Xem + Ghi)' : 'Khách (Chỉ xem)'}
                </div>
              </div>
            </div>

            {/* Share action */}
            <button
              type="button"
              onClick={() => {
                const url = window.location.href;
                const shareData = {
                  title: 'Gia Phả Dòng Tộc',
                  text: 'Mời bạn xem Cây Gia Phả trực tuyến của dòng họ chúng ta:',
                  url: url
                };

                const showSuccess = () => {
                  setSyncToast({ show: true, message: 'Đã copy đường dẫn. Bạn có thể dán (Ctrl+V) gửi cho họ hàng!' });
                  setTimeout(() => setSyncToast({ show: false, message: '' }), 4000);
                };

                if (navigator.share) {
                  navigator.share(shareData).catch((err) => {
                    // Ignore abort errors
                    if (err.name !== 'AbortError') {
                      copyToClipboard();
                    }
                  });
                } else {
                  copyToClipboard();
                }

                function copyToClipboard() {
                  if (navigator.clipboard && window.isSecureContext) {
                    navigator.clipboard.writeText(url).then(showSuccess).catch(() => fallbackCopy(url));
                  } else {
                    fallbackCopy(url);
                  }
                }

                function fallbackCopy(text: string) {
                  try {
                    const textArea = document.createElement("textarea");
                    textArea.value = text;
                    textArea.style.position = "fixed";
                    textArea.style.left = "-999999px";
                    textArea.style.top = "-999999px";
                    document.body.appendChild(textArea);
                    textArea.focus();
                    textArea.select();
                    document.execCommand('copy');
                    textArea.remove();
                    showSuccess();
                  } catch (e) {
                    alert('Trình duyệt của bạn chặn tự động copy. Vui lòng copy đường dẫn trên thanh địa chỉ nhé!');
                  }
                }
              }}
              className="px-3 py-1.5 border border-sky-200 rounded-xl bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/20 dark:border-sky-900 text-sky-700 dark:text-sky-400 flex items-center gap-1.5 transition-all text-xs font-bold"
              title="Chia sẻ đường dẫn xem gia phả"
            >
              <Share2 className="h-4 w-4" /> Chia sẻ
            </button>

            {/* Print action */}
            <button
              type="button"
              onClick={() => {
                window.print();
              }}
              className="p-2 border rounded-xl bg-gray-50 hover:bg-gray-100 dark:bg-zinc-850 dark:border-zinc-800 text-gray-500 hover:text-gray-800 dark:text-zinc-400"
              title="In gia phả khổ lớn A0/A1 bộc bạ PDF"
            >
              <Printer className="h-4 w-4" />
            </button>

            {/* Dark mode switch */}
            <button
              type="button"
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 border rounded-xl bg-gray-50 hover:bg-amber-100 dark:bg-zinc-850 dark:border-zinc-800 text-gray-500 dark:text-zinc-400 transition-all active:scale-90"
              title="Sắp đặt giao diện Thờ tự Tối / Sáng"
            >
              {darkMode ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4 text-gray-700" />}
            </button>

          </div>

        </div>
      </header>

      {/* Main Container contents */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Banner with Wood template styled background */}
        <section className="relative p-8 rounded-3xl bg-gradient-to-r from-amber-900 to-yellow-950 text-white overflow-hidden shadow-xl border-t border-amber-300/30">
          {/* Subtle geometric pattern overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-amber-700/10 via-transparent to-transparent opacity-50"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-1.5">
              <span className="px-2.5 py-0.5 rounded bg-amber-700/80 text-[10px] uppercase font-mono tracking-widest text-amber-100 border border-amber-500/20">
                Tổ đường chí trung hiếu
              </span>
              <h2 className="text-xl sm:text-2xl font-black font-sans leading-none tracking-tight">GIA PHẢ TỘC HỌ NGUYỄN</h2>
              <p className="text-xs text-amber-200 max-w-xl italic">
                “Đoàn kết • Phụng gia hiếu học • Kiến tạo dòng tộc muôn đời thịnh vượng” - Tộc ước kiến lập gia phong vững bền dòng tộc gốc Nghệ An, nay tại Đồng Trường, Xã Trà My, TP. Đà Nẵng.
              </p>
            </div>

            {/* Quick Announcement */}
            <div className="p-4 rounded-2xl bg-black/20 hover:bg-black/30 border border-amber-300/20 max-w-sm flex gap-3 text-xs">
              <BellRing className="h-10 w-10 text-amber-400 flex-shrink-0 animate-pulse" />
              <div>
                <strong className="text-amber-300 font-sans block">Thông cáo Trọng sự:</strong>
                <p className="text-amber-100 text-[11px] leading-snug mt-0.5">Sửa soạn Đại lễ Giỗ tổ niên bạ vào Ngày 14/3 Âm Lịch (Dương lịch: 30/04/2026). Đề bạ rà xoát vóc tộc, dâng lễ kính tạ.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Census Metrics Banner */}
        <section className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {/* Totals */}
          <div className="p-3.5 bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-850 rounded-2xl shadow-sm text-center">
            <span className="text-[9px] text-gray-400 uppercase font-extrabold tracking-wider block">THÀNH VIÊN</span>
            <strong className="text-lg font-black font-sans text-gray-950 dark:text-white block mt-0.5">{totalCount}</strong>
            <span className="text-[8px] text-gray-400">vóc danh ghi sổ</span>
          </div>

          <div className="p-3.5 bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-850 rounded-2xl shadow-sm text-center">
            <span className="text-[9px] text-gray-400 uppercase font-extrabold tracking-wider block">ĐỜI THẾ</span>
            <strong className="text-lg font-black font-sans text-amber-700 dark:text-amber-400 block mt-0.5">{maxGenerationNum} đời</strong>
            <span className="text-[8px] text-gray-400">truyền nối phả chi</span>
          </div>

          <div className="p-3.5 bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-850 rounded-2xl shadow-sm text-center">
            <span className="text-[9px] text-gray-400 uppercase font-extrabold tracking-wider block">CÒN SỐNG</span>
            <strong className="text-lg font-black font-sans text-emerald-600 block mt-0.5">{livingCount} người</strong>
            <span className="text-[8px] text-gray-400">an nhiên đỗ gia</span>
          </div>

          <div className="p-3.5 bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-850 rounded-2xl shadow-sm text-center">
            <span className="text-[9px] text-gray-400 uppercase font-extrabold tracking-wider block">ĐÃ MẤT</span>
            <strong className="text-lg font-black font-sans text-slate-500 block mt-0.5">{deceasedCount} cụ</strong>
            <span className="text-[8px] text-gray-400">🕯️ thượng linh tiên tổ</span>
          </div>

          <div className="p-3.5 bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-850 rounded-2xl shadow-sm text-center">
            <span className="text-[9px] text-gray-400 uppercase font-extrabold tracking-wider block">HẢI NGOẠI</span>
            <strong className="text-lg font-black font-sans text-sky-600 block mt-0.5">{abroadCount} kiều bào</strong>
            <span className="text-[8px] text-gray-400">Mỹ, Nhật cư trú</span>
          </div>

          <div className="p-3.5 bg-white dark:bg-zinc-900 border border-amber-200 dark:border-amber-950/40 rounded-2xl shadow-sm text-center bg-amber-50/20 dark:bg-amber-950/5">
            <span className="text-[9px] text-amber-800 dark:text-amber-400 uppercase font-extrabold tracking-wider block">THỦ QUỸ dòng họ</span>
            <strong className="text-md font-sans font-bold text-amber-700 dark:text-amber-300 block mt-1">
              {currencyFormatter.format(totalFund)}
            </strong>
          </div>
        </section>

        {/* Tab selector list navigation bar */}
        <section className="flex flex-wrap gap-2.5 border-b pb-1">
          <button
            type="button"
            onClick={() => setActiveTab('tree')}
            className={`px-4 py-2.5 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all ${activeTab === 'tree' ? 'bg-amber-800 text-white shadow-md' : 'bg-white hover:bg-gray-100 dark:bg-zinc-900 dark:border-zinc-800 border text-gray-650'}`}
          >
            <TreeDeciduous className="h-4 w-4" /> Sơ đồ Cây gia phả tương tác
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('events')}
            className={`px-4 py-2.5 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all ${activeTab === 'events' ? 'bg-amber-800 text-white shadow-md' : 'bg-white hover:bg-gray-100 dark:bg-zinc-900 dark:border-zinc-800 border text-gray-650'}`}
          >
            <CalendarCheck className="h-4 w-4" /> Sự kiện & Việc hiếu hỉ ({events.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('funds')}
            className={`px-4 py-2.5 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all ${activeTab === 'funds' ? 'bg-amber-800 text-white shadow-md' : 'bg-white hover:bg-gray-100 dark:bg-zinc-900 dark:border-zinc-800 border text-gray-650'}`}
          >
            <Coins className="h-4 w-4" /> Sổ Quỹ Công đức
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('scholarships')}
            className={`px-4 py-2.5 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all ${activeTab === 'scholarships' ? 'bg-amber-800 text-white shadow-md' : 'bg-white hover:bg-gray-100 dark:bg-zinc-900 dark:border-zinc-800 border text-gray-650'}`}
          >
            <GraduationCap className="h-4 w-4" /> Khuyến học vinh danh
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('library')}
            className={`px-4 py-2.5 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all ${activeTab === 'library' ? 'bg-amber-800 text-white shadow-md' : 'bg-white hover:bg-gray-100 dark:bg-zinc-900 dark:border-zinc-800 border text-gray-650'}`}
          >
            <FileText className="h-4 w-4" /> Tàng thư tộc ước PDF
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('map')}
            className={`px-4 py-2.5 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all ${activeTab === 'map' ? 'bg-amber-800 text-white shadow-md' : 'bg-white hover:bg-gray-100 dark:bg-zinc-900 dark:border-zinc-800 border text-gray-650'}`}
          >
            <Map className="h-4 w-4" /> Bản đồ phân cư
          </button>

          <button
            type="button"
            onClick={() => {
              if (adminPasswordVerified) {
                setActiveTab('admin');
              } else {
                setShowAdminLogin(true);
              }
            }}
            className={`px-4 py-2.5 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all ${activeTab === 'admin' ? 'bg-amber-800 text-white shadow-md' : 'bg-white hover:bg-gray-100 dark:bg-zinc-900 dark:border-zinc-850 border-amber-200 dark:border-zinc-850 border text-gray-650'}`}
          >
            {adminPasswordVerified ? <Settings className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />} Bản trị Trưởng tộc
          </button>
        </section>

        {/* Tab display element block wrapper */}
        {isDataLoading ? (
          <div className="p-12 text-center text-xs text-gray-400 space-y-2">
            <div className="w-8 h-8 rounded-full border-2 border-amber-700 border-t-transparent animate-spin mx-auto"></div>
            <span>Đang nạp gia phả toàn tộc, đối soát Google Sheets hỏa tự...</span>
          </div>
        ) : (
          <section className="animate-fade-in">
            {activeComponent}
          </section>
        )}

      </main>

      {/* Profile details modal overlays if selected */}
      {selectedMemberId && (
        <MemberProfileModal 
          member={members.find(m => m.id === selectedMemberId)!}
          allMembers={members}
          onClose={() => setSelectedMemberId(undefined)}
          onNavigateToMember={handleNavigateToMember}
          currentUserRole={currentUserRole}
          currentUserEmail={currentUserEmail}
          onProposeEdit={handleProposeEdit}
          onUpdateMemberDirectly={handleUpdateMemberDirectly}
          onDeleteMember={(id) => {
            handleDeleteMember(id);
            setSelectedMemberId(undefined);
          }}
        />
      )}

      {/* Admin Password Login Modal */}
      {showAdminLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 dark:border-zinc-800 relative">
            <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-amber-600" /> 
              {loginMode === 'login' ? 'Xác thực Quản trị' : (loginMode === 'forgot' ? 'Khôi phục Mật mã' : 'Đổi Mật mã')}
            </h3>
            
            {loginMode === 'login' && (
              <>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Vui lòng nhập mật mã quản trị dòng họ để truy cập tính năng chỉnh sửa.</p>
                <input 
                  type="password" 
                  className="w-full px-3 py-2 border rounded-lg text-sm mb-2 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                  placeholder="Nhập mật mã..."
                  value={adminPasswordInput}
                  onChange={(e) => setAdminPasswordInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAdminLogin(); }}
                />
                <div className="flex justify-between items-center mb-4">
                  <button type="button" className="text-[10px] text-amber-600 hover:underline" onClick={() => setLoginMode('forgot')}>Quên mật khẩu?</button>
                  <button type="button" className="text-[10px] text-gray-500 hover:underline" onClick={() => setLoginMode('change')}>Đổi mật khẩu</button>
                </div>
              </>
            )}

            {loginMode === 'forgot' && (
              <>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Nhập email khôi phục (gợi ý: {recoveryHint}) và mật mã mới.</p>
                <input 
                  type="email" 
                  className="w-full px-3 py-2 border rounded-lg text-sm mb-2 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                  placeholder="Nhập chính xác email..."
                  value={recoveryEmailInput}
                  onChange={(e) => setRecoveryEmailInput(e.target.value)}
                />
                <input 
                  type="password" 
                  className="w-full px-3 py-2 border rounded-lg text-sm mb-4 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                  placeholder="Mật mã mới..."
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAdminLogin(); }}
                />
              </>
            )}

            {loginMode === 'change' && (
              <>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Nhập mật mã cũ và mật mã mới để thay đổi.</p>
                <input 
                  type="password" 
                  className="w-full px-3 py-2 border rounded-lg text-sm mb-2 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                  placeholder="Mật mã hiện tại..."
                  value={adminPasswordInput}
                  onChange={(e) => setAdminPasswordInput(e.target.value)}
                />
                <input 
                  type="password" 
                  className="w-full px-3 py-2 border rounded-lg text-sm mb-4 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                  placeholder="Mật mã mới..."
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAdminLogin(); }}
                />
              </>
            )}

            {adminLoginError && <p className="text-xs text-red-500 mb-4">{adminLoginError}</p>}
            
            <div className="flex justify-end gap-2 mt-4">
              <button 
                className="px-4 py-2 text-xs text-gray-500 hover:bg-gray-100 rounded-lg dark:hover:bg-zinc-800"
                onClick={() => {
                  if (loginMode !== 'login') {
                    setLoginMode('login');
                    setAdminLoginError('');
                  } else {
                    setShowAdminLogin(false);
                  }
                }}
              >
                {loginMode !== 'login' ? 'Quay lại' : 'Hủy'}
              </button>
              <button 
                className="px-4 py-2 text-xs bg-amber-700 hover:bg-amber-800 text-white rounded-lg flex items-center gap-2"
                onClick={handleAdminLogin}
                disabled={isAdminLoggingIn}
              >
                {isAdminLoggingIn ? "Đang xử lý..." : "Xác nhận"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer credits humbles */}
      <footer className="border-t border-gray-150 dark:border-zinc-850 bg-white dark:bg-zinc-900 mt-12 py-8 text-center text-xs text-gray-400">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="font-sans font-bold text-gray-800 dark:text-zinc-300 flex items-center justify-center gap-1">
            <Heart className="h-4 w-4 text-red-500 fill-current" /> Hội Đồng Gia Tộc Họ Nguyễn • Gốc Nghệ An, nay cư trú Đồng Trường, Xã Trà My, TP. Đà Nẵng
          </p>
          <p className="max-w-xl mx-auto text-[10.5px] leading-relaxed">
            Hệ thống gia phả số hóa tích hợp trợ thủ trí tuệ nhân tạo (AI), vận hành tủy biến dữ liệu thông qua cấu trúc Google Sheets truyền thông mà đảm bảo chi phí trọn đời bằng số không (0 đồng/tháng). Hãy kiểm chuẩn mọi thay đổi phả hệ của dòng tộc cùng đức hiền của cha ông.
          </p>
          <p className="text-[9px] font-mono mt-4">Phiên bản chuyên bạ v1.0.4 • © 2026</p>
        </div>
      </footer>

    </div>
  );
}
