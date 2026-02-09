
export type Dimension = 'MONEY' | 'LIFE' | 'PERSONALITY';

export interface Option {
  id: 'A' | 'B' | 'C' | 'D';
  text: string;
}

export interface Question {
  id: number;
  dimension: Dimension;
  text: string;
  options: Option[];
}

export interface QuizResults {
  visualization: {
    money: { type1: string, type2: string, ratio1: number, ratio2: number };
    life: { type1: string, type2: string, ratio1: number, ratio2: number };
    personality: { type1: string, type2: string, ratio1: number, ratio2: number };
    summary: string;
    shareSummary: string;
  };
  analysis: {
    module1: { label: string, content: string };
    module2: { suggestions: string[] };
    module3: { tips: string[] };
    module4: { warnings: string[] };
  };
  shareCopy: {
    meme: string;
    literary: string;
    simple: string;
  };
}

export type AppStep = 'HOME' | 'QUIZ' | 'PAYMENT' | 'LOADING' | 'RESULT';

// 测评记录类型（用于后端存储和管理后台）
export interface TestRecord {
  id: string;                      // 记录ID: "REC20260208123456ABC"
  visitorId: string;               // 访客ID
  answers: Record<number, string>; // 用户答案 {1: "A", 2: "B", ...}

  // 基础结果（三维度）
  moneyType: string;               // 搞钱类型：成长型/享受型/稳健型
  lifeType: string;                // 生活类型：松弛型/平衡型/社交型
  personalityType: string;         // 性格类型：果断型/谨慎型/犹豫型
  summary: string;                 // 总结语

  // AI 报告
  aiReport?: string;               // AI 生成的完整报告
  suggestions?: string[];          // 搞钱建议
  tips?: string[];                 // 生活技巧
  warnings?: string[];             // 风险预警
  shareCopy?: {                    // 分享文案
    meme: string;
    literary: string;
    simple: string;
  };

  // 支付状态
  paid: boolean;                   // 是否已付费
  paidAt?: string;                 // 付费时间
  paidAmount?: number;             // 付费金额

  // 元数据
  createdAt: string;               // 创建时间
  userAgent?: string;              // 浏览器信息
  ip?: string;                     // IP 地址
}

// 管理后台统计数据
export interface AdminStats {
  totalTests: number;              // 总测评数
  paidCount: number;               // 付费数
  paidRate: number;                // 付费率
  todayTests: number;              // 今日测评数
  todayPaid: number;               // 今日付费数
  typeDistribution: {              // 类型分布
    money: Record<string, number>;
    life: Record<string, number>;
    personality: Record<string, number>;
  };
}
