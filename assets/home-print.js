/* cxuan-ai-labs · Home "Print 印刷编辑室"
   明/暗主题切换（localStorage: cxuan-print-theme，兼容旧键 cxuan-home-neural-theme）、
   快报无缝滚动、滚动进场动效、报头日期渲染。挂在 docsify 生命周期上。 */
(function () {
  'use strict';

  var THEME_KEY = 'cxuan-print-theme';
  var LEGACY_THEME_KEY = 'cxuan-home-neural-theme';

  /* ================= 主题 ================= */

  function readStoredTheme() {
    try {
      return (
        window.localStorage.getItem(THEME_KEY) ||
        window.localStorage.getItem(LEGACY_THEME_KEY) ||
        'light'
      );
    } catch (error) {
      return 'light';
    }
  }

  function storeTheme(theme) {
    try {
      window.localStorage.setItem(THEME_KEY, theme);
    } catch (error) {}
  }

  function applyTheme(theme) {
    var html = document.documentElement;
    var meta = document.querySelector('meta[name="theme-color"]');

    html.classList.toggle('print-light', theme !== 'dark');
    html.classList.toggle('print-dark', theme === 'dark');

    if (meta) {
      meta.setAttribute('content', theme === 'dark' ? '#17130b' : '#f2eee3');
    }

    Array.prototype.forEach.call(
      document.querySelectorAll('[data-ph-theme]'),
      function (btn) {
        var label =
          theme === 'dark'
            ? btn.getAttribute('data-label-dark')
            : btn.getAttribute('data-label-light');
        if (label) {
          btn.textContent = label;
        }
        btn.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
      }
    );
  }

  function toggleTheme() {
    var next = document.documentElement.classList.contains('print-dark')
      ? 'light'
      : 'dark';
    storeTheme(next);
    applyTheme(next);
  }

  function wireThemeToggles() {
    Array.prototype.forEach.call(
      document.querySelectorAll('[data-ph-theme]'),
      function (btn) {
        if (btn.dataset.phThemeWired) {
          return;
        }
        btn.dataset.phThemeWired = '1';
        btn.addEventListener('click', toggleTheme);
      }
    );
  }

  /* ================= 日期 ================= */

  function renderDate() {
    var el = document.querySelector('[data-ph-date]');
    var now;
    var weekdaysZh = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

    if (!el) {
      return;
    }

    now = new Date();

    if (document.documentElement.lang === 'en') {
      el.textContent = now.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } else {
      el.textContent =
        now.getFullYear() +
        ' 年 ' +
        (now.getMonth() + 1) +
        ' 月 ' +
        now.getDate() +
        ' 日 · ' +
        weekdaysZh[now.getDay()] +
        ' · 持续发行';
    }
  }

  /* ================= 快报滚动 ================= */

  function liveTickers() {
    Array.prototype.forEach.call(
      document.querySelectorAll('[data-ph-ticker]'),
      function (track) {
        var viewport = track.parentElement;
        var baseWidth;
        var clones = 0;

        if (track.dataset.phTickerLive) {
          return;
        }

        baseWidth = track.scrollWidth;
        if (!baseWidth) {
          return;
        }

        // 复制内容直到轨道宽度 ≥ 2 倍基础宽度，保证 -50% 位移无缝循环。
        while (track.scrollWidth < baseWidth * 2 && clones < 4) {
          track.innerHTML += track.innerHTML;
          clones += 1;
        }

        if (viewport && track.scrollWidth > viewport.clientWidth) {
          track.dataset.phTickerLive = '1';
          track.classList.add('is-live');
        }
      }
    );
  }

  /* ================= 滚动进场 ================= */

  var observer = null;

  function watchReveals() {
    var nodes = document.querySelectorAll('[data-ph-reveal]');

    document.documentElement.classList.add('ph-js');

    if (!('IntersectionObserver' in window)) {
      Array.prototype.forEach.call(nodes, function (node) {
        node.classList.add('is-in');
      });
      return;
    }

    if (!observer) {
      observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-in');
              observer.unobserve(entry.target);
            }
          });
        },
        { rootMargin: '0px 0px -8% 0px', threshold: 0.05 }
      );
    }

    Array.prototype.forEach.call(nodes, function (node) {
      if (!node.classList.contains('is-in')) {
        observer.observe(node);
      }
    });
  }

  /* ================= 水合 ================= */

  function hydrate() {
    if (!document.querySelector('[data-ph]')) {
      return;
    }

    applyTheme(readStoredTheme());
    wireThemeToggles();
    renderDate();
    liveTickers();
    watchReveals();
  }

  function boot() {
    var existing;

    hydrate();

    // 与 docsify 生命周期对接：每次路由渲染完成后重新水合。
    window.$docsify = window.$docsify || {};
    existing = Array.isArray(window.$docsify.plugins) ? window.$docsify.plugins : [];
    window.$docsify.plugins = existing.concat(function printPlugin(hook) {
      hook.doneEach(function () {
        hydrate();
      });
    });

    window.addEventListener('hashchange', function () {
      window.setTimeout(hydrate, 60);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
}());
