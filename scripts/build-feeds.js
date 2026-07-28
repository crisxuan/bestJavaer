#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const baseUrl = (process.env.SITE_URL || 'https://cxuan-labs.vercel.app').replace(/\/+$/, '');
const now = new Date().toISOString();

const categories = [
  '01-agent-and-coding',
  '02-models-and-research',
  '03-tools-and-resources',
  '04-industry-and-business',
  '05-ai-creation-and-media',
  '06-notes-and-observations'
];

function readText(filePath) {
  return fs.readFileSync(path.join(rootDir, filePath), 'utf8');
}

function writeText(filePath, content) {
  fs.writeFileSync(path.join(rootDir, filePath), content, 'utf8');
}

function escapeXml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function decodeSafely(value) {
  try {
    return decodeURIComponent(value);
  } catch (error) {
    return value;
  }
}

function encodePath(value) {
  return value
    .split('/')
    .filter(Boolean)
    .map((segment) => encodeURIComponent(decodeSafely(segment)))
    .join('/');
}

function toCleanPath(route) {
  const normalized = route.replace(/^\/+/, '').replace(/\.md$/i, '');

  if (!normalized) {
    return '/';
  }

  if (normalized === 'home.en') {
    return '/en/';
  }

  if (normalized === 'ai-articles/README') {
    return '/articles/';
  }

  if (normalized === 'en/ai-articles/README') {
    return '/en/articles/';
  }

  const match = normalized.match(/^(en\/)?ai-articles\/(0[1-6]-[^/]+)\/(.+)$/);

  if (match) {
    const prefix = match[1] ? '/en' : '';
    const tail = match[3] === 'README' ? '' : `${encodePath(match[3])}/`;
    return `${prefix}/articles/${match[2]}/${tail}`;
  }

  return `/#/${encodePath(normalized)}`;
}

function toRouteUrl(route) {
  return `${baseUrl}${toCleanPath(route)}`;
}

function stripMarkdown(markdown) {
  return markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)]\([^)]*\)/g, '$1')
    .replace(/[#>*_`~-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getArticleSummary(markdownPath) {
  const markdown = readText(markdownPath);
  const paragraphs = markdown
    .split(/\n{2,}/)
    .map((block) => stripMarkdown(block))
    .filter((block) => block && !/^\d{4}-\d{2}-\d{2}/.test(block));

  return (paragraphs[1] || paragraphs[0] || 'cxuan-ai-labs article').slice(0, 220);
}

function getArticleImage(markdownPath) {
  const markdown = readText(markdownPath);
  const htmlImage = markdown.match(/<img[^>]+src=["']([^"']+)["']/i);
  const markdownImage = markdown.match(/!\[[^\]]*]\(([^)\s]+)(?:\s+["'][^"']*["'])?\)/);
  const raw = htmlImage ? htmlImage[1] : markdownImage ? markdownImage[1] : '';

  if (!raw) {
    return `${baseUrl}/assets/home-neural-hero.png`;
  }

  if (/^(?:https?:)?\/\//i.test(raw)) {
    return raw.startsWith('//') ? `https:${raw}` : raw;
  }

  const resolved = path.posix.normalize(path.posix.join(path.posix.dirname(markdownPath), decodeSafely(raw)));
  return `${baseUrl}/${encodePath(resolved)}`;
}

function parseArticleIndex(articleRoot) {
  const items = [];

  categories.forEach((category) => {
    const readmePath = `${articleRoot}/${category}/README.md`;

    if (!fs.existsSync(path.join(rootDir, readmePath))) {
      return;
    }

    readText(readmePath).split(/\r?\n/).forEach((line) => {
      const match = line.match(/^- (\d{4}-\d{2}-\d{2}) - \[([^\]]+)]\(([^)]+)\)/);

      if (!match) {
        return;
      }

      const date = match[1];
      const title = match[2].trim();
      const href = match[3].replace(/^\.\//, '');
      const articleFile = href.replace(/\.md(?:[?#].*)?$/i, '');
      const markdownPath = `${articleRoot}/${category}/${decodeURIComponent(articleFile)}.md`;

      items.push({
        category,
        date,
        image: fs.existsSync(path.join(rootDir, markdownPath)) ? getArticleImage(markdownPath) : '',
        markdownPath,
        route: `${articleRoot}/${category}/${articleFile}`,
        summary: fs.existsSync(path.join(rootDir, markdownPath)) ? getArticleSummary(markdownPath) : '',
        title
      });
    });
  });

  return items.sort((left, right) => right.date.localeCompare(left.date) || left.title.localeCompare(right.title));
}

function buildRss(articleRoot, language, outputFile) {
  const isEnglish = language === 'en';
  const articles = parseArticleIndex(articleRoot).slice(0, 50);
  const channelTitle = isEnglish ? 'cxuan-ai-labs - AI Articles' : 'cxuan-ai-labs';
  const channelDescription = isEnglish
    ? 'Practical AI notes, tutorials, observations, and resources from cxuan-ai-labs.'
    : '把复杂的 AI，讲成能上手的干货。';
  const channelLink = toRouteUrl(isEnglish ? 'en/ai-articles/README' : 'ai-articles/README');
  const items = articles.map((article) => {
    const link = toRouteUrl(article.route);

    return [
      '    <item>',
      `      <title>${escapeXml(article.title)}</title>`,
      `      <link>${escapeXml(link)}</link>`,
      `      <guid isPermaLink="true">${escapeXml(link)}</guid>`,
      `      <pubDate>${new Date(`${article.date}T00:00:00Z`).toUTCString()}</pubDate>`,
      `      <description>${escapeXml(article.summary)}</description>`,
      '    </item>'
    ].join('\n');
  }).join('\n');

  writeText(outputFile, [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0">',
    '  <channel>',
    `    <title>${escapeXml(channelTitle)}</title>`,
    `    <link>${escapeXml(channelLink)}</link>`,
    `    <description>${escapeXml(channelDescription)}</description>`,
    `    <language>${isEnglish ? 'en' : 'zh-CN'}</language>`,
    `    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>`,
    items,
    '  </channel>',
    '</rss>',
    ''
  ].join('\n'));
}

function buildSitemap() {
  const routes = [
    { route: '', changefreq: 'weekly', priority: '1.0' },
    { route: 'home.en', changefreq: 'weekly', priority: '0.8' },
    { route: 'ai-articles/README', changefreq: 'daily', priority: '0.9' },
    { route: 'en/ai-articles/README', changefreq: 'weekly', priority: '0.7' }
  ];

  ['ai-articles', 'en/ai-articles'].forEach((articleRoot) => {
    categories.forEach((category) => {
      routes.push({
        changefreq: 'weekly',
        priority: articleRoot === 'ai-articles' ? '0.8' : '0.6',
        route: `${articleRoot}/${category}/README`
      });
    });

    parseArticleIndex(articleRoot).forEach((article) => {
      routes.push({
        changefreq: 'monthly',
        image: article.image,
        lastmod: article.date,
        priority: articleRoot === 'ai-articles' ? '0.7' : '0.5',
        route: article.route
      });
    });
  });

  const urls = routes.map((entry) => {
    const loc = entry.route ? toRouteUrl(entry.route) : `${baseUrl}/`;
    const lastmod = entry.lastmod || now.slice(0, 10);

    return [
      '  <url>',
      `    <loc>${escapeXml(loc)}</loc>`,
      `    <lastmod>${escapeXml(lastmod)}</lastmod>`,
      `    <changefreq>${entry.changefreq}</changefreq>`,
      `    <priority>${entry.priority}</priority>`,
      entry.image ? `    <image:image><image:loc>${escapeXml(entry.image)}</image:loc></image:image>` : '',
      '  </url>'
    ].filter(Boolean).join('\n');
  }).join('\n');

  writeText('sitemap.xml', [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
    urls,
    '</urlset>',
    ''
  ].join('\n'));
}

function buildRobots() {
  writeText('robots.txt', [
    'User-agent: *',
    'Allow: /',
    '',
    `Sitemap: ${baseUrl}/sitemap.xml`,
    ''
  ].join('\n'));
}

buildRss('ai-articles', 'zh-CN', 'rss.xml');
buildRss('en/ai-articles', 'en', 'rss.en.xml');
buildSitemap();
buildRobots();

console.log('Generated rss.xml, rss.en.xml, sitemap.xml, and robots.txt');
