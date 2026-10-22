import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { useGrainTexture, useStaticTexture, useAnimatedTexture, useLabelTexture } from './textures';
import { drawAllyScreen, drawMacScreen, drawIpadScreen } from './screens';

// 共用零件：霧面黏土材質的圓角方塊、自發光材質、RGB 燈條
// 座標單位是公尺；房間 x 沿右牆、z 沿左牆、y 朝上，原點在地板最裡面的牆角

// 霧面黏土：粗糙、不反光，加一點雜訊凹凸
export const Clay = ({ color, rough = 0.9, map = null, sheen = false }) => {
  const grain = useGrainTexture();
  if (sheen) {
    return <meshPhysicalMaterial color={color} roughness={1} metalness={0} sheen={0.6} sheenRoughness={0.8} sheenColor="#ffffff" bumpMap={grain} bumpScale={0.8} map={map} />;
  }
  return <meshStandardMaterial color={color} roughness={rough} metalness={0} bumpMap={grain} bumpScale={0.5} map={map} />;
};

// 圓角方塊：p 是中心點、s 是尺寸
export const Box = ({ p, s, c, r = 0.02, rot, rough, map, sheen, cast = true, receive = true, children }) => (
  <RoundedBox
    args={s}
    radius={Math.min(r, ...s.map(v => v / 2 - 0.0005))}
    smoothness={3}
    position={p}
    rotation={rot}
    castShadow={cast}
    receiveShadow={receive}
  >
    {children || <Clay color={c} rough={rough} map={map} sheen={sheen} />}
  </RoundedBox>
);

// 自發光（螢幕、霓虹、LED）：不受光影響，亮度超過 1 會被 bloom 抓到發光
export const Glow = ({ color, strength = 2, map = null, transparent = false }) => {
  const c = useMemo(() => new THREE.Color(color).multiplyScalar(strength), [color, strength]);
  return <meshBasicMaterial color={c} map={map} toneMapped={false} transparent={transparent} />;
};

// 平面（貼圖用）；rot 決定面向
export const Panel = ({ p, size, rot = [0, 0, 0], children }) => (
  <mesh position={p} rotation={rot}>
    <planeGeometry args={size} />
    {children}
  </mesh>
);

// RGB 燈條：從 from 到 to 切成很多小段，顏色沿著 colors 漸變
export const LedStrip = ({ from, to, colors = ['#ff1f8f', '#7c3aed', '#00e5ff'], segments = 16, thickness = 0.025, strength = 3 }) => {
  const parts = useMemo(() => {
    const a = new THREE.Vector3(...from);
    const b = new THREE.Vector3(...to);
    const palette = colors.map(c => new THREE.Color(c));
    const len = a.distanceTo(b) / segments;
    const dir = b.clone().sub(a).normalize();
    return Array.from({ length: segments }, (_, i) => {
      const t = (i + 0.5) / segments;
      const pos = a.clone().lerp(b, t);
      const seg = t * (palette.length - 1);
      const k = Math.min(palette.length - 2, Math.floor(seg));
      const col = palette[k].clone().lerp(palette[k + 1], seg - k).multiplyScalar(strength);
      const size = [
        Math.abs(dir.x) > 0.5 ? len : thickness,
        Math.abs(dir.y) > 0.5 ? len : thickness,
        Math.abs(dir.z) > 0.5 ? len : thickness,
      ];
      return { pos: pos.toArray(), size, col };
    });
  }, [from, to, colors, segments, thickness, strength]);
  return (
    <group>
      {parts.map((part, i) => (
        <mesh key={i} position={part.pos}>
          <boxGeometry args={part.size} />
          <meshBasicMaterial color={part.col} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
};

// RGB 會變色的燈（主機風扇、鍵盤底光）
export const RgbGlow = ({ children, speed = 0.15, offset = 0 }) => {
  const ref = useRef();
  useFrame((state) => {
    if (!ref.current) return;
    const h = (state.clock.elapsedTime * speed + offset) % 1;
    ref.current.color.setHSL(h, 1, 0.55).multiplyScalar(3);
  });
  return (
    <mesh>
      {children}
      <meshBasicMaterial ref={ref} toneMapped={false} />
    </mesh>
  );
};

// ---------- 設備 ----------

// Xbox 手把（俯視方向擺放，寬度沿 z）
export const XboxController = (props) => (
  <group {...props}>
    <Box p={[0, 0, 0]} s={[0.07, 0.03, 0.13]} c="#1b1d22" r={0.012} />
    <mesh position={[0.035, -0.002, -0.05]} scale={[1, 0.6, 1]} castShadow>
      <sphereGeometry args={[0.032, 16, 12]} />
      <Clay color="#1b1d22" />
    </mesh>
    <mesh position={[0.035, -0.002, 0.05]} scale={[1, 0.6, 1]} castShadow>
      <sphereGeometry args={[0.032, 16, 12]} />
      <Clay color="#1b1d22" />
    </mesh>
    {[[-0.012, -0.035], [0.012, 0.022]].map(([x, z], i) => (
      <mesh key={i} position={[x, 0.02, z]}>
        <cylinderGeometry args={[0.009, 0.009, 0.012, 12]} />
        <Clay color="#0b0c0f" />
      </mesh>
    ))}
    {[['#facc15', -0.018, 0.045], ['#3b82f6', -0.008, 0.035], ['#ef4444', -0.008, 0.055], ['#22c55e', 0.002, 0.045]].map(([c, x, z]) => (
      <mesh key={c} position={[x, 0.017, z]}>
        <sphereGeometry args={[0.0045, 8, 6]} />
        <meshStandardMaterial color={c} roughness={0.5} />
      </mesh>
    ))}
    <mesh position={[-0.026, 0.017, 0]}>
      <sphereGeometry args={[0.007, 10, 8]} />
      <Glow color="#e5e7eb" strength={1.6} />
    </mesh>
  </group>
);

// Galaxy S25 Ultra 鈦藍，背面朝上平放（長邊沿 z，鏡頭在 -z 端靠 -x）
export const Phone = (props) => {
  const big = [-0.07, -0.042, -0.014];
  return (
    <group {...props}>
      <Box p={[0, 0, 0]} s={[0.1, 0.012, 0.21]} c="#c3cee1" r={0.008} rough={0.55} />
      {big.map(z => (
        <group key={z} position={[-0.026, 0.007, z]}>
          <mesh><cylinderGeometry args={[0.0135, 0.0135, 0.004, 24]} /><meshStandardMaterial color="#0c0d10" roughness={0.35} /></mesh>
          <mesh position={[0, 0.0022, 0]}><cylinderGeometry args={[0.0085, 0.0085, 0.001, 20]} /><meshStandardMaterial color="#1b2a45" roughness={0.1} metalness={0.4} /></mesh>
        </group>
      ))}
      {[-0.067, -0.039].map(z => (
        <mesh key={z} position={[0.006, 0.007, z]}><cylinderGeometry args={[0.008, 0.008, 0.004, 20]} /><meshStandardMaterial color="#0c0d10" roughness={0.35} /></mesh>
      ))}
      <mesh position={[0.006, 0.0065, -0.053]}><cylinderGeometry args={[0.0035, 0.0035, 0.002, 12]} /><meshStandardMaterial color="#f1e2b4" /></mesh>
    </group>
  );
};

// ROG Xbox Ally X（立在架上，面向 +z）
export const AllyX = (props) => {
  const screen = useStaticTexture(256, 140, drawAllyScreen);
  return (
    <group {...props}>
      <Box p={[0, 0, 0]} s={[0.27, 0.115, 0.03]} c="#16161a" r={0.03} />
      <mesh position={[-0.105, -0.045, 0]} scale={[1, 1.2, 0.6]} castShadow><sphereGeometry args={[0.042, 16, 12]} /><Clay color="#16161a" /></mesh>
      <mesh position={[0.105, -0.045, 0]} scale={[1, 1.2, 0.6]} castShadow><sphereGeometry args={[0.042, 16, 12]} /><Clay color="#16161a" /></mesh>
      <Panel p={[0, 0.004, 0.016]} size={[0.15, 0.085]}><Glow color="#ffffff" strength={1.2} map={screen} /></Panel>
      {[[-0.105, 0.025], [0.095, -0.02]].map(([x, y], i) => (
        <mesh key={i} position={[x, y, 0.02]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.013, 0.013, 0.012, 14]} /><Clay color="#0a0a0d" /></mesh>
      ))}
      {[['#facc15', 0, 0.012], ['#3b82f6', -0.011, 0], ['#ef4444', 0.011, 0], ['#22c55e', 0, -0.012]].map(([c, x, y]) => (
        <mesh key={c} position={[0.105 + x, 0.028 + y, 0.017]}><sphereGeometry args={[0.005, 8, 6]} /><meshStandardMaterial color={c} roughness={0.5} /></mesh>
      ))}
      <mesh position={[-0.098, 0.05, 0.017]}><sphereGeometry args={[0.006, 10, 8]} /><Glow color="#e5e7eb" strength={1.8} /></mesh>
    </group>
  );
};

// Nintendo Switch 2（立在架上，面向 +z）：黑色 Joy-Con 內側有藍 / 紅色的滑軌；畫面輸出到電視，本體螢幕關著
export const Switch2 = (props) => {
  return (
    <group {...props}>
      <Box p={[0, 0, 0]} s={[0.2, 0.115, 0.016]} c="#101014" r={0.006} />
      {/* 插在底座上輸出到電視，本體螢幕是關的 */}
      <Panel p={[0, 0, 0.0085]} size={[0.188, 0.104]}><meshStandardMaterial color="#0b0b0e" roughness={0.18} metalness={0.1} /></Panel>
      {[[-1, '#38bdf8'], [1, '#f43f5e']].map(([side, accent]) => (
        <group key={side} position={[side * 0.123, 0, 0]}>
          <Box p={[0, 0, 0]} s={[0.046, 0.115, 0.022]} c="#1b1b20" r={0.018} />
          <mesh position={[-side * 0.022, 0, 0.004]}><boxGeometry args={[0.004, 0.1, 0.018]} /><Glow color={accent} strength={1.6} /></mesh>
          <mesh position={[0, side < 0 ? 0.025 : -0.022, 0.013]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.011, 0.011, 0.01, 14]} /><Clay color="#0a0a0d" /></mesh>
        </group>
      ))}
    </group>
  );
};

// Edifier M90 黑色桌上型喇叭（面向 +z）：圓角黑色箱體，正面上方高音、下方中低音單體，底部 EDIFIER 字樣
// 外型是依 Edifier 小型桌上喇叭的常見樣子做的近似模型
export const EdifierSpeaker = (props) => {
  const logo = useLabelTexture('EDIFIER', { w: 256, h: 48, color: '#8a8a92', font: '700 30px Arial, sans-serif' });
  return (
    <group {...props}>
      <Box p={[0, 0, 0]} s={[0.11, 0.2, 0.14]} c="#17171b" r={0.014} rough={0.55} cast={false} />
      <Box p={[0, 0.005, 0.068]} s={[0.098, 0.18, 0.006]} c="#0e0e11" r={0.006} rough={0.75} cast={false} />
      {/* 高音單體 */}
      <mesh position={[0, 0.052, 0.0715]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.017, 0.017, 0.003, 28]} />
        <meshStandardMaterial color="#3a3a42" roughness={0.35} metalness={0.5} />
      </mesh>
      <mesh position={[0, 0.052, 0.072]} scale={[1, 1, 0.45]}>
        <sphereGeometry args={[0.009, 16, 12]} />
        <meshStandardMaterial color="#1c1c22" roughness={0.3} />
      </mesh>
      {/* 中低音單體：金屬外圈＋凹進去的振膜＋防塵蓋 */}
      <mesh position={[0, -0.025, 0.0715]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.037, 0.004, 10, 40]} />
        <meshStandardMaterial color="#4a4a52" roughness={0.3} metalness={0.6} />
      </mesh>
      <mesh position={[0, -0.025, 0.065]} rotation={[-Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.034, 0.012, 32, 1, true]} />
        <meshStandardMaterial color="#141418" roughness={0.85} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, -0.025, 0.066]} scale={[1, 1, 0.5]}>
        <sphereGeometry args={[0.011, 16, 12]} />
        <meshStandardMaterial color="#202027" roughness={0.4} />
      </mesh>
      <Panel p={[0, -0.078, 0.0716]} size={[0.05, 0.0094]}>
        <meshBasicMaterial map={logo} transparent />
      </Panel>
    </group>
  );
};

// MacBook Air M1（銀色，螢幕面向 +x）
export const MacBook = (props) => {
  const screen = useStaticTexture(320, 200, drawMacScreen);
  return (
    <group {...props}>
      <Box p={[0, 0.006, 0]} s={[0.21, 0.012, 0.3]} c="#c4c7cc" r={0.006} rough={0.45} />
      {/* 鍵盤靠近轉軸（螢幕那一側），觸控板在前面 */}
      <mesh position={[-0.048, 0.0125, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[0.09, 0.26]} /><meshStandardMaterial color="#1d1d22" roughness={0.7} /></mesh>
      <mesh position={[0.052, 0.0125, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[0.065, 0.12]} /><meshStandardMaterial color="#b4b7bd" roughness={0.35} /></mesh>
      <group position={[-0.105, 0.012, 0]} rotation={[0, 0, 0.22]}>
        <Box p={[-0.003, 0.1, 0]} s={[0.008, 0.2, 0.3]} c="#c4c7cc" r={0.004} rough={0.45} />
        <Panel p={[0.0015, 0.102, 0]} size={[0.28, 0.18]} rot={[0, Math.PI / 2, 0]}><Glow color="#ffffff" strength={1.1} map={screen} /></Panel>
      </group>
    </group>
  );
};

// iPad Air M2（螢幕朝上平放）
export const IPad = (props) => {
  // 主畫面的時鐘小工具與狀態列顯示目前時間，每秒更新一次
  const screen = useAnimatedTexture(1000, 695, drawIpadScreen, 1);
  return (
    <group {...props}>
      <Box p={[0, 0, 0]} s={[0.25, 0.008, 0.18]} c="#2c2e35" r={0.008} rough={0.5} />
      {/* 螢幕平躺朝上，長邊和機身長邊同方向（沿 x） */}
      <Panel p={[0, 0.0045, 0]} size={[0.235, 0.165]} rot={[-Math.PI / 2, 0, 0]}><Glow color="#ffffff" strength={1.1} map={screen} /></Panel>
    </group>
  );
};

// 螢幕（面向 +x 的薄方塊＋發光畫面）
export const Monitor = ({ screenTexture, body = '#0d0d12', width = 0.8, height = 0.46, chin = 0, chinLabel, ...props }) => {
  const label = useLabelTexture(chinLabel || '', { w: 256, h: 48, color: '#cfd0d8', font: '700 30px Arial, sans-serif' });
  return (
    <group {...props}>
      <Box p={[0, 0, 0]} s={[0.03, height, width]} c={body} r={0.008} rough={0.6} />
      <Panel p={[0.0155, chin / 2, 0]} size={[width - 0.024, height - 0.024 - chin]} rot={[0, Math.PI / 2, 0]}>
        <Glow color="#ffffff" strength={1.25} map={screenTexture} />
      </Panel>
      {chinLabel && (
        <Panel p={[0.0156, -height / 2 + 0.015, 0]} size={[0.16, 0.03]} rot={[0, Math.PI / 2, 0]}>
          <meshBasicMaterial map={label} transparent toneMapped={false} />
        </Panel>
      )}
    </group>
  );
};

// 電腦主機側透玻璃內部（會轉的風扇、RGB）
const drawPcInside = (ctx, w, h, t) => {
  ctx.fillStyle = '#07070c'; ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#14141c'; ctx.fillRect(w * 0.34, h * 0.06, w * 0.6, h * 0.6);
  ctx.fillStyle = '#2a2a33'; ctx.fillRect(w * 0.55, h * 0.12, w * 0.18, h * 0.24);
  ctx.fillStyle = `hsl(${(t * 50) % 360}, 90%, 60%)`;
  ctx.fillRect(w * 0.8, h * 0.1, w * 0.03, h * 0.2); ctx.fillRect(w * 0.85, h * 0.1, w * 0.03, h * 0.2);
  const fan = (cx, cy, r, hue) => {
    ctx.strokeStyle = `hsl(${hue % 360}, 95%, 60%)`;
    ctx.lineWidth = r * 0.22;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = '#33333e';
    for (let k = 0; k < 5; k++) {
      const a = t * 9 + (k * Math.PI * 2) / 5;
      ctx.beginPath(); ctx.ellipse(cx + Math.cos(a) * r * 0.45, cy + Math.sin(a) * r * 0.45, r * 0.42, r * 0.16, a, 0, Math.PI * 2); ctx.fill();
    }
  };
  [0.16, 0.38, 0.6].forEach(y => fan(w * 0.15, h * y, w * 0.11, t * 50 + y * 300));
  fan(w * 0.5, h * 0.24, w * 0.1, t * 50 + 180);
  ctx.fillStyle = '#1d1d22'; ctx.fillRect(w * 0.3, h * 0.66, w * 0.64, h * 0.1);
  ctx.fillStyle = '#76b900'; ctx.fillRect(w * 0.3, h * 0.755, w * 0.64, h * 0.008);
  ctx.fillStyle = '#f4f4f6'; ctx.font = `700 ${h * 0.045}px Arial, sans-serif`; ctx.textAlign = 'center';
  ctx.fillText('GEFORCE RTX', w * 0.62, h * 0.725);
  ctx.fillStyle = '#111118'; ctx.fillRect(w * 0.04, h * 0.82, w * 0.92, h * 0.16);
  ctx.fillStyle = `hsl(${(t * 50 + 120) % 360}, 90%, 60%)`; ctx.fillRect(w * 0.04, h * 0.82, w * 0.92, h * 0.012);
};

export const PcTower = (props) => {
  const inside = useAnimatedTexture(256, 360, drawPcInside, 20);
  return (
    <group {...props}>
      <Box p={[0, 0, 0]} s={[0.5, 0.72, 0.24]} c="#15151b" r={0.02} rough={0.6} />
      <Panel p={[0, 0.0, 0.1215]} size={[0.44, 0.64]}><Glow color="#ffffff" strength={1.1} map={inside} /></Panel>
      <mesh position={[0, 0, 0.1225]}>
        <planeGeometry args={[0.44, 0.64]} />
        <meshPhysicalMaterial color="#ffffff" transparent opacity={0.08} roughness={0.05} metalness={0} clearcoat={1} />
      </mesh>
      {[-0.07, 0, 0.07].map(z => (
        <mesh key={z} position={[0.251, 0.02, z]}>
          <boxGeometry args={[0.004, 0.58, 0.012]} />
          <RgbGlowMaterial offset={z} />
        </mesh>
      ))}
    </group>
  );
};

// 會變色的發光材質（掛在既有 mesh 上用）
const RgbGlowMaterial = ({ speed = 0.15, offset = 0 }) => {
  const ref = useRef();
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.color.setHSL((state.clock.elapsedTime * speed + offset + 1) % 1, 1, 0.55).multiplyScalar(3);
  });
  return <meshBasicMaterial ref={ref} toneMapped={false} />;
};

export { RgbGlowMaterial };
