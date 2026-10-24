import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Box, Clay, XboxController } from './parts';

// 坐在電競椅上的人（面向 -x 的書桌），整個人以 z 為中心擺放：
// 男生戴 Sony 耳機，16 秒一輪：前 55% 打字、後面拿起 Xbox 手把打遊戲，姿勢之間 0.6 秒平滑過渡
// 女生是棕色長髮，一直在打字

const SKIN = '#e0a983';
const LOOKS = {
  boy: { top: '#3d3d58', collar: '#34344c', pants: '#2a2a3a', hair: '#2b1d14' },
  girl: { top: '#e9dccb', collar: '#dccdb9', pants: '#3b4a6b', hair: '#6b3f22' },
};
const CENTER_Z = 0;
const CYCLE = 16;

// 兩個關節之間的膠囊（手臂、腿）
const Limb = ({ from, to, radius, color }) => {
  const ref = useRef();
  const up = useMemo(() => new THREE.Vector3(0, 1, 0), []);
  const tmp = useMemo(() => ({ a: new THREE.Vector3(), b: new THREE.Vector3(), dir: new THREE.Vector3() }), []);

  useFrame(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const a = typeof from === 'function' ? from() : from;
    const b = typeof to === 'function' ? to() : to;
    tmp.a.set(...a);
    tmp.b.set(...b);
    tmp.dir.subVectors(tmp.b, tmp.a);
    const len = tmp.dir.length();
    mesh.position.copy(tmp.a).add(tmp.b).multiplyScalar(0.5);
    mesh.quaternion.setFromUnitVectors(up, tmp.dir.normalize());
    mesh.scale.set(1, Math.max(0.01, len / 0.2), 1);
  });

  return (
    <mesh ref={ref} castShadow>
      <capsuleGeometry args={[radius, 0.2 - radius * 2 > 0 ? 0.2 - radius * 2 : 0.01, 6, 12]} />
      <Clay color={color} />
    </mesh>
  );
};

const POSES = {
  type: {
    elbowL: [0.98, 0.83, CENTER_Z + 0.27], handL: [0.63, 0.86, CENTER_Z + 0.11],
    elbowR: [0.98, 0.83, CENTER_Z - 0.27], handR: [0.63, 0.86, CENTER_Z - 0.11],
  },
  play: {
    elbowL: [1.0, 0.8, CENTER_Z + 0.25], handL: [0.88, 0.93, CENTER_Z + 0.075],
    elbowR: [1.0, 0.8, CENTER_Z - 0.25], handR: [0.88, 0.93, CENTER_Z - 0.075],
  },
};
const SHOULDER_L = [1.15, 1.02, CENTER_Z + 0.21];
const SHOULDER_R = [1.15, 1.02, CENTER_Z - 0.21];

const lerp3 = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);

// 目前「打遊戲」的比重（0 = 打字，1 = 打遊戲）
const playWeight = (t) => {
  const p = (t % CYCLE) / CYCLE;
  const smooth = (x) => x * x * (3 - 2 * x);
  const fade = 0.6 / CYCLE;
  if (p < 0.55) return 0;
  if (p < 0.55 + fade) return smooth((p - 0.55) / fade);
  if (p < 0.95) return 1;
  if (p < 0.95 + fade) return 1 - smooth((p - 0.95) / fade);
  return 0;
};

export const usePlayWeight = () => {
  const weight = useRef(0);
  useFrame((state) => { weight.current = playWeight(state.clock.elapsedTime); });
  return weight;
};

const Person = ({ z = 0, variant = 'boy', playRef, phase = 0, wrapHeadphones = (node) => node, wrapController = (node) => node }) => {
  const look = LOOKS[variant];
  const HOODIE = look.top;
  const PANTS = look.pants;
  const HAIR = look.hair;
  const girl = variant === 'girl';
  const joints = useRef({ ...POSES.type });
  const head = useRef();
  const controller = useRef();

  useFrame((state) => {
    const t = state.clock.elapsedTime + phase;
    const w = playRef ? playRef.current : 0;
    const tap = (1 - w) * 0.012;
    const j = joints.current;
    ['elbowL', 'elbowR', 'handL', 'handR'].forEach(k => { j[k] = lerp3(POSES.type[k], POSES.play[k], w); });
    j.handL = [j.handL[0], j.handL[1] + Math.max(0, Math.sin(t * 22)) * tap, j.handL[2]];
    j.handR = [j.handR[0], j.handR[1] + Math.max(0, Math.sin(t * 22 + 1.7)) * tap, j.handR[2]];
    // 打遊戲時手把跟著手微微晃動
    if (controller.current) {
      controller.current.visible = w > 0.5;
      controller.current.position.set(0.86, 0.95 + Math.sin(t * 18) * 0.003 * w, CENTER_Z);
    }
    if (head.current) {
      head.current.position.y = Math.sin(t * 2.4) * 0.006;
      head.current.rotation.z = 0.12 - w * 0.08;
      // 女生偶爾歪頭看一下程式
      if (girl) head.current.rotation.x = Math.sin(t * 0.35) * 0.08;
    }
  });

  const get = (k) => () => joints.current[k];

  return (
    <group position={[0, 0, z]}>
      {/* 腿：大腿往前伸到桌下、小腿往下 */}
      {[1, -1].map(side => (
        <group key={side}>
          <Limb from={[1.12, 0.52, CENTER_Z + side * 0.1]} to={[0.8, 0.53, CENTER_Z + side * 0.13]} radius={0.075} color={PANTS} />
          <Limb from={[0.8, 0.53, CENTER_Z + side * 0.13]} to={[0.76, 0.12, CENTER_Z + side * 0.14]} radius={0.06} color={PANTS} />
          <Box p={[0.72, 0.05, CENTER_Z + side * 0.14]} s={[0.2, 0.08, 0.1]} c="#e8e8ee" r={0.035} />
        </group>
      ))}

      {/* 身體（帽 T，微微往前傾） */}
      <Box p={[1.17, 0.8, CENTER_Z]} s={[0.24, 0.52, 0.42]} c={HOODIE} r={0.09} rot={[0, 0, 0.12]} />
      <Box p={[1.24, 1.02, CENTER_Z]} s={[0.1, 0.1, 0.24]} c={look.collar} r={0.045} />
      <mesh position={[1.13, 1.08, CENTER_Z]} castShadow>
        <cylinderGeometry args={[0.045, 0.05, 0.09, 14]} />
        <Clay color={SKIN} />
      </mesh>

      {/* 手臂與手 */}
      <Limb from={SHOULDER_L} to={get('elbowL')} radius={0.055} color={HOODIE} />
      <Limb from={get('elbowL')} to={get('handL')} radius={0.048} color={HOODIE} />
      <Limb from={SHOULDER_R} to={get('elbowR')} radius={0.055} color={HOODIE} />
      <Limb from={get('elbowR')} to={get('handR')} radius={0.048} color={HOODIE} />
      <Hand get={get('handL')} />
      <Hand get={get('handR')} />

      {/* 拿在手上的手把（打遊戲時才出現） */}
      {!girl && (
        <group ref={controller} visible={false}>
          {wrapController(<XboxController rotation={[0, 0, -0.5]} />)}
        </group>
      )}

      {/* 長髮披在背上（頭的後面是 +x），兩側垂到肩膀前 */}
      {girl && (
        <group position={[1.09, 1.21, CENTER_Z]}>
          <mesh position={[0.08, -0.2, 0]} scale={[0.07, 0.3, 0.13]} castShadow>
            <sphereGeometry args={[1, 24, 18]} />
            <Clay color={HAIR} />
          </mesh>
          {[1, -1].map(side => (
            <mesh key={side} position={[0.02, -0.14, side * 0.1]} scale={[0.05, 0.21, 0.035]} rotation={[side * 0.12, 0, 0]} castShadow>
              <sphereGeometry args={[1, 18, 14]} />
              <Clay color={HAIR} />
            </mesh>
          ))}
        </group>
      )}

      {/* 頭、頭髮、耳朵、耳機 */}
      <group position={[1.09, 1.21, CENTER_Z]}>
        <group ref={head}>
          <mesh castShadow>
            <sphereGeometry args={[0.11, 32, 24]} />
            <Clay color={SKIN} />
          </mesh>
          <mesh position={[0.018, 0.022, 0]} scale={[1, 0.95, 1.02]} castShadow>
            <sphereGeometry args={[0.112, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.62]} />
            <Clay color={HAIR} />
          </mesh>
          <mesh position={[0.03, 0, 0]} scale={[0.95, 1, 1.03]}>
            <sphereGeometry args={[0.108, 24, 18, Math.PI * 0.5, Math.PI, 0, Math.PI * 0.8]} />
            <Clay color={HAIR} />
          </mesh>
          {/* 女生的瀏海 */}
          {girl && (
            <mesh position={[-0.02, 0.05, 0]} scale={[1, 0.75, 1.06]}>
              <sphereGeometry args={[0.112, 28, 20, Math.PI * 1.5, Math.PI, 0, Math.PI * 0.45]} />
              <Clay color={HAIR} />
            </mesh>
          )}
          {!girl && wrapHeadphones(
            <group>
            <mesh rotation={[0, Math.PI / 2, 0]} position={[0, 0.005, 0]} castShadow>
              <torusGeometry args={[0.128, 0.015, 12, 36, Math.PI]} />
              <Clay color="#1d1d22" rough={0.6} />
            </mesh>
            {[1, -1].map(side => (
              <group key={side} position={[0, -0.012, side * 0.122]}>
                <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
                  <cylinderGeometry args={[0.055, 0.058, 0.045, 24]} />
                  <Clay color="#1e1e23" rough={0.55} />
                </mesh>
                <mesh position={[0, 0.06, side * 0.004]}>
                  <boxGeometry args={[0.012, 0.03, 0.01]} />
                  <meshStandardMaterial color="#9a9da3" metalness={0.6} roughness={0.35} />
                </mesh>
              </group>
            ))}
            <mesh position={[0.03, -0.04, 0.147]}>
              <sphereGeometry args={[0.004, 8, 6]} />
              <meshBasicMaterial color={new THREE.Color('#22c55e').multiplyScalar(3)} toneMapped={false} />
            </mesh>
            </group>
          )}
        </group>
      </group>
    </group>
  );
};

const Hand = ({ get }) => {
  const ref = useRef();
  useFrame(() => { if (ref.current) ref.current.position.set(...get()); });
  return (
    <mesh ref={ref} castShadow>
      <sphereGeometry args={[0.042, 16, 12]} />
      <Clay color={SKIN} />
    </mesh>
  );
};

export default Person;
