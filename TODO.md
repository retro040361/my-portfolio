# TODO / 改版紀錄

## ✅ 已完成（2026-10-21）

### 錯誤修正
- [x] LinkedIn 連結補上 `https://`（原本會變成站內 404）
- [x] GitHub 連結改成 `github.com/retro040361`（原本是 `/dashboard`）
- [x] my-portfolio 專案的 repo 連結改成 `retro040361/my-portfolio`
- [x] 移除範例信箱 `retro@example.com`（`EMAIL` 留空時不顯示 Email 按鈕）
- [x] Projects 不再顯示本機路徑 `/Users/...`，改成 GitHub 按鈕或「私人專案」標籤
- [x] 分頁標題、meta description、Open Graph、manifest 改成 Retro's Space
- [x] 兩筆「京都、大阪」旅行的 React key 重複 → 改用「標題＋日期」當 key
- [x] 錯字：biundary、重複的 Xorg 那行、maintainance、Maching Learning、charater
- [x] `framer-motion` import 改成 `motion/react`
- [x] 壞掉的 CRA 預設測試換成 `resolveMediaUrl` / `stripFrontmatter` 的單元測試
- [x] 大頭貼 1.1MB PNG → 61KB WebP
- [x] 刪除 `STOCK_DAY_ALL.json`、重複的 `jj_timeline.jpeg`、`logo.svg`、CRA 殘留 CSS
- [x] README 改寫成這個網站的說明

### 程式架構
- [x] Markdown 渲染（`resolveMediaUrl`、`VideoPlayer`、`markdownComponents`）抽到 `src/shared/markdown.js`
- [x] 三個頁面的 Modal 合成 `src/shared/RetroModal.js`：Esc 關閉、按鈕可用鍵盤操作、開啟時鎖定背景捲動
- [x] 資料抽到 `src/data/`：`profile.js`（社群連結、分類設定）、`projects.js`、`playground.js`
- [x] 新的樣式放在 `src/styles/ui.css`
- [x] 卡片改成 `<button>` / `<Link>`，可以用鍵盤操作

### UI
- [x] 品牌色統一為茈紫（`--accent`），移除 React 藍 `#61dafb`；分類色改成靛藍／粉紫
- [x] 字型：Noto Sans TC（內文）＋ JetBrains Mono（終端機元素）
- [x] emoji 圖示換成 react-icons 的 SVG（社群、主題切換、選單）
- [x] 終端機元素：Logo `~/retro▌`、各頁 `~/blog` 路徑標籤、Modal 標題 `~/projects/<slug>`、Footer `retro@space:~$ logout`
- [x] 導覽列標出目前頁面；手機版改成漢堡選單（不再超出畫面）
- [x] 新增 Footer
- [x] 主題預設跟隨系統，並在 React 載入前先套用，避免閃白
- [x] 首頁：加上一句自我介紹（入口卡片與五條悟主視覺後來依需求拿掉）
- [x] Blog：卡片顯示封面（frontmatter `cover`，沒有則自動抓第一張圖）與閱讀時間，點了直接進文章頁；分類篩選會記在網址上
- [x] 文章頁：標題列、h2/h3 自動產生目錄（桌機固定在側邊，手機可收合）、閱讀進度條、上一篇／下一篇
- [x] Playground：遊戲狀態統一為「進行中／已破主線」＋進度條百分比；演唱會改成依年份排列的時間軸；分頁會記在網址上（`?tab=concerts`）
- [x] About：Skills 分成「研究與機器學習／工作 EDA／這個網站用到的」三組
- [x] Modal 的黃色按鈕改成純裝飾（原本按了效果和關閉一樣）

### DedSec 主題（Watch Dogs 風格，`src/styles/dedsec.css`）
- [x] 深色模式 = DedSec：黑底細格線＋掃描線，螢光洋紅／青／黃三色
- [x] 淺色模式 = ctOS（WD1 Blume 系統介面）：淺灰底、ctOS 青
- [x] 字型：標題 Chakra Petch、像素字 VT323、終端機 JetBrains Mono
- [x] 頁面大標題加上 RGB 分離的故障（glitch）效果；首頁標題改成 `RETRO//SPACE`
- [x] 卡片去掉圓角和柔和陰影，改成 HUD 角框；滑過時出現硬邊位移陰影
- [x] 封面圖加掃描線，滑過時 RGB 分離＋提高對比
- [x] 專案橫幅的 emoji 換成 `$ dailyNews` 這種終端機字樣；沒有封面的文章顯示 `<tech/>`、`life.log`
- [x] About 個人卡片加上 WD 風格的 Profiler（NAME / OCCUPATION / INCOME [CLASSIFIED] / NOTE）
- [x] 標題拿掉 emoji 和中英對照，改成 `01 FROM ME TO MYSELF`、`// key features` 等格式
- [x] 導覽列：小寫等寬字，目前頁面顯示 `> blog` 洋紅色塊
- [x] 社群按鈕改成統一的外框樣式

### 首頁開場動畫（取代原本的開機畫面＋登入視窗）
- [x] 新增 `src/HomeIntro.js`：快速捲過開機文字 → 噴漆風格的 R 字標誌逐筆畫出，加一道洋紅劃痕 → `RETRO_OS` 標題條橫跨標誌（仿 Watch Dogs 2 Logo）→ 故障效果切到 `RETRO//SPACE`
- [x] 每個 session 只自動播放一次；首頁的 `$ sudo reboot` 按鈕可以重播
- [x] 按任意鍵或點擊畫面可跳過；開啟「減少動態效果」時直接略過
- [x] 移除舊的 `BootLoader.js`（開機文字＋自動登入視窗）及其樣式
- [x] 移除首頁的五條悟主視覺、茈光球與閃電特效及其樣式

## 📝 需要你自己補的
- [ ] **重新部署**：`npm run deploy`（線上版還停在 8/3，大頭貼和圖片路徑都是壞的）
- [ ] **Email**：在 `src/data/profile.js` 填入 `EMAIL`，就會出現 Email 按鈕
- [ ] **Playground 心得**（目前顯示「心得撰寫中…」，位置在 `src/data/playground.js` 搜尋 `TODO`）
  - [ ] Elden Ring：原文寫已擊敗瑪蓮妮亞、全成就白金，和 10% 進度不符
  - [ ] 曠野之息：短評和心得原本是複製王國之淚的
  - [ ] back number：心得原本是複製 TWICE 那場的
- [ ] 確認其他心得的細節是否屬實，例如 JJ20 周杰倫上台、優里用中文和歌迷對話、京都行程等
- [ ] 履歷 PDF：放到 `public/` 後，在 About 加上下載按鈕
- [ ] 文章可以在 frontmatter 加 `cover:` 自訂封面

## 💡 之後可以考慮
- [ ] Create React App 已停止維護，可以遷移到 Vite
- [ ] 旅行足跡做成地圖
- [ ] `App.css`（約 2,600 行）依頁面拆分
