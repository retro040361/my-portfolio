import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { Selection } from '@react-three/postprocessing';
import * as THREE from 'three';
import { gear } from '../data/playground';
import Scene from './Scene';

// three.js 版的電競房間：霧面黏土質感的等角微縮場景
// 由 Playground 延遲載入（只有打開 Setup 分頁才下載 3D 函式庫）

const gearByKey = Object.fromEntries(gear.map(item => [item.key, item]));

// 追蹤網站主題；changedAt 用來播放窗外的黃昏 / 清晨與日月升落（頁面剛載入時不播）
const useTheme = () => {
  const read = () => document.documentElement.getAttribute('data-theme') === 'light';
  const [theme, setTheme] = useState(() => ({ isLight: read(), changedAt: null }));
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const isLight = read();
      setTheme(prev => (prev.isLight === isLight ? prev : { isLight, changedAt: performance.now() }));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);
  return theme;
};

// 手機或觸控裝置：降低畫質、關掉拖曳旋轉（避免擋住頁面捲動）
const isLowPower = () =>
  window.matchMedia?.('(pointer: coarse)').matches || window.innerWidth < 700;

// 效能：用 demand 模式自己控制幀率——閒置 30fps、滑鼠在畫面上動時 60fps、看不到就完全停下
const FrameDriver = ({ fps, running }) => {
  const { invalidate } = useThree();
  useEffect(() => {
    if (!running) return undefined;
    let raf;
    let last = 0;
    const loop = (now) => {
      raf = requestAnimationFrame(loop);
      if (now - last >= 1000 / fps - 2) {
        last = now;
        invalidate();
      }
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [fps, running, invalidate]);
  return null;
};

const GearRoom3D = () => {
  const [active, setActive] = useState(null);
  const theme = useTheme();
  const [lowPower] = useState(isLowPower);
  const info = active ? gearByKey[active] : null;

  // 解析度：最高 1.5 倍；掉幀時自動往下調，順了再調回來
  const maxDpr = lowPower ? 1.25 : 1.5;
  const [dpr, setDpr] = useState(maxDpr);
  const onPerformance = useCallback((dir) => {
    setDpr(d => Math.min(maxDpr, Math.max(1, d + dir * 0.25)));
  }, [maxDpr]);

  // shader 編譯好才開始畫，並淡入
  const [ready, setReady] = useState(false);
  const onReady = useCallback(() => setReady(true), []);

  // 畫面捲出視窗外就停止繪製
  const stageRef = useRef(null);
  const [inView, setInView] = useState(true);
  useEffect(() => {
    const el = stageRef.current;
    if (!el || !window.IntersectionObserver) return undefined;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { rootMargin: '100px' });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // 滑鼠在畫面上移動的 1.5 秒內用 60fps，其餘時間 30fps
  const [interactive, setInteractive] = useState(false);
  const idleTimer = useRef(null);
  const markInteractive = () => {
    setInteractive(true);
    clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => setInteractive(false), 1500);
  };
  useEffect(() => () => clearTimeout(idleTimer.current), []);

  const tooltip = info && (
    <div className="gear-tooltip gear-tooltip-3d" role="status">
      <span className="gear-tooltip-category">{`// ${info.category}`}</span>
      <strong className="gear-tooltip-name">{info.name}</strong>
      {info.specs.map(spec => (
        <span key={spec} className="gear-tooltip-spec">{spec}</span>
      ))}
    </div>
  );

  return (
    <div className="gear-room">
      <div
        ref={stageRef}
        className={`gear-stage gear-stage-3d ${ready ? 'is-ready' : ''}`}
        onPointerLeave={() => setActive(null)}
        onPointerMove={markInteractive}
        onPointerDown={markInteractive}
      >
        {!ready && <div className="gear-stage-loading">$ compiling shaders…</div>}
        <Canvas
          shadows
          frameloop="demand"
          dpr={dpr}
          gl={{ antialias: false, powerPreference: 'high-performance' }}
          onCreated={({ gl }) => { gl.toneMapping = THREE.NoToneMapping; }}
          onPointerMissed={() => setActive(null)}
          aria-label="Retro 的電競房間與設備（3D）"
        >
          <FrameDriver fps={interactive ? 60 : 30} running={ready && inView} />
          <Selection>
            <Scene
              active={active}
              setActive={setActive}
              theme={theme}
              lowPower={lowPower}
              tooltip={tooltip}
              onReady={onReady}
              onPerformance={onPerformance}
            />
          </Selection>
        </Canvas>
        {!lowPower && <span className="gear-hint">drag to rotate · hover to inspect</span>}
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

export default GearRoom3D;
