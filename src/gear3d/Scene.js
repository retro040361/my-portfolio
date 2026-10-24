import React, { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html, OrthographicCamera, PresentationControls, PerformanceMonitor } from '@react-three/drei';
import { EffectComposer, N8AO, Bloom, Noise, Vignette, ToneMapping, SMAA, Select, Outline } from '@react-three/postprocessing';
import { ToneMappingMode, BlendFunction } from 'postprocessing';
import * as THREE from 'three';
import { Box, Clay, Glow, Panel, LedStrip, RgbGlowMaterial, XboxController, Phone, AllyX, Switch2, MacBook, IPad, Monitor, PcTower, EdifierSpeaker, TvBench, GameCase, PokeBall, RazerCobraPro, Mouse, Blahaj } from './parts';
import { useAnimatedTexture, useStaticTexture, useWoodTexture } from './textures';
import { drawCodeScreen, drawEldenScreen, drawSwitchScreen, drawWindowSky, drawNeonText } from './screens';
import Person, { usePlayWeight } from './Person';
import Dog from './Dog';

// 房間 4.2 × 4.2 × 3 公尺；鏡頭從右前上方 45° 看過來（等角視角）
const CENTER = new THREE.Vector3(2.05, 0.95, 2.05);
const CAMERA_OFFSET = new THREE.Vector3(10, 10, 10);

// 兩個人各用一台螢幕：男生在 BenQ 前面（艾爾登法環＋手把），女生在 MSI 前面（寫程式）
const BOY_Z = 2.46;
const GIRL_Z = 3.3;

// 提示框指向的位置
export const ANCHORS = {
  monitor1: [0.17, 1.46, 3.3],
  monitor2: [0.17, 1.46, 2.46],
  pc: [0.33, 0.8, 4.04],
  laptop: [1.3, 0.62, 0.73],
  tablet: [2.34, 0.55, 2.04],
  phone: [0.6, 0.9, 3.74],
  ally: [3.46, 0.62, 0.14],
  speakers: [2.62, 0.62, 0.16],
  games: [3.2, 0.3, 0.26],
  mouse: [0.6, 0.9, 2.08],
  shark: [0.78, 0.62, 0.75],
  controller: [0.38, 0.92, 1.9],
  switch2: [2.86, 0.6, 0.14],
  headphones: [1.09, 1.4, BOY_Z],
};

// 效能：先在背景把所有 shader 編譯好再顯示，避免一打開分頁卡一下
const Precompile = ({ onReady }) => {
  const { gl, scene, camera } = useThree();
  useEffect(() => {
    let cancelled = false;
    const done = () => { if (!cancelled) onReady(); };
    if (gl.compileAsync) gl.compileAsync(scene, camera).then(done, done);
    else done();
    return () => { cancelled = true; };
  }, [gl, scene, camera, onReady]);
  return null;
};

// 依畫面大小調整正交鏡頭的縮放，讓整間房間剛好放得下
const CameraRig = () => {
  const { camera, size } = useThree();
  useEffect(() => {
    camera.position.copy(CENTER).add(CAMERA_OFFSET);
    camera.lookAt(CENTER);
    camera.zoom = Math.min(size.width / 8.3, size.height / 7.9);
    camera.updateProjectionMatrix();
  }, [camera, size]);
  return null;
};

// 滑鼠墊（下緣有 LED）＋鍵盤（底下有 RGB 光暈）
const Keyboard = ({ z, body = '#16161c', keys = '#2a2a34', led = '#ff1f8f' }) => (
  <group>
    <Box p={[0.57, 0.813, z - 0.15]} s={[0.32, 0.006, 0.82]} c="#1a1621" r={0.003} />
    <LedStrip from={[0.732, 0.817, z - 0.55]} to={[0.732, 0.817, z + 0.25]} colors={[led, led]} segments={3} thickness={0.008} strength={2} />
    <Box p={[0.57, 0.83, z]} s={[0.15, 0.025, 0.48]} c={body} r={0.008} />
    <mesh position={[0.57, 0.817, z]}>
      <boxGeometry args={[0.16, 0.004, 0.49]} />
      <RgbGlowMaterial />
    </mesh>
    {Array.from({ length: 5 }).map((_, r) => Array.from({ length: 15 }).map((__, c) => (
      <mesh key={`${r}-${c}`} position={[0.51 + r * 0.03, 0.848, z - 0.2 + c * 0.029]}>
        <boxGeometry args={[0.022, 0.012, 0.022]} />
        <meshStandardMaterial color={keys} roughness={0.7} />
      </mesh>
    )))}
  </group>
);

// 電競椅：五爪腳、座墊、扶手、往後仰的椅背
const GamingChair = ({ z, seat = '#1f1f2a', accent = '#ff1f8f' }) => (
  <group position={[0, 0, z]}>
    <group position={[1.16, 0, 0]}>
      {[0, 1, 2, 3, 4].map(i => {
        const a = (i / 5) * Math.PI * 2;
        return (
          <group key={i}>
            <mesh position={[Math.cos(a) * 0.14, 0.07, Math.sin(a) * 0.14]} rotation={[0, -a, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.018, 0.018, 0.28, 10]} />
              <Clay color="#18181f" />
            </mesh>
            <mesh position={[Math.cos(a) * 0.28, 0.03, Math.sin(a) * 0.28]} castShadow>
              <sphereGeometry args={[0.03, 12, 10]} />
              <Clay color="#111116" />
            </mesh>
          </group>
        );
      })}
      <mesh position={[0, 0.25, 0]} castShadow><cylinderGeometry args={[0.025, 0.03, 0.36, 12]} /><Clay color="#2a2a33" rough={0.5} /></mesh>
    </group>
    <Box p={[1.14, 0.46, 0]} s={[0.5, 0.09, 0.52]} c={seat} r={0.04} />
    {[1, -1].map(side => (
      <group key={side}>
        <Box p={[1.2, 0.56, side * 0.28]} s={[0.05, 0.12, 0.04]} c="#1a1a22" r={0.01} />
        <Box p={[1.12, 0.63, side * 0.28]} s={[0.3, 0.04, 0.07]} c={seat} r={0.02} />
      </group>
    ))}
    <group position={[1.4, 0.9, 0]} rotation={[0, 0, -0.12]}>
      <Box p={[0, 0, 0]} s={[0.09, 0.82, 0.48]} c={seat} r={0.045} />
      {[0.13, -0.13].map(sz => (
        <Box key={sz} p={[0.047, 0, sz]} s={[0.01, 0.66, 0.05]} c={accent} r={0.004} rough={0.6} />
      ))}
      <Box p={[0.03, 0.34, 0]} s={[0.05, 0.1, 0.26]} c={accent} r={0.04} sheen />
    </group>
  </group>
);

// 可互動的設備：hover 時加上外框、顯示提示框
// hit 是額外的透明感應區（不會被加外框），讓小東西也容易指到
const Item = ({ id, active, setActive, children, hit = null }) => (
  <group
    onPointerOver={(e) => { e.stopPropagation(); setActive(id); document.body.style.cursor = 'pointer'; }}
    onPointerOut={() => { setActive(cur => (cur === id ? null : cur)); document.body.style.cursor = ''; }}
    onClick={(e) => { e.stopPropagation(); setActive(cur => (cur === id ? null : id)); }}
  >
    <Select enabled={active === id}>{children}</Select>
    {hit}
  </group>
);

// 透明感應區
const HitArea = ({ p, r }) => (
  <mesh position={p}>
    <sphereGeometry args={[r, 10, 8]} />
    <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
  </mesh>
);

// 主題相關的燈光：mix 0 = 暗色（關燈）、1 = 亮色（開燈），每幀往目標平滑靠近
const useThemeMix = (isLight) => {
  const mix = useRef(isLight ? 1 : 0);
  useFrame((_, delta) => {
    const target = isLight ? 1 : 0;
    mix.current += (target - mix.current) * Math.min(1, delta * 4);
  });
  return mix;
};

const ThemedLights = ({ mix }) => {
  const hemi = useRef();
  const sun = useRef();
  const night = useRef([]);
  const { scene, gl } = useThree();
  const bgDark = useMemo(() => new THREE.Color('#08080d'), []);
  const bgLight = useMemo(() => new THREE.Color('#e7e2da'), []);
  const sunDay = useMemo(() => new THREE.Color('#fff1d6'), []);
  const sunNight = useMemo(() => new THREE.Color('#8fa2ff'), []);
  const hemiDay = useMemo(() => new THREE.Color('#fff6e8'), []);
  const hemiNight = useMemo(() => new THREE.Color('#6b5aa6'), []);

  useFrame(() => {
    const m = mix.current;
    if (!scene.background) scene.background = new THREE.Color();
    scene.background.lerpColors(bgDark, bgLight, m);
    if (hemi.current) {
      hemi.current.intensity = 0.35 + m * 1.6;
      hemi.current.color.lerpColors(hemiNight, hemiDay, m);
    }
    if (sun.current) {
      sun.current.intensity = 0.35 + m * 2.6;
      sun.current.color.lerpColors(sunNight, sunDay, m);
    }
    // 晚上的燈（檯燈、立燈、螢幕、霓虹、RGB）白天會調暗
    night.current.forEach(light => {
      if (light) light.intensity = light.userData.base * (1 - m * 0.75);
    });
    gl.toneMappingExposure = 1;
  });

  const nightLight = (i, base) => (el) => {
    if (el) { el.userData.base = base; night.current[i] = el; }
  };

  return (
    <>
      <hemisphereLight ref={hemi} groundColor="#8a7460" />
      <directionalLight
        ref={sun}
        position={[1.2, 6, -3.5]}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.03}
        shadow-camera-left={-4}
        shadow-camera-right={4}
        shadow-camera-top={4}
        shadow-camera-bottom={-4}
        shadow-camera-near={0.5}
        shadow-camera-far={16}
      >
        <object3D attach="target" position={[2.1, 0, 2.3]} />
      </directionalLight>
      {/* 螢幕光、霓虹、RGB、檯燈、立燈、電視 */}
      <pointLight ref={nightLight(0, 4)} position={[0.55, 1.2, 2.85]} color="#7c5cff" distance={3.2} decay={1.6} />
      <pointLight ref={nightLight(1, 1.2)} position={[0.45, 2.45, 3.0]} color="#ff4fb8" distance={2.2} decay={1.8} />
      <pointLight ref={nightLight(2, 3.5)} position={[0.22, 1.05, 3.72]} color="#ffc27a" distance={2.2} decay={1.6} />
      <pointLight ref={nightLight(3, 6)} position={[3.96, 1.3, 2.68]} color="#ffc27a" distance={3.6} decay={1.6} />
      <pointLight ref={nightLight(4, 2.5)} position={[3.15, 1.4, 0.45]} color="#dfe6ff" distance={2.6} decay={1.6} />
      <pointLight ref={nightLight(5, 1.1)} position={[0.4, 2.7, 3.6]} color="#ff1f8f" distance={2.4} decay={1.8} />
      <pointLight ref={nightLight(6, 1.1)} position={[3.6, 2.7, 0.4]} color="#00e5ff" distance={2.4} decay={1.8} />
      <pointLight ref={nightLight(7, 1.5)} position={[0.7, 0.4, 4.15]} color="#ff1f8f" distance={1.4} decay={1.6} />
    </>
  );
};

// 窗戶：天色畫在 canvas 上（主題切換時有黃昏 / 清晨與日月升落）
const Window = ({ mix, theme }) => {
  const skyState = useRef({ mix: 0, sinceChange: 99, toLight: false });
  const tex = useAnimatedTexture(256, 232, (ctx, w, h) => drawWindowSky(ctx, w, h, skyState.current), 30);
  useFrame(() => {
    skyState.current.mix = mix.current;
    skyState.current.toLight = theme.isLight;
    skyState.current.sinceChange = theme.changedAt ? (performance.now() - theme.changedAt) / 1000 : 99;
  });
  const frame = '#f2eee8';
  return (
    <group position={[0.95, 1.95, 0.0]}>
      <Panel p={[0, 0, 0.012]} size={[1.1, 1.0]}><meshBasicMaterial map={tex} toneMapped={false} /></Panel>
      <Box p={[0, 0.53, 0.04]} s={[1.2, 0.07, 0.08]} c={frame} cast={false} />
      <Box p={[0, -0.53, 0.05]} s={[1.28, 0.07, 0.12]} c={frame} cast={false} />
      <Box p={[-0.585, 0, 0.04]} s={[0.07, 1.1, 0.08]} c={frame} cast={false} />
      <Box p={[0.585, 0, 0.04]} s={[0.07, 1.1, 0.08]} c={frame} cast={false} />
      <Box p={[0, 0, 0.03]} s={[0.04, 1.0, 0.05]} c={frame} cast={false} />
      <Box p={[0, 0.02, 0.03]} s={[1.1, 0.04, 0.05]} c={frame} cast={false} />
    </group>
  );
};

// 白天地板上的窗光
const SunPatch = ({ mix }) => {
  const mat = useRef();
  useFrame(() => { if (mat.current) mat.current.opacity = mix.current * 0.22; });
  return (
    <mesh position={[1.05, 0.006, 1.25]} rotation={[-Math.PI / 2, 0, -0.35]}>
      <planeGeometry args={[1.1, 1.5]} />
      <meshBasicMaterial ref={mat} color="#fff2cf" transparent opacity={0} depthWrite={false} />
    </mesh>
  );
};

const Scene = ({ active, setActive, theme, lowPower, tooltip, onReady, onPerformance }) => {
  const mix = useThemeMix(theme.isLight);
  const play = usePlayWeight();
  const wood = useWoodTexture();
  const codeTex = useAnimatedTexture(512, 282, drawCodeScreen, 24);
  const eldenTex = useAnimatedTexture(512, 276, drawEldenScreen, 30);
  // 電視顯示 Switch 的 HOME 主選單（像是 Switch 插在底座上輸出到電視），每秒更新一次時間
  const tvTex = useAnimatedTexture(1024, 576, drawSwitchScreen, 1);
  const neonTex = useStaticTexture(1024, 192, drawNeonText);
  const deskController = useRef();
  useFrame(() => { if (deskController.current) deskController.current.visible = play.current < 0.5; });

  const books = [
    { z: 0.42, h: 0.27, c: '#7a2e4d' }, { z: 0.49, h: 0.23, c: '#2e5a78' }, { z: 0.55, h: 0.29, c: '#4b3a72' },
    { z: 0.62, h: 0.21, c: '#3d6b52' }, { z: 0.68, h: 0.25, c: '#c27a2e' },
  ];

  return (
    <>
      <OrthographicCamera makeDefault near={0.1} far={60} />
      <CameraRig />
      <Precompile onReady={onReady} />
      {/* 閒置時本來就是 30fps，所以以 30fps 為基準：低於 24 才降解析度 */}
      <PerformanceMonitor bounds={() => [24, 29]} onDecline={() => onPerformance(-1)} onIncline={() => onPerformance(1)} flipflops={3} />
      <ThemedLights mix={mix} />

      <PresentationControls
        enabled={!lowPower}
        global={false}
        cursor={false}
        snap
        speed={1.2}
        polar={[-0.08, 0.12]}
        azimuth={[-0.35, 0.35]}
      >
        <group>
          {/* ===== 地板與牆 ===== */}
          <Box p={[2.05, -0.09, 2.05]} s={[4.3, 0.18, 4.3]} c="#c8a682" r={0.04} map={wood} rough={0.8} />
          <Box p={[-0.05, 1.5, 2.05]} s={[0.1, 3, 4.3]} c="#cfc6dd" r={0.03} />
          <Box p={[2.1, 1.5, -0.05]} s={[4.3, 3, 0.1]} c="#d8cfe4" r={0.03} cast={false} />
          <Box p={[0.012, 0.05, 2.1]} s={[0.025, 0.1, 4.2]} c="#efe9f5" r={0.01} />
          <Box p={[2.1, 0.05, 0.012]} s={[4.2, 0.1, 0.025]} c="#efe9f5" r={0.01} />
          <LedStrip from={[0.02, 2.97, 4.18]} to={[0.02, 2.97, 0.02]} colors={['#ff1f8f', '#b026ff']} segments={20} />
          <LedStrip from={[0.02, 2.97, 0.02]} to={[4.18, 2.97, 0.02]} colors={['#b026ff', '#3b82f6', '#00e5ff']} segments={20} />
          <SunPatch mix={mix} />

          {/* 地毯 */}
          <mesh position={[2.95, 0.012, 2.55]} receiveShadow>
            <cylinderGeometry args={[1.28, 1.28, 0.02, 64]} />
            <Clay color="#7a5c9e" sheen />
          </mesh>
          <mesh position={[2.95, 0.024, 2.55]} receiveShadow>
            <cylinderGeometry args={[1.16, 1.16, 0.006, 64]} />
            <Clay color="#b9a2dd" sheen />
          </mesh>

          {/* ===== 右牆：窗戶、飛鏢靶、電視、電視櫃 =====
              陽光是從右牆後面照進來的，貼在右牆上的東西（窗框、飛鏢靶、電視）和牆邊的盆栽不投射陰影，
              不然影子會往房間前面拉出去，看起來很怪 */}
          <Window mix={mix} theme={theme} />
          <group position={[1.98, 2.2, 0.02]}>
            {[[0.2, '#14141a'], [0.16, '#e8dcc0'], [0.12, '#1c1c22'], [0.08, '#e8dcc0'], [0.04, '#c0392b'], [0.015, '#1f7a3f']].map(([r, c], i) => (
              <mesh key={i} position={[0, 0, i * 0.004]} rotation={[Math.PI / 2, 0, 0]} receiveShadow>
                <cylinderGeometry args={[r, r, 0.02, 40]} />
                <Clay color={c} />
              </mesh>
            ))}
          </group>
          <group position={[3.15, 1.4, 0.04]}>
            <Box p={[0, 0, 0]} s={[1.34, 0.77, 0.05]} c="#0d0d12" r={0.012} rough={0.5} cast={false} />
            <Panel p={[0, 0, 0.0255]} size={[1.28, 0.71]}><Glow color="#ffffff" strength={1.1} map={tvTex} /></Panel>
          </group>
          {/* 木製電視櫃：三格開放式收納，裡面放遊戲片 */}
          <TvBench cx={3.2} cz={0.16}>
            {({ left, cell, t, floorY, cz }) => {
              const cellCenter = (i) => left + t + cell / 2 + i * (cell + t);
              const caseY = floorY + 0.085;
              return (
                <Item id="games" active={active} setActive={setActive}>
                  {/* 左格：兩片側邊朝外立著 */}
                  <GameCase title="Zelda: Breath of the Wild" position={[left + t + 0.03, caseY, cz + 0.02]} rotation={[0, Math.PI / 2, 0]} />
                  <GameCase title="Zelda: Tears of the Kingdom" position={[left + t + 0.047, caseY, cz + 0.02]} rotation={[0, Math.PI / 2, 0]} />
                  {/* 中格：Pokopia 封面朝外、稍微往後靠 */}
                  <GameCase cover="pokopia" title="Pokémon Pokopia" position={[cellCenter(1), caseY - 0.002, cz + 0.01]} rotation={[-0.14, 0, 0]} />
                  {/* 右格：王國之淚封面朝外，旁邊放一顆寶貝球 */}
                  <GameCase cover="totk" title="Zelda: Tears of the Kingdom" position={[cellCenter(2) - 0.06, caseY - 0.002, cz + 0.01]} rotation={[-0.14, 0, 0]} />
                  <PokeBall position={[cellCenter(2) + 0.09, floorY + 0.045, cz + 0.05]} rotation={[0, -0.5, 0]} />
                </Item>
              );
            }}
          </TvBench>
          <LedStrip from={[2.54, 0.01, 0.32]} to={[3.86, 0.01, 0.32]} segments={12} thickness={0.015} />

          {/* 掌機放在電視櫃上 */}
          <Item id="switch2" active={active} setActive={setActive}>
            <Box p={[2.86, 0.36, 0.16]} s={[0.12, 0.04, 0.08]} c="#2a2632" r={0.01} />
            <Switch2 position={[2.86, 0.46, 0.15]} rotation={[-0.15, 0, 0]} />
          </Item>
          <Item id="ally" active={active} setActive={setActive}>
            <Box p={[3.46, 0.36, 0.16]} s={[0.14, 0.04, 0.08]} c="#2a2632" r={0.01} />
            <AllyX position={[3.46, 0.47, 0.15]} rotation={[-0.15, 0, 0]} />
          </Item>
          {/* Edifier M90 喇叭：放在電視櫃兩端、掌機的左右兩邊 */}
          <Item id="speakers" active={active} setActive={setActive}>
            <EdifierSpeaker position={[2.62, 0.44, 0.16]} />
            <EdifierSpeaker position={[3.78, 0.44, 0.16]} />
          </Item>
          {/* 盆栽（往右靠，不要擋到右邊的喇叭） */}
          <group position={[4.05, 0, 0.2]}>
            <mesh position={[0, 0.16, 0]} receiveShadow><cylinderGeometry args={[0.13, 0.1, 0.32, 24]} /><Clay color="#e8e2d8" /></mesh>
            {[[0, 0.55, 0, 0.17], [0.08, 0.45, 0.06, 0.13], [-0.07, 0.47, -0.05, 0.14], [0.02, 0.68, -0.03, 0.12]].map(([x, y, z, r], i) => (
              <mesh key={i} position={[x, y, z]} receiveShadow><sphereGeometry args={[r, 18, 14]} /><Clay color={i % 2 ? '#4f8a5b' : '#3f7a4c'} /></mesh>
            ))}
          </group>

          {/* ===== 左牆：置物架與霓虹招牌 ===== */}
          {[2.0, 2.5].map(y => (
            <Box key={y} p={[0.13, y, 0.92]} s={[0.26, 0.04, 1.24]} c="#d9c3a5" r={0.01} />
          ))}
          {books.map(b => (
            <Box key={b.z} p={[0.13, 2.02 + b.h / 2, b.z]} s={[0.18, b.h, 0.055]} c={b.c} r={0.008} />
          ))}
          <group position={[0.13, 2.02, 1.3]}>
            <mesh position={[0, 0.06, 0]} castShadow><cylinderGeometry args={[0.07, 0.055, 0.12, 20]} /><Clay color="#c96f4a" /></mesh>
            <mesh position={[0, 0.2, 0]} castShadow><coneGeometry args={[0.06, 0.2, 8]} /><Clay color="#3f7a4c" /></mesh>
          </group>
          <mesh position={[0.13, 2.6, 0.7]} castShadow><cylinderGeometry args={[0.05, 0.07, 0.16, 16]} /><meshStandardMaterial color="#e2b13c" roughness={0.35} metalness={0.6} /></mesh>
          <Box p={[0.13, 2.55, 1.05]} s={[0.16, 0.06, 0.26]} c="#22c55e" r={0.02} />
          <Panel p={[0.012, 2.6, 3.0]} size={[1.8, 0.34]} rot={[0, Math.PI / 2, 0]}>
            <Glow color="#ff7cc8" strength={4} map={neonTex} transparent />
          </Panel>

          {/* ===== 床（MacBook 放在床上） ===== */}
          <Box p={[0.04, 0.38, 0.73]} s={[0.08, 0.76, 1.12]} c="#8e6f8c" r={0.03} />
          <Box p={[0.99, 0.08, 0.73]} s={[1.84, 0.16, 1.12]} c="#c9a57c" r={0.03} />
          <Box p={[0.99, 0.25, 0.73]} s={[1.8, 0.18, 1.08]} c="#f1eef3" r={0.06} sheen />
          <Box p={[1.33, 0.345, 0.73]} s={[1.14, 0.06, 1.14]} c="#8f72c8" r={0.03} sheen />
          {[0.47, 1.0].map(z => (
            <Box key={z} p={[0.3, 0.39, z]} s={[0.3, 0.1, 0.42]} c="#fbf9fd" r={0.05} sheen />
          ))}
          <Item id="laptop" active={active} setActive={setActive}>
            <MacBook position={[1.36, 0.375, 0.73]} />
          </Item>
          {/* IKEA 鯊魚：躺在枕頭和 MacBook 中間，頭朝向房間，微微側躺露出白肚子 */}
          <Item id="shark" active={active} setActive={setActive}>
            {/* 先沿身體長軸側躺（內層），再轉向（外層），不然會變成尾巴翹起來 */}
            <group position={[0.78, 0.468, 0.75]} rotation={[0, -Math.PI / 2 + 0.25, 0]} scale={0.75}>
              <Blahaj rotation={[0.35, 0, 0]} />
            </group>
          </Item>

          {/* ===== 邊桌（iPad 放在上面） ===== */}
          <group position={[2.34, 0, 2.04]}>
            <mesh position={[0, 0.01, 0]} castShadow receiveShadow><cylinderGeometry args={[0.16, 0.18, 0.02, 32]} /><Clay color="#3a3046" /></mesh>
            <mesh position={[0, 0.23, 0]} castShadow><cylinderGeometry args={[0.025, 0.025, 0.44, 16]} /><Clay color="#3a3046" /></mesh>
            <mesh position={[0, 0.455, 0]} castShadow receiveShadow><cylinderGeometry args={[0.25, 0.25, 0.03, 40]} /><Clay color="#efe9e1" /></mesh>
          </group>
          <Item id="tablet" active={active} setActive={setActive} hit={<HitArea p={[2.34, 0.5, 2.04]} r={0.17} />}>
            <IPad position={[2.34, 0.476, 2.04]} rotation={[0, 0.4, 0]} />
          </Item>

          {/* ===== 書桌 ===== */}
          <Box p={[0.38, 0.78, 2.815]} s={[0.76, 0.06, 2.13]} c="#f1ede6" r={0.02} />
          {[[0.7, 1.82], [0.7, 3.81], [0.06, 1.82], [0.06, 3.81]].map(([x, z]) => (
            <Box key={`${x}-${z}`} p={[x, 0.375, z]} s={[0.05, 0.75, 0.05]} c="#2b2833" r={0.015} />
          ))}
          <LedStrip from={[0.765, 0.745, 1.77]} to={[0.765, 0.745, 3.86]} segments={16} thickness={0.015} />

          {/* 兩組滑鼠墊、鍵盤、滑鼠（滑鼠都在各自的右手邊，也就是 -z） */}
          <Keyboard z={BOY_Z} />
          <Keyboard z={GIRL_Z} body="#f4f1ec" keys="#e4dfe8" led="#ffb3d9" />
          {/* Razer Cobra Pro 滑鼠 */}
          <Item id="mouse" active={active} setActive={setActive} hit={<HitArea p={[0.6, 0.84, 2.08]} r={0.08} />}>
            <RazerCobraPro position={[0.6, 0.816, 2.08]} rotation={[0, 0.08, 0]} />
          </Item>
          <Mouse position={[0.6, 0.816, GIRL_Z - 0.4]} rotation={[0, -0.06, 0]} />

          {/* 桌上的 Xbox 手把（打遊戲時被拿起來） */}
          <group ref={deskController}>
            <Item id="controller" active={active} setActive={setActive} hit={<HitArea p={[0.38, 0.84, 1.9]} r={0.1} />}>
              <XboxController position={[0.38, 0.83, 1.9]} rotation={[0, 0.3, 0]} />
            </Item>
          </group>

          <Item id="phone" active={active} setActive={setActive} hit={<HitArea p={[0.6, 0.85, 3.74]} r={0.14} />}>
            <Phone position={[0.6, 0.818, 3.74]} rotation={[0, 0.1, 0]} />
          </Item>

          {/* 檯燈 */}
          <group position={[0.2, 0.81, 3.72]}>
            <mesh position={[0, 0.01, 0]} castShadow><cylinderGeometry args={[0.07, 0.08, 0.02, 24]} /><Clay color="#2b2833" /></mesh>
            <mesh position={[0, 0.16, 0]} castShadow><cylinderGeometry args={[0.01, 0.01, 0.3, 10]} /><Clay color="#2b2833" /></mesh>
            <mesh position={[0, 0.32, 0]} castShadow><coneGeometry args={[0.09, 0.1, 24, 1, true]} /><meshStandardMaterial color="#f3ead8" emissive="#ffb866" emissiveIntensity={0.7} roughness={0.9} side={THREE.DoubleSide} /></mesh>
            <mesh position={[0, 0.29, 0]}><sphereGeometry args={[0.03, 12, 10]} /><Glow color="#ffc27a" strength={3} /></mesh>
          </group>

          {/* MSI 主螢幕（寫程式）、BenQ 副螢幕（艾爾登法環） */}
          <Item id="monitor1" active={active} setActive={setActive}>
            <Box p={[0.12, 0.88, 3.3]} s={[0.04, 0.16, 0.05]} c="#1c1c24" r={0.01} />
            <Box p={[0.2, 0.815, 3.3]} s={[0.2, 0.012, 0.24]} c="#1c1c24" r={0.005} />
            <Monitor position={[0.16, 1.18, 3.3]} screenTexture={codeTex} chinLabel="msi" />
          </Item>
          <Item id="monitor2" active={active} setActive={setActive}>
            <Box p={[0.12, 0.88, 2.46]} s={[0.04, 0.16, 0.06]} c="#6b6e76" r={0.015} rough={0.4} />
            <Box p={[0.2, 0.815, 2.46]} s={[0.22, 0.014, 0.26]} c="#5b5e66" r={0.007} rough={0.4} />
            <mesh position={[0.31, 0.818, 2.46]}><boxGeometry args={[0.004, 0.004, 0.2]} /><Glow color="#e2711d" strength={1.4} /></mesh>
            <Monitor position={[0.16, 1.18, 2.46]} screenTexture={eldenTex} body="#24252b" height={0.48} chin={0.035} chinLabel="BenQ" />
          </Item>

          {/* ===== 主機 ===== */}
          <Item id="pc" active={active} setActive={setActive}>
            <PcTower position={[0.33, 0.36, 4.04]} />
          </Item>

          {/* ===== 電競椅（男生黑粉、女生白色） ===== */}
          <GamingChair z={BOY_Z} />
          <GamingChair z={GIRL_Z} seat="#ecebf0" accent="#9ad9ff" />

          {/* ===== 人 ===== */}
          <Person
            z={BOY_Z}
            playRef={play}
            wrapController={(node) => (
              <Item id="controller" active={active} setActive={setActive} hit={<HitArea p={[0, 0, 0]} r={0.1} />}>
                {node}
              </Item>
            )}
            wrapHeadphones={(node) => (
              <Item id="headphones" active={active} setActive={setActive} hit={<HitArea p={[0, 0, 0]} r={0.17} />}>
                {node}
              </Item>
            )}
          />

          <Person z={GIRL_Z} variant="girl" phase={0.37} />

          {/* ===== 黃金獵犬（在房間裡到處散步） ===== */}
          <Dog />

          {/* ===== 單人沙發與立燈 ===== */}
          <Box p={[3.2, 0.16, 2.8]} s={[0.56, 0.3, 0.56]} c="#7d70a8" r={0.06} sheen />
          {[2.86, 3.54].map(x => (
            <Box key={x} p={[x, 0.25, 2.85]} s={[0.12, 0.48, 0.7]} c="#6f6299" r={0.05} sheen />
          ))}
          <Box p={[3.2, 0.42, 3.13]} s={[0.8, 0.82, 0.14]} c="#6f6299" r={0.06} sheen />
          <Box p={[3.2, 0.42, 2.98]} s={[0.36, 0.26, 0.12]} c="#ff4fb8" r={0.06} sheen />
          <group position={[3.96, 0, 2.68]}>
            <mesh position={[0, 0.015, 0]} castShadow><cylinderGeometry args={[0.13, 0.15, 0.03, 24]} /><Clay color="#2b2833" /></mesh>
            <mesh position={[0, 0.7, 0]} castShadow><cylinderGeometry args={[0.012, 0.012, 1.4, 10]} /><Clay color="#2b2833" /></mesh>
            <mesh position={[0, 1.42, 0]} castShadow><cylinderGeometry args={[0.13, 0.18, 0.22, 28, 1, true]} /><meshStandardMaterial color="#f3ead8" emissive="#ffb866" emissiveIntensity={0.9} roughness={0.9} side={THREE.DoubleSide} /></mesh>
            <mesh position={[0, 1.35, 0]}><sphereGeometry args={[0.05, 12, 10]} /><Glow color="#ffc27a" strength={3} /></mesh>
          </group>

          {/* 提示框 */}
          {active && ANCHORS[active] && (
            <Html position={ANCHORS[active]} zIndexRange={[30, 0]} style={{ pointerEvents: 'none' }}>
              {tooltip}
            </Html>
          )}
        </group>
      </PresentationControls>

      {/* ===== 後製：環境光遮蔽、霓虹發光、底片顆粒 ===== */}
      {/* 效能：環境光遮蔽用 performance 品質（量測後最花時間的效果）；外框只在 hover 時才開 */}
      <EffectComposer multisampling={0} enableNormalPass={false} autoClear={false}>
        {!lowPower ? <N8AO aoRadius={0.45} intensity={2.2} distanceFalloff={0.6} quality="performance" halfRes /> : <></>}
        <Bloom mipmapBlur intensity={0.85} luminanceThreshold={0.9} luminanceSmoothing={0.25} />
        {active ? <Outline blur visibleEdgeColor={0x00e5ff} hiddenEdgeColor={0x00e5ff} edgeStrength={8} width={900} /> : <></>}
        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
        <SMAA />
        <Noise premultiply blendFunction={BlendFunction.OVERLAY} opacity={0.12} />
        <Vignette offset={0.28} darkness={0.45} />
      </EffectComposer>
    </>
  );
};

export default Scene;
