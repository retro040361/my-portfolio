import React, { useState, useCallback, useEffect, Suspense, lazy } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { LuGamepad2, LuPlane, LuMusic, LuMapPin, LuMonitor } from 'react-icons/lu';
import { games, travels, concerts } from './data/playground';
import RetroModal from './shared/RetroModal';
import GearRoom from './GearRoom';
import './styles/gear.css';
import { resolveMediaUrl } from './shared/markdown';
import blogPosts from './data/posts-metadata.json';

// 3D 電競房間：只有打開 Setup 分頁才下載 three.js
const GearRoom3D = lazy(() => import('./gear3d/GearRoom3D'));

// 檢查 WebGL：supported 是否能用，software 是否只能用 CPU 算（瀏覽器關了硬體加速、
// 顯示卡驅動有問題時，Chrome / Edge 會改用 SwiftShader 之類的軟體繪製，3D 會非常卡）
const detectWebGL = () => {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) return { supported: false, software: false };
    const info = gl.getExtension('WEBGL_debug_renderer_info');
    const renderer = String(info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER));
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return { supported: true, software: /swiftshader|llvmpipe|softpipe|software|basic render/i.test(renderer) };
  } catch {
    return { supported: false, software: false };
  }
};

// 3D 版出錯時（例如 WebGL 建立失敗）退回 SVG 版，並寫出原因方便排查
class FallbackBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error) {
    console.error('3D 房間載入失敗，改用 2D 版：', error);
  }

  render() {
    const { error } = this.state;
    return error ? <FlatRoom reason={`3D 場景載入失敗（${error.message || error}）`} /> : this.props.children;
  }
}

// 2D（SVG）版，下面寫出為什麼沒有顯示 3D（action 是額外的按鈕，例如「還是要載入 3D」）
const FlatRoom = ({ reason, action }) => (
  <>
    <p className="gear-fallback-note">
      {`// 目前顯示 2D 版：${reason}`}
      {action}
    </p>
    <GearRoom />
  </>
);

// 進到 Playground 後趁瀏覽器閒置時先下載 3D 程式，切到 Setup 分頁時就不用等
const prefetchGearRoom = () => {
  const run = () => import('./gear3d/GearRoom3D');
  if (window.requestIdleCallback) window.requestIdleCallback(run, { timeout: 4000 });
  else setTimeout(run, 2000);
};

// 不支援 WebGL 時用 SVG 版；開啟「減少動態效果」時還是 3D，只是不自動播動畫
// 只能用 CPU 繪製時先顯示 2D 版，使用者可以自己選擇載入 3D（會用最低畫質、不自動播動畫）
const SetupRoom = () => {
  const [webgl] = useState(detectWebGL);
  const [reducedMotion] = useState(() => !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
  const [forced3D, setForced3D] = useState(false);
  if (!webgl.supported) return <FlatRoom reason="這個瀏覽器不支援 WebGL（或關閉了硬體加速）" />;
  if (webgl.software && !forced3D) {
    return (
      <FlatRoom
        reason="瀏覽器沒有開啟硬體加速，3D 只能用 CPU 算會很卡（Chrome / Edge：設定 → 系統 → 開啟「使用圖形加速功能」後重新啟動）"
        action={<button type="button" className="filter-btn gear-force-3d" onClick={() => setForced3D(true)}>還是要載入 3D</button>}
      />
    );
  }
  return (
    <FallbackBoundary>
      <Suspense fallback={<div className="gear-loading">$ loading 3D scene…</div>}>
        <GearRoom3D
          reducedMotion={reducedMotion || webgl.software}
          forceLowPower={webgl.software}
          motionNote={webgl.software ? '沒有硬體加速，已用最低畫質並暫停動畫；滑鼠移上去可以互動' : undefined}
        />
      </Suspense>
    </FallbackBoundary>
  );
};

// Stagger 容器動畫
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

// 子卡片滑入動畫
const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15,
    },
  },
};

// 進度條動畫
const progressVariants = (percent) => ({
  hidden: { width: 0 },
  visible: {
    width: `${percent}%`,
    transition: { duration: 1, ease: 'easeOut', delay: 0.2 }
  }
});

const GAME_STATUS = {
  playing: { label: '進行中', className: 'is-playing' },
  cleared: { label: '已破主線', className: 'is-cleared' },
};

const TABS = [
  { key: 'games', label: 'Game', Icon: LuGamepad2 },
  { key: 'travels', label: 'Travel', Icon: LuPlane },
  { key: 'concerts', label: 'Concerts', Icon: LuMusic },
  { key: 'setup', label: 'Setup', Icon: LuMonitor },
];

const getItemTitle = (item) => item.title || item.country || item.artist;
const getItemKey = (item) => `${getItemTitle(item)}-${item.period || ''}`;

// 國旗 emoji 在 Windows 上會變成「JP」兩個字母，改成拆出國家代碼、用文字標籤顯示
const splitFlag = (text = '') => {
  const match = text.match(/^([\u{1F1E6}-\u{1F1FF}]{2})\s*/u);
  if (!match) return { code: null, text };
  const code = [...match[1]].map(ch => String.fromCharCode(ch.codePointAt(0) - 0x1F1E6 + 65)).join('');
  return { code, text: text.slice(match[0].length) };
};
const ItemTitle = ({ item }) => {
  const { code, text } = splitFlag(getItemTitle(item));
  return (
    <>
      {code && <span className="country-code">{code}</span>}
      {text}
    </>
  );
};

// 星等：資料裡的 ⭐ 數量 → 等寬方塊 ■■■■□
const RATING_MAX = 5;
const Rating = ({ rating }) => {
  const count = rating ? [...rating].filter(ch => ch === '⭐').length : 0;
  if (!count) return null;
  return (
    <span className="game-rating" aria-label={`評分 ${count} / ${RATING_MAX}`}>
      <span className="is-on">{'■'.repeat(count)}</span>
      <span className="is-off">{'□'.repeat(Math.max(0, RATING_MAX - count))}</span>
      <span className="game-rating-num">{count}/{RATING_MAX}</span>
    </span>
  );
};

// 進度說明：資料可以寫 progressLabel（例如「主線」「全成就」），沒寫就顯示「進度」
const progressText = (item) => `${item.progressLabel || '進度'} ${item.percent}%`;

// 已發佈的文章（旅行卡片可以用 post: '<slug>' 連到遊記；草稿在正式網站不會出現）
const postBySlug = Object.fromEntries(blogPosts.map(p => [p.slug, p]));

// 有寫詳細心得才能點開；沒寫的卡片只顯示、不能點
const hasDetail = (item) => !!item.detailedThoughts;

// 演唱會依年份分組，呈現時間軸
const concertsByYear = concerts.reduce((groups, concert) => {
  const year = concert.period.slice(0, 4);
  const group = groups.find(g => g.year === year);
  if (group) group.items.push(concert);
  else groups.push({ year, items: [concert] });
  return groups;
}, []);

// 遊戲卡片：像遊戲庫一樣的直式封面，平台與狀態標在封面上
const GameCard = ({ item, onSelect }) => {
  const status = GAME_STATUS[item.status];
  const clickable = hasDetail(item);
  const Tag = clickable ? motion.button : motion.div;
  return (
    <Tag
      type={clickable ? 'button' : undefined}
      className={`project-card-wrapper game-card-wrapper ${clickable ? 'card-button' : 'is-static'}`}
      variants={itemVariants}
      whileHover={clickable ? { y: -6, transition: { duration: 0.15, ease: 'easeOut' } } : undefined}
      onClick={clickable ? () => onSelect(item) : undefined}
    >
      <div className="project-card-glass game-card">
        <div className="game-cover" style={{ background: item.gradient }}>
          {item.image ? (
            <img
              src={resolveMediaUrl(item.image)}
              alt=""
              className="card-banner-img game-cover-img"
              style={item.coverPosition ? { objectPosition: item.coverPosition } : undefined}
              loading="lazy"
            />
          ) : (
            <span className="project-emoji">{item.emoji}</span>
          )}
          {item.platform && <span className="card-platform-tag">{item.platform}</span>}
          {status && <span className={`game-status-badge game-cover-status ${status.className}`}>{status.label}</span>}
        </div>

        <div className="game-card-body">
          <h2 className="game-card-title">{item.title}</h2>
          <Rating rating={item.rating} />
          <div className="game-progress">
            <div className="progress-bar-wrapper">
              <motion.div
                className="progress-bar-fill"
                variants={progressVariants(item.percent)}
                initial="hidden"
                animate="visible"
                style={{ background: item.gradient }}
              />
            </div>
            <span className="game-progress-value">{progressText(item)}</span>
          </div>
          {item.comment && <p className="game-card-comment line-clamp-2">{item.comment}</p>}
        </div>
      </div>
    </Tag>
  );
};

// 旅行卡片：國家代碼標籤；有對應遊記時右下角多一個「讀遊記」連結
const TravelCard = ({ item, onSelect }) => {
  const clickable = hasDetail(item);
  const post = item.post ? postBySlug[item.post] : null;
  const Tag = clickable ? motion.button : motion.div;
  return (
    <motion.div className="travel-card-wrapper" variants={itemVariants}>
      <Tag
        type={clickable ? 'button' : undefined}
        className={`project-card-wrapper ${clickable ? 'card-button' : 'is-static'}`}
        whileHover={clickable ? { y: -6, transition: { duration: 0.15, ease: 'easeOut' } } : undefined}
        onClick={clickable ? () => onSelect(item) : undefined}
      >
        <div className="project-card-glass playground-interactive-card">
          <div className="project-banner" style={{ background: item.gradient }}>
            {item.image ? (
              <img src={resolveMediaUrl(item.image)} alt="" className="card-banner-img" loading="lazy" />
            ) : (
              <span className="project-emoji">{item.emoji}</span>
            )}
            {item.period && <span className="card-date-tag">{item.period}</span>}
          </div>

          <div className={`project-content playground-card-content ${post ? 'has-post-link' : ''}`}>
            <h2 className="project-title playground-card-title"><ItemTitle item={item} /></h2>
            {item.tag && (
              <div className="card-meta">
                <span className="travel-tag-pill">{item.tag}</span>
              </div>
            )}
            {item.memory && <p className="project-desc line-clamp-2">{item.memory}</p>}
          </div>
        </div>
      </Tag>
      {/* 連結放在按鈕外面（按鈕裡不能再放連結），用定位疊在卡片右下角 */}
      {post && (
        <Link to={`/blog/${post.slug}`} className="travel-post-link">讀遊記 →</Link>
      )}
    </motion.div>
  );
};

const Playground = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = TABS.some(t => t.key === searchParams.get('tab')) ? searchParams.get('tab') : 'games';
  const [selectedItem, setSelectedItem] = useState(null);
  const closeModal = useCallback(() => setSelectedItem(null), []);

  useEffect(() => {
    const webgl = detectWebGL();
    if (webgl.supported && !webgl.software) prefetchGearRoom();
  }, []);

  const selectTab = (key) => {
    setSearchParams(key === 'games' ? {} : { tab: key }, { replace: true });
  };

  const selectedStatus = selectedItem?.type === 'game' ? GAME_STATUS[selectedItem.status] : null;

  return (
    <motion.div
      className="playground-container page"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* 頁面標題 */}
      <motion.div className="playground-header" variants={itemVariants}>
        <span className="path-label">~/archive</span>
        <h1 className="glitch" data-text="RETRO'S LOGBOOK">RETRO'S LOGBOOK</h1>
        <p className="playground-subtitle">紀錄阿浩的快樂日子0.0</p>
      </motion.div>

      {/* 分類切換 Tab 按鈕列 */}
      <motion.div className="blog-filter-buttons playground-tabs" variants={itemVariants}>
        {TABS.map(({ key, label, Icon }) => (
          <button
            key={key}
            type="button"
            className={`filter-btn ${activeTab === key ? 'active' : ''}`}
            aria-pressed={activeTab === key}
            onClick={() => selectTab(key)}
          >
            <Icon aria-hidden="true" /> {label}
          </button>
        ))}
      </motion.div>

      {activeTab === 'setup' ? (
        // 設備：電競房間動畫
        <motion.div key="setup" variants={itemVariants} initial="hidden" animate="visible">
          <SetupRoom />
        </motion.div>
      ) : activeTab === 'concerts' ? (
        // 演唱會：依年份排列的時間軸
        <motion.div
          key="concerts"
          className="concert-timeline"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {concertsByYear.map(group => (
            <section key={group.year} className="concert-year-group">
              <motion.h2 className="concert-year" variants={itemVariants}>{group.year}</motion.h2>
              {group.items.map(concert => {
                const clickable = hasDetail(concert);
                const Tag = clickable ? motion.button : motion.div;
                return (
                <Tag
                  type={clickable ? 'button' : undefined}
                  key={getItemKey(concert)}
                  className={`concert-item ${clickable ? 'card-button' : 'is-static'}`}
                  variants={itemVariants}
                  whileHover={clickable ? { x: 4, transition: { duration: 0.15 } } : undefined}
                  onClick={clickable ? () => setSelectedItem(concert) : undefined}
                >
                  <span className="concert-dot" aria-hidden="true" />
                  <img src={resolveMediaUrl(concert.image)} alt="" className="concert-thumb" loading="lazy" />
                  <span className="concert-info">
                    <span className="concert-date">{concert.period}</span>
                    <span className="concert-artist">{concert.artist}</span>
                    <span className="concert-venue"><LuMapPin aria-hidden="true" /> {concert.venue}</span>
                    <span className="concert-memory">{concert.memory}</span>
                  </span>
                </Tag>
                );
              })}
            </section>
          ))}
        </motion.div>
      ) : (
        <motion.div
          key={activeTab}
          className={activeTab === 'games' ? 'game-library-grid' : 'projects-grid playground-grid-layout'}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {activeTab === 'travels'
            ? travels.map(item => <TravelCard key={getItemKey(item)} item={item} onSelect={setSelectedItem} />)
            : games.map(item => <GameCard key={getItemKey(item)} item={item} onSelect={setSelectedItem} />)}
        </motion.div>
      )}

      <AnimatePresence>
        {selectedItem && (
          <RetroModal title={`~/archive/${activeTab}`} onClose={closeModal}>
            {/* 頂部橫幅 */}
            <div className="modal-banner" style={{ background: selectedItem.gradient }}>
              {selectedItem.image ? (
                <img src={resolveMediaUrl(selectedItem.image)} alt={getItemTitle(selectedItem)} className="modal-banner-img" />
              ) : (
                <span className="modal-emoji">{selectedItem.emoji}</span>
              )}
            </div>

            {/* 內文主體 */}
            <div className="modal-body">
              <span className="modal-meta-label">
                {selectedItem.platform || selectedItem.venue || selectedItem.period}
              </span>
              <h2 className="modal-title"><ItemTitle item={selectedItem} /></h2>

              <div className="modal-info-row">
                <Rating rating={selectedItem.rating} />
                <span className="modal-status-badge">
                  {selectedStatus
                    ? `${selectedStatus.label} · ${progressText(selectedItem)}`
                    : selectedItem.tag || selectedItem.period}
                </span>
              </div>

              <div className="modal-divider" />

              <h4 className="modal-section-heading">{'// 心得回顧'}</h4>
              <p className="modal-detailed-thoughts">{selectedItem.detailedThoughts}</p>
              {selectedItem.post && postBySlug[selectedItem.post] && (
                <Link to={`/blog/${selectedItem.post}`} className="travel-post-link in-modal" onClick={closeModal}>讀遊記 →</Link>
              )}
            </div>
          </RetroModal>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Playground;
