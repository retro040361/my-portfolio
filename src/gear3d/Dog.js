import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Clay } from './parts';

// 黃金獵犬：在房間地板上的空地之間隨機散步，偶爾停下來坐著、聞地板或東張西望
// 模型的正前方是 +x，整隻狗繞 y 軸轉向

// 顏色參考實際照片：身體金黃、臉比較淺、耳朵比較深，胸口、肚子、腿後面和尾巴下面是奶油色的長飾毛
const FUR = '#c98232';
const FACE = '#d69a52';
const FUR_LIGHT = '#e4b672';
const FUR_DARK = '#b06b25';

// 地板上的空地（x, z）與彼此之間「走直線不會撞到家具」的路線
const NODES = {
  bedFoot: [2.3, 0.75],
  tv: [3.2, 0.8],
  corner: [3.8, 1.4],
  mid: [3.1, 1.6],
  center: [2.5, 1.2],
  bedSide: [1.85, 1.62],
  chairs: [1.9, 2.7],
  rug: [2.45, 2.65],
  sofaLeft: [2.2, 3.7],
  sofaBack: [3.2, 3.75],
  lampBack: [3.8, 3.5],
  lampSide: [3.85, 1.95],
  deskFront: [1.8, 3.85],
};
const EDGES = [
  ['bedFoot', 'tv'], ['bedFoot', 'center'], ['center', 'tv'], ['center', 'mid'], ['center', 'bedSide'],
  ['tv', 'corner'], ['corner', 'mid'], ['corner', 'lampSide'], ['mid', 'lampSide'], ['mid', 'rug'],
  ['bedSide', 'chairs'], ['chairs', 'rug'], ['chairs', 'sofaLeft'], ['chairs', 'deskFront'], ['rug', 'sofaLeft'],
  ['sofaLeft', 'sofaBack'], ['sofaLeft', 'deskFront'], ['sofaBack', 'lampBack'],
];
const NEIGHBORS = EDGES.reduce((acc, [a, b]) => {
  (acc[a] = acc[a] || []).push(b);
  (acc[b] = acc[b] || []).push(a);
  return acc;
}, {});

const SPEED = 0.38;
const TURN_SPEED = 2.6;
const PAUSES = ['sit', 'sniff', 'look'];

const headingTo = (from, to) => Math.atan2(-(to[1] - from[1]), to[0] - from[0]);
const angleDiff = (a, b) => Math.atan2(Math.sin(b - a), Math.cos(b - a));
const approach = (v, target, rate, dt) => v + (target - v) * Math.min(1, rate * dt);

// ===== 毛茸茸 =====
// 表面有一簇一簇不規則的毛（往外推的頂點），下半部的毛比較長、往下垂（像飾毛）
const FLUFF = {
  body: { amp: 0.07, droop: 0.12 },
  feather: { amp: 0.09, droop: 0.4 },
  face: { amp: 0.035, droop: 0.04 },
  smooth: { amp: 0, droop: 0 },
};
const fluffCache = {};
const getFluffGeometry = (kind) => {
  if (fluffCache[kind]) return fluffCache[kind];
  const { amp, droop } = FLUFF[kind];
  const g = new THREE.SphereGeometry(1, 44, 30);
  const pos = g.attributes.position;
  const n = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    n.fromBufferAttribute(pos, i).normalize();
    const tuft = Math.sin(n.x * 11 + 1.7) * Math.sin(n.y * 9 + 0.4) * Math.sin(n.z * 13 + 2.2)
      + 0.6 * Math.sin(n.x * 23 + n.z * 19 + n.y * 7) * Math.sin(n.y * 17 - n.z * 11);
    const under = Math.max(0, -n.y);
    const r = 1 + amp * (0.5 + 0.5 * tuft) + droop * under * under * (0.7 + 0.3 * Math.sin(n.x * 29 + n.z * 31));
    pos.setXYZ(i, n.x * r, n.y * r, n.z * r);
  }
  g.computeVertexNormals();
  // 球體接縫和兩極的頂點是重複的，把它們的法線平均起來，不然會看到一條線
  const normal = g.attributes.normal;
  const groups = new Map();
  for (let i = 0; i < pos.count; i++) {
    const key = `${pos.getX(i).toFixed(4)},${pos.getY(i).toFixed(4)},${pos.getZ(i).toFixed(4)}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(i);
  }
  groups.forEach((ids) => {
    if (ids.length < 2) return;
    n.set(0, 0, 0);
    ids.forEach(i => n.add(new THREE.Vector3().fromBufferAttribute(normal, i)));
    n.normalize();
    ids.forEach(i => normal.setXYZ(i, n.x, n.y, n.z));
  });
  fluffCache[kind] = g;
  return g;
};

// 一根一根往下的短毛，當作凹凸貼圖
let furTexture = null;
const getFurTexture = () => {
  if (furTexture) return furTexture;
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, size, size);
  ctx.lineCap = 'round';
  for (let i = 0; i < 3200; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const len = 5 + Math.random() * 10;
    const a = Math.PI / 2 + (Math.random() - 0.5) * 0.7;
    const v = Math.floor(70 + Math.random() * 130);
    ctx.strokeStyle = `rgb(${v},${v},${v})`;
    ctx.lineWidth = 1 + Math.random() * 1.2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len);
    ctx.stroke();
  }
  furTexture = new THREE.CanvasTexture(canvas);
  furTexture.wrapS = furTexture.wrapT = THREE.RepeatWrapping;
  furTexture.repeat.set(3, 3);
  return furTexture;
};

const FurMaterial = ({ color }) => (
  <meshPhysicalMaterial
    color={color}
    roughness={1}
    metalness={0}
    sheen={0.6}
    sheenRoughness={0.5}
    sheenColor="#ffe0a8"
    bumpMap={getFurTexture()}
    bumpScale={2.2}
  />
);

const Fur = ({ color = FUR, fluff = 'body', ...props }) => (
  <mesh castShadow geometry={getFluffGeometry(fluff)} {...props}>
    <FurMaterial color={color} />
  </mesh>
);

// 一條腿：關節在髖部，往下垂；腳掌在最下面，腿後面有奶油色飾毛，後腿上面是比較粗的大腿
const Leg = ({ legRef, position, hind = false, length = 0.34 }) => (
  <group ref={legRef} position={position}>
    <mesh position={[0, -length / 2, 0]} castShadow>
      <capsuleGeometry args={[0.04, length - 0.08, 6, 12]} />
      <FurMaterial color={FUR} />
    </mesh>
    <Fur position={[0, -0.09, 0]} scale={[0.052, 0.11, 0.05]} />
    {hind ? (
      <>
        <Fur position={[-0.01, -0.05, 0]} scale={[0.1, 0.12, 0.058]} />
        <Fur color={FUR_LIGHT} fluff="feather" position={[-0.075, -0.11, 0]} scale={[0.055, 0.1, 0.048]} rotation={[0, 0, 0.25]} />
      </>
    ) : (
      <Fur color={FUR_LIGHT} fluff="feather" position={[-0.034, -0.13, 0]} scale={[0.032, 0.09, 0.034]} rotation={[0, 0, -0.15]} />
    )}
    <Fur color={FACE} fluff="face" position={[0.016, -length + 0.016, 0]} scale={[0.05, 0.026, 0.044]} />
  </group>
);

// 羽毛狀的尾巴：一條往上再往後彎的平滑尾巴，下面垂著奶油色的長飾毛
const TAIL_CURVE = new THREE.CatmullRomCurve3([
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(-0.07, 0.1, 0),
  new THREE.Vector3(-0.15, 0.17, 0),
  new THREE.Vector3(-0.26, 0.2, 0),
]);
const TAIL_FEATHERS = [
  { p: [-0.05, 0.05, 0], rot: -0.95, s: [0.06, 0.035, 0.034] },
  { p: [-0.12, 0.11, 0], rot: -0.65, s: [0.075, 0.05, 0.04] },
  { p: [-0.2, 0.155, 0], rot: -0.35, s: [0.08, 0.05, 0.04] },
  { p: [-0.27, 0.18, 0], rot: -0.15, s: [0.055, 0.035, 0.032] },
];

const Tail = () => (
  <group>
    <mesh castShadow>
      <tubeGeometry args={[TAIL_CURVE, 24, 0.03, 10, false]} />
      <FurMaterial color={FUR} />
    </mesh>
    <Fur position={[0, 0, 0]} scale={[0.04, 0.04, 0.04]} />
    {TAIL_FEATHERS.map(({ p, rot, s: sc }, i) => (
      <group key={i}>
        <Fur position={[p[0], p[1] + 0.004, 0]} rotation={[0, 0, rot]} scale={[sc[0] * 0.85, 0.036, 0.04]} />
        <Fur color={FUR_LIGHT} fluff="feather" position={[p[0] - 0.01, p[1] - 0.028, 0]} rotation={[0, 0, rot]} scale={[sc[0], sc[1] * 1.15, sc[2] * 1.1]} />
      </group>
    ))}
  </group>
);

const Dog = ({ start = 'center', scale = 0.8 }) => {
  const root = useRef();
  const torso = useRef();
  const neck = useRef();
  const head = useRef();
  const tail = useRef();
  const tongue = useRef();
  const legs = [useRef(), useRef(), useRef(), useRef()];

  const state = useMemo(() => {
    const p = NODES[start];
    return {
      x: p[0], z: p[1], heading: 0,
      prev: null, node: start, target: NEIGHBORS[start][0],
      mode: 'pause', pause: 'look', timer: 2,
      walk: 0, sit: 0, sniff: 0, look: 0, gait: 0, wag: 0,
    };
  }, [start]);

  const pickNext = () => {
    const options = NEIGHBORS[state.node].filter(n => n !== state.prev);
    const list = options.length ? options : NEIGHBORS[state.node];
    state.prev = state.node;
    state.target = list[Math.floor(Math.random() * list.length)];
    state.mode = 'turn';
  };

  useFrame((frame, delta) => {
    const dt = Math.min(delta, 0.1);
    const t = frame.clock.elapsedTime;
    const s = state;

    // ===== 行為 =====
    if (s.mode === 'pause') {
      s.timer -= dt;
      if (s.timer <= 0) pickNext();
    } else {
      const goal = NODES[s.target];
      const want = headingTo([s.x, s.z], goal);
      const diff = angleDiff(s.heading, want);
      s.heading += Math.sign(diff) * Math.min(Math.abs(diff), TURN_SPEED * dt);
      if (s.mode === 'turn' && Math.abs(diff) < 0.08) s.mode = 'walk';
      if (s.mode === 'walk') {
        const dx = goal[0] - s.x;
        const dz = goal[1] - s.z;
        const dist = Math.hypot(dx, dz);
        const step = Math.min(dist, SPEED * dt);
        s.x += (dx / dist) * step;
        s.z += (dz / dist) * step;
        if (dist < 0.02) {
          s.node = s.target;
          if (Math.random() < 0.4) {
            s.mode = 'pause';
            s.pause = PAUSES[Math.floor(Math.random() * PAUSES.length)];
            s.timer = 3 + Math.random() * 4;
          } else {
            pickNext();
          }
        }
      }
    }

    // ===== 姿勢（全部平滑過渡） =====
    const moving = s.mode === 'pause' ? 0 : s.mode === 'turn' ? 0.5 : 1;
    s.walk = approach(s.walk, moving, 6, dt);
    s.sit = approach(s.sit, s.mode === 'pause' && s.pause === 'sit' ? 1 : 0, 4, dt);
    s.sniff = approach(s.sniff, s.mode === 'pause' && s.pause === 'sniff' ? 1 : 0, 4, dt);
    s.look = approach(s.look, s.mode === 'pause' && s.pause === 'look' ? 1 : 0, 3, dt);
    s.gait += dt * (4 + 5 * s.walk) * s.walk;
    // 尾巴慢慢地左右搖（約每秒半下到一下），用累加的相位，速度變化時才不會突然跳一下
    s.wag += dt * (3 + 2.5 * s.walk);

    if (root.current) {
      root.current.position.set(s.x, 0, s.z);
      root.current.rotation.y = s.heading;
    }

    // 坐下：以後腿髖部為支點，前半身抬高、整個往下沉
    const bob = Math.abs(Math.sin(s.gait)) * 0.012 * s.walk;
    if (torso.current) {
      torso.current.position.y = 0.38 - 0.19 * s.sit + bob;
      torso.current.rotation.z = 0.5 * s.sit;
    }

    // 對角步態：左前＋右後一組、右前＋左後一組
    const swing = Math.sin(s.gait) * 0.5 * s.walk;
    const [fl, fr, bl, br] = legs.map(l => l.current);
    if (fl) fl.rotation.z = swing - 0.5 * s.sit;
    if (fr) fr.rotation.z = -swing - 0.5 * s.sit;
    if (bl) bl.rotation.z = -swing + 1.05 * s.sit;
    if (br) br.rotation.z = swing + 1.05 * s.sit;

    // 坐下時把脖子往回壓，頭才不會跟著身體仰太高；聞東西時整條脖子往下彎
    if (neck.current) {
      neck.current.rotation.z = -0.3 * s.sit - 1.05 * s.sniff + Math.sin(s.gait * 2) * 0.03 * s.walk;
    }
    if (head.current) {
      head.current.rotation.z = -0.15 * s.sit - 0.3 * s.sniff + Math.sin(t * 9) * 0.05 * s.sniff;
      head.current.rotation.y = Math.sin(t * 0.9) * 0.6 * s.look;
    }
    // 尾巴輕輕地搖，走路時稍微快一點、幅度大一點
    if (tail.current) {
      tail.current.rotation.y = Math.sin(s.wag) * (0.28 + 0.08 * s.walk);
      tail.current.rotation.z = 0.05 + 1.0 * s.sit;
    }
    // 走路喘氣時舌頭露出來
    if (tongue.current) tongue.current.scale.setScalar(0.6 + 0.4 * Math.max(s.walk, s.sit) + Math.sin(t * 14) * 0.08 * s.walk);
  });

  return (
    <group ref={root} scale={scale}>
      {/* 軀幹群組的原點在後腿髖部，坐下時以這裡為支點 */}
      <group ref={torso} position={[-0.2, 0.38, 0]}>
        <group position={[0.2, 0, 0]}>
          {/* 身體：胸部最厚、屁股圓圓的，肚子下面垂著奶油色飾毛 */}
          <Fur position={[-0.01, 0.04, 0]} scale={[0.33, 0.145, 0.138]} />
          <Fur position={[0.17, 0.055, 0]} scale={[0.16, 0.155, 0.14]} />
          <Fur position={[-0.2, 0.045, 0]} scale={[0.15, 0.14, 0.135]} />
          <Fur color={FUR_LIGHT} fluff="feather" position={[0.04, -0.06, 0]} scale={[0.22, 0.065, 0.105]} />
          {/* 胸口蓬蓬的奶油色毛 */}
          <Fur color={FACE} fluff="feather" position={[0.28, 0.0, 0]} scale={[0.1, 0.135, 0.11]} />
          <Fur color={FUR_LIGHT} fluff="feather" position={[0.27, -0.1, 0]} scale={[0.065, 0.075, 0.08]} />
          {/* 脖子：從肩膀長出來的關節，頭接在脖子末端，低頭聞東西時整條脖子一起彎下去 */}
          <group ref={neck} position={[0.24, 0.1, 0]}>
            <Fur position={[0.07, 0.08, 0]} rotation={[0, 0, -0.72]} scale={[0.085, 0.15, 0.088]} />
            {/* 喉嚨前面的奶油色毛 */}
            <Fur color={FACE} fluff="feather" position={[0.11, 0.04, 0]} scale={[0.06, 0.09, 0.08]} rotation={[0, 0, -0.5]} />

          {/* 頭：照黃金獵犬照片做——圓圓寬寬的頭、比較短比較寬的口鼻、大黑鼻子、
              眼睛在臉的正面、耳朵從頭兩側垂到嘴巴高度；臉比身體淺 */}
          <group ref={head} position={[0.15, 0.17, 0]}>
            <Fur color={FACE} fluff="face" scale={[0.1, 0.092, 0.1]} />
            {/* 頭頂顏色比較深 */}
            <Fur color={FUR} fluff="face" position={[-0.015, 0.03, 0]} scale={[0.085, 0.065, 0.088]} />
            {/* 兩頰和下巴的蓬毛 */}
            <Fur color={FACE} fluff="feather" position={[0.03, -0.05, 0]} scale={[0.075, 0.05, 0.088]} />
            {/* 口鼻：短而寬、奶油色 */}
            <Fur color={FUR_LIGHT} fluff="face" position={[0.115, -0.032, 0]} scale={[0.082, 0.046, 0.056]} />
            {/* 鼻樑：讓口鼻上緣平一點、從額頭順下來 */}
            <Fur color={FACE} fluff="face" position={[0.1, -0.006, 0]} scale={[0.075, 0.028, 0.04]} />
            <mesh position={[0.192, -0.012, 0]} scale={[0.75, 0.8, 1.25]}>
              <sphereGeometry args={[0.022, 18, 14]} />
              <meshStandardMaterial color="#17110f" roughness={0.3} />
            </mesh>
            {/* 張開的嘴：嘴巴裡面、下巴、粉紅舌頭 */}
            <Fur color="#4a2422" fluff="smooth" position={[0.12, -0.07, 0]} scale={[0.064, 0.018, 0.046]} />
            <Fur color={FUR_LIGHT} fluff="face" position={[0.095, -0.088, 0]} scale={[0.066, 0.022, 0.046]} />
            <group ref={tongue} position={[0.132, -0.08, 0]}>
              <mesh position={[0.014, -0.01, 0]} rotation={[0, 0, -0.5]} scale={[0.04, 0.012, 0.032]}>
                <sphereGeometry args={[1, 16, 12]} />
                <Clay color="#e46f80" />
              </mesh>
            </group>
            {[1, -1].map(side => (
              <group key={side}>
                {/* 深棕色杏仁眼，在臉的正面（之前埋在頭裡看不到），加一點反光才有精神 */}
                <mesh position={[0.09, 0.02, side * 0.045]} scale={[0.75, 0.95, 1]}>
                  <sphereGeometry args={[0.016, 14, 10]} />
                  <meshStandardMaterial color="#1e120b" roughness={0.15} />
                </mesh>
                <mesh position={[0.1, 0.026, side * 0.042]}>
                  <sphereGeometry args={[0.0035, 8, 6]} />
                  <meshBasicMaterial color="#ffffff" />
                </mesh>
                {/* 垂耳：從頭兩側（眼睛高度再上面一點）貼著臉頰垂到嘴巴高度，下緣的毛比較長 */}
                <group position={[-0.015, 0.05, side * 0.084]} rotation={[side * 0.12, 0, 0.15]}>
                  <Fur color={FUR_DARK} position={[0, -0.058, side * 0.01]} scale={[0.064, 0.085, 0.022]} />
                  <Fur color={FUR_DARK} fluff="feather" position={[-0.006, -0.11, side * 0.012]} scale={[0.05, 0.036, 0.022]} />
                </group>
              </group>
            ))}
          </group>
          </group>

          <Leg legRef={legs[0]} position={[0.19, -0.02, 0.07]} />
          <Leg legRef={legs[1]} position={[0.19, -0.02, -0.07]} />
          <Leg legRef={legs[2]} position={[-0.2, -0.02, 0.075]} hind />
          <Leg legRef={legs[3]} position={[-0.2, -0.02, -0.075]} hind />

          {/* 高高翹起的羽毛尾巴 */}
          <group ref={tail} position={[-0.32, 0.08, 0]}>
            <Tail />
          </group>
        </group>
      </group>
    </group>
  );
};

export default Dog;
