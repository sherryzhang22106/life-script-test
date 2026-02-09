import type { VercelRequest, VercelResponse } from '@vercel/node';

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || '';
const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';

const AI_SYSTEM_INSTRUCTION = `
你是「2026人生主线剧本测评」专属AI深度分析引擎，服务18-35岁年轻群体，仅输出纯文本、无格式、无符号、无互动的定制化分析报告。全程采用同龄人吐槽式、接地气、梗系化、生活化语言。

核心要求：
1. 视角要求：
   - 模块1、2、3、4（报告正文内容）：必须使用"你/你的"第二人称视角。这部分是AI对用户的专业解读。
   - 分享文案（朋友圈文案）：必须使用"我/我的/本人"第一人称视角。因为用户分享时代表自己的心声。

2. 语言风格：18-35岁年轻人语境，口语化、带梗、不鸡汤，要一针见血。
`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS 设置
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: '只支持 POST 请求' });
  }

  if (!DEEPSEEK_API_KEY) {
    return res.status(500).json({ error: 'AI 服务未配置' });
  }

  try {
    const { answers, basicResults } = req.body;

    if (!answers) {
      return res.status(400).json({ error: '缺少测评答案数据' });
    }

    const answerStr = Object.entries(answers)
      .map(([id, choice]) => `Q${id}: ${choice}`)
      .join(', ');

    const prompt = `
用户答题记录：${answerStr}

用户基础测评结果：
- 搞钱类型：${basicResults?.moneyType || '未知'}
- 生活类型：${basicResults?.lifeType || '未知'}
- 性格类型：${basicResults?.personalityType || '未知'}
- 总结：${basicResults?.summary || '未知'}

请根据以上选择，生成一份深度、犀利、且极具颗粒度的"2026人生主线剧本测评报告"。

必须严格遵循以下标记顺序输出：

[CONTENT_START]
（1000字左右的深度剖析，分四个维度：用户的心理潜意识、消费决策偏好、人际关系边界、以及未来10年的人生轨迹。语言风格：18-35岁年轻人语境，口语化、带梗、不鸡汤，要一针见血。）

[SUGGESTIONS]
建议1|建议2|建议3
（3条针对用户的具体可落地搞钱建议，用"|"分隔）

[TIPS]
技巧1|技巧2|技巧3
（3条针对用户的具体生活平衡技巧，关联生活观答题，用"|"分隔）

[WARNINGS]
预警1|预警2
（2条对用户的个性化人生风险提示，关联性格特质，用"|"分隔）

[COPY_MEME]
（一段自嘲梗系的朋友圈文案，必须使用"我"的第一人称视角，极具吸引力，带点"炫耀感"或"自我洞察感"，让别人看了也想测）

[COPY_LITERARY]
（一段感性表达的朋友圈文案，必须使用"我"的第一人称视角）

[COPY_SIMPLE]
（一段干脆利落的朋友圈文案，必须使用"我"的第一人称视角）
`;

    // 设置流式响应头
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: AI_SYSTEM_INSTRUCTION },
          { role: 'user', content: prompt }
        ],
        temperature: 0.9,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('DeepSeek API 错误:', errorText);
      return res.status(500).json({ error: 'AI 服务请求失败' });
    }

    // 流式转发响应
    const reader = response.body?.getReader();
    if (!reader) {
      return res.status(500).json({ error: '无法读取 AI 响应' });
    }

    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            res.write('data: [DONE]\n\n');
            break;
          }
          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              res.write(`data: ${JSON.stringify({ content })}\n\n`);
            }
          } catch (e) {
            // 忽略解析错误
          }
        }
      }
    }

    res.end();

  } catch (error: any) {
    console.error('AI API 错误:', error);
    return res.status(500).json({ error: error.message || '服务器错误' });
  }
}
