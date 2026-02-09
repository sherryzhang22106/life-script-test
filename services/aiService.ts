import { QuizResults } from "../types";

const API_BASE = import.meta.env.PROD ? '' : 'http://localhost:3000';

interface BasicResults {
  moneyType: string;
  lifeType: string;
  personalityType: string;
  summary: string;
}

export const generateAIAnalysisStream = async (
  answers: Record<number, string>,
  basicResults: BasicResults,
  onChunk: (text: string) => void,
  onComplete: (fullResult: Partial<QuizResults>) => void
): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE}/api/ai`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ answers, basicResults }),
    });

    if (!response.ok) {
      throw new Error('AI 服务请求失败');
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('无法读取响应');
    }

    const decoder = new TextDecoder();
    let fullText = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            // 解析完整结果
            onComplete(parseFormattedResult(fullText));
            return;
          }
          try {
            const parsed = JSON.parse(data);
            if (parsed.content) {
              fullText += parsed.content;
              onChunk(fullText);
            }
          } catch (e) {
            // 忽略解析错误
          }
        }
      }
    }

    // 如果没有收到 [DONE]，也尝试解析
    onComplete(parseFormattedResult(fullText));

  } catch (error) {
    console.error('AI 生成失败:', error);
    onChunk('生成失败，请检查网络或刷新重试。');
  }
};

const parseFormattedResult = (text: string): Partial<QuizResults> => {
  const getSection = (start: string, end?: string) => {
    const idx = text.indexOf(start);
    if (idx === -1) return "";
    const rest = text.slice(idx + start.length);
    if (!end) return rest.trim();
    const endIdx = rest.indexOf(end);
    return endIdx === -1 ? rest.trim() : rest.slice(0, endIdx).trim();
  };

  return {
    analysis: {
      module1: { label: "AI 私人定制剧本", content: getSection("[CONTENT_START]", "[SUGGESTIONS]") },
      module2: { suggestions: getSection("[SUGGESTIONS]", "[TIPS]").split('|').filter(s => s.trim()) },
      module3: { tips: getSection("[TIPS]", "[WARNINGS]").split('|').filter(s => s.trim()) },
      module4: { warnings: getSection("[WARNINGS]", "[COPY_MEME]").split('|').filter(s => s.trim()) },
    },
    shareCopy: {
      meme: getSection("[COPY_MEME]", "[COPY_LITERARY]"),
      literary: getSection("[COPY_LITERARY]", "[COPY_SIMPLE]"),
      simple: getSection("[COPY_SIMPLE]"),
    }
  };
};
