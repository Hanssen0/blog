'use strict';

const { createHash } = require('crypto');
const fs = require('fs/promises');
const path = require('path');
const sharp = require('sharp');

const CARD_WIDTH = 1200;
const CARD_HEIGHT = 630;
const CARD_VERSION = '5';
const imageRoutes = new Map();
const metadataByPath = new Map();

function decodeEntities(value) {
  const named = {
    amp: '&',
    apos: "'",
    gt: '>',
    lt: '<',
    nbsp: ' ',
    quot: '"'
  };

  return value.replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (entity, code) => {
    if (code[0] !== '#') return named[code.toLowerCase()] || entity;

    const base = code[1].toLowerCase() === 'x' ? 16 : 10;
    const number = parseInt(code.slice(base === 16 ? 2 : 1), base);
    return Number.isFinite(number) ? String.fromCodePoint(number) : entity;
  });
}

function toPlainText(value, { preserveLineBreaks = false } = {}) {
  const text = decodeEntities(String(value || '')
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(?:blockquote|div|h[1-6]|li|p|pre|section)>/gi, '\n\n')
    .replace(/<[^>]+>/g, ' '));

  if (!preserveLineBreaks) return text.replace(/\s+/g, ' ').trim();

  return text
    .replace(/\r/g, '')
    .replace(/[^\S\n]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function truncate(value, length) {
  const characters = Array.from(value);
  return characters.length > length
    ? characters.slice(0, length).join('').trimEnd() + '…'
    : value;
}

function characterWidth(character, fontSize) {
  if (/\s/u.test(character)) return fontSize * 0.3;
  if (/^[\u3000-\u9fff\uf900-\ufaff\uff01-\uff60]$/u.test(character)) return fontSize;
  if (/[A-Z]/.test(character)) return fontSize * 0.69;
  if (/[a-z0-9]/.test(character)) return fontSize * 0.55;
  return fontSize * 0.42;
}

function wrapText(value, maxWidth, fontSize, maxLines) {
  const characters = Array.from(value);
  const lines = [];
  let line = '';
  let width = 0;
  let lastBreak = -1;

  while (characters.length && lines.length < maxLines) {
    const character = characters.shift();
    const nextWidth = width + characterWidth(character, fontSize);

    if (nextWidth <= maxWidth || !line) {
      line += character;
      width = nextWidth;
      if (/\s|[，。！？、；：,.!?;:]/u.test(character)) lastBreak = line.length;
      continue;
    }

    if (lastBreak > 0) {
      const remainder = Array.from(line.slice(lastBreak).trimStart());
      characters.unshift(...remainder, character);
      line = line.slice(0, lastBreak).trimEnd();
    } else {
      characters.unshift(character);
    }

    lines.push(line);
    line = '';
    width = 0;
    lastBreak = -1;
  }

  if (line && lines.length < maxLines) lines.push(line.trimEnd());

  if (characters.length && lines.length) {
    lines[lines.length - 1] = truncate(lines[lines.length - 1], Math.max(1, Array.from(lines[lines.length - 1]).length - 1));
  }

  return lines;
}

function truncateLastLine(lines) {
  for (let index = lines.length - 1; index >= 0; index -= 1) {
    if (!lines[index] || lines[index].endsWith('…')) continue;

    const characters = Array.from(lines[index]);
    lines[index] = characters.slice(0, Math.max(1, characters.length - 1)).join('').trimEnd() + '…';
    break;
  }
}

function wrapTextWithLineBreaks(value, maxWidth, fontSize, maxLines) {
  const sections = String(value).split('\n');
  const lines = [];

  for (let index = 0; index < sections.length; index += 1) {
    if (lines.length >= maxLines) {
      truncateLastLine(lines);
      break;
    }

    const section = sections[index];
    if (!section) {
      if (lines.length && lines[lines.length - 1] !== '') lines.push('');
      continue;
    }

    const wrapped = wrapText(section, maxWidth, fontSize, maxLines - lines.length);
    lines.push(...wrapped);

    if (wrapped[wrapped.length - 1]?.endsWith('…')) break;
    if (index < sections.length - 1 && lines.length >= maxLines) truncateLastLine(lines);
  }

  return lines.slice(0, maxLines);
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function textLines(lines, x, y, lineHeight) {
  return lines.map((line, index) =>
    `<tspan x="${x}" y="${y + index * lineHeight}">${escapeXml(line)}</tspan>`
  ).join('');
}

function formatDate(value) {
  const date = new Date(value && typeof value.valueOf === 'function' ? value.valueOf() : value);
  if (Number.isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date);
}

function createCard({ title, description, date, siteName, isThought }) {
  const serif = "'Noto Serif CJK SC', 'Noto Serif SC', 'Noto Serif TC', 'Noto Serif', Georgia, serif";
  const sans = "'Noto Sans CJK SC', 'Noto Sans SC', 'Noto Sans TC', 'Noto Sans', Arial, sans-serif";
  const siteTitle = "'Playfair Display SC', Georgia, 'Noto Serif', serif";
  const titleLines = isThought ? [] : wrapText(title, 1008, 60, 3);
  const bodySize = isThought ? 42 : 29;
  const bodyLineHeight = isThought ? 62 : 43;
  const bodyY = isThought ? 154 : 174 + titleLines.length * 72;
  const availableBodyLines = isThought ? 6 : Math.max(2, Math.floor((500 - bodyY) / bodyLineHeight));
  const bodyLines = wrapTextWithLineBreaks(description, 1008, bodySize, availableBodyLines);

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${CARD_WIDTH}" height="${CARD_HEIGHT}" viewBox="0 0 ${CARD_WIDTH} ${CARD_HEIGHT}">
      <rect width="1200" height="630" fill="#212121"/>
      ${isThought ? '' : `<text x="104" y="174" fill="#ffffff" font-family="${serif}" font-size="60" font-weight="700">${textLines(titleLines, 104, 174, 72)}</text>`}
      <text x="104" y="${bodyY}" fill="${isThought ? '#ffffff' : '#c0c0c0'}" font-family="${serif}" font-size="${bodySize}" font-weight="400">${textLines(bodyLines, 104, bodyY, bodyLineHeight)}</text>
      <line x1="104" y1="536" x2="1096" y2="536" stroke="#6e6e6e" stroke-width="2"/>
      <text x="104" y="580" fill="#c0c0c0" font-family="${sans}" font-size="24">${escapeXml(date)}</text>
      <text x="1096" y="580" fill="#c0c0c0" font-family="${siteTitle}" font-size="24" font-weight="900" text-anchor="end">${escapeXml(siteName)}</text>
    </svg>`;
}

hexo.extend.filter.register('before_generate', async function generateOpenGraphImages() {
  const posts = hexo.locals.get('posts').toArray();
  const cacheDirectory = path.join(hexo.base_dir, '.cache', 'open-graph-images');
  imageRoutes.clear();
  metadataByPath.clear();
  await fs.mkdir(cacheDirectory, { recursive: true });

  for (const post of posts) {
    const content = toPlainText(post.content);
    const cardContent = toPlainText(post.content, { preserveLineBreaks: true });
    const suppliedExcerpt = toPlainText(post.excerpt);
    const suppliedCardExcerpt = toPlainText(post.excerpt, { preserveLineBreaks: true });
    const suppliedDescription = toPlainText(post.description);
    const suppliedCardDescription = toPlainText(post.description, { preserveLineBreaks: true });
    const isThought = !post.title;
    const metadataTitle = isThought
      ? truncate(content || formatDate(post.date), 42)
      : toPlainText(post.title);
    const description = truncate(suppliedExcerpt || suppliedDescription || content || metadataTitle, 180);
    const cardDescription = suppliedCardExcerpt || suppliedCardDescription || cardContent || metadataTitle;
    const date = formatDate(post.date);
    const identity = createHash('sha256').update(post.path).digest('hex').slice(0, 12);
    const revision = createHash('sha256')
      .update(JSON.stringify({ title: metadataTitle, description, cardDescription, date, isThought, version: CARD_VERSION }))
      .digest('hex')
      .slice(0, 12);
    const filename = `${identity}-${revision}.png`;
    const imagePath = `open-graph-images/${filename}`;
    const cachePath = path.join(cacheDirectory, filename);
    let image;

    try {
      image = await fs.readFile(cachePath);
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;

      const svg = createCard({
        title: metadataTitle,
        description: cardDescription,
        date,
        siteName: hexo.config.title,
        isThought
      });
      image = await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer();
      await fs.writeFile(cachePath, image);
    }

    metadataByPath.set(post.path, {
      description,
      image: imagePath,
      title: metadataTitle
    });
    imageRoutes.set(imagePath, image);
  }
});

hexo.extend.helper.register('generated_open_graph', function generatedOpenGraph(page) {
  return metadataByPath.get(page && page.path) || null;
});

hexo.extend.generator.register('open-graph-images', function openGraphImages() {
  return Array.from(imageRoutes, ([routePath, data]) => ({ path: routePath, data }));
});
