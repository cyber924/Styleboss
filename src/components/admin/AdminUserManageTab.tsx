import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  ShieldCheck, 
  ShieldAlert, 
  Award, 
  Coins, 
  ShoppingBag, 
  Calendar, 
  UserCheck, 
  UserX, 
  Plus, 
  Check, 
  Edit3,
  Sparkles,
  Zap,
  ArrowUpRight
} from 'lucide-react';
import type { UserProfile } from '../../types';

interface AdminUserManageTabProps {
  users: UserProfile[];
  onUpdateUser: (updated: UserProfile) => void;
  onAddUser: (newUser: UserProfile) => void;
  onSuccess: (msg: string) => void;
}

export function AdminUserManageTab({
  users,
  onUpdateUser,
  onAddUser,
  onSuccess,
}: AdminUserManageTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  
  // Point adjustment modal
  const [pointModalUser, setPointModalUser] = useState<UserProfile | null>(null);
  const [pointDelta, setPointDelta] = useState<number>(5000);
  const [pointMemo, setPointMemo] = useState('프로모션 보너스 지급');

  // Quick Add user modal
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<'user' | 'manager' | 'admin'>('user');
  const [newGrade, setNewGrade] = useState<'VIP' | '골드' | '실버' | '일반'>('일반');

  const filteredUsers = users.filter(u => {
    const email = u.email || '';
    const name = u.displayName || '';
    const matchSearch = email.toLowerCase().includes(searchTerm.toLowerCase()) || name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const handleRoleToggle = (user: UserProfile) => {
    const nextRole: 'user' | 'manager' | 'admin' = 
      user.role === 'admin' ? 'user' : user.role === 'manager' ? 'admin' : 'manager';
    
    const updated: UserProfile = { ...user, role: nextRole };
    onUpdateUser(updated);
    onSuccess(`[${user.displayName || user.email}] 회원의 권한이 [${nextRole.toUpperCase()}](으)로 변경되었습니다.`);
  };

  const handleStatusToggle = (user: UserProfile) => {
    const nextStatus = user.status === 'suspended' ? 'active' : 'suspended';
    const updated: UserProfile = { ...user, status: nextStatus };
    onUpdateUser(updated);
    onSuccess(`[${user.displayName || user.email}] 계정 상태가 [${nextStatus === 'active' ? '정상 활성' : '이용 정지'}](으)로 변경되었습니다.`);
  };

  const handleGradeChange = (user: UserProfile, grade: 'VIP' | '골드' | '실버' | '일반') => {
    const updated: UserProfile = { ...user, grade };
    onUpdateUser(updated);
    onSuccess(`[${user.displayName}] 회원의 등급이 [${grade}](으)로 변경되었습니다.`);
  };

  const handleSavePoints = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pointModalUser) return;
    const currentPoints = pointModalUser.points || 0;
    const nextPoints = Math.max(0, currentPoints + pointDelta);
    const updated: UserProfile = { ...pointModalUser, points: nextPoints };
    onUpdateUser(updated);
    setPointModalUser(null);
    onSuccess(`[${pointModalUser.displayName || pointModalUser.email}] 님에게 포인트 ${pointDelta > 0 ? '+' : ''}${pointDelta.toLocaleString()}P가 지급/조정되었습니다.`);
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;
    const newUser: UserProfile = {
      uid: `usr-${Date.now()}`,
      email: newEmail,
      displayName: newName || newEmail.split('@')[0],
      role: newRole,
      grade: newGrade,
      points: 3000,
      totalSpent: 0,
      orderCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
      status: 'active',
    };
    onAddUser(newUser);
    setIsAddUserOpen(false);
    setNewEmail('');
    setNewName('');
    onSuccess(`새 회원 [${newUser.displayName}] 계정이 등록되었습니다.`);
  };

  // Stats
  const totalUsers = users.length;
  const adminCount = users.filter(u => u.role === 'admin' || u.role === 'manager').length;
  const vipCount = users.filter(u => u.grade === 'VIP' || u.grade === '골드').length;
  const totalUserSpent = users.reduce((acc, u) => acc + (u.totalSpent || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header & Stats Card */}
      <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-neutral-100">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-neutral-900 tracking-tight">회원 & 고객 CRM 관리 센터</h2>
              <span className="text-xs font-bold px-2.5 py-0.5 bg-purple-100 text-purple-900 rounded-full">
                총 {totalUsers}명 등록
              </span>
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              관리자/운영자 권한 승급, 회원 등급 조정, 적립금/포인트 지급 및 고객 상태를 관리합니다.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsAddUserOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>신규 회원 수동 추가</span>
          </button>
        </div>

        {/* 4 KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
          <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200">
            <span className="text-[11px] font-bold text-neutral-500 uppercase">전체 가입 회원</span>
            <div className="text-lg font-black text-neutral-900 mt-1">{totalUsers} 명</div>
          </div>
          <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-200/80">
            <span className="text-[11px] font-bold text-purple-700 uppercase">운영진 (Admin/Manager)</span>
            <div className="text-lg font-black text-purple-950 mt-1">{adminCount} 명</div>
          </div>
          <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/80">
            <span className="text-[11px] font-bold text-amber-700 uppercase">VIP / 우수 고객</span>
            <div className="text-lg font-black text-amber-950 mt-1">{vipCount} 명</div>
          </div>
          <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/80">
            <span className="text-[11px] font-bold text-emerald-700 uppercase">누적 고객 매출 기여</span>
            <div className="text-lg font-black text-emerald-950 mt-1">₩ {totalUserSpent.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {[
            { id: 'all', label: '전체 회원' },
            { id: 'admin', label: '관리자 (Admin)' },
            { id: 'manager', label: '매니저 (Manager)' },
            { id: 'user', label: '일반 회원' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setRoleFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                roleFilter === tab.id
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="이메일, 닉네임 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50/80 border-b border-neutral-200 text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">회원 정보 (이메일/이름)</th>
                <th className="py-3.5 px-4 text-center">권한 승급/역할</th>
                <th className="py-3.5 px-4 text-center">회원 등급</th>
                <th className="py-3.5 px-4 text-right">보유 포인트</th>
                <th className="py-3.5 px-4 text-right">누적 구매실적</th>
                <th className="py-3.5 px-4 text-right">관리 작업</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-xs">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-neutral-400">
                    일치하는 회원 데이터가 없습니다.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isAdmin = u.role === 'admin';
                  const isManager = u.role === 'manager';
                  const isSuspended = u.status === 'suspended';

                  return (
                    <tr key={u.uid} className={`hover:bg-neutral-50/60 transition-colors ${isSuspended ? 'opacity-60 bg-rose-50/30' : ''}`}>
                      {/* User Info */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                            isAdmin ? 'bg-amber-400 text-neutral-950 font-black' : isManager ? 'bg-purple-600 text-white' : 'bg-neutral-200 text-neutral-700'
                          }`}>
                            {(u.displayName || u.email || 'U')[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-neutral-900 flex items-center gap-1.5">
                              <span>{u.displayName || '회원'}</span>
                              {isSuspended && (
                                <span className="text-[10px] px-1.5 py-0.2 bg-rose-100 text-rose-700 font-bold rounded">
                                  이용정지
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-neutral-500 font-mono mt-0.5">{u.email}</div>
                            <div className="text-[10px] text-neutral-400 mt-0.5">가입일: {u.createdAt || '2026-01-01'}</div>
                          </div>
                        </div>
                      </td>

                      {/* Role Toggle */}
                      <td className="py-4 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleRoleToggle(u)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                            isAdmin
                              ? 'bg-amber-400 text-neutral-950 border-amber-500 shadow-2xs'
                              : isManager
                              ? 'bg-purple-100 text-purple-800 border-purple-300'
                              : 'bg-neutral-100 text-neutral-600 border-neutral-300 hover:bg-neutral-200'
                          }`}
                          title="클릭하여 권한 승급 (User → Manager → Admin)"
                        >
                          {isAdmin ? <ShieldCheck className="w-3.5 h-3.5" /> : isManager ? <Award className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                          <span>{isAdmin ? '최고관리자' : isManager ? '부운영자(매니저)' : '일반회원'}</span>
                        </button>
                      </td>

                      {/* Grade Selector */}
                      <td className="py-4 px-4 text-center">
                        <select
                          value={u.grade || '일반'}
                          onChange={(e) => handleGradeChange(u, e.target.value as any)}
                          className="px-2 py-1 text-[11px] font-bold bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-800 cursor-pointer"
                        >
                          <option value="VIP">👑 VIP</option>
                          <option value="골드">🥇 골드</option>
                          <option value="실버">🥈 실버</option>
                          <option value="일반">🥉 일반</option>
                        </select>
                      </td>

                      {/* Points */}
                      <td className="py-4 px-4 text-right">
                        <div className="font-bold text-amber-600 flex items-center justify-end gap-1">
                          <Coins className="w-3.5 h-3.5" />
                          <span>{(u.points || 0).toLocaleString()} P</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setPointModalUser(u)}
                          className="text-[10px] font-semibold text-neutral-500 hover:text-amber-600 underline cursor-pointer mt-0.5"
                        >
                          포인트 지급/차감
                        </button>
                      </td>

                      {/* Spent */}
                      <td className="py-4 px-4 text-right">
                        <div className="font-black text-neutral-900">
                          ₩ {(u.totalSpent || 0).toLocaleString()}
                        </div>
                        <div className="text-[10px] text-neutral-400 mt-0.5">
                          {u.orderCount || 0}회 주문 완료
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleStatusToggle(u)}
                            className={`p-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                              isSuspended
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                                : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                            }`}
                            title={isSuspended ? '계정 정지 해제' : '계정 이용 정지'}
                          >
                            {isSuspended ? <UserCheck className="w-3.5 h-3.5" /> : <UserX className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Point Adjustment Modal */}
      {pointModalUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-neutral-200 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-amber-500" />
                <h3 className="text-sm font-bold text-neutral-900">적립금(포인트) 수동 지급</h3>
              </div>
              <button
                type="button"
                onClick={() => setPointModalUser(null)}
                className="text-neutral-400 hover:text-neutral-700 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePoints} className="mt-4 space-y-3 text-xs">
              <div className="bg-neutral-50 p-3 rounded-xl">
                <span className="text-neutral-500 block">대상 고객</span>
                <span className="font-bold text-neutral-900 text-sm">{pointModalUser.displayName} ({pointModalUser.email})</span>
                <span className="text-amber-600 block mt-1">현재 보유: {(pointModalUser.points || 0).toLocaleString()} P</span>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">지급/차감 포인트 (음수 입력 시 차감)</label>
                <input
                  type="number"
                  required
                  step={1000}
                  value={pointDelta}
                  onChange={(e) => setPointDelta(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl font-bold font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">지급 사유 메모</label>
                <input
                  type="text"
                  value={pointMemo}
                  onChange={(e) => setPointMemo(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPointModalUser(null)}
                  className="flex-1 py-2.5 bg-neutral-100 text-neutral-700 font-bold rounded-xl"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-xl shadow-xs"
                >
                  포인트 적용
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-neutral-200 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" />
                <h3 className="text-sm font-bold text-neutral-900">신규 회원 수동 등록</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddUserOpen(false)}
                className="text-neutral-400 hover:text-neutral-700 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-neutral-700 mb-1">이메일 주소</label>
                <input
                  type="email"
                  required
                  placeholder="user@example.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">고객명 / 닉네임</label>
                <input
                  type="text"
                  placeholder="홍길동"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">초기 권한</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as any)}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl font-bold"
                  >
                    <option value="user">일반회원</option>
                    <option value="manager">부운영자(매니저)</option>
                    <option value="admin">최고관리자</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">회원 등급</label>
                  <select
                    value={newGrade}
                    onChange={(e) => setNewGrade(e.target.value as any)}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl font-bold"
                  >
                    <option value="일반">일반</option>
                    <option value="실버">실버</option>
                    <option value="골드">골드</option>
                    <option value="VIP">VIP</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  className="flex-1 py-2.5 bg-neutral-100 text-neutral-700 font-bold rounded-xl"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white font-bold rounded-xl shadow-xs"
                >
                  회원 등록 완료
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
