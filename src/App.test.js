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

test('stripFrontmatter removes the YAML header only', () => {
  const md = '---\ntitle: Hello\n---\n# Body\ntext';
  expect(stripFrontmatter(md)).toBe('# Body\ntext');
  expect(stripFrontmatter('# No header')).toBe('# No header');
});
