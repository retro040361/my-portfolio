import React, { useState, useCallback, useEffect, Suspense, lazy } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { LuGamepad2, LuPlane, LuMusic, LuMapPin, LuMonitor } from 'react-icons/lu';
import { games, travels, concerts } from './data/playground';
import RetroModal from './shared/RetroModal';
import GearRoom from './GearRoom';
import './styles/gear.css';
import { resolveMediaUrl } from './shared/markdown';

// 3D 電競房間：只有打開 Setup 分頁才下載 three.js
const GearRoom3D = lazy(() => import('./gear3d/GearRoom3D'));

const supportsWebGL = () => {
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
};

// 3D 版出錯時（例如 WebGL 建立失敗）退回 SVG 版
class FallbackBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

// 進到 Playground 後趁瀏覽器閒置時先下載 3D 程式，切到 Setup 分頁時就不用等
const prefetchGearRoom = () => {
  const run = () => import('./gear3d/GearRoom3D');
  if (window.requestIdleCallback) window.requestIdleCallback(run, { timeout: 4000 });
  else setTimeout(run, 2000);
};

// 不支援 WebGL 或開啟「減少動態效果」時用 SVG 版
const SetupRoom = () => {
  const [use3D] = useState(() => supportsWebGL() && !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
  if (!use3D) return <GearRoom />;
  return (
    <FallbackBoundary fallback={<GearRoom />}>
      <Suspense fallback={<div className="gear-loading">$ loading 3D scene…</div>}>
        <GearRoom3D />
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

// 演唱會依年份分組，呈現時間軸
const concertsByYear = concerts.reduce((groups, concert) => {
  const year = concert.period.slice(0, 4);
  const group = groups.find(g => g.year === year);
  if (group) group.items.push(concert);
  else groups.push({ year, items: [concert] });
  return groups;
}, []);

// 遊戲 / 旅行卡片
const PlaygroundCard = ({ item, onSelect }) => {
  const status = item.type === 'game' ? GAME_STATUS[item.status] : null;

  return (
    <motion.button
      type="button"
      className="project-card-wrapper card-button"
      variants={itemVariants}
      whileHover={{ y: -6, transition: { duration: 0.15, ease: 'easeOut' } }}
      onClick={() => onSelect(item)}
    >
      <div className="project-card-glass playground-interactive-card">
        {/* 卡片頂部封面 */}
        <div className="project-banner" style={{ background: item.gradient }}>
          {item.image ? (
            <img src={resolveMediaUrl(item.image)} alt="" className="card-banner-img" loading="lazy" />
          ) : (
            <span className="project-emoji">{item.emoji}</span>
          )}
          {item.platform && <span className="card-platform-tag">{item.platform}</span>}
          {item.period && !item.platform && <span className="card-date-tag">{item.period}</span>}
        </div>

        <div className="project-content playground-card-content">
          <h2 className="project-title playground-card-title">{getItemTitle(item)}</h2>

          {/* 特色元資料 (評分/狀態/標籤) */}
          <div className="card-meta">
            {item.rating ? (
              <div className="card-rating">{item.rating}</div>
            ) : item.tag ? (
              <span className="travel-tag-pill">{item.tag}</span>
            ) : null}
            {status && <span className={`game-status-badge ${status.className}`}>{status.label}</span>}
          </div>

          {/* 遊戲進度條 */}
          {item.type === 'game' && (
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
              <span className="game-progress-value">{item.percent}%</span>
            </div>
          )}

          <p className="project-desc line-clamp-2">
            {item.comment || item.memory || '心得撰寫中…'}
          </p>
        </div>
      </div>
    </motion.button>
  );
};

const Playground = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = TABS.some(t => t.key === searchParams.get('tab')) ? searchParams.get('tab') : 'games';
  const [selectedItem, setSelectedItem] = useState(null);
  const closeModal = useCallback(() => setSelectedItem(null), []);

  useEffect(() => {
    if (supportsWebGL()) prefetchGearRoom();
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
        <span className="path-label">~/playground</span>
        <h1 className="glitch" data-text="Retro's Life Dashboard">Retro's Life Dashboard</h1>
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
              {group.items.map(concert => (
                <motion.button
                  type="button"
                  key={getItemKey(concert)}
                  className="concert-item card-button"
                  variants={itemVariants}
                  whileHover={{ x: 4, transition: { duration: 0.15 } }}
                  onClick={() => setSelectedItem(concert)}
                >
                  <span className="concert-dot" aria-hidden="true" />
                  <img src={resolveMediaUrl(concert.image)} alt="" className="concert-thumb" loading="lazy" />
                  <span className="concert-info">
                    <span className="concert-date">{concert.period}</span>
                    <span className="concert-artist">{concert.artist}</span>
                    <span className="concert-venue"><LuMapPin aria-hidden="true" /> {concert.venue}</span>
                    <span className="concert-memory">{concert.memory}</span>
                  </span>
                </motion.button>
              ))}
            </section>
          ))}
        </motion.div>
      ) : (
        <motion.div
          key={activeTab}
          className="projects-grid playground-grid-layout"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {(activeTab === 'travels' ? travels : games).map(item => (
            <PlaygroundCard key={getItemKey(item)} item={item} onSelect={setSelectedItem} />
          ))}
        </motion.div>
      )}

      <AnimatePresence>
        {selectedItem && (
          <RetroModal title={`~/playground/${activeTab}`} onClose={closeModal}>
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
              <h2 className="modal-title">{getItemTitle(selectedItem)}</h2>

              <div className="modal-info-row">
                {selectedItem.rating && <span className="modal-rating">{selectedItem.rating}</span>}
                <span className="modal-status-badge">
                  {selectedStatus
                    ? `${selectedStatus.label} · ${selectedItem.percent}%`
                    : selectedItem.tag || selectedItem.period}
                </span>
              </div>

              <div className="modal-divider" />

              <h4 className="modal-section-heading">{'// 心得回顧'}</h4>
              <p className="modal-detailed-thoughts">
                {selectedItem.detailedThoughts || '心得撰寫中…'}
              </p>
            </div>
          </RetroModal>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Playground;
