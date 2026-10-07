const seasons = ["春", "夏", "秋", "冬"];
const maxRounds = 12;
const maxEnergy = 3;
const startingHandSize = 5;

const statLabels = {
  money: "现金",
  health: "健康",
  mood: "情绪",
  skill: "能力",
  relationship: "关系",
  stress: "压力",
};

const statLimits = {
  money: { min: -2000, max: 12000 },
  health: { min: 0, max: 100 },
  mood: { min: 0, max: 100 },
  skill: { min: 0, max: 100 },
  relationship: { min: 0, max: 100 },
  stress: { min: 0, max: 100 },
};

const fateDeck = [
  {
    id: "rent-pressure",
    type: "生存压迫",
    title: "房租和账单一起压来",
    intent: "本回合现金压力很强，若不处理会拖累情绪。",
    threat: 7,
    pressure: { money: -420, mood: -5, stress: 8 },
    weakness: ["生存", "事业", "机会"],
  },
  {
    id: "body-warning",
    type: "健康警报",
    title: "身体发出刺耳提醒",
    intent: "健康牌和休整牌更容易化解，本回合硬冲会更疼。",
    threat: 8,
    pressure: { health: -9, stress: 6, mood: -3 },
    weakness: ["健康", "休整", "自我"],
  },
  {
    id: "career-window",
    type: "窗口机会",
    title: "一个位置突然空出来",
    intent: "能力与事业牌能把压力转化成推进，否则机会会擦肩而过。",
    threat: 6,
    pressure: { stress: 7, mood: -2 },
    weakness: ["事业", "成长", "创造"],
  },
  {
    id: "lonely-week",
    type: "关系低潮",
    title: "热闹都离你很远",
    intent: "关系与社交牌能反制孤独，单打独斗会让情绪变薄。",
    threat: 5,
    pressure: { relationship: -5, mood: -7, stress: 4 },
    weakness: ["关系", "社交", "家庭"],
  },
  {
    id: "self-doubt",
    type: "内心质疑",
    title: "你开始怀疑自己是不是不够好",
    intent: "成长、自我、创造牌能稳定内核，冒险牌会更刺激。",
    threat: 6,
    pressure: { mood: -8, stress: 6, skill: -2 },
    weakness: ["成长", "自我", "创造"],
  },
  {
    id: "tempting-risk",
    type: "高风险诱惑",
    title: "有人递来一张看似翻身的门票",
    intent: "机会和冒险牌能正面对撞，但失败代价也会更大。",
    threat: 9,
    pressure: { money: -260, stress: 8 },
    weakness: ["机会", "冒险", "事业"],
  },
];

const cardDeck = [
  {
    id: "first-job",
    type: "事业",
    title: "接下难啃项目",
    cost: 2,
    power: 7,
    description: "把一段完整时间交给没人想碰的任务。它不体面，但很能证明你。",
    effects: { money: 850, skill: 7, stress: 12, mood: -4, health: -3 },
    dialogue: [
      { speaker: "主管", text: "这事确实麻烦，但如果你能扛下来，大家会重新看你。" },
      { speaker: "你", text: "我不是不怕，只是不想一直坐在边缘位置。" },
    ],
  },
  {
    id: "night-study",
    type: "成长",
    title: "夜里补课",
    cost: 1,
    power: 6,
    description: "拿出课程、笔记和空白简历，把未来一点点补厚。",
    effects: { money: -260, skill: 12, mood: -2, stress: 5, health: -2 },
    dialogue: [
      { speaker: "未来的你", text: "这一晚不会立刻改变命运，但它会改变你理解命运的方式。" },
      { speaker: "你", text: "我先不问结果，只把今天该懂的东西弄懂。" },
    ],
  },
  {
    id: "old-friend",
    type: "关系",
    title: "联系老朋友",
    cost: 1,
    power: 5,
    description: "认真约一顿饭，聊近况，也聊真正的难处。",
    effects: { money: -220, relationship: 11, mood: 8, stress: -4 },
    dialogue: [
      { speaker: "朋友", text: "我还以为你一直过得挺稳，原来大家都在硬撑。" },
      { speaker: "你", text: "能说出来以后，好像就没那么孤单了。" },
    ],
  },
  {
    id: "deep-rest",
    type: "休整",
    title: "认真休息",
    cost: 1,
    power: 6,
    description: "取消不必要的证明，把睡眠、饮食、散步和发呆放回日程。",
    effects: { money: -120, health: 12, mood: 9, stress: -12, skill: -1 },
    dialogue: [
      { speaker: "身体", text: "谢谢你终于听见我，不是每一次停下都叫失败。" },
      { speaker: "你", text: "原来恢复不是浪费时间，是把自己还给自己。" },
    ],
  },
  {
    id: "side-hustle",
    type: "机会",
    title: "试做副业",
    cost: 2,
    power: 8,
    description: "把想法放到真实世界里测试，可能变现，也可能只是买来经验。",
    effects: { money: 520, skill: 5, stress: 9, relationship: -2, mood: 2 },
    dialogue: [
      { speaker: "合作者", text: "先别把它想成翻身，想成一次小规模实验。" },
      { speaker: "你", text: "至少我知道自己真的能把想法推到桌面上。" },
    ],
  },
  {
    id: "family-call",
    type: "家庭",
    title: "接住家里的电话",
    cost: 1,
    power: 5,
    description: "听完家人的担心，也试着说明边界。爱和压力总是一起出现。",
    effects: { relationship: 8, mood: -2, stress: 6, health: 1 },
    dialogue: [
      { speaker: "家人", text: "我们不是要控制你，只是怕你一个人在外面撑坏。" },
      { speaker: "你", text: "我会照顾自己，也希望你们相信我正在长大。" },
    ],
  },
  {
    id: "bold-move",
    type: "冒险",
    title: "做一次大胆决定",
    cost: 3,
    power: 10,
    description: "申请转岗、表白、搬家或公开作品，把命运往外推一格。",
    effects: { money: -360, skill: 4, mood: 10, stress: 10, relationship: 5 },
    dialogue: [
      { speaker: "命运", text: "你终于不是只在脑内演练，而是真的让我发生了。" },
      { speaker: "你", text: "就算结果普通，我也不想一直困在假设里。" },
    ],
  },
  {
    id: "save-money",
    type: "生存",
    title: "压低开销",
    cost: 1,
    power: 6,
    description: "认真记账、少点外卖，用不浪漫的纪律换一点安全感。",
    effects: { money: 460, mood: -5, stress: -3, health: -1 },
    dialogue: [
      { speaker: "账本", text: "我不负责让生活漂亮，但我能让你晚上少一点惊醒。" },
      { speaker: "你", text: "安全感有时候不是赚来的，是一点点漏出来的钱被接住了。" },
    ],
  },
  {
    id: "therapy",
    type: "自我",
    title: "整理情绪",
    cost: 1,
    power: 7,
    description: "写下反复出现的念头，也允许自己向可靠的人或专业帮助靠近。",
    effects: { money: -300, mood: 13, stress: -13, relationship: 3, health: 2 },
    dialogue: [
      { speaker: "咨询师", text: "你不需要先变得足够严重，才配得到支持。" },
      { speaker: "你", text: "我以为我只是矫情，原来我是累了很久。" },
    ],
  },
  {
    id: "networking",
    type: "社交",
    title: "参加行业聚会",
    cost: 2,
    power: 6,
    description: "走进陌生房间，练习介绍自己，也练习辨认真正值得靠近的人。",
    effects: { money: -280, relationship: 9, skill: 3, stress: 4, mood: 3 },
    dialogue: [
      { speaker: "陌生前辈", text: "机会常常不会公开张贴，它先藏在人和人的信任里。" },
      { speaker: "你", text: "我开始明白，关系不是投机，是彼此看见。" },
    ],
  },
  {
    id: "health-check",
    type: "健康",
    title: "做一次体检",
    cost: 1,
    power: 7,
    description: "把隐约的不舒服拿到明面上处理，提前修补那些警报。",
    effects: { money: -420, health: 14, stress: -6, mood: 2 },
    dialogue: [
      { speaker: "医生", text: "你还年轻，但年轻不是无限透支的许可证。" },
      { speaker: "你", text: "我想把身体当队友，而不是总到最后才求它原谅。" },
    ],
  },
  {
    id: "create-work",
    type: "创造",
    title: "发布一个作品",
    cost: 2,
    power: 7,
    description: "把代码、文章、视频或设计发出去，让它终于离开草稿箱。",
    effects: { skill: 8, relationship: 4, mood: 7, stress: 6, money: -80 },
    dialogue: [
      { speaker: "观众", text: "我不知道它是不是最好的，但我确实从里面看见了你。" },
      { speaker: "你", text: "被看见有点害怕，但一直藏着更可惜。" },
    ],
  },
];

const initialState = {
  round: 1,
  phase: "reveal",
  energy: maxEnergy,
  selectedCardId: "",
  playedCardId: "",
  feedbackIndex: 0,
  stats: {
    money: 2400,
    health: 72,
    mood: 64,
    skill: 38,
    relationship: 42,
    stress: 28,
  },
  drawPile: [],
  discardPile: [],
  hand: [],
  fateCard: null,
  feedback: [],
  log: [],
  ending: null,
};

let state = createInitialState();

const elements = {
  roundLabel: document.querySelector("#round-label"),
  ageLabel: document.querySelector("#age-label"),
  energyLabel: document.querySelector("#energy-label"),
  resetButton: document.querySelector("#reset-button"),
  revealButton: document.querySelector("#reveal-button"),
  playButton: document.querySelector("#play-button"),
  dialogueButton: document.querySelector("#dialogue-button"),
  phaseKicker: document.querySelector("#phase-kicker"),
  sceneTitle: document.querySelector("#scene-title"),
  sceneText: document.querySelector("#scene-text"),
  clashForecast: document.querySelector("#clash-forecast"),
  fateCard: document.querySelector("#fate-card"),
  fateSlotCard: document.querySelector("#fate-slot-card"),
  playerSlotCard: document.querySelector("#player-slot-card"),
  hand: document.querySelector("#hand"),
  handCount: document.querySelector("#hand-count"),
  selectedPanel: document.querySelector("#selected-card-panel"),
  selectedTitle: document.querySelector("#selected-title"),
  selectedDescription: document.querySelector("#selected-description"),
  selectedEffects: document.querySelector("#selected-effects"),
  dialogueList: document.querySelector("#dialogue-list"),
  logList: document.querySelector("#log-list"),
  steps: {
    reveal: document.querySelector("#step-reveal"),
    respond: document.querySelector("#step-respond"),
    clash: document.querySelector("#step-clash"),
    feedback: document.querySelector("#step-feedback"),
  },
  stats: {
    money: document.querySelector("#stat-money"),
    health: document.querySelector("#stat-health"),
    mood: document.querySelector("#stat-mood"),
    skill: document.querySelector("#stat-skill"),
    relationship: document.querySelector("#stat-relationship"),
    stress: document.querySelector("#stat-stress"),
  },
};

elements.resetButton.addEventListener("click", () => {
  state = createInitialState();
  render();
});

elements.revealButton.addEventListener("click", () => {
  if (state.phase !== "reveal") {
    return;
  }

  startRound();
});

elements.playButton.addEventListener("click", () => {
  const card = getSelectedCard();

  if (!card || state.phase !== "respond" || card.cost > state.energy) {
    return;
  }

  resolveClash(card);
});

elements.dialogueButton.addEventListener("click", () => {
  if (state.phase !== "feedback") {
    return;
  }

  if (state.feedbackIndex < state.feedback.length) {
    state.feedbackIndex += 1;
    render();
    return;
  }

  finishRound();
});

function createInitialState() {
  const stateCopy = JSON.parse(JSON.stringify(initialState));
  stateCopy.drawPile = shuffleDeck(cardDeck);
  stateCopy.hand = drawCards(stateCopy.drawPile, startingHandSize);
  return stateCopy;
}

function shuffleDeck(deck) {
  const pool = JSON.parse(JSON.stringify(deck));

  for (let index = pool.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [pool[index], pool[swapIndex]] = [pool[swapIndex], pool[index]];
  }

  return pool;
}

function drawCards(drawPile, count) {
  const cards = [];

  while (cards.length < count && drawPile.length > 0) {
    cards.push(drawPile.shift());
  }

  return cards;
}

function refillDrawPileIfNeeded() {
  if (state.drawPile.length > 0 || state.discardPile.length === 0) {
    return;
  }

  state.drawPile = shuffleDeck(state.discardPile);
  state.discardPile = [];
}

function startRound() {
  state.fateCard = drawFateCard();
  state.energy = maxEnergy;
  state.selectedCardId = "";
  state.playedCardId = "";

  while (state.hand.length < startingHandSize) {
    refillDrawPileIfNeeded();

    if (state.drawPile.length === 0) {
      break;
    }

    state.hand.push(...drawCards(state.drawPile, 1));
  }

  state.phase = "respond";
  render();
}

function drawFateCard() {
  const index = Math.floor(Math.random() * fateDeck.length);
  return JSON.parse(JSON.stringify(fateDeck[index]));
}

function selectCard(cardId) {
  if (state.phase !== "respond") {
    return;
  }

  state.selectedCardId = cardId;
  render();
}

function getSelectedCard() {
  return state.hand.find((card) => card.id === state.selectedCardId) || null;
}

function getPlayedCard() {
  return cardDeck.find((card) => card.id === state.playedCardId) || state.hand.find((card) => card.id === state.playedCardId) || null;
}

function resolveClash(card) {
  const beforeStats = { ...state.stats };
  const clash = evaluateClash(card, state.fateCard);

  state.energy -= card.cost;
  state.playedCardId = card.id;
  state.hand = state.hand.filter((handCard) => handCard.id !== card.id);
  state.discardPile.push(card);

  applyEffects(card.effects);
  applyFatePressure(state.fateCard, clash);
  applyRoundPressure(clash);

  const changes = getChanges(beforeStats, state.stats);
  state.feedback = buildFeedback(card, state.fateCard, clash, changes);
  state.feedbackIndex = 1;
  state.phase = "feedback";
  state.log.unshift(buildLogEntry(card, state.fateCard, clash, changes));
  render();
}

function evaluateClash(card, fateCard) {
  const typeBonus = fateCard.weakness.includes(card.type) ? 3 : 0;
  const stressPenalty = state.stats.stress >= 75 ? -2 : 0;
  const skillBonus = state.stats.skill >= 70 && ["事业", "成长", "创造", "机会"].includes(card.type) ? 1 : 0;
  const relationshipBonus = state.stats.relationship >= 70 && ["关系", "社交", "家庭"].includes(card.type) ? 1 : 0;
  const score = card.power + typeBonus + skillBonus + relationshipBonus + stressPenalty;

  if (score >= fateCard.threat + 3) {
    return { score, typeBonus, result: "breakthrough", label: "压制命运" };
  }

  if (score >= fateCard.threat) {
    return { score, typeBonus, result: "hold", label: "稳住局面" };
  }

  return { score, typeBonus, result: "wound", label: "被命运反击" };
}

function applyEffects(effects) {
  Object.entries(effects).forEach(([key, value]) => {
    state.stats[key] = clampStat(key, state.stats[key] + value);
  });
}

function applyFatePressure(fateCard, clash) {
  const multiplier = clash.result === "breakthrough" ? 0.35 : clash.result === "hold" ? 0.65 : 1;

  Object.entries(fateCard.pressure).forEach(([key, value]) => {
    state.stats[key] = clampStat(key, state.stats[key] + Math.round(value * multiplier));
  });

  if (clash.result === "breakthrough") {
    state.stats.mood = clampStat("mood", state.stats.mood + 4);
    state.stats.skill = clampStat("skill", state.stats.skill + 2);
  }

  if (clash.result === "wound") {
    state.stats.stress = clampStat("stress", state.stats.stress + 5);
  }
}

function applyRoundPressure(clash) {
  const basePressure = {
    money: -150,
    stress: clash.result === "breakthrough" ? 0 : 2,
  };

  if (state.stats.money < 800) {
    basePressure.mood = -4;
    basePressure.stress += 3;
  }

  if (state.stats.stress > 72) {
    basePressure.health = -5;
    basePressure.mood = (basePressure.mood || 0) - 4;
  }

  if (state.stats.relationship > 70) {
    basePressure.mood = (basePressure.mood || 0) + 2;
  }

  applyEffects(basePressure);
}

function clampStat(key, value) {
  const limit = statLimits[key];
  return Math.max(limit.min, Math.min(limit.max, value));
}

function getChanges(beforeStats, afterStats) {
  return Object.keys(statLabels)
    .map((key) => ({ key, value: afterStats[key] - beforeStats[key] }))
    .filter((change) => change.value !== 0);
}

function buildFeedback(card, fateCard, clash, changes) {
  const summary = summarizeChanges(changes);
  const condition = getConditionLine();
  const cardDialogue = card.dialogue.map((message) => ({ ...message, tone: message.speaker === "你" ? "self" : "normal" }));

  return [
    { speaker: "战场", text: `命运打出「${fateCard.title}」，你用「${card.title}」回应。Clash 结果：${clash.label}。`, tone: "system" },
    { speaker: "命运", text: fateCard.intent, tone: "normal" },
    ...cardDialogue,
    { speaker: "账本", text: summary, tone: "system" },
    { speaker: "内心", text: condition, tone: "self" },
  ];
}

function summarizeChanges(changes) {
  if (changes.length === 0) {
    return "这次 Clash 没有明显改变数值，但你知道有些事会慢慢发酵。";
  }

  const text = changes
    .map((change) => `${statLabels[change.key]}${change.value > 0 ? "+" : ""}${change.value}`)
    .join("，");

  return `本轮结算：${text}。`;
}

function getConditionLine() {
  if (state.stats.health <= 25 || state.stats.stress >= 86) {
    return "我听见身体在敲桌子了。下一回合如果还只谈赢，可能会先输掉自己。";
  }

  if (state.stats.money < 0) {
    return "现金已经变成负数，所有选择都会带着一点急促的回声。";
  }

  if (state.stats.skill >= 72 && state.stats.relationship >= 62) {
    return "能力和关系开始互相托举，我终于不只是靠硬撑往前走。";
  }

  if (state.stats.mood >= 78) {
    return "这一回合过后，我还能感觉到自己喜欢生活里的某些部分。";
  }

  return "我还在牌桌上。不是每回合都漂亮，但每回合都算数。";
}

function buildLogEntry(card, fateCard, clash, changes) {
  return `第 ${state.round} 回合：命运「${fateCard.title}」 VS 你「${card.title}」→ ${clash.label}。${summarizeChanges(changes)}`;
}

function finishRound() {
  if (state.round >= maxRounds) {
    state.phase = "ended";
    state.ending = buildEnding();
    render();
    return;
  }

  state.round += 1;
  state.phase = "reveal";
  state.energy = maxEnergy;
  state.selectedCardId = "";
  state.playedCardId = "";
  state.fateCard = null;
  state.feedback = [];
  state.feedbackIndex = 0;
  render();
}

function buildEnding() {
  const score = state.stats.health + state.stats.mood + state.stats.skill + state.stats.relationship - state.stats.stress + Math.floor(state.stats.money / 180);

  if (state.stats.health <= 22 || state.stats.stress >= 90) {
    return {
      title: "透支结局：牌桌先把你按下暂停",
      text: "你打过很多硬仗，也扛了太久。最后这一局提醒你：人生不是把所有牌都打成进攻，能继续坐在牌桌前同样重要。",
    };
  }

  if (state.stats.skill >= 78 && state.stats.money >= 5200) {
    return {
      title: "事业结局：你把手牌打成了筹码",
      text: "能力、现金和判断力逐渐连成一条线。你没有每次都赢，但你学会了在关键回合押上正确的牌。",
    };
  }

  if (state.stats.relationship >= 78 && state.stats.mood >= 68) {
    return {
      title: "人情结局：你没有独自通关",
      text: "这一局最重要的资源不是某张神牌，而是有人愿意接住你的对话。你把人生过出了回声。",
    };
  }

  if (score >= 185) {
    return {
      title: "平衡结局：你保住了多数重要的东西",
      text: "你既没有完全躺平，也没有把自己烧尽。十二回合过后，你仍然有现金、身体、关系和继续选择的余地。",
    };
  }

  return {
    title: "普通结局：你还在摸索自己的打法",
    text: "这一局没有封神，但也没有白过。你开始知道哪些牌会让自己变强，哪些牌只是看起来很亮。",
  };
}

function render() {
  renderHeader();
  renderStats();
  renderSteps();
  renderScene();
  renderFate();
  renderBattlefield();
  renderHand();
  renderSelectedCard();
  renderDialogue();
  renderLog();
}

function renderHeader() {
  const age = 18 + Math.floor((state.round - 1) / 4);
  const season = seasons[(state.round - 1) % seasons.length];
  elements.roundLabel.textContent = state.phase === "ended" ? "本局完成" : `第 ${state.round} 回合`;
  elements.ageLabel.textContent = `${age} 岁 · ${season}`;
  elements.energyLabel.textContent = `${state.energy} / ${maxEnergy}`;
}

function renderStats() {
  Object.entries(elements.stats).forEach(([key, element]) => {
    element.textContent = key === "money" ? state.stats[key].toLocaleString("zh-CN") : state.stats[key];
  });
}

function renderSteps() {
  const order = ["reveal", "respond", "clash", "feedback"];
  const phaseForStep = state.phase === "feedback" && state.feedbackIndex === 1 ? "clash" : state.phase;
  const activeIndex = order.indexOf(phaseForStep);

  order.forEach((phase, index) => {
    const element = elements.steps[phase];
    element.classList.toggle("active", phaseForStep === phase);
    element.classList.toggle("done", activeIndex > index || state.phase === "ended");
  });
}

function renderScene() {
  elements.revealButton.classList.toggle("hidden", state.phase !== "reveal");
  elements.revealButton.disabled = state.phase !== "reveal";

  if (state.phase === "reveal") {
    elements.phaseKicker.textContent = "命运揭示";
    elements.sceneTitle.textContent = "等待对手翻开意图牌。";
    elements.sceneText.textContent = "点击开始回合。命运会亮出本轮事件牌，你再从手牌中选择回应。";
    elements.clashForecast.textContent = "选择手牌后显示胜负预估";
    return;
  }

  if (state.phase === "respond") {
    elements.phaseKicker.textContent = "手牌应对";
    elements.sceneTitle.textContent = "命运已经出牌，轮到你回应。";
    elements.sceneText.textContent = "观察命运牌的弱点和威胁值，再选择一张行动力足够的手牌。克制类型会得到额外 Clash 点数。";
    renderForecast();
    return;
  }

  if (state.phase === "feedback") {
    elements.phaseKicker.textContent = state.feedbackIndex <= 1 ? "战场结算" : "对话反馈";
    elements.sceneTitle.textContent = "Clash 已经落地，现在听它说话。";
    elements.sceneText.textContent = "反馈会按对话逐句展开。读完这段回声后，才能进入下一回合。";
    renderForecast();
    return;
  }

  elements.phaseKicker.textContent = "人生小结";
  elements.sceneTitle.textContent = state.ending.title;
  elements.sceneText.textContent = state.ending.text;
  elements.clashForecast.textContent = "十二回合已完成";
}

function renderFate() {
  if (!state.fateCard) {
    elements.fateCard.className = "fate-card card-back";
    elements.fateCard.innerHTML = `<span class="card-corner">?</span><strong>尚未揭示</strong><p>点击开始回合，命运会翻开一张事件牌。</p>`;
    return;
  }

  elements.fateCard.className = "fate-card";
  elements.fateCard.innerHTML = `
    <span class="card-corner">${state.fateCard.threat}</span>
    <span class="type">${state.fateCard.type}</span>
    <strong>${state.fateCard.title}</strong>
    <p>${state.fateCard.intent}</p>
    <div class="weakness-list">${state.fateCard.weakness.map((type) => `<span>${type}</span>`).join("")}</div>
  `;
}

function renderBattlefield() {
  if (state.fateCard) {
    elements.fateSlotCard.className = "mini-card fate-mini";
    elements.fateSlotCard.innerHTML = `<strong>${state.fateCard.title}</strong><span>威胁 ${state.fateCard.threat}</span>`;
  } else {
    elements.fateSlotCard.className = "mini-card empty-slot";
    elements.fateSlotCard.textContent = "等待揭示";
  }

  const playedCard = getPlayedCard();
  const selectedCard = getSelectedCard();
  const displayCard = playedCard || selectedCard;

  if (displayCard) {
    elements.playerSlotCard.className = `mini-card player-mini ${playedCard ? "played" : "preview"}`;
    elements.playerSlotCard.innerHTML = `<strong>${displayCard.title}</strong><span>${playedCard ? "已打出" : "预备中"} · ${displayCard.power} 点</span>`;
  } else {
    elements.playerSlotCard.className = "mini-card empty-slot";
    elements.playerSlotCard.textContent = "等待出牌";
  }
}

function renderHand() {
  elements.hand.innerHTML = "";
  elements.handCount.textContent = `${state.hand.length} 张可用`;

  state.hand.forEach((card) => {
    const button = document.createElement("button");
    const affordable = card.cost <= state.energy;
    button.className = "life-card";
    button.type = "button";
    button.disabled = state.phase !== "respond" || !affordable;
    button.classList.toggle("selected", card.id === state.selectedCardId);
    button.classList.toggle("exhausted", state.phase === "respond" && !affordable);
    button.innerHTML = `
      <span class="cost-orb">${card.cost}</span>
      <span class="type">${card.type}</span>
      <span class="title">${card.title}</span>
      <span class="copy">${card.description}</span>
      <span class="power-line">Clash ${card.power}</span>
      <span class="effect-list">${formatEffects(card.effects).join("")}</span>
    `;
    button.addEventListener("click", () => selectCard(card.id));
    elements.hand.appendChild(button);
  });
}

function renderSelectedCard() {
  const card = getSelectedCard();
  elements.selectedPanel.classList.toggle("hidden", !card || state.phase !== "respond");

  if (!card) {
    return;
  }

  elements.selectedTitle.textContent = card.title;
  elements.selectedDescription.textContent = card.description;
  elements.selectedEffects.innerHTML = formatEffects(card.effects).join("");
  elements.playButton.disabled = card.cost > state.energy;
}

function renderForecast() {
  const card = getSelectedCard() || getPlayedCard();

  if (!card || !state.fateCard) {
    elements.clashForecast.textContent = "选择手牌后显示胜负预估";
    return;
  }

  const clash = evaluateClash(card, state.fateCard);
  const bonusText = clash.typeBonus > 0 ? `克制 +${clash.typeBonus}` : "未克制";
  elements.clashForecast.textContent = `${clash.label} · 你的 ${clash.score} vs 命运 ${state.fateCard.threat} · ${bonusText}`;
}

function renderDialogue() {
  elements.dialogueList.innerHTML = "";

  if (state.phase !== "feedback" && state.phase !== "ended") {
    const empty = document.createElement("div");
    empty.className = "dialogue-empty";
    empty.textContent = state.phase === "reveal" ? "命运还没有翻牌。" : "把一张手牌打到战场后，回声室会开始结算。";
    elements.dialogueList.appendChild(empty);
  }

  if (state.phase === "feedback") {
    state.feedback.slice(0, state.feedbackIndex).forEach((message) => {
      elements.dialogueList.appendChild(createDialogueBubble(message));
    });
  }

  if (state.phase === "ended" && state.ending) {
    const ending = document.createElement("article");
    ending.className = "ending-card";
    ending.innerHTML = `<p class="eyebrow">最终反馈</p><h3>${state.ending.title}</h3><p class="scene-text">${state.ending.text}</p>`;
    elements.dialogueList.appendChild(ending);
  }

  if (state.phase !== "feedback") {
    elements.dialogueButton.disabled = true;
    elements.dialogueButton.textContent = state.phase === "ended" ? "本局已完成" : "等待结算";
    return;
  }

  elements.dialogueButton.disabled = false;
  elements.dialogueButton.textContent = state.feedbackIndex < state.feedback.length ? "继续对话" : state.round >= maxRounds ? "查看人生小结" : "进入下一回合";
}

function createDialogueBubble(message) {
  const bubble = document.createElement("article");
  bubble.className = `dialogue-bubble ${message.tone || ""}`.trim();
  bubble.innerHTML = `<strong>${message.speaker}</strong><p>${message.text}</p>`;
  return bubble;
}

function renderLog() {
  elements.logList.innerHTML = "";

  state.log.forEach((entry) => {
    const item = document.createElement("li");
    item.textContent = entry;
    elements.logList.appendChild(item);
  });

  if (state.log.length === 0) {
    const item = document.createElement("li");
    item.textContent = "还没有任何战局记录。揭示命运并打出手牌后，这里会记录每次 Clash。";
    elements.logList.appendChild(item);
  }
}

function formatEffects(effects) {
  return Object.entries(effects).map(([key, value]) => {
    const className = value > 0 ? "positive" : "negative";
    const sign = value > 0 ? "+" : "";
    return `<span class="effect-pill ${className}">${statLabels[key]} ${sign}${value}</span>`;
  });
}

render();
