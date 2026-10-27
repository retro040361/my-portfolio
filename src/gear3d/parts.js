import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { useGrainTexture, useStaticTexture, useAnimatedTexture, useLabelTexture, useOakTexture } from './textures';
import { drawAllyScreen, drawMacScreen, drawIpadScreen, drawGameCover, drawGameSpine } from './screens';

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

// Razer Cobra Pro 黑色無線滑鼠（按鍵朝 -x）：小巧的對稱外殼、滾輪、底部一圈 RGB 底光、綠色 Razer 標誌
export const RazerCobraPro = (props) => (
  <group {...props}>
    {/* 底部 RGB 底光：比外殼大一圈的發光橢圓，從邊緣透出來 */}
    <mesh position={[0, 0.0012, 0]} scale={[0.0615, 1, 0.0322]}>
      <cylinderGeometry args={[1, 1, 0.0018, 48]} />
      <RgbGlowMaterial speed={0.12} />
    </mesh>
    <mesh position={[0, 0.004, 0]} scale={[0.059, 1, 0.0305]} castShadow>
      <cylinderGeometry args={[1, 1, 0.005, 48]} />
      <meshStandardMaterial color="#0d0d10" roughness={0.6} />
    </mesh>
    {/* 外殼：後半部比較高 */}
    <mesh position={[0.004, 0.006, 0]} scale={[0.059, 0.032, 0.0305]} castShadow>
      <sphereGeometry args={[1, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2]} />
      <meshStandardMaterial color="#141418" roughness={0.55} />
    </mesh>
    {/* 左右鍵的分隔線 */}
    <mesh position={[-0.034, 0.0325, 0]} rotation={[0, 0, 0.32]}>
      <boxGeometry args={[0.04, 0.0012, 0.0016]} />
      <meshStandardMaterial color="#050506" roughness={0.8} />
    </mesh>
    {/* 滾輪（帶 RGB） */}
    <mesh position={[-0.03, 0.035, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.0075, 0.0075, 0.006, 20]} />
      <RgbGlowMaterial speed={0.12} offset={0.3} />
    </mesh>
    {/* 綠色 Razer 標誌 */}
    <mesh position={[0.026, 0.0335, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[0.0055, 20]} />
      <Glow color="#44d62c" strength={1.8} />
    </mesh>
  </group>
);

// Galaxy S25 Ultra 鈦藍，背面朝上平放（長邊沿 z，鏡頭在 -z 端靠 -x）
// 一般的無線滑鼠（女生用的白色款）
export const Mouse = ({ color = '#f2f0ec', ...props }) => (
  <group {...props}>
    <mesh position={[0, 0.003, 0]} scale={[0.056, 0.03, 0.032]} castShadow>
      <sphereGeometry args={[1, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
      <meshStandardMaterial color={color} roughness={0.5} />
    </mesh>
    <mesh position={[-0.03, 0.029, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.006, 0.006, 0.005, 16]} />
      <meshStandardMaterial color="#b9b4bd" roughness={0.6} />
    </mesh>
  </group>
);

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

// Switch 2 遊戲盒（紅色）：本身座標是封面朝 +z、側邊在 -x；寬 10.5cm、高 17cm、厚 1.4cm
// cover：有封面圖時才畫封面（封面朝外擺放用），title：側邊直書的遊戲名稱
export const GameCase = ({ cover, title, ...props }) => {
  const spine = useStaticTexture(64, 768, drawGameSpine(title), [title]);
  const coverTex = useStaticTexture(320, 512, cover ? drawGameCover(cover) : () => {}, [cover]);
  return (
    <group {...props}>
      <Box p={[0, 0, 0]} s={[0.105, 0.17, 0.014]} c="#d4000f" r={0.003} rough={0.45} />
      {cover && (
        <Panel p={[0, 0, 0.0072]} size={[0.103, 0.168]}>
          <meshStandardMaterial map={coverTex} roughness={0.35} />
        </Panel>
      )}
      <Panel p={[-0.0528, 0, 0]} size={[0.014, 0.168]} rot={[0, -Math.PI / 2, 0]}>
        <meshStandardMaterial map={spine} roughness={0.4} />
      </Panel>
    </group>
  );
};

// IKEA BLÅHAJ 鯊魚娃娃（約 1 公尺長）：本身座標頭朝 +x，藍色絨布、白肚子、背鰭、胸鰭、月牙形尾巴
const Plush = ({ color, ...props }) => (
  <mesh castShadow receiveShadow {...props}>
    <sphereGeometry args={[1, 28, 20]} />
    <Clay color={color} sheen />
  </mesh>
);

export const Blahaj = (props) => {
  const BLUE = '#3d7f99';
  const WHITE = '#f1efe9';
  return (
    <group {...props}>
      {/* 身體：前段較粗、往尾巴變細 */}
      <Plush color={BLUE} position={[0.08, 0, 0]} scale={[0.36, 0.13, 0.13]} />
      <Plush color={BLUE} position={[-0.28, 0.01, 0]} scale={[0.24, 0.08, 0.08]} />
      {/* 白肚子（從下方露出來） */}
      <Plush color={WHITE} position={[0.12, -0.035, 0]} scale={[0.32, 0.1, 0.118]} />
      {/* 背鰭 */}
      <mesh position={[0.02, 0.17, 0]} rotation={[0, 0, -0.35]} scale={[1, 1, 0.28]} castShadow>
        <coneGeometry args={[0.07, 0.15, 20]} />
        <Clay color={BLUE} sheen />
      </mesh>
      {/* 尾巴前的小背鰭 */}
      <mesh position={[-0.33, 0.085, 0]} rotation={[0, 0, -0.5]} scale={[1, 1, 0.3]} castShadow>
        <coneGeometry args={[0.025, 0.05, 12]} />
        <Clay color={BLUE} sheen />
      </mesh>
      {/* 胸鰭（左右各一） */}
      {[1, -1].map(side => (
        <Plush key={side} color={BLUE} position={[0.08, -0.09, side * 0.12]} rotation={[side * 0.5, 0.3 * side, -0.4]} scale={[0.1, 0.022, 0.06]} />
      ))}
      {/* 月牙形尾鰭 */}
      <Plush color={BLUE} position={[-0.53, 0.08, 0]} rotation={[0, 0, -0.75]} scale={[0.13, 0.035, 0.03]} />
      <Plush color={BLUE} position={[-0.52, -0.04, 0]} rotation={[0, 0, 0.6]} scale={[0.09, 0.03, 0.028]} />
      {/* 眼睛 */}
      {[1, -1].map(side => (
        <mesh key={side} position={[0.33, 0.035, side * 0.085]}>
          <sphereGeometry args={[0.012, 12, 10]} />
          <meshStandardMaterial color="#141418" roughness={0.25} />
        </mesh>
      ))}
      {/* 嘴巴：粉紅色＋一排白牙 */}
      <Plush color="#e98a8a" position={[0.37, -0.045, 0]} scale={[0.04, 0.012, 0.07]} />
      <mesh position={[0.385, -0.038, 0]} scale={[0.03, 0.006, 0.062]}>
        <sphereGeometry args={[1, 16, 10]} />
        <meshStandardMaterial color="#ffffff" roughness={0.6} />
      </mesh>
    </group>
  );
};

// 寶貝球（擺飾）
export const PokeBall = (props) => (
  <group {...props}>
    <mesh castShadow>
      <sphereGeometry args={[0.045, 28, 20, 0, Math.PI * 2, 0, Math.PI / 2]} />
      <meshStandardMaterial color="#e53935" roughness={0.35} />
    </mesh>
    <mesh castShadow rotation={[Math.PI, 0, 0]}>
      <sphereGeometry args={[0.045, 28, 20, 0, Math.PI * 2, 0, Math.PI / 2]} />
      <meshStandardMaterial color="#f5f5f5" roughness={0.35} />
    </mesh>
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[0.045, 0.004, 8, 40]} />
      <meshStandardMaterial color="#1c1c1e" roughness={0.5} />
    </mesh>
    <mesh position={[0, 0, 0.044]} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.012, 0.012, 0.006, 20]} />
      <meshStandardMaterial color="#f5f5f5" roughness={0.3} />
    </mesh>
  </group>
);

// 木製電視櫃（白橡木、三格開放式收納，參考 IKEA BESTÅ 的樣子）
// 中心點在 (cx, 0, cz)：寬 1.36、高 0.34、深 0.3，四角有小腳
export const TvBench = ({ cx = 3.2, cz = 0.16, children }) => {
  const oak = useOakTexture();
  const W = 1.36;
  const H = 0.34;
  const D = 0.3;
  const t = 0.028;
  const left = cx - W / 2;
  const cell = (W - t * 2 - t * 2) / 3;
  const dividers = [left + t + cell + t / 2, left + t + cell * 2 + t * 1.5];
  return (
    <group>
      {/* 頂板、底板、兩側、隔板、背板 */}
      <Box p={[cx, H - t / 2, cz]} s={[W, t, D]} c="#ffffff" map={oak} r={0.006} rough={0.7} />
      <Box p={[cx, 0.03 + t / 2, cz]} s={[W, t, D]} c="#ffffff" map={oak} r={0.006} rough={0.7} />
      {[left + t / 2, cx + W / 2 - t / 2].map(x => (
        <Box key={x} p={[x, (H + 0.03) / 2, cz]} s={[t, H - 0.03, D]} c="#ffffff" map={oak} r={0.006} rough={0.7} />
      ))}
      {dividers.map(x => (
        <Box key={x} p={[x, (H + 0.03) / 2, cz - 0.005]} s={[t * 0.85, H - 0.03 - t * 2, D - 0.01]} c="#ffffff" map={oak} r={0.004} rough={0.7} />
      ))}
      <Box p={[cx, (H + 0.03) / 2, cz - D / 2 + 0.006]} s={[W - 0.01, H - 0.04, 0.008]} c="#e9dcc4" map={oak} r={0.002} rough={0.8} />
      {/* 中間那格背板的走線孔 */}
      <mesh position={[cx, 0.12, cz - D / 2 + 0.0105]}>
        <planeGeometry args={[0.1, 0.03]} />
        <meshStandardMaterial color="#3a2f25" roughness={0.9} />
      </mesh>
      {/* 小腳 */}
      {[[left + 0.05, cz - D / 2 + 0.04], [left + 0.05, cz + D / 2 - 0.04], [left + W - 0.05, cz - D / 2 + 0.04], [left + W - 0.05, cz + D / 2 - 0.04]].map(([x, z]) => (
        <mesh key={`${x}-${z}`} position={[x, 0.015, z]} castShadow>
          <cylinderGeometry args={[0.015, 0.015, 0.03, 12]} />
          <meshStandardMaterial color="#8a7a66" roughness={0.6} />
        </mesh>
      ))}
      {children({ left, cell, t, floorY: 0.03 + t, cz, depth: D })}
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
      {/* 正面黑色玻璃：四周留一圈約 1.5 公分的黑邊框（像實機），外面露出一點機身的金屬邊 */}
      <Box p={[0, 0.0042, 0]} s={[0.242, 0.0012, 0.172]} c="#08080a" r={0.0006} rough={0.25} />
      {/* 螢幕平躺朝上，長邊和機身長邊同方向（沿 x） */}
      <Panel p={[0, 0.0049, 0]} size={[0.212, 0.142]} rot={[-Math.PI / 2, 0, 0]}><Glow color="#ffffff" strength={1.1} map={screen} /></Panel>
    </group>
  );
};

// Canon EOS R10 + RF-S 18-150mm 鏡頭：鏡頭朝 +x，握把在右手邊（+z）
// 機身約 12 × 9 × 6 公分，鏡頭直徑約 7 公分、長約 8.5 公分
export const CanonR10 = (props) => {
  const logo = useLabelTexture('Canon', { w: 256, h: 64, color: '#e8e8ec', font: 'italic 700 44px Georgia, serif' });
  const lensText = useLabelTexture('RF-S 18-150mm', { w: 256, h: 40, color: '#b8bac2', font: '600 24px Arial, sans-serif' });
  const BODY = '#1a1a1d';
  const RUBBER = '#141416';
  return (
    <group {...props}>
      {/* 機身、握把、上方的觀景窗凸起、熱靴 */}
      <Box p={[0, 0.042, 0]} s={[0.05, 0.074, 0.122]} c={BODY} r={0.009} rough={0.55} />
      <Box p={[0.014, 0.04, 0.046]} s={[0.074, 0.078, 0.034]} c={RUBBER} r={0.014} rough={0.85} />
      <Box p={[-0.002, 0.088, -0.008]} s={[0.046, 0.028, 0.048]} c={BODY} r={0.007} rough={0.55} />
      <Box p={[-0.002, 0.104, -0.008]} s={[0.022, 0.004, 0.02]} c="#3a3b40" r={0.001} rough={0.4} />
      {/* 模式轉盤與快門鈕 */}
      <mesh position={[-0.006, 0.084, 0.034]} castShadow>
        <cylinderGeometry args={[0.012, 0.012, 0.008, 20]} />
        <meshStandardMaterial color="#2a2a2e" roughness={0.5} />
      </mesh>
      <mesh position={[0.02, 0.082, 0.05]} castShadow>
        <cylinderGeometry args={[0.006, 0.006, 0.005, 16]} />
        <meshStandardMaterial color="#26262a" roughness={0.4} />
      </mesh>
      {/* Canon 字樣（觀景窗凸起正面） */}
      <Panel p={[0.0215, 0.09, -0.008]} size={[0.036, 0.009]} rot={[0, Math.PI / 2, 0]}>
        <meshBasicMaterial map={logo} transparent toneMapped={false} />
      </Panel>
      {/* 鏡頭：卡口金屬環 → 鏡筒 → 對焦環 / 變焦環（橡膠紋） → 前鏡片 */}
      <group position={[0.025, 0.042, -0.008]} rotation={[0, 0, -Math.PI / 2]}>
        <mesh position={[0, 0.003, 0]}>
          <cylinderGeometry args={[0.029, 0.029, 0.006, 32]} />
          <meshStandardMaterial color="#8d9097" metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.045, 0]} castShadow>
          <cylinderGeometry args={[0.0305, 0.03, 0.08, 32]} />
          <meshStandardMaterial color={BODY} roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.034, 0]}>
          <cylinderGeometry args={[0.0318, 0.0318, 0.026, 32]} />
          <meshStandardMaterial color={RUBBER} roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.07, 0]}>
          <cylinderGeometry args={[0.0312, 0.0312, 0.012, 32]} />
          <meshStandardMaterial color={RUBBER} roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.0855, 0]}>
          <cylinderGeometry args={[0.029, 0.029, 0.001, 32]} />
          <meshStandardMaterial color="#1c2a3f" metalness={0.6} roughness={0.08} />
        </mesh>
        <mesh position={[0, 0.0857, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.012, 24]} />
          <meshBasicMaterial color="#8fb7ff" transparent opacity={0.25} toneMapped={false} />
        </mesh>
      </group>
      {/* 鏡筒上的白字 */}
      <Panel p={[0.076, 0.0735, -0.008]} size={[0.04, 0.0065]} rot={[-Math.PI / 2, 0, 0]}>
        <meshBasicMaterial map={lensText} transparent toneMapped={false} />
      </Panel>
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
