import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';

// 專案列表資料
const projectsData = [
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
    path: "/Users/zhangchenhao/Desktop/dailyNews/",
    gradient: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
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
    path: "~/Desktop/tvos",
    gradient: "linear-gradient(135deg, #13ab9b 0%, #067c87 100%)",
    github: null
  },
  {
    title: "個人網頁與生活儀表板 (my-portfolio)",
    emoji: "⚡",
    desc: "展現個人學經歷、技術棧與生活探險蹤跡的動態網頁。設計融合了極客情懷的開機登入序列與動漫高能量物理特效，呈現高度精緻的個人品牌形象。",
    tech: ["React", "Framer Motion", "React Router", "Vanilla CSS", "Webpack", "MarkDown Parsing"],
    features: [
      "復古 Geek 開機序列：模擬 Linux 核心啟動日誌跑正步，配合 CRT 螢幕掃描線與自動打字 GUI 登入框的融合特效。",
      "五條悟 Hollow Purple 特效：在首頁底部實作白色偏光十字星與不規則 SVG 閃電的高能物理動態震盪效果。",
      "Playground 橫向輪播：為遊戲庫、旅遊足跡與演唱會紀錄設計支援 CSS Scroll Snap 與滑動按鈕的橫移軌道。",
      "動態部落格文章分類：支援 Markdown 文章 YAML Frontmatter 解析與一鍵切換類別（技術 / 生活）的流暢 Layout 動畫。"
    ],
    path: "/Users/zhangchenhao/Desktop/html/my-portfolio",
    gradient: "linear-gradient(135deg, #8a2be2 0%, #4a00e0 100%)",
    github: "https://github.com/chenhao-zhang/my-portfolio"
  }
];

const Projects = () => {
  const [selectedProject, setSelectedProject] = useState(null);
  const [isMaximized, setIsMaximized] = useState(false);

  return (
    <motion.div 
      className="projects-container page"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div className="projects-header" variants={itemVariants}>
        <h1>My Projects</h1>
        <p className="projects-subtitle">代碼與生活交織的結晶 ── 這裡展示了我最近開發的專案與系統。點擊卡片看詳細內容！</p>
      </motion.div>

      <div className="projects-grid">
        {projectsData.map((project, idx) => (
          <motion.div 
            key={idx} 
            className="project-card-wrapper"
            variants={itemVariants}
            whileHover={{ y: -6, transition: { duration: 0.15, ease: 'easeOut' } }}
            onClick={() => setSelectedProject(project)}
            style={{ cursor: 'pointer' }}
          >
            <div className="project-card-glass" style={{ height: '100%' }}>
              {/* 卡片橫幅 */}
              <div className="project-banner" style={{ background: project.gradient }}>
                <span className="project-emoji">{project.emoji}</span>
              </div>

              {/* 卡片內容 */}
              <div className="project-content">
                <h2 className="project-title">{project.title}</h2>
                <p className="project-desc" style={{ overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', minHeight: '4.8em' }}>
                  {project.desc}
                </p>

                {/* 簡單特徵列（卡片只做預覽） */}
                <div className="project-tech-tags" style={{ marginTop: 'auto', paddingTop: '15px' }}>
                  {project.tech.slice(0, 4).map((t, tIdx) => (
                    <span key={tIdx} className="project-tech-tag">{t}</span>
                  ))}
                  {project.tech.length > 4 && <span className="project-tech-tag">+{project.tech.length - 4}</span>}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* 彈出式視窗 (Option 1 與 Option 2 混合風格的視窗) */}
      <AnimatePresence>
        {selectedProject && (
          <div className="modal-overlay" onClick={() => { setSelectedProject(null); setIsMaximized(false); }}>
            <motion.div 
              className={`modal-box retro-window ${isMaximized ? 'is-maximized' : ''}`}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()} // 阻止事件冒泡
            >
              {/* Option 2 風格：macOS/Linux 交通燈視窗標題列 */}
              <div className="login-window-header" style={{ padding: '10px 16px', background: 'var(--navbar-bg)', borderBottom: '1px solid var(--card-border)' }}>
                <div className="window-controls">
                  <span className="control-dot red" title="關閉 (Close)" onClick={() => { setSelectedProject(null); setIsMaximized(false); }}>
                    <span className="dot-icon">✕</span>
                  </span>
                  <span className="control-dot yellow" title="縮小 (Minimize)" onClick={() => { setSelectedProject(null); setIsMaximized(false); }}>
                    <span className="dot-icon">−</span>
                  </span>
                  <span className="control-dot green" title={isMaximized ? "還原 (Restore)" : "放大 (Maximize)"} onClick={() => setIsMaximized(!isMaximized)}>
                    <span className="dot-icon">{isMaximized ? '⤡' : '⤢'}</span>
                  </span>
                </div>
                <div className="window-title" style={{ color: 'var(--text-primary)', fontFamily: 'monospace', fontSize: '0.82rem' }}>
                  Terminal - {selectedProject.title.split(' ')[0]}
                </div>
                <div className="window-spacer" style={{ width: '30px' }}></div>
              </div>

              {/* 滾動內容包裝容器（讓 Cover Banner 隨捲動往上滑動消失） */}
              <div className="modal-scroll-body">
                {/* 頂部橫幅 */}
                <div className="modal-banner" style={{ background: selectedProject.gradient }}>
                  <span className="modal-emoji">{selectedProject.emoji}</span>
                </div>

                {/* 內文主體 */}
                <div className="modal-body">
                  <span className="modal-meta-label" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    📁 {selectedProject.path}
                  </span>
                  <h2 className="modal-title" style={{ fontSize: '1.65rem', marginTop: '4px', marginBottom: '10px' }}>
                    {selectedProject.title}
                  </h2>
                  <p className="project-desc" style={{ color: 'var(--text-secondary)', fontSize: '0.98rem', lineHeight: 1.6, margin: '10px 0 20px 0' }}>
                    {selectedProject.desc}
                  </p>

                  {/* 核心特色 */}
                  <div className="project-features-section" style={{ marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 10px 0' }}>
                      🔑 Key Features / 核心特色
                    </h3>
                    <ul className="project-features-list">
                      {selectedProject.features.map((feat, fIdx) => (
                        <li key={fIdx} style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{feat}</li>
                      ))}
                    </ul>
                  </div>

                  {/* 技術棧 */}
                  <div className="project-tech-section" style={{ marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 10px 0' }}>
                      🛠️ Tech Stack / 使用技術
                    </h3>
                    <div className="project-tech-tags">
                      {selectedProject.tech.map((t, tIdx) => (
                        <span key={tIdx} className="project-tech-tag">{t}</span>
                      ))}
                    </div>
                  </div>

                  <div className="modal-divider" style={{ margin: '20px 0' }} />

                  {/* 連結與路徑元資料 */}
                  <div className="project-meta" style={{ border: 'none', padding: 0 }}>
                    <div className="project-meta-item">
                      <span className="meta-label">📁 Project Directory:</span>
                      <code className="meta-value">{selectedProject.path}</code>
                    </div>
                    {selectedProject.github && (
                      <div className="project-meta-item">
                        <span className="meta-label">🔗 GitHub Repository:</span>
                        <a 
                          href={selectedProject.github} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="project-link"
                        >
                          {selectedProject.github}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// 複製動畫變量保持組件獨立性
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

export default Projects;
