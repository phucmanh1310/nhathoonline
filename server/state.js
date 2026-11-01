const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DEFAULT_STATE_FILE = path.join(DATA_DIR, 'state.json');

const BAD_WORDS = [
  'đụ', 'địt', 'lồn', 'cặc', 'đĩ', 'chó đẻ', 'vãi lồn', 'đm', 'vcl', 'vl',
  'fuck', 'shit', 'bitch', 'asshole', 'cờ bạc', 'tài xỉu', 'kubet', 'link bio'
];

const BLESSING_QUOTES = [
  {
    text: '“Hãy xin thì sẽ được, hãy tìm thì sẽ thấy, hãy gõ cửa thì sẽ mở cho.”',
    source: 'Ma-thi-ơ 7:7'
  },
  {
    text: '“Chúa là mục tử chăn dắt tôi, tôi chẳng thiếu thốn gì.”',
    source: 'Thánh Vịnh 23:1'
  },
  {
    text: '“Bình an của Chúa vượt trên mọi hiểu biết sẽ gìn giữ lòng và tâm trí anh em.”',
    source: 'Phi-líp 4:7'
  },
  {
    text: '“Đức tin là sự bảo đảm cho những điều ta hy vọng, là bằng chứng của những điều ta không thấy.”',
    source: 'Híp-ri 11:1'
  },
  {
    text: '“Mọi sự đều có thể đối với người có lòng tin.”',
    source: 'Mác 9:23'
  },
  {
    text: '“Ánh sáng chiếu soi trong bóng tối, và bóng tối đã không diệt được ánh sáng.”',
    source: 'Gio-an 1:5'
  },
  {
    text: '“Hãy trao gánh nặng của ngươi cho Chúa, Ngài sẽ nâng đỡ ngươi.”',
    source: 'Thánh Vịnh 55:22'
  },
  {
    text: '“Tình yêu thương thì nhẫn nhục, hiền hậu, không ganh tị, không vênh vang.”',
    source: '1 Cô-rinh-tô 13:4'
  },
  {
    text: '“Nguyện xin hồng ân và bình an luôn ở cùng gia đình bạn trong đêm nay.”',
    source: 'Lời Chúc Bình An'
  }
];

const ORACLE_CARDS = {
  peace: [
    'Mọi âu lo trong lòng bạn sắp qua đi, nhường chỗ cho sự bình an sâu sắc và giấc ngủ an lành.',
    'Ơn Trên đang lắng nghe lời thầm nguyện của bạn. Hãy giữ vững niềm tin, bình an đang ở ngay trước mắt.',
    'Đêm nay ánh sáng bảo hộ sẽ che chở tâm hồn bạn khỏi mọi muộn phiền.'
  ],
  family: [
    'Gia đạo đón nhận tin vui ấm áp, cha mẹ và người thân được ban dồi dào sức khỏe và trường thọ.',
    'Hồng ân sum vầy đang bao phủ ngôi nhà của bạn, mọi khúc mắc đều hóa giải trong yêu thương.',
    'Lời cầu nguyện hiếu thảo của bạn đã thấu tới trời cao, gia đình luôn bình an vô sự.'
  ],
  career: [
    'Cánh cửa cơ hội mới đang mở ra! Công việc, học tập và dự định sắp tới của bạn sẽ hanh thông rực rỡ.',
    'Những nỗ lực bền bỉ của bạn sắp kết trái ngọt, quý nhân sẽ xuất hiện đúng lúc bạn cần.',
    'Hãy mạnh dạn tiến bước, may mắn và sự thịnh vượng đang đồng hành cùng bạn trong tháng này.'
  ]
};

function sanitizePrayer(rawText) {
  if (!rawText || typeof rawText !== 'string') return '';
  let cleaned = rawText.trim().replace(/\s+/g, ' ');
  if (cleaned.length > 140) {
    cleaned = cleaned.slice(0, 140) + '...';
  }
  const lower = cleaned.toLowerCase();
  for (const word of BAD_WORDS) {
    if (lower.includes(word)) {
      return 'Xin cầu nguyện bình an, sức khỏe và phước lành cho gia đình.';
    }
  }
  return cleaned;
}

function classifyPrayerAndOracle(cleanText) {
  const lower = cleanText.toLowerCase();
  if (cleanText === '1' || lower.includes('bình an')) {
    const prayer = cleanText === '1' ? 'Cầu xin bình an sâu sắc và tâm hồn thanh thản 🙏' : cleanText;
    const pool = ORACLE_CARDS.peace;
    return {
      prayer,
      categoryTitle: '🕊️ THÔNG ĐIỆP BÌNH AN',
      oracleText: pool[Math.floor(Math.random() * pool.length)],
      candleColor: 'normal'
    };
  }
  if (cleanText === '2' || lower.includes('gia đình') || lower.includes('cha mẹ') || lower.includes('bố mẹ') || lower.includes('sức khỏe')) {
    const prayer = cleanText === '2' ? 'Cầu xin sức khỏe dồi dào và hạnh phúc cho cha mẹ & gia đình ❤️' : cleanText;
    const pool = ORACLE_CARDS.family;
    return {
      prayer,
      categoryTitle: '💖 THÔNG ĐIỆP GIA ĐẠO & SỨC KHỎE',
      oracleText: pool[Math.floor(Math.random() * pool.length)],
      candleColor: 'rose'
    };
  }
  if (cleanText === '3' || lower.includes('công việc') || lower.includes('may mắn') || lower.includes('thi cử') || lower.includes('tài lộc')) {
    const prayer = cleanText === '3' ? 'Cầu xin công việc hanh thông, thi cử đỗ đạt và gặp nhiều may mắn ✨' : cleanText;
    const pool = ORACLE_CARDS.career;
    return {
      prayer,
      categoryTitle: '🌟 THÔNG ĐIỆP HANH THÔNG & MAY MẮN',
      oracleText: pool[Math.floor(Math.random() * pool.length)],
      candleColor: 'sapphire'
    };
  }

  const allPools = [...ORACLE_CARDS.peace, ...ORACLE_CARDS.family, ...ORACLE_CARDS.career];
  return {
    prayer: cleanText,
    categoryTitle: '📜 THÔNG ĐIỆP PHƯỚC LÀNH HÔM NAY',
    oracleText: allPools[Math.floor(Math.random() * allPools.length)],
    candleColor: 'normal'
  };
}

class SanctuaryState {
  constructor(stateFilePath = DEFAULT_STATE_FILE) {
    this.stateFilePath = stateFilePath;
    this.maxCandles = 21;
    this.data = {
      totalBlessings: 0,
      totalCandles: 0,
      totalPrayers: 0,
      totalBellRings: 0,
      totalFollowers: 0,
      miracleGauge: 0,
      miracleCount: 0,
      pinnedVip: {
        nickname: 'Chưa có Ân Nhân VIP',
        avatarUrl: '',
        giftName: 'Tặng 1 Hoa Hồng để ghim lời cầu nguyện của bạn lên Đỉnh Thánh Đường!',
        prayer: 'Nguyện xin hồng ân, sức khỏe và bình an đến với mọi người trong phòng Live đêm nay 🙏',
        points: 0
      },
      users: {},
      candles: [],
      recentPrayers: [],
      eventLogs: [],
      settings: {
        ttsEnabled: true,
        ttsPrayerEnabled: true,
        autoScriptureIntervalSec: 45,
        bellSoundEnabled: true,
        bgMusicEnabled: true,
        bgmTrack: 'cathedral_organ',
        bgmVolume: 60,
        theme: 'night',
        channelTitle: 'THÁNH ĐƯỜNG NGUYỆN ƯỚC ONLINE'
      }
    };
    this.load();
  }

  load() {
    try {
      if (fs.existsSync(this.stateFilePath)) {
        const raw = fs.readFileSync(this.stateFilePath, 'utf-8');
        const parsed = JSON.parse(raw);
        this.data = {
          ...this.data,
          ...parsed,
          pinnedVip: {
            ...this.data.pinnedVip,
            ...(parsed.pinnedVip || {})
          },
          settings: {
            ...this.data.settings,
            ...(parsed.settings || {})
          }
        };
      }
    } catch (err) {
      console.error('[SanctuaryState] Không thể đọc file state, khởi tạo mặc định:', err.message);
    }
  }

  save() {
    try {
      const dir = path.dirname(this.stateFilePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.stateFilePath, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('[SanctuaryState] Lỗi khi lưu state:', err.message);
    }
  }

  addEventLog(type, message) {
    const entry = {
      id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      type,
      message,
      time: new Date().toLocaleTimeString('vi-VN', { hour12: false })
    };
    if (!Array.isArray(this.data.eventLogs)) {
      this.data.eventLogs = [];
    }
    this.data.eventLogs.unshift(entry);
    if (this.data.eventLogs.length > 40) {
      this.data.eventLogs.length = 40;
    }
    return entry;
  }

  advanceMiracleGauge(amount, triggerBy) {
    const current = Number(this.data.miracleGauge) || 0;
    const next = current + amount;
    if (next >= 100) {
      this.data.miracleGauge = next % 100;
      this.data.miracleCount = (Number(this.data.miracleCount) || 0) + 1;
      this.data.totalBlessings += 200;
      const miracleEvent = {
        id: `miracle_${Date.now()}`,
        miracleNumber: this.data.miracleCount,
        triggerBy: triggerBy || 'Cộng Đồng Tín Hữu',
        message: `Chúc mừng Sứ Giả "${triggerBy || 'Tín Hữu'}" đã mở khóa 100% Phép Lành Toàn Phòng! Mưa hồng ân đang tuôn đổ xuống mọi gia đình!`,
        ttsText: `Chúc mừng sứ giả ${triggerBy || 'tín hữu'} đã mở khóa một trăm phần trăm phép lành toàn phòng lần thứ ${this.data.miracleCount}! Nguyện xin hồng ân và bình an đến với tất cả mọi người.`
      };
      this.addEventLog('miracle', `✨ PHÉP LÀNH TOÀN PHÒNG #${this.data.miracleCount} bùng nổ (Sứ giả: ${miracleEvent.triggerBy})`);
      return miracleEvent;
    } else {
      this.data.miracleGauge = Math.min(99, Math.round(next));
      return null;
    }
  }

  ensureUser(userId, nickname, avatarUrl) {
    const id = String(userId || 'guest').trim();
    if (!this.data.users[id]) {
      this.data.users[id] = {
        userId: id,
        nickname: nickname || id,
        avatarUrl: avatarUrl || '',
        score: 0,
        prayersCount: 0,
        likesCount: 0,
        giftsCount: 0,
        lastPrayerText: '',
        lastActive: Date.now()
      };
    } else {
      if (nickname) this.data.users[id].nickname = nickname;
      if (avatarUrl) this.data.users[id].avatarUrl = avatarUrl;
      this.data.users[id].lastActive = Date.now();
    }
    return this.data.users[id];
  }

  recordPrayer({ userId, nickname, avatarUrl, comment }) {
    const cleanText = sanitizePrayer(comment);
    if (!cleanText) return null;

    const classified = classifyPrayerAndOracle(cleanText);
    const user = this.ensureUser(userId, nickname, avatarUrl);
    const points = 10;
    user.score += points;
    user.prayersCount += 1;
    user.lastPrayerText = classified.prayer;

    this.data.totalBlessings += points;
    this.data.totalCandles += 1;
    this.data.totalPrayers += 1;

    const candle = {
      id: `candle_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      userId: user.userId,
      nickname: user.nickname,
      avatarUrl: user.avatarUrl,
      prayer: classified.prayer,
      tier: classified.candleColor,
      createdAt: Date.now()
    };

    this.addCandleToAltar(candle);

    const ttsText = `Ngọn nến của ${user.nickname} đã thắp sáng: ${classified.prayer}. Thông điệp gửi tới bạn: ${classified.oracleText}`;

    const prayerItem = {
      id: candle.id,
      nickname: user.nickname,
      avatarUrl: user.avatarUrl,
      prayer: classified.prayer,
      categoryTitle: classified.categoryTitle,
      oracleText: classified.oracleText,
      tier: classified.candleColor,
      points,
      ttsText,
      timestamp: Date.now()
    };

    this.data.recentPrayers.unshift(prayerItem);
    if (this.data.recentPrayers.length > 20) {
      this.data.recentPrayers.length = 20;
    }

    const logEntry = this.addEventLog('prayer', `🕯️ ${user.nickname}: "${classified.prayer}" (+${points} điểm)`);
    const miracleEvent = this.advanceMiracleGauge(14, user.nickname);

    this.save();
    return {
      prayerItem,
      candle,
      userScore: user.score,
      leaderboard: this.getLeaderboard(8),
      stats: this.getStats(),
      logEntry,
      miracleEvent
    };
  }

  recordFollow({ userId, nickname, avatarUrl }) {
    const user = this.ensureUser(userId, nickname, avatarUrl);
    const points = 25;
    user.score += points;
    this.data.totalBlessings += points;
    this.data.totalCandles += 1;
    this.data.totalFollowers = (Number(this.data.totalFollowers) || 0) + 1;

    const candle = {
      id: `candle_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      userId: user.userId,
      nickname: user.nickname,
      avatarUrl: user.avatarUrl,
      prayer: 'Tín hữu mới ghi danh Sổ Vàng Hộ Mệnh',
      tier: 'golden',
      createdAt: Date.now()
    };
    this.addCandleToAltar(candle);

    const followEvent = {
      id: candle.id,
      userId: user.userId,
      nickname: user.nickname,
      avatarUrl: user.avatarUrl,
      points,
      message: 'Đã bấm Follow ghi danh vào Sổ Vàng Hộ Mệnh Thánh Đường (+25 Điểm & Tặng 1 Nến Vàng)',
      ttsText: `Chào mừng tín hữu mới ${user.nickname} đã theo dõi Thánh Đường. Nguyện xin bình an và may mắn luôn đồng hành cùng bạn!`
    };

    const logEntry = this.addEventLog('follow', `➕ ${user.nickname} vừa Follow kênh! (+${points} điểm & Nến Vàng)`);
    const miracleEvent = this.advanceMiracleGauge(18, user.nickname);

    this.save();
    return {
      followEvent,
      candle,
      leaderboard: this.getLeaderboard(8),
      stats: this.getStats(),
      logEntry,
      miracleEvent
    };
  }

  recordShare({ userId, nickname, avatarUrl }) {
    const user = this.ensureUser(userId, nickname, avatarUrl);
    const points = 15;
    user.score += points;
    this.data.totalBlessings += points;

    const logEntry = this.addEventLog('share', `↗️ ${user.nickname} vừa Chia sẻ phiên Live (+${points} điểm)`);
    const miracleEvent = this.advanceMiracleGauge(10, user.nickname);

    this.save();
    return {
      user: {
        userId: user.userId,
        nickname: user.nickname,
        avatarUrl: user.avatarUrl,
        score: user.score
      },
      pointsAdded: points,
      leaderboard: this.getLeaderboard(8),
      stats: this.getStats(),
      logEntry,
      miracleEvent
    };
  }

  recordLike({ userId, nickname, avatarUrl, likeCount = 1 }) {
    const count = Math.max(1, Math.min(Number(likeCount) || 1, 100));
    const user = this.ensureUser(userId, nickname, avatarUrl);
    const points = count * 2;

    user.score += points;
    user.likesCount += count;

    this.data.totalBlessings += points;
    this.data.totalBellRings += 1;

    const logEntry = this.addEventLog('like', `🔔 ${user.nickname} thả ${count} tim rung chuông (+${points} điểm)`);
    const miracleEvent = this.advanceMiracleGauge(Math.min(25, Math.max(4, Math.round(count * 0.8))), user.nickname);

    this.save();
    return {
      user: {
        userId: user.userId,
        nickname: user.nickname,
        avatarUrl: user.avatarUrl,
        score: user.score
      },
      likeCount: count,
      pointsAdded: points,
      leaderboard: this.getLeaderboard(8),
      stats: this.getStats(),
      logEntry,
      miracleEvent
    };
  }

  recordGift({ userId, nickname, avatarUrl, giftName = 'Hoa Hồng', diamondCount = 1, repeatCount = 1 }) {
    const count = Math.max(1, Number(repeatCount) || 1);
    const diamonds = Math.max(1, Number(diamondCount) || 1) * count;
    const points = diamonds * 25;

    const user = this.ensureUser(userId, nickname, avatarUrl);
    user.score += points;
    user.giftsCount += count;

    this.data.totalBlessings += points;
    this.data.totalCandles += 1;

    const isMajorBlessing = diamonds >= 20;
    const tier = isMajorBlessing ? 'divine' : 'golden';

    const customWish = user.lastPrayerText || 'Nguyện xin hồng ân rực rỡ, sức khỏe và bình an viên mãn cho toàn gia đình!';
    const blessingMessage = isMajorBlessing
      ? `Dâng Đại Lễ Vật ${giftName} x${count} — ${customWish}`
      : `Dâng Nến Vàng (${giftName} x${count}) — ${customWish}`;

    // Pin this Gift Giver to the Top VIP Throne!
    this.data.pinnedVip = {
      nickname: user.nickname,
      avatarUrl: user.avatarUrl,
      giftName: `${giftName} x${count}`,
      prayer: customWish,
      points: user.score,
      tier
    };

    const candle = {
      id: `candle_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      userId: user.userId,
      nickname: user.nickname,
      avatarUrl: user.avatarUrl,
      prayer: blessingMessage,
      giftName,
      diamonds,
      tier,
      createdAt: Date.now()
    };

    this.addCandleToAltar(candle);

    const ttsText = isMajorBlessing
      ? `Xin cảm ơn đại ân nhân ${user.nickname} đã dâng lễ vật ${giftName}. Lời nguyện ước của bạn đã được ghim lên đỉnh Thánh Đường!`
      : `Cảm ơn ân nhân ${user.nickname} đã dâng ${giftName} thắp nến vàng và ghim lời cầu nguyện lên đỉnh Thánh Đường!`;

    const logEntry = this.addEventLog('gift', `🕊️ ${user.nickname} dâng ${giftName} x${count} (+${points} điểm & Chiếm ngôi VIP)`);
    const miracleEvent = this.advanceMiracleGauge(isMajorBlessing ? 55 : 25, user.nickname);

    this.save();
    return {
      giftEvent: {
        id: candle.id,
        userId: user.userId,
        nickname: user.nickname,
        avatarUrl: user.avatarUrl,
        giftName,
        repeatCount: count,
        diamonds,
        points,
        tier,
        isMajorBlessing,
        blessingMessage,
        ttsText
      },
      pinnedVip: this.data.pinnedVip,
      candle,
      leaderboard: this.getLeaderboard(8),
      stats: this.getStats(),
      logEntry,
      miracleEvent
    };
  }

  triggerFullMiracle(triggerBy = 'Chủ Kênh Thánh Đường') {
    const needed = 100 - (Number(this.data.miracleGauge) || 0);
    const miracleEvent = this.advanceMiracleGauge(needed, triggerBy);
    this.save();
    return {
      miracleEvent,
      stats: this.getStats(),
      logEntry: this.data.eventLogs[0]
    };
  }

  addCandleToAltar(candle) {
    this.data.candles.push(candle);
    if (this.data.candles.length > this.maxCandles) {
      const normalIdx = this.data.candles.findIndex(c => c.tier === 'normal');
      if (normalIdx !== -1) {
        this.data.candles.splice(normalIdx, 1);
      } else {
        this.data.candles.shift();
      }
    }
  }

  getLeaderboard(limit = 8) {
    return Object.values(this.data.users)
      .sort((a, b) => b.score - a.score || b.lastActive - a.lastActive)
      .slice(0, limit)
      .map((u, index) => ({
        rank: index + 1,
        userId: u.userId,
        nickname: u.nickname,
        avatarUrl: u.avatarUrl,
        score: u.score,
        prayersCount: u.prayersCount,
        giftsCount: u.giftsCount
      }));
  }

  getStats() {
    return {
      totalBlessings: this.data.totalBlessings,
      totalCandles: this.data.totalCandles,
      totalPrayers: this.data.totalPrayers,
      totalBellRings: this.data.totalBellRings,
      totalFollowers: Number(this.data.totalFollowers) || 0,
      miracleGauge: Number(this.data.miracleGauge) || 0,
      miracleCount: Number(this.data.miracleCount) || 0
    };
  }

  getRandomScripture() {
    const idx = Math.floor(Math.random() * BLESSING_QUOTES.length);
    return BLESSING_QUOTES[idx];
  }

  updateSettings(partial) {
    this.data.settings = {
      ...this.data.settings,
      ...partial
    };
    this.save();
    return this.data.settings;
  }

  resetLeaderboard() {
    this.data.users = {};
    this.data.totalBlessings = 0;
    this.data.totalCandles = 0;
    this.data.totalPrayers = 0;
    this.data.totalBellRings = 0;
    this.data.totalFollowers = 0;
    this.data.miracleGauge = 0;
    this.data.miracleCount = 0;
    this.data.pinnedVip = {
      nickname: 'Chưa có Ân Nhân VIP',
      avatarUrl: '',
      giftName: 'Tặng 1 Hoa Hồng để ghim lời cầu nguyện của bạn lên Đỉnh Thánh Đường!',
      prayer: 'Nguyện xin hồng ân, sức khỏe và bình an đến với mọi người trong phòng Live đêm nay 🙏',
      points: 0
    };
    this.data.candles = [];
    this.data.recentPrayers = [];
    this.data.eventLogs = [];
    this.save();
  }

  getSnapshot() {
    return {
      stats: this.getStats(),
      leaderboard: this.getLeaderboard(8),
      pinnedVip: this.data.pinnedVip,
      candles: this.data.candles,
      recentPrayers: this.data.recentPrayers.slice(0, 8),
      eventLogs: (this.data.eventLogs || []).slice(0, 25),
      settings: this.data.settings,
      scripture: this.getRandomScripture()
    };
  }
}

module.exports = {
  SanctuaryState,
  sanitizePrayer,
  classifyPrayerAndOracle,
  BLESSING_QUOTES
};
