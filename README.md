# Retro's Space

Retro 的個人網站：自我介紹、專案、部落格，以及遊戲／旅行／演唱會紀錄。

🔗 https://retro040361.github.io/my-portfolio/

## 技術

- React 19 + React Router 7（HashRouter，部署在 GitHub Pages）
- Motion（Framer Motion）做頁面與元件動畫
- react-markdown + rehype-raw 渲染部落格文章
- react-icons 提供 SVG 圖示
- three.js + React Three Fiber 做 Playground 的 3D 電競房間
- Create React App 建置

## 專案結構

```
public/
  posts/            部落格文章（Markdown + YAML frontmatter）
  image/            文章與 Playground 用的圖片
scripts/
  generate-posts.js 掃描 posts/ 產生 src/data/posts-metadata.json
  compress-images.js 壓縮 public/image 下超過 300KB 的圖片
src/
  App.js            導覽列、Footer、路由
  Home.js / About.js / Projects.js / Blog.js / BlogPost.js / Playground.js
  HomeIntro.js      首頁開場動畫：開機文字 → RETRO_OS 噴漆標誌（可按任意鍵跳過）
  data/             網站內容：profile、projects、playground、文章索引
  shared/           共用元件：Markdown 渲染、RetroModal
  styles/ui.css     導覽列、首頁開場動畫、部落格與時間軸等樣式
  styles/dedsec.css Watch Dogs 主題（深色 DedSec / 淺色 ctOS）
  gear3d/           Playground 的 3D 電競房間（three.js / React Three Fiber）
  gear/             電競房間的 SVG 備用版（不支援 WebGL 時使用）
```

## 新增文章

在 `public/posts/` 新增 `<id>.md`：

```markdown
---
id: 8
title: 文章標題
date: 2026-10-21
category: tech        # tech 或 life
excerpt: 列表上的摘要
cover: /image/xxx.jpg # 選填，沒填會自動抓文章第一張圖
---

內文...
```

`npm start` / `npm run build` 會自動重新產生文章索引。多圖並排、影片嵌入的寫法見 [usages.md](usages.md)。

## 指令

```bash
npm start        # 開發模式
npm test         # 單元測試
npm run deploy   # build 並部署到 gh-pages
```
