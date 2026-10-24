import { resolveMediaUrl, stripFrontmatter } from './shared/markdown';

describe('resolveMediaUrl', () => {
  test('keeps external URLs untouched', () => {
    expect(resolveMediaUrl('https://example.com/a.jpg')).toBe('https://example.com/a.jpg');
    expect(resolveMediaUrl('data:image/png;base64,AAA')).toBe('data:image/png;base64,AAA');
  });

  test('normalizes relative and public paths', () => {
    const base = process.env.PUBLIC_URL || '';
    expect(resolveMediaUrl('../image/a.jpg')).toBe(`${base}/image/a.jpg`);
    expect(resolveMediaUrl('./image/a.jpg')).toBe(`${base}/image/a.jpg`);
    expect(resolveMediaUrl('/image/a.jpg')).toBe(`${base}/image/a.jpg`);
    expect(resolveMediaUrl('public/image/a.jpg')).toBe(`${base}/image/a.jpg`);
  });
});

test('resolveMediaUrl resolves post-relative paths against the post folder', () => {
  const base = process.env.PUBLIC_URL || '';
  expect(resolveMediaUrl('./dog.jpg', 'posts/my-post')).toBe(`${base}/posts/my-post/dog.jpg`);
  expect(resolveMediaUrl('photos/a.png', 'posts/my-post')).toBe(`${base}/posts/my-post/photos/a.png`);
  // 共用圖庫與外部網址不受影響
  expect(resolveMediaUrl('/image/a.jpg', 'posts/my-post')).toBe(`${base}/image/a.jpg`);
  expect(resolveMediaUrl('../image/a.jpg', 'posts/my-post')).toBe(`${base}/image/a.jpg`);
  expect(resolveMediaUrl('./image/a.jpg', 'posts/my-post')).toBe(`${base}/image/a.jpg`);
  expect(resolveMediaUrl('https://x.com/a.jpg', 'posts/my-post')).toBe('https://x.com/a.jpg');
});

test('stripFrontmatter removes the YAML header only', () => {
  const md = '---\ntitle: Hello\n---\n# Body\ntext';
  expect(stripFrontmatter(md)).toBe('# Body\ntext');
  expect(stripFrontmatter('# No header')).toBe('# No header');
});
