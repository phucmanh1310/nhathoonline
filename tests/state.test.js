const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { SanctuaryState, sanitizePrayer, classifyPrayerAndOracle } = require('../server/state');

function createTempStateFile() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'sanctuary-test-'));
  return path.join(dir, 'state.json');
}

test('sanitizePrayer filters bad words and trims long prayers', () => {
  assert.equal(sanitizePrayer('  Cầu bình an cho gia đình  '), 'Cầu bình an cho gia đình');
  const filtered = sanitizePrayer('chơi tài xỉu không bạn');
  assert.equal(filtered, 'Xin cầu nguyện bình an, sức khỏe và phước lành cho gia đình.');
});

test('classifyPrayerAndOracle maps 1, 2, 3 shortcuts to custom candles and personal oracle cards', () => {
  const res1 = classifyPrayerAndOracle('1');
  assert.equal(res1.candleColor, 'normal');
  assert.ok(res1.oracleText.length > 10);

  const res2 = classifyPrayerAndOracle('2');
  assert.equal(res2.candleColor, 'rose');

  const res3 = classifyPrayerAndOracle('3');
  assert.equal(res3.candleColor, 'sapphire');
});

test('SanctuaryState records prayers, follows, likes, gifts, pins VIP throne and ranks leaderboard', () => {
  const stateFile = createTempStateFile();
  const state = new SanctuaryState(stateFile);

  const prayerRes = state.recordPrayer({
    userId: 'user_a',
    nickname: 'Anna Thảo',
    comment: '2'
  });
  assert.equal(prayerRes.userScore, 10);
  assert.equal(prayerRes.candle.tier, 'rose');
  assert.ok(prayerRes.prayerItem.oracleText);

  const followRes = state.recordFollow({
    userId: 'user_f',
    nickname: 'Tín Hữu Mới'
  });
  assert.equal(followRes.followEvent.points, 25);
  assert.equal(state.getStats().totalFollowers, 1);

  const likeRes = state.recordLike({
    userId: 'user_b',
    nickname: 'Giuse Nam',
    likeCount: 10
  });
  assert.equal(likeRes.pointsAdded, 20);
  assert.equal(state.getStats().totalBellRings, 1);

  const giftRes = state.recordGift({
    userId: 'user_a',
    nickname: 'Anna Thảo',
    giftName: 'Hoa Hồng',
    diamondCount: 1,
    repeatCount: 1
  });
  assert.equal(giftRes.pinnedVip.nickname, 'Anna Thảo');
  assert.ok(giftRes.pinnedVip.prayer.includes('cha mẹ'));
});

test('Miracle gauge reaches 100% and triggers full-room miracle event', () => {
  const stateFile = createTempStateFile();
  const state = new SanctuaryState(stateFile);

  const res = state.triggerFullMiracle('Tester');
  assert.ok(res.miracleEvent);
  assert.equal(res.miracleEvent.miracleNumber, 1);
  assert.equal(state.getStats().miracleCount, 1);
  assert.equal(state.getStats().miracleGauge, 0);
});
