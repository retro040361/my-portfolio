import { keyframe, clamp01 } from './textures';

// 各個螢幕的 Canvas 畫法（每幀呼叫），座標沿用原本 SVG 版本，方便對照

// ---------- 寫程式的螢幕 ----------
const CODE_LINES = [
  { w: 92, c: '#ff79c6', indent: 0 },
  { w: 140, c: '#8be9fd', indent: 12 },
  { w: 110, c: '#f4f4f6', indent: 24 },
  { w: 76, c: '#50fa7b', indent: 24 },
  { w: 124, c: '#bd93f9', indent: 12 },
  { w: 64, c: '#ffb86c', indent: 24 },
  { w: 150, c: '#8be9fd', indent: 24 },
  { w: 40, c: '#ff79c6', indent: 12 },
  { w: 98, c: '#f4f4f6', indent: 0 },
];

export const drawCodeScreen = (ctx, w, h, t) => {
  const s = w / 256;
  ctx.setTransform(s, 0, 0, s, 0, 0);
  ctx.fillStyle = '#0f0f17';
  ctx.fillRect(0, 0, 256, 141);
  ctx.fillStyle = '#14141f';
  ctx.fillRect(0, 0, 40, 141);
  ctx.fillStyle = '#3a3a52';
  for (let i = 0; i < 6; i++) ctx.fillRect(7, 9 + i * 12, 26, 4);
  // 每行 6 秒一輪、彼此錯開 0.55 秒，像一行一行打出來
  CODE_LINES.forEach((line, i) => {
    const local = t - i * 0.55;
    if (local < 0) return;
    const p = ((local % 6) / 6) * 100;
    const grow = p < 9 ? Math.floor((p / 9) * 12) / 12 : 1;
    const alpha = p > 92 ? 0.85 * (1 - (p - 92) / 8) : 0.85;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = line.c;
    ctx.fillRect(49 + line.indent, 9 + i * 13, line.w * grow, 5);
  });
  ctx.globalAlpha = 1;
  if (Math.floor(t * 2) % 2 === 0) {
    ctx.fillStyle = '#f4f4f6';
    ctx.fillRect(49, 129, 6, 7);
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
};

// ---------- 艾爾登法環打王（10 秒循環，關鍵影格對應原本的 CSS） ----------
const pseudoRandom = (seed) => {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};
const BURST_DOTS = Array.from({ length: 34 }, (_, i) => {
  const angle = pseudoRandom(i + 1) * Math.PI * 2;
  const dist = Math.sqrt(pseudoRandom(i + 50)) * 26;
  return [782 + Math.cos(angle) * dist, 336 + Math.sin(angle) * dist * 0.8, 0.5 + pseudoRandom(i + 99) * 0.9];
});
const DUST_DOTS = Array.from({ length: 22 }, (_, i) => [
  816 + pseudoRandom(i + 7) * 72,
  300 + pseudoRandom(i + 31) * 70,
  pseudoRandom(i + 63) * 0.8,
]);

const P = (d) => (typeof Path2D !== 'undefined' ? new Path2D(d) : null);
const PATHS = {
  trees: P('M711 332 L711 312 Q722 304 730 314 Q738 300 748 312 Q756 306 764 318 L770 332 Z'),
  trunk: P('M896 338 Q928 320 967 316 L967 325 Q932 330 900 344 Z'),
  bossBody: P('M812 372 Q806 340 818 316 Q826 298 846 294 Q872 292 882 312 Q894 336 890 372 L884 366 L879 373 L873 366 L867 373 L861 366 L855 373 L849 366 L843 373 L837 366 L831 373 L825 366 L819 373 Z'),
  bossShade: P('M866 300 Q884 312 890 372 L884 366 L879 373 L873 366 L867 373 Q870 330 860 304 Z'),
  bossMantle: P('M814 318 Q840 306 884 316 Q870 328 846 328 Q826 328 814 318 Z'),
  playerCape: P('M818 403 L822 362 Q836 354 850 362 L856 403 Z'),
  playerTabard: P('M822 370 L850 370 L853 403 L819 403 Z'),
  playerShoulders: P('M815 364 Q836 348 857 364 L855 373 L817 373 Z'),
  playerShield: P('M810 366 L822 366 L821 380 L816 388 L811 380 Z'),
  slash: P('M826 318 Q846 330 852 352'),
};

const K = {
  hammer: [[0, 0], [7, 40], [10, -45], [16, -45], [22, 0], [31, 40], [34, -45], [40, -45], [46, 0], [100, 0]],
  burstA: [[0, 0], [9.5, 0], [10, 1], [18, 0], [33.5, 0], [34, 1], [42, 0], [100, 0]],
  burstS: [[0, 0.3], [9.5, 0.3], [10, 0.8], [18, 1.5], [33.5, 0.3], [34, 0.8], [42, 1.5], [100, 1.5]],
  cam: [[0, 0, 0], [9.9, 0, 0], [10.5, -2, 1.5], [11.2, 2, -1], [11.8, -1, 1], [12.5, 0, 0], [33.9, 0, 0], [34.5, -2, 1.5], [35.2, 2, -1], [35.8, -1, 1], [36.5, 0, 0], [100, 0, 0]],
  bossA: [[0, 1], [63, 1], [72, 0], [95, 0], [100, 1]],
  bossY: [[0, 0], [23.5, 0], [24, -2], [26, 0], [49.5, 0], [50, -2], [52, 0], [59.5, 0], [60, -2], [63, 0], [72, -6], [95, 0], [100, 0]],
  bossGlow: [[0, 0], [23.5, 0], [24, 1], [26, 0], [49.5, 0], [50, 1], [52, 0], [59.5, 0], [60, 1], [63, 0.6], [72, 1], [95, 0], [100, 0]],
  dustA: [[0, 0], [62, 0], [65, 1], [80, 0], [100, 0]],
  dustY: [[0, 0], [62, 0], [80, -40], [100, -40]],
  player: [[0, 0, 0, 1], [7, 0, 0, 1], [11, 34, 3, 0.94], [18, 0, 0, 1], [23, 0, -4, 0.92], [24, -2, -7, 0.9], [28, 0, 0, 1], [31, 0, 0, 1], [35, -34, 3, 0.94], [42, 0, 0, 1], [49, 0, -4, 0.92], [50, 2, -7, 0.9], [54, 0, -2, 0.96], [59, 0, -4, 0.92], [60, -1, -7, 0.9], [66, 0, 0, 1], [100, 0, 0, 1]],
  sword: [[0, 0], [22, 0], [24, -150], [27, 0], [48, 0], [50, -150], [53, 0], [58, 0], [60, -150], [63, 0], [100, 0]],
  slash: [[0, 0], [23.5, 0], [24, 1], [26.5, 0], [49.5, 0], [50, 1], [52.5, 0], [59.5, 0], [60, 1], [62.5, 0], [100, 0]],
  bossHp: [[0, 1], [24, 1], [25.5, 0.66], [50, 0.66], [51.5, 0.33], [60, 0.33], [61.5, 0], [96, 0], [98, 1], [100, 1]],
  dmg1: [[0, 0], [24.5, 0], [25, 1], [46, 1], [48, 0], [100, 0]],
  dmg2: [[0, 0], [50.5, 0], [51, 1], [58, 1], [59, 0], [100, 0]],
  dmg3: [[0, 0], [60.5, 0], [61, 1], [64, 1], [66, 0], [100, 0]],
  bossUi: [[0, 1], [64, 1], [68, 0], [96, 0], [98, 1], [100, 1]],
  felled: [[0, 0], [67, 0], [71, 1], [88, 1], [93, 0], [100, 0]],
  runesWon: [[0, 0], [71, 0], [72, 1], [96, 1], [97, 0], [100, 0]],
  stamina: [[0, 1], [8, 1], [12, 0.6], [20, 1], [25, 0.7], [33, 1], [36, 0.6], [44, 1], [51, 0.7], [61, 0.45], [75, 1], [100, 1]],
};

const rotateAround = (ctx, cx, cy, deg) => {
  ctx.translate(cx, cy);
  ctx.rotate((deg * Math.PI) / 180);
  ctx.translate(-cx, -cy);
};

export const drawEldenScreen = (ctx, w, h, t) => {
  const pct = ((t % 10) / 10) * 100;
  const v = (key) => keyframe(K[key], pct);
  const s = w / 256;
  ctx.setTransform(s, 0, 0, s, -711 * s, -265 * s);
  ctx.save();

  // 場景（砸地時晃動）
  const [cx, cy] = v('cam');
  ctx.translate(cx, cy);
  let g = ctx.createLinearGradient(0, 265, 0, 335);
  g.addColorStop(0, '#56675d');
  g.addColorStop(0.6, '#3b4740');
  g.addColorStop(1, '#2c342f');
  ctx.fillStyle = g;
  ctx.fillRect(705, 260, 268, 76);
  ctx.fillStyle = 'rgba(123,138,128,0.25)';
  ctx.beginPath(); ctx.ellipse(760, 282, 40, 9, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(123,138,128,0.2)';
  ctx.beginPath(); ctx.ellipse(900, 276, 52, 10, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#1f2621';
  ctx.fill(PATHS.trees);
  ctx.strokeStyle = '#151a16';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(718, 334); ctx.lineTo(721, 286); ctx.moveTo(720, 300); ctx.lineTo(712, 290); ctx.moveTo(721, 294); ctx.lineTo(730, 284); ctx.stroke();
  g = ctx.createLinearGradient(0, 330, 0, 403);
  g.addColorStop(0, '#3d443b');
  g.addColorStop(1, '#262a24');
  ctx.fillStyle = g;
  ctx.fillRect(705, 330, 268, 78);
  ctx.strokeStyle = 'rgba(30,34,28,0.8)';
  ctx.lineWidth = 0.7;
  [334, 340, 348, 360, 378].forEach(y => { ctx.beginPath(); ctx.moveTo(705, y); ctx.lineTo(973, y); ctx.stroke(); });
  for (let k = -5; k <= 5; k++) { ctx.beginPath(); ctx.moveTo(839 + k * 8, 330); ctx.lineTo(839 + k * 60, 403); ctx.stroke(); }
  ctx.fillStyle = '#3a2f25';
  ctx.fill(PATHS.trunk);
  ctx.strokeStyle = '#4d3f2f';
  ctx.lineWidth = 2.4;
  ctx.lineCap = 'round';
  [[918, 336, 910, 302], [934, 334, 943, 300], [948, 332, 940, 306], [958, 330, 963, 308]].forEach(([a, b, c, d]) => { ctx.beginPath(); ctx.moveTo(a, b); ctx.lineTo(c, d); ctx.stroke(); });

  // 瑪爾基特
  const [bossA] = v('bossA');
  const [bossY] = v('bossY');
  const [glow] = v('bossGlow');
  ctx.save();
  ctx.globalAlpha = bossA;
  ctx.translate(0, bossY);
  if (glow > 0.05) {
    ctx.shadowColor = `rgba(255, 216, 107, ${glow})`;
    ctx.shadowBlur = 8 * glow;
  }
  ctx.fillStyle = '#5d4d35'; ctx.fill(PATHS.bossBody);
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#43372a'; ctx.fill(PATHS.bossShade);
  ctx.fillStyle = '#7a6646'; ctx.fill(PATHS.bossMantle);
  ctx.fillStyle = '#6e5c40'; ctx.beginPath(); ctx.ellipse(838, 302, 13, 10, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#1f1a13'; ctx.beginPath(); ctx.ellipse(836, 308, 7, 4, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ffd86b'; ctx.beginPath(); ctx.arc(833, 307.5, 0.9, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#4d3f2b'; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(884, 322); ctx.quadraticCurveTo(894, 332, 898, 344); ctx.stroke();
  ctx.strokeStyle = '#2e261c'; ctx.lineWidth = 2.2;
  ctx.beginPath(); ctx.moveTo(897, 342); ctx.lineTo(904, 374); ctx.stroke();
  // 聖錘
  ctx.save();
  rotateAround(ctx, 818, 320, v('hammer')[0]);
  ctx.strokeStyle = '#4d3f2b'; ctx.lineWidth = 6;
  ctx.beginPath(); ctx.moveTo(818, 320); ctx.quadraticCurveTo(804, 324, 794, 334); ctx.stroke();
  ctx.strokeStyle = '#d9a93a'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(795, 335); ctx.lineTo(779, 318); ctx.stroke();
  ctx.save();
  rotateAround(ctx, 775, 314, -42);
  ctx.shadowColor = '#ffd86b'; ctx.shadowBlur = 10;
  ctx.fillStyle = '#f5c542';
  ctx.fillRect(768, 309, 15, 9);
  ctx.restore();
  ctx.restore();
  ctx.restore();

  // 砸地的金光
  const [burstA] = v('burstA');
  if (burstA > 0.01) {
    const [bs] = v('burstS');
    ctx.save();
    ctx.globalAlpha = burstA;
    ctx.translate(782, 336); ctx.scale(bs, bs); ctx.translate(-782, -336);
    const rg = ctx.createRadialGradient(782, 336, 0, 782, 336, 26);
    rg.addColorStop(0, 'rgba(255,242,176,0.9)');
    rg.addColorStop(0.45, 'rgba(242,193,78,0.45)');
    rg.addColorStop(1, 'rgba(242,193,78,0)');
    ctx.fillStyle = rg;
    ctx.beginPath(); ctx.arc(782, 336, 26, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffe08a';
    BURST_DOTS.forEach(([x, y, r]) => { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); });
    ctx.restore();
  }

  // 王倒下化成光點
  ctx.fillStyle = '#ffe08a';
  DUST_DOTS.forEach(([x, y, d]) => {
    const p = (((t - d) % 10 + 10) % 10) * 10;
    const [a] = keyframe(K.dustA, p);
    if (a < 0.01) return;
    const [dy] = keyframe(K.dustY, p);
    ctx.globalAlpha = a;
    ctx.beginPath(); ctx.arc(x + (dy / -40) * 3, y + dy, 0.9, 0, Math.PI * 2); ctx.fill();
  });
  ctx.globalAlpha = 1;

  // 褪色者
  const [px, py, ps] = v('player');
  ctx.save();
  ctx.translate(833.5 + px, 403 + py); ctx.scale(ps, ps); ctx.translate(-833.5, -403);
  ctx.fillStyle = '#1c2233'; ctx.fill(PATHS.playerCape);
  ctx.fillStyle = '#2c3d63'; ctx.fill(PATHS.playerTabard);
  ctx.strokeStyle = '#b8963e'; ctx.lineWidth = 0.8;
  ctx.beginPath(); ctx.moveTo(826, 372); ctx.lineTo(846, 372); ctx.moveTo(836, 372); ctx.lineTo(836, 403); ctx.stroke();
  ctx.fillStyle = '#7d838c'; ctx.fill(PATHS.playerShoulders);
  ctx.fillStyle = '#5b616b'; ctx.fill(PATHS.playerShield);
  ctx.fillStyle = '#9aa1ab'; ctx.beginPath(); ctx.ellipse(836, 350, 6.5, 7, 0, 0, Math.PI * 2); ctx.fill();
  ctx.save();
  rotateAround(ctx, 857, 371, v('sword')[0]);
  ctx.strokeStyle = '#d8dbe0'; ctx.lineWidth = 1.7;
  ctx.beginPath(); ctx.moveTo(857, 371); ctx.lineTo(872, 396); ctx.stroke();
  ctx.restore();
  ctx.restore();

  const [slashA] = v('slash');
  if (slashA > 0.01) {
    ctx.globalAlpha = slashA;
    ctx.strokeStyle = '#fff4d6'; ctx.lineWidth = 2.4;
    ctx.shadowColor = '#fff4d6'; ctx.shadowBlur = 6;
    ctx.stroke(PATHS.slash);
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  }
  ctx.restore();

  // HUD
  ctx.fillStyle = '#141414'; ctx.fillRect(715, 269, 11, 11);
  ctx.fillStyle = '#2a0e0e'; ctx.fillRect(729, 270, 72, 2.4);
  ctx.fillStyle = '#b3261e'; ctx.fillRect(729, 270, 68, 2.4);
  ctx.fillStyle = '#18233a'; ctx.fillRect(729, 274, 62, 2);
  ctx.fillStyle = '#6f8fb8'; ctx.fillRect(729, 274, 58, 2);
  ctx.fillStyle = '#132413'; ctx.fillRect(729, 277.5, 46, 2);
  ctx.fillStyle = '#3f9b3f'; ctx.fillRect(729, 277.5, 46 * v('stamina')[0], 2);
  ctx.fillStyle = '#141414';
  ctx.fillRect(716, 372, 9, 13); ctx.fillRect(738, 372, 9, 13); ctx.fillRect(727, 382, 9, 10);
  ctx.fillStyle = '#c0392b'; ctx.beginPath(); ctx.arc(731.5, 387.5, 2.6, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#e8dcc0';
  ctx.font = '3.4px sans-serif';
  ctx.fillText('紅露滴聖杯瓶', 716, 399);
  ctx.fillStyle = 'rgba(20,20,20,0.8)'; ctx.fillRect(934, 393, 30, 6);
  ctx.fillStyle = '#e8dcc0'; ctx.font = '3.8px sans-serif'; ctx.textAlign = 'right';
  ctx.fillText(v('runesWon')[0] > 0.5 ? '12,000' : '0', 961, 397.8);

  const [ui] = v('bossUi');
  if (ui > 0.01) {
    ctx.globalAlpha = ui;
    ctx.textAlign = 'left'; ctx.font = '4.2px sans-serif';
    ctx.fillText('「惡兆」瑪爾基特', 772, 385);
    ctx.fillStyle = '#2a0e0e'; ctx.fillRect(772, 387, 134, 2.4);
    ctx.fillStyle = '#a8211a'; ctx.fillRect(772, 387, 134 * v('bossHp')[0], 2.4);
    ctx.fillStyle = '#e8dcc0'; ctx.textAlign = 'right'; ctx.font = '3.8px sans-serif';
    [['dmg1', '418'], ['dmg2', '436'], ['dmg3', '521']].forEach(([k, txt]) => {
      const [a] = v(k);
      if (a > 0.01) { ctx.globalAlpha = a * ui; ctx.fillText(txt, 906, 385); }
    });
    ctx.globalAlpha = 1;
  }

  const [felled] = v('felled');
  if (felled > 0.01) {
    ctx.globalAlpha = felled;
    const band = ctx.createLinearGradient(711, 0, 967, 0);
    band.addColorStop(0, 'rgba(0,0,0,0)');
    band.addColorStop(0.2, 'rgba(0,0,0,0.72)');
    band.addColorStop(0.8, 'rgba(0,0,0,0.72)');
    band.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = band; ctx.fillRect(711, 321, 256, 24);
    ctx.fillStyle = '#e6c87a'; ctx.textAlign = 'center';
    ctx.font = '12.5px Georgia, "Times New Roman", serif';
    ctx.shadowColor = '#e6c87a'; ctx.shadowBlur = 5;
    ctx.fillText('ENEMY FELLED', 839, 337.5);
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  }
  ctx.textAlign = 'left';
  ctx.setTransform(1, 0, 0, 1, 0, 0);
};

// ---------- 窗外：天色、日月、星星（依主題與切換時間計算） ----------
const mixColor = (a, b, t) => {
  const pa = a.match(/\w\w/g).map(x => parseInt(x, 16));
  const pb = b.match(/\w\w/g).map(x => parseInt(x, 16));
  return `rgb(${pa.map((v, i) => Math.round(v + (pb[i] - v) * t)).join(',')})`;
};

const SKY = {
  night: ['0b1026', '1c1740'],
  day: ['6fb6f2', 'c9e6fb'],
  dusk: ['2b2d6b', 'c4537a', 'f59e5b'],
  dawn: ['7283c7', 'f2b8c6', 'ffd9a8'],
};

// sky: { mix: 0(夜)~1(日), sinceChange: 距離上次切換的秒數, toLight: 是否切到亮色 }
export const drawWindowSky = (ctx, w, h, sky) => {
  const { mix, sinceChange, toLight } = sky;
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, mixColor(SKY.night[0], SKY.day[0], mix));
  g.addColorStop(1, mixColor(SKY.night[1], SKY.day[1], mix));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  // 黃昏 / 清晨過場：1.9 秒內淡入、停留、淡出
  if (sinceChange < 1.9) {
    const [a] = keyframe([[0, 0], [30, 1], [62, 1], [100, 0]], (sinceChange / 1.9) * 100);
    const stops = toLight ? SKY.dawn : SKY.dusk;
    const tg = ctx.createLinearGradient(0, 0, 0, h);
    tg.addColorStop(0, `#${stops[0]}`);
    tg.addColorStop(0.55, `#${stops[1]}`);
    tg.addColorStop(1, `#${stops[2]}`);
    ctx.globalAlpha = a;
    ctx.fillStyle = tg;
    ctx.fillRect(0, 0, w, h);
    ctx.globalAlpha = 1;
  }

  // 星星：變暗時等黃昏過了才出現
  const stars = toLight ? clamp01(1 - sinceChange / 0.6) : clamp01((sinceChange - 1) / 0.6);
  if (stars > 0.01) {
    ctx.fillStyle = `rgba(244,244,246,${stars})`;
    [[0.13, 0.13], [0.39, 0.1], [0.66, 0.24], [0.89, 0.12], [0.59, 0.42], [0.23, 0.5], [0.85, 0.57]].forEach(([x, y]) => {
      ctx.beginPath(); ctx.arc(x * w, y * h, w * 0.009, 0, Math.PI * 2); ctx.fill();
    });
  }

  // 日月：舊的先落下，0.5 秒後新的升起
  const ease = (x) => x * x * (3 - 2 * x);
  const setP = ease(clamp01(sinceChange / 0.7));
  const riseP = ease(clamp01((sinceChange - 0.5) / 0.8));
  const sunDrop = toLight ? 1 - riseP : setP;
  const moonDrop = toLight ? setP : 1 - riseP;
  const drop = h * 0.85;
  ctx.fillStyle = 'rgba(255,246,201,0.35)';
  ctx.beginPath(); ctx.arc(w * 0.26, h * 0.24 + sunDrop * drop, w * 0.13, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#fff6c9';
  ctx.beginPath(); ctx.arc(w * 0.26, h * 0.24 + sunDrop * drop, w * 0.09, 0, Math.PI * 2); ctx.fill();
  const my = h * 0.32 + moonDrop * drop;
  ctx.save();
  ctx.beginPath(); ctx.arc(w * 0.71, my, w * 0.085, 0, Math.PI * 2); ctx.clip();
  ctx.fillStyle = '#f3efd8';
  ctx.fillRect(0, 0, w, h);
  ctx.globalCompositeOperation = 'destination-out';
  ctx.beginPath(); ctx.arc(w * 0.75, my - h * 0.035, w * 0.075, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  ctx.globalCompositeOperation = 'source-over';

  // 白天的雲
  if (mix > 0.01) {
    ctx.fillStyle = `rgba(255,255,255,${0.9 * mix})`;
    ctx.beginPath(); ctx.ellipse(w * 0.66, h * 0.5, w * 0.17, h * 0.055, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(w * 0.54, h * 0.47, w * 0.09, h * 0.055, 0, 0, Math.PI * 2); ctx.fill();
  }

  // 遠方城市剪影
  ctx.fillStyle = mixColor('1a1c26', '8fa3b5', mix);
  ctx.beginPath();
  ctx.moveTo(0, h * 0.75);
  [[0.19, 0.65], [0.37, 0.72], [0.6, 0.61], [0.84, 0.71], [1, 0.64]].forEach(([x, y]) => ctx.lineTo(x * w, y * h));
  ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath(); ctx.fill();
};

// ---------- 靜態小螢幕 ----------
export const drawAllyScreen = (ctx, w, h) => {
  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, '#0e7a0d'); g.addColorStop(1, '#0b2e13');
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = 'rgba(34,197,94,0.75)'; ctx.fillRect(w * 0.08, h * 0.15, w * 0.3, h * 0.32);
  ctx.fillStyle = 'rgba(244,244,246,0.5)'; ctx.fillRect(w * 0.42, h * 0.15, w * 0.2, h * 0.32);
  ctx.fillStyle = 'rgba(244,244,246,0.35)'; ctx.fillRect(w * 0.66, h * 0.15, w * 0.26, h * 0.32);
  ctx.fillStyle = 'rgba(244,244,246,0.4)'; ctx.fillRect(w * 0.08, h * 0.6, w * 0.84, h * 0.1);
};

// Switch 主選單（顯示在電視上；參考 Switch 的 HOME 畫面版面，遊戲封面是簡化的示意圖，不是官方圖）
// 以 512 × 288 為基準座標，右上角時間顯示目前實際時間
const roundRect = (ctx, x, y, w, h, r) => {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
};

// 遊戲封面示意圖
const TILES = [
  // 王國之淚：天空、浮空島、瀑布
  (ctx, x, y, s) => {
    const g = ctx.createLinearGradient(0, y, 0, y + s);
    g.addColorStop(0, '#6fb4ea'); g.addColorStop(0.65, '#f3d9a8'); g.addColorStop(1, '#8fbf7a');
    ctx.fillStyle = g; ctx.fillRect(x, y, s, s);
    ctx.fillStyle = '#5f8f4f';
    ctx.beginPath(); ctx.ellipse(x + s * 0.55, y + s * 0.34, s * 0.3, s * 0.07, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#7a6248';
    ctx.beginPath(); ctx.moveTo(x + s * 0.27, y + s * 0.35); ctx.lineTo(x + s * 0.83, y + s * 0.35); ctx.lineTo(x + s * 0.6, y + s * 0.52); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.75)'; ctx.fillRect(x + s * 0.68, y + s * 0.42, s * 0.025, s * 0.4);
    ctx.fillStyle = '#2f3f2a';
    ctx.beginPath(); ctx.moveTo(x, y + s); ctx.lineTo(x, y + s * 0.82); ctx.lineTo(x + s * 0.35, y + s * 0.74); ctx.lineTo(x + s * 0.5, y + s); ctx.fill();
    ctx.fillStyle = '#1d2433'; ctx.fillRect(x + s * 0.23, y + s * 0.62, s * 0.035, s * 0.12);
    ctx.fillStyle = 'rgba(255,255,255,0.92)'; ctx.font = `700 ${s * 0.13}px Georgia, serif`; ctx.textAlign = 'center';
    ctx.fillText('ZELDA', x + s * 0.5, y + s * 0.2);
  },
  // 曠野之息：夕陽、遠山、站在懸崖上的人
  (ctx, x, y, s) => {
    const g = ctx.createLinearGradient(0, y, 0, y + s);
    g.addColorStop(0, '#2f5d8a'); g.addColorStop(0.55, '#f2b46b'); g.addColorStop(1, '#5b4a3a');
    ctx.fillStyle = g; ctx.fillRect(x, y, s, s);
    ctx.fillStyle = '#3d4f63';
    ctx.beginPath(); ctx.moveTo(x, y + s * 0.62); ctx.lineTo(x + s * 0.3, y + s * 0.45); ctx.lineTo(x + s * 0.55, y + s * 0.58); ctx.lineTo(x + s * 0.8, y + s * 0.4); ctx.lineTo(x + s, y + s * 0.55); ctx.lineTo(x + s, y + s); ctx.lineTo(x, y + s); ctx.fill();
    ctx.fillStyle = '#2a2420';
    ctx.beginPath(); ctx.moveTo(x + s * 0.2, y + s); ctx.lineTo(x + s * 0.3, y + s * 0.72); ctx.lineTo(x + s * 0.62, y + s * 0.74); ctx.lineTo(x + s * 0.7, y + s); ctx.fill();
    ctx.fillStyle = '#1d2433'; ctx.fillRect(x + s * 0.44, y + s * 0.6, s * 0.035, s * 0.13);
    ctx.fillStyle = 'rgba(255,255,255,0.92)'; ctx.font = `700 ${s * 0.13}px Georgia, serif`; ctx.textAlign = 'center';
    ctx.fillText('ZELDA', x + s * 0.5, y + s * 0.22);
  },
  // 賽車：彩色跑道
  (ctx, x, y, s) => {
    ctx.fillStyle = '#e53935'; ctx.fillRect(x, y, s, s);
    ctx.fillStyle = '#1e88e5';
    ctx.beginPath(); ctx.moveTo(x, y + s); ctx.lineTo(x + s * 0.35, y + s * 0.4); ctx.lineTo(x + s * 0.65, y + s * 0.4); ctx.lineTo(x + s, y + s); ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = s * 0.02; ctx.setLineDash([s * 0.06, s * 0.05]);
    ctx.beginPath(); ctx.moveTo(x + s * 0.5, y + s * 0.42); ctx.lineTo(x + s * 0.5, y + s); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = '#fdd835';
    ctx.beginPath(); ctx.arc(x + s * 0.5, y + s * 0.78, s * 0.09, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = `900 italic ${s * 0.15}px Arial, sans-serif`; ctx.textAlign = 'center';
    ctx.fillText('KART', x + s * 0.5, y + s * 0.25);
  },
  // 射擊塗鴉：螢光墨水
  (ctx, x, y, s) => {
    ctx.fillStyle = '#2b1a3d'; ctx.fillRect(x, y, s, s);
    [['#c6f432', 0.3, 0.35, 0.28], ['#ff3ea5', 0.68, 0.6, 0.3], ['#c6f432', 0.75, 0.2, 0.14], ['#ff3ea5', 0.22, 0.78, 0.16]].forEach(([c, px, py, r]) => {
      ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x + s * px, y + s * py, s * r, 0, Math.PI * 2); ctx.fill();
    });
    ctx.fillStyle = '#fff'; ctx.font = `900 ${s * 0.14}px Arial, sans-serif`; ctx.textAlign = 'center';
    ctx.fillText('INK!', x + s * 0.5, y + s * 0.55);
  },
  // 只露出一半的下一個封面
  (ctx, x, y, s) => {
    ctx.fillStyle = '#e8efe4'; ctx.fillRect(x, y, s, s);
    ctx.fillStyle = '#9bb59a'; ctx.fillRect(x, y + s * 0.7, s, s * 0.3);
  },
];

const ICONS = [
  ['#e8453c', (ctx, x, y, r) => { ctx.strokeRect(x - r * 0.45, y - r * 0.3, r * 0.9, r * 0.55); ctx.beginPath(); ctx.moveTo(x - r * 0.25, y - r * 0.05); ctx.lineTo(x + r * 0.25, y - r * 0.05); ctx.stroke(); }],
  ['#f5a623', (ctx, x, y, r) => { ctx.strokeRect(x - r * 0.38, y - r * 0.2, r * 0.76, r * 0.6); ctx.beginPath(); ctx.arc(x, y - r * 0.2, r * 0.2, Math.PI, 0); ctx.stroke(); }],
  ['#2f7de1', (ctx, x, y, r) => { ctx.strokeRect(x - r * 0.45, y - r * 0.35, r * 0.9, r * 0.7); ctx.beginPath(); ctx.moveTo(x - r * 0.45, y + r * 0.2); ctx.lineTo(x - r * 0.1, y - r * 0.1); ctx.lineTo(x + r * 0.45, y + r * 0.25); ctx.stroke(); }],
  ['#6b6b6b', (ctx, x, y, r) => { ctx.save(); ctx.translate(x, y); ctx.rotate(-0.6); ctx.strokeRect(-r * 0.15, -r * 0.45, r * 0.3, r * 0.9); ctx.restore(); }],
  ['#6b6b6b', (ctx, x, y, r) => { ctx.beginPath(); ctx.arc(x, y, r * 0.22, 0, Math.PI * 2); ctx.stroke(); for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2; ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * r * 0.32, y + Math.sin(a) * r * 0.32); ctx.lineTo(x + Math.cos(a) * r * 0.45, y + Math.sin(a) * r * 0.45); ctx.stroke(); } }],
  ['#6b6b6b', (ctx, x, y, r) => { ctx.beginPath(); ctx.arc(x, y + r * 0.05, r * 0.38, -Math.PI * 0.3, Math.PI * 1.3); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x, y - r * 0.45); ctx.lineTo(x, y - r * 0.05); ctx.stroke(); }],
];

export const drawSwitchScreen = (ctx, w, h) => {
  const k = w / 512;
  ctx.setTransform(k, 0, 0, k, 0, 0);
  ctx.fillStyle = '#ebebeb';
  ctx.fillRect(0, 0, 512, 288);

  // 左上：使用者頭像
  [['#7cc4a3', 34], ['#8aa9d6', 70]].forEach(([c, x]) => {
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(x, 26, 15, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x, 26, 12.5, 0, Math.PI * 2); ctx.fill();
  });

  // 右上：時間、Wi-Fi、電池
  const now = new Date();
  const hr = now.getHours();
  const time = `${((hr + 11) % 12) + 1}:${String(now.getMinutes()).padStart(2, '0')}`;
  ctx.fillStyle = '#2d2d2d';
  ctx.font = '600 14px Arial, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(time, 432, 31);
  ctx.font = '600 8px Arial, sans-serif';
  ctx.fillText(hr < 12 ? 'AM' : 'PM', 446, 31);
  ctx.strokeStyle = '#2d2d2d'; ctx.lineWidth = 1.6;
  [4, 7, 10].forEach(r => { ctx.beginPath(); ctx.arc(462, 32, r, -Math.PI * 0.75, -Math.PI * 0.25); ctx.stroke(); });
  ctx.strokeRect(476, 21, 18, 10);
  ctx.fillStyle = '#3cc45a'; ctx.fillRect(478, 23, 14, 6);
  ctx.fillStyle = '#2d2d2d'; ctx.fillRect(494, 24, 2, 4);

  // 遊戲列：選中的那一格有青色外框，上方顯示遊戲名稱
  const size = 102;
  const y = 78;
  const xs = [42, 148, 254, 360, 466];
  xs.forEach((x, i) => {
    ctx.save();
    ctx.beginPath(); ctx.rect(x, y, Math.min(size, 512 - x), size); ctx.clip();
    TILES[i](ctx, x, y, size);
    ctx.restore();
  });
  ctx.strokeStyle = '#1fb6c9'; ctx.lineWidth = 3;
  ctx.strokeRect(xs[0] - 2.5, y - 2.5, size + 5, size + 5);
  ctx.fillStyle = '#1fb6c9';
  ctx.fillRect(xs[0], 58, 7, 9);
  ctx.textAlign = 'left';
  ctx.font = '500 11px Arial, sans-serif';
  ctx.fillText('The Legend of Zelda: Tears of the Kingdom', xs[0] + 12, 66);

  // 下方圓形按鈕
  ICONS.forEach(([color, draw], i) => {
    const cx = 134 + i * 44;
    const cy = 218;
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0,0,0,0.08)'; ctx.shadowBlur = 3;
    ctx.beginPath(); ctx.arc(cx, cy, 17, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = color; ctx.lineWidth = 2;
    draw(ctx, cx, cy, 17);
  });

  // 最下方：分隔線、手把圖示、操作提示
  ctx.fillStyle = '#c9c9c9'; ctx.fillRect(12, 258, 488, 1);
  ctx.fillStyle = '#2d2d2d';
  roundRect(ctx, 26, 266, 22, 12, 5); ctx.fill();
  ctx.fillStyle = '#7ec850'; [0, 1, 2, 3].forEach(i => { ctx.fillStyle = i === 0 ? '#7ec850' : '#bdbdbd'; ctx.fillRect(28 + i * 4, 262, 2.5, 2); });
  ctx.fillStyle = '#2d2d2d';
  ctx.textAlign = 'right';
  ctx.font = '500 10px Arial, sans-serif';
  ctx.fillText('−/+ Options', 430, 276);
  ctx.beginPath(); ctx.arc(444, 272, 6, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ffffff'; ctx.font = '700 7px Arial, sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('A', 444, 274.5);
  ctx.fillStyle = '#2d2d2d'; ctx.textAlign = 'left'; ctx.font = '500 10px Arial, sans-serif';
  ctx.fillText('Start', 454, 276);

  ctx.textAlign = 'left';
  ctx.setTransform(1, 0, 0, 1, 0, 0);
};

export const drawMacScreen = (ctx, w, h) => {
  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, '#1e3a8a'); g.addColorStop(0.45, '#7c3aed'); g.addColorStop(0.75, '#f472b6'); g.addColorStop(1, '#fb923c');
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = 'rgba(30,27,75,0.45)';
  ctx.beginPath(); ctx.moveTo(0, h * 0.68); ctx.quadraticCurveTo(w * 0.26, h * 0.45, w * 0.5, h * 0.68); ctx.quadraticCurveTo(w * 0.75, h * 0.9, w, h * 0.6); ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(0, 0, w, h * 0.06);
};

// ---------- iPad 主畫面（參考 iPadOS 主畫面版面；圖示是簡化示意，時鐘與日期顯示目前時間） ----------
// 以 2000 × 1390 為基準座標
const ipadRound = (ctx, x, y, w, h, r) => {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
};

const cloud = (ctx, x, y, s, color = '#ffffff') => {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x - s * 0.35, y + s * 0.1, s * 0.35, 0, Math.PI * 2);
  ctx.arc(x + s * 0.05, y - s * 0.12, s * 0.45, 0, Math.PI * 2);
  ctx.arc(x + s * 0.45, y + s * 0.12, s * 0.32, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(x - s * 0.35, y + s * 0.1, s * 0.8, s * 0.32);
};

// 主畫面圖示：背景色＋簡單符號，下面是名稱，右上角可加通知數字
const IPAD_APPS = [
  { x: 1360, y: 130, label: 'FaceTime', bg: ['#5bf675', '#0dbf3a'], glyph: (c, x, y) => { c.fillStyle = '#fff'; ipadRound(c, x + 22, y + 38, 52, 40, 8); c.fill(); c.beginPath(); c.moveTo(x + 74, y + 58); c.lineTo(x + 94, y + 42); c.lineTo(x + 94, y + 74); c.fill(); } },
  { x: 1638, y: 130, label: '檔案', bg: ['#ffffff', '#f2f4f7'], glyph: (c, x, y) => { c.fillStyle = '#1e90ff'; ipadRound(c, x + 18, y + 34, 78, 52, 8); c.fill(); c.fillStyle = '#3aa8ff'; ipadRound(c, x + 18, y + 26, 34, 16, 5); c.fill(); } },
  { x: 1360, y: 404, label: '提醒事項', bg: ['#ffffff', '#f2f4f7'], glyph: (c, x, y) => { [['#2f80ff', 30], ['#ff3b30', 57], ['#ff9500', 84]].forEach(([col, yy]) => { c.fillStyle = col; c.beginPath(); c.arc(x + 24, y + yy, 8, 0, Math.PI * 2); c.fill(); c.fillStyle = '#d7d9de'; c.fillRect(x + 42, y + yy - 1.5, 54, 3); }); } },
  { x: 1638, y: 404, label: '地圖', bg: ['#7ad86f', '#4cbe5b'], glyph: (c, x, y) => { c.fillStyle = '#f6d365'; c.fillRect(x, y + 70, 114, 18); c.fillStyle = '#ff7ab6'; c.fillRect(x, y + 20, 20, 94); c.fillStyle = '#2f80ff'; c.beginPath(); c.arc(x + 57, y + 57, 22, 0, Math.PI * 2); c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.moveTo(x + 57, y + 42); c.lineTo(x + 68, y + 68); c.lineTo(x + 57, y + 62); c.lineTo(x + 46, y + 68); c.fill(); } },
  { x: 248, y: 676, label: '家庭', bg: ['#ffffff', '#f2f4f7'], glyph: (c, x, y) => { c.fillStyle = '#ff9f0a'; c.beginPath(); c.moveTo(x + 57, y + 18); c.lineTo(x + 98, y + 54); c.lineTo(x + 88, y + 54); c.lineTo(x + 88, y + 94); c.lineTo(x + 26, y + 94); c.lineTo(x + 26, y + 54); c.lineTo(x + 16, y + 54); c.fill(); c.fillStyle = '#ffd60a'; ipadRound(c, x + 47, y + 62, 20, 22, 4); c.fill(); } },
  { x: 526, y: 676, label: '相機', bg: ['#d9dbe0', '#9fa3ab'], glyph: (c, x, y) => { c.fillStyle = '#1c1c22'; c.beginPath(); c.arc(x + 57, y + 57, 40, 0, Math.PI * 2); c.fill(); c.fillStyle = '#2d4f8c'; c.beginPath(); c.arc(x + 57, y + 57, 24, 0, Math.PI * 2); c.fill(); c.fillStyle = 'rgba(255,255,255,0.7)'; c.beginPath(); c.arc(x + 49, y + 49, 6, 0, Math.PI * 2); c.fill(); } },
  { x: 804, y: 676, label: 'App Store', bg: ['#2fb4ff', '#0a6cff'], glyph: (c, x, y) => { c.strokeStyle = '#fff'; c.lineWidth = 9; c.lineCap = 'round'; c.beginPath(); c.moveTo(x + 36, y + 86); c.lineTo(x + 62, y + 34); c.moveTo(x + 78, y + 86); c.lineTo(x + 52, y + 34); c.moveTo(x + 26, y + 70); c.lineTo(x + 88, y + 70); c.stroke(); } },
  { x: 1082, y: 676, label: '書籍', bg: ['#ffa53a', '#ff7a00'], glyph: (c, x, y) => { c.fillStyle = '#fff'; c.beginPath(); c.moveTo(x + 22, y + 32); c.quadraticCurveTo(x + 42, y + 26, x + 56, y + 36); c.lineTo(x + 56, y + 88); c.quadraticCurveTo(x + 42, y + 80, x + 22, y + 84); c.fill(); c.beginPath(); c.moveTo(x + 92, y + 32); c.quadraticCurveTo(x + 72, y + 26, x + 58, y + 36); c.lineTo(x + 58, y + 88); c.quadraticCurveTo(x + 72, y + 80, x + 92, y + 84); c.fill(); } },
  { x: 1360, y: 676, label: 'Podcast', bg: ['#c86bf7', '#8a2be2'], glyph: (c, x, y) => { c.strokeStyle = '#fff'; c.lineWidth = 6; c.beginPath(); c.arc(x + 57, y + 52, 30, Math.PI * 0.8, Math.PI * 2.2); c.stroke(); c.fillStyle = '#fff'; c.beginPath(); c.arc(x + 57, y + 50, 11, 0, Math.PI * 2); c.fill(); ipadRound(c, x + 50, y + 64, 14, 30, 7); c.fill(); } },
  { x: 1638, y: 676, label: 'TV', bg: ['#1c1c1e', '#000000'], glyph: (c, x, y) => { c.fillStyle = '#fff'; c.font = '700 40px Arial, sans-serif'; c.textAlign = 'center'; c.fillText('tv', x + 64, y + 72); } },
  { x: 248, y: 950, label: '設定', badge: 3, bg: ['#9da2aa', '#6d727a'], glyph: (c, x, y) => { c.strokeStyle = '#e8eaee'; c.lineWidth = 7; c.beginPath(); c.arc(x + 57, y + 57, 30, 0, Math.PI * 2); c.stroke(); for (let k = 0; k < 12; k++) { const a = (k / 12) * Math.PI * 2; c.beginPath(); c.moveTo(x + 57 + Math.cos(a) * 34, y + 57 + Math.sin(a) * 34); c.lineTo(x + 57 + Math.cos(a) * 44, y + 57 + Math.sin(a) * 44); c.stroke(); } c.beginPath(); c.arc(x + 57, y + 57, 10, 0, Math.PI * 2); c.stroke(); } },
  { x: 526, y: 950, label: 'IXL', bg: ['#58d84a', '#1fae2e'], glyph: (c, x, y) => { c.fillStyle = '#fff'; c.font = '900 40px Arial, sans-serif'; c.textAlign = 'center'; c.fillText('IXL', x + 57, y + 72); } },
];

const DOCK_APPS = [
  { bg: ['#5bf675', '#0dbf3a'], glyph: (c, x, y) => { c.fillStyle = '#fff'; c.beginPath(); c.ellipse(x + 57, y + 54, 36, 30, 0, 0, Math.PI * 2); c.fill(); c.beginPath(); c.moveTo(x + 32, y + 72); c.lineTo(x + 26, y + 90); c.lineTo(x + 46, y + 80); c.fill(); } },
  { bg: ['#ffffff', '#eef0f5'], glyph: (c, x, y) => { c.lineWidth = 12; c.lineCap = 'round'; [['#ff4d6d', 34, 88, 57, 30], ['#3a7bff', 57, 30, 82, 88], ['#ffb020', 40, 66, 76, 66]].forEach(([col, a, b, d, e]) => { c.strokeStyle = col; c.beginPath(); c.moveTo(x + a, y + b); c.lineTo(x + d, y + e); c.stroke(); }); } },
  { badge: 2, bg: ['#ff6a1a', '#ff3d00'], glyph: (c, x, y) => { c.fillStyle = '#fff'; for (let k = 0; k < 7; k++) c.fillRect(x + 18 + k * 7, y + 64 - k * 3, 4, 20 + k * 3); cloud(c, x + 78, y + 66, 26); } },
  { bg: ['#1b1b1b', '#000000'], glyph: (c, x, y) => { const g = c.createRadialGradient(x + 57, y + 57, 4, x + 57, y + 57, 44); g.addColorStop(0, '#5df08a'); g.addColorStop(1, '#0e6b33'); c.fillStyle = g; c.beginPath(); c.arc(x + 57, y + 57, 44, 0, Math.PI * 2); c.fill(); c.strokeStyle = '#0b0b0b'; c.lineWidth = 7; c.lineCap = 'round'; [[-12, 28], [2, 22], [14, 16]].forEach(([dy, r]) => { c.beginPath(); c.moveTo(x + 57 - r, y + 57 + dy); c.quadraticCurveTo(x + 57, y + 57 + dy - 10, x + 57 + r, y + 57 + dy); c.stroke(); }); } },
  { bg: ['#ffffff', '#f2f4f7'], glyph: (c, x, y) => { c.strokeStyle = '#19a8a0'; c.lineWidth = 8; c.setLineDash([12, 8]); c.beginPath(); c.arc(x + 57, y + 57, 36, 0, Math.PI * 2); c.stroke(); c.setLineDash([]); c.fillStyle = '#19a8a0'; c.beginPath(); c.arc(x + 57, y + 57, 20, 0, Math.PI * 2); c.fill(); } },
  { badge: 20, bg: ['#3aa8ff', '#0a6cff'], glyph: (c, x, y) => { c.fillStyle = '#fff'; ipadRound(c, x + 20, y + 32, 74, 52, 6); c.fill(); c.strokeStyle = '#8cc4ff'; c.lineWidth = 4; c.beginPath(); c.moveTo(x + 22, y + 36); c.lineTo(x + 57, y + 62); c.lineTo(x + 92, y + 36); c.stroke(); } },
  { bg: ['#ffffff', '#f2f4f7'], glyph: (c, x, y) => { ['#ff3b30', '#ff9500', '#ffcc00', '#34c759', '#00c7be', '#007aff', '#5856d6', '#af52de'].forEach((col, k) => { const a = (k / 8) * Math.PI * 2; c.fillStyle = col; c.globalAlpha = 0.85; c.beginPath(); c.ellipse(x + 57 + Math.cos(a) * 20, y + 57 + Math.sin(a) * 20, 20, 11, a, 0, Math.PI * 2); c.fill(); }); c.globalAlpha = 1; } },
  { calendar: true, bg: ['#ffffff', '#ffffff'], glyph: () => {} },
  { bg: ['#ffffff', '#f6f6f6'], glyph: (c, x, y) => { c.fillStyle = '#ffd60a'; c.fillRect(x, y, 114, 24); c.fillStyle = '#d7d9de'; [52, 72, 92].forEach(yy => c.fillRect(x + 14, y + yy, 86, 3)); } },
  { folder: true, bg: ['rgba(255,255,255,0.35)', 'rgba(255,255,255,0.25)'], glyph: (c, x, y) => { [['#8e8e93', 14, 14], ['#ff5a36', 62, 14], ['#1877f2', 14, 62], ['#58cc02', 62, 62]].forEach(([col, dx, dy]) => { c.fillStyle = col; ipadRound(c, x + dx, y + dy, 38, 38, 9); c.fill(); }); } },
];

const drawAppIcon = (ctx, app, x, y, size = 114) => {
  const k = size / 114;
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.18)'; ctx.shadowBlur = 10; ctx.shadowOffsetY = 4;
  const g = ctx.createLinearGradient(0, y, 0, y + size);
  g.addColorStop(0, app.bg[0]); g.addColorStop(1, app.bg[1]);
  ctx.fillStyle = g;
  ipadRound(ctx, x, y, size, size, 26 * k);
  ctx.fill();
  ctx.restore();
  ctx.save();
  ipadRound(ctx, x, y, size, size, 26 * k);
  ctx.clip();
  ctx.translate(x, y); ctx.scale(k, k);
  if (app.calendar) {
    const now = new Date();
    ctx.fillStyle = '#ff3b30'; ctx.font = '600 22px Arial, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(`週${'日一二三四五六'[now.getDay()]}`, 57, 30);
    ctx.fillStyle = '#1c1c1e'; ctx.font = '400 64px Arial, sans-serif';
    ctx.fillText(String(now.getDate()), 57, 92);
  } else {
    app.glyph(ctx, 0, 0);
  }
  ctx.restore();
  if (app.badge) {
    const bx = x + size - 6;
    const by = y + 4;
    ctx.fillStyle = '#ff3b30';
    ctx.beginPath(); ctx.arc(bx, by, 22, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = '500 26px Arial, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(String(app.badge), bx, by + 9);
  }
};

// 半透明小工具底板
const widget = (ctx, x, y, w, h, fill) => {
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.15)'; ctx.shadowBlur = 16; ctx.shadowOffsetY = 6;
  ctx.fillStyle = fill;
  ipadRound(ctx, x, y, w, h, 42);
  ctx.fill();
  ctx.restore();
};

export const drawIpadScreen = (ctx, w, h) => {
  const k = w / 2000;
  ctx.setTransform(k, 0, 0, k, 0, 0);
  ctx.textAlign = 'left';

  // 桌布：藍色漸層＋大片的流線形亮面
  const bg = ctx.createLinearGradient(0, 0, 2000, 1390);
  bg.addColorStop(0, '#2a6f97'); bg.addColorStop(0.45, '#7fb7d3'); bg.addColorStop(1, '#2f6f92');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, 2000, 1390);
  const wave = (alpha, pts) => {
    ctx.fillStyle = `rgba(214, 238, 248, ${alpha})`;
    ctx.beginPath(); ctx.moveTo(...pts[0]);
    for (let i = 1; i < pts.length; i += 3) ctx.bezierCurveTo(...pts[i], ...pts[i + 1], ...pts[i + 2]);
    ctx.closePath(); ctx.fill();
  };
  wave(0.35, [[300, 1390], [700, 900], [700, 300], [1250, 0], [1600, 0], [900, 500], [800, 1390]]);
  wave(0.22, [[0, 1100], [500, 700], [1300, 900], [2000, 300], [2000, 700], [1300, 1200], [0, 1390]]);
  wave(0.18, [[1400, 1390], [1600, 900], [1800, 600], [2000, 550], [2000, 1390], [1800, 1390], [1400, 1390]]);

  // 狀態列
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  ctx.fillStyle = '#ffffff';
  ctx.font = '500 34px Arial, sans-serif';
  ctx.fillText(`${hh}:${mm}   ${now.getMonth() + 1}月${now.getDate()}日 週${'日一二三四五六'[now.getDay()]}`, 28, 38);
  ctx.textAlign = 'right';
  ctx.fillText('61%', 1918, 38);
  ctx.textAlign = 'left';
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 3.5;
  [8, 15, 22].forEach(r => { ctx.beginPath(); ctx.arc(1822, 38, r, -Math.PI * 0.75, -Math.PI * 0.25); ctx.stroke(); });
  ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ipadRound(ctx, 1928, 15, 46, 26, 7); ctx.stroke();
  ctx.fillStyle = '#ffd60a'; ipadRound(ctx, 1932, 19, 24, 18, 4); ctx.fill();

  // 時鐘小工具（指針是目前時間）
  widget(ctx, 190, 72, 230, 228, 'rgba(47, 122, 160, 0.75)');
  const cx = 305; const cy = 186;
  ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(cx, cy, 98, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#1c1c1e'; ctx.font = '500 26px Arial, sans-serif'; ctx.textAlign = 'center';
  for (let n = 1; n <= 12; n++) {
    const a = (n / 12) * Math.PI * 2 - Math.PI / 2;
    ctx.fillText(String(n), cx + Math.cos(a) * 74, cy + Math.sin(a) * 74 + 9);
  }
  const hand = (angle, len, width, color) => {
    ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(angle) * len, cy + Math.sin(angle) * len); ctx.stroke();
  };
  const sec = now.getSeconds();
  const min = now.getMinutes() + sec / 60;
  const hr = (now.getHours() % 12) + min / 60;
  hand((hr / 12) * Math.PI * 2 - Math.PI / 2, 46, 9, '#1c1c1e');
  hand((min / 60) * Math.PI * 2 - Math.PI / 2, 70, 7, '#1c1c1e');
  hand((sec / 60) * Math.PI * 2 - Math.PI / 2, 80, 3, '#ff9500');
  ctx.fillStyle = '#ff9500'; ctx.beginPath(); ctx.arc(cx, cy, 6, 0, Math.PI * 2); ctx.fill();

  // 螢幕使用時間小工具
  widget(ctx, 468, 72, 228, 228, '#ffffff');
  ctx.textAlign = 'left'; ctx.fillStyle = '#1c1c1e'; ctx.font = '400 56px Arial, sans-serif';
  ctx.fillText('40分', 494, 145);
  ctx.strokeStyle = '#e5e5ea'; ctx.lineWidth = 2;
  [168, 206, 244].forEach(yy => { ctx.beginPath(); ctx.moveTo(494, yy); ctx.lineTo(620, yy); ctx.stroke(); });
  ctx.fillStyle = '#8e8e93'; ctx.font = '400 17px Arial, sans-serif';
  ctx.fillText('60分', 630, 174); ctx.fillText('30分', 630, 212); ctx.fillText('0', 630, 250);
  ctx.fillText('11:00', 498, 270); ctx.fillText('17:00', 586, 270);
  [[584, 238, 6, '#5ac8fa'], [596, 234, 6, '#5ac8fa'], [606, 226, 6, '#007aff'], [614, 212, 6, '#007aff']].forEach(([x, y, bw, c]) => { ctx.fillStyle = c; ctx.fillRect(x, y, bw, 244 - y); });

  // 天氣小工具
  widget(ctx, 746, 72, 507, 228, 'rgba(44, 47, 56, 0.92)');
  ctx.fillStyle = '#ffffff'; ctx.textAlign = 'left';
  ctx.font = '500 24px Arial, sans-serif'; ctx.fillText('台北市 ➤', 772, 112);
  ctx.font = '300 70px Arial, sans-serif'; ctx.fillText('29°', 772, 178);
  ctx.textAlign = 'right'; ctx.font = '500 20px Arial, sans-serif';
  ctx.fillText('多雲', 1228, 146); ctx.fillText('高:33° 低:28°', 1228, 176);
  cloud(ctx, 1212, 106, 20);
  ctx.textAlign = 'center'; ctx.font = '500 17px Arial, sans-serif';
  [['20:00', '29°'], ['21:00', '28°'], ['22:00', '28°'], ['23:00', '28°'], ['0:00', '28°'], ['1:00', '27°']].forEach(([t, deg], i) => {
    const x = 796 + i * 84;
    ctx.fillStyle = '#d1d1d6'; ctx.fillText(t, x, 228);
    cloud(ctx, x, 252, 18);
    ctx.fillStyle = '#ffffff'; ctx.fillText(deg, x, 292);
  });

  // 音樂小工具
  widget(ctx, 190, 346, 506, 228, 'rgba(170, 176, 184, 0.88)');
  ctx.fillStyle = '#2b2d42'; ctx.beginPath(); ctx.arc(246, 402, 31, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#ff4fb8'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(246, 402, 18, 0.4, 5.2); ctx.stroke();
  ctx.textAlign = 'left'; ctx.fillStyle = '#1c1c1e'; ctx.font = '700 20px Arial, sans-serif';
  ctx.fillText('Your likes', 290, 397);
  ctx.font = '400 17px Arial, sans-serif'; ctx.fillStyle = '#3a3a3c'; ctx.fillText('retro', 290, 422);
  ctx.fillStyle = '#3a3a3c'; for (let i = 0; i < 6; i++) ctx.fillRect(632 + i * 4, 384 - i, 2.5, 8 + i);
  cloud(ctx, 660, 384, 13, '#3a3a3c');
  ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.fillRect(214, 446, 458, 2);
  [['#2c3e50', '#16a085'], ['#8e44ad', '#2c2c54'], ['#1f2a44', '#c0392b'], ['#f5f5f5', '#dfe4ea']].forEach(([a, b2], i) => {
    const x = 214 + i * 122;
    const g = ctx.createLinearGradient(x, 458, x + 92, 550);
    g.addColorStop(0, a); g.addColorStop(1, b2);
    ctx.fillStyle = g; ipadRound(ctx, x, 458, 92, 92, 8); ctx.fill();
  });

  // 電池小工具
  widget(ctx, 746, 346, 507, 228, 'rgba(160, 206, 226, 0.55)');
  ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 9;
  [820, 940, 1060, 1180].forEach(x => { ctx.beginPath(); ctx.arc(x, 432, 44, 0, Math.PI * 2); ctx.stroke(); });
  ctx.strokeStyle = '#ffd60a';
  ctx.beginPath(); ctx.arc(820, 432, 44, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * 0.61); ctx.stroke();
  ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 3; ipadRound(ctx, 808, 414, 24, 36, 4); ctx.stroke();
  ctx.fillStyle = '#ffffff'; ctx.font = '500 30px Arial, sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('61%', 820, 530);

  // App 圖示與名稱
  ctx.font = '500 21px Arial, sans-serif';
  IPAD_APPS.forEach(app => {
    drawAppIcon(ctx, app, app.x, app.y);
    ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.font = '500 21px Arial, sans-serif';
    ctx.shadowColor = 'rgba(0,0,0,0.25)'; ctx.shadowBlur = 4;
    ctx.fillText(app.label, app.x + 57, app.y + 142);
    ctx.shadowBlur = 0;
  });

  // 頁面點
  [955, 985, 1015, 1045].forEach((x, i) => {
    ctx.fillStyle = i === 0 ? '#ffffff' : 'rgba(255,255,255,0.45)';
    ctx.beginPath(); ctx.arc(x, 1158, 6, 0, Math.PI * 2); ctx.fill();
  });

  // Dock
  ctx.fillStyle = 'rgba(200, 228, 240, 0.4)';
  ipadRound(ctx, 245, 1195, 1512, 180, 60); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 2; ctx.stroke();
  DOCK_APPS.forEach((app, i) => drawAppIcon(ctx, app, 276 + i * 148.5, 1228));

  ctx.textAlign = 'left';
  ctx.setTransform(1, 0, 0, 1, 0, 0);
};

// ---------- Switch 2 遊戲盒（紅色盒子）：封面與側邊；封面是簡化示意圖，不是官方圖 ----------
const caseHeader = (ctx, w, top) => {
  ctx.fillStyle = '#e60012';
  ctx.fillRect(0, 0, w, top);
  ctx.fillStyle = '#ffffff';
  const s = top * 0.55;
  const x = w / 2 - s * 1.1;
  const y = top * 0.18;
  ipadRound(ctx, x, y, s * 0.45, s, s * 0.18); ctx.fill();
  ctx.strokeStyle = '#ffffff'; ctx.lineWidth = s * 0.08;
  ipadRound(ctx, x + s * 0.5, y, s * 0.45, s, s * 0.18); ctx.stroke();
  ctx.font = `900 ${s * 1.05}px Arial, sans-serif`; ctx.textAlign = 'left'; ctx.textBaseline = 'top';
  ctx.fillText('2', x + s * 1.1, y - s * 0.05);
  ctx.font = `700 ${top * 0.13}px Arial, sans-serif`; ctx.textAlign = 'center';
  ctx.fillText('NINTENDO SWITCH', w / 2, y + s + top * 0.04);
  ctx.textBaseline = 'alphabetic';
};

const COVER_ART = {
  // 寶可夢 Pokopia：草地小鎮、樹、池塘、紅屋頂的房子
  pokopia: (ctx, x, y, w, h) => {
    ctx.fillStyle = '#7cc45a'; ctx.fillRect(x, y, w, h);
    ctx.fillStyle = '#e7d3a0';
    ctx.fillRect(x + w * 0.45, y, w * 0.12, h); ctx.fillRect(x, y + h * 0.55, w, h * 0.07);
    ctx.fillStyle = '#5fb0e8';
    ctx.beginPath(); ctx.ellipse(x + w * 0.2, y + h * 0.82, w * 0.2, h * 0.09, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#2f6f3a';
    [[0.1, 0.08], [0.25, 0.14], [0.08, 0.32], [0.82, 0.38], [0.9, 0.86], [0.62, 0.92], [0.33, 0.62]].forEach(([px, py]) => {
      ctx.beginPath(); ctx.arc(x + w * px, y + h * py, w * 0.075, 0, Math.PI * 2); ctx.fill();
    });
    ctx.fillStyle = '#f4efe6'; ctx.fillRect(x + w * 0.66, y + h * 0.13, w * 0.26, h * 0.11);
    ctx.fillStyle = '#e53935';
    ctx.beginPath(); ctx.moveTo(x + w * 0.62, y + h * 0.14); ctx.lineTo(x + w * 0.79, y + h * 0.05); ctx.lineTo(x + w * 0.96, y + h * 0.14); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ipadRound(ctx, x + w * 0.08, y + h * 0.28, w * 0.84, h * 0.2, w * 0.08); ctx.fill();
    ctx.font = `900 ${w * 0.085}px Arial, sans-serif`; ctx.textAlign = 'center';
    ctx.fillStyle = '#2a64c5'; ctx.fillText('Pokémon', x + w * 0.5, y + h * 0.35);
    const letters = ['#e53935', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7', '#ec4899', '#14b8a6'];
    ctx.font = `900 ${w * 0.15}px Arial, sans-serif`;
    const word = 'Pokopia';
    const total = ctx.measureText(word).width;
    let cx = x + w * 0.5 - total / 2;
    ctx.textAlign = 'left';
    [...word].forEach((ch, i) => { ctx.fillStyle = letters[i]; ctx.fillText(ch, cx, y + h * 0.455); cx += ctx.measureText(ch).width; });
  },
  // 王國之淚
  totk: (ctx, x, y, w, h) => {
    const g = ctx.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, '#6fb4ea'); g.addColorStop(0.6, '#f3d9a8'); g.addColorStop(1, '#4f7a46');
    ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
    ctx.fillStyle = '#5f8f4f'; ctx.beginPath(); ctx.ellipse(x + w * 0.5, y + h * 0.4, w * 0.32, h * 0.05, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#7a6248'; ctx.beginPath(); ctx.moveTo(x + w * 0.2, y + h * 0.41); ctx.lineTo(x + w * 0.8, y + h * 0.41); ctx.lineTo(x + w * 0.5, y + h * 0.55); ctx.fill();
    ctx.fillStyle = '#ffffff'; ctx.font = `700 ${w * 0.16}px Georgia, serif`; ctx.textAlign = 'center';
    ctx.fillText('ZELDA', x + w * 0.5, y + h * 0.2);
    ctx.font = `600 ${w * 0.06}px Georgia, serif`; ctx.fillText('TEARS OF THE KINGDOM', x + w * 0.5, y + h * 0.27);
  },
};

export const drawGameCover = (variant) => (ctx, w, h) => {
  ctx.fillStyle = '#e60012'; ctx.fillRect(0, 0, w, h);
  const top = h * 0.12;
  caseHeader(ctx, w, top);
  const pad = w * 0.035;
  ctx.save();
  ctx.beginPath(); ctx.rect(pad, top, w - pad * 2, h - top - pad); ctx.clip();
  COVER_ART[variant](ctx, pad, top, w - pad * 2, h - top - pad);
  ctx.restore();
};

// 側邊：紅底白字，直書的遊戲名稱
export const drawGameSpine = (title) => (ctx, w, h) => {
  ctx.fillStyle = '#e60012'; ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#ffffff';
  ctx.font = `900 ${w * 0.55}px Arial, sans-serif`; ctx.textAlign = 'center';
  ctx.fillText('2', w / 2, w * 0.75);
  ctx.save();
  ctx.translate(w / 2, h * 0.55);
  ctx.rotate(Math.PI / 2);
  ctx.font = `700 ${w * 0.42}px Arial, sans-serif`;
  ctx.fillText(title, 0, w * 0.15);
  ctx.restore();
};

// 霓虹字 RETRO//SPACE
export const drawNeonText = (ctx, w, h) => {
  ctx.clearRect(0, 0, w, h);
  ctx.font = `700 ${h * 0.62}px "Chakra Petch", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = '#ff4fb8';
  ctx.shadowBlur = h * 0.12;
  ctx.fillStyle = '#ffd1ec';
  ctx.fillText('RETRO//SPACE', w / 2, h / 2);
};
