(() => {
  const socket = io();

  // DOM Elements
  const stageEl = document.getElementById('stage');
  const channelTitleEl = document.getElementById('channel-title');
  const statBlessingsEl = document.getElementById('stat-blessings');
  const statCandlesEl = document.getElementById('stat-candles');
  const statBellsEl = document.getElementById('stat-bells');
  const miracleFillEl = document.getElementById('miracle-fill');
  const miraclePercentEl = document.getElementById('miracle-percent');
  const vipThroneBanner = document.getElementById('vip-throne-banner');
  const vipAvatarEl = document.getElementById('vip-avatar');
  const vipNameEl = document.getElementById('vip-name');
  const vipGiftBadgeEl = document.getElementById('vip-gift-badge');
  const vipPrayerTextEl = document.getElementById('vip-prayer-text');
  const scriptureBoxEl = document.getElementById('scripture-box');
  const scriptureTextEl = document.getElementById('scripture-text');
  const scriptureSourceEl = document.getElementById('scripture-source');
  const leaderboardListEl = document.getElementById('leaderboard-list');
  const recentPrayersListEl = document.getElementById('recent-prayers-list');
  const likeComboContainer = document.getElementById('like-combo-container');
  const floatingWishesContainer = document.getElementById('floating-wishes-container');
  const churchBellEl = document.getElementById('church-bell');
  const churchBellWrap = document.getElementById('church-bell-wrap');
  const bellRippleEl = document.getElementById('bell-ripple');
  const candleRowTop = document.getElementById('candle-row-top');
  const candleRowMid = document.getElementById('candle-row-mid');
  const candleRowBot = document.getElementById('candle-row-bot');
  const giftModalEl = document.getElementById('gift-blessing-modal');
  const giftCrownEl = document.getElementById('gift-crown');
  const giftAvatarEl = document.getElementById('gift-avatar');
  const giftUsernameEl = document.getElementById('gift-username');
  const giftDetailEl = document.getElementById('gift-detail');
  const giftBlessingTextEl = document.getElementById('gift-blessing-text');
  const audioUnlockBtn = document.getElementById('audio-unlock-btn');

  const DEFAULT_AVATAR =
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
        <rect width="80" height="80" rx="40" fill="#312e81"/>
        <path d="M36 16 H44 V32 H58 V40 H44 V64 H36 V40 H22 V32 H36 Z" fill="#fde047"/>
      </svg>`
    );

  const ANGEL_WING_SVG = `
    <svg viewBox="0 0 60 100" width="42" height="68">
      <path d="M55 50 C35 12 8 6 4 22 C2 32 18 42 32 48 C14 46 4 56 8 68 C11 76 26 76 38 66 C24 76 18 88 26 94 C34 98 48 82 55 50 Z"
            fill="rgba(254, 240, 138, 0.92)" stroke="#f59e0b" stroke-width="2"/>
    </svg>
  `;

  const DEFAULT_SANCTUARY_CANDLES = [
    { nickname: 'Hồng Ân Chúa Ban', tier: 'divine' },
    { nickname: 'Bình An Gia Đình', tier: 'golden' },
    { nickname: 'Sức Khỏe Cha Mẹ', tier: 'rose' },
    { nickname: 'Công Việc Hanh Thông', tier: 'sapphire' },
    { nickname: 'Phước Lành Đêm Nay', tier: 'divine' },
    { nickname: 'Vạn Sự Bình An', tier: 'golden' },
    { nickname: 'Tâm Hồn Thanh Thản', tier: 'normal' },
    { nickname: 'Mọi Sự Tốt Lành', tier: 'rose' },
    { nickname: 'Gia Đạo Hạnh Phúc', tier: 'golden' },
    { nickname: 'Thi Cử Đỗ Đạt', tier: 'sapphire' },
    { nickname: 'Ánh Sáng Hy Vọng', tier: 'golden' },
    { nickname: 'Yêu Thương Viên Mãn', tier: 'normal' },
    { nickname: 'Ơn Trên Che Chở', tier: 'rose' },
    { nickname: 'Vững Bước Đức Tin', tier: 'sapphire' },
    { nickname: 'Bình An Viên Mãn', tier: 'golden' }
  ];

  let settings = {
    ttsEnabled: true,
    ttsPrayerEnabled: true,
    bellSoundEnabled: true,
    bgMusicEnabled: true,
    bgmTrack: 'cathedral_organ',
    bgmVolume: 60,
    theme: 'night',
    channelTitle: 'THÁNH ĐƯỜNG NGUYỆN ƯỚC ONLINE'
  };

  vipAvatarEl.src = DEFAULT_AVATAR;

  function fitStageToWindow() {
    const scaleX = window.innerWidth / 1080;
    const scaleY = window.innerHeight / 1920;
    const scale = Math.min(scaleX, scaleY);
    stageEl.style.transform = `scale(${scale})`;
  }
  window.addEventListener('resize', fitStageToWindow);
  fitStageToWindow();

  function applyTheme(themeName) {
    stageEl.classList.remove('theme-night', 'theme-dawn', 'theme-christmas');
    stageEl.classList.add(`theme-${themeName || 'night'}`);
  }

  // =========================================================================
  // MULTI-TRACK PROCEDURAL WEB AUDIO ENGINE
  // =========================================================================
  let audioCtx = null;
  let isAudioUnlocked = false;
  let activeBgmNodes = [];
  let bgmInterval = null;

  function getVolumeScalar() {
    return Math.max(0.02, Math.min(1, (Number(settings.bgmVolume) || 60) / 100));
  }

  function initAudio() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    isAudioUnlocked = true;
    audioUnlockBtn.classList.add('hidden');
    restartBackgroundMusic();
  }

  audioUnlockBtn.addEventListener('click', initAudio);
  document.body.addEventListener('pointerdown', () => {
    if (!isAudioUnlocked) initAudio();
  }, { once: true });

  setTimeout(() => {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      const testCtx = new AudioContextClass();
      if (testCtx.state === 'running') {
        audioCtx = testCtx;
        isAudioUnlocked = true;
        audioUnlockBtn.classList.add('hidden');
        restartBackgroundMusic();
      } else {
        testCtx.close();
      }
    } catch (_) {}
  }, 500);

  function stopBackgroundMusic() {
    if (bgmInterval) {
      clearInterval(bgmInterval);
      bgmInterval = null;
    }
    activeBgmNodes.forEach((node) => {
      try {
        if (node.stop) node.stop();
        if (node.disconnect) node.disconnect();
      } catch (_) {}
    });
    activeBgmNodes = [];
  }

  function restartBackgroundMusic() {
    stopBackgroundMusic();
    if (!audioCtx || !isAudioUnlocked || !settings.bgMusicEnabled || settings.bgmTrack === 'silent') {
      return;
    }

    const vol = getVolumeScalar();
    const track = settings.bgmTrack || 'cathedral_organ';

    if (track === 'cathedral_organ') {
      const freqs = [130.81, 196.00, 246.94, 261.63, 329.63];
      freqs.forEach((f) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.018 * vol, audioCtx.currentTime);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        activeBgmNodes.push(osc, gain);
      });
    } else if (track === 'peaceful_piano') {
      const progressions = [
        [261.63, 329.63, 392.00, 523.25],
        [220.00, 261.63, 329.63, 440.00],
        [174.61, 220.00, 261.63, 349.23],
        [196.00, 246.94, 293.66, 392.00]
      ];
      let chordIdx = 0;
      let noteIdx = 0;
      bgmInterval = setInterval(() => {
        if (!audioCtx || !settings.bgMusicEnabled) return;
        const chord = progressions[chordIdx];
        const freq = chord[noteIdx];
        noteIdx = (noteIdx + 1) % chord.length;
        if (noteIdx === 0) chordIdx = (chordIdx + 1) % progressions.length;

        const now = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.exponentialRampToValueAtTime(0.055 * getVolumeScalar(), now + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.4);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 2.5);
      }, 650);
    } else if (track === 'night_rain') {
      const bufferSize = audioCtx.sampleRate * 3;
      const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.997 * b0 + white * 0.029;
        b1 = 0.985 * b1 + white * 0.032;
        b2 = 0.950 * b2 + white * 0.048;
        output[i] = (b0 + b1 + b2) * 0.25;
      }
      const whiteNoise = audioCtx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const filter = audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(900, audioCtx.currentTime);

      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.08 * vol, audioCtx.currentTime);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx.destination);
      whiteNoise.start();
      activeBgmNodes.push(whiteNoise, filter, gain);
    }
  }

  function playChurchBell() {
    if (!settings.bellSoundEnabled || !audioCtx) return;
    const now = audioCtx.currentTime;
    const freqs = [523.25, 1046.5, 1318.5, 1567.98];
    freqs.forEach((freq, idx) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = idx === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      const peak = 0.14 / (idx + 1);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(peak, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.2 - idx * 0.4);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 3.3);
    });
  }

  function playHarpChime() {
    if (!settings.bellSoundEnabled || !audioCtx) return;
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, i) => {
      const start = audioCtx.currentTime + i * 0.09;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.001, start);
      gain.gain.exponentialRampToValueAtTime(0.08, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 1.6);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(start);
      osc.stop(start + 1.7);
    });
  }

  function playGrandBlessingFanfare() {
    if (!settings.bellSoundEnabled || !audioCtx) return;
    const chord = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.5];
    chord.forEach((freq, i) => {
      const start = audioCtx.currentTime + i * 0.08;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.001, start);
      gain.gain.exponentialRampToValueAtTime(0.09, start + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 3.8);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(start);
      osc.stop(start + 3.9);
    });
  }

  // =========================================================================
  // VIETNAMESE TTS QUEUE
  // =========================================================================
  const ttsQueue = [];
  let isSpeaking = false;

  function enqueueTTS(text, highPriority = false) {
    if (!settings.ttsEnabled || !text) return;
    if (highPriority) {
      ttsQueue.unshift(text);
    } else {
      if (ttsQueue.length >= 3) return;
      ttsQueue.push(text);
    }
    processTTSQueue();
  }

  function processTTSQueue() {
    if (isSpeaking || ttsQueue.length === 0) return;
    isSpeaking = true;
    const nextText = ttsQueue.shift();
    const audio = new Audio(`/api/tts?text=${encodeURIComponent(nextText)}`);
    audio.volume = 0.95;
    audio.onended = () => {
      isSpeaking = false;
      setTimeout(processTTSQueue, 350);
    };
    audio.onerror = () => {
      if ('speechSynthesis' in window) {
        const utter = new SpeechSynthesisUtterance(nextText);
        utter.lang = 'vi-VN';
        utter.onend = () => {
          isSpeaking = false;
          processTTSQueue();
        };
        window.speechSynthesis.speak(utter);
      } else {
        isSpeaking = false;
        processTTSQueue();
      }
    };
    audio.play().catch(() => {
      isSpeaking = false;
    });
  }

  // =========================================================================
  // HTML5 CANVAS FX
  // =========================================================================
  const canvas = document.getElementById('fx-canvas');
  const ctx = canvas.getContext('2d');

  const dustParticles = [];
  const burstParticles = [];
  const meteors = [];
  const doves = [];

  for (let i = 0; i < 65; i++) {
    dustParticles.push({
      x: Math.random() * 1080,
      y: Math.random() * 1920,
      r: Math.random() * 2.8 + 0.8,
      vy: -(Math.random() * 0.45 + 0.15),
      vx: (Math.random() - 0.5) * 0.3,
      alpha: Math.random() * 0.65 + 0.2
    });
  }

  function spawnGoldenBurst(x, y, count = 28) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 4.8 + 1.2;
      burstParticles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.2,
        r: Math.random() * 4 + 2,
        alpha: 1,
        color: Math.random() > 0.3 ? '#fde047' : '#ffffff'
      });
    }
  }

  function spawnMiracleMeteorShower(count = 26) {
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        meteors.push({
          x: Math.random() * 1080,
          y: -40 - Math.random() * 200,
          vx: (Math.random() - 0.5) * 3.5,
          vy: Math.random() * 9 + 8,
          len: Math.random() * 90 + 55,
          alpha: 1
        });
      }, i * 130);
    }
  }

  function spawnPeaceDoves(count = 4) {
    for (let i = 0; i < count; i++) {
      doves.push({
        x: 220 + Math.random() * 640,
        y: 1350 + Math.random() * 160,
        vx: (Math.random() - 0.5) * 2.2,
        vy: -(Math.random() * 2.5 + 2.2),
        wingPhase: Math.random() * Math.PI * 2,
        scale: Math.random() * 0.35 + 0.78,
        alpha: 1
      });
    }
  }

  function renderCanvas() {
    ctx.clearRect(0, 0, 1080, 1920);

    for (const p of dustParticles) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.y < 0) p.y = 1920;
      if (p.x < 0) p.x = 1080;
      if (p.x > 1080) p.x = 0;

      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = '#fde68a';
      ctx.shadowColor = '#fbbf24';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    for (let i = meteors.length - 1; i >= 0; i--) {
      const m = meteors[i];
      m.x += m.vx;
      m.y += m.vy;
      if (m.y > 1950) {
        meteors.splice(i, 1);
        continue;
      }
      ctx.save();
      const grad = ctx.createLinearGradient(m.x, m.y, m.x - m.vx * 8, m.y - m.len);
      grad.addColorStop(0, '#fffbeb');
      grad.addColorStop(0.4, '#fde047');
      grad.addColorStop(1, 'transparent');
      ctx.strokeStyle = grad;
      ctx.lineWidth = 4;
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.moveTo(m.x, m.y);
      ctx.lineTo(m.x - m.vx * 6, m.y - m.len);
      ctx.stroke();
      ctx.restore();
    }

    for (let i = burstParticles.length - 1; i >= 0; i--) {
      const b = burstParticles[i];
      b.x += b.vx;
      b.y += b.vy;
      b.alpha -= 0.018;
      if (b.alpha <= 0) {
        burstParticles.splice(i, 1);
        continue;
      }
      ctx.save();
      ctx.globalAlpha = b.alpha;
      ctx.fillStyle = b.color;
      ctx.shadowColor = '#fde047';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    for (let i = doves.length - 1; i >= 0; i--) {
      const d = doves[i];
      d.x += d.vx;
      d.y += d.vy;
      d.wingPhase += 0.22;
      if (d.y < 240) d.alpha -= 0.02;
      if (d.alpha <= 0) {
        doves.splice(i, 1);
        continue;
      }

      const wingY = Math.sin(d.wingPhase) * 14;
      ctx.save();
      ctx.translate(d.x, d.y);
      ctx.scale(d.scale, d.scale);
      ctx.globalAlpha = d.alpha;
      ctx.strokeStyle = '#ffffff';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
      ctx.shadowColor = '#fde047';
      ctx.shadowBlur = 18;
      ctx.lineWidth = 3.5;

      ctx.beginPath();
      ctx.moveTo(-26, wingY);
      ctx.quadraticCurveTo(-10, -14, 0, 0);
      ctx.quadraticCurveTo(10, -14, 26, wingY);
      ctx.stroke();

      ctx.beginPath();
      ctx.ellipse(0, 2, 7, 3.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    requestAnimationFrame(renderCanvas);
  }
  requestAnimationFrame(renderCanvas);

  // =========================================================================
  // UI RENDERING HELPERS
  // =========================================================================
  function updateStats(stats) {
    if (!stats) return;
    statBlessingsEl.textContent = Number(stats.totalBlessings || 0).toLocaleString('vi-VN');
    statCandlesEl.textContent = Number(stats.totalCandles || 0).toLocaleString('vi-VN');
    statBellsEl.textContent = Number(stats.totalBellRings || 0).toLocaleString('vi-VN');

    const gauge = Math.min(100, Math.max(0, Number(stats.miracleGauge) || 0));
    const count = Number(stats.miracleCount) || 0;
    miracleFillEl.style.width = `${gauge}%`;
    miraclePercentEl.textContent = `${gauge}% • Đã mở: ${count} lần`;
  }

  function updateVipThrone(pinnedVip, pulse = false) {
    if (!pinnedVip) return;
    vipAvatarEl.src = pinnedVip.avatarUrl || DEFAULT_AVATAR;
    vipAvatarEl.onerror = () => {
      vipAvatarEl.src = DEFAULT_AVATAR;
    };
    vipNameEl.textContent = pinnedVip.nickname || 'Chưa có Ân Nhân VIP';
    vipGiftBadgeEl.textContent = pinnedVip.giftName
      ? `🌹 Lễ vật: ${pinnedVip.giftName}`
      : '🌹 Tặng 1 Hoa Hồng để ghim lời nguyện của bạn lên đây!';
    vipPrayerTextEl.textContent = `“${pinnedVip.prayer || ''}”`;

    if (pulse) {
      vipThroneBanner.classList.remove('highlight-pulse');
      void vipThroneBanner.offsetWidth;
      vipThroneBanner.classList.add('highlight-pulse');
      setTimeout(() => vipThroneBanner.classList.remove('highlight-pulse'), 1800);
    }
  }

  function updateLeaderboard(leaderboard = []) {
    if (!leaderboard.length) {
      leaderboardListEl.innerHTML =
        '<li class="empty-leaderboard">Hãy là người đầu tiên thắp nến cầu nguyện đêm nay 🙏</li>';
      return;
    }
    leaderboardListEl.innerHTML = leaderboard
      .slice(0, 5)
      .map((item) => {
        const rankClass = item.rank <= 3 ? `rank-${item.rank}` : '';
        const avatar = item.avatarUrl || DEFAULT_AVATAR;
        return `
          <li class="lb-item ${rankClass}">
            <div class="lb-left">
              <span class="lb-rank">${item.rank}</span>
              <img class="lb-avatar" src="${escapeHtml(avatar)}" onerror="this.src='${DEFAULT_AVATAR}'" alt="avatar" />
              <span class="lb-name">${escapeHtml(item.nickname)}</span>
            </div>
            <span class="lb-score">${Number(item.score).toLocaleString('vi-VN')} ✨</span>
          </li>
        `;
      })
      .join('');
  }

  function renderRecentPrayers(prayers = []) {
    if (!prayers.length) {
      recentPrayersListEl.innerHTML = `
        <div class="recent-prayer-card">
          <div class="recent-prayer-user">🕯️ Thánh Đường Bình An</div>
          <div class="recent-prayer-text">Gõ phím 1, 2, 3 hoặc bình luận để thắp nến...</div>
        </div>
      `;
      return;
    }
    recentPrayersListEl.innerHTML = prayers
      .slice(0, 3)
      .map(
        (p) => `
        <div class="recent-prayer-card">
          <div class="recent-prayer-user">🕯️ ${escapeHtml(p.nickname)}</div>
          <div class="recent-prayer-text">${escapeHtml(p.prayer)}</div>
        </div>
      `
      )
      .join('');
  }

  function createCandleHTML(c) {
    const tier = escapeHtml(c.tier || 'normal');
    const emblem = tier === 'divine' ? '👑' : '✞';
    return `
      <div class="candle-slot tier-${tier}">
        <div class="flame-wrap">
          <div class="flame-halo"></div>
          <div class="flame"></div>
        </div>
        <div class="candle-body">
          <span class="candle-cross-emblem">${emblem}</span>
        </div>
        <div class="candle-tag">${escapeHtml(c.nickname)}</div>
      </div>
    `;
  }

  function renderAltarCandles(candles = []) {
    const combined = [...candles];
    let idx = 0;
    while (combined.length < 15) {
      combined.push(DEFAULT_SANCTUARY_CANDLES[idx % DEFAULT_SANCTUARY_CANDLES.length]);
      idx++;
    }
    const top = combined.slice(0, 5);
    const mid = combined.slice(5, 10);
    const bot = combined.slice(10, 15);

    candleRowTop.innerHTML = top.map(createCandleHTML).join('');
    candleRowMid.innerHTML = mid.map(createCandleHTML).join('');
    candleRowBot.innerHTML = bot.map(createCandleHTML).join('');
  }

  function spawnFloatingWishCard({ nickname, avatarUrl, prayer, categoryTitle, oracleText, tier }) {
    const card = document.createElement('div');
    const tierName = tier || 'normal';
    card.className = `floating-wish-card tier-${escapeHtml(tierName)}`;
    const offset = Math.floor(Math.random() * 80) - 40;
    card.style.marginLeft = `${-270 + offset}px`;

    const avatar = avatarUrl || DEFAULT_AVATAR;
    const badge = tierName === 'divine' ? '🕊️' : tierName === 'golden' ? '🌟' : '🕯️';

    const oracleSection = oracleText
      ? `<div class="wish-oracle-box">
          <strong>${escapeHtml(categoryTitle || '📜 THÔNG ĐIỆP RIÊNG CHO BẠN')}</strong>
          ${escapeHtml(oracleText)}
        </div>`
      : '';

    card.innerHTML = `
      <div class="angel-wing angel-wing-left">${ANGEL_WING_SVG}</div>
      <div class="angel-wing angel-wing-right">${ANGEL_WING_SVG}</div>
      <img class="wish-avatar" src="${escapeHtml(avatar)}" onerror="this.src='${DEFAULT_AVATAR}'" alt="avatar" />
      <div class="wish-body">
        <div class="wish-user">${badge} ${escapeHtml(nickname)}</div>
        <div class="wish-text">${escapeHtml(prayer)}</div>
        ${oracleSection}
      </div>
    `;

    floatingWishesContainer.appendChild(card);
    spawnGoldenBurst(540, 1180, 26);

    setTimeout(() => {
      card.remove();
    }, 11000);
  }

  function spawnLikeComboBadge(user, likeCount) {
    if (!user) return;
    const badge = document.createElement('div');
    badge.className = 'like-combo-badge';
    const avatar = user.avatarUrl || DEFAULT_AVATAR;
    badge.innerHTML = `
      <img src="${escapeHtml(avatar)}" onerror="this.src='${DEFAULT_AVATAR}'" alt="avatar" />
      <span>${escapeHtml(user.nickname)} +${likeCount} ❤️ 🔔</span>
    `;
    likeComboContainer.appendChild(badge);
    setTimeout(() => badge.remove(), 2400);
  }

  function ringBellAnimation() {
    churchBellEl.classList.remove('ringing');
    bellRippleEl.classList.remove('active');
    void churchBellEl.offsetWidth;
    churchBellEl.classList.add('ringing');
    bellRippleEl.classList.add('active');
    playChurchBell();
    spawnGoldenBurst(950, 110, 18);
  }

  churchBellWrap.addEventListener('click', () => {
    socket.emit('admin:simulateLike', { nickname: 'Khách Thánh Đường', likeCount: 10 });
  });

  let giftModalTimeout = null;
  function showCenterAnnouncementModal({ crown, avatarUrl, username, detail, message, ttsText, isMiracle }) {
    if (giftModalTimeout) clearTimeout(giftModalTimeout);

    giftCrownEl.textContent = crown || '🕊️ HỒNG ÂN THÁNH ĐƯỜNG 🕊️';
    giftAvatarEl.src = avatarUrl || DEFAULT_AVATAR;
    giftAvatarEl.onerror = () => {
      giftAvatarEl.src = DEFAULT_AVATAR;
    };
    giftUsernameEl.textContent = username;
    giftDetailEl.textContent = detail;
    giftBlessingTextEl.textContent = message;

    giftModalEl.classList.remove('hidden');
    playGrandBlessingFanfare();
    spawnPeaceDoves(isMiracle ? 12 : 6);
    spawnGoldenBurst(540, 820, 48);

    if (isMiracle) {
      spawnMiracleMeteorShower(28);
    }

    if (ttsText) {
      enqueueTTS(ttsText, true);
    }

    giftModalTimeout = setTimeout(() => {
      giftModalEl.classList.add('hidden');
    }, 6800);
  }

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // =========================================================================
  // SOCKET.IO REAL-TIME EVENTS
  // =========================================================================
  socket.on('sanctuary:init', (snapshot) => {
    if (!snapshot) return;
    floatingWishesContainer.innerHTML = '';
    likeComboContainer.innerHTML = '';
    giftModalEl.classList.add('hidden');
    if (snapshot.settings) {
      settings = { ...settings, ...snapshot.settings };
      channelTitleEl.textContent = settings.channelTitle || 'THÁNH ĐƯỜNG NGUYỆN ƯỚC ONLINE';
      applyTheme(settings.theme);
      restartBackgroundMusic();
    }
    updateStats(snapshot.stats);
    updateVipThrone(snapshot.pinnedVip, false);
    updateLeaderboard(snapshot.leaderboard);
    renderAltarCandles(snapshot.candles);
    renderRecentPrayers(snapshot.recentPrayers);
    if (snapshot.scripture) {
      scriptureTextEl.textContent = snapshot.scripture.text;
      scriptureSourceEl.textContent = `— ${snapshot.scripture.source} —`;
    }
  });

  socket.on('sanctuary:prayer', (data) => {
    updateStats(data.stats);
    updateLeaderboard(data.leaderboard);
    spawnFloatingWishCard(data.prayerItem);
    playHarpChime();
    spawnPeaceDoves(2);

    if (settings.ttsPrayerEnabled && data.prayerItem && data.prayerItem.ttsText) {
      enqueueTTS(data.prayerItem.ttsText, false);
    }

    const card = document.createElement('div');
    card.className = 'recent-prayer-card';
    card.innerHTML = `
      <div class="recent-prayer-user">🕯️ ${escapeHtml(data.prayerItem.nickname)}</div>
      <div class="recent-prayer-text">${escapeHtml(data.prayerItem.prayer)}</div>
    `;
    recentPrayersListEl.prepend(card);
    while (recentPrayersListEl.children.length > 3) {
      recentPrayersListEl.lastElementChild.remove();
    }

    addCandleElementToAltar(data.candle);
  });

  function addCandleElementToAltar(candle) {
    if (!candle) return;
    const wrapper = document.createElement('div');
    wrapper.innerHTML = createCandleHTML(candle).trim();
    const slot = wrapper.firstElementChild;

    if (candleRowTop.children.length < 5) {
      candleRowTop.appendChild(slot);
    } else if (candleRowMid.children.length < 5) {
      candleRowMid.appendChild(slot);
    } else if (candleRowBot.children.length < 5) {
      candleRowBot.appendChild(slot);
    } else {
      const moveFromTop = candleRowTop.firstElementChild;
      const moveFromMid = candleRowMid.firstElementChild;
      if (candleRowBot.firstElementChild) {
        candleRowBot.removeChild(candleRowBot.firstElementChild);
      }
      if (moveFromMid) candleRowBot.appendChild(moveFromMid);
      if (moveFromTop) candleRowMid.appendChild(moveFromTop);
      candleRowTop.appendChild(slot);
    }
  }

  socket.on('sanctuary:follow', (data) => {
    updateStats(data.stats);
    updateLeaderboard(data.leaderboard);
    if (data.candle) addCandleElementToAltar(data.candle);
    if (data.followEvent) {
      showCenterAnnouncementModal({
        crown: '✨ TÍN HỮU MỚI GHI DANH SỔ VÀNG ✨',
        avatarUrl: data.followEvent.avatarUrl,
        username: data.followEvent.nickname,
        detail: data.followEvent.message,
        message: 'Cảm ơn bạn đã Follow kênh! Ngọn Nến Vàng Hộ Mệnh của bạn đã được thắp sáng trên bàn thờ!',
        ttsText: data.followEvent.ttsText,
        isMiracle: false
      });
    }
  });

  socket.on('sanctuary:share', (data) => {
    updateStats(data.stats);
    updateLeaderboard(data.leaderboard);
    playHarpChime();
    spawnPeaceDoves(3);
  });

  socket.on('sanctuary:like', (data) => {
    updateStats(data.stats);
    updateLeaderboard(data.leaderboard);
    ringBellAnimation();
    spawnLikeComboBadge(data.user, data.likeCount || 1);
  });

  socket.on('sanctuary:gift', (data) => {
    updateStats(data.stats);
    updateLeaderboard(data.leaderboard);
    if (data.pinnedVip) {
      updateVipThrone(data.pinnedVip, true);
    }
    if (data.candle) {
      addCandleElementToAltar(data.candle);
    }
    if (data.giftEvent) {
      showCenterAnnouncementModal({
        crown: data.giftEvent.isMajorBlessing ? '👑 ĐẠI LỄ VẬT HỒNG ÂN 👑' : '🕊️ LỄ VẬT THÁNH ĐƯỜNG • CHIẾM NGÔI VIP 🕊️',
        avatarUrl: data.giftEvent.avatarUrl,
        username: data.giftEvent.nickname,
        detail: `Đã dâng: ${data.giftEvent.giftName} x${data.giftEvent.repeatCount} (+${data.giftEvent.points} Phước Lành & Ghim Đỉnh Màn Hình)`,
        message: data.giftEvent.blessingMessage,
        ttsText: data.giftEvent.ttsText,
        isMiracle: data.giftEvent.isMajorBlessing
      });
      spawnFloatingWishCard({
        nickname: data.giftEvent.nickname,
        avatarUrl: data.giftEvent.avatarUrl,
        prayer: data.giftEvent.blessingMessage,
        categoryTitle: '👑 ĐẶC QUYỀN ÂN NHÂN VIP',
        oracleText: 'Lời cầu nguyện của bạn đã được ghim lên Ngôi Vị VIP Đỉnh Thánh Đường!',
        tier: data.giftEvent.tier
      });
    }
  });

  socket.on('sanctuary:miracle', (data) => {
    if (data.stats) updateStats(data.stats);
    if (data.miracleEvent) {
      showCenterAnnouncementModal({
        crown: `✨ ĐẠI PHÉP LÀNH TOÀN PHÒNG #${data.miracleEvent.miracleNumber} ✨`,
        avatarUrl: DEFAULT_AVATAR,
        username: data.miracleEvent.triggerBy,
        detail: 'Sứ Giả Mở Khóa 100% Thanh Phép Lành Cộng Đồng (+200 Phước Lành)',
        message: data.miracleEvent.message,
        ttsText: data.miracleEvent.ttsText,
        isMiracle: true
      });
    }
  });

  socket.on('sanctuary:scripture', (quote) => {
    if (!quote) return;
    scriptureBoxEl.classList.add('fade-change');
    setTimeout(() => {
      scriptureTextEl.textContent = quote.text;
      scriptureSourceEl.textContent = `— ${quote.source} —`;
      scriptureBoxEl.classList.remove('fade-change');
      spawnGoldenBurst(540, 420, 16);
    }, 450);
  });

  socket.on('sanctuary:settings', (newSettings) => {
    settings = { ...settings, ...newSettings };
    channelTitleEl.textContent = settings.channelTitle || 'THÁNH ĐƯỜNG NGUYỆN ƯỚC ONLINE';
    applyTheme(settings.theme);
    restartBackgroundMusic();
  });
})();
