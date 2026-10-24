import React, { useState, useEffect } from 'react';
import { gear } from './data/playground';
import { iso, pts, leftPlane, rightPlane, floorPlane, boxBounds, IsoBox } from './gear/iso';
import {
  CodeScreen, EldenScreen, WindowArt, AllyArt, Switch2Art,
  MacbookScreenArt, IpadArt, PhoneBackArt, PcSideArt,
} from './gear/art';

// 電競房間（等角視角的房間剖面）：滑鼠移到物品上（手機點一下）會標示該設備的資訊
// 房間 420 × 420 × 300；左牆放書桌、雙螢幕和主機，右牆有窗戶、電視和掌機，前方是沙發

const VIEW = { x: 110, y: 50, w: 780, h: 790 };

// 各設備的 hover 感應區（螢幕座標 [x, y, 寬, 高]），提示框指向感應區頂端中間
const HEAD = iso(110, 280, 148);
const HITS = {
  monitor1: boxBounds(10, 290, 80, 6, 80, 60),
  monitor2: boxBounds(10, 206, 80, 6, 80, 60),
  pc: boxBounds(8, 392, 0, 50, 24, 72),
  laptop: boxBounds(118, 52, 36, 32, 42, 30),
  tablet: boxBounds(220, 192, 46, 28, 22, 3),
  phone: boxBounds(44, 330, 81, 18, 37, 2),
  ally: boxBounds(322, 8, 34, 52, 10, 26),
  switch2: boxBounds(262, 8, 34, 48, 10, 24),
  headphones: [HEAD[0] - 20, HEAD[1] - 24, 40, 40],
};

const gearByKey = Object.fromEntries(gear.map(item => [item.key, item]));

// 可互動的物品：統一處理 hover / focus / 點擊
const Item = ({ id, active, onActivate, children }) => {
  const info = gearByKey[id];
  const [x, y, w, h] = HITS[id];
  return (
    <g
      className={`gear-item ${active === id ? 'is-active' : ''}`}
      tabIndex={0}
      role="button"
      aria-label={`${info.category}：${info.name}`}
      onMouseEnter={() => onActivate(id)}
      onMouseLeave={() => onActivate(null)}
      onFocus={() => onActivate(id)}
      onBlur={() => onActivate(null)}
      onClick={(e) => {
        e.stopPropagation();
        onActivate(active === id ? null : id);
      }}
    >
      {/* 透明的感應區，讓小物品也容易指到 */}
      <rect className="gear-hit" x={x} y={y} width={w} height={h} fill="transparent" />
      <g className="gear-art">{children}</g>
    </g>
  );
};

// 把某個原本座標系的圖案縮放進 (x, y, w, h)
const Embed = ({ x = 0, y = 0, w, h, viewBox, children }) => (
  <svg x={x} y={y} width={w} height={h} viewBox={viewBox} preserveAspectRatio="none" overflow="hidden">
    {children}
  </svg>
);

// Xbox 手把（俯視）：寬度沿 v 方向（人的左右），握把朝 u 方向（朝向人）
const XboxController = () => (
  <g>
    <path d="M2 4 Q1 0 5 1 L9 1 Q13 1 13 5 L13 15 Q13 19 9 19 L5 19 Q1 20 2 16 Z" fill="#1b1d22" />
    <ellipse cx="11" cy="3.5" rx="3.5" ry="3" fill="#1b1d22" />
    <ellipse cx="11" cy="16.5" rx="3.5" ry="3" fill="#1b1d22" />
    <circle cx="5" cy="6" r="1.4" fill="#0b0c0f" stroke="#3a3d45" strokeWidth="0.4" />
    <circle cx="8" cy="12.5" r="1.4" fill="#0b0c0f" stroke="#3a3d45" strokeWidth="0.4" />
    <circle cx="5" cy="15" r="0.6" fill="#facc15" />
    <circle cx="6.2" cy="14" r="0.6" fill="#3b82f6" />
    <circle cx="6.2" cy="16" r="0.6" fill="#ef4444" />
    <circle cx="7.4" cy="15" r="0.6" fill="#22c55e" />
    <circle cx="3.5" cy="10" r="1" fill="#e5e7eb" />
  </g>
);

// 書（在置物架上）：沿 y 排列的小長方體
const BOOKS = [
  { y: 40, w: 6, h: 26, c: '#4d1f35' },
  { y: 47, w: 5, h: 22, c: '#1f3a4d' },
  { y: 53, w: 7, h: 28, c: '#3b2a52' },
  { y: 61, w: 5, h: 20, c: '#2f4a3a' },
];

const GearRoom = () => {
  const [active, setActive] = useState(null);
  // 切換主題時窗外播放過場天色：變暗 → 黃昏、變亮 → 清晨（頁面剛載入時不播）
  const [skyTransition, setSkyTransition] = useState(null);

  useEffect(() => {
    const html = document.documentElement;
    let prevTheme = html.getAttribute('data-theme');
    const observer = new MutationObserver(() => {
      const theme = html.getAttribute('data-theme');
      if (theme === prevTheme) return;
      prevTheme = theme;
      setSkyTransition({ type: theme === 'dark' ? 'dusk' : 'dawn', id: Date.now() });
    });
    observer.observe(html, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  const activeInfo = active ? gearByKey[active] : null;
  const hit = active ? HITS[active] : null;

  // 提示框位置：指向感應區頂端中間，靠近左右邊緣時改變對齊
  const anchorX = hit ? hit[0] + hit[2] / 2 : 0;
  const tooltipStyle = hit ? {
    left: `${((anchorX - VIEW.x) / VIEW.w) * 100}%`,
    top: `${((hit[1] - VIEW.y) / VIEW.h) * 100}%`,
  } : null;
  const tooltipAlign = hit ? (anchorX < 300 ? 'align-left' : anchorX > 700 ? 'align-right' : '') : '';

  const typeArm = (side) => {
    const s = side === 'left' ? 1 : -1;
    return pts([[110, 280 + 18 * s, 124], [86, 280 + 24 * s, 98], [62, 280 + 12 * s, 84]]);
  };
  const playArm = (side) => {
    const s = side === 'left' ? 1 : -1;
    return pts([[110, 280 + 18 * s, 124], [92, 280 + 20 * s, 100], [80, 280 + 7 * s, 106]]);
  };

  return (
    <div className="gear-room">
      <div className={`gear-stage ${active ? 'has-active' : ''}`} onClick={() => setActive(null)}>
        <svg viewBox={`${VIEW.x} ${VIEW.y} ${VIEW.w} ${VIEW.h}`} className="gear-svg" role="img" aria-label="Retro 的電競房間與設備">
          <defs>
            <linearGradient id="g-led" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#ff1f8f" />
              <stop offset="0.5" stopColor="#7c3aed" />
              <stop offset="1" stopColor="#00e5ff" />
            </linearGradient>
            <linearGradient id="g-sky-night" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#0b1026" />
              <stop offset="1" stopColor="#1c1740" />
            </linearGradient>
            <linearGradient id="g-sky-dusk" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#2b2d6b" />
              <stop offset="0.55" stopColor="#c4537a" />
              <stop offset="1" stopColor="#f59e5b" />
            </linearGradient>
            <linearGradient id="g-sky-dawn" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#7283c7" />
              <stop offset="0.55" stopColor="#f2b8c6" />
              <stop offset="1" stopColor="#ffd9a8" />
            </linearGradient>
            <linearGradient id="g-sky-day" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#6fb6f2" />
              <stop offset="1" stopColor="#c9e6fb" />
            </linearGradient>
            <radialGradient id="g-glow-purple" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stopColor="#7c3aed" stopOpacity="0.6" />
              <stop offset="1" stopColor="#7c3aed" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="g-glow-warm" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stopColor="#ffcf8a" stopOpacity="0.55" />
              <stop offset="1" stopColor="#ffcf8a" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="g-bigsur" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#1e3a8a" />
              <stop offset="0.45" stopColor="#7c3aed" />
              <stop offset="0.75" stopColor="#f472b6" />
              <stop offset="1" stopColor="#fb923c" />
            </linearGradient>
            <linearGradient id="g-ipad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#312e81" />
              <stop offset="1" stopColor="#0ea5e9" />
            </linearGradient>
            <linearGradient id="g-tv" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#0f1b3d" />
              <stop offset="1" stopColor="#2a0f3d" />
            </linearGradient>
            <linearGradient id="er-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#56675d" />
              <stop offset="0.6" stopColor="#3b4740" />
              <stop offset="1" stopColor="#2c342f" />
            </linearGradient>
            <linearGradient id="er-floor" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#3d443b" />
              <stop offset="1" stopColor="#262a24" />
            </linearGradient>
            <radialGradient id="er-burst-glow" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stopColor="#fff2b0" stopOpacity="0.9" />
              <stop offset="0.45" stopColor="#f2c14e" stopOpacity="0.45" />
              <stop offset="1" stopColor="#f2c14e" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="er-band" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#000" stopOpacity="0" />
              <stop offset="0.2" stopColor="#000" stopOpacity="0.72" />
              <stop offset="0.8" stopColor="#000" stopOpacity="0.72" />
              <stop offset="1" stopColor="#000" stopOpacity="0" />
            </linearGradient>
            <clipPath id="er-screen">
              <rect x="711" y="265" width="256" height="138" />
            </clipPath>
            <linearGradient id="g-xbox-ui" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#0e7a0d" />
              <stop offset="1" stopColor="#0b2e13" />
            </linearGradient>
            <linearGradient id="g-glass" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#ffffff" stopOpacity="0.08" />
              <stop offset="0.4" stopColor="#ffffff" stopOpacity="0" />
              <stop offset="1" stopColor="#ffffff" stopOpacity="0.04" />
            </linearGradient>
            <filter id="g-blur" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="14" />
            </filter>
            <filter id="g-neon" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2.5" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* ===== 地板與牆 ===== */}
          <IsoBox x={-10} y={-10} z={-18} w={430} d={430} h={18} top="#2a2038" left="#17121f" right="#1f1829" className="iso-floor" />
          <g transform={floorPlane(150, 150, 0.5)}>
            <ellipse cx="140" cy="125" rx="135" ry="120" fill="#2e1f45" className="iso-rug" />
            <ellipse cx="140" cy="125" rx="135" ry="120" fill="none" stroke="#ff1f8f" strokeOpacity="0.35" strokeWidth="2" />
          </g>
          {/* 亮色主題：窗外照進來的陽光 */}
          <g className="room-day" transform={floorPlane(40, 0, 0.6)}>
            <path d="M0 10 L110 10 L150 150 L40 150 Z" fill="#fff4d6" opacity="0.28" />
          </g>
          <IsoBox x={-10} y={-10} z={0} w={10} d={430} h={300} top="#3a2f55" left="#2d2346" right="#1d1630" className="iso-wall-l" />
          <IsoBox x={0} y={-10} z={0} w={420} d={10} h={300} top="#3a2f55" left="#251c3d" right="#2d2346" className="iso-wall-r" />
          {/* 牆頂的 RGB 燈條 */}
          <polyline points={pts([[0, 420, 300], [0, 0, 300], [420, 0, 300]])} fill="none" stroke="url(#g-led)" strokeWidth="4" filter="url(#g-neon)" className="led-strip" />

          {/* ===== 右牆：窗戶、飛鏢靶、電視 ===== */}
          <g transform={rightPlane(40, 0.5, 245)}>
            <Embed w={110} h={100} viewBox="364 78 166 151">
              <WindowArt skyTransition={skyTransition} onSkyTransitionEnd={() => setSkyTransition(null)} />
            </Embed>
          </g>
          <g transform={rightPlane(176, 0.5, 226)}>
            <circle cx="20" cy="20" r="20" fill="#14141a" />
            <circle cx="20" cy="20" r="16" fill="#e8dcc0" />
            <circle cx="20" cy="20" r="12" fill="#1c1c22" />
            <circle cx="20" cy="20" r="8" fill="#e8dcc0" />
            <circle cx="20" cy="20" r="4" fill="#c0392b" />
            <circle cx="20" cy="20" r="1.5" fill="#1f7a3f" />
            <line x1="26" y1="10" x2="34" y2="2" stroke="#ff1f8f" strokeWidth="1.2" />
          </g>
          {/* 電視（螢幕保護程式：RETRO_OS 在畫面裡彈來彈去） */}
          <g transform={rightPlane(248, 0.5, 178)}>
            <rect x="0" y="0" width="134" height="76" rx="2" fill="#0b0b0f" />
            <rect x="3" y="3" width="128" height="70" fill="url(#g-tv)" />
            <g className="tv-bounce">
              <text x="10" y="18" fontSize="9" fontWeight="700" fill="#00e5ff" className="tv-logo" fontFamily="'Chakra Petch', sans-serif">RETRO_OS</text>
            </g>
          </g>
          <IsoBox x={252} y={0} z={0} w={136} d={30} h={34} top="#2a2238" left="#1f1a2b" right="#251f33" className="iso-cabinet" />
          <line x1={iso(256, 30, 17)[0]} y1={iso(256, 30, 17)[1]} x2={iso(384, 30, 17)[0]} y2={iso(384, 30, 17)[1]} stroke="#3a3050" strokeWidth="1" className="iso-cabinet-line" />
          <polyline points={pts([[252, 30, 1], [388, 30, 1], [388, 0, 1]])} fill="none" stroke="url(#g-led)" strokeWidth="2" className="led-strip" />

          {/* 掌機放在電視櫃上 */}
          <Item id="switch2" active={active} onActivate={setActive}>
            <polygon points={pts([[272, 12, 34], [300, 12, 34], [296, 12, 38], [276, 12, 38]])} fill="#3a3050" />
            <g transform={rightPlane(262, 12, 57)}>
              <Embed w={48} h={20} viewBox="186 120 120 44"><Switch2Art /></Embed>
            </g>
          </Item>
          <Item id="ally" active={active} onActivate={setActive}>
            <polygon points={pts([[334, 12, 34], [362, 12, 34], [358, 12, 38], [338, 12, 38]])} fill="#3a3050" />
            <g transform={rightPlane(322, 12, 59)}>
              <Embed w={52} h={22} viewBox="53 116 124 52"><AllyArt /></Embed>
            </g>
          </Item>

          {/* ===== 左牆：置物架與霓虹招牌 ===== */}
          {[200, 250].map(z => (
            <IsoBox key={z} x={0} y={30} z={z} w={24} d={124} h={4} top="#4a3d63" left="#33294a" right="#3d3256" className="iso-shelf" />
          ))}
          {BOOKS.map(b => (
            <IsoBox key={b.y} x={3} y={b.y} z={204} w={16} d={b.w} h={b.h} top={b.c} left={b.c} right={b.c} />
          ))}
          <IsoBox x={4} y={120} z={204} w={14} d={14} h={10} top="#5a4a3a" left="#3d3128" right="#4a3c30" />
          <polygon points={pts([[11, 127, 214], [6, 124, 234], [16, 130, 230]])} fill="#2f8a52" />
          <IsoBox x={6} y={60} z={254} w={12} d={10} h={16} top="#e2b13c" left="#b08425" right="#c89a2e" />
          <IsoBox x={4} y={90} z={254} w={14} d={30} h={4} top="#22c55e" left="#178a41" right="#1ca04b" />
          <g transform={leftPlane(0.5, 396, 268)} filter="url(#g-neon)" className="neon-sign">
            <text x="0" y="22" fontSize="22" fontWeight="700" fill="#ff4fb8" fontFamily="'Chakra Petch', sans-serif" letterSpacing="1">RETRO//SPACE</text>
          </g>

          {/* ===== 床（MacBook 放在床上） ===== */}
          <IsoBox x={0} y={18} z={0} w={8} d={110} h={70} top="#3a2d52" left="#2c2240" right="#33284a" className="iso-bedhead" />
          <IsoBox x={8} y={18} z={0} w={182} d={110} h={14} top="#3a2a4a" left="#2a1f38" right="#322643" className="iso-bedframe" />
          <IsoBox x={10} y={20} z={14} w={178} d={106} h={18} top="#4b5068" left="#3a3e52" right="#43485e" className="iso-mattress" />
          <IsoBox x={70} y={18} z={30} w={120} d={110} h={6} top="#5b3f8c" left="#462f6e" right="#50377c" className="iso-blanket" />
          <IsoBox x={14} y={30} z={32} w={34} d={86} h={8} top="#c9cddb" left="#a3a8b8" right="#b6bbca" className="iso-pillow" />
          <Item id="laptop" active={active} onActivate={setActive}>
            <g transform={floorPlane(120, 52, 36.5)}>
              <rect x="0" y="0" width="28" height="42" rx="1.5" fill="#c4c7cc" />
              <rect x="3" y="4" width="14" height="34" rx="1" fill="#1d1d22" />
              <rect x="19" y="14" width="6" height="14" rx="1" fill="#aeb1b7" />
            </g>
            <g transform={leftPlane(120, 94, 66)}>
              <Embed w={42} h={26} viewBox="62 198 136 84"><MacbookScreenArt /></Embed>
            </g>
          </Item>

          {/* ===== 邊桌（iPad 放在上面） ===== */}
          <line x1={iso(234, 204, 0)[0]} y1={iso(234, 204, 0)[1]} x2={iso(234, 204, 44)[0]} y2={iso(234, 204, 44)[1]} stroke="#2a2238" strokeWidth="4" className="iso-table-leg" />
          <g transform={floorPlane(210, 180, 43)}>
            <circle cx="24" cy="24" r="24" fill="#251f33" className="iso-table-side" />
          </g>
          <g transform={floorPlane(210, 180, 46)}>
            <circle cx="24" cy="24" r="24" fill="#3a3050" className="iso-table-top" />
          </g>
          <Item id="tablet" active={active} onActivate={setActive}>
            <g transform={floorPlane(220, 192, 46.5)}>
              <Embed w={28} h={20} viewBox="226 206 92 64"><IpadArt /></Embed>
            </g>
          </Item>

          {/* ===== 書桌 ===== */}
          <ellipse cx={iso(14, 288, 118)[0]} cy={iso(14, 288, 118)[1]} rx="120" ry="70" fill="url(#g-glow-purple)" filter="url(#g-blur)" className="monitor-glow" />
          <IsoBox x={66} y={180} z={0} w={6} d={6} h={75} top="#1d1828" left="#17131f" right="#1a1624" className="iso-desk-leg" />
          <IsoBox x={66} y={377} z={0} w={6} d={6} h={75} top="#1d1828" left="#17131f" right="#1a1624" className="iso-desk-leg" />
          <IsoBox x={0} y={175} z={75} w={76} d={213} h={6} top="#2a2338" left="#1d1828" right="#231d30" className="iso-desk" />
          <line x1={iso(76, 177, 77)[0]} y1={iso(76, 177, 77)[1]} x2={iso(76, 386, 77)[0]} y2={iso(76, 386, 77)[1]} stroke="url(#g-led)" strokeWidth="2" className="led-strip" />

          {/* 滑鼠墊、鍵盤、滑鼠 */}
          <g transform={floorPlane(42, 226, 81.2)}>
            <rect x="0" y="0" width="30" height="92" rx="2" fill="#141019" stroke="#ff1f8f" strokeOpacity="0.6" strokeWidth="0.8" />
            <rect x="8" y="30" width="15" height="52" rx="1.5" fill="#0d0d12" />
            {[0, 1, 2, 3].map(r => <line key={r} x1={10 + r * 3.2} y1="33" x2={10 + r * 3.2} y2="79" stroke="#2c2c38" strokeWidth="1.4" strokeDasharray="2.4 0.8" />)}
            <rect x="22" y="30" width="1.2" height="52" fill="url(#g-led)" className="rgb-cycle" />
            <ellipse cx="15" cy="14" rx="3.5" ry="5" fill="#0d0d12" />
            <ellipse cx="15" cy="14" rx="1" ry="3" fill="#00e5ff" className="rgb-cycle" />
          </g>

          {/* 桌上的 Xbox 手把（玩遊戲時會被拿起來） */}
          <g className="desk-controller" transform={floorPlane(48, 192, 81.5)}>
            <XboxController />
          </g>

          {/* Galaxy S25 Ultra：背面朝上放在桌上 */}
          <Item id="phone" active={active} onActivate={setActive}>
            <g transform={floorPlane(46, 330, 81.4)}>
              <Embed w={18} h={37} viewBox="452 398 30 62"><PhoneBackArt /></Embed>
            </g>
          </Item>

          {/* 桌燈 */}
          <g>
            <ellipse cx={iso(18, 372, 81)[0]} cy={iso(18, 372, 81)[1]} rx="6" ry="3" fill="#2a2238" />
            <line x1={iso(18, 372, 81)[0]} y1={iso(18, 372, 81)[1]} x2={iso(18, 372, 112)[0]} y2={iso(18, 372, 112)[1]} stroke="#3a3050" strokeWidth="2" />
            <polygon points={pts([[18, 364, 112], [18, 380, 112], [18, 377, 122], [18, 367, 122]])} fill="#3a3050" />
            <circle cx={iso(18, 372, 108)[0]} cy={iso(18, 372, 108)[1]} r="26" fill="url(#g-glow-warm)" className="lamp-glow" />
          </g>

          {/* MSI 主螢幕：寫程式 */}
          <Item id="monitor1" active={active} onActivate={setActive}>
            <IsoBox x={14} y={322} z={81} w={16} d={16} h={2} top="#1a1a22" left="#121218" right="#16161c" />
            <g transform={leftPlane(14, 370, 140)}>
              <rect x="37" y="46" width="6" height="14" fill="#20202a" />
              <rect x="0" y="0" width="80" height="46" rx="1.5" fill="#09090d" />
              <Embed x={2} y={2} w={76} h={42} viewBox="433 265 256 141"><CodeScreen /></Embed>
              <text x="40" y="45.6" textAnchor="middle" fontSize="1.8" fill="#9a9aa5" fontWeight="700">msi</text>
            </g>
          </Item>

          {/* BenQ EX2710Q 副螢幕：艾爾登法環 */}
          <Item id="monitor2" active={active} onActivate={setActive}>
            <IsoBox x={12} y={237} z={81} w={20} d={18} h={2} top="#5b5e66" left="#45474e" right="#505259" />
            <polyline points={pts([[14, 241, 83.2], [30, 241, 83.2]])} stroke="#e2711d" strokeWidth="1" />
            <g transform={leftPlane(14, 286, 140)}>
              <path d="M37 47 Q35 54 38 61 L42 61 Q40 54 43 47 Z" fill="#6b6e76" />
              <rect x="0" y="0" width="80" height="47" rx="1.5" fill="#1a1b20" />
              <Embed x={2} y={2} w={76} h={41} viewBox="711 265 256 138"><EldenScreen /></Embed>
              <rect x="0" y="43" width="80" height="4" fill="#25272d" />
              <text x="40" y="46.2" textAnchor="middle" fontSize="2.2" fill="#d4d4dc" fontWeight="700">BenQ</text>
            </g>
          </Item>

          {/* ===== 主機（側透玻璃朝向房間） ===== */}
          <Item id="pc" active={active} onActivate={setActive}>
            <IsoBox x={8} y={392} z={0} w={50} d={24} h={72} top="#18181f" left="#101016" right="#14141b" />
            <g transform={rightPlane(8, 416, 72)}>
              <Embed w={50} h={72} viewBox="1010 272 140 196"><PcSideArt /></Embed>
            </g>
            {[397, 404, 411].map(y => (
              <line key={y} x1={iso(58, y, 10)[0]} y1={iso(58, y, 10)[1]} x2={iso(58, y, 62)[0]} y2={iso(58, y, 62)[1]} stroke="#ff1f8f" strokeWidth="1.6" className="rgb-cycle" />
            ))}
          </Item>

          {/* ===== 電競椅底座 ===== */}
          <IsoBox x={115} y={277} z={6} w={6} d={6} h={34} top="#22222c" left="#18181f" right="#1d1d25" />
          <polyline points={pts([[95, 280, 4], [140, 280, 4]])} stroke="#1a1a22" strokeWidth="4" strokeLinecap="round" />
          <polyline points={pts([[118, 258, 4], [118, 302, 4]])} stroke="#1a1a22" strokeWidth="4" strokeLinecap="round" />
          <IsoBox x={96} y={258} z={40} w={40} d={44} h={10} top="#1d1d27" left="#15151d" right="#191922" />

          {/* ===== 人：有時寫程式、有時拿起手把打遊戲 ===== */}
          <g className="person">
            <polygon points={pts([[112, 261, 128], [112, 299, 128], [118, 299, 50], [118, 261, 50]])} fill="#34344a" />
            <ellipse cx={iso(114, 280, 130)[0]} cy={iso(114, 280, 130)[1]} rx="9" ry="4" fill="#2a2a3c" />
            {/* 打字姿勢 */}
            <g className="pose-type">
              <polyline points={typeArm('right')} fill="none" stroke="#34344a" strokeWidth="7.5" strokeLinecap="round" strokeLinejoin="round" />
              <polyline points={typeArm('left')} fill="none" stroke="#3c3c55" strokeWidth="7.5" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx={iso(62, 268, 84)[0]} cy={iso(62, 268, 84)[1]} r="3.2" fill="#d9a07a" className="typist-arm-right" />
              <circle cx={iso(62, 292, 84)[0]} cy={iso(62, 292, 84)[1]} r="3.2" fill="#d9a07a" className="typist-arm-left" />
            </g>
            {/* 打遊戲姿勢：雙手握著手把 */}
            <g className="pose-play">
              <polyline points={playArm('right')} fill="none" stroke="#34344a" strokeWidth="7.5" strokeLinecap="round" strokeLinejoin="round" />
              <polyline points={playArm('left')} fill="none" stroke="#3c3c55" strokeWidth="7.5" strokeLinecap="round" strokeLinejoin="round" />
              <g transform={floorPlane(72, 270, 108)} className="held-controller">
                <XboxController />
              </g>
              <circle cx={iso(80, 273, 106)[0]} cy={iso(80, 273, 106)[1]} r="3" fill="#d9a07a" />
              <circle cx={iso(80, 287, 106)[0]} cy={iso(80, 287, 106)[1]} r="3" fill="#d9a07a" />
            </g>
            {/* 頭與 Sony WH-1000XM6（戴在頭上） */}
            <Item id="headphones" active={active} onActivate={setActive}>
              <g className="person-head">
                <ellipse cx={HEAD[0] + 12} cy={HEAD[1] - 6} rx="4.5" ry="7" fill="#1d1d22" />
                <ellipse cx={HEAD[0]} cy={HEAD[1]} rx="13" ry="14" fill="#1d1510" />
                <path d={`M${HEAD[0] - 8} ${HEAD[1] - 6} Q${HEAD[0]} ${HEAD[1] - 12} ${HEAD[0] + 8} ${HEAD[1] - 4}`} stroke="#2a1f18" strokeWidth="1.4" fill="none" />
                <ellipse cx={HEAD[0] - 12} cy={HEAD[1] + 6} rx="5.2" ry="7.4" fill="#26262c" stroke="#3a3a44" strokeWidth="0.6" />
                <rect x={HEAD[0] - 13.5} y={HEAD[1] - 3} width="1.8" height="6" fill="#8a8d93" />
                <path d={`M${HEAD[0] - 12} ${HEAD[1] - 1} Q${HEAD[0] - 2} ${HEAD[1] - 25} ${HEAD[0] + 12} ${HEAD[1] - 12}`} stroke="#2a2a30" strokeWidth="3.6" fill="none" strokeLinecap="round" />
                <circle cx={HEAD[0] - 13.5} cy={HEAD[1] + 10} r="0.9" fill="#22c55e" className="blink-slow" />
              </g>
            </Item>
          </g>

          {/* 椅背（擋住身體） */}
          <IsoBox x={126} y={260} z={50} w={10} d={40} h={66} top="#1d1d27" left="#15151d" right="#14141b" />
          <polygon points={pts([[136, 266, 56], [136, 271, 56], [136, 271, 110], [136, 266, 110]])} fill="#ff1f8f" />
          <polygon points={pts([[136, 289, 56], [136, 294, 56], [136, 294, 110], [136, 289, 110]])} fill="#ff1f8f" />
          <IsoBox x={100} y={300} z={58} w={28} d={4} h={4} top="#22222c" left="#18181f" right="#1d1d25" />

          {/* ===== 單人沙發（面向電視）與立燈 ===== */}
          <IsoBox x={292} y={250} z={0} w={56} d={58} h={30} top="#4a4062" left="#352e48" right="#3d3552" className="iso-sofa" />
          <IsoBox x={280} y={250} z={0} w={12} d={70} h={48} top="#4a4062" left="#352e48" right="#3d3552" className="iso-sofa" />
          <IsoBox x={348} y={250} z={0} w={12} d={70} h={48} top="#4a4062" left="#352e48" right="#3d3552" className="iso-sofa" />
          <IsoBox x={280} y={306} z={0} w={80} d={14} h={80} top="#4f4568" left="#3a3250" right="#433a5a" className="iso-sofa" />
          <polygon points={pts([[300, 320, 8], [306, 320, 8], [306, 320, 74], [300, 320, 74]])} fill="#ff4fb8" />
          <polygon points={pts([[334, 320, 8], [340, 320, 8], [340, 320, 74], [334, 320, 74]])} fill="#ff4fb8" />
          <g>
            <ellipse cx={iso(396, 268, 0)[0]} cy={iso(396, 268, 0)[1]} rx="10" ry="5" fill="#2a2238" />
            <line x1={iso(396, 268, 0)[0]} y1={iso(396, 268, 0)[1]} x2={iso(396, 268, 140)[0]} y2={iso(396, 268, 140)[1]} stroke="#3a3050" strokeWidth="2.4" />
            <polygon points={pts([[396, 258, 140], [396, 278, 140], [396, 274, 160], [396, 262, 160]])} fill="#e8dcc0" className="iso-lampshade" />
            <circle cx={iso(396, 268, 140)[0]} cy={iso(396, 268, 140)[1]} r="40" fill="url(#g-glow-warm)" className="lamp-glow" />
          </g>
        </svg>

        {activeInfo && hit && (
          <div className={`gear-tooltip ${tooltipAlign}`} style={tooltipStyle} role="status">
            <span className="gear-tooltip-category">{`// ${activeInfo.category}`}</span>
            <strong className="gear-tooltip-name">{activeInfo.name}</strong>
            {activeInfo.specs.map(spec => (
              <span key={spec} className="gear-tooltip-spec">{spec}</span>
            ))}
          </div>
        )}
      </div>

      {/* 設備清單：手機或鍵盤使用者也能看到全部；滑過清單會標示畫面中的物品 */}
      <div className="gear-list">
        <p className="gear-list-cmd">$ ls ~/setup</p>
        <ul>
          {gear.map(item => (
            <li key={item.key}>
              <button
                type="button"
                className={`gear-list-item ${active === item.key ? 'is-active' : ''}`}
                onMouseEnter={() => setActive(item.key)}
                onMouseLeave={() => setActive(null)}
                onFocus={() => setActive(item.key)}
                onBlur={() => setActive(null)}
              >
                <span className="gear-list-category">{item.category}</span>
                <span className="gear-list-name">{item.name}</span>
                {item.specs.length > 0 && <span className="gear-list-specs">{item.specs.join(' / ')}</span>}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default GearRoom;
