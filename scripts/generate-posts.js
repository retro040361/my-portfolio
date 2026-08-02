const fs = require('fs');
const path = require('path');

const postsDir = path.join(__dirname, '../public/posts');
const outputFile = path.join(__dirname, '../src/data/posts-metadata.json');

// 確保資料夾存在
if (!fs.existsSync(postsDir)) {
  fs.mkdirSync(postsDir, { recursive: true });
}

// 簡單的 YAML Frontmatter 解析器 (無外部依賴)
function parseFrontmatter(fileContent) {
  const match = fileContent.match(/^---\r?\n([\s\S]+?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) {
    return { metadata: {}, content: fileContent };
  }
  const yamlBlock = match[1];
  const content = match[2];
  const metadata = {};
  
  yamlBlock.split('\n').forEach(line => {
    const colonIndex = line.indexOf(':');
    if (colonIndex > -1) {
      const key = line.slice(0, colonIndex).trim();
      let value = line.slice(colonIndex + 1).trim();
      // 移除可能包裝的最外層引號
      value = value.replace(/^['"]|['"]$/g, '');
      metadata[key] = value;
    }
  });
  
  return { metadata, content };
}

console.log('🔍 正在掃描部落格 Markdown 檔案...');

try {
  const files = fs.readdirSync(postsDir);
  const posts = [];
  let nextAutoId = 100; // 自動指派的 ID 從 100 開始

  files.forEach(filename => {
    // 只處理 .md 檔案
    if (path.extname(filename).toLowerCase() !== '.md') return;

    const filePath = path.join(postsDir, filename);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { metadata, content } = parseFrontmatter(fileContent);

    // 解析 ID
    let id = metadata.id ? parseInt(metadata.id) : null;
    if (id === null || isNaN(id)) {
      // 試著從檔名解析數字 (例如 1.md -> 1)
      const baseNum = parseInt(path.basename(filename, '.md'));
      if (!isNaN(baseNum)) {
        id = baseNum;
      } else {
        id = nextAutoId++;
      }
    }

    const title = metadata.title || path.basename(filename, '.md');
    const date = metadata.date || new Date().toISOString().split('T')[0];
    const category = metadata.category || 'tech';
    const excerpt = metadata.excerpt || (content.replace(/[#*`\-]/g, '').replace(/\r?\n/g, ' ').trim().slice(0, 100) + '...');
    const markdownFile = `/posts/${filename}`;

    posts.push({
      id,
      title,
      date,
      category,
      excerpt,
      markdownFile
    });
  });

  // 依照日期由新到舊排序 (Newest first)
  posts.sort((a, b) => new Date(b.date) - new Date(a.date));

  // 確保輸出路徑的父資料夾存在
  const outputDir = path.dirname(outputFile);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // 寫入 JSON 檔案
  fs.writeFileSync(outputFile, JSON.stringify(posts, null, 2), 'utf-8');
  console.log(`✅ 成功生成文章元資料索引！共 ${posts.length} 篇文章。`);
  console.log(`📂 索引儲存於: ${outputFile}`);
} catch (err) {
  console.error('❌ 生成文章元資料時出錯:', err);
  process.exit(1);
}
