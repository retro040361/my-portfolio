# Retro's Space

Retro 的個人網站：自我介紹、專案、部落格，以及遊戲／旅行／演唱會紀錄。

🔗 https://retro040361.github.io/my-portfolio/

## 技術

- React 19 + React Router 7（HashRouter，部署在 GitHub Pages）
- Motion（Framer Motion）做頁面與元件動畫
- react-markdown + rehype-raw 渲染部落格文章
- react-icons 提供 SVG 圖示
- three.js + React Three Fiber 做 Archive（`#/archive`，原 Playground）的 3D 電競房間
- Create React App 建置

## 專案結構

```
public/
  posts/<網址>/      每篇文章一個資料夾：index.md + 這篇用到的圖片
  image/            Archive 等共用的圖片
scripts/
  generate-posts.js 檢查文章並產生 src/data/posts-metadata.json 與 public/rss.xml
  new-post.js       建立新文章（npm run new-post）
  compress-images.js 壓縮 public/image 與 public/posts 下超過 300KB 的圖片（原圖備份在 .image-originals/）
src/
  App.js            導覽列、Footer、路由
  Home.js / About.js / Projects.js / Blog.js / BlogPost.js / Playground.js（Archive 頁）
  HomeIntro.js      首頁開場動畫：開機文字 → RETRO_OS 噴漆標誌（可按任意鍵跳過）
  data/             網站內容：profile、projects、playground、文章索引
  shared/           共用元件：Markdown 渲染、RetroModal
  styles/ui.css     導覽列、首頁開場動畫、部落格與時間軸等樣式
  styles/dedsec.css Watch Dogs 主題（深色 DedSec / 淺色 ctOS）
  gear3d/           Archive 的 3D 電競房間（three.js / React Three Fiber）
  gear/             電競房間的 SVG 備用版（不支援 WebGL 時使用）
```

## 新增文章

完整流程（寫文章、貼圖片、發佈）見 [public/posts/README.md](public/posts/README.md)。

```bash
npm run new-post        # 一步一步問標題、網址、分類、標籤
```

會建立 `public/posts/<網址>/index.md`，網址就是 `#/blog/<網址>`（只能用小寫英文、數字和 `-`）：

```markdown
---
title: "文章標題"        # 有 [ ] : # 之類的符號時要加引號
date: 2026-10-24
category: tech           # tech 或 life
tags: ["React", "心得"]   # 選填，文章頁和列表可以用標籤篩選
excerpt: "列表上的摘要"   # 選填，沒寫會自動抓內文前 100 字
cover: ./cover.jpg       # 選填，沒寫會用文章第一張圖
draft: true              # 草稿：npm start 看得到，部署時不會發佈；寫完把這行刪掉
---

內文...

![說明](./photo.jpg)      <!-- 圖片放在同一個資料夾 -->
```

- 文章有問題（缺標題、日期格式錯、網址重複、圖片找不到…）時，`npm start` / `npm run build` 會列出所有問題並停止，壞掉的文章不會被部署
- `npm start` 時改文章會自動更新列表，不用重開
- 舊文章的 `id:` 是舊網址（`#/blog/7`）用的，會自動轉到新網址；新文章不用寫
- 部署時會一起產生 RSS（`/rss.xml`）
- 多圖並排、影片嵌入的寫法見 [usages.md](usages.md)

## 指令

```bash
npm start        # 開發模式（含草稿）
npm run new-post # 建立新文章
npm test         # 單元測試
npm run deploy   # build 並部署到 gh-pages
```
