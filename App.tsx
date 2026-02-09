
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { AppStep, QuizResults } from './types';
import { QUESTIONS } from './constants';
import { generateAIAnalysisStream } from './services/aiService';
import { saveTestRecord, updatePaymentStatus, updateAIReport, getCurrentRecordId } from './services/recordsService';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, LabelList } from 'recharts';

// --- Utilities ---

const stripMarkdown = (text: string) => {
  if (!text) return "";
  // Remove bold (**) and headers (#) commonly returned by LLMs
  return text.replace(/\*\*/g, '').replace(/#/g, '').replace(/__+/g, '').trim();
};

const calculateBasicResults = (answers: Record<number, string>) => {
  const getCounts = (range: number[]) => {
    const counts = { A: 0, B: 0, C: 0, D: 0 };
    range.forEach(id => {
      const choice = answers[id] as keyof typeof counts;
      if (choice) counts[choice]++;
    });
    return counts;
  };

  const money = getCounts([1, 2, 3, 4, 5, 6, 7, 8]);
  const life = getCounts([9, 10, 11, 12, 13, 14, 15, 16, 17]);
  const personality = getCounts([18, 19, 20, 21, 22, 23, 24, 25]);

  const moneyType = (money.A + money.D > money.B && money.A + money.D > money.C) ? '成长型' : (money.B > money.C ? '享受型' : '稳健型');
  const lifeType = (life.A > life.B && life.A > life.C) ? '松弛型' : (life.B > life.C ? '平衡型' : '社交型');
  const personalityType = (personality.A > personality.B) ? '果断型' : (personality.B > personality.C ? '谨慎型' : '犹豫型');

  return {
    moneyType,
    lifeType,
    personalityType,
    visualization: {
      money: { type1: moneyType, type2: '搞钱维度', ratio1: 33.3, ratio2: 0 },
      life: { type1: lifeType, type2: '生活维度', ratio1: 33.3, ratio2: 0 },
      personality: { type1: personalityType, type2: '性格维度', ratio1: 33.4, ratio2: 0 },
      summary: `你的人生核心逻辑：${moneyType}搞钱，${lifeType}生活，性格${personalityType}，主打一个精准努力不内耗。`,
      shareSummary: `我的人生核心逻辑：${moneyType}搞钱，${lifeType}生活，性格${personalityType}，主打一个精准努力不内耗。`
    }
  };
};

// --- Components ---

const Progress: React.FC<{ current: number, total: number }> = ({ current, total }) => {
  const percentage = Math.round((current / total) * 100);
  return (
    <div className="w-full bg-stone-100 rounded-full h-2 mb-6">
      <div className="bg-orange-600 h-2 rounded-full transition-all duration-300" style={{ width: `${percentage}%` }}></div>
    </div>
  );
};

const Home: React.FC<{ onStart: () => void }> = ({ onStart }) => (
  <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#FDFCFB] bg-gradient-to-br from-[#FFF5ED] via-white to-[#F9F7F5]">
    <div className="max-w-md w-full bg-white/90 backdrop-blur-md rounded-[3rem] shadow-2xl overflow-hidden text-center p-8 border border-stone-100">
      <div className="w-20 h-20 bg-gradient-to-tr from-[#E66112] to-[#FF8C42] rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-orange-200">
        <i className="fa-solid fa-compass-rose text-3xl text-white"></i>
      </div>
      <h1 className="text-3xl font-black text-stone-900 mb-2 tracking-tighter italic">人生主线剧本测评</h1>
      <p className="text-[#E66112] font-black text-xs uppercase tracking-[0.3em] mb-6">Life Path Master Script</p>
      
      <div className="text-left mb-10 space-y-6">
        <div className="bg-orange-50/50 p-6 rounded-[2rem] border border-orange-100">
          <p className="text-stone-800 text-sm leading-relaxed font-bold">
            <span className="text-[#E66112]">“人生如果没有剧本，那只是随波浪漂流。”</span><br/>
            这不是普通的心理测试，而是一次对你“搞钱观、生活观、性格特质”的深度颗粒度拆解。
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-stone-900 flex items-center justify-center shrink-0 mt-1">
              <i className="fa-solid fa-money-bill-trend-up text-white text-[10px]"></i>
            </div>
            <div>
              <h4 className="text-sm font-black text-stone-900">搞钱底层逻辑</h4>
              <p className="text-xs text-stone-500 mt-1">你是激进的增长者，还是稳健的财富守护人？</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-stone-900 flex items-center justify-center shrink-0 mt-1">
              <i className="fa-solid fa-couch text-white text-[10px]"></i>
            </div>
            <div>
              <h4 className="text-sm font-black text-stone-900">生活松弛度解析</h4>
              <p className="text-xs text-stone-500 mt-1">在内卷与平躺之间，AI 为你寻找最优平衡点。</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-stone-900 flex items-center justify-center shrink-0 mt-1">
              <i className="fa-solid fa-wand-magic-sparkles text-white text-[10px]"></i>
            </div>
            <div>
              <h4 className="text-sm font-black text-stone-900">1000字深度报告</h4>
              <p className="text-xs text-stone-500 mt-1">不谈虚词，只给可落地的建议与风险预警。</p>
            </div>
          </div>
        </div>
      </div>

      <button 
        onClick={onStart}
        className="w-full bg-[#E66112] hover:bg-[#CF550F] text-white font-black py-5 rounded-2xl shadow-xl shadow-orange-200 transition-all active:scale-95 text-lg uppercase tracking-widest"
      >
        开启我的 2026 剧本
      </button>
    </div>
  </div>
);

const Quiz: React.FC<{ onComplete: (answers: Record<number, string>) => void }> = ({ onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const handleSelect = (choice: string) => {
    const newAnswers = { ...answers, [QUESTIONS[currentIndex].id]: choice };
    setAnswers(newAnswers);
    if (currentIndex < QUESTIONS.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onComplete(newAnswers);
    }
  };

  const currentQuestion = QUESTIONS[currentIndex];

  return (
    <div className="min-h-screen flex flex-col p-6 max-w-lg mx-auto bg-white">
      <div className="flex justify-between items-center mb-6">
        <span className="px-4 py-1.5 bg-orange-50 text-[10px] font-black text-[#E66112] rounded-full uppercase tracking-widest">
          {currentQuestion.dimension === 'MONEY' ? '搞钱逻辑' : currentQuestion.dimension === 'LIFE' ? '生活观' : '性格特质'}
        </span>
        <span className="text-xs font-black text-stone-300">{currentIndex + 1} / {QUESTIONS.length}</span>
      </div>
      <Progress current={currentIndex + 1} total={QUESTIONS.length} />
      <div className="flex-1 flex flex-col justify-center">
        <h2 className="text-2xl font-black text-stone-900 mb-12">{currentQuestion.text}</h2>
        <div className="space-y-4">
          {currentQuestion.options.map((opt) => (
            <button key={opt.id} onClick={() => handleSelect(opt.id)} className="w-full text-left p-6 rounded-[1.25rem] border-2 border-stone-50 bg-stone-50 hover:border-[#E66112] transition-all group">
              <div className="flex items-center">
                <span className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-sm font-black text-stone-400 mr-5 group-hover:bg-[#E66112] group-hover:text-white transition-all">{opt.id}</span>
                <span className="text-stone-700 font-bold group-hover:text-stone-900">{opt.text}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const Payment: React.FC<{ onPaid: () => void }> = ({ onPaid }) => (
  <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#1A1817] text-white">
    <div className="max-w-md w-full text-center">
      <div className="mb-12">
        <div className="inline-block p-5 bg-[#E66112]/10 rounded-[2rem] mb-6 border border-[#E66112]/20">
          <i className="fa-solid fa-shield-halved text-5xl text-[#E66112]"></i>
        </div>
        <h2 className="text-3xl font-black mb-3 italic">剧本测评已封存</h2>
        <p className="text-stone-500 font-medium">支付 3.9 元解锁您的私人定制剧本报告</p>
      </div>
      <div className="bg-stone-900/50 rounded-[2.5rem] p-10 mb-12 border border-white/5 backdrop-blur-md">
        <div className="flex justify-between items-center mb-8">
          <span className="text-stone-500 font-black text-[10px] uppercase tracking-widest">服务项目</span>
          <span className="font-black text-orange-200 italic tracking-tight">AI专属深度报告</span>
        </div>
        <div className="flex justify-between items-end">
          <span className="text-stone-500 font-black text-[10px] uppercase tracking-widest">测评费用</span>
          <div className="flex items-baseline">
            <span className="text-xl font-black text-orange-500 mr-1">¥</span>
            <span className="text-7xl font-black text-white leading-none">3.9</span>
          </div>
        </div>
      </div>
      <button onClick={onPaid} className="w-full bg-[#E66112] hover:bg-[#CF550F] text-white font-black py-6 rounded-2xl shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-4 text-lg">
        <i className="fa-brands fa-weixin text-2xl"></i>安全解锁
      </button>
    </div>
  </div>
);

const Result: React.FC<{ initialResults: Partial<QuizResults> & { moneyType?: string; lifeType?: string; personalityType?: string }, answers: Record<number, string>, recordId?: string | null }> = ({ initialResults, answers, recordId }) => {
  const [streamedResults, setStreamedResults] = useState<Partial<QuizResults>>(initialResults);
  const [rawText, setRawText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const reportRef = useRef<HTMLDivElement>(null);
  const shareCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const basicResults = {
      moneyType: initialResults.moneyType || initialResults.visualization?.money?.type1 || '',
      lifeType: initialResults.lifeType || initialResults.visualization?.life?.type1 || '',
      personalityType: initialResults.personalityType || initialResults.visualization?.personality?.type1 || '',
      summary: initialResults.visualization?.summary || '',
    };

    generateAIAnalysisStream(
      answers,
      basicResults,
      (text) => setRawText(text),
      async (final) => {
        setStreamedResults(prev => ({ ...prev, ...final }));
        setIsTyping(false);

        // AI 报告生成完成后，保存到后端
        const currentRecordId = recordId || getCurrentRecordId();
        if (currentRecordId && final.analysis) {
          try {
            await updateAIReport(currentRecordId, {
              aiReport: rawText,
              suggestions: final.analysis.module2?.suggestions,
              tips: final.analysis.module3?.tips,
              warnings: final.analysis.module4?.warnings,
              shareCopy: final.shareCopy,
            });
            console.log('AI 报告已保存');
          } catch (error) {
            console.error('保存 AI 报告失败:', error);
          }
        }
      }
    );
  }, [answers, initialResults, recordId]);

  const chartData = [
    { name: initialResults.visualization?.money?.type1 || '搞钱', value: 33.3 },
    { name: initialResults.visualization?.life?.type1 || '生活', value: 33.3 },
    { name: initialResults.visualization?.personality?.type1 || '性格', value: 33.4 },
  ];

  const COLORS = ['#E66112', '#F9A03F', '#211B15'];

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const captureImage = async (ref: React.RefObject<HTMLDivElement>, fileName: string) => {
    if (!ref.current) return;
    try {
      const { default: html2canvas } = await import('https://esm.sh/html2canvas');
      const canvas = await html2canvas(ref.current, { 
        scale: 3, 
        useCORS: true, 
        backgroundColor: '#F9F7F5',
        windowWidth: 750
      });
      const link = document.createElement('a');
      link.download = fileName;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      alert('生成图片失败，请手动截图保存');
    }
  };

  const downloadReport = () => captureImage(reportRef, `人生剧本测评全量报告.png`);
  const shareToMoments = () => captureImage(shareCardRef, `人生主线剧本-朋友圈分享.png`);

  const processedAnalysisText = stripMarkdown(rawText.split('[SUGGESTIONS]')[0].replace('[CONTENT_START]', ''));

  return (
    <div className="min-h-screen bg-[#F9F7F5] pb-24 selection:bg-orange-100">
      <div ref={reportRef}>
        <div className="bg-[#E66112] text-white p-12 pt-20 pb-40 text-center rounded-b-[5rem] shadow-xl relative overflow-hidden">
          <h1 className="text-4xl font-black mb-6 italic tracking-tight relative z-10">2026 你的人生主线剧本</h1>
          <p className="text-orange-100 italic font-bold leading-relaxed max-w-sm mx-auto relative z-10 text-lg">
            "{initialResults.visualization?.summary}"
          </p>
        </div>

        <div className="max-w-xl mx-auto px-6 -mt-24 space-y-10 relative z-30">
          {/* Dimension Chart Module - Resized for better mobile fit */}
          <div className="bg-white rounded-[3.5rem] p-8 shadow-2xl border border-stone-100 mx-auto max-w-md">
            <h3 className="text-lg font-black text-stone-900 mb-4 flex items-center gap-4 px-2">
              <i className="fa-solid fa-chart-pie text-[#E66112]"></i>维度构成
            </h3>
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 0, bottom: 0, left: 60, right: 60 }}>
                  <Pie 
                    data={chartData} 
                    cx="50%" 
                    cy="50%" 
                    innerRadius={45} 
                    outerRadius={65} 
                    paddingAngle={8} 
                    dataKey="value" 
                    stroke="none"
                  >
                    {chartData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    <LabelList 
                      dataKey="name" 
                      position="outside" 
                      offset={20} 
                      fill="#4A3D33" 
                      style={{ fontSize: '10px', fontWeight: '900' }} 
                      formatter={(val: any) => {
                        const item = chartData.find(d => d.name === val);
                        return `${val} (${(item?.value || 33.3).toFixed(0)}%)`;
                      }} 
                    />
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-[3rem] p-12 shadow-sm border border-stone-100 relative min-h-[600px]">
            <div className="absolute top-0 left-12 transform -translate-y-1/2 flex items-center gap-2">
                <span className="bg-stone-900 text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">AI Deep Script</span>
                {isTyping && <span className="flex gap-1 animate-pulse"><span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span><span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span></span>}
            </div>
            <h3 className="text-xl font-black text-stone-900 mb-8 flex items-center gap-4"><i className="fa-solid fa-wand-sparkles text-[#E66112]"></i>1000字深度剧本拆解</h3>
            <div className="min-h-[300px] flex flex-col">
              {/* Restore loading UI */}
              {isTyping && !processedAnalysisText && (
                <div className="flex-1 flex flex-col items-center justify-center space-y-6 py-20 text-stone-300">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full border-4 border-orange-50 border-t-[#E66112] animate-spin"></div>
                    <i className="fa-solid fa-brain text-4xl text-[#E66112] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse"></i>
                  </div>
                  <div className="text-center">
                    <p className="font-black text-stone-800 text-base mb-1">AI 剧本生成中</p>
                    <p className="text-xs font-bold text-stone-400 px-10">AI正在努力为您撰写剧本...请稍等片刻</p>
                  </div>
                </div>
              )}
              <div className="text-stone-600 leading-relaxed font-bold whitespace-pre-wrap text-justify tracking-wide text-sm transition-all duration-300">
                {processedAnalysisText}
                {isTyping && processedAnalysisText && <span className="inline-block w-1 h-5 ml-1 bg-orange-500 animate-pulse align-middle"></span>}
              </div>
            </div>
          </div>

          {/* AI Custom Modules Restore */}
          {!isTyping && streamedResults.analysis && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-10 duration-1000">
              <div className="bg-[#E66112] rounded-[4rem] p-12 shadow-2xl text-white relative overflow-hidden">
                <div className="absolute -top-10 -right-10 opacity-10"><i className="fa-solid fa-money-bill-trend-up text-[12rem]"></i></div>
                <h3 className="text-xl font-black mb-8 italic relative z-10"><i className="fa-solid fa-crown mr-3"></i>搞钱方向 · 你的加速建议</h3>
                <div className="space-y-4 relative z-10">
                  {streamedResults.analysis.module2.suggestions.map((s, i) => s && (
                    <div key={i} className="flex gap-4 items-start bg-white/10 p-5 rounded-2xl backdrop-blur-md border border-white/10">
                      <span className="w-6 h-6 rounded-full bg-white text-[#E66112] flex items-center justify-center text-[10px] font-black shrink-0">{i+1}</span>
                      <p className="text-sm font-black italic">{stripMarkdown(s)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#211B15] rounded-[4rem] p-12 shadow-2xl text-white relative overflow-hidden">
                 <div className="absolute -bottom-10 -right-10 opacity-10"><i className="fa-solid fa-couch text-[12rem]"></i></div>
                 <h3 className="text-xl font-black mb-8 italic relative z-10"><i className="fa-solid fa-compass mr-3"></i>生活平衡 · 你的松弛技巧</h3>
                 <div className="space-y-4 relative z-10">
                  {streamedResults.analysis.module3.tips.map((s, i) => s && (
                    <div key={i} className="flex gap-4 items-start bg-white/5 p-5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all">
                      <span className="w-6 h-6 rounded-full bg-stone-700 text-white flex items-center justify-center text-[10px] font-black shrink-0">{i+1}</span>
                      <p className="text-sm font-black italic opacity-90">{stripMarkdown(s)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-orange-50 rounded-[3rem] p-10 border border-orange-100 shadow-inner">
                 <h3 className="text-lg font-black text-stone-900 mb-6 flex items-center gap-3 italic">
                   <i className="fa-solid fa-triangle-exclamation text-orange-600"></i>人生预警 · AI 温馨提示
                 </h3>
                 <div className="space-y-4">
                    {streamedResults.analysis.module4.warnings.map((w, i) => w && (
                      <div key={i} className="text-sm font-black text-stone-700 leading-relaxed p-5 bg-white rounded-2xl border border-orange-50 italic shadow-sm">
                        “{stripMarkdown(w)}”
                      </div>
                    ))}
                 </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-xl mx-auto px-6 mt-10 space-y-10">
        {!isTyping && streamedResults.shareCopy && (
          <div className="bg-white rounded-[4rem] p-12 shadow-xl border border-stone-100">
             <div className="flex justify-between items-center mb-10">
               <h3 className="text-xl font-black text-stone-900 flex items-center gap-4"><i className="fa-solid fa-share-nodes text-[#E66112]"></i>分享文案包</h3>
             </div>
             <div className="space-y-10">
                {[
                  { label: '自嘲梗系', content: streamedResults.shareCopy?.meme },
                  { label: '感性表达', content: streamedResults.shareCopy?.literary },
                  { label: '干脆利落', content: streamedResults.shareCopy?.simple },
                ].map((style, i) => style.content && (
                  <div key={i} className="group">
                    <div className="flex justify-between items-center mb-3">
                      <p className="text-[10px] font-black text-stone-400 uppercase tracking-[0.3em]">{style.label}</p>
                      <button 
                        onClick={() => { navigator.clipboard.writeText(stripMarkdown(style.content!)); alert('文案已复制！'); }}
                        className="text-[10px] text-[#E66112] font-black hover:underline tracking-widest uppercase"
                      >复制文案</button>
                    </div>
                    <div className="p-8 bg-stone-50 rounded-[2.5rem] text-sm text-stone-700 font-bold italic leading-relaxed border border-stone-100 group-hover:border-orange-100 group-hover:bg-white transition-all shadow-sm">
                      {stripMarkdown(style.content)}
                    </div>
                  </div>
                ))}
             </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4">
           <button onClick={shareToMoments} className="w-full bg-[#E66112] hover:bg-[#CF550F] text-white font-black py-5 rounded-2xl shadow-xl active:scale-95 transition-all text-sm tracking-widest uppercase flex items-center justify-center gap-3">
             <i className="fa-solid fa-camera-retro"></i>生成朋友圈炫耀图
           </button>
           <div className="grid grid-cols-2 gap-4">
             <button onClick={downloadReport} className="bg-white border-2 border-[#E66112] text-[#E66112] font-black py-5 rounded-2xl shadow-md active:scale-95 transition-all text-sm tracking-widest uppercase">保存报告</button>
             <button onClick={scrollToTop} className="bg-stone-900 text-white font-black py-5 rounded-2xl shadow-md active:scale-95 transition-all text-sm tracking-widest uppercase">回到顶部</button>
           </div>
        </div>
      </div>

      {/* HIDDEN SHARE CARD (OFF-SCREEN) */}
      <div className="fixed -left-[2000px] top-0 pointer-events-none">
        <div ref={shareCardRef} className="w-[500px] bg-white p-12 rounded-[4rem] text-center space-y-8 border-[20px] border-[#E66112] overflow-hidden">
          {/* Logo Section */}
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-14 h-14 bg-[#E66112] rounded-2xl flex items-center justify-center shadow-lg border-2 border-[#07C160]">
               <i className="fa-solid fa-compass-rose text-3xl text-white"></i>
            </div>
            <div className="text-left">
              <p className="text-sm font-black text-stone-900 tracking-tighter italic leading-none">LIFE SCRIPT</p>
              <p className="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em] mt-1">AI LAB ANALYSIS</p>
            </div>
          </div>

          <h2 className="text-3xl font-black text-stone-900 italic">2026 我的人生主线剧本</h2>
          <div className="bg-orange-50 p-8 rounded-[3rem] border border-orange-100">
            <p className="text-stone-800 text-lg font-black leading-relaxed italic">
              "{initialResults.visualization?.shareSummary}"
            </p>
          </div>

          <div className="h-[260px] w-full bg-stone-50 rounded-[3rem] p-6">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 10, bottom: 10, left: 60, right: 60 }}>
                <Pie data={chartData} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={10} dataKey="value" stroke="none">
                  {chartData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  <LabelList 
                    dataKey="name" 
                    position="outside" 
                    offset={20} 
                    fill="#4A3D33" 
                    style={{ fontSize: '13px', fontWeight: '900' }} 
                    formatter={(val: any) => val} 
                  />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-[#07C160] py-4 rounded-2xl shadow-inner mb-4">
             <p className="text-white text-sm font-black tracking-tight italic">
               想不想知道你的人生主线剧本，来测一测 →
             </p>
          </div>

          <div className="pt-4 border-t border-stone-100 flex justify-between items-center px-4">
             <div className="text-left">
               <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">智能剧本拆解引擎</p>
               <p className="text-xs font-black text-[#E66112] italic">AI Master Analysis v2.6</p>
             </div>
             <div className="w-16 h-16 bg-stone-900 rounded-xl flex items-center justify-center">
                <i className="fa-solid fa-qrcode text-3xl text-white"></i>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [step, setStep] = useState<AppStep>('HOME');
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [results, setResults] = useState<Partial<QuizResults> & { moneyType?: string; lifeType?: string; personalityType?: string } | null>(null);
  const [recordId, setRecordId] = useState<string | null>(null);

  // 测评完成时保存记录
  const handleQuizComplete = async (ans: Record<number, string>) => {
    setAnswers(ans);

    // 计算基础结果
    const basic = calculateBasicResults(ans);

    // 保存测评记录到后端
    try {
      const result = await saveTestRecord({
        answers: ans,
        moneyType: basic.moneyType,
        lifeType: basic.lifeType,
        personalityType: basic.personalityType,
        summary: basic.visualization.summary,
      });
      if (result.success && result.recordId) {
        setRecordId(result.recordId);
        console.log('测评记录已保存:', result.recordId);
      }
    } catch (error) {
      console.error('保存测评记录失败:', error);
    }

    setStep('PAYMENT');
  };

  // 支付完成时更新状态
  const handlePaid = async () => {
    const basic = calculateBasicResults(answers);
    setResults(basic);

    // 更新支付状态
    const currentRecordId = recordId || getCurrentRecordId();
    if (currentRecordId) {
      try {
        await updatePaymentStatus(currentRecordId, true, 3.9);
        console.log('支付状态已更新');
      } catch (error) {
        console.error('更新支付状态失败:', error);
      }
    }

    setStep('RESULT');
  };

  return (
    <div className="antialiased text-stone-900 min-h-screen bg-white">
      {step === 'HOME' && <Home onStart={() => setStep('QUIZ')} />}
      {step === 'QUIZ' && <Quiz onComplete={handleQuizComplete} />}
      {step === 'PAYMENT' && <Payment onPaid={handlePaid} />}
      {step === 'RESULT' && results && <Result initialResults={results} answers={answers} recordId={recordId} />}
    </div>
  );
}
