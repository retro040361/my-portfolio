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
    title: "個人網站 Retro's Space (my-portfolio)",
    emoji: "⚡",
    desc: "就是你現在在看的這個網站。放我的經歷、專案、部落格，還有玩過的遊戲、去過的地方跟看過的演唱會。整體風格參考 Watch Dogs 2 的 DedSec。",
    tech: ["React", "React Router", "Motion", "react-markdown", "CSS", "GitHub Pages"],
    features: [
      "開場動畫：開機文字跑完之後，噴漆風格的 R 一筆一筆畫出來，再接上 RETRO_OS 的標題條，最後閃一下切回首頁。",
      "兩套主題：深色是 DedSec（黑底、洋紅和青色、故障字），淺色是 WD1 的 ctOS 系統介面。",
      "部落格：文章直接寫 Markdown，build 時用腳本掃描產生文章列表，順便抓封面和算閱讀時間；文章頁有目錄、閱讀進度條和上一篇／下一篇。",
      "Playground：遊戲有進度條跟破關狀態，演唱會照年份排成時間軸，旅行足跡用卡片呈現。"
    ],
    slug: "my-portfolio",
    gradient: "linear-gradient(135deg, #1a0412 0%, #4d0030 100%)",
    github: "https://github.com/retro040361/my-portfolio"
  }
];
