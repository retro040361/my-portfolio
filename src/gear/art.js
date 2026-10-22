import React from 'react';

// 螢幕畫面與設備圖案：都畫在各自原本的座標系裡，
// 由 GearRoom 用 <svg viewBox> 放到等角視角房間的牆面 / 桌面上

// 螢幕上逐行打出來的程式碼（寬度動畫模擬打字）
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

// 艾爾登法環畫面用的粒子位置（固定的偽亂數，每次渲染都一樣）
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

// 寫程式的螢幕（座標 433–689 × 265–406）
export const CodeScreen = () => (
  <g>
    <rect x="433" y="265" width="256" height="141" fill="#0f0f17" />
    <rect x="433" y="265" width="40" height="141" fill="#14141f" />
    {[0, 1, 2, 3, 4, 5].map(i => <rect key={i} x="440" y={274 + i * 12} width="26" height="4" rx="1" fill="#3a3a52" />)}
    {CODE_LINES.map((line, i) => (
      <rect
        key={i}
        className={`code-line code-line-${i}`}
        x={482 + line.indent}
        y={274 + i * 13}
        width={line.w}
        height="5"
        rx="1"
        fill={line.c}
        opacity="0.85"
        style={{ animationDelay: `${i * 0.55}s` }}
      />
    ))}
    <rect x="482" y="394" width="6" height="7" fill="#f4f4f6" className="caret" />
  </g>
);

// 艾爾登法環打王的螢幕（座標 711–967 × 265–403）
export const EldenScreen = () => (
  <g clipPath="url(#er-screen)">
    {/* 場景（砸地時會整個晃動） */}
    <g className="er-cam">
      <rect x="711" y="265" width="256" height="70" fill="url(#er-sky)" />
      <ellipse cx="760" cy="282" rx="40" ry="9" fill="#7b8a80" opacity="0.25" />
      <ellipse cx="900" cy="276" rx="52" ry="10" fill="#7b8a80" opacity="0.2" />
      <ellipse cx="840" cy="298" rx="70" ry="8" fill="#6c7a70" opacity="0.18" />
      {/* 遠方樹林與左邊枯樹 */}
      <path d="M711 332 L711 312 Q722 304 730 314 Q738 300 748 312 Q756 306 764 318 L770 332 Z" fill="#1f2621" />
      <path d="M718 334 L721 286 M720 300 L712 290 M721 294 L730 284" stroke="#151a16" strokeWidth="2" fill="none" />
      {/* 石板地面（往遠方收斂的透視） */}
      <rect x="711" y="330" width="256" height="73" fill="url(#er-floor)" />
      {[334, 340, 348, 360, 378].map(y => (
        <line key={y} x1="711" y1={y} x2="967" y2={y} stroke="#1e221c" strokeWidth="0.7" opacity="0.8" />
      ))}
      {[-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5].map(k => (
        <line key={k} x1={839 + k * 8} y1="330" x2={839 + k * 60} y2="403" stroke="#1e221c" strokeWidth="0.7" opacity="0.7" />
      ))}
      {/* 右邊：倒下的樹幹與木樁 */}
      <path d="M896 338 Q928 320 967 316 L967 325 Q932 330 900 344 Z" fill="#3a2f25" />
      <path d="M918 336 L910 302 M934 334 L943 300 M948 332 L940 306 M958 330 L963 308" stroke="#4d3f2f" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M930 352 Q934 346 936 352 M944 358 Q947 350 951 358 M955 366 Q959 358 962 366" stroke="#4f6b3a" strokeWidth="1" fill="none" />

      {/* 瑪爾基特：駝背、斗篷破爛，左手的金色聖錘、右手拐杖 */}
      <g className="er-boss">
        <path d="M812 372 Q806 340 818 316 Q826 298 846 294 Q872 292 882 312 Q894 336 890 372 L884 366 L879 373 L873 366 L867 373 L861 366 L855 373 L849 366 L843 373 L837 366 L831 373 L825 366 L819 373 Z" fill="#5d4d35" />
        <path d="M866 300 Q884 312 890 372 L884 366 L879 373 L873 366 L867 373 Q870 330 860 304 Z" fill="#43372a" />
        <path d="M814 318 Q840 306 884 316 Q870 328 846 328 Q826 328 814 318 Z" fill="#7a6646" />
        <ellipse cx="838" cy="302" rx="13" ry="10" fill="#6e5c40" />
        <path d="M828 298 Q838 292 848 298 M827 303 Q838 298 849 304" stroke="#4e4130" strokeWidth="1" fill="none" />
        <ellipse cx="836" cy="308" rx="7" ry="4" fill="#1f1a13" />
        <circle cx="833" cy="307.5" r="0.9" fill="#ffd86b" />
        <path d="M884 322 Q894 332 898 344" stroke="#4d3f2b" strokeWidth="5" fill="none" strokeLinecap="round" />
        <line x1="897" y1="342" x2="904" y2="374" stroke="#2e261c" strokeWidth="2.2" strokeLinecap="round" />
        <g className="er-hammer" style={{ transformOrigin: '818px 320px' }}>
          <path d="M818 320 Q804 324 794 334" stroke="#4d3f2b" strokeWidth="6" fill="none" strokeLinecap="round" />
          <line x1="795" y1="335" x2="779" y2="318" stroke="#d9a93a" strokeWidth="2" strokeLinecap="round" />
          <rect x="768" y="309" width="15" height="9" rx="1.5" fill="#f5c542" transform="rotate(-42 775 314)" />
          <circle cx="775" cy="314" r="12" fill="url(#er-burst-glow)" opacity="0.8" />
        </g>
      </g>

      {/* 聖錘砸地炸開的金色光點 */}
      <g className="er-burst" style={{ transformOrigin: '782px 336px' }}>
        <circle cx="782" cy="336" r="26" fill="url(#er-burst-glow)" />
        {BURST_DOTS.map(([x, y, r], i) => (
          <circle key={i} cx={x} cy={y} r={r} fill="#ffe08a" />
        ))}
      </g>

      {/* 王倒下時化成金色光點散去 */}
      <g className="er-dust">
        {DUST_DOTS.map(([x, y, d], i) => (
          <circle key={i} cx={x} cy={y} r="0.9" fill="#ffe08a" className="er-dust-dot" style={{ animationDelay: `${d}s` }} />
        ))}
      </g>

      {/* 褪色者（背影）：翻滾閃避、往前砍 */}
      <g className="er-player">
        <path d="M818 403 L822 362 Q836 354 850 362 L856 403 Z" fill="#1c2233" />
        <path d="M822 370 L850 370 L853 403 L819 403 Z" fill="#2c3d63" />
        <path d="M826 372 L846 372 M836 372 L836 403" stroke="#b8963e" strokeWidth="0.8" />
        <path d="M815 364 Q836 348 857 364 L855 373 L817 373 Z" fill="#7d838c" />
        <path d="M818 364 Q836 352 854 364" stroke="#aab0b8" strokeWidth="1" fill="none" />
        <path d="M810 366 L822 366 L821 380 L816 388 L811 380 Z" fill="#5b616b" stroke="#8d939c" strokeWidth="0.8" />
        <ellipse cx="836" cy="350" rx="6.5" ry="7" fill="#9aa1ab" />
        <path d="M836 343 L836 357" stroke="#c7ccd3" strokeWidth="1.2" />
        <g className="er-sword" style={{ transformOrigin: '857px 371px' }}>
          <line x1="857" y1="371" x2="872" y2="396" stroke="#d8dbe0" strokeWidth="1.7" strokeLinecap="round" />
          <line x1="854" y1="374" x2="861" y2="369" stroke="#6b5a3a" strokeWidth="1.6" />
        </g>
      </g>
      {/* 斬擊閃光 */}
      <path d="M826 318 Q846 330 852 352" fill="none" stroke="#fff4d6" strokeWidth="2.4" strokeLinecap="round" className="er-slash" />
    </g>

    {/* HUD：左上頭像格與 HP / FP / 精力 */}
    <rect x="715" y="269" width="11" height="11" fill="#141414" stroke="#5c5444" strokeWidth="0.7" />
    <rect x="729" y="270" width="72" height="2.4" fill="#2a0e0e" />
    <rect x="729" y="270" width="68" height="2.4" fill="#b3261e" />
    <rect x="729" y="274" width="62" height="2" fill="#18233a" />
    <rect x="729" y="274" width="58" height="2" fill="#6f8fb8" />
    <rect x="729" y="277.5" width="46" height="2" fill="#132413" />
    <rect x="729" y="277.5" width="46" height="2" fill="#3f9b3f" className="er-stamina" />
    {/* 左下：盾、劍、紅露滴聖杯瓶 */}
    <rect x="716" y="372" width="9" height="13" fill="#141414" stroke="#5c5444" strokeWidth="0.6" />
    <path d="M718 375 L723 375 L722.5 381 L720.5 383 L718.5 381 Z" fill="#9aa1ab" />
    <rect x="738" y="372" width="9" height="13" fill="#141414" stroke="#5c5444" strokeWidth="0.6" />
    <line x1="740" y1="383" x2="745" y2="374" stroke="#c9ccd1" strokeWidth="0.9" />
    <rect x="727" y="382" width="9" height="10" fill="#141414" stroke="#5c5444" strokeWidth="0.6" />
    <circle cx="731.5" cy="387.5" r="2.6" fill="#c0392b" />
    <text x="716" y="399" fontSize="3.4" fill="#e8dcc0">紅露滴聖杯瓶</text>
    {/* 右下：盧恩 */}
    <rect x="934" y="393" width="30" height="6" fill="#141414" opacity="0.8" />
    <text x="961" y="397.8" fontSize="3.8" fill="#e8dcc0" textAnchor="end" className="er-runes-0">0</text>
    <text x="961" y="397.8" fontSize="3.8" fill="#e8dcc0" textAnchor="end" className="er-runes-won">12,000</text>

    {/* 王的名字、血條與傷害數字 */}
    <g className="er-boss-ui">
      <text x="772" y="385" fontSize="4.2" fill="#e8dcc0">「惡兆」瑪爾基特</text>
      <rect x="772" y="387" width="134" height="2.4" fill="#2a0e0e" stroke="#4a3f30" strokeWidth="0.3" />
      <rect x="772" y="387" width="134" height="2.4" fill="#a8211a" className="er-boss-hp" />
      <text x="906" y="385" fontSize="3.8" fill="#e8dcc0" textAnchor="end" className="er-dmg er-dmg-1">418</text>
      <text x="906" y="385" fontSize="3.8" fill="#e8dcc0" textAnchor="end" className="er-dmg er-dmg-2">436</text>
      <text x="906" y="385" fontSize="3.8" fill="#e8dcc0" textAnchor="end" className="er-dmg er-dmg-3">521</text>
    </g>

    {/* ENEMY FELLED */}
    <g className="er-felled">
      <rect x="711" y="321" width="256" height="24" fill="url(#er-band)" />
      <text x="839" y="337.5" fontSize="12.5" fill="#e6c87a" textAnchor="middle" fontFamily="Georgia, 'Times New Roman', serif" letterSpacing="1.5" filter="url(#g-neon)">ENEMY FELLED</text>
    </g>
  </g>
);

// 窗戶（座標 364–530 × 78–229）：暗色是夜晚、亮色是白天，切換時播放黃昏 / 清晨
export const WindowArt = ({ skyTransition, onSkyTransitionEnd }) => (
  <g className="room-window">
    <clipPath id="g-window-clip">
      <rect x="372" y="78" width="150" height="144" />
    </clipPath>
    <mask id="g-moon-mask">
      <circle cx="482" cy="124" r="13" fill="#fff" />
      <circle cx="488" cy="119" r="11" fill="#000" />
    </mask>
    <g clipPath="url(#g-window-clip)">
      <rect x="372" y="78" width="150" height="144" fill="url(#g-sky-night)" />
      <g className="room-day">
        <rect x="372" y="78" width="150" height="144" fill="url(#g-sky-day)" />
      </g>
      {skyTransition && (
        <rect
          key={skyTransition.id}
          x="372"
          y="78"
          width="150"
          height="144"
          fill={`url(#g-sky-${skyTransition.type})`}
          className="sky-transition"
          onAnimationEnd={onSkyTransitionEnd}
        />
      )}
      <g className="room-night">
        {[[392, 98], [430, 92], [470, 112], [505, 96], [452, 140], [398, 150], [500, 160]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="1.2" fill="#f4f4f6" className="blink-slow" style={{ animationDelay: `${i * 0.4}s` }} />
        ))}
      </g>
      <g className="room-moon">
        <circle cx="482" cy="124" r="13" fill="#f3efd8" mask="url(#g-moon-mask)" />
      </g>
      <g className="room-sun">
        <circle cx="410" cy="112" r="20" fill="#fff6c9" opacity="0.35" />
        <circle cx="410" cy="112" r="14" fill="#fff6c9" />
      </g>
      <g className="room-day">
        <ellipse cx="470" cy="150" rx="26" ry="8" fill="#ffffff" opacity="0.9" />
        <ellipse cx="452" cy="146" rx="14" ry="8" fill="#ffffff" opacity="0.9" />
        <ellipse cx="420" cy="182" rx="22" ry="6" fill="#ffffff" opacity="0.75" />
      </g>
      <path d="M372 186 L400 172 L428 182 L462 166 L498 180 L522 170 L522 222 L372 222 Z" fill="#1a1c26" className="room-skyline" />
    </g>
    <rect x="372" y="78" width="150" height="144" rx="3" fill="none" stroke="#2a2a38" strokeWidth="6" className="room-window-frame" />
    <line x1="447" y1="78" x2="447" y2="222" stroke="#2a2a38" strokeWidth="4" className="room-window-frame" />
    <line x1="372" y1="150" x2="522" y2="150" stroke="#2a2a38" strokeWidth="4" className="room-window-frame" />
    <rect x="364" y="222" width="166" height="7" fill="#2a2a38" className="room-window-sill" />
  </g>
);

// ROG Xbox Ally X 正面（座標 55–175 × 120–166）
export const AllyArt = () => (
  <g>
    <rect x="58" y="120" width="114" height="42" rx="13" fill="#141418" />
    <ellipse cx="68" cy="150" rx="13" ry="16" fill="#141418" />
    <ellipse cx="162" cy="150" rx="13" ry="16" fill="#141418" />
    <rect x="84" y="125" width="62" height="33" rx="2" fill="url(#g-xbox-ui)" />
    <rect x="89" y="130" width="18" height="10" rx="1" fill="#22c55e" opacity="0.7" />
    <rect x="110" y="130" width="12" height="10" rx="1" fill="#f4f4f6" opacity="0.5" />
    <rect x="125" y="130" width="16" height="10" rx="1" fill="#f4f4f6" opacity="0.35" />
    <rect x="89" y="144" width="52" height="3" rx="1" fill="#f4f4f6" opacity="0.4" />
    <circle cx="70" cy="132" r="5.5" fill="#0a0a0d" stroke="#3a3a44" strokeWidth="1.5" />
    <path d="M66 150 h8 M70 146 v8" stroke="#3a3a44" strokeWidth="2.5" />
    <circle cx="76" cy="124" r="3" fill="#e5e7eb" />
    <circle cx="162" cy="129" r="2" fill="#facc15" />
    <circle cx="157" cy="133" r="2" fill="#3b82f6" />
    <circle cx="167" cy="133" r="2" fill="#ef4444" />
    <circle cx="162" cy="137" r="2" fill="#22c55e" />
    <circle cx="158" cy="150" r="5.5" fill="#0a0a0d" stroke="#3a3a44" strokeWidth="1.5" />
  </g>
);

// Nintendo Switch 2 正面（座標 188–304 × 122–162）
export const Switch2Art = () => (
  <g>
    <rect x="188" y="122" width="22" height="40" rx="9" fill="#1b1b20" />
    <rect x="206" y="124" width="3" height="36" fill="#38bdf8" />
    <rect x="282" y="122" width="22" height="40" rx="9" fill="#1b1b20" />
    <rect x="283" y="124" width="3" height="36" fill="#f43f5e" />
    <rect x="209" y="122" width="74" height="40" fill="#101014" />
    <rect x="212" y="125" width="68" height="34" rx="1" fill="#1a1a22" />
    {[0, 1, 2, 3].map(i => (
      <rect key={i} x={216 + i * 16} y="134" width="13" height="13" rx="2" fill={['#ef4444', '#f4f4f6', '#3b82f6', '#22c55e'][i]} opacity="0.75" />
    ))}
    <circle cx="198" cy="132" r="4.5" fill="#0a0a0d" stroke="#38bdf8" strokeWidth="1" />
    <circle cx="294" cy="151" r="4.5" fill="#0a0a0d" stroke="#f43f5e" strokeWidth="1" />
    {[[198, 148], [198, 154], [195, 151], [201, 151]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="1.4" fill="#4a4a55" />)}
    {[[294, 129], [294, 136], [290, 132.5], [298, 132.5]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="1.4" fill="#4a4a55" />)}
  </g>
);

// MacBook Air M1 螢幕（座標 62–198 × 198–282）
export const MacbookScreenArt = () => (
  <g>
    <rect x="62" y="198" width="136" height="84" rx="5" fill="#16161a" stroke="#c4c7cc" strokeWidth="2" />
    <rect x="67" y="203" width="126" height="72" fill="url(#g-bigsur)" />
    <path d="M67 252 Q100 236 130 252 T193 246 L193 275 L67 275 Z" fill="#1e1b4b" opacity="0.45" />
    <rect x="67" y="203" width="126" height="5" fill="#000" opacity="0.35" />
    <text x="130" y="280.5" textAnchor="middle" fontSize="3.6" fill="#8a8d93">MacBook Air</text>
  </g>
);

// iPad Air M2（座標 226–318 × 206–270）
export const IpadArt = () => (
  <g>
    <rect x="226" y="206" width="92" height="64" rx="6" fill="#2c2e35" />
    <rect x="230" y="210" width="84" height="56" rx="3" fill="url(#g-ipad)" />
    <circle cx="272" cy="208" r="1.1" fill="#0a0a0d" />
    {[0, 1, 2, 3].map(i => (
      <rect key={i} x={240 + i * 18} y="222" width="11" height="11" rx="3" fill="#f4f4f6" opacity="0.6" />
    ))}
    <rect x="250" y="252" width="44" height="8" rx="4" fill="#f4f4f6" opacity="0.25" />
  </g>
);

// Galaxy S25 Ultra 背面（座標 452–482 × 398–460）
export const PhoneBackArt = () => (
  <g>
    <rect x="452" y="398" width="30" height="62" rx="3.6" fill="#c3cee1" stroke="#aab6c8" strokeWidth="1" />
    <rect x="453.5" y="399.5" width="27" height="59" rx="2.8" fill="none" stroke="#dde4ef" strokeWidth="0.4" opacity="0.8" />
    {[406.6, 414.4, 422.2].map(cy => (
      <g key={cy}>
        <circle cx="459.6" cy={cy} r="3.6" fill="#0c0d10" stroke="#b8c2d0" strokeWidth="0.45" />
        <circle cx="459.6" cy={cy} r="2.5" fill="#181b23" stroke="#2c303a" strokeWidth="0.4" />
        <circle cx="459.6" cy={cy} r="1.6" fill="#1b2a45" />
        <circle cx="459" cy={cy - 0.6} r="0.45" fill="#8fb3ff" opacity="0.7" />
      </g>
    ))}
    {[407.5, 415.6].map(cy => (
      <g key={cy}>
        <circle cx="467" cy={cy} r="2.1" fill="#0c0d10" stroke="#9aa5b5" strokeWidth="0.3" />
        <circle cx="467" cy={cy} r="1.1" fill="#1b2232" />
      </g>
    ))}
    <circle cx="466.6" cy="411.6" r="0.85" fill="#f1e2b4" />
    <text x="467" y="443" textAnchor="middle" fontSize="2.6" fill="#7e8796" letterSpacing="0.3" fontFamily="Arial, Helvetica, sans-serif" fontWeight="700">SAMSUNG</text>
  </g>
);

// 主機側透玻璃（座標 1010–1150 × 272–468）
export const PcSideArt = () => (
  <g>
    <rect x="1010" y="272" width="140" height="196" rx="6" fill="#101016" stroke="#2c2c38" strokeWidth="2" />
    <rect x="1018" y="280" width="124" height="180" rx="3" fill="#07070c" />
    {/* 主機板 */}
    <rect x="1058" y="288" width="78" height="118" fill="#14141c" />
    {/* RAM */}
    <rect x="1118" y="296" width="4" height="36" fill="#22222c" />
    <rect x="1124" y="296" width="4" height="36" fill="#22222c" />
    <rect x="1118" y="296" width="10" height="3" fill="#ff1f8f" className="rgb-cycle" />
    {/* CPU 塔扇 */}
    <rect x="1084" y="298" width="26" height="46" fill="#2a2a33" />
    {[0, 1, 2, 3, 4, 5, 6].map(i => <line key={i} x1="1084" y1={302 + i * 6} x2="1110" y2={302 + i * 6} stroke="#3c3c47" strokeWidth="1" />)}
    <g className="fan-spin" style={{ transformOrigin: '1078px 321px' }}>
      <circle cx="1078" cy="321" r="13" fill="#0e0e14" stroke="#00e5ff" strokeWidth="1.5" className="rgb-ring" />
      {[0, 72, 144, 216, 288].map(a => (
        <path key={a} d="M1078 321 q4 -6 1 -11" stroke="#3a3a46" strokeWidth="4" fill="none" transform={`rotate(${a} 1078 321)`} />
      ))}
    </g>
    {/* 前方進風扇 */}
    {[300, 334, 368].map(cy => (
      <g key={cy} className="fan-spin" style={{ transformOrigin: `1032px ${cy}px` }}>
        <circle cx="1032" cy={cy} r="13" fill="#0e0e14" stroke="#ff1f8f" strokeWidth="2" className="rgb-ring" />
        {[0, 90, 180, 270].map(a => (
          <path key={a} d={`M1032 ${cy} q5 -5 2 -11`} stroke="#33333e" strokeWidth="4" fill="none" transform={`rotate(${a} 1032 ${cy})`} />
        ))}
      </g>
    ))}
    {/* RTX 4070 SUPER */}
    <rect x="1022" y="380" width="116" height="26" rx="3" fill="#1d1d22" stroke="#4b4b55" strokeWidth="1" />
    <rect x="1022" y="380" width="116" height="3" fill="#2f2f36" />
    <text x="1080" y="396" textAnchor="middle" fontSize="7.5" fontWeight="700" fill="#f4f4f6" className="gpu-logo">GEFORCE RTX</text>
    <rect x="1022" y="403" width="116" height="1.5" fill="#76b900" />
    {/* 電源倉 */}
    <rect x="1018" y="420" width="124" height="40" fill="#111118" />
    <rect x="1018" y="420" width="124" height="2" fill="url(#g-led)" className="led-strip" />
    <rect x="1018" y="280" width="124" height="180" rx="3" fill="url(#g-glass)" />
    <circle cx="1140" cy="276" r="2" fill="#00e5ff" className="blink-slow" />
  </g>
);
