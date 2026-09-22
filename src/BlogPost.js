import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion'; // 引入 framer-motion
import ReactMarkdown from 'react-markdown'; // 引入 react-markdown 來解析 md 內容
import rehypeRaw from 'rehype-raw'; // 引入 rehype-raw 解析原始 HTML 標籤
import blogPosts from './data/posts-metadata.json'; // 引入自動生成的文章元資料
import './App.css'; 

// 解析 Markdown 中的圖片與影音媒體路徑（相容 /image/...、../image/...、./image/... 與外部 URL）
const resolveMediaUrl = (src) => {
  if (!src) return src;
  if (/^(https?:|data:|blob:|\/\/)/i.test(src)) {
    return src;
  }
  let cleanPath = src.replace(/^(\.\.\/|\.\/)+/, '').replace(/^\/+/, '');
  if (cleanPath.startsWith('public/')) {
    cleanPath = cleanPath.slice(7);
  }
  const publicUrl = process.env.PUBLIC_URL || '';
  return `${publicUrl}/${cleanPath}`;
};

// 影音播放器組件 (含檔案遺失 404 / 載入失敗之友善提示)
const VideoPlayer = ({ src, alt, ...props }) => {
  const [hasError, setHasError] = useState(false);
  const finalSrc = resolveMediaUrl(src);

  if (hasError) {
    return (
      <div className="markdown-media-error" style={{
        padding: '14px 18px',
        margin: '16px 0',
        borderRadius: '12px',
        background: 'rgba(239, 68, 68, 0.12)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        color: 'var(--text-primary)',
        fontSize: '0.88rem',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <span>⚠️ 影片檔案未找到或無法載入（檔名路徑：<code>{src}</code>）</span>
      </div>
    );
  }

  return (
    <video
      src={finalSrc}
      controls
      playsInline
      preload="metadata"
      className="markdown-video"
      onError={() => setHasError(true)}
      {...props}
    >
      {alt || "您的瀏覽器不支援播放此影片。"}
    </video>
  );
}; 

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

// 高效能 Markdown 元件渲染（自動偵測同段落多張圖片並轉為並排網格）
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
  img: ({ src, alt, ...props }) => {
    const finalSrc = resolveMediaUrl(src);
    const isVideo = src && /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(src);

    if (isVideo) {
      return <VideoPlayer src={src} alt={alt} {...props} />;
    }
    return <img src={finalSrc} alt={alt || "文章圖片"} className="markdown-img" loading="lazy" decoding="async" {...props} />;
  },
  video: ({ src, children, ...props }) => {
    return <VideoPlayer src={src} {...props}>{children}</VideoPlayer>;
  },
  a: ({ href, children, ...props }) => {
    if (href) {
      // eslint-disable-next-line no-useless-escape
      const ytMatch = href.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
      if (ytMatch && ytMatch[1]) {
        return (
          <div className="markdown-video-wrapper">
            <iframe
              src={`https://www.youtube.com/embed/${ytMatch[1]}`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="markdown-iframe"
            />
          </div>
        );
      }
    }
    return <a href={href} target="_blank" rel="noreferrer" {...props}>{children}</a>;
  },
};

const BlogPost = () => {
  const { id } = useParams();
  const post = blogPosts.find(p => p.id === parseInt(id));

  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

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
        // 移除最上方的 YAML Frontmatter，避免將其顯示在文章內容中
        const cleanContent = text.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '');
        setContent(cleanContent);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError(true);
        setLoading(false);
      });
  }, [post]);

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

  return (
    <motion.div 
      className="blog-post-container page"
      initial="hidden"
      animate="visible"
      variants={containerVariants} // 套用容器動畫
    >
      <motion.div 
        variants={itemVariants} 
        className="blog-post-hero-banner"
        style={{ 
          background: post.category === 'tech' 
            ? 'linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #3b82f6 100%)' 
            : 'linear-gradient(135deg, #e03131 0%, #f06595 50%, #ffc9c9 100%)' 
        }}
      >
        <span className="modal-emoji">{post.category === 'tech' ? '💻' : '🌿'}</span>
      </motion.div>

      <motion.div variants={itemVariants} className="post-header-meta">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
          <span className={`post-category-tag ${post.category}`}>
            {post.category === 'tech' ? '💻 技術分享' : '🌿 生活隨筆'}
          </span>
          <p className="post-meta" style={{ margin: 0 }}>發布於 {post.date}</p>
        </div>
      </motion.div>

      <div className="post-content">
        <ReactMarkdown rehypePlugins={[rehypeRaw]} components={markdownComponents}>
          {content}
        </ReactMarkdown>
      </div>
      
      <motion.div variants={itemVariants} style={{ marginTop: '40px' }}>
        <Link to="/blog" className="back-to-list-btn">返回列表</Link>
      </motion.div>
    </motion.div>
  );
};

export default BlogPost;
