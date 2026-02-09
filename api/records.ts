import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Redis } from '@upstash/redis';

// 初始化 Redis 客户端
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

// 生成记录ID
const generateRecordId = () => {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `REC${timestamp}${random}`;
};

// 获取今天的日期字符串
const getTodayKey = () => {
  const now = new Date();
  return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS 设置
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 检查 Redis 配置
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return res.status(500).json({ error: '数据库未配置' });
  }

  try {
    // POST: 创建新记录
    if (req.method === 'POST') {
      const { visitorId, answers, moneyType, lifeType, personalityType, summary, userAgent } = req.body;

      if (!visitorId || !answers) {
        return res.status(400).json({ error: '缺少必要参数' });
      }

      const recordId = generateRecordId();
      const now = new Date().toISOString();
      const todayKey = getTodayKey();

      const record = {
        id: recordId,
        visitorId,
        answers: JSON.stringify(answers),
        moneyType: moneyType || '',
        lifeType: lifeType || '',
        personalityType: personalityType || '',
        summary: summary || '',
        paid: false,
        createdAt: now,
        userAgent: userAgent || '',
        ip: (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket?.remoteAddress || '',
      };

      // 存储记录
      await redis.hset(`record:${recordId}`, record);

      // 添加到全局记录列表（按时间排序）
      await redis.zadd('records:all', { score: Date.now(), member: recordId });

      // 添加到访客记录列表
      await redis.sadd(`visitor:${visitorId}:records`, recordId);

      // 更新统计
      await redis.incr('stats:total_tests');
      await redis.incr(`stats:daily:${todayKey}:tests`);

      // 更新类型分布
      if (moneyType) await redis.hincrby('stats:type_distribution:money', moneyType, 1);
      if (lifeType) await redis.hincrby('stats:type_distribution:life', lifeType, 1);
      if (personalityType) await redis.hincrby('stats:type_distribution:personality', personalityType, 1);

      return res.status(201).json({ success: true, recordId, record: { ...record, answers } });
    }

    // PUT: 更新记录（支付状态、AI报告等）
    if (req.method === 'PUT') {
      const { recordId, paid, paidAmount, aiReport, suggestions, tips, warnings, shareCopy } = req.body;

      if (!recordId) {
        return res.status(400).json({ error: '缺少记录ID' });
      }

      const exists = await redis.exists(`record:${recordId}`);
      if (!exists) {
        return res.status(404).json({ error: '记录不存在' });
      }

      const updates: Record<string, any> = {};
      const todayKey = getTodayKey();

      if (paid !== undefined) {
        updates.paid = paid;
        if (paid) {
          updates.paidAt = new Date().toISOString();
          if (paidAmount) updates.paidAmount = paidAmount;
          // 更新付费统计
          await redis.incr('stats:paid_count');
          await redis.incr(`stats:daily:${todayKey}:paid`);
        }
      }

      if (aiReport) updates.aiReport = aiReport;
      if (suggestions) updates.suggestions = JSON.stringify(suggestions);
      if (tips) updates.tips = JSON.stringify(tips);
      if (warnings) updates.warnings = JSON.stringify(warnings);
      if (shareCopy) updates.shareCopy = JSON.stringify(shareCopy);

      if (Object.keys(updates).length > 0) {
        await redis.hset(`record:${recordId}`, updates);
      }

      return res.status(200).json({ success: true, recordId, updates });
    }

    // GET: 获取记录列表（管理后台用）
    if (req.method === 'GET') {
      const { action, recordId, page = '1', limit = '20' } = req.query;

      // 获取单条记录
      if (action === 'get' && recordId) {
        const record = await redis.hgetall(`record:${recordId}`);
        if (!record || Object.keys(record).length === 0) {
          return res.status(404).json({ error: '记录不存在' });
        }
        // 解析 JSON 字段
        if (record.answers && typeof record.answers === 'string') {
          record.answers = JSON.parse(record.answers);
        }
        if (record.suggestions && typeof record.suggestions === 'string') {
          record.suggestions = JSON.parse(record.suggestions);
        }
        if (record.tips && typeof record.tips === 'string') {
          record.tips = JSON.parse(record.tips);
        }
        if (record.warnings && typeof record.warnings === 'string') {
          record.warnings = JSON.parse(record.warnings);
        }
        if (record.shareCopy && typeof record.shareCopy === 'string') {
          record.shareCopy = JSON.parse(record.shareCopy);
        }
        return res.status(200).json({ record });
      }

      // 获取统计数据
      if (action === 'stats') {
        const todayKey = getTodayKey();
        const [totalTests, paidCount, todayTests, todayPaid, moneyDist, lifeDist, personalityDist] = await Promise.all([
          redis.get('stats:total_tests'),
          redis.get('stats:paid_count'),
          redis.get(`stats:daily:${todayKey}:tests`),
          redis.get(`stats:daily:${todayKey}:paid`),
          redis.hgetall('stats:type_distribution:money'),
          redis.hgetall('stats:type_distribution:life'),
          redis.hgetall('stats:type_distribution:personality'),
        ]);

        const total = Number(totalTests) || 0;
        const paid = Number(paidCount) || 0;

        return res.status(200).json({
          totalTests: total,
          paidCount: paid,
          paidRate: total > 0 ? (paid / total * 100).toFixed(1) : '0',
          todayTests: Number(todayTests) || 0,
          todayPaid: Number(todayPaid) || 0,
          typeDistribution: {
            money: moneyDist || {},
            life: lifeDist || {},
            personality: personalityDist || {},
          },
        });
      }

      // 获取记录列表
      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
      const start = (pageNum - 1) * limitNum;
      const end = start + limitNum - 1;

      // 获取记录ID列表（按时间倒序）
      const recordIds = await redis.zrange('records:all', start, end, { rev: true });
      const total = await redis.zcard('records:all');

      // 获取记录详情
      const records = await Promise.all(
        recordIds.map(async (id) => {
          const record = await redis.hgetall(`record:${id}`);
          if (record.answers && typeof record.answers === 'string') {
            try { record.answers = JSON.parse(record.answers); } catch {}
          }
          return record;
        })
      );

      return res.status(200).json({
        records: records.filter(r => r && Object.keys(r).length > 0),
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(Number(total) / limitNum),
        },
      });
    }

    return res.status(405).json({ error: '不支持的请求方法' });

  } catch (error: any) {
    console.error('Records API 错误:', error);
    return res.status(500).json({ error: error.message || '服务器错误' });
  }
}
