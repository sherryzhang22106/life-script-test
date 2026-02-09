
import { Question } from './types';

export const QUESTIONS: Question[] = [
  // 搞钱观维度 (8题)
  {
    id: 1,
    dimension: 'MONEY',
    text: '发工资后，你优先选择哪种分配方式？',
    options: [
      { id: 'A', text: '存50%+花30%自我提升+20%犒劳自己' },
      { id: 'B', text: '花50%犒劳自己+30%存起来+20%随意花' },
      { id: 'C', text: '全部存起来，为长远目标做准备' },
      { id: 'D', text: '大部分花在自我提升，少量存起来' }
    ]
  },
  {
    id: 2,
    dimension: 'MONEY',
    text: '面对高薪但加班多的工作，和低薪但朝九晚五的工作，你会选？',
    options: [
      { id: 'A', text: '选高薪加班多，多赚钱优先' },
      { id: 'B', text: '选低薪朝九晚五，不希望搞钱透支生活' },
      { id: 'C', text: '犹豫，想找中间态' },
      { id: 'D', text: '优先找能兼顾薪资和成长的工作' }
    ]
  },
  {
    id: 3,
    dimension: 'MONEY',
    text: '如果有副业邀请，你更倾向哪种类型？',
    options: [
      { id: 'A', text: '高风险高回报（如直播、创业），敢尝试' },
      { id: 'B', text: '低风险低回报（如简单兼职），不费精力' },
      { id: 'C', text: '能复用主业技能，稳步赚钱' },
      { id: 'D', text: '不做副业，专注深耕主业' }
    ]
  },
  {
    id: 4,
    dimension: 'MONEY',
    text: '你对“搞钱”的核心期待是？',
    options: [
      { id: 'A', text: '快速暴富，实现财务自由' },
      { id: 'B', text: '稳步提升，有固定结余安全感' },
      { id: 'C', text: '支撑兴趣爱好，不用为钱妥协' },
      { id: 'D', text: '够用就好，重点是生活开心' }
    ]
  },
  {
    id: 5,
    dimension: 'MONEY',
    text: '当身边人都在做热门副业，你会？',
    options: [
      { id: 'A', text: '跟风尝试，怕错过机会' },
      { id: 'B', text: '谨慎评估，看是否适合' },
      { id: 'C', text: '不跟风，专注自己的节奏' },
      { id: 'D', text: '咨询有经验的人再决定' }
    ]
  },
  {
    id: 6,
    dimension: 'MONEY',
    text: '你更愿意把时间花在哪种搞钱方式上？',
    options: [
      { id: 'A', text: '靠体力/时间换钱，见效快' },
      { id: 'B', text: '靠技能换钱，稳步长久' },
      { id: 'C', text: '靠投资换钱，省时省力' },
      { id: 'D', text: '靠资源换钱，高效便捷' }
    ]
  },
  {
    id: 7,
    dimension: 'MONEY',
    text: '如果搞钱过程中遇到挫折，你会？',
    options: [
      { id: 'A', text: '放弃，不浪费时间和精力' },
      { id: 'B', text: '复盘原因，调整方向继续' },
      { id: 'C', text: '暂时搁置，先专注主业' },
      { id: 'D', text: '找人帮忙，借鉴经验重开' }
    ]
  },
  {
    id: 8,
    dimension: 'MONEY',
    text: '你认为“搞钱”和“生活”的关系是？',
    options: [
      { id: 'A', text: '搞钱优先，生活为搞钱让步' },
      { id: 'B', text: '生活优先，不为搞钱透支' },
      { id: 'C', text: '两者平衡，互不妥协' },
      { id: 'D', text: '顺其自然，怎么舒服怎么来' }
    ]
  },

  // 生活观维度 (9题)
  {
    id: 9,
    dimension: 'LIFE',
    text: '周末全天空闲，你更倾向于哪种安排？',
    options: [
      { id: 'A', text: '宅家休息，彻底放松' },
      { id: 'B', text: '半天副业/技能，半天休息' },
      { id: 'C', text: '社交聚餐、逛街，增进感情' },
      { id: 'D', text: '短途旅行/运动，缓解压力' }
    ]
  },
  {
    id: 10,
    dimension: 'LIFE',
    text: '当工作/副业占用你的休息时间，你会？',
    options: [
      { id: 'A', text: '接受，多赚钱/成长值得' },
      { id: 'B', text: '拒绝，不允许侵占生活' },
      { id: 'C', text: '偶尔接受，兼顾两者' },
      { id: 'D', text: '犹豫，怕拒绝影响工作勉强接受' }
    ]
  },
  {
    id: 11,
    dimension: 'LIFE',
    text: '你对“松弛感生活”的理解是？',
    options: [
      { id: 'A', text: '不内卷、不焦虑，怎么舒服怎么来' },
      { id: 'B', text: '努力搞钱，但留放松时间' },
      { id: 'C', text: '不追求物质，极简专注内心' },
      { id: 'D', text: '收入稳定支撑爱好，无压力' }
    ]
  },
  {
    id: 12,
    dimension: 'LIFE',
    text: '面对无效社交，你会？',
    options: [
      { id: 'A', text: '果断拒绝，专注自己' },
      { id: 'B', text: '勉强接受，维持表面关系' },
      { id: 'C', text: '偶尔接受，长期拒绝' },
      { id: 'D', text: '接受，认为社交能积累人脉' }
    ]
  },
  {
    id: 13,
    dimension: 'LIFE',
    text: '你更倾向于哪种生活节奏？',
    options: [
      { id: 'A', text: '快节奏，充实忙碌有目标' },
      { id: 'B', text: '慢节奏，享受生活的每一刻' },
      { id: 'C', text: '张弛有度，该忙忙该闲闲' },
      { id: 'D', text: '顺其自然，随机安排' }
    ]
  },
  {
    id: 14,
    dimension: 'LIFE',
    text: '你会为了“让生活更舒适”花钱买时间吗？',
    options: [
      { id: 'A', text: '会，不想浪费时间在琐事' },
      { id: 'B', text: '不会，觉得浪费钱' },
      { id: 'C', text: '偶尔，忙碌时会买' },
      { id: 'D', text: '看情况，只买性价比高的' }
    ]
  },
  {
    id: 15,
    dimension: 'LIFE',
    text: '当你感到焦虑，你会怎么缓解？',
    options: [
      { id: 'A', text: '独处放松，自己消化' },
      { id: 'B', text: '和亲友倾诉，寻求安慰' },
      { id: 'C', text: '通过运动、旅行转移注意' },
      { id: 'D', text: '投入工作，用忙碌掩盖' }
    ]
  },
  {
    id: 16,
    dimension: 'LIFE',
    text: '你对“生活品质”的追求是？',
    options: [
      { id: 'A', text: '高端精致，愿意为品质买单' },
      { id: 'B', text: '实用舒适，够用舒服就好' },
      { id: 'C', text: '极简简约，专注内心' },
      { id: 'D', text: '随性自在，怎么方便怎么来' }
    ]
  },
  {
    id: 17,
    dimension: 'LIFE',
    text: '你更看重生活中的哪一点？',
    options: [
      { id: 'A', text: '物质富足，有钱支撑需求' },
      { id: 'B', text: '情绪稳定，开心没焦虑' },
      { id: 'C', text: '人际和谐，有知心人陪伴' },
      { id: 'D', text: '自我成长，每天有新收获' }
    ]
  },

  // 性格特质维度 (8题)
  {
    id: 18,
    dimension: 'PERSONALITY',
    text: '面对不确定的机会，你会？',
    options: [
      { id: 'A', text: '果断尝试，不想错过' },
      { id: 'B', text: '谨慎评估，确认稳妥后再试' },
      { id: 'C', text: '直接拒绝，倾向稳定不冒险' },
      { id: 'D', text: '咨询他人，结合经验决定' }
    ]
  },
  {
    id: 19,
    dimension: 'PERSONALITY',
    text: '做决定时，你更倾向于？',
    options: [
      { id: 'A', text: '理性分析权衡利弊' },
      { id: 'B', text: '跟着感觉走，凭直觉' },
      { id: 'C', text: '犹豫纠结，反复权衡' },
      { id: 'D', text: '听建议，自己不做主导' }
    ]
  },
  {
    id: 20,
    dimension: 'PERSONALITY',
    text: '当别人对你的方式提出异议，你会？',
    options: [
      { id: 'A', text: '坚持自己，不被影响' },
      { id: 'B', text: '认真倾听并合理调整' },
      { id: 'C', text: '很纠结，不知道听谁的' },
      { id: 'D', text: '放弃自己，听别人的' }
    ]
  },
  {
    id: 21,
    dimension: 'PERSONALITY',
    text: '你是一个有规划的人吗？',
    options: [
      { id: 'A', text: '是，有明确规划并执行' },
      { id: 'B', text: '不是，顺其自然随机安排' },
      { id: 'C', text: '有大致规划，灵活调整' },
      { id: 'D', text: '偶尔有，大多时候随性' }
    ]
  },
  {
    id: 22,
    dimension: 'PERSONALITY',
    text: '面对挫折和失败，你会？',
    options: [
      { id: 'A', text: '乐观面对当作经验' },
      { id: 'B', text: '悲观焦虑陷入否定' },
      { id: 'C', text: '平常心对待，顺其自然' },
      { id: 'D', text: '依赖他人安慰才能重发' }
    ]
  },
  {
    id: 23,
    dimension: 'PERSONALITY',
    text: '你更倾向于哪种做事风格？',
    options: [
      { id: 'A', text: '雷厉风行，做事果断' },
      { id: 'B', text: '慢条斯理，谨慎不忙' },
      { id: 'C', text: '偶尔拖延，小事可拖' },
      { id: 'D', text: '喜欢拖延，不到最后不做' }
    ]
  },
  {
    id: 24,
    dimension: 'PERSONALITY',
    text: '你更在意别人的评价吗？',
    options: [
      { id: 'A', text: '不在意，自己开心就好' },
      { id: 'B', text: '很在意，影响情绪和决定' },
      { id: 'C', text: '偶尔在意在乎的人' },
      { id: 'D', text: '无所谓，与我无关' }
    ]
  },
  {
    id: 25,
    dimension: 'PERSONALITY',
    text: '当你有了目标，你会？',
    options: [
      { id: 'A', text: '全力以赴一定要实现' },
      { id: 'B', text: '尽力去做，不强求' },
      { id: 'C', text: '三分钟热度，慢慢放弃' },
      { id: 'D', text: '不主动去做，被动实现' }
    ]
  }
];
