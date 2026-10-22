// 專案列表資料
// slug：用於視窗標題 (~/projects/<slug>)；github 為 null 時顯示「私人專案」
export const projectsData = [
  {
    title: "自營部操盤決策報告系統 (dailyNews)",
    emoji: "📊",
    desc: "基於多維數據融合與 AI 決策引擎的股市盤後分析系統。自動整合期貨籌碼、信用交易、產業強弱勢及焦點新聞輿情，產出具專業操盤手大局觀的操作劇本。",
    tech: ["Python", "Streamlit", "Gemini API", "Pandas", "BeautifulSoup", "GNews", "Threading"],
    features: [
      "大盤總體籌碼分析：追蹤外資台指期淨空單與融資餘額的五日歷史變動軌跡。",
      "焦點新聞輿情研判：利用 GNews 爬取今日財經熱點並利用多線程並行翻譯美股新聞，再透過 Gemini 進行多空情感判定。",
      "類股資金流向監控：動態計算強弱勢板塊並提供強烈買進、觀望及減碼操作指令。",
      "持股一對一操作對策：整合營收 YoY、法人買賣超與技術指標（如布林軌道突破），動態導出具體的風控建議。"
    ],
    slug: "dailyNews",
    gradient: "linear-gradient(135deg, #04111a 0%, #003b4d 100%)",
    github: null
  },
  {
    title: "行動裝置控制電腦電視盒系統 (tvos)",
    emoji: "📱",
    desc: "將電腦轉換為電視盒的行動裝置遠端控制系統。使用者可以透過手機網頁上的虛擬 D-pad 搖控器，即時遙控電腦大螢幕上的影音串流平台與系統媒體功能。",
    tech: ["Python", "Flask", "Flask-SocketIO", "PyAutoGUI", "AppleScript", "WebSockets", "HTML5/CSS3"],
    features: [
      "零延遲雙向通訊：使用 WebSockets (Socket.IO) 實現手機按鍵與電腦端操作的毫秒級同步響應。",
      "系統級虛擬按鍵模擬：利用 PyAutoGUI 模擬物理方向鍵、Enter 與 Backspace，完美相容 YouTube TV、Netflix 等平台。",
      "macOS 媒體深度整合：透過 AppleScript 控制主機系統的音量微調（+6%/-6%）、靜音與播放暫停。",
      "大螢幕專屬 UI 同步：具備電視專用的 tv.html 介面，支援音效合成、卡片焦點狀態的同步動態追蹤。"
    ],
    slug: "tvos",
    gradient: "linear-gradient(135deg, #0d1400 0%, #3a4d00 100%)",
    github: null
  },
  {
    title: "個人網頁與生活儀表板 (my-portfolio)",
    emoji: "⚡",
    desc: "展現個人學經歷、技術棧與生活探險蹤跡的動態網頁。設計融合了極客情懷的開機登入序列與動漫高能量物理特效，呈現高度精緻的個人品牌形象。",
    tech: ["React", "Framer Motion", "React Router", "Vanilla CSS", "Webpack", "Markdown Parsing"],
    features: [
      "復古 Geek 開機序列：模擬 Linux 核心啟動日誌跑正步，配合 CRT 螢幕掃描線與自動打字 GUI 登入框的融合特效。",
      "五條悟 Hollow Purple 特效：在首頁底部實作白色偏光十字星與不規則 SVG 閃電的高能物理動態震盪效果。",
      "Playground 橫向輪播：為遊戲庫、旅遊足跡與演唱會紀錄設計支援 CSS Scroll Snap 與滑動按鈕的橫移軌道。",
      "動態部落格文章分類：支援 Markdown 文章 YAML Frontmatter 解析與一鍵切換類別（技術 / 生活）的流暢 Layout 動畫。"
    ],
    slug: "my-portfolio",
    gradient: "linear-gradient(135deg, #1a0412 0%, #4d0030 100%)",
    github: "https://github.com/retro040361/my-portfolio"
  }
];
