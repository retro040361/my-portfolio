# 新增文章的流程

每篇文章是一個資料夾：`public/posts/<網址名稱>/index.md`，文章用到的圖片放在同一個資料夾。

```
public/posts/
  tokyo-trip-2026/
    index.md        ← 文章
    asakusa.jpg     ← 這篇用到的圖片
    shibuya.jpg
```

**一句話版本：** `npm run new-post` → `npm start` 預覽 → 寫 `index.md`、把照片丟進同一個資料夾用 `![](./照片.jpg)` 引用 → 刪掉 `draft: true` → `npm run deploy` → commit

---

## 1. 建立文章

```bash
npm run new-post
```

會一步一步問你：

- **文章標題**：中文可以，例如 `東京五天四夜`
- **網址名稱**：只能用小寫英文、數字和 `-`，例如 `tokyo-trip-2026`，網址就是 `#/blog/tokyo-trip-2026`（直接 Enter 用建議的名稱）
- **分類**：`tech` 或 `life`
- **標籤**：用逗號分開，例如 `旅遊, 日本`，可以留空

完成後會建立 `public/posts/tokyo-trip-2026/index.md`，預設是草稿。

## 2. 開啟預覽

```bash
npm start
```

開著不要關。草稿在 `npm start` 時看得到（列表上會標「草稿」），改文章、加圖片會自動更新，不用重開。

## 3. 寫文章

打開 `index.md`，上面是文章資訊（frontmatter），下面寫內文：

```markdown
---
title: "東京五天四夜"
date: 2026-10-24
category: life
tags: ["旅遊", "日本"]
excerpt: ""       # 列表上的摘要，留空會自動抓內文前 100 字
# cover: ./cover.jpg   # 封面，沒寫會用文章第一張圖
draft: true       # 寫完把這行刪掉才會發佈
---

第一天到了淺草...

## 第一天

內文用一般的 Markdown 寫，`##` 是段落標題（3 個以上會自動產生目錄）。
```

注意：

- 標題有 `[ ] : #` 之類的符號時要加引號，例如 `title: "[遊記] 東京"`
- 日期格式是 `YYYY-MM-DD`，例如 `2026-10-24`
- 舊文章有 `id:` 是舊網址（`#/blog/7`）轉址用的，新文章不用寫

## 4. 貼圖片

**直接把照片丟進文章的資料夾**（跟 `index.md` 放一起），在文章裡用 `./檔名` 引用：

```markdown
![淺草寺](./asakusa.jpg)
```

**多張圖並排**：寫在同一行、中間空一格：

```markdown
![](./a.jpg) ![](./b.jpg) ![](./c.jpg)
```

想固定一行幾張，也可以用 HTML：

```html
<div class="img-grid-2">
  <img src="./a.jpg" alt="圖1" />
  <img src="./b.jpg" alt="圖2" />
</div>
```

**封面**：沒寫的話自動用文章第一張圖；要指定就在 frontmatter 加 `cover: ./cover.jpg`。

**共用圖庫**：想用 `public/image/` 裡的圖，路徑寫 `/image/xxx.jpg`。

**影片**：一樣放進資料夾，用 `![](./clip.mp4)` 引用。建議先用 ffmpeg 轉檔縮小：

```bash
ffmpeg -i input.mov -vcodec libx264 -crf 23 -preset fast -acodec aac clip.mp4
```

**YouTube**：直接貼連結 `[影片](https://youtu.be/xxxx)`，會自動變成播放器。

小提醒：

- 圖片不用自己縮：超過 300KB 的照片會自動壓縮成網頁適合的大小，原圖備份在專案根目錄的 `.image-originals/`（不進 git、不部署）
- 檔名建議用英文、不要有空格，例如 `day1-ramen.jpg`

## 5. 檢查

在 `npm start` 開的網頁上看文章，確認排版和圖片都正常。

如果文章有問題（缺標題、日期格式錯、網址重複、圖片檔名打錯…），終端機會出現 `❌` 並列出是哪一篇、哪個檔案，照著修就好。

## 6. 發佈

1. 把 `index.md` 裡的 `draft: true` 那行刪掉
2. 部署：

   ```bash
   npm run deploy
   ```

   會自動檢查文章、壓縮圖片、產生 RSS，再上傳到 GitHub Pages。檢查沒過就不會部署，壞掉的文章不會被發佈出去。

3. 把文章 commit 進 git（不然只有網站上有，repo 裡沒有）

---

## 其他指令

```bash
npm run posts      # 只重新產生文章索引（順便檢查文章有沒有問題）
npm run compress   # 只壓縮圖片
```

多圖並排的更多寫法見專案根目錄的 [usages.md](../../usages.md)。
