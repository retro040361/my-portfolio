// 建立新文章：npm run new-post（會一步一步問標題、網址、分類、標籤）
// 也可以直接帶標題：npm run new-post "我的新文章"
//
// 會建立 public/posts/<網址名稱>/index.md，預設是草稿（draft: true），
// 寫完把 draft 那行刪掉就會發佈；圖片直接丟進同一個資料夾，用 ![](./圖片.jpg) 引用。

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const POSTS_DIR = path.join(__dirname, '../public/posts');
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const CATEGORIES = ['tech', 'life'];

const today = () => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

// 從標題裡的英文字組出建議的網址；中文標題就用日期
const suggestSlug = (title) => {
  const words = title.toLowerCase().match(/[a-z0-9]+/g);
  const slug = words ? words.join('-').slice(0, 50).replace(/-+$/, '') : '';
  return slug || `post-${today().replace(/-/g, '')}`;
};

// 用佇列收輸入的每一行，貼上多行或用管線（pipe）輸入時才不會漏掉答案
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const lines = [];
const waiting = [];
let closed = false;
rl.on('line', line => (waiting.length ? waiting.shift()(line) : lines.push(line)));
rl.on('close', () => { closed = true; while (waiting.length) waiting.shift()(''); });
const ask = (q, fallback = '') => new Promise(resolve => {
  process.stdout.write(fallback ? `${q}（直接 Enter 用「${fallback}」）：` : `${q}：`);
  const done = answer => resolve(answer.trim() || fallback);
  if (lines.length) done(lines.shift());
  else if (closed) done('');
  else waiting.push(done);
});

const main = async () => {
  let title = process.argv.slice(2).join(' ').trim();
  while (!title) {
    title = await ask('文章標題');
    if (!title && closed) { console.log('\n已取消'); process.exit(1); }
  }

  let slug = '';
  while (!slug) {
    slug = (await ask('網址名稱（小寫英文、數字、-）', suggestSlug(title))).toLowerCase();
    if (!SLUG_PATTERN.test(slug)) {
      console.log('  ✗ 只能用小寫英文、數字和 -，例如 my-first-post');
      slug = '';
    } else if (fs.existsSync(path.join(POSTS_DIR, slug))) {
      console.log(`  ✗ posts/${slug} 已經存在，換一個`);
      slug = '';
    }
  }

  let category = '';
  while (!CATEGORIES.includes(category)) {
    category = (await ask(`分類（${CATEGORIES.join(' / ')}）`, 'tech')).toLowerCase();
  }

  const tags = (await ask('標籤（用逗號分開，可以留空）')).split(/[,，]/).map(t => t.trim()).filter(Boolean);
  rl.close();

  const dir = path.join(POSTS_DIR, slug);
  fs.mkdirSync(dir, { recursive: true });
  const frontmatter = [
    '---',
    `title: ${JSON.stringify(title)}`,
    `date: ${today()}`,
    `category: ${category}`,
    `tags: [${tags.map(t => JSON.stringify(t)).join(', ')}]`,
    'excerpt: ""   # 列表上的摘要，留空會自動抓內文前 100 字',
    '# cover: ./cover.jpg   # 封面，沒寫會用文章第一張圖',
    'draft: true   # 寫完把這行刪掉才會發佈',
    '---',
  ].join('\n');
  fs.writeFileSync(path.join(dir, 'index.md'), `${frontmatter}\n\n從這裡開始寫～\n\n<!-- 圖片放在同一個資料夾，用 ![說明](./photo.jpg) 引用 -->\n`, 'utf-8');

  console.log(`\n✅ 已建立 public/posts/${slug}/index.md`);
  console.log(`   網址：#/blog/${slug}（npm start 時草稿也看得到）`);
};

main();
