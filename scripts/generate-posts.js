// 掃描 public/posts/<slug>/index.md，產生文章索引（src/data/posts-metadata.json）與 RSS（public/rss.xml）
//
//   node scripts/generate-posts.js            正式版：不含草稿
//   node scripts/generate-posts.js --drafts   開發用：草稿也會出現（npm start 用這個）
//   node scripts/generate-posts.js --watch    文章有變動就自動重新產生
//   node scripts/generate-posts.js --prune-drafts   打包後把草稿的檔案從 build/ 刪掉
//
// 文章有問題（缺標題、日期格式錯、網址重複、圖片找不到…）會列出全部問題並讓指令失敗，
// 這樣壞掉的文章不會被部署上去。

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const ROOT = path.join(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT, 'public');
const POSTS_DIR = path.join(PUBLIC_DIR, 'posts');
const BUILD_POSTS_DIR = path.join(ROOT, 'build', 'posts');
const OUTPUT_FILE = path.join(ROOT, 'src', 'data', 'posts-metadata.json');
const RSS_FILE = path.join(PUBLIC_DIR, 'rss.xml');
const { homepage } = require(path.join(ROOT, 'package.json'));

const CATEGORIES = ['tech', 'life'];
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MEDIA_PATTERNS = [
  /!\[[^\]]*\]\(\s*<?([^)\s>]+)>?(?:\s+"[^"]*")?\s*\)/g, // ![alt](src "title")
  /<(?:img|video|source)\b[^>]*\bsrc=["']([^"']+)["']/gi, // <img src="..."> / <video src="...">
];

const isExternal = (src) => /^(https?:|data:|blob:|\/\/)/i.test(src);

// 文章裡的路徑 → 網站上的路徑（/posts/<slug>/xxx 或 /image/xxx）
// 規則跟前端的 resolveMediaUrl 一樣：image/ 開頭（或 ../ 開頭）是共用圖庫，其他都相對於文章資料夾
const toSitePath = (src, slug) => {
  if (isExternal(src)) return src;
  const clean = src.replace(/^\.\//, '');
  if (/^(\/|\.\.\/|(public\/)?image\/)/.test(clean)) {
    return `/${clean.replace(/^(\.\.\/|\/)+/, '').replace(/^public\//, '')}`;
  }
  return `/posts/${slug}/${clean}`;
};

const formatDate = (value) => {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value.trim())) {
    const d = new Date(`${value.trim()}T00:00:00Z`);
    if (!Number.isNaN(d.getTime())) return value.trim();
  }
  return null;
};

const toTags = (value) => {
  if (value == null) return [];
  const list = Array.isArray(value) ? value : String(value).split(',');
  return list.map(t => String(t).trim()).filter(Boolean);
};

// 沒寫 excerpt 時從內文抓前 100 字（去掉圖片、連結網址、HTML、Markdown 符號）
const autoExcerpt = (content) => {
  const text = content
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/^#+\s*/gm, '')
    .replace(/[*_`>~|-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return text.length > 100 ? `${text.slice(0, 100)}...` : text;
};

// 閱讀時間：中文約每分鐘 400 字
const readingMinutes = (content) => {
  const plain = content.replace(/!\[[^\]]*\]\([^)]*\)/g, '').replace(/<[^>]+>/g, '').replace(/[#*`>\-\s]/g, '');
  return Math.max(1, Math.round(plain.length / 400));
};

// 找出文章用到的圖片、影片（註解、程式碼區塊裡的範例不算）
const findMedia = (content) => {
  const text = content.replace(/<!--[\s\S]*?-->/g, '').replace(/```[\s\S]*?```/g, '').replace(/`[^`\n]*`/g, '');
  const found = [];
  MEDIA_PATTERNS.forEach(re => {
    for (const m of text.matchAll(re)) found.push(m[1]);
  });
  return found;
};

const readPosts = () => {
  const posts = [];
  const errors = [];
  if (!fs.existsSync(POSTS_DIR)) fs.mkdirSync(POSTS_DIR, { recursive: true });

  for (const entry of fs.readdirSync(POSTS_DIR, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    if (entry.isFile()) {
      // README.md 是寫文章的說明，不是文章
      if (entry.name.endsWith('.md') && entry.name.toLowerCase() !== 'readme.md') {
        errors.push(`posts/${entry.name}：文章要放在自己的資料夾裡，請改成 posts/<網址名稱>/index.md`);
      }
      continue;
    }

    const slug = entry.name;
    const file = path.join(POSTS_DIR, slug, 'index.md');
    const where = `posts/${slug}/index.md`;
    if (!fs.existsSync(file)) {
      errors.push(`posts/${slug}/：資料夾裡找不到 index.md`);
      continue;
    }
    if (!SLUG_PATTERN.test(slug)) {
      errors.push(`posts/${slug}/：資料夾名稱就是文章網址，只能用小寫英文、數字和 -（例如 my-first-post）`);
    }

    let parsed;
    try {
      parsed = matter(fs.readFileSync(file, 'utf-8'));
    } catch (err) {
      errors.push(`${where}：frontmatter 格式錯誤（${err.reason || err.message}）。標題有 [ ] : # 之類的符號時記得加引號`);
      continue;
    }
    const { data, content } = parsed;

    const title = typeof data.title === 'string' ? data.title.trim() : '';
    if (!title) errors.push(`${where}：缺少 title（標題）`);

    const date = formatDate(data.date);
    if (!date) errors.push(`${where}：date 要寫成 YYYY-MM-DD，例如 2026-10-24（目前是 ${JSON.stringify(data.date ?? null)}）`);

    const category = data.category || 'tech';
    if (!CATEGORIES.includes(category)) {
      errors.push(`${where}：category 只能是 ${CATEGORIES.join(' / ')}（目前是 ${category}）`);
    }

    if (data.id != null && !Number.isInteger(data.id)) {
      errors.push(`${where}：id 是舊網址用的數字編號，新文章不用寫`);
    }

    // 檢查文章用到的圖片、影片是否存在
    const media = findMedia(content);
    if (data.cover) media.push(String(data.cover));
    media.filter(src => !isExternal(src)).forEach(src => {
      const sitePath = toSitePath(src, slug);
      if (!fs.existsSync(path.join(PUBLIC_DIR, decodeURI(sitePath)))) {
        errors.push(`${where}：找不到檔案 ${src}（應該在 public${sitePath}）`);
      }
    });

    const firstImage = findMedia(content).find(src => !/\.(mp4|webm|ogg|mov|m4v)$/i.test(src));
    const cover = data.cover || firstImage;

    posts.push({
      slug,
      legacyId: Number.isInteger(data.id) ? data.id : null,
      title,
      date: date || '',
      category,
      tags: toTags(data.tags),
      draft: data.draft === true,
      excerpt: typeof data.excerpt === 'string' && data.excerpt.trim() ? data.excerpt.trim() : autoExcerpt(content),
      cover: cover ? toSitePath(String(cover), slug) : null,
      readingMinutes: readingMinutes(content),
      markdownFile: `/posts/${slug}/index.md`,
      baseDir: `posts/${slug}`,
    });
  }

  // 舊網址編號不能重複
  const seen = new Map();
  posts.filter(p => p.legacyId != null).forEach(p => {
    if (seen.has(p.legacyId)) errors.push(`posts/${p.slug}：id ${p.legacyId} 跟 posts/${seen.get(p.legacyId)} 重複了`);
    seen.set(p.legacyId, p.slug);
  });

  // 新到舊；同一天的依標題排
  posts.sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title));
  return { posts, errors };
};

const escapeXml = (s) => String(s).replace(/[<>&'"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c]));

const writeRss = (posts) => {
  const site = homepage.replace(/\/$/, '');
  const items = posts.slice(0, 30).map(p => `    <item>
      <title>${escapeXml(p.title)}</title>
      <link>${site}/#/blog/${p.slug}</link>
      <guid isPermaLink="false">${escapeXml(p.slug)}</guid>
      <pubDate>${new Date(`${p.date}T00:00:00+08:00`).toUTCString()}</pubDate>
      <category>${escapeXml(p.category)}</category>
      <description>${escapeXml(p.excerpt)}</description>
    </item>`).join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Retro's Space</title>
    <link>${site}/#/blog</link>
    <description>Retro 的部落格：技術分享與生活隨筆</description>
    <language>zh-TW</language>
${items}
  </channel>
</rss>
`;
  fs.writeFileSync(RSS_FILE, xml, 'utf-8');
};

const generate = ({ includeDrafts }) => {
  const { posts, errors } = readPosts();
  if (errors.length) {
    console.error(`❌ 有 ${errors.length} 個文章問題，請修正後再試：`);
    errors.forEach(e => console.error(`   - ${e}`));
    return false;
  }
  const published = posts.filter(p => !p.draft);
  const listed = includeDrafts ? posts : published;
  fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, `${JSON.stringify(listed, null, 2)}\n`, 'utf-8');
  writeRss(published);
  const drafts = posts.length - published.length;
  console.log(`✅ 文章索引已更新：${published.length} 篇${drafts ? `，草稿 ${drafts} 篇${includeDrafts ? '（開發模式會顯示）' : '（不會發佈）'}` : ''}`);
  return true;
};

// 打包後：草稿的 md 和圖片也會被複製進 build/，把它們刪掉，免得被猜到網址
const pruneDrafts = () => {
  const { posts } = readPosts();
  posts.filter(p => p.draft).forEach(p => {
    const dir = path.join(BUILD_POSTS_DIR, p.slug);
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
      console.log(`🗑  已從 build/ 移除草稿：${p.slug}`);
    }
  });
};

const args = process.argv.slice(2);
if (args.includes('--prune-drafts')) {
  pruneDrafts();
} else {
  const includeDrafts = args.includes('--drafts');
  const ok = generate({ includeDrafts });
  if (args.includes('--watch')) {
    console.log('👀 正在監看 public/posts，文章有變動會自動更新索引');
    let timer = null;
    fs.watch(POSTS_DIR, { recursive: true }, () => {
      clearTimeout(timer);
      timer = setTimeout(() => generate({ includeDrafts }), 300);
    });
  } else if (!ok) {
    process.exit(1);
  }
}
