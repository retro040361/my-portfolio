import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';

// 開機文字：快速捲過
const BOOT_LOGS = [
  '[   0.000000] Booting RetroOS kernel on CPU0...',
  '[   0.048201] CPU0: Intel(R) Core(TM) i9-14900K @ 3.20GHz',
  '[   0.124093] Memory: 32768MB system RAM initialized.',
  '[   0.312948] ACPI: Core revision 20260719',
  '[   0.589204] SCSI subsystem initialized.',
  '[   0.720930] usbcore: registered new interface driver usbfs',
  '[   1.020491] Serial: 8250/16550 driver, 4 ports, IRQ sharing enabled',
  '[   1.218943] EXT4-fs (sda1): mounted filesystem with ordered data mode.',
  '[   1.450912] Initializing RetroOS kernel modules...',
  '[   1.680204] Loading network drivers: e1000e [ OK ]',
  '[   1.890938] Checking filesystem disk integrity: 100% [ OK ]',
  '[   2.100912] Mounting local filesystems... [ OK ]',
  '[   2.340129] Starting system services...',
  '[   2.560203] Starting Network Service Manager... [ OK ]',
  '[   2.780912] Starting Synopsys Workstation Service Client... [ OK ]',
  '[   3.020129] Loading graphics display server (Xorg)... [ OK ]',
  '[   3.311874] ctOS uplink: handshake... [ BYPASSED ]',
  '[   3.502117] Injecting DedSec payload... [ OK ]',
  '[   3.774530] Flying to the boundary of the known universe... [ OK ]',
  '[   4.023462] Launching RetroOS...',
];

const LINE_INTERVAL = 45;    // 每行開機文字的間隔 (ms)
const LOGO_DURATION = 2300;  // Logo 動畫停留時間 (ms)
const EXIT_DURATION = 350;   // 故障淡出時間 (ms)

// 噴漆風格的 R 字標誌筆畫（依序畫出）
const GLYPH_STROKES = [
  { d: 'M72 26 L58 238', width: 26 },
  { d: 'M64 34 L170 46 L140 124 L66 132', width: 26 },
  { d: 'M98 130 L186 240', width: 26 },
  { d: 'M58 238 L56 258', width: 7 },   // 噴漆滴落
  { d: 'M186 240 L188 254', width: 6 },
];

const HomeIntro = ({ onComplete }) => {
  const [lines, setLines] = useState([]);
  const [phase, setPhase] = useState('boot'); // 'boot' | 'logo' | 'exit'
  const onCompleteRef = useRef(onComplete);
  const bodyRef = useRef(null);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // 動畫時間軸：開機文字 → Logo → 故障淡出
  useEffect(() => {
    const timers = [];
    BOOT_LOGS.forEach((line, idx) => {
      timers.push(setTimeout(() => setLines(prev => [...prev, line]), idx * LINE_INTERVAL));
    });
    const logoAt = BOOT_LOGS.length * LINE_INTERVAL + 250;
    timers.push(setTimeout(() => setPhase('logo'), logoAt));
    timers.push(setTimeout(() => setPhase('exit'), logoAt + LOGO_DURATION));
    timers.push(setTimeout(() => onCompleteRef.current?.(), logoAt + LOGO_DURATION + EXIT_DURATION));
    return () => timers.forEach(clearTimeout);
  }, []);

  // 開機文字自動捲到底
  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [lines]);

  // 按任意鍵 / 點擊畫面可直接跳過；系統開啟「減少動態效果」時直接略過
  useEffect(() => {
    const skip = (e) => {
      e?.preventDefault(); // 避免空白鍵等按鍵同時捲動頁面
      onCompleteRef.current?.();
    };
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      skip();
      return;
    }
    window.addEventListener('keydown', skip);
    window.addEventListener('pointerdown', skip);
    return () => {
      window.removeEventListener('keydown', skip);
      window.removeEventListener('pointerdown', skip);
    };
  }, []);

  return (
    <div className={`home-intro ${phase === 'exit' ? 'is-exiting' : ''}`} aria-hidden="true">
      {phase === 'boot' ? (
        <div className="intro-boot" ref={bodyRef}>
          {lines.map((line, idx) => (
            <div key={idx} className="intro-boot-line">{line}</div>
          ))}
          <span className="intro-cursor" />
        </div>
      ) : (
        <div className="intro-logo">
          <svg className="intro-glyph" viewBox="0 0 240 270">
            <defs>
              {/* 讓筆畫邊緣粗糙，模擬噴漆 */}
              <filter id="intro-spray">
                <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" result="noise" />
                <feDisplacementMap in="SourceGraphic" in2="noise" scale="7" />
              </filter>
            </defs>
            <g filter="url(#intro-spray)">
              {GLYPH_STROKES.map((stroke, idx) => (
                <motion.path
                  key={stroke.d}
                  d={stroke.d}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={stroke.width}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  // 筆畫開始前先隱藏，避免圓頭端點提早出現成一個點
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.22, delay: idx * 0.16, ease: 'easeOut', opacity: { duration: 0.01, delay: idx * 0.16 } }}
                />
              ))}
              {/* 洋紅色的一道劃痕 */}
              <motion.path
                d="M24 168 L214 96"
                fill="none"
                stroke="var(--intro-accent)"
                strokeWidth="14"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.2, delay: 0.85, ease: 'easeOut', opacity: { duration: 0.01, delay: 0.85 } }}
              />
            </g>
          </svg>

          <div className="intro-bar-wrap">
            <motion.div
              className="intro-bar"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.18, delay: 1.0, ease: 'easeOut' }}
            >
              <motion.span
                className="intro-bar-text glitch"
                data-text="RETRO_OS"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0.3, 1] }}
                transition={{ duration: 0.3, delay: 1.12 }}
              >
                RETRO_OS
              </motion.span>
            </motion.div>
          </div>

          <motion.p
            className="intro-status"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.45 }}
          >
            {'// ACCESS GRANTED'}
          </motion.p>
        </div>
      )}

      <div className="intro-skip-hint">按任意鍵跳過 ▸</div>
    </div>
  );
};

export default HomeIntro;
