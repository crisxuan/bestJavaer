#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, '..');
const outputDir = path.join(rootDir, 'dist');
const failures = [];

function collectArticlePages(directory, pages = []) {
  if (!fs.existsSync(directory)) {
    return pages;
  }

  fs.readdirSync(directory, { withFileTypes: true }).forEach((entry) => {
    const target = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      collectArticlePages(target, pages);
      return;
    }

    if (entry.name === 'index.html' && /\/articles\/0[1-6]-[^/]+\/[^/]+\/index\.html$/.test(target)) {
      pages.push(target);
    }
  });

  return pages;
}

if (!fs.existsSync(outputDir)) {
  failures.push('dist/ does not exist; run npm run build first.');
}

const articlePages = collectArticlePages(outputDir);
const sitemapPath = path.join(outputDir, 'sitemap.xml');
const homePath = path.join(outputDir, 'index.html');

if (articlePages.length < 200) {
  failures.push(`Expected at least 200 static article pages, found ${articlePages.length}.`);
}

if (!fs.existsSync(sitemapPath)) {
  failures.push('dist/sitemap.xml is missing.');
} else {
  const sitemap = fs.readFileSync(sitemapPath, 'utf8');
  const urls = Array.from(sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)).map((match) => match[1]);

  if (urls.some((url) => url.includes('/#/'))) {
    failures.push('Sitemap still contains hash routes.');
  }

  if (urls.length < articlePages.length) {
    failures.push(`Sitemap contains ${urls.length} URLs for ${articlePages.length} article pages.`);
  }
}

if (!fs.existsSync(homePath)) {
  failures.push('dist/index.html is missing.');
} else {
  const home = fs.readFileSync(homePath, 'utf8');

  if (!home.includes('application/ld+json')) {
    failures.push('Homepage JSON-LD is missing.');
  }

  if (!home.includes('seo-fallback')) {
    failures.push('Homepage crawler fallback content is missing.');
  }
}

articlePages.forEach((filePath) => {
  const source = fs.readFileSync(filePath, 'utf8');
  const relative = path.relative(outputDir, filePath);
  const jsonLdMatch = source.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);

  if (!/<link rel="canonical" href="https:\/\/cxuan-labs\.vercel\.app\/(?:en\/)?articles\//.test(source)) {
    failures.push(`${relative}: clean canonical is missing.`);
  }

  if (!/<meta name="robots" content="index,follow,max-image-preview:large/.test(source)) {
    failures.push(`${relative}: robots directive is missing.`);
  }

  if (!/<script type="application\/ld\+json">/.test(source) || !source.includes('BlogPosting')) {
    failures.push(`${relative}: BlogPosting JSON-LD is missing.`);
  } else {
    try {
      JSON.parse(jsonLdMatch[1]);
    } catch (error) {
      failures.push(`${relative}: JSON-LD is invalid JSON.`);
    }
  }

  if (!/hreflang="(?:zh-CN|en)"/.test(source)) {
    failures.push(`${relative}: hreflang alternate is missing.`);
  }

  if (!/<div class="seo-prose">[\s\S]{500,}<\/div>/.test(source)) {
    failures.push(`${relative}: rendered article content is unexpectedly short.`);
  }
});

if (failures.length) {
  console.error(`SEO audit failed with ${failures.length} issue(s):`);
  failures.slice(0, 30).forEach((failure) => console.error(`- ${failure}`));

  if (failures.length > 30) {
    console.error(`- …and ${failures.length - 30} more`);
  }

  process.exitCode = 1;
} else {
  console.log(`SEO audit passed: ${articlePages.length} static article pages, clean sitemap URLs, canonical tags, hreflang, and JSON-LD.`);
}
