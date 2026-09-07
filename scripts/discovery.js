'use strict';

const { URL } = require('url');

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function decodeEntities(value) {
  const named = {
    amp: '&',
    apos: "'",
    gt: '>',
    lt: '<',
    nbsp: ' ',
    quot: '"'
  };

  return String(value || '').replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (entity, code) => {
    if (code[0] !== '#') return named[code.toLowerCase()] || entity;

    const hexadecimal = code[1].toLowerCase() === 'x';
    const number = parseInt(code.slice(hexadecimal ? 2 : 1), hexadecimal ? 16 : 10);
    return Number.isFinite(number) ? String.fromCodePoint(number) : entity;
  });
}

function plainText(value) {
  return decodeEntities(String(value || '')
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim();
}

function truncate(value, length) {
  const characters = Array.from(value);
  return characters.length > length
    ? characters.slice(0, length).join('').trimEnd() + '…'
    : value;
}

function escapeMarkdownLabel(value) {
  return String(value).replace(/([\\\[\]])/g, '\\$1');
}

function canonicalRoute(route) {
  if (route === 'index.html') return '';
  if (route.endsWith('/index.html')) return route.slice(0, -'index.html'.length);
  return route;
}

function fullUrl(baseUrl, route = '') {
  const base = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  return new URL(canonicalRoute(route), base).href;
}

hexo.extend.filter.register('after_generate', function generateDiscoveryFiles() {
  const siteUrl = String(this.config.url || '').trim();
  if (!siteUrl) {
    this.log.warn('Skipping robots.txt, sitemap.xml, and llms.txt: config.url is not set.');
    return;
  }

  const aliases = new Set(Object.keys(this.config.alias || {}).map(canonicalRoute));
  const pageUrls = this.route.list()
    .filter(route => route === 'index.html' || route.endsWith('.html'))
    .map(canonicalRoute)
    .filter(route => !aliases.has(route))
    .map(route => fullUrl(siteUrl, route));
  const uniquePageUrls = [...new Set(pageUrls)].sort();

  const sitemap = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...uniquePageUrls.map(url => `  <url><loc>${escapeXml(url)}</loc></url>`),
    '</urlset>',
    ''
  ].join('\n');

  const sitemapUrl = fullUrl(siteUrl, 'sitemap.xml');
  const robots = [
    'User-agent: *',
    'Allow: /',
    '',
    `Sitemap: ${sitemapUrl}`,
    ''
  ].join('\n');

  const posts = this.locals.get('posts').sort('-date').toArray();
  const postLinks = posts.map(post => {
    const content = plainText(post.content);
    const label = plainText(post.title) || truncate(content, 48) || 'Untitled thought';
    return `- [${escapeMarkdownLabel(label)}](${fullUrl(siteUrl, post.path)})`;
  });
  const author = plainText(this.config.author);
  const llms = [
    `# ${plainText(this.config.title)}`,
    '',
    `> Essays and short thoughts${author ? ` by ${author}` : ''}.`,
    '',
    `Canonical site: ${fullUrl(siteUrl)}`,
    '',
    '## Feeds',
    '',
    `- [Atom](${fullUrl(siteUrl, 'atom.xml')})`,
    `- [RSS](${fullUrl(siteUrl, 'rss2.xml')})`,
    '',
    '## Articles and thoughts',
    '',
    ...postLinks,
    ''
  ].join('\n');

  this.route.set('sitemap.xml', sitemap);
  this.route.set('robots.txt', robots);
  this.route.set('llms.txt', llms);
});
