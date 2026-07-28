'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const ignoredDirectories = new Set([
  '.git',
  '.playwright-cli',
  'dist',
  'node_modules',
  'output'
]);
const markdownFiles = [];
const assetFiles = [];
const failures = [];
const consistencyFailures = [];
let checkedReferences = 0;

walk(root);

markdownFiles.forEach((filePath) => {
  const source = fs.readFileSync(filePath, 'utf8');
  const markdownReference = /!?\[[^\]]*\]\(([^)\n]+)\)/g;
  const htmlReference = /(?:href|src)=["']([^"']+)["']/gi;

  scanMatches(filePath, source, markdownReference);
  scanMatches(filePath, source, htmlReference);
});

assetFiles.forEach((filePath) => {
  const source = fs.readFileSync(filePath, 'utf8');
  const htmlReference = /(?:href|src)=["']([^"']+)["']/gi;
  const cssReference = /url\(["']?([^)'"\s]+)["']?\)/gi;

  scanMatches(filePath, source, htmlReference);

  if (path.extname(filePath) === '.css') {
    scanMatches(filePath, source, cssReference);
  }
});

auditHomeShowcaseOrder();

if (failures.length || consistencyFailures.length) {
  console.error(
    `Content audit failed: ${failures.length} missing target(s), ` +
    `${consistencyFailures.length} consistency error(s).`
  );
  failures.forEach((failure) => {
    console.error(`- ${failure.file}: ${failure.reference} -> ${failure.resolved}`);
  });
  consistencyFailures.forEach((failure) => {
    console.error(`- ${failure}`);
  });
  process.exitCode = 1;
} else {
  console.log(
    `Local link audit passed: ${markdownFiles.length} Markdown files, ` +
    `${checkedReferences} local references, homepage showcase matches the 6 latest articles.`
  );
}

function auditHomeShowcaseOrder() {
  const articleRoot = path.join(root, 'ai-articles');
  const translationMapPath = path.join(root, 'en/ai-articles/translation-map.json');
  const latest = [];
  let translationMap = {};

  fs.readdirSync(articleRoot, { withFileTypes: true }).forEach((entry) => {
    const indexPath = path.join(articleRoot, entry.name, 'README.md');

    if (!entry.isDirectory() || !fs.existsSync(indexPath)) {
      return;
    }

    fs.readFileSync(indexPath, 'utf8').split(/\r?\n/).forEach((line) => {
      const match = line.match(/^- (\d{4}-\d{2}-\d{2}) - \[[^\]]+\]\(([^)]+)\)/);
      let articleName;

      if (!match) {
        return;
      }

      try {
        articleName = decodeURIComponent(match[2].replace(/^\.\//, ''));
      } catch (error) {
        articleName = match[2].replace(/^\.\//, '');
      }

      latest.push({
        date: match[1],
        sourcePath: path.posix.join('ai-articles', entry.name, articleName)
      });
    });
  });

  latest.sort((left, right) => {
    return right.date.localeCompare(left.date) || left.sourcePath.localeCompare(right.sourcePath);
  });

  if (fs.existsSync(translationMapPath)) {
    translationMap = JSON.parse(fs.readFileSync(translationMapPath, 'utf8'));
  }

  auditShowcaseFile('home.md', latest.slice(0, 6).map((article) => ({
    date: article.date,
    href: '#/' + article.sourcePath.replace(/\.md$/, '')
  })));

  auditShowcaseFile('home.en.md', latest.slice(0, 6).map((article) => {
    const translation = translationMap[article.sourcePath];

    return {
      date: article.date,
      href: translation && translation.english_path
        ? '#/' + translation.english_path.replace(/\.md$/, '')
        : ''
    };
  }));
}

function auditShowcaseFile(relativePath, expected) {
  const filePath = path.join(root, relativePath);
  const source = fs.readFileSync(filePath, 'utf8');
  const expression = /<article[^>]*data-showcase-slide[^>]*data-published="([^"]+)"[^>]*>.*?<a[^>]*href="([^"]+)"/g;
  const actual = [];
  let match;

  while ((match = expression.exec(source))) {
    actual.push({ date: match[1], href: match[2] });
  }

  if (actual.length !== expected.length) {
    consistencyFailures.push(
      `${relativePath}: expected ${expected.length} latest showcase entries, found ${actual.length}`
    );
    return;
  }

  expected.forEach((entry, index) => {
    if (actual[index].date !== entry.date || actual[index].href !== entry.href) {
      consistencyFailures.push(
        `${relativePath}: position ${index + 1} expected ${entry.date} ${entry.href}, ` +
        `found ${actual[index].date} ${actual[index].href}`
      );
    }
  });
}

function walk(directory) {
  fs.readdirSync(directory, { withFileTypes: true }).forEach((entry) => {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      if (!ignoredDirectories.has(entry.name)) {
        walk(fullPath);
      }
      return;
    }

    if (entry.name.endsWith('.md')) {
      markdownFiles.push(fullPath);
      return;
    }

    if (/\.(?:html|css)$/.test(entry.name)) {
      assetFiles.push(fullPath);
    }
  });
}

function scanMatches(filePath, source, expression) {
  let match;

  while ((match = expression.exec(source))) {
    checkReference(filePath, match[1]);
  }
}

function checkReference(filePath, rawReference) {
  let reference = cleanReference(rawReference);
  let targetPath;

  if (!reference || isExternalReference(reference)) {
    return;
  }

  reference = reference.split('#')[0].split('?')[0];

  if (!reference) {
    return;
  }

  try {
    reference = decodeURIComponent(reference);
  } catch (error) {
    // Keep the original path so malformed encodings are reported as missing.
  }

  if (reference.startsWith('#/')) {
    targetPath = path.join(root, reference.slice(2));
  } else if (reference.startsWith('/')) {
    targetPath = path.join(root, reference.replace(/^\/+/, ''));
  } else {
    targetPath = path.resolve(path.dirname(filePath), reference);
  }

  if (!targetPath.startsWith(root + path.sep) && targetPath !== root) {
    return;
  }

  checkedReferences += 1;

  if (targetExists(targetPath)) {
    return;
  }

  failures.push({
    file: path.relative(root, filePath),
    reference,
    resolved: path.relative(root, targetPath)
  });
}

function cleanReference(rawReference) {
  return (rawReference || '')
    .trim()
    .replace(/^<|>$/g, '')
    .replace(/\s+["'][^"']*["']$/, '');
}

function isExternalReference(reference) {
  return /^(?:https?:|mailto:|tel:|data:|javascript:|#(?!\/)|\/\/)/i.test(reference) ||
    reference.startsWith('var(');
}

function targetExists(targetPath) {
  if (fs.existsSync(targetPath)) {
    return true;
  }

  if (path.extname(targetPath)) {
    return false;
  }

  const relativeTarget = path.relative(root, targetPath);
  const generatedTarget = path.join(root, 'dist', relativeTarget);

  if (
    fs.existsSync(generatedTarget) ||
    fs.existsSync(path.join(generatedTarget, 'index.html'))
  ) {
    return true;
  }

  return fs.existsSync(targetPath + '.md') ||
    fs.existsSync(path.join(targetPath, 'README.md'));
}
