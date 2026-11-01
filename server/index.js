const express = require('express');
const http = require('http');
const path = require('path');
const https = require('https');
const { Server } = require('socket.io');
const {
  TikTokLiveConnection,
  WebcastPushConnection,
  WebcastEvent,
  ControlEvent,
  SignConfig
} = require('tiktok-live-connector');
const googleTTS = require('google-tts-api');
const { SanctuaryState } = require('./state');

const PORT = process.env.PORT || 8888;
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

const sanctuary = new SanctuaryState();

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'admin.html'));
});

app.get('/api/tts', (req, res) => {
  const text = String(req.query.text || '').trim().slice(0, 200);
  if (!text) {
    return res.status(400).json({ error: 'Missing text' });
  }
  try {
    const url = googleTTS.getAudioUrl(text, {
      lang: 'vi',
      slow: false,
      host: 'https://translate.google.com'
    });
    https.get(url, (ttsRes) => {
      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Cache-Control', 'no-cache');
      ttsRes.pipe(res);
    }).on('error', (err) => {
      console.error('[TTS Proxy Error]:', err.message);
      res.status(500).end();
    });
  } catch (err) {
    console.error('[TTS Error]:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Helper to normalize user info across tiktok-live-connector v1 and v2.5+
function extractUserInfo(data = {}) {
  const u = data.user || data;
  const userId = u.uniqueId || u.userId || data.uniqueId || data.userId || 'guest';
  const nickname = u.nickname || u.uniqueId || data.nickname || userId;
  const avatarUrl =
    u.profilePicture?.url?.[0] ||
    u.profilePicture?.urls?.[0] ||
    u.profilePictureUrl ||
    data.profilePictureUrl ||
    '';
  return { userId, nickname, avatarUrl };
}

let tiktokConnection = null;
let currentUsername = '';
let connectionStatus = 'disconnected';
let lastError = '';

function broadcastTikTokStatus() {
  io.emit('tiktok:status', {
    username: currentUsername,
    status: connectionStatus,
    error: lastError
  });
}

function handleActionBroadcast(eventName, result) {
  if (!result) return;
  io.emit(eventName, result);
  if (result.logEntry) {
    io.emit('sanctuary:log', result.logEntry);
  }
  if (result.miracleEvent) {
    io.emit('sanctuary:miracle', {
      miracleEvent: result.miracleEvent,
      stats: result.stats
    });
  }
}

async function connectToTikTok(username, signApiKey = '') {
  const cleanUsername = String(username || '')
    .replace(/^https?:\/\/(www\.)?tiktok\.com\/@?/i, '')
    .replace(/\/live.*$/i, '')
    .replace(/^@/, '')
    .trim();

  if (!cleanUsername) return;

  if (tiktokConnection) {
    try {
      await tiktokConnection.disconnect();
    } catch (_) {}
    tiktokConnection = null;
  }

  currentUsername = cleanUsername;
  connectionStatus = 'connecting';
  lastError = '';
  broadcastTikTokStatus();

  const apiKeyToUse = String(signApiKey || sanctuary.data.settings.signApiKey || '').trim();
  if (SignConfig) {
    SignConfig.apiKey = apiKeyToUse || undefined;
    SignConfig.cachedInstance = undefined;
    if (apiKeyToUse) {
      sanctuary.updateSettings({ signApiKey: apiKeyToUse });
    }
  }

  const ConnectionClass = TikTokLiveConnection || WebcastPushConnection;
  const options = {
    processInitialData: false,
    enableExtendedGiftInfo: false
  };
  if (apiKeyToUse) {
    options.signApiKey = apiKeyToUse;
  }

  tiktokConnection = new ConnectionClass(cleanUsername, options);

  try {
    const state = await tiktokConnection.connect();
    connectionStatus = 'connected';
    lastError = '';
    console.log(`[TikTok Live] Đã kết nối tới phòng live của @${cleanUsername} (Room ID: ${state.roomId})`);
    const logEntry = sanctuary.addEventLog('system', `✅ Đã kết nối trực tiếp tới phòng Live @${cleanUsername} (Room: ${state.roomId})`);
    io.emit('sanctuary:log', logEntry);
    broadcastTikTokStatus();
  } catch (err) {
    connectionStatus = 'error';
    const rawMsg = err?.message || String(err);
    if (rawMsg.includes('UserOfflineError') || rawMsg.includes('offline') || rawMsg.includes('not live')) {
      lastError = `Tài khoản @${cleanUsername} hiện chưa bật phát LIVE trên TikTok!`;
    } else if (rawMsg.includes('403') || rawMsg.includes('429') || rawMsg.includes('sign')) {
      lastError = `Cổng chữ ký miễn phí đang bận (403/429). Bạn có thể bấm Kết nối lại hoặc dán Sign API Key miễn phí từ eulerstream.com vào ô bên dưới.`;
    } else {
      lastError = rawMsg;
    }
    console.error(`[TikTok Live] Lỗi kết nối @${cleanUsername}:`, rawMsg);
    broadcastTikTokStatus();
    return;
  }

  const chatEvent = WebcastEvent?.CHAT || 'chat';
  const likeEvent = WebcastEvent?.LIKE || 'like';
  const followEvent = WebcastEvent?.FOLLOW || 'follow';
  const shareEvent = WebcastEvent?.SHARE || 'share';
  const giftEvent = WebcastEvent?.GIFT || 'gift';
  const memberEvent = WebcastEvent?.MEMBER || 'member';
  const streamEndEvent = WebcastEvent?.STREAM_END || 'streamEnd';
  const disconnectedEvent = ControlEvent?.DISCONNECTED || 'disconnected';

  tiktokConnection.on(chatEvent, (data) => {
    const u = extractUserInfo(data);
    const result = sanctuary.recordPrayer({
      userId: u.userId,
      nickname: u.nickname,
      avatarUrl: u.avatarUrl,
      comment: data.comment
    });
    handleActionBroadcast('sanctuary:prayer', result);
  });

  tiktokConnection.on(likeEvent, (data) => {
    const u = extractUserInfo(data);
    const result = sanctuary.recordLike({
      userId: u.userId,
      nickname: u.nickname,
      avatarUrl: u.avatarUrl,
      likeCount: data.likeCount || 1
    });
    handleActionBroadcast('sanctuary:like', result);
  });

  tiktokConnection.on(followEvent, (data) => {
    const u = extractUserInfo(data);
    const result = sanctuary.recordFollow({
      userId: u.userId,
      nickname: u.nickname,
      avatarUrl: u.avatarUrl
    });
    handleActionBroadcast('sanctuary:follow', result);
  });

  tiktokConnection.on(shareEvent, (data) => {
    const u = extractUserInfo(data);
    const result = sanctuary.recordShare({
      userId: u.userId,
      nickname: u.nickname,
      avatarUrl: u.avatarUrl
    });
    handleActionBroadcast('sanctuary:share', result);
  });

  tiktokConnection.on(giftEvent, (data) => {
    const giftType = data.giftDetails?.giftType ?? data.giftType;
    if (giftType === 1 && !data.repeatEnd) {
      return;
    }
    const u = extractUserInfo(data);
    const giftName =
      data.giftDetails?.giftName ||
      data.extendedGiftInfo?.name ||
      data.giftName ||
      'Lễ Vật';
    const diamondCount =
      data.giftDetails?.diamondCount ||
      data.extendedGiftInfo?.diamond_count ||
      data.diamondCount ||
      1;
    const result = sanctuary.recordGift({
      userId: u.userId,
      nickname: u.nickname,
      avatarUrl: u.avatarUrl,
      giftName,
      diamondCount,
      repeatCount: data.repeatCount || 1
    });
    handleActionBroadcast('sanctuary:gift', result);
  });

  tiktokConnection.on(memberEvent, (data) => {
    const u = extractUserInfo(data);
    io.emit('sanctuary:visitor', {
      nickname: u.nickname,
      avatarUrl: u.avatarUrl
    });
  });

  tiktokConnection.on(streamEndEvent, () => {
    connectionStatus = 'disconnected';
    lastError = 'Phiên Live đã kết thúc';
    broadcastTikTokStatus();
  });

  tiktokConnection.on(disconnectedEvent, () => {
    connectionStatus = 'disconnected';
    broadcastTikTokStatus();
  });
}

async function disconnectTikTok() {
  if (tiktokConnection) {
    try {
      await tiktokConnection.disconnect();
    } catch (_) {}
    tiktokConnection = null;
  }
  connectionStatus = 'disconnected';
  lastError = '';
  broadcastTikTokStatus();
}

let scriptureTimer = null;
function startScriptureScheduler() {
  if (scriptureTimer) clearInterval(scriptureTimer);
  const intervalSec = Math.max(15, Number(sanctuary.data.settings.autoScriptureIntervalSec) || 45);
  scriptureTimer = setInterval(() => {
    const quote = sanctuary.getRandomScripture();
    io.emit('sanctuary:scripture', quote);
  }, intervalSec * 1000);
}
startScriptureScheduler();

io.on('connection', (socket) => {
  socket.emit('sanctuary:init', sanctuary.getSnapshot());
  socket.emit('tiktok:status', {
    username: currentUsername,
    status: connectionStatus,
    error: lastError
  });

  socket.on('admin:connectTikTok', ({ username, signApiKey, cleanBeforeConnect }) => {
    if (cleanBeforeConnect) {
      sanctuary.resetLeaderboard();
      io.emit('sanctuary:init', sanctuary.getSnapshot());
    }
    connectToTikTok(username, signApiKey);
  });

  socket.on('admin:disconnectTikTok', () => {
    disconnectTikTok();
  });

  socket.on('admin:simulatePrayer', (payload = {}) => {
    const result = sanctuary.recordPrayer({
      userId: payload.userId || `sim_${Math.floor(Math.random() * 900 + 100)}`,
      nickname: payload.nickname || 'Người Cầu Nguyện',
      avatarUrl: payload.avatarUrl || '',
      comment: payload.comment || 'Cầu xin bình an, sức khỏe và hạnh phúc cho gia đình 🙏'
    });
    handleActionBroadcast('sanctuary:prayer', result);
  });

  socket.on('admin:simulateFollow', (payload = {}) => {
    const result = sanctuary.recordFollow({
      userId: payload.userId || `follow_${Math.floor(Math.random() * 900 + 100)}`,
      nickname: payload.nickname || 'Tín Hữu Mới',
      avatarUrl: payload.avatarUrl || ''
    });
    handleActionBroadcast('sanctuary:follow', result);
  });

  socket.on('admin:simulateShare', (payload = {}) => {
    const result = sanctuary.recordShare({
      userId: payload.userId || `share_${Math.floor(Math.random() * 900 + 100)}`,
      nickname: payload.nickname || 'Sứ Giả Lan Tỏa',
      avatarUrl: payload.avatarUrl || ''
    });
    handleActionBroadcast('sanctuary:share', result);
  });

  socket.on('admin:simulateLike', (payload = {}) => {
    const result = sanctuary.recordLike({
      userId: payload.userId || `sim_${Math.floor(Math.random() * 900 + 100)}`,
      nickname: payload.nickname || 'Tín Hữu Ân Phúc',
      avatarUrl: payload.avatarUrl || '',
      likeCount: payload.likeCount || 15
    });
    handleActionBroadcast('sanctuary:like', result);
  });

  socket.on('admin:simulateGift', (payload = {}) => {
    const result = sanctuary.recordGift({
      userId: payload.userId || `vip_${Math.floor(Math.random() * 90 + 10)}`,
      nickname: payload.nickname || 'Ân Nhân Thánh Đường',
      avatarUrl: payload.avatarUrl || '',
      giftName: payload.giftName || 'Nến Thánh Vàng',
      diamondCount: payload.diamondCount || 1,
      repeatCount: payload.repeatCount || 1
    });
    handleActionBroadcast('sanctuary:gift', result);
  });

  socket.on('admin:triggerMiracle', () => {
    const res = sanctuary.triggerFullMiracle('Chủ Kênh Thánh Đường');
    if (res.logEntry) {
      io.emit('sanctuary:log', res.logEntry);
    }
    if (res.miracleEvent) {
      io.emit('sanctuary:miracle', {
        miracleEvent: res.miracleEvent,
        stats: res.stats
      });
    }
  });

  socket.on('admin:triggerScripture', (customQuote) => {
    const quote = customQuote && customQuote.text ? customQuote : sanctuary.getRandomScripture();
    io.emit('sanctuary:scripture', quote);
  });

  socket.on('admin:updateSettings', (partial) => {
    const updated = sanctuary.updateSettings(partial);
    if (partial.autoScriptureIntervalSec) {
      startScriptureScheduler();
    }
    io.emit('sanctuary:settings', updated);
    const logEntry = sanctuary.addEventLog('system', `⚙️ Đã cập nhật cài đặt Thánh Đường (Theme: ${updated.theme}, Nhạc: ${updated.bgmTrack})`);
    io.emit('sanctuary:log', logEntry);
  });

  socket.on('admin:resetLeaderboard', () => {
    sanctuary.resetLeaderboard();
    io.emit('sanctuary:init', sanctuary.getSnapshot());
  });
});

server.listen(PORT, () => {
  console.log('===========================================================');
  console.log(`⛪ THÁNH ĐƯỜNG ONLINE - TIKTOK LIVE SERVER ĐÃ KHỞI ĐỘNG`);
  console.log(`👉 Màn hình Live (Gắn vào OBS 1080x1920): http://localhost:${PORT}`);
  console.log(`🛠️  Bảng điều khiển Admin & Test hiệu ứng: http://localhost:${PORT}/admin`);
  console.log('===========================================================');
});
