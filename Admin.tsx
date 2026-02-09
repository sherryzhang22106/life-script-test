
import React, { useState, useEffect, useCallback } from 'react';
import { TestRecord, AdminStats } from './types';
import { getAdminStats, getRecordsList } from './services/recordsService';

// 统计卡片组件
const StatCard = ({ title, value, subtitle, color, icon }: {
  title: string;
  value: string | number;
  subtitle?: string;
  color: string;
  icon: string;
}) => (
  <div className={`${color} border-2 border-stone-800 p-4 shadow-[3px_3px_0_0_#292524]`}>
    <div className="flex items-start justify-between">
      <div>
        <div className="text-[10px] font-black uppercase tracking-wider opacity-70 mb-1">{title}</div>
        <div className="text-3xl font-black italic">{value}</div>
        {subtitle && <div className="text-xs font-bold mt-1 opacity-60">{subtitle}</div>}
      </div>
      <div className="text-3xl">{icon}</div>
    </div>
  </div>
);

// 类型分布图
const TypeDistribution = ({ title, icon, data, colorMap }: {
  title: string;
  icon: string;
  data: Record<string, number>;
  colorMap: Record<string, string>;
}) => {
  const entries = Object.entries(data);
  const maxCount = Math.max(...entries.map(([, count]) => count), 1);
  const total = entries.reduce((sum, [, count]) => sum + count, 0);

  return (
    <div className="bg-white border-2 border-stone-800 p-4 shadow-[3px_3px_0_0_#292524]">
      <h3 className="text-sm font-black italic uppercase tracking-tighter mb-4 border-b-2 border-stone-800 pb-2">
        {icon} {title}
      </h3>
      <div className="space-y-2">
        {entries.length === 0 ? (
          <div className="text-center py-4 text-gray-400 text-sm">暂无数据</div>
        ) : (
          entries.map(([type, count]) => (
            <div key={type} className="flex items-center gap-2">
              <div className={`px-2 py-1 ${colorMap[type] || 'bg-stone-200'} text-white text-[10px] font-black min-w-[60px] text-center`}>
                {type}
              </div>
              <div className="flex-1">
                <div className="h-5 bg-gray-100 border border-stone-800 relative">
                  <div
                    className={`h-full transition-all duration-500 ${colorMap[type] || 'bg-stone-400'}`}
                    style={{ width: `${(count / maxCount) * 100}%` }}
                  />
                  <span className="absolute right-1 top-0 text-[9px] font-black leading-5">
                    {count}人 ({total > 0 ? Math.round((count / total) * 100) : 0}%)
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// 收入统计
const RevenueStats = ({ stats }: { stats: AdminStats | null }) => {
  const paidCount = stats?.paidCount || 0;
  const totalRevenue = paidCount * 3.9;
  const totalTests = stats?.totalTests || 0;
  const conversionRate = totalTests > 0 ? ((paidCount / totalTests) * 100).toFixed(1) : '0';

  return (
    <div className="bg-white border-2 border-stone-800 p-4 shadow-[3px_3px_0_0_#292524]">
      <h3 className="text-sm font-black italic uppercase tracking-tighter mb-4 border-b-2 border-stone-800 pb-2">
        💰 收入统计
      </h3>
      <div className="space-y-3">
        <div className="flex justify-between items-center p-2 bg-orange-50">
          <span className="text-xs font-bold">付费报告 ({paidCount}份)</span>
          <span className="font-black italic">¥{totalRevenue.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center p-3 bg-[#E66112] text-white">
          <span className="text-xs font-black">总收入</span>
          <span className="text-xl font-black italic">¥{totalRevenue.toFixed(2)}</span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="text-[10px] font-bold text-gray-500 mb-2">转化率分析</div>
        <div className="grid grid-cols-2 gap-2">
          <div className="text-center p-2 bg-gray-50 border border-gray-200">
            <div className="text-lg font-black italic text-[#E66112]">
              {conversionRate}%
            </div>
            <div className="text-[9px] font-bold text-gray-400">付费转化率</div>
          </div>
          <div className="text-center p-2 bg-gray-50 border border-gray-200">
            <div className="text-lg font-black italic text-[#E66112]">
              ¥3.9
            </div>
            <div className="text-[9px] font-bold text-gray-400">单价</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 测评记录表格
const RecordsTable = ({
  records,
  pagination,
  onPageChange,
}: {
  records: TestRecord[];
  pagination: { page: number; totalPages: number; total: number } | null;
  onPageChange: (page: number) => void;
}) => {
  const currentPage = pagination?.page || 1;
  const totalPages = pagination?.totalPages || 1;
  const total = pagination?.total || records.length;

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      '成长型': 'bg-[#E66112]',
      '享受型': 'bg-[#F9A03F]',
      '稳健型': 'bg-stone-600',
      '松弛型': 'bg-green-500',
      '平衡型': 'bg-blue-500',
      '社交型': 'bg-purple-500',
      '果断型': 'bg-red-500',
      '谨慎型': 'bg-yellow-600',
      '犹豫型': 'bg-gray-500',
    };
    return colors[type] || 'bg-stone-400';
  };

  return (
    <div className="bg-white border-2 border-stone-800 shadow-[3px_3px_0_0_#292524] overflow-hidden">
      <div className="p-4 border-b-2 border-stone-800 bg-orange-50 flex items-center justify-between">
        <h3 className="text-sm font-black italic uppercase tracking-tighter">
          📋 测评记录明细
        </h3>
        <span className="text-[10px] font-bold text-gray-500">
          共 {total} 条记录
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-stone-800 text-white">
            <tr>
              <th className="p-2 text-left font-black">测评编号</th>
              <th className="p-2 text-left font-black">测评时间</th>
              <th className="p-2 text-center font-black">搞钱类型</th>
              <th className="p-2 text-center font-black">生活类型</th>
              <th className="p-2 text-center font-black">性格类型</th>
              <th className="p-2 text-center font-black">付费状态</th>
              <th className="p-2 text-left font-black">来源</th>
            </tr>
          </thead>
          <tbody>
            {records.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-400">
                  暂无测评记录
                </td>
              </tr>
            ) : (
              records.map((record, idx) => (
                <tr key={record.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="p-2 font-mono font-bold text-[10px]">{record.id}</td>
                  <td className="p-2 text-gray-600">
                    {new Date(record.createdAt).toLocaleString('zh-CN', {
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>
                  <td className="p-2 text-center">
                    <span className={`px-2 py-0.5 text-[9px] font-black text-white ${getTypeColor(record.moneyType)}`}>
                      {record.moneyType || '-'}
                    </span>
                  </td>
                  <td className="p-2 text-center">
                    <span className={`px-2 py-0.5 text-[9px] font-black text-white ${getTypeColor(record.lifeType)}`}>
                      {record.lifeType || '-'}
                    </span>
                  </td>
                  <td className="p-2 text-center">
                    <span className={`px-2 py-0.5 text-[9px] font-black text-white ${getTypeColor(record.personalityType)}`}>
                      {record.personalityType || '-'}
                    </span>
                  </td>
                  <td className="p-2 text-center">
                    {record.paid ? (
                      <span className="text-green-500 font-black">✓ 已付费</span>
                    ) : (
                      <span className="text-gray-300">未付费</span>
                    )}
                  </td>
                  <td className="p-2 text-[9px] text-gray-500 max-w-[100px] truncate">
                    {record.userAgent?.includes('WeChat') ? '微信' :
                     record.userAgent?.includes('Mobile') ? '手机浏览器' : '电脑浏览器'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 分页 */}
      <div className="p-3 border-t-2 border-stone-800 bg-orange-50 flex items-center justify-between">
        <span className="text-[10px] font-bold text-gray-500">
          第 {currentPage} 页，共 {totalPages} 页
        </span>
        <div className="flex gap-1">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-2 py-1 text-[10px] font-black border border-stone-800 bg-white disabled:opacity-30"
          >
            上一页
          </button>
          <span className="px-3 py-1 text-[10px] font-black bg-stone-800 text-white">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-2 py-1 text-[10px] font-black border border-stone-800 bg-white disabled:opacity-30"
          >
            下一页
          </button>
        </div>
      </div>
    </div>
  );
};

// 登录组件
const LoginForm = ({ onLogin }: { onLogin: () => void }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    setTimeout(() => {
      if (username === 'admin' && password === 'shark0702') {
        sessionStorage.setItem('admin_logged_in', 'true');
        sessionStorage.setItem('admin_login_time', Date.now().toString());
        onLogin();
      } else {
        setError('账号或密码错误');
      }
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="bg-white border-4 border-stone-800 shadow-[6px_6px_0_0_#292524] p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#E66112] mx-auto flex items-center justify-center font-black italic text-3xl text-white border-4 border-stone-800 mb-4 rounded-2xl">
              <i className="fa-solid fa-compass-rose"></i>
            </div>
            <h1 className="text-lg font-black italic uppercase tracking-tighter">人生主线剧本测评</h1>
            <p className="text-[10px] font-bold text-gray-400 mt-1">管理后台登录</p>
          </div>

          {/* 登录表单 */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider mb-2">
                账号
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border-2 border-stone-800 font-bold text-sm focus:outline-none focus:border-[#E66112] transition"
                placeholder="请输入账号"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider mb-2">
                密码
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border-2 border-stone-800 font-bold text-sm focus:outline-none focus:border-[#E66112] transition"
                placeholder="请输入密码"
                required
              />
            </div>

            {error && (
              <div className="bg-red-500 text-white text-xs font-bold p-3 text-center">
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-[#E66112] text-white font-black italic uppercase tracking-wider hover:bg-[#CF550F] transition disabled:opacity-50"
            >
              {isLoading ? '登录中...' : '登录'}
            </button>
          </form>

          <p className="text-center text-[9px] text-gray-400 mt-6">
            © 2026 人生主线剧本测评 · 管理系统
          </p>
        </div>
      </div>
    </div>
  );
};

// 主管理后台组件
export default function Admin() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [records, setRecords] = useState<TestRecord[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [pagination, setPagination] = useState<{ page: number; totalPages: number; total: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // 检查登录状态
  useEffect(() => {
    const loggedIn = sessionStorage.getItem('admin_logged_in');
    const loginTime = sessionStorage.getItem('admin_login_time');

    if (loggedIn === 'true' && loginTime) {
      const elapsed = Date.now() - parseInt(loginTime);
      const twentyFourHours = 24 * 60 * 60 * 1000;
      if (elapsed < twentyFourHours) {
        setIsLoggedIn(true);
      } else {
        sessionStorage.removeItem('admin_logged_in');
        sessionStorage.removeItem('admin_login_time');
      }
    }
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_logged_in');
    sessionStorage.removeItem('admin_login_time');
    setIsLoggedIn(false);
  };

  // 加载数据
  const loadData = useCallback(async (page: number = 1) => {
    setIsLoading(true);
    setError(null);

    try {
      const [statsResult, recordsResult] = await Promise.all([
        getAdminStats(),
        getRecordsList(page, 20)
      ]);

      if (statsResult) {
        setStats(statsResult);
      }

      if (recordsResult) {
        setRecords(recordsResult.records);
        setPagination(recordsResult.pagination);
      }
    } catch (err: any) {
      console.error('加载数据失败:', err);
      setError(err.message || '加载数据失败');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      loadData(currentPage);
    }
  }, [currentPage, loadData, isLoggedIn]);

  // 如果未登录，显示登录页面
  if (!isLoggedIn) {
    return <LoginForm onLogin={handleLogin} />;
  }

  const handleRefresh = () => {
    loadData(currentPage);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (isLoading && records.length === 0) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-bounce">📊</div>
          <div className="text-sm font-black italic uppercase tracking-widest">加载数据中...</div>
        </div>
      </div>
    );
  }

  // 类型颜色映射
  const moneyColorMap: Record<string, string> = {
    '成长型': 'bg-[#E66112]',
    '享受型': 'bg-[#F9A03F]',
    '稳健型': 'bg-stone-600',
  };

  const lifeColorMap: Record<string, string> = {
    '松弛型': 'bg-green-500',
    '平衡型': 'bg-blue-500',
    '社交型': 'bg-purple-500',
  };

  const personalityColorMap: Record<string, string> = {
    '果断型': 'bg-red-500',
    '谨慎型': 'bg-yellow-600',
    '犹豫型': 'bg-gray-500',
  };

  const wechatCount = records.filter(r => r.userAgent?.includes('WeChat')).length;

  return (
    <div className="min-h-screen bg-orange-50">
      {/* 顶部导航 */}
      <header className="bg-stone-800 text-white p-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#E66112] flex items-center justify-center font-black italic text-xl border-2 border-white rounded-xl">
              <i className="fa-solid fa-compass-rose text-sm"></i>
            </div>
            <div>
              <h1 className="text-sm font-black italic uppercase tracking-tighter">人生主线剧本测评</h1>
              <p className="text-[9px] opacity-60 font-bold">管理后台 V2026</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${error ? 'bg-red-500' : 'bg-green-500'} animate-pulse`} />
              <span className="text-[10px] font-bold opacity-70">
                {error ? '连接异常' : '系统运行中'}
              </span>
            </div>
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="px-3 py-1 bg-white/10 text-[10px] font-black uppercase hover:bg-white/20 transition disabled:opacity-50"
            >
              {isLoading ? '刷新中...' : '刷新数据'}
            </button>
            <button
              onClick={handleLogout}
              className="px-3 py-1 bg-[#E66112] text-[10px] font-black uppercase hover:bg-[#CF550F] transition"
            >
              退出登录
            </button>
          </div>
        </div>
      </header>

      {/* 错误提示 */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 pt-4">
          <div className="bg-red-500 text-white p-3 border-2 border-stone-800 text-sm font-bold">
            ⚠️ {error}
            <span className="ml-2 text-[10px] opacity-70">
              (请检查 Upstash Redis 配置是否正确)
            </span>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto p-4 space-y-6">
        {/* 统计卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            title="今日测评人数"
            value={stats?.todayTests || 0}
            subtitle={`总计 ${stats?.totalTests || 0} 人`}
            color="bg-white"
            icon="📊"
          />
          <StatCard
            title="付费人数"
            value={stats?.paidCount || 0}
            subtitle={`转化率 ${stats?.paidRate || 0}%`}
            color="bg-[#E66112] text-white"
            icon="💰"
          />
          <StatCard
            title="今日付费"
            value={stats?.todayPaid || 0}
            subtitle="今日新增付费"
            color="bg-green-500 text-white"
            icon="✨"
          />
          <StatCard
            title="微信端占比"
            value={records.length > 0 ? `${Math.round((wechatCount / records.length) * 100)}%` : '-'}
            subtitle={`${wechatCount}/${records.length} 人`}
            color="bg-stone-800 text-white"
            icon="📱"
          />
        </div>

        {/* 图表区域 */}
        <div className="grid md:grid-cols-3 gap-4">
          <TypeDistribution
            title="搞钱类型分布"
            icon="💰"
            data={stats?.typeDistribution?.money || {}}
            colorMap={moneyColorMap}
          />
          <TypeDistribution
            title="生活类型分布"
            icon="🏠"
            data={stats?.typeDistribution?.life || {}}
            colorMap={lifeColorMap}
          />
          <TypeDistribution
            title="性格类型分布"
            icon="🎭"
            data={stats?.typeDistribution?.personality || {}}
            colorMap={personalityColorMap}
          />
        </div>

        {/* 收入统计 */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <RecordsTable
              records={records}
              pagination={pagination}
              onPageChange={handlePageChange}
            />
          </div>
          <RevenueStats stats={stats} />
        </div>

        {/* 底部信息 */}
        <div className="text-center py-6 opacity-50">
          <p className="text-[10px] font-black uppercase tracking-widest">
            人生主线剧本测评 · 管理后台 · 2026 Edition
          </p>
          <p className="text-[9px] mt-1">
            数据存储: Upstash Redis | AI: DeepSeek
          </p>
        </div>
      </main>
    </div>
  );
}
