import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Canvas 貼圖工具：螢幕畫面、霓虹字、木地板等都用 2D canvas 畫好再貼到 3D 物件上

const createCanvas = (w, h) => {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  return canvas;
};

const toTexture = (canvas) => {
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
};

// 靜態貼圖：畫一次就好
export const useStaticTexture = (w, h, draw, deps = []) => useMemo(() => {
  const canvas = createCanvas(w, h);
  draw(canvas.getContext('2d'), w, h);
  return toTexture(canvas);
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, deps);

// 動態貼圖：每秒重畫 fps 次（螢幕畫面用）
export const useAnimatedTexture = (w, h, draw, fps = 30) => {
  const { canvas, ctx, texture } = useMemo(() => {
    const c = createCanvas(w, h);
    return { canvas: c, ctx: c.getContext('2d'), texture: toTexture(c) };
  }, [w, h]);
  const last = useRef(-1);
  const drawRef = useRef(draw);
  drawRef.current = draw;

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (t - last.current < 1 / fps) return;
    last.current = t;
    drawRef.current(ctx, canvas.width, canvas.height, t);
    texture.needsUpdate = true;
  });
  return texture;
};

// 細微的雜訊，當作黏土表面的凹凸（bump map）
export const useGrainTexture = () => useMemo(() => {
  const size = 256;
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  const img = ctx.createImageData(size, size);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 128 + (Math.random() - 0.5) * 70;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(6, 6);
  return tex;
}, []);

// 木地板：一條一條的木板，帶一點色差與紋路
export const useWoodTexture = () => useStaticTexture(1024, 1024, (ctx, w, h) => {
  const planks = 12;
  const ph = h / planks;
  for (let i = 0; i < planks; i++) {
    const shade = 0.88 + ((i * 37) % 11) / 60;
    ctx.fillStyle = `rgb(${Math.round(176 * shade)}, ${Math.round(132 * shade)}, ${Math.round(96 * shade)})`;
    ctx.fillRect(0, i * ph, w, ph);
    ctx.strokeStyle = 'rgba(60, 38, 22, 0.35)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, i * ph);
    ctx.lineTo(w, i * ph);
    ctx.stroke();
    const seam = ((i * 263) % w);
    ctx.beginPath();
    ctx.moveTo(seam, i * ph);
    ctx.lineTo(seam, (i + 1) * ph);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(70, 45, 25, 0.12)';
    ctx.lineWidth = 1;
    for (let k = 0; k < 6; k++) {
      const y = i * ph + 8 + k * (ph / 6);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.bezierCurveTo(w * 0.3, y + 4, w * 0.6, y - 4, w, y + 2);
      ctx.stroke();
    }
  }
});

// 白橡木（電視櫃）：淺色底＋細細的木紋
export const useOakTexture = () => useStaticTexture(512, 512, (ctx, w, h) => {
  ctx.fillStyle = '#dcc8a6';
  ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 70; i++) {
    const y = (i / 70) * h + Math.sin(i * 7.3) * 4;
    ctx.strokeStyle = `rgba(150, 118, 78, ${0.08 + ((i * 13) % 7) / 60})`;
    ctx.lineWidth = 1 + ((i * 5) % 3) * 0.6;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.bezierCurveTo(w * 0.3, y + Math.sin(i) * 6, w * 0.65, y - Math.cos(i) * 6, w, y + Math.sin(i * 2) * 3);
    ctx.stroke();
  }
  [[0.3, 0.4], [0.75, 0.7]].forEach(([x, y]) => {
    ctx.strokeStyle = 'rgba(140, 105, 65, 0.25)';
    ctx.beginPath(); ctx.ellipse(x * w, y * h, 14, 5, 0, 0, Math.PI * 2); ctx.stroke();
  });
});

// 一般文字標籤（GEFORCE RTX、BenQ 之類）
export const useLabelTexture = (text, { w = 256, h = 64, color = '#f4f4f6', bg = null, font = '700 34px "Chakra Petch", sans-serif' } = {}) =>
  useStaticTexture(w, h, (ctx) => {
    if (bg) {
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);
    }
    ctx.fillStyle = color;
    ctx.font = font;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, w / 2, h / 2);
  }, [text, color, bg]);

// ---------- 關鍵影格插值（把 CSS @keyframes 搬到 JS） ----------
const lerp = (a, b, t) => a + (b - a) * t;

export const keyframe = (keys, pct) => {
  if (pct <= keys[0][0]) return keys[0].slice(1);
  for (let i = 1; i < keys.length; i++) {
    if (pct <= keys[i][0]) {
      const [p0, ...v0] = keys[i - 1];
      const [p1, ...v1] = keys[i];
      const t = p1 === p0 ? 1 : (pct - p0) / (p1 - p0);
      return v0.map((v, k) => lerp(v, v1[k], t));
    }
  }
  return keys[keys.length - 1].slice(1);
};

export const clamp01 = (v) => Math.min(1, Math.max(0, v));
