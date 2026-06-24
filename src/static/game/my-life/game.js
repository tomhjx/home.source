const STORAGE_KEY = "roue-life-sim-save";
const LANGUAGE_STORAGE_KEY = "roue-life-sim-language";
const DEFAULT_GENDER = "female";
const DEFAULT_ENVIRONMENT = "county_climber";
const DEFAULT_ACTION = "study";
const SUPPORTED_LANGUAGES = ["zh-CN", "zh-TW", "en"];

const actionDefinitions = [
  { key: "study" },
  { key: "work" },
  { key: "social" },
  { key: "rest" },
  { key: "risk" },
];

const genderDefinitions = [
  { key: "female", startDelta: { social: 4, mood: 3, stress: 2, money: -80 } },
  { key: "male", startDelta: { career: 4, money: 120, stress: 3, mood: -1 } },
];

const environmentDefinitions = [
  { key: "city_native", monthlyCost: 280, monthlyStressDelta: 1, startDelta: { money: 600, social: 6, stress: 2 } },
  { key: "county_climber", monthlyCost: 200, monthlyStressDelta: 0, startDelta: { knowledge: 4, mood: 4, career: 2, money: 100 } },
  { key: "urban_village", monthlyCost: 150, monthlyStressDelta: 2, startDelta: { career: 5, energy: 4, stress: 7, money: -200 } },
  { key: "rural_origin", monthlyCost: 170, monthlyStressDelta: 1, startDelta: { health: 7, energy: 6, knowledge: 3, social: -3, money: -300 } },
];

const baseAttributes = {
  age: 18,
  monthIndex: 0,
  turn: 1,
  money: 1200,
  health: 72,
  mood: 66,
  energy: 64,
  knowledge: 52,
  social: 38,
  stress: 24,
  career: 8,
};

const trackedAttributes = ["money", "health", "mood", "energy", "knowledge", "social", "stress", "career"];

const TEXT = {
  "zh-CN": {
    langAttr: "zh-CN",
    pageTitle: "我的人生 - 人生模拟器文字游戏",
    languageLabel: "语言",
    languageNames: { "zh-CN": "简", "zh-TW": "繁", en: "EN" },
    eyebrow: "浏览器人生文字游戏",
    heroTitle: "我的人生",
    heroLead:
      "这是一个聚焦“当下这一回合”的人生文字游戏。你先设定身份，再用每个月唯一的一次决定，把性别视角、生存环境、情绪和资源慢慢活成属于自己的样子。",
    ui: {
      editIdentity: "编辑身份设定",
      restart: "立即重开",
      inlineIdentityTitle: "重开人生",
      inlineIdentitySubtitle: "先抽取这一世的视角与出身，再进入第一段剧情",
      jumpIdentity: "重新开局",
      stepGender: "视角",
      stepEnvironment: "出身",
      stepPreview: "开局",
      stepAction: "选择行动",
      stepBack: "上一步",
      reselectAction: "重新选择",
      goalLabel: "当前目标",
      currentMonth: "人生事件",
      stageActive: "阅读事件，然后选择行动",
      stageEnded: "这一局已经结算",
      actionCaption: "你要怎么做？",
      openAction: "继续下一个事件",
      endedButton: "本局已结算",
      currentBase: "角色状态",
      currentBaseSubtitle: "主流人生模拟会始终展示关键属性",
      progressCareer: "事业推进",
      progressLife: "人生满足",
      summaryIdentityEffects: "展开身份余波",
      summaryLifeLog: "展开人生账本",
      summaryLongterm: "展开长期提醒与结局",
      identityEyebrow: "身份设定",
      identityTitle: "用弹窗设定这一局你从哪里开始",
      identityGender: "性别视角",
      identityEnvironment: "生存环境",
      identityPreview: "开局预览",
      close: "关闭",
      later: "先不改",
      actionEyebrow: "月度选择",
      actionTitle: "这个月，你只做一个主决定",
      actionPreview: "本次选择预览",
      thinkAgain: "再想想",
      confirmAction: "确认这个月的决定",
      optionSelected: "已选中",
      optionAvailable: "可选择",
      badgeGender: "性别视角",
      badgeEnvironment: "生存环境",
      badgeMonthlyCost: "月度生存成本",
      statMoney: "现金",
      statHealth: "健康",
      statMood: "情绪",
      statEnergy: "精力",
      statKnowledge: "知识",
      statSocial: "社交",
      statStress: "压力",
      statCareer: "事业",
      focusCash: "现金流",
      focusStress: "压力",
      focusEnergy: "精力",
      focusMood: "情绪",
      forecastLabel: "选择前预感",
      changeLabel: "本月变化",
      noChange: "关键状态没有明显变化，但这个月仍然留下了痕迹。",
      moneyChange: "现金",
      healthChange: "健康",
      moodChange: "情绪",
      energyChange: "精力",
      knowledgeChange: "知识",
      socialChange: "社交",
      stressChange: "压力",
      careerChange: "事业",
      conditionStable: "还算稳",
      conditionTense: "绷得很紧",
      conditionBroke: "现金见底",
      conditionBurning: "快透支了",
      conditionMomentum: "正在起势",
      hintList: [
        "现金低于 0 会持续扣情绪和健康。",
        "压力过高时，社交和冒险更容易翻车。",
        "知识和人脉决定你能不能抓住中年机会。",
        "30 岁后每次行动都更看重平衡，而不是冲刺。",
      ],
    },
    months: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
    roleTitles: {
      flagship: "行业门面人物",
      midlevel: "中层狠角色",
      rising: "稳步上升的人",
      social: "社交明星",
      scholar: "知识型狠人",
      broke: "现金流告急的人",
      ordinary: "普通努力的人",
    },
    actions: {
      study: { title: "闭关进修", description: "把一个月交给知识、证书和技能，让未来慢一点变硬。", hint: "+知识 +事业 / -精力 -现金" },
      work: { title: "认真打工", description: "用时间换现金与位置感，短期最有效，也最容易把自己耗干。", hint: "+金钱 +事业 / +压力 -精力" },
      social: { title: "经营关系", description: "去见人、说话、修复关系或扩大圈子，让人生不只剩产出。", hint: "+社交 +情绪 / -现金" },
      rest: { title: "休整生活", description: "先把睡眠、三餐、身体和情绪接回来，再谈别的。", hint: "+健康 +精力 -压力" },
      risk: { title: "赌一把机会", description: "副业、跳槽、告白、远行或一次孤注一掷，回报和代价都更大。", hint: "高波动：钱 / 关系 / 事业 都可能大起大落" },
    },
    genders: {
      female: {
        label: "女性",
        brief: "更早学会读空气，也更早学会为自己争空间。",
        trait: "你的情绪感知和关系处理会更敏锐，但外界目光也更早压到身上。",
        monthlyTheme: "你会更频繁地感知关系温度，也更容易在细节里感到压力。",
      },
      male: {
        label: "男性",
        brief: "社会更默认你去扛住结果，资源略多，压力也更直给。",
        trait: "你会被推着更快进入竞争，因此更容易拿到一点起步资源，也更难示弱。",
        monthlyTheme: "别人更容易把结果压到你身上，所以你更难心安理得地松下来。",
      },
    },
    environments: {
      city_native: {
        label: "城市原住",
        brief: "熟门熟路，资源近，成本也高。",
        trait: "你对城市规则更熟，认识人也更多，但每个月都要吞下更高的生活成本。",
        monthlyTheme: "你有近处资源，但也更容易被高成本生活推着往前跑。",
      },
      county_climber: {
        label: "县城上岸",
        brief: "不算轻松，但稳，知道自己为什么要往上走。",
        trait: "你带着一种克制的上升心态进入社会，起点不高，但节奏相对整齐。",
        monthlyTheme: "你做事更偏稳扎稳打，很多提升不会爆炸，却很持续。",
      },
      urban_village: {
        label: "城中村打拼",
        brief: "租金低一点，生存感很强，容错率却很薄。",
        trait: "你一开始就很懂现实，愿意硬扛，代价是压力会比别人更先堆起来。",
        monthlyTheme: "你会更快把时间换成现金，但长期的噪音和压迫感也会更直接。",
      },
      rural_origin: {
        label: "乡镇起步",
        brief: "底盘更耐，但现金和关系都要慢慢换。",
        trait: "你有更强的身体韧性和耐心，但前期能调动的资源明显更少。",
        monthlyTheme: "你更像在靠耐受力慢慢追平差距，起步慢，但后劲却稳。",
      },
    },
    notes: {
      female_pressure: "你对气氛的敏感让你更早察觉到关系里的压力。",
      female_gaze: "你会比多数人更快读到空气，也更早感觉到自己被如何打量。",
      male_money_pressure: "当现金变薄时，你更难允许自己示弱，扛结果的冲动也更重。",
      male_result: "别人默认你去扛住结果，这会让资源来得快一点，也让压力更难卸下。",
      city_flow: "熟门熟路的城市让信息和机会更容易朝你流过来。",
      city_cost: "高成本的城市底色让你很难真正松下来。",
      county_steady: "你更擅长走稳一点、再往上够一点，所以很多提升不炸裂，却持续。",
      urban_noise: "便宜住处换来的，是持续不断的生存噪音和疲惫感。",
      urban_hustle: "你很懂先把时间换成现金，但这种生存感会把压力推到台前。",
      rural_toughness: "更耐一点的身体底子在托着你，让你不至于一下子散掉。",
      rural_late_bloom: "你更像在靠耐受力慢慢追平差距，起步慢，后劲却稳。",
      female_work: "你多花了一点力气让别人认真看待你的成果。",
      female_social: "你更容易捕捉关系里的细节与站位。",
      male_work: "结果导向让资源给得更快，但你也被推得更前。",
      male_rest: "就算停下来，你也很难完全放掉责任感。",
      city_social: "熟悉的城市关系网给了你一点额外回音。",
      city_work: "你更懂规则，所以能更快踩中节奏。",
      county_study: "你擅长把看不见的积累慢慢叠成台阶。",
      county_rest: "节奏感让你的恢复比表面看起来更有效。",
      urban_work: "你更懂怎么先把时间换成现金。",
      urban_risk: "生存压力让你连冒险都带着背水一战的味道。",
      rural_rest: "耐受力让你在休整时回得更快。",
      rural_study: "你比别人更珍惜每一次增长。",
      debt: "房租和生活费压了上来，现金流赤字开始直接啃你的情绪和身体。",
      burnout: "长期高压让你整个人发钝，连睡觉都像在加班。",
    },
    milestones: {
      age22: "22 岁到了，你开始意识到：人生不是考试，没有标准答案，只有持续承担后果。",
      age26: "26 岁这年，有人愿意把更正式的机会介绍给你，你第一次觉得自己进了牌桌。",
      age30: "30 岁像一道心理分界线。你发现自己开始更在意什么是可持续，而不是看起来很赢。",
    },
    endings: {
      burnout: { title: "透支结局：生活先把你按下了暂停", text: "你不是不努力，只是长期忽略了身体和情绪。人生并没有失败，只是提醒你：活着本身比冲刺更重要。" },
      balanced: { title: "平衡结局：你把日子过成了自己的样子", text: "你没有彻底封神，但你保住了健康、现金流和想爱人的能力。这已经很难得。" },
      career: { title: "事业结局：你成了别人眼里的狠角色", text: "多年积累终于兑现。你拥有体面的收入、清晰的位置感，也知道自己是怎么一步步走到这里的。" },
      social: { title: "人情结局：你把人生过得很有人味", text: "你未必最有钱，但你身边有人，心里有光，遇到风浪时也知道能打给谁。" },
      growth: { title: "成长结局：你把自己养成了更强的人", text: "知识、眼界和判断力沉淀了下来。你不再焦虑证明自己，因为你已经拥有了内核。" },
    },
    resultTitles: {
      study_breakthrough: "你把别人刷短视频的夜晚换成了学习，竟真的拿到一张硬证书，简历开始有了重量。",
      study_steady: "你这一整个月都在补课、看书、练技能，累是真的累，但脑子里的地图清楚了很多。",
      work_promotion: "你狠狠干了一个月，项目扛住了，工资入账 {income}。",
      work_steady: "你把时间换成了收入，这个月进账 {income}。",
      social_exhausted: "你本想靠聚会缓口气，结果整晚都在强撑社交笑容，回家后只觉得更空。",
      social_opportunity: "一顿饭局把你带进了新的圈子，有人愿意给你一个更像样的机会。",
      social_steady: "你花时间去见朋友、认识新人，也允许自己在深夜里诚实地聊一次未来。",
      rest_recover: "你终于把日程里的自己放回来了：早睡、吃饭、晒太阳、慢慢走路。",
      rest_steady: "这个月你没有拼命，只是把生活重新拼起来。",
      risk_win: "你赌了一把，结果真的成了：副业变现、跳槽成功或者一次果断表白得到了回应，收益 {gain}。",
      risk_push: "你试着做了件以前不敢做的事，结果不算爆，但也把人生边界往外推了一点。",
      risk_fail: "你赌输了，损失了 {loss}，还顺带让自己的节奏乱了一地。",
    },
    resultStories: {
      study_breakthrough: "新的资历帮你撬开了更高的门槛。",
      study_steady: "知识不会立刻变现，但它正在悄悄改你的天花板。",
      work_promotion: "上司终于在会议上叫对了你的名字，还顺手给了你一点更像未来的机会。",
      work_steady: "钱包厚了一点，但身体和精神都在提醒你：这不是无代价的。",
      social_exhausted: "不是每一次热闹都能救人，有时候只是另一种消耗。",
      social_opportunity: "原来很多人生转折，真的发生在工作之外。",
      social_steady: "关系没有立刻变钱，但它让你没那么孤单。",
      rest_recover: "身体回暖以后，很多问题突然没有之前那么像绝境。",
      rest_steady: "效率也许没涨，但你整个人终于不像散架的机器。",
      risk_win: "这座城市偶尔也会奖励冒险的人。",
      risk_push: "不是每次冒险都赢，只要没白活就算赚。",
      risk_fail: "冒险有时不是故事感，是实打实的代价。",
    },
  },
  "zh-TW": {
    langAttr: "zh-TW",
    pageTitle: "我的人生 - 人生模擬器文字遊戲",
    languageLabel: "語言",
    languageNames: { "zh-CN": "簡", "zh-TW": "繁", en: "EN" },
    eyebrow: "瀏覽器人生文字遊戲",
    heroTitle: "我的人生",
    heroLead:
      "這是一個聚焦「當下這一回合」的人生文字遊戲。你先設定身份，再用每個月唯一的一次決定，把性別視角、生存環境、情緒與資源慢慢活成屬於自己的樣子。",
    ui: {
      editIdentity: "編輯身份設定",
      restart: "立即重開",
      inlineIdentityTitle: "重開人生",
      inlineIdentitySubtitle: "先抽取這一世的視角與出身，再進入第一段劇情",
      jumpIdentity: "重新開局",
      stepGender: "視角",
      stepEnvironment: "出身",
      stepPreview: "開局",
      stepAction: "選擇行動",
      stepBack: "上一步",
      reselectAction: "重新選擇",
      goalLabel: "目前目標",
      currentMonth: "人生事件",
      stageActive: "閱讀事件，然後選擇行動",
      stageEnded: "這一局已經結算",
      actionCaption: "你要怎麼做？",
      openAction: "繼續下一個事件",
      endedButton: "本局已結算",
      currentBase: "角色狀態",
      currentBaseSubtitle: "主流人生模擬會始終展示關鍵屬性",
      progressCareer: "事業推進",
      progressLife: "人生滿足",
      summaryIdentityEffects: "展開身份餘波",
      summaryLifeLog: "展開人生帳本",
      summaryLongterm: "展開長期提醒與結局",
      identityEyebrow: "身份設定",
      identityTitle: "用彈窗設定這一局你從哪裡開始",
      identityGender: "性別視角",
      identityEnvironment: "生存環境",
      identityPreview: "開局預覽",
      close: "關閉",
      later: "先不改",
      actionEyebrow: "月度選擇",
      actionTitle: "這個月，你只做一個主決定",
      actionPreview: "本次選擇預覽",
      thinkAgain: "再想想",
      confirmAction: "確認這個月的決定",
      optionSelected: "已選中",
      optionAvailable: "可選擇",
      badgeGender: "性別視角",
      badgeEnvironment: "生存環境",
      badgeMonthlyCost: "每月生存成本",
      statMoney: "現金",
      statHealth: "健康",
      statMood: "情緒",
      statEnergy: "精力",
      statKnowledge: "知識",
      statSocial: "社交",
      statStress: "壓力",
      statCareer: "事業",
      focusCash: "現金流",
      focusStress: "壓力",
      focusEnergy: "精力",
      focusMood: "情緒",
      forecastLabel: "選擇前預感",
      changeLabel: "本月變化",
      noChange: "關鍵狀態沒有明顯變化，但這個月仍然留下了痕跡。",
      moneyChange: "現金",
      healthChange: "健康",
      moodChange: "情緒",
      energyChange: "精力",
      knowledgeChange: "知識",
      socialChange: "社交",
      stressChange: "壓力",
      careerChange: "事業",
      conditionStable: "還算穩",
      conditionTense: "繃得很緊",
      conditionBroke: "現金見底",
      conditionBurning: "快透支了",
      conditionMomentum: "正在起勢",
      hintList: [
        "現金低於 0 會持續扣情緒和健康。",
        "壓力過高時，社交和冒險更容易翻車。",
        "知識和人脈決定你能不能抓住中年機會。",
        "30 歲後每次行動都更看重平衡，而不是衝刺。",
      ],
    },
    months: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
    roleTitles: {
      flagship: "行業門面人物",
      midlevel: "中層狠角色",
      rising: "穩定上升的人",
      social: "社交明星",
      scholar: "知識型狠人",
      broke: "現金流告急的人",
      ordinary: "普通努力的人",
    },
    actions: {
      study: { title: "閉關進修", description: "把一整個月交給知識、證照和技能，讓未來慢一點變硬。", hint: "+知識 +事業 / -精力 -現金" },
      work: { title: "認真打工", description: "用時間換現金與位置感，短期最有效，也最容易把自己耗乾。", hint: "+金錢 +事業 / +壓力 -精力" },
      social: { title: "經營關係", description: "去見人、說話、修復關係或擴大圈子，讓人生不只剩產出。", hint: "+社交 +情緒 / -現金" },
      rest: { title: "休整生活", description: "先把睡眠、三餐、身體和情緒接回來，再談別的。", hint: "+健康 +精力 -壓力" },
      risk: { title: "賭一把機會", description: "副業、跳槽、告白、遠行或一次孤注一擲，回報和代價都更大。", hint: "高波動：錢 / 關係 / 事業 都可能大起大落" },
    },
    genders: {
      female: {
        label: "女性",
        brief: "更早學會讀空氣，也更早學會為自己爭空間。",
        trait: "你的情緒感知與關係處理會更敏銳，但外界目光也更早壓到身上。",
        monthlyTheme: "你會更頻繁感知關係溫度，也更容易在細節裡感到壓力。",
      },
      male: {
        label: "男性",
        brief: "社會更默認你去扛住結果，資源略多，壓力也更直接。",
        trait: "你會被推著更快進入競爭，因此更容易拿到一點起步資源，也更難示弱。",
        monthlyTheme: "別人更容易把結果壓到你身上，所以你更難心安理得地慢下來。",
      },
    },
    environments: {
      city_native: {
        label: "城市原住",
        brief: "熟門熟路，資源近，成本也高。",
        trait: "你對城市規則更熟，認識的人也更多，但每個月都要吞下更高的生活成本。",
        monthlyTheme: "你有近處資源，但也更容易被高成本生活推著往前跑。",
      },
      county_climber: {
        label: "縣城上岸",
        brief: "不算輕鬆，但穩，知道自己為什麼要往上走。",
        trait: "你帶著一種克制的上升心態進入社會，起點不高，但節奏相對整齊。",
        monthlyTheme: "你做事更偏穩紮穩打，很多提升不會爆炸，卻很持續。",
      },
      urban_village: {
        label: "城中村打拼",
        brief: "租金低一點，生存感很強，容錯率卻很薄。",
        trait: "你一開始就很懂現實，願意硬扛，代價是壓力會比別人更早堆起來。",
        monthlyTheme: "你會更快把時間換成現金，但長期噪音與壓迫感也會更直接。",
      },
      rural_origin: {
        label: "鄉鎮起步",
        brief: "底盤更耐，但現金和關係都要慢慢換。",
        trait: "你有更強的身體韌性與耐心，但前期能調動的資源明顯更少。",
        monthlyTheme: "你更像在靠耐受力慢慢追平差距，起步慢，但後勁更穩。",
      },
    },
    notes: {
      female_pressure: "你對氣氛的敏感讓你更早察覺到關係裡的壓力。",
      female_gaze: "你會比多數人更快讀到空氣，也更早感覺到自己被如何打量。",
      male_money_pressure: "當現金變薄時，你更難允許自己示弱，扛結果的衝動也更重。",
      male_result: "別人默認你去扛住結果，這會讓資源來得快一點，也讓壓力更難卸下。",
      city_flow: "熟門熟路的城市讓資訊與機會更容易朝你流過來。",
      city_cost: "高成本的城市底色讓你很難真正鬆下來。",
      county_steady: "你更擅長走穩一點、再往上夠一點，所以很多提升不炸裂，卻持續。",
      urban_noise: "便宜住處換來的，是持續不斷的生存噪音與疲憊感。",
      urban_hustle: "你很懂先把時間換成現金，但這種生存感會把壓力推到台前。",
      rural_toughness: "更耐一點的身體底子在托著你，讓你不至於一下就散掉。",
      rural_late_bloom: "你更像在靠耐受力慢慢追平差距，起步慢，後勁卻穩。",
      female_work: "你多花了一點力氣讓別人認真看待你的成果。",
      female_social: "你更容易捕捉關係裡的細節與站位。",
      male_work: "結果導向讓資源給得更快，但你也被推得更前。",
      male_rest: "就算停下來，你也很難完全放掉責任感。",
      city_social: "熟悉的城市關係網給了你一點額外回音。",
      city_work: "你更懂規則，所以能更快踩中節奏。",
      county_study: "你擅長把看不見的積累慢慢疊成台階。",
      county_rest: "節奏感讓你的恢復比表面看起來更有效。",
      urban_work: "你更懂怎麼先把時間換成現金。",
      urban_risk: "生存壓力讓你連冒險都帶著背水一戰的味道。",
      rural_rest: "耐受力讓你在休整時回得更快。",
      rural_study: "你比別人更珍惜每一次增長。",
      debt: "房租和生活費壓了上來，現金流赤字開始直接啃你的情緒與身體。",
      burnout: "長期高壓讓你整個人發鈍，連睡覺都像在加班。",
    },
    milestones: {
      age22: "22 歲到了，你開始意識到：人生不是考試，沒有標準答案，只有持續承擔後果。",
      age26: "26 歲這年，有人願意把更正式的機會介紹給你，你第一次覺得自己進了牌桌。",
      age30: "30 歲像一道心理分界線。你發現自己開始更在意什麼是可持續，而不是看起來很贏。",
    },
    endings: {
      burnout: { title: "透支結局：生活先把你按下了暫停", text: "你不是不努力，只是長期忽略了身體和情緒。人生並沒有失敗，只是提醒你：活著本身比衝刺更重要。" },
      balanced: { title: "平衡結局：你把日子過成了自己的樣子", text: "你沒有徹底封神，但你保住了健康、現金流和想愛人的能力。這已經很難得。" },
      career: { title: "事業結局：你成了別人眼裡的狠角色", text: "多年積累終於兌現。你擁有體面的收入、清晰的位置感，也知道自己是怎麼一步步走到這裡的。" },
      social: { title: "人情結局：你把人生過得很有人味", text: "你未必最有錢，但你身邊有人，心裡有光，遇到風浪時也知道能打給誰。" },
      growth: { title: "成長結局：你把自己養成了更強的人", text: "知識、眼界和判斷力沉澱了下來。你不再焦慮證明自己，因為你已經擁有了內核。" },
    },
    resultTitles: {
      study_breakthrough: "你把別人滑短影片的夜晚換成了學習，竟真的拿到一張硬證書，履歷開始有了重量。",
      study_steady: "你這一整個月都在補課、看書、練技能，累是真的累，但腦子裡的地圖清楚了很多。",
      work_promotion: "你狠狠幹了一個月，專案扛住了，薪資入帳 {income}。",
      work_steady: "你把時間換成了收入，這個月進帳 {income}。",
      social_exhausted: "你本想靠聚會喘口氣，結果整晚都在強撐社交笑容，回家後只覺得更空。",
      social_opportunity: "一頓飯局把你帶進了新的圈子，有人願意給你一個更像樣的機會。",
      social_steady: "你花時間去見朋友、認識新人，也允許自己在深夜裡誠實地聊一次未來。",
      rest_recover: "你終於把日程裡的自己放回來了：早睡、吃飯、曬太陽、慢慢走路。",
      rest_steady: "這個月你沒有拼命，只是把生活重新拼起來。",
      risk_win: "你賭了一把，結果真的成了：副業變現、跳槽成功或一次果斷告白得到了回應，收益 {gain}。",
      risk_push: "你試著做了件以前不敢做的事，結果不算爆，但也把人生邊界往外推了一點。",
      risk_fail: "你賭輸了，損失了 {loss}，還順帶讓自己的節奏亂了一地。",
    },
    resultStories: {
      study_breakthrough: "新的資歷幫你撬開了更高的門檻。",
      study_steady: "知識不會立刻變現，但它正在悄悄改你的天花板。",
      work_promotion: "主管終於在會議上叫對了你的名字，還順手給了你一點更像未來的機會。",
      work_steady: "錢包厚了一點，但身體和精神都在提醒你：這不是沒有代價的。",
      social_exhausted: "不是每一次熱鬧都能救人，有時候只是另一種消耗。",
      social_opportunity: "原來很多人生轉折，真的發生在工作之外。",
      social_steady: "關係沒有立刻變成錢，但它讓你沒那麼孤單。",
      rest_recover: "身體回暖以後，很多問題突然沒有之前那麼像絕境。",
      rest_steady: "效率也許沒漲，但你整個人終於不像散架的機器。",
      risk_win: "這座城市偶爾也會獎勵冒險的人。",
      risk_push: "不是每次冒險都贏，只要沒白活就算賺。",
      risk_fail: "冒險有時不是故事感，而是實打實的代價。",
    },
  },
  en: {
    langAttr: "en",
    pageTitle: "My Life - Life Simulator Text Game",
    languageLabel: "Language",
    languageNames: { "zh-CN": "SC", "zh-TW": "TC", en: "EN" },
    eyebrow: "Browser life text game",
    heroTitle: "My Life",
    heroLead:
      "This is a life text game focused on the current turn. You set your identity first, then use the single decision you get each month to slowly turn gender perspective, living environment, emotions, and resources into a life that feels like your own.",
    ui: {
      editIdentity: "Edit identity setup",
      restart: "Restart now",
      inlineIdentityTitle: "Restart life",
      inlineIdentitySubtitle: "Pick this run’s perspective and origin before the first event",
      jumpIdentity: "Restart setup",
      stepGender: "Perspective",
      stepEnvironment: "Origin",
      stepPreview: "Start",
      stepAction: "Choose action",
      stepBack: "Back",
      reselectAction: "Choose again",
      goalLabel: "Current goal",
      currentMonth: "Life event",
      stageActive: "Read the event, then choose an action",
      stageEnded: "This life has been settled",
      actionCaption: "What will you do?",
      openAction: "Continue to next event",
      endedButton: "This run is settled",
      currentBase: "Character status",
      currentBaseSubtitle: "Mainstream life sims keep core attributes visible",
      progressCareer: "Career progress",
      progressLife: "Life satisfaction",
      summaryIdentityEffects: "Expand identity aftershocks",
      summaryLifeLog: "Expand life ledger",
      summaryLongterm: "Expand long-term reminders and ending",
      identityEyebrow: "Identity setup",
      identityTitle: "Use the modal to set where this run begins",
      identityGender: "Gender perspective",
      identityEnvironment: "Living environment",
      identityPreview: "Starting preview",
      close: "Close",
      later: "Not now",
      actionEyebrow: "Monthly choice",
      actionTitle: "This month, you make only one main decision",
      actionPreview: "This choice preview",
      thinkAgain: "Think again",
      confirmAction: "Confirm this month's decision",
      optionSelected: "Selected",
      optionAvailable: "Available",
      badgeGender: "Gender perspective",
      badgeEnvironment: "Environment",
      badgeMonthlyCost: "Monthly survival cost",
      statMoney: "Money",
      statHealth: "Health",
      statMood: "Mood",
      statEnergy: "Energy",
      statKnowledge: "Knowledge",
      statSocial: "Social",
      statStress: "Stress",
      statCareer: "Career",
      focusCash: "Cashflow",
      focusStress: "Stress",
      focusEnergy: "Energy",
      focusMood: "Mood",
      forecastLabel: "Pre-choice feeling",
      changeLabel: "Monthly changes",
      noChange: "No key state changed much, but this month still left a trace.",
      moneyChange: "Money",
      healthChange: "Health",
      moodChange: "Mood",
      energyChange: "Energy",
      knowledgeChange: "Knowledge",
      socialChange: "Social",
      stressChange: "Stress",
      careerChange: "Career",
      conditionStable: "Still steady",
      conditionTense: "Stretched tight",
      conditionBroke: "Cash bottomed out",
      conditionBurning: "Almost overdrawn",
      conditionMomentum: "Gaining momentum",
      hintList: [
        "When cash falls below 0, mood and health will keep dropping.",
        "When pressure gets too high, socializing and taking risks are more likely to backfire.",
        "Knowledge and connections decide whether you can catch midlife opportunities.",
        "After 30, each action cares more about balance than sprinting.",
      ],
    },
    months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    roleTitles: {
      flagship: "Industry Face",
      midlevel: "Hard-edged Middle Player",
      rising: "Steadily Rising Person",
      social: "Social Star",
      scholar: "Knowledge-driven Hard Player",
      broke: "Cashflow Emergency Person",
      ordinary: "Ordinary Hard-working Person",
    },
    actions: {
      study: { title: "Retreat to Study", description: "Give the month to knowledge, certificates, and skills, so the future can harden slowly.", hint: "+knowledge +career / -energy -cash" },
      work: { title: "Work Seriously", description: "Trade time for cash and a sense of position. It works fastest in the short term, and also burns you out most easily.", hint: "+money +career / +stress -energy" },
      social: { title: "Manage Relationships", description: "Meet people, talk, repair ties, or widen your circle, so life is not reduced to output.", hint: "+social +mood / -cash" },
      rest: { title: "Repair Daily Life", description: "Bring sleep, meals, body, and emotions back first, then talk about everything else.", hint: "+health +energy -stress" },
      risk: { title: "Bet on a Chance", description: "A side hustle, job hop, confession, trip, or one all-in move. Both reward and cost are larger.", hint: "High variance: money / relationships / career may all swing sharply" },
    },
    genders: {
      female: {
        label: "Woman",
        brief: "You learn to read the room early, and to fight for your own space early too.",
        trait: "You are more sensitive to emotional weather and social texture, but external scrutiny lands on you sooner too.",
        monthlyTheme: "You notice the temperature of relationships more often, and pressure hides in details.",
      },
      male: {
        label: "Man",
        brief: "The world is quicker to expect you to carry outcomes. You get slightly more access, and more direct pressure too.",
        trait: "You are pushed into competition sooner, which can mean a little more early access and a little less room to be vulnerable.",
        monthlyTheme: "People are more willing to put results on your shoulders, which makes it harder to slow down without guilt.",
      },
    },
    environments: {
      city_native: {
        label: "City Native",
        brief: "You know the terrain. Resources are close. Costs are high.",
        trait: "You understand urban rules and social maps better, but each month comes with a steeper survival bill.",
        monthlyTheme: "Nearby resources help, but expensive urban life keeps pushing you forward.",
      },
      county_climber: {
        label: "County Climber",
        brief: "Not easy, but steady. You know why you are trying to rise.",
        trait: "You enter adulthood with disciplined upward intent. The starting point is modest, but your rhythm is stable.",
        monthlyTheme: "You improve by stacking quiet gains rather than dramatic leaps.",
      },
      urban_village: {
        label: "Urban Village Hustle",
        brief: "Rent is a little lower. Survival is sharper. Margin for error is thin.",
        trait: "You understand reality early and are willing to push hard, but pressure piles up faster too.",
        monthlyTheme: "You convert time into cash quickly, but noise and compression hit harder over time.",
      },
      rural_origin: {
        label: "Rural Start",
        brief: "You are built tougher, but money and connections take longer to build.",
        trait: "Your body and patience hold up better, but the resources you can mobilize early are clearly smaller.",
        monthlyTheme: "You are playing a slower catch-up game, but with deeper endurance.",
      },
    },
    notes: {
      female_pressure: "Your sensitivity to atmosphere makes you notice relational pressure earlier.",
      female_gaze: "You read the room faster than most, and feel the weight of being watched sooner too.",
      male_money_pressure: "When cash gets thin, it becomes even harder for you to allow yourself softness.",
      male_result: "People expect you to carry outcomes. That can speed up access, but also makes pressure harder to set down.",
      city_flow: "A familiar city lets information and opportunity flow toward you more easily.",
      city_cost: "The high-cost city baseline makes it hard to ever fully relax.",
      county_steady: "You are good at taking one stable step and then reaching a little higher, so growth is quieter but steadier.",
      urban_noise: "Cheap housing buys you constant noise, strain, and tiredness.",
      urban_hustle: "You know how to turn time into cash first, but survival pressure becomes the main soundtrack.",
      rural_toughness: "A tougher physical baseline holds you up so you do not fall apart all at once.",
      rural_late_bloom: "You are slowly catching up through endurance. Slower start, steadier second wind.",
      female_work: "You had to spend extra energy making people take your results seriously.",
      female_social: "You read subtle shifts in closeness and distance more quickly.",
      male_work: "A result-first environment rewarded you faster, but pushed you further forward too.",
      male_rest: "Even while resting, you struggled to fully put down responsibility.",
      city_social: "Your familiar city network gave your social move a little extra echo.",
      city_work: "You understand the rules better, so you find the rhythm faster.",
      county_study: "You are good at stacking invisible gains into a staircase.",
      county_rest: "Your sense of pacing made recovery work better than it looked.",
      urban_work: "You know how to convert effort into cash a little faster.",
      urban_risk: "Even your risk-taking carries the taste of having your back against the wall.",
      rural_rest: "Endurance lets your body recover faster once you do rest.",
      rural_study: "You value every increment of growth more than most people do.",
      debt: "Rent and living costs closed in, and negative cashflow started chewing directly on your body and mood.",
      burnout: "Long-term pressure made your whole self feel dull, like even sleep had become overtime.",
    },
    milestones: {
      age22: "At 22, you start understanding that life is not an exam. There is no standard answer, only consequences you keep carrying.",
      age26: "At 26, someone is willing to introduce you to a more serious opportunity, and for the first time you feel like you are at the table.",
      age30: "Thirty feels like a psychological border. You begin to care more about what is sustainable than what merely looks like winning.",
    },
    endings: {
      burnout: { title: "Burnout Ending: life forced a pause before you did", text: "You were not lazy. You were just ignoring your body and emotions for too long. This is not failure—it is a reminder that staying alive matters more than sprinting." },
      balanced: { title: "Balance Ending: you made life look like yours", text: "You did not become a legend, but you protected your health, your cashflow, and your ability to love people. That is already rare." },
      career: { title: "Career Ending: you became the person others fear and respect", text: "Years of accumulation finally paid off. You have income, status, and a clear sense of how you got here." },
      social: { title: "Human Ending: you built a life with warmth in it", text: "You may not be the richest, but you are not alone. There is light around you, and people you can still call when storms come." },
      growth: { title: "Growth Ending: you raised yourself into someone stronger", text: "Knowledge, perspective, and judgment settled into you. You are less desperate to prove yourself because you now have an inner core." },
    },
    resultTitles: {
      study_breakthrough: "You traded other people's scrolling nights for study and somehow walked away with a serious credential. Your resume suddenly carries weight.",
      study_steady: "You spent the whole month learning, reading, and drilling skills. It was exhausting, but your inner map got much clearer.",
      work_promotion: "You went hard for a month, held the project together, and got paid {income}.",
      work_steady: "You traded time for income and brought in {income} this month.",
      social_exhausted: "You hoped a gathering would help you breathe, but spent the whole night forcing a social smile and came home emptier.",
      social_opportunity: "A single dinner pulled you into a new circle, and someone was willing to offer you a more serious chance.",
      social_steady: "You spent time seeing people, meeting new ones, and letting yourself speak honestly about the future late at night.",
      rest_recover: "You finally put yourself back into your own schedule: sleep, food, sun, and slow walks.",
      rest_steady: "You did not push this month. You just put your life back together.",
      risk_win: "You took a shot and it really landed: side income, a successful jump, or a confession that was answered. Return: {gain}.",
      risk_push: "You tried something you would have avoided before. It was not explosive, but it widened the border of your life.",
      risk_fail: "You lost the gamble, burned {loss}, and threw your rhythm into chaos with it.",
    },
    resultStories: {
      study_breakthrough: "The new credential cracked open a higher threshold.",
      study_steady: "Knowledge does not turn into money immediately, but it is quietly changing your ceiling.",
      work_promotion: "For once, your boss said your name correctly in the meeting and attached a future-shaped opportunity to it.",
      work_steady: "Your wallet got thicker, but your mind and body both reminded you that none of this is free.",
      social_exhausted: "Not every crowd saves you. Sometimes it is just another form of depletion.",
      social_opportunity: "So many life pivots really do happen outside work.",
      social_steady: "It did not turn into money right away, but it made you less alone.",
      rest_recover: "Once your body warmed back up, many problems stopped looking like the edge of a cliff.",
      rest_steady: "Productivity may not have risen, but you no longer feel like a machine coming apart.",
      risk_win: "Sometimes the city really does reward the people who take the leap.",
      risk_push: "Not every risk has to win. Sometimes not wasting the moment is enough.",
      risk_fail: "Sometimes risk is not romantic at all. It is just cost.",
    },
  },
};

const elements = {
  body: document.body,
  eyebrowText: document.querySelector("#eyebrow-text"),
  languageLabel: document.querySelector("#language-label"),
  languageSwitcher: document.querySelector("#language-switcher"),
  heroTitle: document.querySelector("#hero-title"),
  heroLead: document.querySelector("#hero-lead"),
  goalLabel: document.querySelector("#goal-label"),
  goalText: document.querySelector("#goal-text"),
  currentMonthLabel: document.querySelector("#current-month-label"),
  stageIndicator: document.querySelector("#stage-indicator"),
  actionCaptionText: document.querySelector("#action-caption-text"),
  identitySetupPanel: document.querySelector("#identity-setup-panel"),
  gamePanel: document.querySelector("#game-panel"),
  inlineIdentityTitle: document.querySelector("#inline-identity-title"),
  inlineIdentitySubtitle: document.querySelector("#inline-identity-subtitle"),
  identityStepIndicator: document.querySelector("#identity-step-indicator"),
  inlineGenderStep: document.querySelector("#inline-gender-step"),
  inlineEnvironmentStep: document.querySelector("#inline-environment-step"),
  inlineIdentityPreviewStep: document.querySelector("#inline-identity-preview-step"),
  inlineIdentityGenderLabel: document.querySelector("#inline-identity-gender-label"),
  inlineIdentityEnvironmentLabel: document.querySelector("#inline-identity-environment-label"),
  inlineIdentityPreviewLabel: document.querySelector("#inline-identity-preview-label"),
  currentBaseLabel: document.querySelector("#current-base-label"),
  currentBaseSubtitle: document.querySelector("#current-base-subtitle"),
  statusCollapseButton: document.querySelector("#status-collapse-button"),
  careerProgressLabel: document.querySelector("#career-progress-label"),
  lifeProgressLabel: document.querySelector("#life-progress-label"),
  summaryIdentityEffects: document.querySelector("#summary-identity-effects"),
  summaryLifeLog: document.querySelector("#summary-life-log"),
  summaryLongterm: document.querySelector("#summary-longterm"),
  hintList: document.querySelector("#hint-list"),
  identityModalEyebrow: document.querySelector("#identity-modal-eyebrow"),
  identityModalTitle: document.querySelector("#identity-modal-title"),
  identityModalClose: document.querySelector("#identity-modal-close"),
  identityGenderLabel: document.querySelector("#identity-gender-label"),
  identityEnvironmentLabel: document.querySelector("#identity-environment-label"),
  identityPreviewLabel: document.querySelector("#identity-preview-label"),
  identityModalCancel: document.querySelector("#identity-modal-cancel"),
  actionModalEyebrow: document.querySelector("#action-modal-eyebrow"),
  actionModalTitle: document.querySelector("#action-modal-title"),
  actionModalClose: document.querySelector("#action-modal-close"),
  actionPreviewLabel: document.querySelector("#action-preview-label"),
  actionModalCancel: document.querySelector("#action-modal-cancel"),
  storyTitle: document.querySelector("#story-title"),
  storyText: document.querySelector("#story-text"),
  identityPressure: document.querySelector("#identity-pressure"),
  currentChoiceSummary: document.querySelector("#current-choice-summary"),
  turnIndicator: document.querySelector("#turn-indicator"),
  ageIndicator: document.querySelector("#age-indicator"),
  profileText: document.querySelector("#profile-text"),
  profileBadges: document.querySelector("#profile-badges"),
  focusStats: document.querySelector("#focus-stats"),
  impactList: document.querySelector("#impact-list"),
  logList: document.querySelector("#log-list"),
  endingPanel: document.querySelector("#ending-panel"),
  progressCareer: document.querySelector("#progress-career"),
  progressLife: document.querySelector("#progress-life"),
  restartButton: document.querySelector("#restart-button"),
  openIdentityModalButton: document.querySelector("#open-identity-modal-button"),
  openActionModalButton: document.querySelector("#open-action-modal-button"),
  applyProfileButton: document.querySelector("#apply-profile-button"),
  inlineApplyProfileButton: document.querySelector("#inline-apply-profile-button"),
  confirmActionButton: document.querySelector("#confirm-action-button"),
  setupGenderList: document.querySelector("#setup-gender-list"),
  setupEnvironmentList: document.querySelector("#setup-environment-list"),
  setupPreviewBody: document.querySelector("#setup-preview-body"),
  inlineSetupGenderList: document.querySelector("#inline-setup-gender-list"),
  inlineSetupEnvironmentList: document.querySelector("#inline-setup-environment-list"),
  inlineSetupPreviewBody: document.querySelector("#inline-setup-preview-body"),
  actionList: document.querySelector("#action-list"),
  actionPreviewBody: document.querySelector("#action-preview-body"),
  actionStepIndicator: document.querySelector("#action-step-indicator"),
  inlineActionList: document.querySelector("#inline-action-list"),
  inlineActionPreviewLabel: document.querySelector("#inline-action-preview-label"),
  inlineActionPreviewBody: document.querySelector("#inline-action-preview-body"),
  identityStepBackButton: document.querySelector("#identity-step-back-button"),
  actionStepBackButton: document.querySelector("#action-step-back-button"),
  identityModal: document.querySelector("#identity-modal"),
  actionModal: document.querySelector("#action-modal"),
};

const uiState = {
  identityModalOpen: false,
  actionModalOpen: false,
  identityStep: "gender",
  actionStep: "choose",
  setupMode: "auto",
  draftActionKey: DEFAULT_ACTION,
  statusCollapsed: true,
};

let appLanguage = getInitialLanguage();
let state = loadState();

function normalizeLanguage(language) {
  const lower = (language || "").toLowerCase();
  if (lower.startsWith("zh-tw") || lower.includes("hant") || lower.startsWith("zh-hk") || lower.startsWith("zh-mo")) return "zh-TW";
  if (lower.startsWith("zh")) return "zh-CN";
  return "en";
}

function getInitialLanguage() {
  try {
    const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored && SUPPORTED_LANGUAGES.includes(stored)) return stored;
  } catch {
    // ignore storage access failures
  }
  return normalizeLanguage(window.navigator.language || window.navigator.languages?.[0] || "en");
}

function getPack(language = appLanguage) {
  return TEXT[language] ?? TEXT["zh-CN"];
}

function interpolate(template, vars = {}) {
  return template.replace(/\{(\w+)\}/g, (_, key) => `${vars[key] ?? ""}`);
}

function escapeHtml(value) {
  return `${value}`
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatMoney(value) {
  const formatted = Math.abs(value).toLocaleString(appLanguage);
  return `${value >= 0 ? "¥" : "-¥"}${formatted}`;
}

function getMonths() {
  return getPack().months;
}

function getActionDefinition(key) {
  const base = actionDefinitions.find((item) => item.key === key) ?? actionDefinitions[0];
  return { ...base, ...getPack().actions[base.key] };
}

function getGenderDefinition(key) {
  const base = genderDefinitions.find((item) => item.key === key) ?? genderDefinitions[0];
  return { ...base, ...getPack().genders[base.key] };
}

function normalizeGenderKey(key) {
  return genderDefinitions.some((item) => item.key === key) ? key : DEFAULT_GENDER;
}

function getEnvironmentDefinition(key) {
  const base = environmentDefinitions.find((item) => item.key === key) ?? environmentDefinitions[0];
  return { ...base, ...getPack().environments[base.key] };
}

function clamp(value, min = 0, max = 100) {
  return Math.min(max, Math.max(min, Math.round(value)));
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function applyDelta(target, delta) {
  Object.entries(delta).forEach(([key, amount]) => {
    if (key === "money") {
      target.money += amount;
      return;
    }
    target[key] = clamp(target[key] + amount);
  });
}

function makeNarrativeEffect(noteKey, delta = {}) {
  return { noteKey, delta };
}

function translateNote(noteKey) {
  return getPack().notes[noteKey] ?? noteKey;
}

function translateResult(result) {
  const pack = getPack();
  return {
    title: interpolate(pack.resultTitles[result.key], result.data ?? {}),
    story: interpolate(pack.resultStories[result.key], result.data ?? {}),
  };
}

function captureSnapshot() {
  return trackedAttributes.reduce((snapshot, key) => {
    snapshot[key] = state[key];
    return snapshot;
  }, {});
}

function getAttributeLabel(key) {
  const ui = getPack().ui;
  const labels = {
    money: ui.moneyChange,
    health: ui.healthChange,
    mood: ui.moodChange,
    energy: ui.energyChange,
    knowledge: ui.knowledgeChange,
    social: ui.socialChange,
    stress: ui.stressChange,
    career: ui.careerChange,
  };
  return labels[key] ?? key;
}

function formatAttributeDelta(key, value) {
  if (key === "money") return `${value > 0 ? "+" : "-"}${formatMoney(Math.abs(value))}`;
  return `${value > 0 ? "+" : ""}${value}`;
}

function describeStateChanges(before = {}, after = state) {
  return trackedAttributes
    .map((key) => ({ key, value: (after[key] ?? 0) - (before[key] ?? 0) }))
    .filter((item) => item.value !== 0)
    .sort((first, second) => Math.abs(second.value) - Math.abs(first.value))
    .slice(0, 5);
}

function renderChangeSummary(changes = []) {
  const ui = getPack().ui;
  if (changes.length === 0) return `<p class="change-empty">${escapeHtml(ui.noChange)}</p>`;
  return `<div class="change-grid">${changes.map((change) => {
    const directionClass = change.value > 0 ? "change-up" : "change-down";
    return `<span class="change-pill ${directionClass}"><small>${escapeHtml(getAttributeLabel(change.key))}</small><strong>${escapeHtml(formatAttributeDelta(change.key, change.value))}</strong></span>`;
  }).join("")}</div>`;
}

function normalizeChanges(changes) {
  if (!Array.isArray(changes)) return [];
  return changes
    .map((change) => ({
      key: trackedAttributes.includes(change?.key) ? change.key : null,
      value: Number(change?.value),
    }))
    .filter((change) => change.key && Number.isFinite(change.value) && change.value !== 0)
    .slice(0, 5);
}

function getConditionTag() {
  const ui = getPack().ui;
  if (state.money < getMonthlyLivingCost()) return ui.conditionBroke;
  if (state.health < 38 || state.energy < 30 || state.mood < 32) return ui.conditionBurning;
  if (state.stress > 68) return ui.conditionTense;
  if (state.career >= 55 || state.knowledge >= 70 || state.social >= 68) return ui.conditionMomentum;
  return ui.conditionStable;
}

function buildIntroEvent(genderKey, environmentKey) {
  return { kind: "intro", genderKey, environmentKey };
}

function buildIntroCopy(event) {
  const gender = getGenderDefinition(event.genderKey);
  const environment = getEnvironmentDefinition(event.environmentKey);
  return {
    title: interpolate(appLanguage === "en" ? "You step into adult life carrying the baseline of {environment}." : appLanguage === "zh-TW" ? "你帶著 {environment} 的底色，準備開始第一段獨立人生。" : "你带着 {environment} 的底色，准备开始第一段独立人生。", { environment: environment.label }),
    story: appLanguage === "en"
      ? `${gender.label} expectations shape how others read you, while ${environment.label} determines how much survival pressure you swallow every month.`
      : appLanguage === "zh-TW"
        ? `${gender.label} 的社會視角，會影響別人如何看待你；而 ${environment.label} 決定了你每個月先要扛下多少生存成本。`
        : `${gender.label} 的社会视角，会影响别人如何看待你；而 ${environment.label} 决定了你每个月先要扛下多少生存成本。`,
    log: appLanguage === "en"
      ? `At 18, you begin this life as “${gender.label} / ${environment.label}.” ${gender.trait} ${environment.trait}`
      : appLanguage === "zh-TW"
        ? `18 歲這年，你以「${gender.label} / ${environment.label}」的身份出發。${gender.trait}${environment.trait}`
        : `18 岁这年，你以「${gender.label} / ${environment.label}」的身份出发。${gender.trait}${environment.trait}`,
  };
}

function createLogEntry(kind, data) {
  return {
    kind,
    age: state.age,
    monthIndex: state.monthIndex,
    ...data,
  };
}

function normalizeLogEntry(entry) {
  if (!entry || typeof entry !== "object") {
    return { kind: "legacy", time: "", text: `${entry ?? ""}` };
  }
  if (entry.kind) return entry;
  return { kind: "legacy", time: entry.time ?? "", text: entry.text ?? "" };
}

function createState({ genderKey = DEFAULT_GENDER, environmentKey = DEFAULT_ENVIRONMENT } = {}) {
  const gender = genderDefinitions.find((item) => item.key === genderKey) ?? genderDefinitions[0];
  const environment = environmentDefinitions.find((item) => item.key === environmentKey) ?? environmentDefinitions[0];
  const nextState = {
    ...baseAttributes,
    selectedGender: gender.key,
    selectedEnvironment: environment.key,
    draftGender: gender.key,
    draftEnvironment: environment.key,
    title: getPack().roleTitles.ordinary,
    lastActionKey: null,
    lastEffects: [],
    currentEvent: buildIntroEvent(gender.key, environment.key),
    log: [],
    hasStarted: false,
    ended: false,
    endingKey: null,
  };

  applyDelta(nextState, gender.startDelta);
  applyDelta(nextState, environment.startDelta);
  nextState.log = [{ kind: "intro", age: 18, monthIndex: 0, genderKey: gender.key, environmentKey: environment.key }];

  return nextState;
}

function loadState() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createState();
    const parsed = JSON.parse(raw);
    const safeGenderKey = normalizeGenderKey(parsed.selectedGender);
    const safeDraftGenderKey = normalizeGenderKey(parsed.draftGender ?? parsed.selectedGender);
    const seeded = createState({
      genderKey: safeGenderKey,
      environmentKey: parsed.selectedEnvironment ?? DEFAULT_ENVIRONMENT,
    });
    return {
      ...seeded,
      ...parsed,
      selectedGender: safeGenderKey,
      selectedEnvironment: parsed.selectedEnvironment ?? seeded.selectedEnvironment,
      draftGender: safeDraftGenderKey,
      draftEnvironment: parsed.draftEnvironment ?? parsed.selectedEnvironment ?? seeded.selectedEnvironment,
      log: Array.isArray(parsed.log) ? parsed.log.map(normalizeLogEntry) : seeded.log,
      lastEffects: Array.isArray(parsed.lastEffects) ? parsed.lastEffects : [],
      currentEvent: parsed.currentEvent ?? seeded.currentEvent,
      hasStarted: Boolean(parsed.hasStarted ?? parsed.lastActionKey ?? parsed.turn > 1),
      endingKey: parsed.endingKey ?? null,
    };
  } catch {
    return createState();
  }
}

function saveState() {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  window.localStorage.setItem(LANGUAGE_STORAGE_KEY, appLanguage);
}

function setLanguage(language) {
  appLanguage = normalizeLanguage(language);
  saveState();
  renderStatus();
}

function getMonthlyLivingCost(currentState = state) {
  const environment = environmentDefinitions.find((item) => item.key === currentState.selectedEnvironment) ?? environmentDefinitions[0];
  return environment.monthlyCost;
}

function getLifeScore() {
  const moneyScore = Math.min(100, Math.max(0, state.money / 120));
  return clamp((state.health + state.mood + state.social + moneyScore) / 4);
}

function updateTitle() {
  const titles = getPack().roleTitles;
  if (state.career >= 85 && state.knowledge >= 80) state.title = titles.flagship;
  else if (state.career >= 68) state.title = titles.midlevel;
  else if (state.career >= 45) state.title = titles.rising;
  else if (state.social >= 72 && state.mood >= 60) state.title = titles.social;
  else if (state.knowledge >= 70) state.title = titles.scholar;
  else if (state.money < 0) state.title = titles.broke;
  else state.title = titles.ordinary;
}

function createFocusStats() {
  const ui = getPack().ui;
  return [
    [ui.statMoney, formatMoney(state.money)],
    [ui.statHealth, `${state.health}`],
    [ui.statMood, `${state.mood}`],
    [ui.statEnergy, `${state.energy}`],
    [ui.statKnowledge, `${state.knowledge}`],
    [ui.statSocial, `${state.social}`],
    [ui.statStress, `${state.stress}`],
    [ui.statCareer, `${state.career}`],
  ];
}

function getGenderRecurringEffect(currentState) {
  switch (currentState.selectedGender) {
    case "female":
      return currentState.stress >= 65 ? makeNarrativeEffect("female_pressure", { mood: -1, social: 1 }) : makeNarrativeEffect("female_gaze", {});
    case "male":
      return currentState.money < 300 ? makeNarrativeEffect("male_money_pressure", { stress: 2 }) : makeNarrativeEffect("male_result", {});
    default:
      return makeNarrativeEffect("male_result", {});
  }
}

function getEnvironmentRecurringEffect(currentState) {
  switch (currentState.selectedEnvironment) {
    case "city_native":
      return currentState.money >= 1500 ? makeNarrativeEffect("city_flow", { social: 1 }) : makeNarrativeEffect("city_cost", { stress: 1 });
    case "county_climber":
      return makeNarrativeEffect("county_steady", { knowledge: 1 });
    case "urban_village":
      return currentState.energy < 55 ? makeNarrativeEffect("urban_noise", { stress: 1, energy: -1 }) : makeNarrativeEffect("urban_hustle", {});
    default:
      return currentState.mood < 60 ? makeNarrativeEffect("rural_toughness", { health: 1 }) : makeNarrativeEffect("rural_late_bloom", {});
  }
}

function getGenderActionEffect(currentState, actionKey) {
  switch (`${currentState.selectedGender}:${actionKey}`) {
    case "female:work":
      return makeNarrativeEffect("female_work", { career: 1, stress: 2 });
    case "female:social":
      return makeNarrativeEffect("female_social", { social: 2, mood: 1 });
    case "male:work":
      return makeNarrativeEffect("male_work", { money: 80, stress: 2 });
    case "male:rest":
      return makeNarrativeEffect("male_rest", { stress: -1, mood: -1 });
    default:
      return null;
  }
}

function getEnvironmentActionEffect(currentState, actionKey) {
  switch (`${currentState.selectedEnvironment}:${actionKey}`) {
    case "city_native:social":
      return makeNarrativeEffect("city_social", { social: 2, money: -60 });
    case "city_native:work":
      return makeNarrativeEffect("city_work", { career: 1 });
    case "county_climber:study":
      return makeNarrativeEffect("county_study", { knowledge: 1, career: 1 });
    case "county_climber:rest":
      return makeNarrativeEffect("county_rest", { mood: 1 });
    case "urban_village:work":
      return makeNarrativeEffect("urban_work", { money: 100, career: 1, stress: 2 });
    case "urban_village:risk":
      return makeNarrativeEffect("urban_risk", { mood: -1, stress: 1 });
    case "rural_origin:rest":
      return makeNarrativeEffect("rural_rest", { health: 2, energy: 1 });
    case "rural_origin:study":
      return makeNarrativeEffect("rural_study", { knowledge: 1, mood: 1 });
    default:
      return null;
  }
}

function applyEffect(effect, notes) {
  if (!effect) return;
  applyDelta(state, effect.delta);
  if (effect.noteKey) notes.push(effect.noteKey);
}

function previewEffectsForAction(actionKey) {
  return [getGenderActionEffect(state, actionKey), getEnvironmentActionEffect(state, actionKey)]
    .filter(Boolean)
    .map((effect) => translateNote(effect.noteKey));
}

function buildPressureLine() {
  const gender = getGenderDefinition(state.selectedGender);
  const environment = getEnvironmentDefinition(state.selectedEnvironment);
  if (appLanguage === "en") {
    return `${gender.label}: ${gender.monthlyTheme} / ${environment.label}: ${environment.monthlyTheme}`;
  }
  if (appLanguage === "zh-TW") {
    return `${gender.label} 視角：${gender.monthlyTheme} / ${environment.label}：${environment.monthlyTheme}`;
  }
  return `${gender.label} 视角：${gender.monthlyTheme} / ${environment.label}：${environment.monthlyTheme}`;
}

function buildCurrentChoiceSummary() {
  if (state.ended) {
    return appLanguage === "en"
      ? "This life has ended. Review the journal below, then restart to try a different route."
      : appLanguage === "zh-TW"
        ? "這一世已經結束。先看下方人生紀錄，再重開嘗試另一條路線。"
        : "这一世已经结束。先看下方人生记录，再重开尝试另一条路线。";
  }

  if (!state.lastActionKey) {
    if (state.turn > 1) {
      return appLanguage === "en"
        ? "A new event is waiting. Pick one action card, read the preview, then continue your life."
        : appLanguage === "zh-TW"
          ? "新的事件正在等你。選一張行動卡，讀完預告後繼續人生。"
          : "新的事件正在等你。选一张行动卡，读完预告后继续人生。";
    }
    return appLanguage === "en"
      ? "This is your first event. Choose one action card to decide how this life begins."
      : appLanguage === "zh-TW"
        ? "這是你的第一個事件。選一張行動卡，決定這一世如何開始。"
        : "这是你的第一个事件。选一张行动卡，决定这一世如何开始。";
  }

  const action = getActionDefinition(state.lastActionKey);
  const notes = state.lastEffects.length > 0
    ? appLanguage === "en"
      ? `Identity aftereffects: ${state.lastEffects.map(translateNote).join(" / ")}`
      : appLanguage === "zh-TW"
        ? `身份餘波：${state.lastEffects.map(translateNote).join(" / ")}`
        : `身份余波：${state.lastEffects.map(translateNote).join(" / ")}`
    : appLanguage === "en"
      ? "No additional identity aftereffect was triggered this time."
      : appLanguage === "zh-TW"
        ? "這次沒有額外的身份餘波。"
        : "这次没有额外的身份余波。";

  return appLanguage === "en"
    ? `Previous choice: “${action.title}.” ${notes}`
    : appLanguage === "zh-TW"
      ? `上一個選擇：「${action.title}」。${notes}`
      : `上一个选择：「${action.title}」。${notes}`;
}

function buildMonthlyAtmosphere() {
  const environment = getEnvironmentDefinition(state.selectedEnvironment);
  const moneyText = formatMoney(state.money);
  if (appLanguage === "en") {
    if (state.money < getMonthlyLivingCost()) return `The bill for ${environment.label} is already breathing down your neck. You only have ${moneyText}, so every choice feels like it has a price tag attached.`;
    if (state.stress > 72) return `This month begins with a tight chest. Stress is sitting at ${state.stress}, and even small decisions feel louder than they should.`;
    if (state.energy < 34) return `You wake up tired before the month even starts. Energy is down to ${state.energy}, so ambition now has to negotiate with your body.`;
    if (state.career >= 60) return `People have started to read you differently. Your career momentum is visible now, but visibility also means fewer quiet corners.`;
    if (state.social >= 66) return `Your phone is less silent than before. Relationships are becoming a real part of your options, not just background noise.`;
    return `A new month opens in ${environment.label}. Nothing has collapsed yet, but the small numbers on the side are quietly deciding how brave you can be.`;
  }
  if (appLanguage === "zh-TW") {
    if (state.money < getMonthlyLivingCost()) return `${environment.label} 的帳單已經逼到眼前。你手裡只剩 ${moneyText}，每個選擇都像先掛上了價格。`;
    if (state.stress > 72) return `這個月一開始，胸口就有點緊。壓力已經到 ${state.stress}，連小決定都比平常更吵。`;
    if (state.energy < 34) return `月份還沒真正開始，你就已經醒得很累。精力只剩 ${state.energy}，野心現在得先跟身體談判。`;
    if (state.career >= 60) return `別人開始用不一樣的眼光看你。事業動能已經看得見了，但被看見也代表你更難躲進安靜角落。`;
    if (state.social >= 66) return `你的手機不再那麼安靜。關係正在變成真正的選項，而不只是背景音。`;
    return `新的月份在 ${environment.label} 裡打開。還沒有什麼崩掉，但旁邊那些小數字，正在悄悄決定你能有多勇敢。`;
  }
  if (state.money < getMonthlyLivingCost()) return `${environment.label} 的账单已经逼到眼前。你手里只剩 ${moneyText}，每个选择都像先挂上了价格。`;
  if (state.stress > 72) return `这个月一开始，胸口就有点紧。压力已经到 ${state.stress}，连小决定都比平常更吵。`;
  if (state.energy < 34) return `月份还没真正开始，你就已经醒得很累。精力只剩 ${state.energy}，野心现在得先跟身体谈判。`;
  if (state.career >= 60) return `别人开始用不一样的眼光看你。事业动能已经看得见了，但被看见也意味着你更难躲进安静角落。`;
  if (state.social >= 66) return `你的手机不再那么安静。关系正在变成真正的选项，而不只是背景音。`;
  return `新的月份在 ${environment.label} 里打开。还没有什么崩掉，但旁边那些小数字，正在悄悄决定你能有多勇敢。`;
}

function buildActionForecast(actionKey) {
  const cost = getMonthlyLivingCost();
  if (appLanguage === "en") {
    if (actionKey === "work" && state.energy < 38) return "You can force another work month, but your body is already negotiating from a weak position.";
    if (actionKey === "study" && state.money < cost + 220) return "Study may raise your ceiling, but this month it will squeeze an already-thin wallet.";
    if (actionKey === "social" && state.stress > 70) return "You need people, but high stress may turn social warmth into performance.";
    if (actionKey === "rest" && state.money < cost) return "Rest is the right medicine, but the rent does not pause while you recover.";
    if (actionKey === "risk" && state.stress > 65) return "This risk carries a sharper edge because you are not choosing from calm.";
    return "This choice will not only change numbers. It will change what kind of month this becomes in your memory.";
  }
  if (appLanguage === "zh-TW") {
    if (actionKey === "work" && state.energy < 38) return "你還能硬撐一個工作月，但身體已經不是站在有餘裕的位置跟你談。";
    if (actionKey === "study" && state.money < cost + 220) return "學習會抬高天花板，但這個月也會擠壓本來就偏薄的錢包。";
    if (actionKey === "social" && state.stress > 70) return "你需要人，但高壓之下，社交的溫度也可能變成另一場表演。";
    if (actionKey === "rest" && state.money < cost) return "休息是對的藥，但房租不會因為你恢復而暫停。";
    if (actionKey === "risk" && state.stress > 65) return "這次冒險邊緣更利，因為你不是在平靜裡做選擇。";
    return "這個選擇改變的不只是數字，也會改變這個月在你記憶裡的樣子。";
  }
  if (actionKey === "work" && state.energy < 38) return "你还能硬撑一个工作月，但身体已经不是站在有余裕的位置跟你谈。";
  if (actionKey === "study" && state.money < cost + 220) return "学习会抬高天花板，但这个月也会挤压本来就偏薄的钱包。";
  if (actionKey === "social" && state.stress > 70) return "你需要人，但高压之下，社交的温度也可能变成另一场表演。";
  if (actionKey === "rest" && state.money < cost) return "休息是对的药，但房租不会因为你恢复而暂停。";
  if (actionKey === "risk" && state.stress > 65) return "这次冒险边缘更利，因为你不是在平静里做选择。";
  return "这个选择改变的不只是数字，也会改变这个月在你记忆里的样子。";
}

function buildGoalHint() {
  if (state.ended) return appLanguage === "en" ? "This life has already ended. You can restart a new run." : appLanguage === "zh-TW" ? "這一生已經結算，可以重新來一局。" : "这一生已经结算，可以重新来一局。";
  if (state.draftGender !== state.selectedGender || state.draftEnvironment !== state.selectedEnvironment) {
    return appLanguage === "en"
      ? "You changed the identity draft. If you want a new starting point, confirm it in the modal and begin a new run."
      : appLanguage === "zh-TW"
        ? "你改了身份設定，想切換人生起點的話，先透過彈窗確認並開新局。"
        : "你改了身份设定，想切换人生起点的话，先通过弹窗确认并开新局。";
  }
  if (state.money < getMonthlyLivingCost() + 120) return appLanguage === "en" ? "Your survival cost is not low. Protect cashflow first." : appLanguage === "zh-TW" ? "你現在的生存成本不低，現金流要先守住。" : "你现在的生存成本不低，现金流要先守住。";
  if (state.health < 45 || state.energy < 35) return appLanguage === "en" ? "You are close to running yourself down. Recovery is probably the better move this month." : appLanguage === "zh-TW" ? "你快透支了，本月更適合休整。" : "你快透支了，本月更适合休整。";
  if (state.career < 40 && state.age >= 24) return appLanguage === "en" ? "Career momentum is lagging. Study or work can push it forward." : appLanguage === "zh-TW" ? "事業推進有點慢，學習或工作都能補。" : "事业推进有点慢，学习或工作都能补。";
  if (state.social < 35 && state.age >= 26) return appLanguage === "en" ? "You can live alone, but many openings still come through people." : appLanguage === "zh-TW" ? "一個人也能活，但很多機會來自關係。" : "一个人也能活，但很多机会来自关系。";
  if (state.stress > 70) return appLanguage === "en" ? "Stress is too high. If you force it, the collapse may chain into everything else." : appLanguage === "zh-TW" ? "壓力太高，再硬撐很可能連鎖崩盤。" : "压力太高，再硬撑很可能连锁崩盘。";
  return appLanguage === "en" ? "Handle this month clearly before thinking too far ahead." : appLanguage === "zh-TW" ? "先把這個月活明白，再想更遠的事。" : "先把这个月活明白，再想更远的事。";
}

function createImpactList() {
  const gender = getGenderDefinition(state.selectedGender);
  const environment = getEnvironmentDefinition(state.selectedEnvironment);
  if (appLanguage === "en") {
    return [
      `${gender.label}: ${gender.trait}`,
      `${environment.label}: ${environment.trait}`,
      `Fixed survival cost: ${formatMoney(getMonthlyLivingCost())} / month. ${environment.monthlyStressDelta > 0 ? `This environment also adds ${environment.monthlyStressDelta} baseline stress each month.` : "This environment adds no extra baseline stress on its own."}`,
      `Most recent identity aftereffect: ${state.lastEffects.length > 0 ? state.lastEffects.map(translateNote).join(" / ") : "No identity aftereffect has been recorded yet."}`,
    ];
  }
  if (appLanguage === "zh-TW") {
    return [
      `${gender.label} 視角：${gender.trait}`,
      `${environment.label}：${environment.trait}`,
      `固定生存成本：${formatMoney(getMonthlyLivingCost())} / 月。${environment.monthlyStressDelta > 0 ? `每月還會額外增加 ${environment.monthlyStressDelta} 點基礎壓力。` : "這個環境本身不會額外推高你的基礎壓力。"}`,
      `最近一次身份餘波：${state.lastEffects.length > 0 ? state.lastEffects.map(translateNote).join(" / ") : "目前還沒有被記錄的身份餘波。"}`,
    ];
  }
  return [
    `${gender.label} 视角：${gender.trait}`,
    `${environment.label}：${environment.trait}`,
    `固定生存成本：${formatMoney(getMonthlyLivingCost())} / 月。${environment.monthlyStressDelta > 0 ? `每月还会额外增加 ${environment.monthlyStressDelta} 点基础压力。` : "这个环境本身不会额外推高你的基础压力。"}`,
    `最近一次身份余波：${state.lastEffects.length > 0 ? state.lastEffects.map(translateNote).join(" / ") : "当前还没有被记录的身份余波。"}`,
  ];
}

function eventTitleAndStory(event) {
  if (!event) {
    return { title: "", story: "" };
  }
  if (event.kind === "intro") {
    const intro = buildIntroCopy(event);
    return { title: intro.title, story: intro.story };
  }
  if (event.kind === "action") {
    const result = translateResult(event.result);
    const notes = event.noteKeys?.length ? ` ${event.noteKeys.map(translateNote).join(appLanguage === "en" ? " / " : " / ")}` : "";
    const changes = normalizeChanges(event.changes);
    const changeSummary = changes.length
      ? ` ${appLanguage === "en" ? "Most visible shift:" : appLanguage === "zh-TW" ? "最明顯的變化：" : "最明显的变化："} ${changes.map((change) => `${getAttributeLabel(change.key)} ${formatAttributeDelta(change.key, change.value)}`).join(" / ")}`
      : "";
    return { title: result.title, story: `${result.story}${notes}${changeSummary}` };
  }
  return { title: state.lastTitle ?? "", story: state.lastStory ?? "" };
}

function renderLogEntry(entry) {
  if (entry.kind === "legacy") {
    return { time: entry.time ?? "", text: entry.text ?? "" };
  }
  const time = appLanguage === "en"
    ? `${entry.age} · ${getMonths()[entry.monthIndex]}`
    : `${entry.age} ${appLanguage === "zh-TW" ? "歲" : "岁"} · ${getMonths()[entry.monthIndex]}`;
  if (entry.kind === "intro") {
    return { time, text: buildIntroCopy(entry).log };
  }
  if (entry.kind === "action") {
    const result = translateResult(entry.result);
    const notes = entry.noteKeys?.length ? ` ${entry.noteKeys.map(translateNote).join(" / ")}` : "";
    const normalizedChanges = normalizeChanges(entry.changes);
    const changes = normalizedChanges.length ? ` ${normalizedChanges.map((change) => `${getAttributeLabel(change.key)} ${formatAttributeDelta(change.key, change.value)}`).join(" / ")}` : "";
    return { time, text: `${result.title} ${result.story}${notes}${changes}`.trim() };
  }
  if (entry.kind === "milestone") {
    return { time, text: getPack().milestones[entry.milestoneKey] };
  }
  return { time, text: "" };
}

function renderLanguageSwitcher() {
  elements.languageSwitcher.innerHTML = "";
  const pack = getPack();
  SUPPORTED_LANGUAGES.forEach((language) => {
    const option = document.createElement("option");
    option.value = language;
    option.textContent = pack.languageNames[language];
    option.selected = language === appLanguage;
    elements.languageSwitcher.appendChild(option);
  });
}

function renderStaticText() {
  const pack = getPack();
  document.documentElement.lang = pack.langAttr;
  document.title = pack.pageTitle;
  elements.eyebrowText.textContent = pack.eyebrow;
  elements.languageLabel.textContent = pack.languageLabel;
  elements.heroTitle.textContent = pack.heroTitle;
  elements.heroLead.textContent = pack.heroLead;
  elements.openIdentityModalButton.textContent = pack.ui.jumpIdentity;
  elements.restartButton.textContent = pack.ui.restart;
  elements.inlineIdentityTitle.textContent = pack.ui.inlineIdentityTitle;
  elements.inlineIdentitySubtitle.textContent = pack.ui.inlineIdentitySubtitle;
  elements.inlineIdentityGenderLabel.textContent = pack.ui.identityGender;
  elements.inlineIdentityEnvironmentLabel.textContent = pack.ui.identityEnvironment;
  elements.inlineIdentityPreviewLabel.textContent = pack.ui.identityPreview;
  elements.goalLabel.textContent = pack.ui.goalLabel;
  elements.currentMonthLabel.textContent = pack.ui.currentMonth;
  elements.actionCaptionText.textContent = pack.ui.actionCaption;
  elements.currentBaseLabel.textContent = pack.ui.currentBase;
  elements.currentBaseSubtitle.textContent = pack.ui.currentBaseSubtitle;
  elements.careerProgressLabel.textContent = pack.ui.progressCareer;
  elements.lifeProgressLabel.textContent = pack.ui.progressLife;
  elements.summaryIdentityEffects.textContent = pack.ui.summaryIdentityEffects;
  elements.summaryLifeLog.textContent = pack.ui.summaryLifeLog;
  elements.summaryLongterm.textContent = pack.ui.summaryLongterm;
  elements.identityModalEyebrow.textContent = pack.ui.identityEyebrow;
  elements.identityModalTitle.textContent = pack.ui.identityTitle;
  elements.identityModalClose.textContent = pack.ui.close;
  elements.identityGenderLabel.textContent = pack.ui.identityGender;
  elements.identityEnvironmentLabel.textContent = pack.ui.identityEnvironment;
  elements.identityPreviewLabel.textContent = pack.ui.identityPreview;
  elements.identityModalCancel.textContent = pack.ui.later;
  elements.actionModalEyebrow.textContent = pack.ui.actionEyebrow;
  elements.actionModalTitle.textContent = pack.ui.actionTitle;
  elements.actionModalClose.textContent = pack.ui.close;
  elements.actionPreviewLabel.textContent = pack.ui.actionPreview;
  elements.inlineActionPreviewLabel.textContent = pack.ui.actionPreview;
  elements.actionModalCancel.textContent = pack.ui.thinkAgain;
  elements.confirmActionButton.textContent = pack.ui.confirmAction;
  elements.hintList.innerHTML = "";
  pack.ui.hintList.forEach((hint) => {
    const item = document.createElement("li");
    item.textContent = hint;
    elements.hintList.appendChild(item);
  });
  renderLanguageSwitcher();
}

function renderFocusStats() {
  elements.focusStats.innerHTML = "";
  createFocusStats().forEach(([label, value]) => {
    const node = document.createElement("div");
    node.className = "focus-stat";
    node.innerHTML = `<span>${label}</span><strong>${value}</strong>`;
    elements.focusStats.appendChild(node);
  });
}

function renderProfileBadges() {
  const pack = getPack();
  const gender = getGenderDefinition(state.selectedGender);
  const environment = getEnvironmentDefinition(state.selectedEnvironment);
  elements.profileBadges.innerHTML = "";
  [
    [pack.ui.badgeGender, gender.label],
    [pack.ui.badgeEnvironment, environment.label],
    [pack.ui.badgeMonthlyCost, formatMoney(getMonthlyLivingCost())],
  ].forEach(([label, value]) => {
    const badge = document.createElement("div");
    badge.className = "profile-badge";
    badge.innerHTML = `<span>${label}</span><strong>${value}</strong>`;
    elements.profileBadges.appendChild(badge);
  });
}

function renderImpactList() {
  elements.impactList.innerHTML = "";
  createImpactList().forEach((text) => {
    const item = document.createElement("div");
    item.className = "impact-item";
    item.textContent = text;
    elements.impactList.appendChild(item);
  });
}

function renderLog() {
  elements.logList.innerHTML = "";
  state.log.slice(0, 10).forEach((entry) => {
    const rendered = renderLogEntry(entry);
    const item = document.createElement("li");
    item.className = "log-item";
    const time = document.createElement("small");
    time.textContent = rendered.time;
    const text = document.createElement("div");
    text.textContent = rendered.text;
    item.append(time, text);
    elements.logList.appendChild(item);
  });
}

function renderOptionGroup(container, items, selectedKey, onSelect, type) {
  container.innerHTML = "";
  const pack = getPack();
  items.forEach((item, index) => {
    const translated = type === "gender" ? getGenderDefinition(item.key) : type === "environment" ? getEnvironmentDefinition(item.key) : getActionDefinition(item.key);
    const actionPreview = type === "action" ? buildActionOptionPreview(translated) : "";
    const button = document.createElement("button");
    button.type = "button";
    button.className = `option-button${selectedKey === item.key ? " is-selected" : ""}`;
    button.innerHTML = `
      <div class="option-head">
        <strong><span class="choice-number">${index + 1}</span>${translated.label ?? translated.title}</strong>
        <span class="option-kicker">${selectedKey === item.key ? pack.ui.optionSelected : pack.ui.optionAvailable}</span>
      </div>
      <p>${translated.brief ?? translated.description}</p>
      ${actionPreview}
    `;
    button.addEventListener("click", () => onSelect(item.key));
    container.appendChild(button);
  });
}

function buildActionOptionPreview(action) {
  const pack = getPack();
  const previewNotes = previewEffectsForAction(action.key);
  const aftereffects = previewNotes.length > 0
    ? previewNotes.join(" / ")
    : appLanguage === "en"
      ? "No strong extra bias this time."
      : appLanguage === "zh-TW"
        ? "這次不會觸發明顯的額外偏置。"
        : "这次不会触发明显的额外偏置。";
  const hintLabel = appLanguage === "en" ? "Tendency" : appLanguage === "zh-TW" ? "傾向" : "倾向";
  const aftereffectLabel = appLanguage === "en" ? "Aftereffect" : appLanguage === "zh-TW" ? "餘波" : "余波";

  return `
    <div class="option-preview-lines">
      <span><strong>${escapeHtml(pack.ui.forecastLabel)}：</strong>${escapeHtml(buildActionForecast(action.key))}</span>
      <span><strong>${hintLabel}：</strong>${escapeHtml(action.hint)}</span>
      <span><strong>${aftereffectLabel}：</strong>${escapeHtml(aftereffects)}</span>
    </div>
  `;
}

function renderStepIndicator(container, steps, activeKey) {
  container.innerHTML = steps.map((step) => {
    const stateClass = step.key === activeKey ? " is-active" : step.done ? " is-done" : "";
    return `<span class="step-pill${stateClass}">${escapeHtml(step.label)}</span>`;
  }).join("");
}

function setVisibleStep(element, visible) {
  element.classList.toggle("step-panel-hidden", !visible);
}

function resetProgressiveSteps() {
  uiState.identityStep = "gender";
  uiState.actionStep = "choose";
  uiState.draftActionKey = DEFAULT_ACTION;
}

function isFreshRun() {
  return state.hasStarted !== true;
}

function isSetupVisible() {
  if (uiState.setupMode === "setup") return true;
  if (uiState.setupMode === "game") return false;
  return isFreshRun();
}

function showSetupScreen() {
  uiState.setupMode = "setup";
  uiState.identityStep = "gender";
  renderStatus();
  elements.identitySetupPanel.scrollIntoView({ behavior: "smooth", block: "start" });
}

function showGameScreen() {
  uiState.setupMode = "game";
  renderStatus();
  elements.gamePanel.scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderInlineIdentitySetup() {
  renderOptionGroup(elements.inlineSetupGenderList, genderDefinitions, state.draftGender, (key) => {
    state.draftGender = key;
    uiState.identityStep = "environment";
    saveState();
    renderStatus();
  }, "gender");

  renderOptionGroup(elements.inlineSetupEnvironmentList, environmentDefinitions, state.draftEnvironment, (key) => {
    state.draftEnvironment = key;
    uiState.identityStep = "preview";
    saveState();
    renderStatus();
  }, "environment");

  const gender = getGenderDefinition(state.draftGender);
  const environment = getEnvironmentDefinition(state.draftEnvironment);
  const pending = state.draftGender !== state.selectedGender || state.draftEnvironment !== state.selectedEnvironment;
  const pendingText = appLanguage === "en"
    ? "Starting will reset the journal and enter the first life event."
    : appLanguage === "zh-TW"
      ? "開始後會清空本世紀錄，進入第一個人生事件。"
      : "开始后会清空本世记录，进入第一个人生事件。";
  const activeText = appLanguage === "en"
    ? "This is the current character setup. Restarting from it creates a fresh run."
    : appLanguage === "zh-TW"
      ? "這就是目前角色設定；用它重開會建立一個全新人生。"
      : "这就是当前角色设定；用它重开会建立一个全新人生。";
  const monthlyCostText = appLanguage === "en"
    ? `Starting survival cost: ${formatMoney(getMonthlyLivingCost({ selectedEnvironment: state.draftEnvironment }))} / month`
    : appLanguage === "zh-TW"
      ? `初始生存成本：${formatMoney(getMonthlyLivingCost({ selectedEnvironment: state.draftEnvironment }))} / 月`
      : `初始生存成本：${formatMoney(getMonthlyLivingCost({ selectedEnvironment: state.draftEnvironment }))} / 月`;

  renderStepIndicator(elements.identityStepIndicator, [
    { key: "gender", label: getPack().ui.stepGender, done: uiState.identityStep !== "gender" },
    { key: "environment", label: getPack().ui.stepEnvironment, done: uiState.identityStep === "preview" },
    { key: "preview", label: getPack().ui.stepPreview, done: false },
  ], uiState.identityStep);

  setVisibleStep(elements.inlineGenderStep, uiState.identityStep === "gender");
  setVisibleStep(elements.inlineEnvironmentStep, uiState.identityStep === "environment");
  setVisibleStep(elements.inlineIdentityPreviewStep, uiState.identityStep === "preview");
  elements.identityStepBackButton.classList.toggle("hidden", uiState.identityStep === "gender");
  elements.inlineApplyProfileButton.classList.toggle("hidden", uiState.identityStep !== "preview");

  elements.inlineSetupPreviewBody.innerHTML = `
    <strong class="preview-title">${gender.label} × ${environment.label}</strong>
    <p class="preview-copy">${gender.trait} ${environment.trait}</p>
    <ul class="preview-list">
      <li>${monthlyCostText}</li>
      <li>${pending ? pendingText : activeText}</li>
    </ul>
  `;
  elements.identityStepBackButton.textContent = getPack().ui.stepBack;
  elements.inlineApplyProfileButton.textContent = pending ? (appLanguage === "en" ? "Start life" : appLanguage === "zh-TW" ? "開始人生" : "开始人生") : getPack().ui.restart;
}

function renderIdentityModal() {
  renderOptionGroup(elements.setupGenderList, genderDefinitions, state.draftGender, (key) => {
    state.draftGender = key;
    saveState();
    renderIdentityModal();
    renderStatus();
  }, "gender");

  renderOptionGroup(elements.setupEnvironmentList, environmentDefinitions, state.draftEnvironment, (key) => {
    state.draftEnvironment = key;
    saveState();
    renderIdentityModal();
    renderStatus();
  }, "environment");

  const gender = getGenderDefinition(state.draftGender);
  const environment = getEnvironmentDefinition(state.draftEnvironment);
  const pending = state.draftGender !== state.selectedGender || state.draftEnvironment !== state.selectedEnvironment;
  const pendingText = appLanguage === "en"
    ? "You changed the draft but have not applied it to the current life yet."
    : appLanguage === "zh-TW"
      ? "你已經改了草稿，還沒有正式套用到目前人生。"
      : "你已经改了草稿，还没有正式应用到当前人生。";
  const activeText = appLanguage === "en"
    ? "This identity setup is currently active."
    : appLanguage === "zh-TW"
      ? "目前正在使用這套身份設定。"
      : "当前正在使用这一套身份设定。";
  const persistentText = appLanguage === "en"
    ? "This identity will keep affecting monthly narrative and numbers, not just the start."
    : appLanguage === "zh-TW"
      ? "這一套身份會持續影響每個月的敘事與數值，不只影響開局。"
      : "这一套身份会持续影响每个月的叙事和数值，不只影响开局。";
  const monthlyCostText = appLanguage === "en"
    ? `Starting survival cost: ${formatMoney(getMonthlyLivingCost({ selectedEnvironment: state.draftEnvironment }))} / month`
    : appLanguage === "zh-TW"
      ? `初始生存成本：${formatMoney(getMonthlyLivingCost({ selectedEnvironment: state.draftEnvironment }))} / 月`
      : `初始生存成本：${formatMoney(getMonthlyLivingCost({ selectedEnvironment: state.draftEnvironment }))} / 月`;

  elements.setupPreviewBody.innerHTML = `
    <strong class="preview-title">${gender.label} × ${environment.label}</strong>
    <p class="preview-copy">${gender.trait} ${environment.trait}</p>
    <ul class="preview-list">
      <li>${monthlyCostText}</li>
      <li>${persistentText}</li>
      <li>${pending ? pendingText : activeText}</li>
    </ul>
  `;

  elements.applyProfileButton.textContent = pending ? (appLanguage === "en" ? "Start with this identity" : appLanguage === "zh-TW" ? "以這個身份開局" : "以这个身份开局") : getPack().ui.restart;
}

function renderActionModal() {
  const pack = getPack();
  const selectedAction = getActionDefinition(uiState.draftActionKey);
  const previewNotes = previewEffectsForAction(selectedAction.key);
  renderOptionGroup(elements.actionList, actionDefinitions, uiState.draftActionKey, (key) => {
    uiState.draftActionKey = key;
    renderActionModal();
  }, "action");

  elements.actionPreviewBody.innerHTML = `
    <strong class="preview-title">${selectedAction.title}</strong>
    <p class="preview-copy">${selectedAction.description}</p>
    <ul class="preview-list">
      <li><strong>${pack.ui.forecastLabel}：</strong>${buildActionForecast(selectedAction.key)}</li>
      <li>${appLanguage === "en" ? `Base tendency: ${selectedAction.hint}` : appLanguage === "zh-TW" ? `基礎傾向：${selectedAction.hint}` : `基础倾向：${selectedAction.hint}`}</li>
      <li>${previewNotes.length > 0 ? (appLanguage === "en" ? `Identity aftereffects: ${previewNotes.join(" / ")}` : appLanguage === "zh-TW" ? `身份餘波：${previewNotes.join(" / ")}` : `身份余波：${previewNotes.join(" / ")}`) : (appLanguage === "en" ? "Identity aftereffects: no strong extra bias this time." : appLanguage === "zh-TW" ? "身份餘波：這次不會觸發明顯的額外偏置。" : "身份余波：这次不会触发明显的额外偏置。")}</li>
      <li>${state.ended ? (appLanguage === "en" ? "This run has already ended, so you cannot make another monthly choice." : appLanguage === "zh-TW" ? "本局已結算，目前無法再做本月決定。" : "本局已结算，当前无法再做本月决定。") : (appLanguage === "en" ? "Confirming will resolve this month immediately and advance to the next one." : appLanguage === "zh-TW" ? "確認後會立刻結算本月，並推進到下個月。" : "确认后会立刻结算本月，并推进到下个月。")}</li>
    </ul>
  `;
  elements.confirmActionButton.disabled = state.ended;
  elements.confirmActionButton.textContent = pack.ui.confirmAction;
}

function renderInlineActionChooser() {
  const pack = getPack();
  const isChoosing = !state.ended && uiState.actionStep === "choose";
  const isOutcome = !state.ended && uiState.actionStep === "outcome";
  if (isChoosing) {
    renderOptionGroup(elements.inlineActionList, actionDefinitions, uiState.draftActionKey, (key) => {
      uiState.draftActionKey = key;
      takeAction(key);
    }, "action");
  } else {
    elements.inlineActionList.innerHTML = "";
  }

  renderStepIndicator(elements.actionStepIndicator, [
    { key: "choose", label: pack.ui.stepAction, done: isOutcome },
    { key: "outcome", label: appLanguage === "en" ? "Result" : appLanguage === "zh-TW" ? "結果" : "结果", done: false },
  ], uiState.actionStep);

  setVisibleStep(elements.inlineActionList, isChoosing);
  elements.inlineActionPreviewBody.parentElement.classList.toggle("step-panel-hidden", !isOutcome);
  elements.actionStepBackButton.classList.add("hidden");
  elements.openActionModalButton.classList.toggle("hidden", !isOutcome);
  elements.actionStepBackButton.textContent = pack.ui.stepBack;
  elements.inlineActionPreviewBody.innerHTML = isOutcome ? buildActionOutcomeHtml() : "";
}

function buildActionOutcomeHtml() {
  if (state.currentEvent?.kind !== "action") return "";
  const action = getActionDefinition(state.currentEvent.actionKey);
  const result = translateResult(state.currentEvent.result);
  const notes = state.currentEvent.noteKeys?.length
    ? state.currentEvent.noteKeys.map(translateNote).join(" / ")
    : appLanguage === "en"
      ? "No extra aftereffect this month."
      : appLanguage === "zh-TW"
        ? "本月沒有額外餘波。"
        : "本月没有额外余波。";
  const actionLabel = appLanguage === "en" ? "Your choice" : appLanguage === "zh-TW" ? "你的選擇" : "你的选择";
  const aftereffectLabel = appLanguage === "en" ? "Aftereffect" : appLanguage === "zh-TW" ? "餘波" : "余波";
  const changeLabel = getPack().ui.changeLabel;

  return `
    <strong class="preview-title">${escapeHtml(result.title)}</strong>
    <p class="preview-copy">${escapeHtml(result.story)}</p>
    <div class="outcome-facts">
      <span><strong>${actionLabel}：</strong>${escapeHtml(action.title)}</span>
      <span><strong>${aftereffectLabel}：</strong>${escapeHtml(notes)}</span>
    </div>
    <div class="change-summary outcome-change-summary">
      <span class="change-label">${escapeHtml(changeLabel)}</span>
      ${renderChangeSummary(state.currentEvent.changes ?? [])}
    </div>
  `;
}

function renderEnding() {
  if (!state.ended || !state.endingKey) {
    elements.endingPanel.classList.add("hidden");
    elements.endingPanel.innerHTML = "";
    return;
  }
  const ending = getPack().endings[state.endingKey];
  elements.endingPanel.classList.remove("hidden");
  elements.endingPanel.innerHTML = `<h3>${ending.title}</h3><p>${ending.text}</p>`;
}

function renderModalVisibility() {
  const anyModalOpen = uiState.identityModalOpen || uiState.actionModalOpen;
  elements.body.classList.toggle("modal-open", anyModalOpen);
  elements.identityModal.classList.toggle("hidden", !uiState.identityModalOpen);
  elements.identityModal.setAttribute("aria-hidden", String(!uiState.identityModalOpen));
  elements.actionModal.classList.toggle("hidden", !uiState.actionModalOpen);
  elements.actionModal.setAttribute("aria-hidden", String(!uiState.actionModalOpen));
}

function renderStatusCollapse() {
  const collapseText = appLanguage === "en" ? "Collapse" : appLanguage === "zh-TW" ? "收起" : "收起";
  const expandText = appLanguage === "en" ? "Status" : appLanguage === "zh-TW" ? "狀態" : "状态";
  const needsAttention = state.money < getMonthlyLivingCost() || state.health < 40 || state.mood < 40 || state.energy < 35 || state.stress > 70 || getLifeScore() < 42;
  const attentionLabel = appLanguage === "en" ? "needs attention" : appLanguage === "zh-TW" ? "有指標需要關注" : "有指标需要关注";
  elements.body.classList.toggle("status-collapsed", uiState.statusCollapsed);
  elements.body.classList.toggle("status-needs-attention", needsAttention);
  elements.statusCollapseButton.textContent = uiState.statusCollapsed ? expandText : collapseText;
  elements.statusCollapseButton.setAttribute("aria-expanded", String(!uiState.statusCollapsed));
  elements.statusCollapseButton.setAttribute("aria-label", needsAttention ? `${elements.statusCollapseButton.textContent}，${attentionLabel}` : elements.statusCollapseButton.textContent);
}

function renderFocusedChoiceMode(setupVisible) {
  const inSetupChoice = setupVisible && (uiState.identityStep === "gender" || uiState.identityStep === "environment");
  const inActionChoice = !setupVisible && !state.ended && uiState.actionStep === "choose";
  const inActionOutcome = !setupVisible && !state.ended && uiState.actionStep === "outcome";
  elements.body.classList.toggle("choice-focus-mode", inSetupChoice || inActionChoice);
  elements.body.classList.toggle("setup-choice-focus", inSetupChoice);
  elements.body.classList.toggle("action-choice-focus", inActionChoice);
  elements.body.classList.toggle("action-outcome-mode", inActionOutcome);
}

function renderStatus() {
  renderStaticText();
  updateTitle();
  const gender = getGenderDefinition(state.selectedGender);
  const environment = getEnvironmentDefinition(state.selectedEnvironment);
  const eventText = eventTitleAndStory(state.currentEvent);
  const setupVisible = isSetupVisible();

  elements.identitySetupPanel.classList.toggle("screen-hidden", !setupVisible);
  elements.gamePanel.classList.toggle("screen-hidden", setupVisible);
  renderFocusedChoiceMode(setupVisible);
  elements.turnIndicator.textContent = appLanguage === "en" ? `Month ${state.turn}` : appLanguage === "zh-TW" ? `第 ${state.turn} 個月` : `第 ${state.turn} 个月`;
  elements.ageIndicator.textContent = appLanguage === "en" ? `${state.age} · ${getMonths()[state.monthIndex]}` : `${state.age} ${appLanguage === "zh-TW" ? "歲" : "岁"} · ${getMonths()[state.monthIndex]}`;
  elements.stageIndicator.textContent = state.ended ? getPack().ui.stageEnded : getPack().ui.stageActive;
  elements.identityPressure.textContent = buildPressureLine();
  elements.storyTitle.textContent = eventText.title;
  elements.storyText.textContent = `${buildMonthlyAtmosphere()} ${eventText.story}`;
  const latestChanges = state.currentEvent?.kind === "action" ? state.currentEvent.changes ?? [] : [];
  elements.currentChoiceSummary.innerHTML = `
    <p>${escapeHtml(buildCurrentChoiceSummary())}</p>
    <div class="change-summary">
      <span class="change-label">${escapeHtml(getPack().ui.changeLabel)}</span>
      ${renderChangeSummary(latestChanges)}
    </div>
  `;
  elements.profileText.textContent = appLanguage === "en"
    ? `${state.title} · ${getConditionTag()}. You are currently living from the position of ${gender.label} / ${environment.label}, holding ${formatMoney(state.money)}, with overall life satisfaction at ${getLifeScore()} / 100.`
    : appLanguage === "zh-TW"
      ? `${state.title} · ${getConditionTag()}。你現在以 ${gender.label} / ${environment.label} 的位置在活，手裡有 ${formatMoney(state.money)}，整體人生滿足度 ${getLifeScore()} / 100。`
      : `${state.title} · ${getConditionTag()}。你现在以 ${gender.label} / ${environment.label} 的位置在活，手里有 ${formatMoney(state.money)}，整体人生满足度 ${getLifeScore()} / 100。`;
  elements.goalText.textContent = buildGoalHint();
  elements.progressCareer.value = clamp(state.career);
  elements.progressLife.value = getLifeScore();
  elements.openActionModalButton.disabled = state.ended;
  elements.openActionModalButton.textContent = state.ended ? getPack().ui.endedButton : getPack().ui.openAction;

  renderInlineIdentitySetup();
  renderProfileBadges();
  renderFocusStats();
  renderImpactList();
  renderLog();
  renderEnding();
  renderIdentityModal();
  renderActionModal();
  renderInlineActionChooser();
  renderStatusCollapse();
  renderModalVisibility();
}

function closeModal(type) {
  if (type === "identity") uiState.identityModalOpen = false;
  if (type === "action") uiState.actionModalOpen = false;
  renderStatus();
}

function applyPassiveMonthlyChange() {
  const notes = [];
  const environment = environmentDefinitions.find((item) => item.key === state.selectedEnvironment) ?? environmentDefinitions[0];
  state.money -= environment.monthlyCost;
  state.stress = clamp(state.stress + environment.monthlyStressDelta);
  applyEffect(getGenderRecurringEffect(state), notes);
  applyEffect(getEnvironmentRecurringEffect(state), notes);
  if (state.money < 0) {
    state.mood = clamp(state.mood - 5);
    state.health = clamp(state.health - 4);
    notes.push("debt");
  }
  if (state.stress >= 78) {
    state.health = clamp(state.health - 6);
    state.energy = clamp(state.energy - 6);
    notes.push("burnout");
  }
  if (state.age >= 30 && state.restBuffer !== true) {
    state.energy = clamp(state.energy - 1);
  }
  delete state.restBuffer;
  return notes;
}

function actionStudy() {
  state.knowledge = clamp(state.knowledge + randomInt(7, 12));
  state.career = clamp(state.career + randomInt(3, 7));
  state.energy = clamp(state.energy - randomInt(6, 11));
  state.mood = clamp(state.mood - randomInt(1, 4));
  state.money -= randomInt(120, 260);
  state.stress = clamp(state.stress + randomInt(4, 8));
  if (state.knowledge > 78 && Math.random() < 0.34) {
    state.career = clamp(state.career + 8);
    state.money += 600;
    return { key: "study_breakthrough", data: {} };
  }
  return { key: "study_steady", data: {} };
}

function actionWork() {
  const incomeValue = randomInt(520, 980) + Math.floor(state.career * 3.2);
  state.money += incomeValue;
  state.career = clamp(state.career + randomInt(4, 8));
  state.energy = clamp(state.energy - randomInt(7, 12));
  state.stress = clamp(state.stress + randomInt(7, 12));
  state.mood = clamp(state.mood - randomInt(1, 6));
  if (state.career > 62 && state.stress < 72 && Math.random() < 0.28) {
    state.money += 1200;
    state.mood = clamp(state.mood + 5);
    return { key: "work_promotion", data: { income: formatMoney(incomeValue + 1200) } };
  }
  return { key: "work_steady", data: { income: formatMoney(incomeValue) } };
}

function actionSocial() {
  state.social = clamp(state.social + randomInt(6, 11));
  state.mood = clamp(state.mood + randomInt(4, 9));
  state.money -= randomInt(140, 340);
  state.energy = clamp(state.energy - randomInt(2, 5));
  state.stress = clamp(state.stress - randomInt(4, 8));
  if (state.stress > 75 && Math.random() < 0.45) {
    state.mood = clamp(state.mood - 8);
    return { key: "social_exhausted", data: {} };
  }
  if (state.social >= 70 && Math.random() < 0.3) {
    state.career = clamp(state.career + 7);
    return { key: "social_opportunity", data: {} };
  }
  return { key: "social_steady", data: {} };
}

function actionRest() {
  state.health = clamp(state.health + randomInt(7, 12));
  state.energy = clamp(state.energy + randomInt(8, 14));
  state.mood = clamp(state.mood + randomInt(3, 7));
  state.stress = clamp(state.stress - randomInt(7, 13));
  state.money -= randomInt(80, 180);
  state.restBuffer = true;
  if (state.health >= 82 && Math.random() < 0.22) {
    state.mood = clamp(state.mood + 7);
    return { key: "rest_recover", data: {} };
  }
  return { key: "rest_steady", data: {} };
}

function actionRisk() {
  state.energy = clamp(state.energy - randomInt(4, 9));
  state.stress = clamp(state.stress + randomInt(3, 9));
  const roll = Math.random();
  if (roll < 0.25) {
    const gainValue = randomInt(900, 2200);
    state.money += gainValue;
    state.career = clamp(state.career + 10);
    state.mood = clamp(state.mood + 8);
    return { key: "risk_win", data: { gain: formatMoney(gainValue) } };
  }
  if (roll < 0.58) {
    state.social = clamp(state.social + randomInt(2, 8));
    state.career = clamp(state.career + randomInt(2, 6));
    state.mood = clamp(state.mood + randomInt(1, 5));
    return { key: "risk_push", data: {} };
  }
  const lossValue = randomInt(300, 1100);
  state.money -= lossValue;
  state.mood = clamp(state.mood - randomInt(5, 10));
  state.health = clamp(state.health - randomInt(2, 6));
  return { key: "risk_fail", data: { loss: formatMoney(lossValue) } };
}

const actionHandlers = { study: actionStudy, work: actionWork, social: actionSocial, rest: actionRest, risk: actionRisk };

function maybeMilestone() {
  if (state.age === 22 && state.monthIndex === 0) {
    state.mood = clamp(state.mood + 5);
    state.log.unshift({ kind: "milestone", age: state.age, monthIndex: state.monthIndex, milestoneKey: "age22" });
  }
  if (state.age === 26 && state.monthIndex === 0 && state.social >= 58) {
    state.career = clamp(state.career + 8);
    state.log.unshift({ kind: "milestone", age: state.age, monthIndex: state.monthIndex, milestoneKey: "age26" });
  }
  if (state.age === 30 && state.monthIndex === 0) {
    state.mood = clamp(state.mood - 2);
    state.log.unshift({ kind: "milestone", age: state.age, monthIndex: state.monthIndex, milestoneKey: "age30" });
  }
}

function checkEnding() {
  if (state.health <= 18 || state.mood <= 15) {
    state.ended = true;
    state.endingKey = "burnout";
    return;
  }
  if (state.age >= 36) {
    state.ended = true;
    if (state.career >= 82 && state.money >= 12000) state.endingKey = "career";
    else if (state.social >= 80 && state.mood >= 72) state.endingKey = "social";
    else if (state.knowledge >= 85 && state.career >= 68) state.endingKey = "growth";
    else state.endingKey = "balanced";
  }
}

function advanceMonth() {
  state.monthIndex += 1;
  if (state.monthIndex > 11) {
    state.monthIndex = 0;
    state.age += 1;
  }
  state.turn += 1;
}

function takeAction(actionKey) {
  if (state.ended) return;
  const before = captureSnapshot();
  const passiveNotes = applyPassiveMonthlyChange();
  const result = actionHandlers[actionKey]();
  const identityNotes = [];
  applyEffect(getGenderActionEffect(state, actionKey), identityNotes);
  applyEffect(getEnvironmentActionEffect(state, actionKey), identityNotes);
  const allNoteKeys = [...passiveNotes, ...identityNotes];
  const changes = describeStateChanges(before, state);
  state.lastActionKey = actionKey;
  state.lastEffects = allNoteKeys;
  state.currentEvent = { kind: "action", actionKey, result, noteKeys: allNoteKeys, changes };
  state.log.unshift(createLogEntry("action", { actionKey, result, noteKeys: allNoteKeys, changes }));
  checkEnding();
  if (!state.ended) {
    advanceMonth();
    maybeMilestone();
    checkEnding();
  }
  uiState.actionStep = state.ended ? "ended" : "outcome";
  closeModal("action");
  saveState();
  renderStatus();
}

function restartGame() {
  state = createState({ genderKey: state.draftGender, environmentKey: state.draftEnvironment });
  state.hasStarted = true;
  resetProgressiveSteps();
  uiState.setupMode = "game";
  saveState();
  renderStatus();
}

function bindModalClosers() {
  document.querySelectorAll("[data-close-modal]").forEach((button) => {
    button.addEventListener("click", () => {
      const type = button.getAttribute("data-close-modal");
      closeModal(type);
    });
  });
}

elements.restartButton.addEventListener("click", restartGame);
elements.languageSwitcher.addEventListener("change", (event) => {
  const nextLanguage = event.target.value;
  setLanguage(nextLanguage);
});
elements.statusCollapseButton.addEventListener("click", () => {
  uiState.statusCollapsed = !uiState.statusCollapsed;
  renderStatusCollapse();
});
elements.openIdentityModalButton.addEventListener("click", showSetupScreen);
elements.openActionModalButton.addEventListener("click", () => {
  uiState.actionStep = "choose";
  saveState();
  renderStatus();
});
elements.applyProfileButton.addEventListener("click", () => {
  closeModal("identity");
  restartGame();
});
elements.inlineApplyProfileButton.addEventListener("click", () => {
  restartGame();
  showGameScreen();
});
elements.identityStepBackButton.addEventListener("click", () => {
  uiState.identityStep = uiState.identityStep === "preview" ? "environment" : "gender";
  renderStatus();
});
elements.actionStepBackButton.addEventListener("click", () => {
  uiState.actionStep = "choose";
  renderStatus();
});
elements.confirmActionButton.addEventListener("click", () => takeAction(uiState.draftActionKey));

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    if (uiState.actionModalOpen) closeModal("action");
    if (uiState.identityModalOpen) closeModal("identity");
  }
});

bindModalClosers();
renderStatus();
