import { TestRecord, AdminStats } from "../types";

const API_BASE = import.meta.env.PROD ? '' : 'http://localhost:3000';

// 生成访客ID（基于浏览器指纹）
export const getVisitorId = (): string => {
  const stored = localStorage.getItem('visitorId');
  if (stored) return stored;

  const id = 'V' + Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
  localStorage.setItem('visitorId', id);
  return id;
};

// 保存测评记录
export const saveTestRecord = async (data: {
  answers: Record<number, string>;
  moneyType: string;
  lifeType: string;
  personalityType: string;
  summary: string;
}): Promise<{ success: boolean; recordId?: string; error?: string }> => {
  try {
    const response = await fetch(`${API_BASE}/api/records`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        visitorId: getVisitorId(),
        userAgent: navigator.userAgent,
        ...data,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || '保存失败');
    }

    const result = await response.json();
    // 存储当前记录ID
    if (result.recordId) {
      localStorage.setItem('currentRecordId', result.recordId);
    }
    return { success: true, recordId: result.recordId };
  } catch (error: any) {
    console.error('保存测评记录失败:', error);
    return { success: false, error: error.message };
  }
};

// 更新支付状态
export const updatePaymentStatus = async (
  recordId: string,
  paid: boolean,
  paidAmount?: number
): Promise<{ success: boolean; error?: string }> => {
  try {
    const response = await fetch(`${API_BASE}/api/records`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recordId, paid, paidAmount }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || '更新失败');
    }

    return { success: true };
  } catch (error: any) {
    console.error('更新支付状态失败:', error);
    return { success: false, error: error.message };
  }
};

// 更新 AI 报告
export const updateAIReport = async (
  recordId: string,
  data: {
    aiReport?: string;
    suggestions?: string[];
    tips?: string[];
    warnings?: string[];
    shareCopy?: { meme: string; literary: string; simple: string };
  }
): Promise<{ success: boolean; error?: string }> => {
  try {
    const response = await fetch(`${API_BASE}/api/records`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recordId, ...data }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || '更新失败');
    }

    return { success: true };
  } catch (error: any) {
    console.error('更新AI报告失败:', error);
    return { success: false, error: error.message };
  }
};

// 获取当前记录ID
export const getCurrentRecordId = (): string | null => {
  return localStorage.getItem('currentRecordId');
};

// ============ 管理后台 API ============

// 获取统计数据
export const getAdminStats = async (): Promise<AdminStats | null> => {
  try {
    const response = await fetch(`${API_BASE}/api/records?action=stats`);
    if (!response.ok) throw new Error('获取统计失败');
    return await response.json();
  } catch (error) {
    console.error('获取统计数据失败:', error);
    return null;
  }
};

// 获取记录列表
export const getRecordsList = async (
  page: number = 1,
  limit: number = 20
): Promise<{ records: TestRecord[]; pagination: any } | null> => {
  try {
    const response = await fetch(`${API_BASE}/api/records?page=${page}&limit=${limit}`);
    if (!response.ok) throw new Error('获取记录失败');
    return await response.json();
  } catch (error) {
    console.error('获取记录列表失败:', error);
    return null;
  }
};

// 获取单条记录
export const getRecordById = async (recordId: string): Promise<TestRecord | null> => {
  try {
    const response = await fetch(`${API_BASE}/api/records?action=get&recordId=${recordId}`);
    if (!response.ok) throw new Error('获取记录失败');
    const data = await response.json();
    return data.record;
  } catch (error) {
    console.error('获取记录详情失败:', error);
    return null;
  }
};
