/* cxuan-ai-labs · Home v5 "Article Field"
   五段文章分类叙事：粒子默认沿当前结构持续流动；滚动时在 Agent 分支、
   模型核心、工具矩阵、产业信号与媒体光圈之间连续重组。 */
(function () {
  'use strict';

  var TAU = Math.PI * 2;
  var HOME_THEME_KEY = 'cxuan-home-neural-theme';
  var STORY_COLORS = [
    [61, 220, 151],
    [110, 168, 254],
    [126, 224, 196],
    [224, 181, 106],
    [199, 146, 234]
  ];
  var STORY_LIGHT_COLORS = [
    [8, 125, 82],
    [52, 95, 169],
    [29, 125, 105],
    [150, 104, 30],
    [131, 78, 161]
  ];
  var STORY_SHAPES = ['AGENT FLOW', 'MODEL CORE', 'TOOL GRID', 'INDUSTRY SIGNAL', 'MEDIA APERTURE'];

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function lerp(from, to, amount) {
    return from + (to - from) * amount;
  }

  function ease(value) {
    value = clamp(value, 0, 1);
    return value * value * (3 - 2 * value);
  }

  function rgba(color, alpha) {
    return 'rgba(' + Math.round(color[0]) + ',' + Math.round(color[1]) + ',' + Math.round(color[2]) + ',' + alpha.toFixed(3) + ')';
  }

  function seeded(index, salt) {
    var value = Math.sin((index + 1) * 12.9898 + (salt + 1) * 78.233) * 43758.5453;

    return value - Math.floor(value);
  }

  function isLightHome() {
    return document.documentElement.classList.contains('home-neural-light');
  }

  function getStoryColors() {
    return isLightHome() ? STORY_LIGHT_COLORS : STORY_COLORS;
  }

  function targetAgent(index, animatedPosition) {
    var selector = seeded(index, 1);
    var position = typeof animatedPosition === 'number' ? animatedPosition : seeded(index, 2);
    var jitter = (seeded(index, 3) - 0.5) * 0.055;
    var lane;
    var spread;

    if (selector < 0.22) {
      return { x: -0.88 + position * 0.68, y: jitter };
    }

    lane = Math.min(4, Math.floor(((selector - 0.22) / 0.78) * 5));
    spread = [-0.62, -0.31, 0, 0.31, 0.62][lane];

    return {
      x: -0.2 + position * 1.08,
      y: spread * ease(position) + Math.sin(position * Math.PI) * (lane % 2 ? -0.045 : 0.045) + jitter
    };
  }

  function targetModel(index, count, rotation, pulse) {
    var selector = seeded(index, 11);
    var angle;
    var radius;

    if (selector < 0.16) {
      angle = seeded(index, 12) * TAU;
      radius = (0.13 + seeded(index, 13) * 0.16) * (1 + (pulse || 0));
      angle += rotation || 0;
      return { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius };
    }

    angle = index * 2.399963 + seeded(index, 14) * 0.24 + (rotation || 0);
    radius = Math.sqrt((index + 0.5) / count) * 0.9 * (1 + (pulse || 0));

    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius * (0.86 + Math.sin(angle * 3) * 0.05)
    };
  }

  function targetTools(index, animatedPerimeter) {
    var tile = index % 6;
    var column = tile % 3;
    var row = Math.floor(tile / 3);
    var centerX = -0.62 + column * 0.62;
    var centerY = -0.37 + row * 0.74;
    var edge = Math.floor(seeded(index, 21) * 4);
    var position = seeded(index, 22);
    var jitter = (seeded(index, 23) - 0.5) * 0.035;
    var halfWidth = 0.24;
    var halfHeight = 0.23;

    if (typeof animatedPerimeter === 'number') {
      edge = Math.floor(animatedPerimeter * 4) % 4;
      position = animatedPerimeter * 4 - Math.floor(animatedPerimeter * 4);
    }

    if (edge === 0) {
      return { x: centerX - halfWidth + position * halfWidth * 2, y: centerY - halfHeight + jitter };
    }
    if (edge === 1) {
      return { x: centerX + halfWidth + jitter, y: centerY - halfHeight + position * halfHeight * 2 };
    }
    if (edge === 2) {
      return { x: centerX + halfWidth - position * halfWidth * 2, y: centerY + halfHeight + jitter };
    }

    return { x: centerX - halfWidth + jitter, y: centerY + halfHeight - position * halfHeight * 2 };
  }

  function targetIndustry(index, animatedPosition) {
    var position = typeof animatedPosition === 'number' ? animatedPosition : seeded(index, 31);
    var lane = index % 5;
    var x = -0.88 + position * 1.76;
    var baseline = 0.55 - position * 1.02;
    var wave = Math.sin(position * Math.PI * (3.2 + lane * 0.36) + lane) * 0.065;

    return {
      x: x,
      y: baseline + (lane - 2) * 0.12 + wave + (seeded(index, 32) - 0.5) * 0.045
    };
  }

  function trianglePoint(position) {
    var first = { x: -0.24, y: -0.34 };
    var second = { x: 0.43, y: 0 };
    var third = { x: -0.24, y: 0.34 };
    var scaled = position * 3;
    var local = scaled - Math.floor(scaled);
    var edge = Math.min(2, Math.floor(scaled));
    var from = edge === 0 ? first : (edge === 1 ? second : third);
    var to = edge === 0 ? second : (edge === 1 ? third : first);

    return { x: lerp(from.x, to.x, local), y: lerp(from.y, to.y, local) };
  }

  function targetMedia(index, animatedPosition, rotation) {
    var selector = seeded(index, 41);
    var position = typeof animatedPosition === 'number' ? animatedPosition : seeded(index, 42);
    var blade;
    var angle;
    var radius;
    var point;

    if (selector < 0.18) {
      point = trianglePoint(wrapUnit(position + (rotation || 0) * 0.08));
      return {
        x: point.x + (seeded(index, 43) - 0.5) * 0.035,
        y: point.y + (seeded(index, 44) - 0.5) * 0.035
      };
    }

    blade = index % 7;
    radius = 0.22 + position * 0.68;
    angle = blade * (TAU / 7) + position * 0.78 + 0.15 + (rotation || 0);

    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius * 0.92
    };
  }

  function makeTarget(stage, index, count) {
    if (stage === 0) {
      return targetAgent(index);
    }
    if (stage === 1) {
      return targetModel(index, count);
    }
    if (stage === 2) {
      return targetTools(index);
    }
    if (stage === 3) {
      return targetIndustry(index);
    }

    return targetMedia(index);
  }

  function wrapUnit(value) {
    return value - Math.floor(value);
  }

  /*
   * 静止在某一分类时，粒子也持续沿着当前结构流动。滚动负责形态重组，
   * 这里负责让每个形态本身保持“在线”，避免画布看起来像一张静态散点图。
   */
  function makeAnimatedTarget(stage, index, count, time) {
    var seconds = time * 0.001;
    var speed = 0.72 + seeded(index, 97) * 0.72;
    var direction = index % 2 ? 1 : -1;
    var position;
    var rotation;
    var pulse;

    if (!time) {
      return makeTarget(stage, index, count);
    }

    if (stage === 0) {
      position = wrapUnit(seeded(index, 2) + seconds * 0.036 * speed);
      return targetAgent(index, position);
    }

    if (stage === 1) {
      rotation = seconds * 0.085 * speed * direction;
      pulse = Math.sin(seconds * 0.72 + seeded(index, 98) * TAU) * 0.018;
      return targetModel(index, count, rotation, pulse);
    }

    if (stage === 2) {
      position = wrapUnit((Math.floor(seeded(index, 21) * 4) + seeded(index, 22)) / 4 + seconds * 0.026 * speed);
      return targetTools(index, position);
    }

    if (stage === 3) {
      position = wrapUnit(seeded(index, 31) + seconds * 0.034 * speed);
      return targetIndustry(index, position);
    }

    position = wrapUnit(seeded(index, 42) + seconds * 0.03 * speed);
    rotation = seconds * 0.045 * direction;
    return targetMedia(index, position, rotation);
  }

  function getFlowCoordinate(stage, target) {
    var angle;

    if (stage === 0 || stage === 3) {
      return clamp((target.x + 0.92) / 1.84, 0, 1);
    }

    if (stage === 1 || stage === 4) {
      angle = Math.atan2(target.y, target.x) / TAU;
      return wrapUnit(angle);
    }

    return wrapUnit((target.x + 0.95) * 0.31 + (target.y + 0.72) * 0.23);
  }

  function circularDistance(left, right) {
    var distance = Math.abs(left - right);

    return Math.min(distance, 1 - distance);
  }

  function ArticleStory(section) {
    this.section = section;
    this.canvas = section.querySelector('[data-article-story-canvas]');
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.stages = Array.prototype.slice.call(section.querySelectorAll('[data-article-story-stage]'));
    this.dots = Array.prototype.slice.call(section.querySelectorAll('[data-article-story-dot]'));
    this.shapeLabel = section.querySelector('[data-story-shape]');
    this.currentLabel = section.querySelector('[data-story-current]');
    this.targets = [];
    this.particles = [];
    this.width = 0;
    this.height = 0;
    this.dpr = 1;
    this.progress = 0;
    this.targetProgress = 0;
    this.activeStage = -1;
    this.running = false;
    this.visible = true;
    this.last = 0;
    this.nextSizeCheck = 0;
    this.resizeObserver = null;
    this.reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.handleScroll = this.handleScroll.bind(this);
    this.handleResize = this.handleResize.bind(this);
    this.tick = this.tick.bind(this);
    this.dotHandlers = [];
  }

  ArticleStory.prototype.buildParticles = function () {
    var count = this.width < 640 ? 280 : (this.width < 920 ? 440 : 680);
    var i;
    var stage;

    this.particles = [];
    this.targets = [];

    for (stage = 0; stage < STORY_COLORS.length; stage += 1) {
      this.targets[stage] = [];
    }

    for (i = 0; i < count; i += 1) {
      this.particles.push({
        size: 0.65 + seeded(i, 91) * 1.8,
        glow: 2.6 + seeded(i, 92) * 4.4,
        alpha: 0.32 + seeded(i, 93) * 0.58,
        drift: seeded(i, 94) * TAU,
        pulse: seeded(i, 99) * TAU,
        scatter: 0.04 + seeded(i, 95) * 0.11,
        warm: seeded(i, 96) > 0.965
      });

      for (stage = 0; stage < STORY_COLORS.length; stage += 1) {
        this.targets[stage].push(makeTarget(stage, i, count));
      }
    }
  };

  ArticleStory.prototype.resize = function () {
    var rect;
    var oldWidth = this.width;
    var oldHeight = this.height;
    var nextWidth;
    var nextHeight;
    var nextDpr;

    if (!this.canvas || !this.ctx) {
      return false;
    }

    rect = this.canvas.getBoundingClientRect();
    nextWidth = Math.round(rect.width);
    nextHeight = Math.round(rect.height);

    /* Docsify 会先切换路由 class、再替换 Markdown。这个短暂窗口里 Canvas
       可能只有 0/1px；若此时写入位图，浏览器会把单个绿色像素拉伸成整屏。 */
    if (nextWidth < 32 || nextHeight < 32) {
      return false;
    }

    nextDpr = Math.min(window.devicePixelRatio || 1, 2);
    if (
      nextWidth === Math.round(oldWidth) &&
      nextHeight === Math.round(oldHeight) &&
      nextDpr === this.dpr &&
      this.canvas.width > 1 &&
      this.canvas.height > 1
    ) {
      return true;
    }

    this.width = nextWidth;
    this.height = nextHeight;
    this.dpr = nextDpr;
    this.canvas.width = Math.round(this.width * this.dpr);
    this.canvas.height = Math.round(this.height * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    if (!this.particles.length || (oldWidth < 640) !== (this.width < 640) || (oldWidth < 920) !== (this.width < 920)) {
      this.buildParticles();
    }

    return true;
  };

  ArticleStory.prototype.handleResize = function () {
    if (!this.resize()) {
      return;
    }
    this.handleScroll();
    this.draw(performance.now());
  };

  ArticleStory.prototype.handleScroll = function () {
    var rect = this.section.getBoundingClientRect();
    var travel = Math.max(1, this.section.offsetHeight - window.innerHeight);

    this.targetProgress = clamp(-rect.top / travel, 0, 1);
    this.visible = rect.bottom > -100 && rect.top < window.innerHeight + 100;

    if (this.reducedMotion) {
      this.progress = this.targetProgress;
      this.updateStage();
      this.draw(0);
    }
  };

  ArticleStory.prototype.scrollToStage = function (index) {
    var top = this.section.getBoundingClientRect().top + window.scrollY;
    var travel = Math.max(0, this.section.offsetHeight - window.innerHeight);
    var progress = index / Math.max(1, this.stages.length - 1);

    window.scrollTo({ top: top + travel * progress, behavior: this.reducedMotion ? 'auto' : 'smooth' });
  };

  ArticleStory.prototype.bindDots = function () {
    var self = this;

    this.dots.forEach(function (dot, index) {
      var handler = function () {
        self.scrollToStage(index);
      };

      self.dotHandlers.push(handler);
      dot.addEventListener('click', handler);
    });
  };

  ArticleStory.prototype.updateStage = function () {
    var position = this.progress * Math.max(1, this.stages.length - 1);
    var nextStage = clamp(Math.round(position), 0, this.stages.length - 1);
    var color;

    if (nextStage === this.activeStage) {
      return;
    }

    this.activeStage = nextStage;
    color = getStoryColors()[nextStage];
    this.section.style.setProperty('--story-accent', color.join(', '));

    this.stages.forEach(function (stage, index) {
      var active = index === nextStage;
      stage.classList.toggle('is-active', active);
      stage.setAttribute('aria-hidden', active ? 'false' : 'true');
    });

    this.dots.forEach(function (dot, index) {
      var active = index === nextStage;
      dot.classList.toggle('is-active', active);
      dot.setAttribute('aria-current', active ? 'step' : 'false');
    });

    if (this.shapeLabel) {
      this.shapeLabel.textContent = STORY_SHAPES[nextStage];
    }
    if (this.currentLabel) {
      this.currentLabel.textContent = String(nextStage + 1).padStart(2, '0');
    }
  };

  ArticleStory.prototype.draw = function (time) {
    var ctx = this.ctx;
    var count = this.particles.length;
    var position = this.progress * (STORY_COLORS.length - 1);
    var fromStage = Math.min(STORY_COLORS.length - 1, Math.floor(position));
    var toStage = Math.min(STORY_COLORS.length - 1, fromStage + 1);
    var local = position - fromStage;
    var amount = ease(local);
    var burst = Math.sin(local * Math.PI);
    var palette = getStoryColors();
    var fromColor = palette[fromStage];
    var toColor = palette[toStage];
    var color = [lerp(fromColor[0], toColor[0], amount), lerp(fromColor[1], toColor[1], amount), lerp(fromColor[2], toColor[2], amount)];
    var centerX = this.width * 0.5;
    var centerY = this.height * 0.5;
    var scale = Math.min(this.width, this.height) * (this.width < 640 ? 0.49 : 0.58);
    var yScale = this.width < 640 ? 0.78 : 0.9;
    var i;
    var particle;
    var from;
    var to;
    var driftX;
    var driftY;
    var x;
    var y;
    var particleColor;
    var activeStage;
    var activeTarget;
    var flowCoordinate;
    var signalPosition;
    var signalDistance;
    var signal;
    var breath;
    var renderAlpha;
    var renderSize;

    if (!ctx || !count || this.width < 32 || this.height < 32) {
      return;
    }

    ctx.clearRect(0, 0, this.width, this.height);
    activeStage = clamp(Math.round(position), 0, STORY_COLORS.length - 1);
    signalPosition = wrapUnit(time * 0.00013);

    for (i = 0; i < count; i += 1) {
      particle = this.particles[i];
      from = makeAnimatedTarget(fromStage, i, count, time);
      to = makeAnimatedTarget(toStage, i, count, time);
      activeTarget = makeAnimatedTarget(activeStage, i, count, time);
      flowCoordinate = getFlowCoordinate(activeStage, activeTarget);
      signalDistance = Math.min(
        circularDistance(flowCoordinate, signalPosition),
        circularDistance(flowCoordinate, wrapUnit(signalPosition + 0.5))
      );
      signal = Math.pow(clamp(1 - signalDistance / 0.09, 0, 1), 2.4);
      breath = 0.9 + Math.sin(time * 0.00135 + particle.pulse) * 0.1;
      driftX = Math.sin(time * 0.00072 + particle.drift) * 0.008;
      driftY = Math.cos(time * 0.00061 + particle.drift * 1.7) * 0.008;
      x = centerX + (lerp(from.x, to.x, amount) + driftX + Math.sin(particle.drift * 2.3) * particle.scatter * burst) * scale;
      y = centerY + (lerp(from.y, to.y, amount) + driftY + Math.cos(particle.drift * 1.9) * particle.scatter * burst) * scale * yScale;
      particleColor = particle.warm ? (isLightHome() ? [166, 82, 50] : [239, 159, 126]) : color;
      renderAlpha = particle.alpha * breath;
      renderSize = particle.size * (1 + signal * 0.72);

      ctx.fillStyle = rgba(particleColor, renderAlpha * (0.1 + signal * 0.16));
      ctx.beginPath();
      ctx.arc(x, y, renderSize * particle.glow * (1 + signal * 0.42), 0, TAU);
      ctx.fill();

      ctx.fillStyle = rgba(particleColor, Math.min(0.98, renderAlpha * (0.78 + signal * 0.46)));
      ctx.beginPath();
      ctx.arc(x, y, renderSize, 0, TAU);
      ctx.fill();

      if (particle.size > 1.9 || signal > 0.56) {
        ctx.fillStyle = rgba(isLightHome() ? [22, 42, 34] : [235, 245, 249], Math.min(0.94, renderAlpha * (0.68 + signal * 0.3)));
        ctx.beginPath();
        ctx.arc(x, y, 0.52 + signal * 0.34, 0, TAU);
        ctx.fill();
      }
    }
  };

  ArticleStory.prototype.tick = function (now) {
    var delta;

    if (!this.running) {
      return;
    }

    delta = Math.min(40, now - this.last);
    this.last = now;

    /* ResizeObserver 负责正常布局变化；这个低频兜底覆盖后台标签页恢复、
       字体加载和 Docsify 快速往返时未派发 observer 的边界情况。 */
    if (now >= this.nextSizeCheck) {
      this.nextSizeCheck = now + 400;
      this.resize();
    }

    if (!this.reducedMotion && !document.hidden) {
      this.progress += (this.targetProgress - this.progress) * Math.min(1, delta * 0.012);
      if (Math.abs(this.targetProgress - this.progress) < 0.0001) {
        this.progress = this.targetProgress;
      }
      this.updateStage();
      if (this.visible) {
        this.draw(now);
      }
    }

    this.frame = window.requestAnimationFrame(this.tick);
  };

  ArticleStory.prototype.start = function () {
    if (this.running || !this.canvas || !this.ctx) {
      return;
    }

    this.running = true;
    this.bindDots();
    this.handleScroll();
    this.progress = this.targetProgress;
    this.updateStage();

    if ('ResizeObserver' in window) {
      this.resizeObserver = new ResizeObserver(this.handleResize);
      this.resizeObserver.observe(this.canvas);
    }

    if (this.resize()) {
      this.draw(performance.now());
    }
    this.last = performance.now();
    window.addEventListener('scroll', this.handleScroll, { passive: true });
    window.addEventListener('resize', this.handleResize);
    this.frame = window.requestAnimationFrame(this.tick);
  };

  ArticleStory.prototype.stop = function () {
    var self = this;

    this.running = false;
    window.cancelAnimationFrame(this.frame);
    window.removeEventListener('scroll', this.handleScroll);
    window.removeEventListener('resize', this.handleResize);
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    this.dots.forEach(function (dot, index) {
      dot.removeEventListener('click', self.dotHandlers[index]);
    });
    this.dotHandlers = [];
  };

  /* ================= 站点水合 ================= */

  var story = null;
  var showcase = null;
  var wordmarkMotion = null;
  var progressBar = null;
  var progressListening = false;

  function getHomeTheme() {
    var stored = '';

    if (window.CxuanSiteTheme && typeof window.CxuanSiteTheme.get === 'function') {
      return window.CxuanSiteTheme.get();
    }

    try {
      stored = window.localStorage.getItem(HOME_THEME_KEY) || '';
    } catch (error) {
      stored = '';
    }

    if (stored === 'light' || stored === 'dark') {
      return stored;
    }

    return document.documentElement.classList.contains('home-neural-light') ? 'light' : 'dark';
  }

  function updateHomeThemeControls(theme) {
    var isLight = theme === 'light';
    var controls = document.querySelectorAll('[data-sn-theme-toggle]');

    Array.prototype.forEach.call(controls, function (control) {
      var nextLabel = control.getAttribute(isLight ? 'data-label-dark' : 'data-label-light');
      var label = control.querySelector('[data-sn-theme-text]');
      var language = document.documentElement.lang === 'en' ? 'en' : 'zh';

      control.setAttribute('aria-pressed', isLight ? 'false' : 'true');
      control.setAttribute('aria-label', language === 'en'
        ? 'Switch to ' + nextLabel.toLowerCase() + ' theme'
        : '切换到' + nextLabel + '模式');

      if (label) {
        label.textContent = nextLabel;
      }
    });
  }

  function applyHomeTheme(theme, persist) {
    var normalized = theme === 'light' ? 'light' : 'dark';
    var html = document.documentElement;
    var meta = document.querySelector('meta[name="theme-color"]');

    if (window.CxuanSiteTheme && typeof window.CxuanSiteTheme.set === 'function') {
      normalized = window.CxuanSiteTheme.set(normalized, persist);
    } else {
      html.classList.toggle('home-neural-light', normalized === 'light');
      html.classList.toggle('home-neural-dark', normalized === 'dark');
      html.classList.toggle('cx-theme-light', normalized === 'light');
      html.classList.toggle('cx-theme-dark', normalized === 'dark');
      html.style.colorScheme = normalized;

      if (meta) {
        meta.setAttribute('content', normalized === 'light' ? '#f5f7f7' : '#0a0c10');
      }

      if (persist) {
        try {
          window.localStorage.setItem(HOME_THEME_KEY, normalized);
        } catch (error) {
          // Storage can be unavailable in private contexts; the current page still switches.
        }
      }
    }

    updateHomeThemeControls(normalized);

    if (story) {
      story.activeStage = -1;
      story.updateStage();
      story.draw(performance.now());
    }
  }

  function mountHomeControls() {
    var controls;

    if (!document.documentElement.classList.contains('home-page')) {
      return;
    }

    controls = document.querySelectorAll('[data-sn-theme-toggle]');
    Array.prototype.forEach.call(controls, function (control) {
      if (control.hasAttribute('data-sn-theme-bound')) {
        return;
      }

      control.setAttribute('data-sn-theme-bound', '1');
      control.addEventListener('click', function () {
        applyHomeTheme(isLightHome() ? 'dark' : 'light', true);
      });
    });

    applyHomeTheme(getHomeTheme(), false);
  }

  function WordmarkMotion(element) {
    this.element = element;
    this.hero = element.closest('.sn-hero');
    this.trace = element.querySelector('[data-sn-wordmark-trace]');
    this.traceLoadTimer = 0;
    this.reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.handlePointerMove = this.handlePointerMove.bind(this);
    this.handlePointerLeave = this.handlePointerLeave.bind(this);
    this.handleTraceLoad = this.handleTraceLoad.bind(this);
  }

  WordmarkMotion.prototype.handleTraceLoad = function () {
    if (this.trace) {
      this.trace.classList.add('is-loaded');
      this.element.classList.add('has-trace');
    }
  };

  WordmarkMotion.prototype.loadTrace = function () {
    var source;

    if (!this.trace || this.reducedMotion || this.trace.getAttribute('src')) {
      return;
    }

    source = this.trace.getAttribute('data-src');
    if (!source) {
      return;
    }

    this.trace.addEventListener('load', this.handleTraceLoad, { once: true });
    this.trace.setAttribute('src', source);
    if (this.trace.complete && this.trace.naturalWidth) {
      this.handleTraceLoad();
    }
  };

  WordmarkMotion.prototype.handlePointerMove = function (event) {
    var rect;
    var x;
    var y;

    if (this.reducedMotion || event.pointerType === 'touch' || !this.hero) {
      return;
    }

    rect = this.hero.getBoundingClientRect();
    x = clamp((event.clientX - rect.left) / Math.max(1, rect.width), 0, 1) - 0.5;
    y = clamp((event.clientY - rect.top) / Math.max(1, rect.height), 0, 1) - 0.5;
    this.element.style.setProperty('--wordmark-x', (x * 18).toFixed(2) + 'px');
    this.element.style.setProperty('--wordmark-y', (y * 12).toFixed(2) + 'px');
  };

  WordmarkMotion.prototype.handlePointerLeave = function () {
    this.element.style.setProperty('--wordmark-x', '0px');
    this.element.style.setProperty('--wordmark-y', '0px');
  };

  WordmarkMotion.prototype.start = function () {
    if (!this.hero || this.reducedMotion) {
      return;
    }

    this.traceLoadTimer = window.setTimeout(function () {
      this.loadTrace();
    }.bind(this), 320);

    this.hero.addEventListener('pointermove', this.handlePointerMove);
    this.hero.addEventListener('pointerleave', this.handlePointerLeave);
  };

  WordmarkMotion.prototype.stop = function () {
    window.clearTimeout(this.traceLoadTimer);
    if (this.trace) {
      this.trace.removeEventListener('load', this.handleTraceLoad);
    }

    if (!this.hero) {
      return;
    }

    this.hero.removeEventListener('pointermove', this.handlePointerMove);
    this.hero.removeEventListener('pointerleave', this.handlePointerLeave);
  };

  function mountWordmarkMotion() {
    var element = document.querySelector('[data-sn-wordmark]');

    if (wordmarkMotion && (!document.body.contains(wordmarkMotion.element) || wordmarkMotion.element !== element)) {
      wordmarkMotion.stop();
      wordmarkMotion = null;
    }

    if (element && !wordmarkMotion) {
      wordmarkMotion = new WordmarkMotion(element);
      wordmarkMotion.start();
    }
  }

  function ArticleShowcase(root) {
    var track = root.querySelector('.sn-showcase-track');

    this.root = root;
    this.slides = Array.prototype.slice.call(root.querySelectorAll('[data-showcase-slide]'));
    this.slides.sort(function (left, right) {
      return (right.getAttribute('data-published') || '').localeCompare(left.getAttribute('data-published') || '');
    });
    this.slides.forEach(function (slide, index) {
      var badge = slide.querySelector('[data-showcase-badge]');

      if (track) {
        track.appendChild(slide);
      }
      if (badge) {
        badge.textContent = (root.getAttribute('data-showcase-badge-label') || 'FEATURED') +
          ' · ' + String(index + 1).padStart(2, '0');
      }
    });
    this.dots = Array.prototype.slice.call(root.querySelectorAll('[data-showcase-to]'));
    this.currentLabel = root.querySelector('[data-showcase-current]');
    this.progress = root.querySelector('[data-showcase-progress]');
    this.previous = root.querySelector('[data-showcase-prev]');
    this.next = root.querySelector('[data-showcase-next]');
    this.effects = ['fx-slide', 'fx-clip', 'fx-zoom', 'fx-tilt'];
    this.index = 0;
    this.busy = false;
    this.lastEffect = '';
    this.pointerStart = null;
    this.pointerInside = false;
    this.pointerMoved = false;
    this.suppressClick = false;
    this.suppressClickUntil = 0;
    this.transitionTimer = 0;
    this.transitionSlide = null;
    this.transitionEndHandler = null;
    this.clickTimer = 0;
    this.preloadTimer = 0;
    this.autoTimer = 0;
    this.dotHandlers = [];
    this.reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.handlePrevious = this.handlePrevious.bind(this);
    this.handleNext = this.handleNext.bind(this);
    this.handleWheel = this.handleWheel.bind(this);
    this.handleKeydown = this.handleKeydown.bind(this);
    this.handlePointerDown = this.handlePointerDown.bind(this);
    this.handlePointerEnter = this.handlePointerEnter.bind(this);
    this.handlePointerMove = this.handlePointerMove.bind(this);
    this.handlePointerUp = this.handlePointerUp.bind(this);
    this.handlePointerLeave = this.handlePointerLeave.bind(this);
    this.handleClickCapture = this.handleClickCapture.bind(this);
    this.handleDragStart = this.handleDragStart.bind(this);
    this.handleFocusIn = this.handleFocusIn.bind(this);
    this.handleFocusOut = this.handleFocusOut.bind(this);
  }

  ArticleShowcase.prototype.loadSlideImage = function (index) {
    var slide = this.slides[index];
    var image;
    var source;

    if (!slide) {
      return;
    }

    image = slide.querySelector('.sn-showcase-media img');
    if (!image) {
      return;
    }

    source = image.getAttribute('src') || image.getAttribute('data-src');
    if (!source) {
      return;
    }

    slide.style.setProperty('--showcase-image', 'url("' + source.replace(/["\\\n\r]/g, '\\$&') + '")');
    if (image.getAttribute('src')) {
      image.classList.add('is-loaded');
      return;
    }

    image.addEventListener('load', function () {
      image.classList.add('is-loaded');
    }, { once: true });
    image.setAttribute('src', source);
    if (image.complete && image.naturalWidth) {
      image.classList.add('is-loaded');
    }
  };

  ArticleShowcase.prototype.updateUi = function () {
    var ratio = (this.index + 1) / Math.max(1, this.slides.length);

    if (this.currentLabel) {
      this.currentLabel.textContent = String(this.index + 1).padStart(2, '0');
    }
    if (this.progress) {
      this.progress.style.transform = 'scaleX(' + ratio.toFixed(4) + ')';
    }

    this.dots.forEach(function (dot, index) {
      var active = index === this.index;

      dot.classList.toggle('is-active', active);
      dot.setAttribute('aria-current', active ? 'true' : 'false');
    }, this);
  };

  ArticleShowcase.prototype.setInitial = function (index) {
    this.index = clamp(index, 0, Math.max(0, this.slides.length - 1));
    this.loadSlideImage(this.index);
    this.slides.forEach(function (slide, slideIndex) {
      var active = slideIndex === this.index;
      var link = slide.querySelector('a');

      slide.classList.toggle('is-active', active);
      slide.classList.remove('is-entering', 'is-leaving');
      slide.setAttribute('aria-hidden', active ? 'false' : 'true');
      if (link) {
        if (active) {
          link.removeAttribute('tabindex');
        } else {
          link.setAttribute('tabindex', '-1');
        }
      }
    }, this);
    this.updateUi();
  };

  ArticleShowcase.prototype.pickEffect = function () {
    var effect;

    do {
      effect = this.effects[Math.floor(Math.random() * this.effects.length)];
    } while (this.effects.length > 1 && effect === this.lastEffect);

    this.lastEffect = effect;
    return effect;
  };

  ArticleShowcase.prototype.go = function (targetIndex, direction) {
    var self = this;
    var count = this.slides.length;
    var nextIndex;
    var current;
    var next;
    var effect;
    var directionClass;

    window.clearTimeout(this.autoTimer);
    if (this.busy || count < 2) {
      return;
    }

    nextIndex = (targetIndex + count) % count;
    if (nextIndex === this.index) {
      return;
    }

    current = this.slides[this.index];
    next = this.slides[nextIndex];
    this.loadSlideImage(nextIndex);
    directionClass = direction < 0 ? 'is-backward' : 'is-forward';

    if (this.reducedMotion) {
      this.setInitial(nextIndex);
      return;
    }

    this.busy = true;
    effect = this.pickEffect();
    this.root.classList.add('is-changing', effect, directionClass);
    current.classList.remove('is-active');
    current.classList.add('is-leaving');
    current.setAttribute('aria-hidden', 'true');
    if (current.querySelector('a')) {
      current.querySelector('a').setAttribute('tabindex', '-1');
    }
    next.classList.add('is-entering');
    next.setAttribute('aria-hidden', 'false');
    if (next.querySelector('a')) {
      next.querySelector('a').removeAttribute('tabindex');
    }
    this.index = nextIndex;
    this.updateUi();

    if (this.transitionSlide && this.transitionEndHandler) {
      this.transitionSlide.removeEventListener('animationend', this.transitionEndHandler);
    }
    window.clearTimeout(this.transitionTimer);
    this.transitionSlide = next;
    this.transitionEndHandler = function () {
      if (!self.busy || self.index !== nextIndex) {
        return;
      }
      current.classList.remove('is-leaving');
      next.classList.remove('is-entering');
      next.classList.add('is-active');
      self.root.classList.remove('is-changing', effect, directionClass);
      self.busy = false;
      if (self.transitionSlide && self.transitionEndHandler) {
        self.transitionSlide.removeEventListener('animationend', self.transitionEndHandler);
      }
      self.transitionSlide = null;
      self.transitionEndHandler = null;
      self.scheduleAuto();
    };
    next.addEventListener('animationend', this.transitionEndHandler);
    this.transitionTimer = window.setTimeout(this.transitionEndHandler, 900);
  };

  ArticleShowcase.prototype.scheduleAuto = function () {
    var self = this;

    window.clearTimeout(this.autoTimer);
    if (this.reducedMotion || this.slides.length < 2 || this.pointerInside || this.root.contains(document.activeElement)) {
      return;
    }

    this.autoTimer = window.setTimeout(function () {
      self.go(self.index + 1, 1);
    }, 7200);
  };

  ArticleShowcase.prototype.handleFocusIn = function () {
    window.clearTimeout(this.autoTimer);
  };

  ArticleShowcase.prototype.handleFocusOut = function () {
    window.setTimeout(function () {
      this.scheduleAuto();
    }.bind(this), 0);
  };

  ArticleShowcase.prototype.handlePointerEnter = function () {
    this.pointerInside = true;
    window.clearTimeout(this.autoTimer);
  };

  ArticleShowcase.prototype.handlePrevious = function () {
    this.go(this.index - 1, -1);
  };

  ArticleShowcase.prototype.handleNext = function () {
    this.go(this.index + 1, 1);
  };

  ArticleShowcase.prototype.handleWheel = function (event) {
    var direction;

    if (Math.abs(event.deltaY) < 14 || Math.abs(event.deltaY) < Math.abs(event.deltaX)) {
      return;
    }

    direction = event.deltaY > 0 ? 1 : -1;
    if ((direction < 0 && this.index === 0) ||
        (direction > 0 && this.index === this.slides.length - 1)) {
      return;
    }

    event.preventDefault();
    if (direction > 0) {
      this.handleNext();
    } else {
      this.handlePrevious();
    }
  };

  ArticleShowcase.prototype.handleKeydown = function (event) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
      event.preventDefault();
      this.handleNext();
    } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
      event.preventDefault();
      this.handlePrevious();
    } else if (event.key === 'Home') {
      event.preventDefault();
      this.go(0, -1);
    } else if (event.key === 'End') {
      event.preventDefault();
      this.go(this.slides.length - 1, 1);
    }
  };

  ArticleShowcase.prototype.handlePointerDown = function (event) {
    if (event.button !== 0 || event.target.closest('button')) {
      return;
    }

    this.pointerStart = { x: event.clientX, y: event.clientY };
    this.pointerMoved = false;
  };

  ArticleShowcase.prototype.handlePointerMove = function (event) {
    var rect;
    var hoverX;
    var hoverY;
    var deltaX;
    var deltaY;

    if (event.pointerType !== 'touch') {
      rect = this.root.getBoundingClientRect();
      hoverX = clamp((event.clientX - rect.left) / Math.max(1, rect.width), 0, 1);
      hoverY = clamp((event.clientY - rect.top) / Math.max(1, rect.height), 0, 1);
      this.root.style.setProperty('--showcase-spot-x', (hoverX * 100).toFixed(1) + '%');
      this.root.style.setProperty('--showcase-spot-y', (hoverY * 100).toFixed(1) + '%');
      this.root.style.setProperty('--showcase-rx', ((0.5 - hoverY) * 3.2).toFixed(2) + 'deg');
      this.root.style.setProperty('--showcase-ry', ((hoverX - 0.5) * 3.6).toFixed(2) + 'deg');
    }

    if (!this.pointerStart) {
      return;
    }

    deltaX = event.clientX - this.pointerStart.x;
    deltaY = event.clientY - this.pointerStart.y;
    if (Math.abs(deltaY) > 12 && Math.abs(deltaY) > Math.abs(deltaX)) {
      if (!this.pointerMoved && this.root.setPointerCapture) {
        try {
          this.root.setPointerCapture(event.pointerId);
        } catch (error) {
          // Pointer capture is optional; swipe still works while the pointer stays over the card.
        }
      }
      this.pointerMoved = true;
      event.preventDefault();
    }
  };

  ArticleShowcase.prototype.handlePointerLeave = function () {
    this.pointerInside = false;
    if (this.pointerStart) {
      return;
    }

    this.root.style.setProperty('--showcase-spot-x', '50%');
    this.root.style.setProperty('--showcase-spot-y', '50%');
    this.root.style.setProperty('--showcase-rx', '0deg');
    this.root.style.setProperty('--showcase-ry', '0deg');
    this.scheduleAuto();
  };

  ArticleShowcase.prototype.handlePointerUp = function (event) {
    var deltaX;
    var deltaY;

    if (!this.pointerStart) {
      return;
    }

    deltaX = event.clientX - this.pointerStart.x;
    deltaY = event.clientY - this.pointerStart.y;
    this.pointerStart = null;

    if (Math.abs(deltaY) < 44 || Math.abs(deltaY) < Math.abs(deltaX) * 1.15) {
      return;
    }

    this.pointerMoved = true;
    this.suppressClick = true;
    this.suppressClickUntil = Date.now() + 900;
    event.preventDefault();
    if (deltaY < 0) {
      this.handleNext();
    } else {
      this.handlePrevious();
    }

    window.clearTimeout(this.clickTimer);
    this.clickTimer = window.setTimeout(function () {
      this.suppressClick = false;
      this.pointerMoved = false;
    }.bind(this), 920);
  };

  ArticleShowcase.prototype.handleClickCapture = function (event) {
    if (!this.pointerMoved && !this.suppressClick && Date.now() >= this.suppressClickUntil) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    if (event.stopImmediatePropagation) {
      event.stopImmediatePropagation();
    }
    this.pointerMoved = false;
    this.suppressClick = false;
    this.suppressClickUntil = 0;
  };

  ArticleShowcase.prototype.handleDragStart = function (event) {
    event.preventDefault();
  };

  ArticleShowcase.prototype.start = function () {
    var self = this;

    if (!this.slides.length) {
      return;
    }

    this.setInitial(0);
    this.preloadTimer = window.setTimeout(function () {
      self.loadSlideImage(1);
    }, 1400);
    this.root.addEventListener('wheel', this.handleWheel, { passive: false });
    this.root.addEventListener('keydown', this.handleKeydown);
    this.root.addEventListener('pointerdown', this.handlePointerDown);
    this.root.addEventListener('pointerenter', this.handlePointerEnter);
    this.root.addEventListener('pointermove', this.handlePointerMove);
    this.root.addEventListener('pointerup', this.handlePointerUp);
    this.root.addEventListener('pointerleave', this.handlePointerLeave);
    this.root.addEventListener('click', this.handleClickCapture, true);
    this.root.addEventListener('dragstart', this.handleDragStart);
    this.root.addEventListener('focusin', this.handleFocusIn);
    this.root.addEventListener('focusout', this.handleFocusOut);
    if (this.previous) {
      this.previous.addEventListener('click', this.handlePrevious);
    }
    if (this.next) {
      this.next.addEventListener('click', this.handleNext);
    }

    this.dots.forEach(function (dot, index) {
      var handler = function () {
        self.go(index, index < self.index ? -1 : 1);
      };

      self.dotHandlers[index] = handler;
      dot.addEventListener('click', handler);
    });
    this.scheduleAuto();
  };

  ArticleShowcase.prototype.stop = function () {
    var self = this;

    window.clearTimeout(this.transitionTimer);
    if (this.transitionSlide && this.transitionEndHandler) {
      this.transitionSlide.removeEventListener('animationend', this.transitionEndHandler);
    }
    this.transitionSlide = null;
    this.transitionEndHandler = null;
    window.clearTimeout(this.clickTimer);
    window.clearTimeout(this.preloadTimer);
    window.clearTimeout(this.autoTimer);
    this.root.removeEventListener('wheel', this.handleWheel);
    this.root.removeEventListener('keydown', this.handleKeydown);
    this.root.removeEventListener('pointerdown', this.handlePointerDown);
    this.root.removeEventListener('pointerenter', this.handlePointerEnter);
    this.root.removeEventListener('pointermove', this.handlePointerMove);
    this.root.removeEventListener('pointerup', this.handlePointerUp);
    this.root.removeEventListener('pointerleave', this.handlePointerLeave);
    this.root.removeEventListener('click', this.handleClickCapture, true);
    this.root.removeEventListener('dragstart', this.handleDragStart);
    this.root.removeEventListener('focusin', this.handleFocusIn);
    this.root.removeEventListener('focusout', this.handleFocusOut);
    if (this.previous) {
      this.previous.removeEventListener('click', this.handlePrevious);
    }
    if (this.next) {
      this.next.removeEventListener('click', this.handleNext);
    }
    this.dots.forEach(function (dot, index) {
      dot.removeEventListener('click', self.dotHandlers[index]);
    });
  };

  function mountShowcase() {
    var root = document.querySelector('[data-sn-showcase]');

    if (showcase && (!document.body.contains(showcase.root) || showcase.root !== root)) {
      showcase.stop();
      showcase = null;
    }

    if (root && !showcase) {
      showcase = new ArticleShowcase(root);
      showcase.start();
    }
  }

  function mountStory() {
    var section = document.querySelector('[data-article-story]');

    if (story && (!document.body.contains(story.section) || story.section !== section)) {
      story.stop();
      story = null;
    }

    if (section && !story) {
      story = new ArticleStory(section);
      story.start();
    }
  }

  function updateProgress() {
    var doc = document.documentElement;
    var max = doc.scrollHeight - window.innerHeight;
    var ratio = max > 0 ? window.scrollY / max : 0;

    if (progressBar) {
      progressBar.style.width = (ratio * 100).toFixed(2) + '%';
    }
  }

  function mountProgress() {
    var isArticle = document.documentElement.classList.contains('article-detail-page');

    if (isArticle && !progressBar) {
      progressBar = document.createElement('div');
      progressBar.className = 'sn-progress';
      document.body.appendChild(progressBar);
    }

    if (!isArticle && progressBar) {
      progressBar.parentNode.removeChild(progressBar);
      progressBar = null;
    }

    if (isArticle && !progressListening) {
      progressListening = true;
      window.addEventListener('scroll', updateProgress, { passive: true });
    }

    updateProgress();
  }

  var revealObserver = null;

  if ('IntersectionObserver' in window) {
    revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' });
  }

  function watchReveals() {
    var nodes = document.querySelectorAll('[data-sn-reveal]:not([data-sn-watched])');
    var i;

    for (i = 0; i < nodes.length; i += 1) {
      nodes[i].setAttribute('data-sn-watched', '1');

      if (revealObserver) {
        revealObserver.observe(nodes[i]);
      } else {
        nodes[i].classList.add('is-in');
      }
    }
  }

  function hydrate() {
    document.documentElement.classList.add('sn-js');
    mountHomeControls();
    mountWordmarkMotion();
    mountShowcase();
    mountStory();
    mountProgress();
    watchReveals();
  }

  function boot() {
    var existing;

    hydrate();

    window.$docsify = window.$docsify || {};
    existing = Array.isArray(window.$docsify.plugins) ? window.$docsify.plugins : [];
    window.$docsify.plugins = existing.concat(function articleStoryPlugin(hook) {
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
