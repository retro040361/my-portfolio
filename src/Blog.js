import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { LuClock } from 'react-icons/lu';
import blogPosts from './data/posts-metadata.json';
import { CATEGORY_META } from './data/profile';
import { resolveMediaUrl } from './shared/markdown';

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

// 可自定義的分類標題與小標題
const CATEGORIES = [
  { key: 'all', label: '全部', title: '全部分享', subtitle: '隨便亂寫＠＠' },
  { key: 'tech', label: '技術', title: '技術分享', subtitle: '誒幹好像要被AI取代了還是怎麼樣的' },
  { key: 'life', label: '生活', title: '生活隨筆', subtitle: '繁花在時光中盛開，在記憶中凋零' },
];

const Blog = () => {
  // 分類存在網址上，從文章返回時會保留篩選
  const [searchParams, setSearchParams] = useSearchParams();
  const activeKey = searchParams.get('category') || 'all';
  const active = CATEGORIES.find(c => c.key === activeKey) || CATEGORIES[0];
  const activeTag = searchParams.get('tag');

  const filteredPosts = blogPosts
    .filter(post => active.key === 'all' || post.category === active.key)
    .filter(post => !activeTag || post.tags?.includes(activeTag));

  // 分類和標籤都存在網址上，從文章返回時會保留篩選
  const updateFilters = ({ category = active.key, tag = activeTag }) => {
    const next = {};
    if (category !== 'all') next.category = category;
    if (tag) next.tag = tag;
    setSearchParams(next, { replace: true });
  };
  const selectCategory = (key) => updateFilters({ category: key });

  return (
    <motion.div
      className="blog-container"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="blog-header-wrapper">
        <div className="blog-title-section">
          <motion.span className="path-label" variants={itemVariants}>~/blog</motion.span>
          <motion.h1 className="glitch" data-text={active.title} variants={itemVariants}>{active.title}</motion.h1>
          <motion.p className="blog-subtitle" variants={itemVariants}>
            {active.subtitle}
          </motion.p>
        </div>

        {/* 類別切換按鈕組 */}
        <motion.div className="blog-filter-buttons" variants={itemVariants}>
          {CATEGORIES.map(c => (
            <button
              key={c.key}
              type="button"
              className={`filter-btn ${active.key === c.key ? 'active' : ''}`}
              aria-pressed={active.key === c.key}
              onClick={() => selectCategory(c.key)}
            >
              {c.label}
            </button>
          ))}
        </motion.div>
      </div>

      {activeTag && (
        <div className="blog-active-tag">
          <span>標籤：<strong>{activeTag}</strong>（{filteredPosts.length} 篇）</span>
          <button type="button" className="filter-btn" onClick={() => updateFilters({ tag: null })}>清除標籤 ✕</button>
        </div>
      )}

      <motion.div
        key={`${active.key}-${activeTag || ''}`}
        className="projects-grid blog-grid"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {filteredPosts.map(post => {
          const meta = CATEGORY_META[post.category] || CATEGORY_META.tech;
          return (
            <motion.div
              key={post.slug}
              variants={itemVariants}
              whileHover={{ y: -6, transition: { duration: 0.15, ease: 'easeOut' } }}
            >
              <Link to={`/blog/${post.slug}`} className="project-card-glass post-card-link">
                {/* 封面：有圖片用圖片，沒有則用分類漸層 */}
                <div className="post-cover" style={{ background: meta.gradient }}>
                  {post.cover ? (
                    <img src={resolveMediaUrl(post.cover)} alt="" loading="lazy" decoding="async" />
                  ) : (
                    <span className="code-banner">{meta.fallbackCode}</span>
                  )}
                </div>

                <div className="post-card-body">
                  <div className="post-card-meta">
                    <span className="post-date">{post.date}</span>
                    <span className={`post-category-tag ${post.category}`}>
                      {meta.label}
                    </span>
                    {post.draft && <span className="post-draft-badge">草稿</span>}
                  </div>
                  <h2 className="project-title post-card-title">{post.title}</h2>
                  <p className="project-desc post-card-excerpt">{post.excerpt}</p>
                  {post.tags?.length > 0 && (
                    <div className="post-tags">
                      {post.tags.slice(0, 3).map(tag => <span key={tag} className="project-tech-tag post-tag">{tag}</span>)}
                    </div>
                  )}
                  <span className="post-reading-time">
                    <LuClock aria-hidden="true" /> 約 {post.readingMinutes || 1} 分鐘
                  </span>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );
};

export default Blog;
