import React, { useState } from 'react';

// 解析 Markdown 中的圖片與影音媒體路徑（相容 /image/...、../image/...、./image/... 與外部 URL）
// 有給 baseDir（文章資料夾，例如 posts/my-post）時，./dog.jpg 這種相對路徑會指向文章自己的資料夾；
// image/ 開頭（或 / 、../ 開頭）的還是指向共用圖庫 public/image
export const resolveMediaUrl = (src, baseDir) => {
  if (!src) return src;
  if (/^(https?:|data:|blob:|\/\/)/i.test(src)) {
    return src;
  }
  if (baseDir && !/^(\/|\.\.\/|(\.\/)?(public\/)?image\/)/.test(src)) {
    return `${process.env.PUBLIC_URL || ''}/${baseDir}/${src.replace(/^\.\//, '')}`;
  }
  let cleanPath = src.replace(/^(\.\.\/|\.\/)+/, '').replace(/^\/+/, '');
  if (cleanPath.startsWith('public/')) {
    cleanPath = cleanPath.slice(7);
  }
  const publicUrl = process.env.PUBLIC_URL || '';
  return `${publicUrl}/${cleanPath}`;
};

// 移除最上方的 YAML Frontmatter，避免將其顯示在文章內容中
export const stripFrontmatter = (text) => text.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '');

// 影音播放器組件 (含檔案遺失 404 / 載入失敗之友善提示)
export const VideoPlayer = ({ src, alt, baseDir, ...props }) => {
  const [hasError, setHasError] = useState(false);
  const finalSrc = resolveMediaUrl(src, baseDir);

  if (hasError) {
    return (
      <div className="markdown-media-error">
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

// 讓 react-markdown 渲染的 HTML 元素能套用樣式（自動偵測同段落多張圖片並轉為並排網格）
// baseDir 是文章資料夾，文章裡的相對路徑圖片會從那裡找
export const createMarkdownComponents = (baseDir) => ({
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
    const finalSrc = resolveMediaUrl(src, baseDir);
    const isVideo = src && /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(src);

    if (isVideo) {
      return <VideoPlayer src={src} alt={alt} baseDir={baseDir} {...props} />;
    }
    return <img src={finalSrc} alt={alt || "文章圖片"} className="markdown-img" loading="lazy" decoding="async" {...props} />;
  },
  video: ({ src, children, ...props }) => {
    return <VideoPlayer src={src} baseDir={baseDir} {...props}>{children}</VideoPlayer>;
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
});

export const markdownComponents = createMarkdownComponents();
