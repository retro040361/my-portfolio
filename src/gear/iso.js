import React from 'react';

// 等角投影（isometric）工具
// 房間座標：x 沿右牆往右下、y 沿左牆往左下、z 往上；原點是地板最裡面的牆角
// 螢幕座標：X = O.x + (x - y)·cos30°，Y = O.y + (x + y)·sin30° - z

const COS = 0.866;
const SIN = 0.5;
export const ORIGIN = { x: 500, y: 380 };

export const iso = (x, y, z = 0) => [
  ORIGIN.x + (x - y) * COS,
  ORIGIN.y + (x + y) * SIN - z,
];

// 多個房間座標點 → SVG points 字串
export const pts = (points) => points.map(p => iso(...p).map(n => n.toFixed(1)).join(',')).join(' ');

// 把平面圖案貼到房間裡的變換矩陣：圖案的 (u, w) 對應到平面上的位置（w 往下）
// 左牆方向的平面（x = c，面向 +x），文字沿 -y 由左讀到右；(y0, z0) 是圖案左上角
export const leftPlane = (c, y0, z0) => {
  const [X, Y] = iso(c, y0, z0);
  return `matrix(${COS} ${-SIN} 0 1 ${X.toFixed(2)} ${Y.toFixed(2)})`;
};

// 右牆方向的平面（y = c，面向 +y），文字沿 +x；(x0, z0) 是圖案左上角
export const rightPlane = (x0, c, z0) => {
  const [X, Y] = iso(x0, c, z0);
  return `matrix(${COS} ${SIN} 0 1 ${X.toFixed(2)} ${Y.toFixed(2)})`;
};

// 水平面（z = c）：圖案的 (u, v) 對應到 (x0 + u, y0 + v)
export const floorPlane = (x0, y0, c) => {
  const [X, Y] = iso(x0, y0, c);
  return `matrix(${COS} ${SIN} ${-COS} ${SIN} ${X.toFixed(2)} ${Y.toFixed(2)})`;
};

// 長方體八個角在螢幕上的外框，給 hover 感應區用：[x, y, 寬, 高]
export const boxBounds = (x, y, z, w, d, h, pad = 4) => {
  const corners = [];
  [x, x + w].forEach(cx => [y, y + d].forEach(cy => [z, z + h].forEach(cz => corners.push(iso(cx, cy, cz)))));
  const xs = corners.map(c => c[0]);
  const ys = corners.map(c => c[1]);
  const minX = Math.min(...xs) - pad;
  const minY = Math.min(...ys) - pad;
  return [minX, minY, Math.max(...xs) - minX + pad, Math.max(...ys) - minY + pad];
};

// 長方體：畫看得到的三個面（頂面、+y 面在左前、+x 面在右前）
// className 會加上 -top / -left / -right，方便亮暗主題換色
export const IsoBox = ({ x, y, z = 0, w, d, h, top, left, right, className = '' }) => (
  <g>
    <polygon points={pts([[x, y + d, z], [x + w, y + d, z], [x + w, y + d, z + h], [x, y + d, z + h]])} fill={left} className={className && `${className}-left`} />
    <polygon points={pts([[x + w, y, z], [x + w, y + d, z], [x + w, y + d, z + h], [x + w, y, z + h]])} fill={right} className={className && `${className}-right`} />
    <polygon points={pts([[x, y, z + h], [x + w, y, z + h], [x + w, y + d, z + h], [x, y + d, z + h]])} fill={top} className={className && `${className}-top`} />
  </g>
);
