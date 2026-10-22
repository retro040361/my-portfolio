import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, useScroll, useSpring } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw'; // 解析原始 HTML 標籤 (如 <video>)
import { LuArrowLeft, LuArrowRight, LuCalendar, LuClock, LuList } from 'react-icons/lu';
import blogPosts from './data/posts-metadata.json';
import { CATEGORY_META } from './data/profile';
import { markdownComponents, resolveMediaUrl, stripFrontmatter } from './shared/markdown';

// 定義動畫效果
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

// 文章開頭若是與標題相同的 "# 標題"，避免與頁首標題重複
const removeDuplicateTitle = (text, title) => {
  const match = text.match(/^\s*#\s+(.+)\r?\n/);
  if (match && match[1].trim() === title.trim()) {
    return text.slice(match[0].length);
  }
  return text;
};

// 閱讀進度條（固定於導覽列下方）
const ReadingProgress = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 30, restDelta: 0.001 });
  return <motion.div className="reading-progress" style={{ scaleX }} />;
};

const BlogPost = () => {
  const { id } = useParams();
  const postIndex = blogPosts.findIndex(p => p.id === parseInt(id, 10));
  const post = postIndex >= 0 ? blogPosts[postIndex] : null;
  // 列表依日期新到舊排序：前一篇是較新的，下一篇是較舊的
  const newerPost = postIndex > 0 ? blogPosts[postIndex - 1] : null;
  const olderPost = postIndex >= 0 && postIndex < blogPosts.length - 1 ? blogPosts[postIndex + 1] : null;

  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [toc, setToc] = useState([]);
  const [activeHeading, setActiveHeading] = useState(null);
  const contentRef = useRef(null);

  useEffect(() => {
    if (!post) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(false);

    // 從 public/posts 載入 md 檔案
    fetch(`${process.env.PUBLIC_URL || ''}${post.markdownFile}`)
      .then(res => {
        if (!res.ok) {
          throw new Error("無法讀取文章檔案");
        }
        return res.text();
      })
      .then(text => {
        setContent(removeDuplicateTitle(stripFrontmatter(text), post.title));
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError(true);
        setLoading(false);
      });
  }, [post]);

  // 內容渲染後，從 h2/h3 產生目錄並追蹤目前閱讀到的段落
  useEffect(() => {
    const container = contentRef.current;
    if (!container) return;

    const headings = Array.from(container.querySelectorAll('h2, h3'));
    headings.forEach((h, idx) => { h.id = `section-${idx}`; });
    setToc(headings.map(h => ({ id: h.id, text: h.textContent, level: h.tagName === 'H2' ? 2 : 3 })));

    if (headings.length === 0) return;
    const observer = new IntersectionObserver(
      entries => {
        const visible = entries.filter(e => e.isIntersecting);
        if (visible.length > 0) setActiveHeading(visible[0].target.id);
      },
      { rootMargin: '-80px 0px -70% 0px' }
    );
    headings.forEach(h => observer.observe(h));
    return () => observer.disconnect();
  }, [content]);

  const scrollToHeading = (headingId) => {
    document.getElementById(headingId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (loading) {
    return (
      <div className="blog-post-container page loading-container">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="loading-spinner-wrapper"
        >
          <div className="loading-spinner"></div>
          <p>正在加載精彩內容...</p>
        </motion.div>
      </div>
    );
  }

  if (!post || error) {
    return (
      <div className="blog-post-container page error-container">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="error-message"
        >
          <h2>⚠️ 文章不存在或載入失敗</h2>
          <p>很抱歉，我們找不到您要求的部落格文章。</p>
          <Link to="/blog" className="back-to-list-btn">返回文章列表</Link>
        </motion.div>
      </div>
    );
  }

  const meta = CATEGORY_META[post.category] || CATEGORY_META.tech;
  const showToc = toc.length >= 3;

  return (
    <>
      <ReadingProgress />
      <motion.div
        className={`blog-post-container page ${showToc ? 'has-toc' : ''}`}
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div variants={itemVariants}>
          <Link to="/blog" className="post-back-link"><LuArrowLeft aria-hidden="true" /> 返回列表</Link>
        </motion.div>

        <motion.div variants={itemVariants} className="blog-post-hero-banner" style={{ background: meta.gradient }}>
          {post.cover ? (
            <img src={resolveMediaUrl(post.cover)} alt="" className="blog-post-hero-img" />
          ) : (
            <span className="code-banner code-banner-lg">{meta.fallbackCode}</span>
          )}
        </motion.div>

        <motion.header variants={itemVariants} className="post-header-meta">
          <span className={`post-category-tag ${post.category}`}>{meta.longLabel}</span>
          <h1 className="post-title glitch" data-text={post.title}>{post.title}</h1>
          <div className="post-meta-row">
            <span><LuCalendar aria-hidden="true" /> {post.date}</span>
            <span><LuClock aria-hidden="true" /> 約 {post.readingMinutes || 1} 分鐘</span>
          </div>
        </motion.header>

        <div className="post-layout">
          {showToc && (
            <aside className="post-toc" aria-label="文章目錄">
              <details open>
                <summary><LuList aria-hidden="true" /> 目錄</summary>
                <ul>
                  {toc.map(item => (
                    <li key={item.id} className={`toc-level-${item.level} ${activeHeading === item.id ? 'active' : ''}`}>
                      <button type="button" onClick={() => scrollToHeading(item.id)}>{item.text}</button>
                    </li>
                  ))}
                </ul>
              </details>
            </aside>
          )}

          <article className="post-content" ref={contentRef}>
            <ReactMarkdown rehypePlugins={[rehypeRaw]} components={markdownComponents}>
              {content}
            </ReactMarkdown>
          </article>
        </div>

        {/* 上一篇 / 下一篇 */}
        <nav className="post-pagination" aria-label="其他文章">
          {olderPost ? (
            <Link to={`/blog/${olderPost.id}`} className="post-pagination-link prev">
              <span className="post-pagination-label"><LuArrowLeft aria-hidden="true" /> 上一篇</span>
              <span className="post-pagination-title">{olderPost.title}</span>
            </Link>
          ) : <span />}
          {newerPost ? (
            <Link to={`/blog/${newerPost.id}`} className="post-pagination-link next">
              <span className="post-pagination-label">下一篇 <LuArrowRight aria-hidden="true" /></span>
              <span className="post-pagination-title">{newerPost.title}</span>
            </Link>
          ) : <span />}
        </nav>
      </motion.div>
    </>
  );
};

export default BlogPost;
