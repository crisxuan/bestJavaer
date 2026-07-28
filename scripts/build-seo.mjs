#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { marked } from 'marked';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, '..');
const outputDir = path.join(rootDir, 'dist');
const baseUrl = (process.env.SITE_URL || 'https://bestjavaer-nine.vercel.app').replace(/\/+$/, '');
const categories = [
  { id: '01-agent-and-coding', zh: 'AI Agent 与编程工具', en: 'AI Agent & Coding' },
  { id: '02-models-and-research', zh: '模型、研究与 Prompt', en: 'Models, Research & Prompt' },
  { id: '03-tools-and-resources', zh: '工具、资源与工作台', en: 'Tools, Resources & Workbench' },
  { id: '04-industry-and-business', zh: '产业、商业与公司动态', en: 'Industry, Business & Companies' },
  { id: '05-ai-creation-and-media', zh: 'AI 生成与多媒体', en: 'AI Creation & Media' },
  { id: '06-notes-and-observations', zh: '观察、随笔与阶段记录', en: 'Notes & Observations' }
];
const roots = [
  { source: 'ai-articles', language: 'zh-CN', prefix: '', label: '中文' },
  { source: 'en/ai-articles', language: 'en', prefix: 'en', label: 'English' }
];

marked.use({ gfm: true, breaks: false });

function read(relativePath) {
  return fs.readFileSync(path.join(rootDir, relativePath), 'utf8');
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeJson(value) {
  return JSON.stringify(value).replace(/</g, '\\u003c');
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

function cleanPathForArticle(article) {
  const languagePrefix = article.root.prefix ? `/${article.root.prefix}` : '';
  return `${languagePrefix}/articles/${article.category}/${encodeURIComponent(article.slug)}/`;
}

function cleanPathForCategory(root, category) {
  const languagePrefix = root.prefix ? `/${root.prefix}` : '';
  return `${languagePrefix}/articles/${category}/`;
}

function cleanPathForHub(root) {
  return root.prefix ? `/${root.prefix}/articles/` : '/articles/';
}

function sourceRouteForArticle(article) {
  return `${article.root.source}/${article.category}/${encodeURIComponent(article.slug)}`;
}

function stripMarkdown(markdown) {
  return markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/!\[[^\]]*]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)]\([^)]*\)/g, '$1')
    .replace(/[#>*_`~|\-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getSummary(markdown, title, language) {
  const blocks = markdown
    .split(/\n{2,}/)
    .map((block) => stripMarkdown(block))
    .filter((block) => {
      return block &&
        block !== title &&
        !/^日期[：:]?\s*\d{4}-\d{2}-\d{2}/.test(block) &&
        !/^Date[：:]?\s*\d{4}-\d{2}-\d{2}/i.test(block) &&
        block.indexOf('English 中文') === -1 &&
        block.indexOf('English | 中文') === -1;
    });
  const fallback = language === 'en'
    ? 'Practical AI field notes, tutorials, tests, and product judgment from cxuan-ai-labs.'
    : '长期折腾 Codex、Claude Code 和 Agent 工作流，记录真实踩坑、工具实测和产品判断。';
  const summary = blocks.find((block) => block.length >= 30) || blocks[0] || fallback;
  return summary.length > 180 ? `${summary.slice(0, 177)}…` : summary;
}

function extractTitle(markdown, fallback) {
  const match = markdown.match(/^#\s+(.+)$/m);
  return match ? stripMarkdown(match[1]).trim() : fallback;
}

function extractImage(markdown, markdownPath) {
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

function parseArticleIndex(root) {
  const articles = [];

  categories.forEach((category) => {
    const indexPath = `${root.source}/${category.id}/README.md`;

    if (!fs.existsSync(path.join(rootDir, indexPath))) {
      return;
    }

    read(indexPath).split(/\r?\n/).forEach((line) => {
      const match = line.match(/^- (\d{4}-\d{2}-\d{2}) - \[([^\]]+)]\(([^)]+)\)/);

      if (!match) {
        return;
      }

      const href = match[3].replace(/^\.\//, '').split(/[?#]/)[0];
      const slug = decodeSafely(href.replace(/\.md$/i, ''));
      const markdownPath = `${root.source}/${category.id}/${slug}.md`;

      if (!fs.existsSync(path.join(rootDir, markdownPath))) {
        return;
      }

      const markdown = read(markdownPath);
      const title = extractTitle(markdown, match[2].trim());

      articles.push({
        category: category.id,
        date: match[1],
        image: extractImage(markdown, markdownPath),
        markdown,
        markdownPath,
        root,
        slug,
        summary: getSummary(markdown, title, root.language),
        title
      });
    });
  });

  return articles.sort((left, right) => right.date.localeCompare(left.date) || left.title.localeCompare(right.title));
}

const articles = roots.flatMap(parseArticleIndex);
const articleByMarkdownPath = new Map(articles.map((article) => [article.markdownPath, article]));
const translationMapPath = path.join(rootDir, 'en/ai-articles/translation-map.json');
const translationMap = fs.existsSync(translationMapPath)
  ? JSON.parse(fs.readFileSync(translationMapPath, 'utf8'))
  : {};
const reverseTranslationMap = new Map();

Object.entries(translationMap).forEach(([source, value]) => {
  if (value && value.english_path) {
    reverseTranslationMap.set(value.english_path, source);
  }
});

function getAlternates(article) {
  let chinese = article.root.language === 'zh-CN' ? article : null;
  let english = article.root.language === 'en' ? article : null;

  if (chinese && translationMap[chinese.markdownPath]) {
    english = articleByMarkdownPath.get(translationMap[chinese.markdownPath].english_path) || null;
  }

  if (english && reverseTranslationMap.has(english.markdownPath)) {
    chinese = articleByMarkdownPath.get(reverseTranslationMap.get(english.markdownPath)) || null;
  }

  return { chinese, english };
}

function cleanMarkdown(markdown) {
  return markdown
    .replace(/^#\s+.+\r?\n+/, '')
    .replace(/^\[(?:English|中文)]\([^\n]+\)\s*\|\s*\[(?:English|中文)]\([^\n]+\)\r?\n+/i, '')
    .replace(/^>\s*(?:日期|Date)[：:]\s*\d{4}-\d{2}-\d{2}\r?\n+/i, '')
    .trim();
}

function resolveLocalReference(reference, markdownPath, attribute) {
  if (!reference || /^(?:https?:|mailto:|tel:|data:|javascript:|#(?!\/)|\/\/)/i.test(reference)) {
    return reference;
  }

  if (reference.startsWith('#/')) {
    return `${baseUrl}/${reference}`;
  }

  const cleanReference = reference.split('#')[0].split('?')[0];
  const suffix = reference.slice(cleanReference.length);
  const decodedReference = decodeSafely(cleanReference);
  const resolved = path.posix.normalize(
    decodedReference.startsWith('/')
      ? decodedReference.replace(/^\/+/, '')
      : path.posix.join(path.posix.dirname(markdownPath), decodedReference)
  );
  const normalizedMarkdownPath = resolved.endsWith('.md') ? resolved : `${resolved}.md`;
  const linkedArticle = articleByMarkdownPath.get(normalizedMarkdownPath);

  if (linkedArticle) {
    return cleanPathForArticle(linkedArticle) + suffix;
  }

  const categoryMatch = resolved.match(/^(en\/)?ai-articles\/(0[1-6]-[^/]+)\/README(?:\.md)?$/);

  if (categoryMatch) {
    return cleanPathForCategory(categoryMatch[1] ? roots[1] : roots[0], categoryMatch[2]) + suffix;
  }

  if (/^(?:en\/)?ai-articles\/README(?:\.md)?$/.test(resolved)) {
    return cleanPathForHub(resolved.startsWith('en/') ? roots[1] : roots[0]) + suffix;
  }

  if (attribute === 'src') {
    return `/${encodePath(resolved)}${suffix}`;
  }

  return `${baseUrl}/#/${encodePath(resolved.replace(/\.md$/i, ''))}${suffix}`;
}

function renderMarkdown(article) {
  const safeMarkdown = cleanMarkdown(article.markdown)
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/\son[a-z]+\s*=\s*["'][^"']*["']/gi, '');
  const rendered = marked.parse(safeMarkdown);

  return rendered
    .replace(/\s(?:href|src)="[^"]*"/g, (match) => {
      const parts = match.match(/^\s(href|src)="([^"]*)"$/);
      const attribute = parts[1];
      const resolved = resolveLocalReference(parts[2], article.markdownPath, attribute);
      return ` ${attribute}="${escapeHtml(resolved)}"`;
    })
    .replace(/<a\s/gi, '<a rel="noopener" ')
    .replace(/<img\s/gi, '<img loading="lazy" decoding="async" ');
}

function alternateLinks(alternates) {
  const links = [];

  if (alternates.chinese) {
    links.push(`<link rel="alternate" hreflang="zh-CN" href="${baseUrl}${cleanPathForArticle(alternates.chinese)}">`);
    links.push(`<link rel="alternate" hreflang="x-default" href="${baseUrl}${cleanPathForArticle(alternates.chinese)}">`);
  }

  if (alternates.english) {
    links.push(`<link rel="alternate" hreflang="en" href="${baseUrl}${cleanPathForArticle(alternates.english)}">`);
  }

  return links.join('\n  ');
}

function renderPageHead({ title, description, canonical, image, language, type, alternates = '', jsonLd }) {
  return `<!DOCTYPE html>
<html lang="${language}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1">
  <meta name="theme-color" content="#f5f7f7">
  <title>${escapeHtml(title)} | cxuan-ai-labs</title>
  <link rel="canonical" href="${canonical}">
  ${alternates}
  <meta property="og:site_name" content="cxuan-ai-labs">
  <meta property="og:type" content="${type}">
  <meta property="og:locale" content="${language === 'en' ? 'en_US' : 'zh_CN'}">
  <meta property="og:title" content="${escapeHtml(title)} | cxuan-ai-labs">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${escapeHtml(image)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title)} | cxuan-ai-labs">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${escapeHtml(image)}">
  <link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
  <link rel="alternate" type="application/rss+xml" title="cxuan-ai-labs RSS" href="${language === 'en' ? '/rss.en.xml' : '/rss.xml'}">
  <link rel="stylesheet" href="/assets/seo-page.css?v=20260722-seo-1">
  <script>try{document.documentElement.dataset.theme=localStorage.getItem('cxuan-home-neural-theme')||'light'}catch(e){}</script>
  <script type="application/ld+json">${escapeJson(jsonLd)}</script>
</head>`;
}

function renderHeader(language) {
  const isEnglish = language === 'en';
  return `<header class="seo-header">
  <a class="seo-brand" href="/" aria-label="cxuan-ai-labs 首页"><img src="/assets/cxuan-ai-labs-logo.png" alt="cxuan-ai-labs" width="720" height="185"></a>
  <nav aria-label="${isEnglish ? 'Primary navigation' : '主导航'}">
    <a href="${isEnglish ? '/en/articles/' : '/articles/'}">${isEnglish ? 'Articles' : '文章'}</a>
    <a href="/#/works/README">${isEnglish ? 'Works' : '作品'}</a>
    <a href="/#/ai-resources/README">${isEnglish ? 'Resources' : '资源'}</a>
    <button type="button" data-theme-toggle aria-label="${isEnglish ? 'Toggle color theme' : '切换亮暗主题'}">◐</button>
  </nav>
</header>`;
}

function renderFooter(language) {
  const isEnglish = language === 'en';
  return `<footer class="seo-footer"><span>© 2026 cxuan · CC BY-SA 4.0</span><a href="${isEnglish ? '/rss.en.xml' : '/rss.xml'}">RSS</a><a href="https://github.com/crisxuan" rel="me noopener">GitHub</a></footer>
<script>(function(){var b=document.querySelector('[data-theme-toggle]');if(!b)return;b.addEventListener('click',function(){var n=document.documentElement.dataset.theme==='dark'?'light':'dark';document.documentElement.dataset.theme=n;try{localStorage.setItem('cxuan-home-neural-theme',n)}catch(e){}})}());</script>`;
}

function writeOutput(relativePath, content) {
  const target = path.join(outputDir, relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content, 'utf8');
}

function outputPathFromCleanPath(cleanPath) {
  return path.join(decodeSafely(cleanPath.replace(/^\//, '')), 'index.html');
}

function renderArticlePage(article) {
  const canonical = `${baseUrl}${cleanPathForArticle(article)}`;
  const alternates = getAlternates(article);
  const category = categories.find((item) => item.id === article.category);
  const isEnglish = article.root.language === 'en';
  const categoryName = isEnglish ? category.en : category.zh;
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: article.title,
      description: article.summary,
      image: [article.image],
      datePublished: article.date,
      dateModified: article.date,
      inLanguage: article.root.language,
      mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
      author: { '@type': 'Person', name: 'cxuan', url: 'https://github.com/crisxuan' },
      publisher: {
        '@type': 'Organization',
        name: 'cxuan-ai-labs',
        url: baseUrl,
        logo: { '@type': 'ImageObject', url: `${baseUrl}/assets/cxuan-ai-labs-logo.png`, width: 720, height: 185 }
      }
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: isEnglish ? 'Home' : '首页', item: `${baseUrl}${isEnglish ? '/en/' : '/'}` },
        { '@type': 'ListItem', position: 2, name: isEnglish ? 'Articles' : '文章', item: `${baseUrl}${cleanPathForHub(article.root)}` },
        { '@type': 'ListItem', position: 3, name: categoryName, item: `${baseUrl}${cleanPathForCategory(article.root, article.category)}` },
        { '@type': 'ListItem', position: 4, name: article.title, item: canonical }
      ]
    }
  ];

  return `${renderPageHead({
    title: article.title,
    description: article.summary,
    canonical,
    image: article.image,
    language: article.root.language,
    type: 'article',
    alternates: alternateLinks(alternates),
    jsonLd
  })}
<body>
${renderHeader(article.root.language)}
<main class="seo-layout">
  <article class="seo-article">
    <nav class="seo-breadcrumb" aria-label="Breadcrumb"><a href="${cleanPathForHub(article.root)}">${isEnglish ? 'Articles' : '文章'}</a><span>/</span><a href="${cleanPathForCategory(article.root, article.category)}">${escapeHtml(categoryName)}</a></nav>
    <p class="seo-kicker">${escapeHtml(categoryName)} · <time datetime="${article.date}">${article.date}</time></p>
    <h1>${escapeHtml(article.title)}</h1>
    <p class="seo-lead">${escapeHtml(article.summary)}</p>
    <div class="seo-article-actions"><a href="/#/${encodePath(sourceRouteForArticle(article))}">${isEnglish ? 'Interactive reading view ↗' : '进入动态阅读模式 ↗'}</a></div>
    <div class="seo-prose">${renderMarkdown(article)}</div>
  </article>
</main>
${renderFooter(article.root.language)}
</body>
</html>`;
}

function renderCollectionPage(root, categoryId = '') {
  const isEnglish = root.language === 'en';
  const category = categories.find((item) => item.id === categoryId);
  const selected = articles.filter((article) => article.root === root && (!categoryId || article.category === categoryId));
  const title = category ? (isEnglish ? category.en : category.zh) : (isEnglish ? 'AI Articles' : 'AI 文章');
  const description = category
    ? (isEnglish ? `${category.en}: practical articles and first-hand notes from cxuan-ai-labs.` : `${category.zh}：来自 cxuan-ai-labs 的实战文章、工具实测和一手观察。`)
    : (isEnglish ? 'Practical AI notes, tutorials, tool tests, and product judgment from cxuan-ai-labs.' : '聚合 Codex、Claude Code、Agent 工作流、模型研究与 AI 工具实测。');
  const cleanPath = category ? cleanPathForCategory(root, categoryId) : cleanPathForHub(root);
  const canonical = `${baseUrl}${cleanPath}`;
  const alternateRoot = isEnglish ? roots[0] : roots[1];
  const alternatePath = category ? cleanPathForCategory(alternateRoot, categoryId) : cleanPathForHub(alternateRoot);
  const cards = selected.map((article, index) => `<li>
    <a href="${cleanPathForArticle(article)}">
      <span class="seo-card-index">${String(index + 1).padStart(2, '0')}</span>
      <span class="seo-card-copy"><small>${escapeHtml((isEnglish ? categories.find((item) => item.id === article.category).en : categories.find((item) => item.id === article.category).zh))} · ${article.date}</small><strong>${escapeHtml(article.title)}</strong><span>${escapeHtml(article.summary)}</span></span>
      <span class="seo-card-arrow">↗</span>
    </a>
  </li>`).join('\n');
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: title,
    description,
    url: canonical,
    inLanguage: root.language,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: selected.length,
      itemListElement: selected.map((article, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: article.title,
        url: `${baseUrl}${cleanPathForArticle(article)}`
      }))
    }
  };

  return `${renderPageHead({
    title,
    description,
    canonical,
    image: `${baseUrl}/assets/home-neural-hero.png`,
    language: root.language,
    type: 'website',
    alternates: `<link rel="alternate" hreflang="zh-CN" href="${baseUrl}${isEnglish ? alternatePath : cleanPath}">\n  <link rel="alternate" hreflang="en" href="${baseUrl}${isEnglish ? cleanPath : alternatePath}">\n  <link rel="alternate" hreflang="x-default" href="${baseUrl}${isEnglish ? alternatePath : cleanPath}">`,
    jsonLd
  })}
<body>
${renderHeader(root.language)}
<main class="seo-layout seo-collection">
  <header><p class="seo-kicker">ARTICLE FIELD · ${String(selected.length).padStart(2, '0')}</p><h1>${escapeHtml(title)}</h1><p class="seo-lead">${escapeHtml(description)}</p></header>
  ${category ? `<a class="seo-back" href="${cleanPathForHub(root)}">← ${isEnglish ? 'All articles' : '全部文章'}</a>` : ''}
  <ol class="seo-card-list">${cards}</ol>
</main>
${renderFooter(root.language)}
</body>
</html>`;
}

function renderEnglishLandingPage() {
  const root = roots[1];
  const selected = articles.filter((article) => article.root === root).slice(0, 12);
  const canonical = `${baseUrl}/en/`;
  const description = 'Practical field notes on Codex, Claude Code, agent workflows, AI tools, and product judgment.';
  const cards = selected.map((article, index) => `<li>
    <a href="${cleanPathForArticle(article)}">
      <span class="seo-card-index">${String(index + 1).padStart(2, '0')}</span>
      <span class="seo-card-copy"><small>${escapeHtml(categories.find((item) => item.id === article.category).en)} · ${article.date}</small><strong>${escapeHtml(article.title)}</strong><span>${escapeHtml(article.summary)}</span></span>
      <span class="seo-card-arrow">↗</span>
    </a>
  </li>`).join('\n');
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'cxuan-ai-labs',
    url: canonical,
    description,
    inLanguage: 'en',
    publisher: { '@type': 'Person', name: 'cxuan', url: 'https://github.com/crisxuan' }
  };

  return `${renderPageHead({
    title: 'cxuan-ai-labs',
    description,
    canonical,
    image: `${baseUrl}/assets/home-neural-hero.png`,
    language: 'en',
    type: 'website',
    alternates: `<link rel="alternate" hreflang="zh-CN" href="${baseUrl}/">\n  <link rel="alternate" hreflang="en" href="${canonical}">\n  <link rel="alternate" hreflang="x-default" href="${baseUrl}/">`,
    jsonLd
  })}
<body>
${renderHeader('en')}
<main class="seo-layout seo-collection">
  <header><p class="seo-kicker">CXUAN · AI LABS</p><h1>Make complex AI<br>practical.</h1><p class="seo-lead">${description}</p></header>
  <a class="seo-back" href="/en/articles/">Browse all ${articles.filter((article) => article.root === root).length} articles →</a>
  <ol class="seo-card-list">${cards}</ol>
</main>
${renderFooter('en')}
</body>
</html>`;
}

function copyApplication() {
  const ignored = new Set([
    '.git', '.github', '.claude', '.playwright-cli', 'dist', 'node_modules', 'scripts', 'api'
  ]);

  function copyDirectory(sourceDirectory, targetDirectory, relativeDirectory = '') {
    fs.mkdirSync(targetDirectory, { recursive: true });

    fs.readdirSync(sourceDirectory, { withFileTypes: true }).forEach((entry) => {
      const relative = path.join(relativeDirectory, entry.name);
      const first = relative.split(path.sep)[0];

      if (
        ignored.has(first) ||
        /^(?:package(?:-lock)?\.json|pnpm-lock\.yaml|vercel\.json|\.vercelignore|\.gitignore)$/.test(relative)
      ) {
        return;
      }

      const source = path.join(sourceDirectory, entry.name);
      const target = path.join(targetDirectory, entry.name);

      if (entry.isDirectory()) {
        copyDirectory(source, target, relative);
      } else if (entry.isFile()) {
        fs.copyFileSync(source, target);
      }
    });
  }

  fs.rmSync(outputDir, { recursive: true, force: true });
  fs.mkdirSync(outputDir, { recursive: true });
  copyDirectory(rootDir, outputDir);
}

copyApplication();

writeOutput('en/index.html', renderEnglishLandingPage());

roots.forEach((root) => {
  writeOutput(outputPathFromCleanPath(cleanPathForHub(root)), renderCollectionPage(root));

  categories.forEach((category) => {
    writeOutput(
      outputPathFromCleanPath(cleanPathForCategory(root, category.id)),
      renderCollectionPage(root, category.id)
    );
  });
});

articles.forEach((article) => {
  writeOutput(outputPathFromCleanPath(cleanPathForArticle(article)), renderArticlePage(article));
});

console.log(`Generated ${articles.length} static article pages and ${roots.length * (categories.length + 1)} collection pages in dist/.`);
