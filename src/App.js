import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion'; // 引入 motion 庫
import ReactMarkdown from 'react-markdown'; // 引入 ReactMarkdown 用於 Modal 內渲染的文章
import './App.css';
import BlogPost from './BlogPost'; // 引入 BlogPost 組件
import About from './About'; // 引入 About 元件
import Playground from './Playground'; // 引入 Playground 元件
import BootLoader from './BootLoader'; // 引入開機載入元件
import Projects from './Projects'; // 引入 Projects 元件
import blogPosts from './data/posts-metadata.json'; // 引入自動生成的文章元資料

// 定義部落格列表的動畫效果
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1, // 每個子元件動畫延遲 0.1 秒
    },
  },
};

const itemVariants = {
  hidden: { y: -20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
    },
  },
};

// 讓首頁能夠自定義 Hollow Purple 光芒的組件
const Home = () => (
  <motion.div 
    className="home-container"
    initial="hidden"
    animate="visible"
    variants={containerVariants}
  >
    <div className="hero-section">
      <motion.h1 variants={itemVariants}>Welcome to Retro's Space</motion.h1>
      <motion.p variants={itemVariants}>"九鋼 偏光 烏と声明 表裏の間"</motion.p>
      <motion.p variants={itemVariants}>"虛式 茈"</motion.p>
      
      <motion.div className="home-image-container" variants={itemVariants}>
        <img src="/image/gojo.webp" alt="個人首頁圖" className="home-image" />
        
        {/* 虛式「茈」紫色圓球與複合特效 */}
        <div className="purple-pulse-dot">
          {/* 十字星形白色偏光光芒 */}
          <div className="star-glow"></div>
          {/* 鋸齒折線不規則閃電 */}
          <svg className="lightning-svg l1" viewBox="0 0 30 80">
            <path d="M15,80 L22,60 L8,40 L24,20 L15,0" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <svg className="lightning-svg l2" viewBox="0 0 30 80">
            <path d="M15,80 L7,65 L23,45 L10,25 L15,0" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <svg className="lightning-svg l3" viewBox="0 0 30 80">
            <path d="M15,80 L25,55 L6,35 L20,15 L15,0" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <svg className="lightning-svg l4" viewBox="0 0 30 80">
            <path d="M15,80 L9,60 L24,35 L7,15 L15,0" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </motion.div>
    </div>
  </motion.div>
);

// 可自定義的分類小標題
const CATEGORY_SUBTITLES = {
  all: "隨便亂寫＠＠",
  tech: "記錄程式學習、踩坑筆記與前端開發心得。",
  life: "繁花在時光中盛開，在記憶中凋零"
};

// 讓 react-markdown 渲染的 HTML 元素能套用樣式（自動偵測同段落多張圖片並轉為並排網格）
const markdownComponents = {
  h1: ({ children, ...props }) => <h1 className="markdown-h1" {...props}>{children}</h1>,
  h2: ({ children, ...props }) => <h2 className="markdown-h2" {...props}>{children}</h2>,
  h3: ({ children, ...props }) => <h3 className="markdown-h3" {...props}>{children}</h3>,
  p: ({ children, ...props }) => {
    const childrenArray = React.Children.toArray(children);
    const imgElements = childrenArray.filter(
      child => React.isValidElement(child) && (child.type === 'img' || child.props?.src)
    );
    if (imgElements.length >= 2) {
      const gridClass = `img-grid-${Math.min(imgElements.length, 4)}`;
      return (
        <div className={`${gridClass} markdown-img-group`} {...props}>
          {children}
        </div>
      );
    }
    return <p className="markdown-p" {...props}>{children}</p>;
  },
  ul: ({ children, ...props }) => <ul className="markdown-ul" {...props}>{children}</ul>,
  ol: ({ children, ...props }) => <ol className="markdown-ol" {...props}>{children}</ol>,
  li: ({ children, ...props }) => <li className="markdown-li" {...props}>{children}</li>,
  pre: ({ children, ...props }) => <pre className="markdown-pre" {...props}>{children}</pre>,
  code: ({ children, ...props }) => <code className="markdown-code" {...props}>{children}</code>,
  hr: (props) => <hr className="markdown-hr" {...props} />,
  blockquote: ({ children, ...props }) => <blockquote className="markdown-blockquote" {...props}>{children}</blockquote>,
  img: ({ src, alt, ...props }) => <img src={src} alt={alt || "文章圖片"} className="markdown-img" loading="lazy" decoding="async" {...props} />,
};

const Blog = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedPost, setSelectedPost] = useState(null);
  const [postContent, setPostContent] = useState("");
  const [loadingPost, setLoadingPost] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

  const filteredPosts = activeCategory === 'all' 
    ? blogPosts 
    : blogPosts.filter(post => post.category === activeCategory);

  useEffect(() => {
    if (!selectedPost) return;
    setLoadingPost(true);
    setPostContent("");
    
    fetch(selectedPost.markdownFile)
      .then(res => {
        if (!res.ok) throw new Error("讀取檔案出錯");
        return res.text();
      })
      .then(text => {
        const cleanContent = text.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '');
        setPostContent(cleanContent);
        setLoadingPost(false);
      })
      .catch(err => {
        console.error(err);
        setPostContent("讀取文章時出錯，請稍後再試。");
        setLoadingPost(false);
      });
  }, [selectedPost]);

  return (
    <motion.div 
      className="blog-container"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="blog-header-wrapper">
        <div className="blog-title-section">
          <motion.h1 variants={itemVariants}>
            {activeCategory === 'all' && "全部分享"}
            {activeCategory === 'tech' && "技術分享"}
            {activeCategory === 'life' && "生活隨筆"}
          </motion.h1>
          <motion.p className="blog-subtitle" variants={itemVariants}>
            {CATEGORY_SUBTITLES[activeCategory]}
          </motion.p>
        </div>

        {/* 類別切換按鈕組 */}
        <motion.div className="blog-filter-buttons" variants={itemVariants}>
          <button 
            className={`filter-btn ${activeCategory === 'all' ? 'active' : ''}`}
            onClick={() => setActiveCategory('all')}
          >
            📂 全部
          </button>
          <button 
            className={`filter-btn ${activeCategory === 'tech' ? 'active' : ''}`}
            onClick={() => setActiveCategory('tech')}
          >
            💻 技術
          </button>
          <button 
            className={`filter-btn ${activeCategory === 'life' ? 'active' : ''}`}
            onClick={() => setActiveCategory('life')}
          >
            🌿 生活
          </button>
        </motion.div>
      </div>

      {/* 2-column Grid 卡片排版以契合 Projects 佈局 (Option 1) */}
      <motion.div 
        key={activeCategory}
        className="projects-grid" 
        style={{ marginTop: '30px' }}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {filteredPosts.map(post => (
          <motion.div 
            key={post.id} 
            variants={itemVariants}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            onClick={() => setSelectedPost(post)}
            style={{ cursor: 'pointer' }}
          >
              <div className="project-card-glass" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                {/* 使用與專案一致的 Banner 結構 */}
                <div className="project-banner" style={{ background: post.category === 'tech' ? 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)' : 'linear-gradient(135deg, #ffc9c9 0%, #e03131 100%)', height: '100px' }}>
                  <span className="project-emoji" style={{ fontSize: '3rem' }}>{post.category === 'tech' ? '💻' : '🌿'}</span>
                </div>

                <div className="project-content" style={{ padding: '24px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <div className="post-card-meta" style={{ marginBottom: '8px' }}>
                    <span className="post-date" style={{ fontSize: '0.82rem' }}>{post.date}</span>
                    <span className={`post-category-tag ${post.category}`}>
                      {post.category === 'tech' ? '💻 技術' : '🌿 生活'}
                    </span>
                  </div>
                  <h2 className="project-title" style={{ fontSize: '1.25rem', marginBottom: '8px' }}>{post.title}</h2>
                  <p className="project-desc" style={{ fontSize: '0.88rem', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', minHeight: '4.2em' }}>
                    {post.excerpt}
                  </p>
                  
                  <button 
                    className="read-more" 
                    style={{ marginTop: 'auto', alignSelf: 'flex-start', cursor: 'pointer' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPost(post);
                    }}
                  >
                    閱讀更多
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
      </motion.div>

      {/* 彈出式文章詳細視窗 (Option 1 & 2 混合風格) */}
      <AnimatePresence>
        {selectedPost && (
          <div className="modal-overlay" onClick={() => { setSelectedPost(null); setIsMaximized(false); }}>
            <motion.div 
              layout
              className={`modal-box retro-window ${isMaximized ? 'is-maximized' : ''}`}
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ 
                type: 'spring', 
                damping: 25, 
                stiffness: 300,
                layout: { duration: 0.38, ease: [0.16, 1, 0.3, 1] }
              }}
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: isMaximized ? '95vw' : '750px', width: '95%' }}
            >
              {/* Option 2 風格：macOS/Linux 交通燈視窗標題列 */}
              <div className="login-window-header" style={{ padding: '10px 16px', background: 'var(--navbar-bg)', borderBottom: '1px solid var(--card-border)' }}>
                <div className="window-controls">
                  <span className="control-dot red" title="關閉 (Close)" onClick={() => { setSelectedPost(null); setIsMaximized(false); }}>
                    <span className="dot-icon">✕</span>
                  </span>
                  <span className="control-dot yellow" title="縮小 (Minimize)" onClick={() => { setSelectedPost(null); setIsMaximized(false); }}>
                    <span className="dot-icon">−</span>
                  </span>
                  <span className="control-dot green" title={isMaximized ? "還原 (Restore)" : "放大 (Maximize)"} onClick={() => setIsMaximized(!isMaximized)}>
                    <span className="dot-icon">{isMaximized ? '⤡' : '⤢'}</span>
                  </span>
                </div>
                <div className="window-title" style={{ color: 'var(--text-primary)', fontFamily: 'monospace', fontSize: '0.82rem' }}>
                  Markdown Reader - {selectedPost.title}
                </div>
                <div className="window-spacer" style={{ width: '30px' }}></div>
              </div>

              {/* 滾動內容包裝容器（讓 Cover Banner 隨捲動往上滑動消失） */}
              <div className="modal-scroll-body">
                {/* 頂部橫幅 */}
                <div className="modal-banner" style={{ height: '140px', minHeight: '140px', background: selectedPost.category === 'tech' ? 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)' : 'linear-gradient(135deg, #ffc9c9 0%, #e03131 100%)' }}>
                  <span className="modal-emoji" style={{ fontSize: '4.5rem' }}>{selectedPost.category === 'tech' ? '💻' : '🌿'}</span>
                </div>

                {/* 內文主體 */}
                <div className="modal-body" style={{ padding: '30px' }}>
                  <span className="modal-meta-label" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    📅 Published on {selectedPost.date} | Category: {selectedPost.category === 'tech' ? '技術' : '生活'}
                  </span>
                  <h2 className="modal-title" style={{ fontSize: '1.6rem', marginTop: '4px', marginBottom: '20px' }}>
                    {selectedPost.title}
                  </h2>
                  
                  <div className="modal-divider" style={{ margin: '15px 0' }} />

                  {loadingPost ? (
                    <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      正在讀取 Markdown 內容...
                    </div>
                  ) : (
                    <div className="markdown-content" style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                      <ReactMarkdown components={markdownComponents}>
                        {postContent}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

function App() {
  const [isBooted, setIsBooted] = React.useState(false);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <>
      <AnimatePresence mode="wait">
        {!isBooted && (
          <BootLoader onComplete={() => setIsBooted(true)} />
        )}
      </AnimatePresence>

      {isBooted && (
        <Router>
          <div className="App">
            {/* 導覽選單 */}
            <nav className="navbar">
              <div className="logo">Retro's Space</div>
              <ul className="nav-links">
                <li><Link to="/">Home</Link></li>
                <li><Link to="/about">About Me</Link></li>
                <li><Link to="/projects">Projects</Link></li>
                <li><Link to="/blog">Blogs</Link></li>
                <li><Link to="/playground">Playground</Link></li>
                <li>
                  <motion.button 
                    onClick={toggleTheme} 
                    className="theme-toggle-btn"
                    title={theme === 'dark' ? '切換為淺色模式' : '切換為深色模式'}
                    whileTap={{ scale: 0.9 }}
                    whileHover={{ scale: 1.1 }}
                  >
                    {theme === 'dark' ? '☀️' : '🌙'}
                  </motion.button>
                </li>
              </ul>
            </nav>

            {/* 頁面內容 */}
            <div className="content">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:id" element={<BlogPost />} />
                <Route path="/playground" element={<Playground />} />
              </Routes>
            </div>
          </div>
        </Router>
      )}
    </>
  );
}



export default App;
