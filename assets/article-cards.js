(function () {
  var articleIndexCache = {};
  var articleSummaryCache = {};
  var coverCache = new Map();
  var renderTimer = 0;
  var sidebarTimer = 0;
  var algoliaAttributionTimer = 0;
  var activeSidebarLocale = 'zh';
  var latestDesignRouteEvent = {
    hash: '',
    time: 0
  };
  var pendingDesignRoute = '';
  var pendingDesignRouteStartedAt = 0;
  var lastDocsifyDoneRoute = '';
  var lastDocsifyDoneAt = 0;
  var HOME_LANGUAGE_KEY = 'cxuan-home-language';
  var HOME_LANGUAGE_DETECTED_KEY = 'cxuan-home-language-detected';
  var HOME_LANGUAGE_DETECTED_TTL = 6 * 60 * 60 * 1000;
  var HOME_NEURAL_THEME_KEY = 'cxuan-home-neural-theme';
  var DESIGN_DATA_VERSION = '20260701-home-neural-pointer-1';
  var CATEGORY_PAGE_SIZE = 10;
  var homeNeuralAnimation = {
    canvas: null,
    clusters: [],
    cover: null,
    ctx: null,
    dpr: 1,
    frame: 0,
    height: 0,
    last: 0,
    lastFrameAt: 0,
    fibers: [],
    links: [],
    nodes: [],
    pointer: {
      active: false,
      lastMovedAt: 0,
      strength: 0,
      targetX: 0,
      targetY: 0,
      x: 0,
      y: 0
    },
    pointerCleanup: null,
    reduced: false,
    running: false,
    streams: [],
    theme: 'dark',
    width: 0
  };
  var sidebarLinks = [
    {
      enHref: '#/home.en',
      enText: 'Home',
      zhHref: '#/',
      zhText: '首页'
    },
    {
      enHref: '#/README.zh-CN',
      enText: 'Chinese README',
      zhHref: '#/home.en',
      zhText: 'English'
    },
    {
      enHref: '#/en/ai-articles/README',
      enText: 'AI Articles',
      zhHref: '#/ai-articles/README',
      zhText: 'AI 文章'
    },
    {
      enHref: '#/en/ai-articles/01-agent-and-coding/README',
      enText: 'AI Agent & Coding Tools',
      zhHref: '#/ai-articles/01-agent-and-coding/README',
      zhText: 'AI Agent 与编程工具'
    },
    {
      enHref: '#/en/ai-articles/02-models-and-research/README',
      enText: 'Models, Research & Prompt',
      zhHref: '#/ai-articles/02-models-and-research/README',
      zhText: '模型、研究与 Prompt'
    },
    {
      enHref: '#/en/ai-articles/03-tools-and-resources/README',
      enText: 'Tools, Resources & Workbench',
      zhHref: '#/ai-articles/03-tools-and-resources/README',
      zhText: '工具、资源与工作台'
    },
    {
      enHref: '#/en/ai-articles/04-industry-and-business/README',
      enText: 'Industry, Companies & Business',
      zhHref: '#/ai-articles/04-industry-and-business/README',
      zhText: '产业、公司与商业动态'
    },
    {
      enHref: '#/en/ai-articles/05-ai-creation-and-media/README',
      enText: 'AI Creation & Media',
      zhHref: '#/ai-articles/05-ai-creation-and-media/README',
      zhText: 'AI 生成与多媒体'
    },
    {
      enHref: '#/en/ai-articles/06-notes-and-observations/README',
      enText: 'Notes, Essays & Incidents',
      zhHref: '#/ai-articles/06-notes-and-observations/README',
      zhText: '观察、杂谈与事故记录'
    },
    {
      enHref: '#/en/ai-resources/README',
      enText: 'AI Resources',
      zhHref: '#/ai-resources/README',
      zhText: 'AI 资源'
    },
    {
      enHref: '#/en/works/README',
      enText: 'Works & Open Source',
      zhHref: '#/works/README',
      zhText: '我的作品 & 开源项目'
    },
    {
      enHref: '#/en/development-guidelines/README',
      enText: 'Development Guidelines',
      zhHref: '#/development-guidelines/README',
      zhText: '开发规约'
    },
    {
      enHref: '#/archive-bestjavaer/README',
      enText: 'archive-bestjavaer',
      zhHref: '#/archive-bestjavaer/README',
      zhText: '旧 bestJavaer'
    }
  ];
  var navbarLinks = [
    {
      enHref: '#/home.en',
      enText: 'Home',
      matchHrefs: ['#/', '#/home.en'],
      matchTexts: ['Home', '首页'],
      zhHref: '#/',
      zhText: '首页'
    },
    {
      enHref: '#/README.zh-CN',
      enText: '中文',
      matchHrefs: ['#/README.zh-CN', '#/home.en'],
      matchTexts: ['中文', 'English'],
      zhHref: '#/home.en',
      zhText: 'English'
    },
    {
      enHref: '#/en/ai-articles/README',
      enText: 'AI Articles',
      matchHrefs: ['#/en/ai-articles/README', '#/ai-articles/README'],
      matchTexts: ['AI Articles', 'AI 文章'],
      zhHref: '#/ai-articles/README',
      zhText: 'AI 文章'
    },
    {
      enHref: '#/en/ai-resources/README',
      enText: 'AI Resources',
      matchHrefs: ['#/en/ai-resources/README', '#/ai-resources/README'],
      matchTexts: ['AI Resources', 'AI 资源'],
      zhHref: '#/ai-resources/README',
      zhText: 'AI 资源'
    },
    {
      enHref: '#/en/development-guidelines/README',
      enText: 'Development Guidelines',
      matchHrefs: ['#/en/development-guidelines/README', '#/development-guidelines/README'],
      matchTexts: ['Development Guidelines', '开发规约'],
      zhHref: '#/development-guidelines/README',
      zhText: '开发规约'
    },
    {
      enHref: '#/archive-bestjavaer/README',
      enText: 'Legacy Archive',
      matchHrefs: ['#/archive-bestjavaer/README'],
      matchTexts: ['Legacy Archive', '旧内容归档'],
      zhHref: '#/archive-bestjavaer/README',
      zhText: '旧内容归档'
    },
    {
      enHref: '#/en/works/README',
      enText: 'Works & Open Source',
      matchHrefs: ['#/en/works/README', '#/works/README'],
      matchTexts: ['Works & Open Source', '作品与开源'],
      zhHref: '#/works/README',
      zhText: '作品与开源'
    }
  ];
  var sidebarGroupLabels = [
    {
      enText: 'Main Track',
      zhText: '新主线'
    },
    {
      enText: 'Legacy Archive',
      zhText: '旧内容归档'
    }
  ];
  var designPostPreviews = {
    'qwen-max': {
      cat: '实验',
      catClass: 'is-lab',
      title: '实测千问大模型',
      date: '2026-06-20',
      read: '14 分钟',
      href: '#/ai-articles/02-models-and-research/实测 Qwen3.7-Max大模型',
      excerpt: '拿自己的真实内容生产工具链，测试 Qwen 3.7 能不能完成一次跨项目、跨前后端、真正能验收的 Agent 工作流。',
      body: [
        '这次测评针对的是一个实际上线的 GitHub 开源项目发现与推荐产品，不是空跑 prompt。',
        '我让 Qwen3.7-Max 分析工程结构、找问题、写 Spec，再推进到开发、测试和验证。',
        '重点不是模型会不会聊天，而是它能不能理解项目、发现问题、规划修复，并把结果跑通。'
      ]
    },
    'deepseek-vision': {
      cat: 'AI 观察',
      catClass: 'is-ai',
      title: 'DeepSeek 杀入多模态，识图功能正式上线！',
      date: '2026-06-19',
      read: '10 分钟',
      href: '#/ai-articles/02-models-and-research/DeepSeek 开天眼了，识图功能上线！',
      excerpt: 'DeepSeek 的识图模式不是 OCR，而是终于开始真正理解图片内容。',
      body: [
        '这次更新后，Web 端和 App 端都可以使用识图能力。',
        '它能拆解人物、空间关系、画面质感，甚至判断一张图可能是 AI 生成图。',
        '限制也很明确：它更像看图推理器，不是实时看图搜索引擎。'
      ]
    },
    'worldcup-ai': {
      cat: 'AI 观察',
      catClass: 'is-ai',
      title: 'AI 真能预测世界杯了？而且最准的竟然是文心一言？',
      date: '2026-06-16',
      read: '8 分钟',
      href: '#/ai-articles/02-models-and-research/AI真的能预测世界杯？文心这次把比分都猜中了',
      excerpt: '12 大 AI 被拉到世界杯预测赛场，文心一言阶段命中率暂列第一。',
      body: [
        'AI 预测世界杯听起来魔幻，但这次是真放进了连续、有真实结果检验的场景。',
        '文心一言在前 15 场里命中 7 场，还预测中了科特迪瓦 1:0 厄瓜多尔。',
        '这类场景的价值在于别吹参数，直接拿真实结果说话。'
      ]
    },
    'oiioii': {
      cat: '实验',
      catClass: 'is-lab',
      title: 'OiiOii升级2.0，我终于认真做了一次 AI 视频',
      date: '2026-06-15',
      read: '12 分钟',
      href: '#/ai-articles/05-ai-creation-and-media/OiiOii 2.0 升级-补全版',
      excerpt: '从智能画布到拉片复刻，认真跑一次 AI 视频创作工作流。',
      body: [
        'OiiOii 2.0 把视频创作拆成更接近真实创作团队的流程。',
        '它有艺术总监、编剧、角色设计师、场景设计师、分镜师和音效总监这些 Agent。',
        '我用智能画布从 0 做视频，又用拉片复刻把世界杯名场面做成 AI 圈二创。'
      ]
    },
    'fable-ban': {
      cat: 'AI 观察',
      catClass: 'is-ai',
      title: '太突然了，Fable 5 被禁了。',
      date: '2026-06-13',
      read: '9 分钟',
      href: '#/ai-articles/02-models-and-research/太突然了，Fable 5 被禁了。',
      excerpt: 'Fable 5 发布三天后突然被限制访问，模型能力之外，管控风险也成了变量。',
      body: [
        '前几天大家还在讨论 Fable 5 是不是 Anthropic 最强模型，结果很快就等来了限制。',
        '这件事把模型发布从价格、上下文、跑分，拉到了安全、出口管制和访问权限。',
        '普通用户感知到的是模型切换，背后其实是能力、护栏和监管之间的拉扯。'
      ]
    },
    'fable-prompt': {
      cat: 'AI 观察',
      catClass: 'is-ai',
      title: 'Fable 5 的系统提示词被人扒出来了，精彩，太精彩了。',
      date: '2026-06-12',
      read: '15 分钟',
      href: '#/ai-articles/02-models-and-research/Fable 5 的系统提示词被人扒出来了，精彩，太精彩了。',
      excerpt: '第三方扒出的 Fable 5 系统提示词，比发布会更能看出它真正防什么。',
      body: [
        '系统提示词讲清楚的是模型真正的行为边界，而不是发布会希望你看到什么。',
        '这篇文章按原文顺序拆解，从模型身份、红线清单到具体拒绝策略逐段看。',
        '重点不是八卦提示词，而是理解顶级模型如何被产品化、约束和降级。'
      ]
    },
    'weread-skills': {
      cat: '资源',
      catClass: 'is-resource',
      title: '微信读书官方发了 skills，把我给秀麻了。',
      date: '2026-05-19',
      read: '9 分钟',
      href: '#/ai-articles/03-tools-and-resources/给大家详细介绍下 weread skills',
      excerpt: '微信读书官方发布 weread skills，阅读查询和统计能力可以直接被 AI 调用。',
      body: [
        '这些 skill 支持搜书、看书架、查阅读统计、导出划线和查看公开书评。',
        '它目前主要是读取和查询类能力，没有添加书架、删除书、写笔记这类写操作。',
        '配置好 API key 后，就可以让 AI 帮你统计阅读情况或检索书籍内容。'
      ]
    },
    'openai-price-reset': {
      cat: '产业动态',
      catClass: 'is-industry',
      title: 'OpenAI 邀请一个人直接重置额度',
      date: '2026-06-12',
      read: '10 分钟',
      href: '#/ai-articles/04-industry-and-business/OpenAI 邀请一个人直接重置额度，以一己之力把价格打下来了。',
      excerpt: '一次额度重置背后，是模型价格、用户成本和平台策略的连锁变化。',
      body: [
        '这篇不是单纯记录一个产品操作，而是观察 OpenAI 怎么通过额度和价格影响真实用户选择。',
        '当一个人能直接把使用成本打下来，说明模型竞争已经进入更细的资源分配阶段。',
        '对普通用户来说，关键不是谁喊得响，而是谁能稳定、便宜、可持续地用起来。'
      ]
    },
    'luckin-cli': {
      cat: '产业动态',
      catClass: 'is-industry',
      title: '瑞幸出 CLI 了，这会是迈向 AGI 的第一步吗？',
      date: '2026-06-10',
      read: '8 分钟',
      href: '#/ai-articles/04-industry-and-business/瑞幸出 CLI 了，这会是迈向 AGI 的第一步吗？',
      excerpt: '一个咖啡品牌做 CLI，看起来离谱，其实是服务入口、自动化和品牌传播的新实验。',
      body: [
        '瑞幸出 CLI 这件事表面像玩梗，背后是把消费服务拆成可以被程序调用的入口。',
        '当点咖啡这类日常流程也开始命令行化，说明品牌在试探更轻、更自动化的交互方式。',
        '它未必真是 AGI 的第一步，但确实说明 AI 和自动化正在把普通服务重新包装一遍。'
      ]
    },
    'ai-era': {
      cat: '随笔',
      catClass: 'is-note',
      title: 'AI 时代，如何超过大多数人',
      date: '2026-06-08',
      read: '8 分钟',
      href: '#/ai-articles/06-notes-and-observations/AI 时代，如何超过大多数人',
      excerpt: 'AI 时代真正拉开差距的不是工具数量，而是问题定义、上下文质量、验证能力和判断标准。',
      body: [
        '很多人会把 AI 用成新的奶头乐：快、爽、反馈强，但实际一点没过脑子。',
        '要超过别人，核心是问题定义、上下文质量、验证能力、工作流沉淀和判断标准。',
        '工具越强，越需要保留自己的判断，而不是把生成结果直接当知识。'
      ]
    },
    'agents-md': {
      cat: '教程',
      catClass: 'is-tutorial',
      title: 'Agents.md 是什么',
      date: '2026-06-09',
      read: '8 分钟',
      href: '#/ai-articles/01-agent-and-coding/Agents.md 是什么',
      excerpt: '把项目规矩写给 Codex，让它进入仓库时先知道命令、测试、边界和协作方式。',
      body: [
        'AGENTS.md 是给 Agent 看的 README，用来记录这个项目怎么启动、怎么测试、哪些文件不能动。',
        '它解决的是让 Codex 更懂这个项目，而不是每次都靠你手动重复说明。',
        '全局规则适合放个人偏好，项目规则适合放仓库约定。'
      ]
    }
  };
  var designCategoryPreviews = {
    tutorial: {
      num: '01',
      name: '教程',
      en: 'TUTORIAL',
      count: 35,
      catClass: 'is-tutorial',
      href: '#/ai-articles/01-agent-and-coding/README',
      items: [
        { title: 'Agents.md 是什么', date: '2026-06-09', href: '#/ai-articles/01-agent-and-coding/Agents.md 是什么' },
        { title: '我最近最常用的 10 个 Codex 技巧', date: '2026-06-09', href: '#/ai-articles/01-agent-and-coding/我最近最常用的 10 个 Codex 技巧' },
        { title: 'Codex 一直 Reconnecting？我最后发现，常见就两个坑', date: '2026-06-05', href: '#/ai-articles/01-agent-and-coding/Codex 一直 Reconnecting？我最后发现，常见就两个坑' },
        { title: '为每个任务配一套 harness：Claude Code 里的动态工作流', date: '2026-06-05', href: '#/ai-articles/01-agent-and-coding/为每个任务配一套 harness：Claude Code 里的动态工作流' },
        { title: '太顶了，ChatGPT 要和 Codex 搞一起了。', date: '2026-06-03', href: '#/ai-articles/01-agent-and-coding/太顶了，ChatGPT 要和 Codex 搞一起了。' }
      ]
    },
    ai: {
      num: '02',
      name: 'AI 观察',
      en: 'AI',
      count: 23,
      catClass: 'is-ai',
      href: '#/ai-articles/02-models-and-research/README',
      items: [
        { title: '实测千问大模型', date: '2026-06-20', href: '#/ai-articles/02-models-and-research/实测 Qwen3.7-Max大模型' },
        { title: 'DeepSeek 杀入多模态，识图功能正式上线！', date: '2026-06-19', href: '#/ai-articles/02-models-and-research/DeepSeek 开天眼了，识图功能上线！' },
        { title: 'AI 真能预测世界杯了？而且最准的竟然是文心一言？', date: '2026-06-16', href: '#/ai-articles/02-models-and-research/AI真的能预测世界杯？文心这次把比分都猜中了' },
        { title: '太突然了，Fable 5 被禁了。', date: '2026-06-13', href: '#/ai-articles/02-models-and-research/太突然了，Fable 5 被禁了。' },
        { title: 'Fable 5 的系统提示词被人扒出来了，精彩，太精彩了。', date: '2026-06-12', href: '#/ai-articles/02-models-and-research/Fable 5 的系统提示词被人扒出来了，精彩，太精彩了。' }
      ]
    },
    resource: {
      num: '03',
      name: '优质资源',
      en: 'RESOURCE',
      count: 10,
      catClass: 'is-resource',
      href: '#/ai-articles/03-tools-and-resources/README',
      items: [
        { title: '给大家详细介绍下 weread skills', date: '2026-05-19', href: '#/ai-articles/03-tools-and-resources/给大家详细介绍下 weread skills' },
        { title: 'Slock.ai 是个啥', date: '2026-05-15', href: '#/ai-articles/03-tools-and-resources/Slock.ai 是个啥' },
        { title: 'AI 前沿网站推荐：国外为主，国内精选（CDN版）', date: '2026-04-27', href: '#/ai-articles/03-tools-and-resources/AI 前沿网站推荐：国外为主，国内精选（CDN版）' },
        { title: 'Layweout 公众号排版工作台', date: '2026-04-23', href: '#/ai-articles/03-tools-and-resources/Layweout 公众号排版工作台' }
      ]
    },
    industry: {
      num: '04',
      name: '产业动态',
      en: 'BUSINESS',
      count: 22,
      catClass: 'is-industry',
      href: '#/ai-articles/04-industry-and-business/README',
      items: [
        { title: 'OpenAI 邀请一个人直接重置额度，以一己之力把价格打下来了。', date: '2026-06-12', href: '#/ai-articles/04-industry-and-business/OpenAI 邀请一个人直接重置额度，以一己之力把价格打下来了。' },
        { title: '瑞幸出 CLI 了，这会是迈向 AGI 的第一步吗？', date: '2026-06-10', href: '#/ai-articles/04-industry-and-business/瑞幸出 CLI 了，这会是迈向 AGI 的第一步吗？' },
        { title: '姚顺雨这次访谈，腾讯终于把 AI 下半场讲明白了', date: '2026-06-07', href: '#/ai-articles/04-industry-and-business/姚顺雨这次访谈，腾讯终于把 AI 下半场讲明白了' },
        { title: '说个暴论，OpenAI 或许会成为下一个 A 社。', date: '2026-06-06', href: '#/ai-articles/04-industry-and-business/说个暴论，OpenAI 或许会成为下一个 A 社。' }
      ]
    },
    lab: {
      num: '05',
      name: '实验记录',
      en: 'LAB',
      count: 5,
      catClass: 'is-lab',
      href: '#/ai-articles/05-ai-creation-and-media/README',
      items: [
        { title: 'OiiOii升级2.0，我终于认真做了一次 AI 视频', date: '2026-06-15', href: '#/ai-articles/05-ai-creation-and-media/OiiOii 2.0 升级-补全版' },
        { title: '不得了了，GPT-image-2 的华人下场了', date: '2026-04-30', href: '#/ai-articles/05-ai-creation-and-media/不得了了，GPT-image-2 的华人下场了' },
        { title: 'GPT-image-2 来了，黑暗森林也来了', date: '2026-04-23', href: '#/ai-articles/05-ai-creation-and-media/GPT-image-2 来了，黑暗森林也来了' },
        { title: '我拿GPT-image-2生成了秦朝的朋友圈，这玩意儿也太离谱了', date: '2026-04-21', href: '#/ai-articles/05-ai-creation-and-media/我拿GPT-image-2生成了秦朝的朋友圈，这玩意儿也太离谱了' }
      ]
    },
    note: {
      num: '06',
      name: '随笔',
      en: 'NOTE',
      count: 9,
      catClass: 'is-note',
      href: '#/ai-articles/06-notes-and-observations/README',
      items: [
        { title: 'AI 时代，如何超过大多数人', date: '2026-06-08', href: '#/ai-articles/06-notes-and-observations/AI 时代，如何超过大多数人' },
        { title: '这个 6.6 k star 的仓库，我差点删库了。', date: '2026-06-02', href: '#/ai-articles/06-notes-and-observations/这个 6.6 k star 的仓库，我差点删库了。' },
        { title: '其实我之前也拒绝 AI', date: '2026-04-20', href: '#/ai-articles/06-notes-and-observations/其实我之前也拒绝 AI' },
        { title: '你这个问题是不是 AI 写的？', date: '2026-04-20', href: '#/ai-articles/06-notes-and-observations/你这个问题是不是 AI 写的？' }
      ]
    }
  };
  var categoryPageDefinitions = [
    {
      folder: '01-agent-and-coding',
      key: 'tutorial',
      num: '01',
      name: 'AI Agent 与编程工具',
      nameEn: 'AI Agents & Coding Tools',
      navText: 'Agent 与编程',
      navTextEn: 'Agents & Coding',
      en: 'AGENT & CODING',
      fallbackTitle: 'AI Agent 与编程工具',
      fallbackTitleEn: 'AI Agent & Coding Tools',
      description: 'Codex、Claude Code、Claw、Agent 工作流、AI 编程工具和真实使用体验。',
      descriptionEn: 'Codex, Claude Code, Claw, agent workflows, AI coding tools, and field notes.',
      catClass: 'is-tutorial'
    },
    {
      folder: '02-models-and-research',
      key: 'ai',
      num: '02',
      name: '模型、研究与 Prompt',
      nameEn: 'Models, Research & Prompts',
      navText: '模型与研究',
      navTextEn: 'Models & Research',
      en: 'MODELS & RESEARCH',
      fallbackTitle: '模型、研究与 Prompt',
      fallbackTitleEn: 'Models, Research & Prompt',
      description: '模型能力、研究论文/报告、Prompt 方法论、评测和 LLM 认知。',
      descriptionEn: 'Model capabilities, papers, reports, prompt methods, evaluations, and LLM observations.',
      catClass: 'is-ai'
    },
    {
      folder: '03-tools-and-resources',
      key: 'resource',
      num: '03',
      name: '工具、资源与工作台',
      nameEn: 'Tools, Resources & Workbenches',
      navText: '工具与资源',
      navTextEn: 'Tools & Resources',
      en: 'TOOLS & RESOURCES',
      fallbackTitle: '工具、资源与工作台',
      fallbackTitleEn: 'Tools, Resources & Workbench',
      description: 'AI 网站、资源清单、知识管理、排版工作台、个人工具和资源型内容。',
      descriptionEn: 'AI websites, resource lists, knowledge management, publishing workbenches, and personal tools.',
      catClass: 'is-resource'
    },
    {
      folder: '04-industry-and-business',
      key: 'industry',
      num: '04',
      name: '产业、公司与商业动态',
      nameEn: 'Industry, Companies & Business',
      navText: '产业与商业',
      navTextEn: 'Industry & Business',
      en: 'INDUSTRY & BUSINESS',
      fallbackTitle: '产业、公司与商业动态',
      fallbackTitleEn: 'Industry, Companies & Business',
      description: '公司动态、平台变化、商业化、基础设施、安全事故和行业判断。',
      descriptionEn: 'Company updates, platform shifts, commercialization, infrastructure, security incidents, and industry judgment.',
      catClass: 'is-industry'
    },
    {
      folder: '05-ai-creation-and-media',
      key: 'lab',
      num: '05',
      name: 'AI 生成与多媒体',
      nameEn: 'AI Creation & Multimedia',
      navText: '生成与多媒体',
      navTextEn: 'Creation & Media',
      en: 'CREATION & MEDIA',
      fallbackTitle: 'AI 生成与多媒体',
      fallbackTitleEn: 'AI Creation & Media',
      description: '图像、视频、3D、创意生成和 AI 内容实验。',
      descriptionEn: 'Images, video, 3D, creative generation, and AI content experiments.',
      catClass: 'is-lab'
    },
    {
      folder: '06-notes-and-observations',
      key: 'note',
      num: '06',
      name: '观察、杂谈与事故记录',
      nameEn: 'Notes, Essays & Incidents',
      navText: '观察与杂谈',
      navTextEn: 'Notes & Incidents',
      en: 'NOTES & INCIDENTS',
      fallbackTitle: '观察、杂谈与事故记录',
      fallbackTitleEn: 'Notes, Essays & Incidents',
      description: '个人观察、随笔、踩坑、事故和跨主题记录。',
      descriptionEn: 'Personal observations, essays, pitfalls, incidents, and cross-topic records.',
      catClass: 'is-note'
    }
  ];
  var designHomeInteractionsBound = false;
  var designSearchIndexPromises = {};

  window.$docsify = window.$docsify || {};
  window.$docsify.plugins = (Array.isArray(window.$docsify.plugins) ? window.$docsify.plugins : []).concat(function articleCardsPlugin(hook) {
    hook.doneEach(function () {
      lastDocsifyDoneRoute = normalizeRoute(getCurrentRoute());
      lastDocsifyDoneAt = Date.now();
      scheduleRender();
      scheduleSidebarLocalization();
      scheduleAlgoliaAttribution();
    });
  });

  startStandaloneRenderer();

  function startStandaloneRenderer() {
    var routeState;

    bindDesignHomeInteractions();
    routeState = applyDesignRouteClasses(getCurrentRoute());

    if (routeState.isDesignManaged && document.documentElement.classList.contains('cx-design-booting')) {
      pendingDesignRoute = routeState.route;
      pendingDesignRouteStartedAt = 0;
    }

    scheduleHomeLanguageDetection();

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () {
        scheduleRender();
        scheduleSidebarLocalization();
        scheduleAlgoliaAttribution();
      });
    } else {
      scheduleRender();
      scheduleSidebarLocalization();
      scheduleAlgoliaAttribution();
    }

    /* Docsify 的 doneEach 是内容渲染完成的唯一主入口。延迟任务只补侧栏/搜索
       这类外挂节点，不再反复重建正文与顶栏，避免用户点击时节点被替换。 */
    [250, 1000].forEach(function (delay) {
      window.setTimeout(scheduleSidebarLocalization, delay);
      window.setTimeout(scheduleAlgoliaAttribution, delay);
    });

    window.addEventListener('hashchange', function () {
      if (handleSamePageDesignAnchorHash(window.location.hash)) {
        closeDesignPreview();
        return;
      }

      prepareDesignRouteTransition(window.location.hash, true);
      closeDesignPreview();
      closeDesignSearch();
      window.setTimeout(scheduleHomeLanguageDetection, 0);
    });

    /* 正文由 doneEach / hashchange 驱动。这里只观察 Docsify 后挂载的侧栏与搜索，
       避免我们自己的正文 mutation 形成持续的自激式重渲染。 */
    var observer = new MutationObserver(function (mutations) {
      var shouldLocalizeSidebar = mutations.some(function (mutation) {
        var target = mutation.target;

        return (
          target.nodeType === 1 &&
          (
            target.classList.contains('sidebar') ||
            target.classList.contains('sidebar-nav') ||
            target.querySelector && target.querySelector('.sidebar-nav')
          )
        );
      });
      var shouldRenderAlgoliaAttribution = mutations.some(function (mutation) {
        var target = mutation.target;

        return (
          target.nodeType === 1 &&
          (
            target.classList.contains('search') ||
            target.querySelector && target.querySelector('.search')
          )
        );
      });

      if (shouldLocalizeSidebar) {
        scheduleSidebarLocalization();
      }

      if (shouldRenderAlgoliaAttribution) {
        scheduleAlgoliaAttribution();
      }
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  }

  function scheduleRender() {
    window.clearTimeout(renderTimer);
    renderTimer = window.setTimeout(renderArticleCards, 50);
  }

  function scheduleSidebarLocalization() {
    window.clearTimeout(sidebarTimer);
    sidebarTimer = window.setTimeout(localizeSidebar, 50);
  }

  function scheduleAlgoliaAttribution() {
    window.clearTimeout(algoliaAttributionTimer);
    algoliaAttributionTimer = window.setTimeout(renderAlgoliaAttribution, 50);
  }

  function renderAlgoliaAttribution() {
    var search = document.querySelector('.search');

    if (!search || search.querySelector('.algolia-search-attribution')) {
      return;
    }

    var attribution = document.createElement('a');
    var image = document.createElement('img');

    attribution.className = 'algolia-search-attribution';
    attribution.href = 'https://www.algolia.com/?utm_medium=AOS-referral';
    attribution.target = '_blank';
    attribution.rel = 'noopener noreferrer';
    attribution.setAttribute('aria-label', 'Search by Algolia');

    image.alt = 'Search by Algolia';
    image.loading = 'lazy';
    image.src = './assets/search-by-algolia.svg';

    attribution.appendChild(image);
    search.appendChild(attribution);
  }

  function localizeSidebar() {
    var sidebar = document.querySelector('.sidebar-nav');
    var route = getCurrentRoute();
    var locale = getSidebarLocale(route);
    var handledLinks = [];

    localizeNavbar(locale);

    if (!sidebar) {
      return;
    }

    sidebarLinks.forEach(function (item) {
      var link = findSidebarLink(sidebar, item, handledLinks);

      if (!link) {
        return;
      }

      link.textContent = locale === 'zh' ? item.zhText : item.enText;
      link.setAttribute('href', locale === 'zh' ? item.zhHref : item.enHref);
      handledLinks.push(link);
    });

    localizeSidebarGroupLabels(sidebar, locale);
    syncSidebarActiveState(sidebar, route, locale);
  }

  function localizeNavbar(locale) {
    var navbar = document.querySelector('nav.app-nav');
    var handledLinks = [];

    if (!navbar) {
      return;
    }

    navbarLinks.forEach(function (item) {
      var link = Array.from(navbar.querySelectorAll('a[href]')).find(function (candidate) {
        var href = normalizeHashHref(candidate.getAttribute('href') || '');
        var text = candidate.textContent.trim();

        return handledLinks.indexOf(candidate) === -1 &&
          (item.matchHrefs.map(normalizeHashHref).indexOf(href) !== -1 || item.matchTexts.indexOf(text) !== -1);
      });

      if (!link) {
        return;
      }

      link.textContent = locale === 'zh' ? item.zhText : item.enText;
      link.setAttribute('href', locale === 'zh' ? item.zhHref : item.enHref);
      handledLinks.push(link);
    });

    syncNavbarActiveState(navbar, getCurrentRoute(), locale);
  }

  function syncNavbarActiveState(navbar, route, locale) {
    var normalizedRoute = normalizeRoute(route);
    var activeHref = '';
    var activeLink;

    Array.from(navbar.querySelectorAll('a.active')).forEach(function (link) {
      link.classList.remove('active');
      link.removeAttribute('aria-current');
    });

    Array.from(navbar.querySelectorAll('li.active')).forEach(function (item) {
      item.classList.remove('active');
    });

    if (normalizedRoute === '' || normalizedRoute === '/' || normalizedRoute === 'README' || /^(?:home\.en|home\.print(?:\.en)?)$/.test(normalizedRoute)) {
      activeHref = locale === 'zh' ? '#/' : '#/home.en';
    } else if (/^(?:en\/)?ai-articles(?:\/|$)/.test(normalizedRoute)) {
      activeHref = locale === 'zh' ? '#/ai-articles/README' : '#/en/ai-articles/README';
    } else if (/^(?:en\/)?ai-resources(?:\/|$)/.test(normalizedRoute)) {
      activeHref = locale === 'zh' ? '#/ai-resources/README' : '#/en/ai-resources/README';
    } else if (/^(?:en\/)?development-guidelines(?:\/|$)/.test(normalizedRoute)) {
      activeHref = locale === 'zh' ? '#/development-guidelines/README' : '#/en/development-guidelines/README';
    } else if (/^(?:en\/)?works(?:\/|$)/.test(normalizedRoute)) {
      activeHref = locale === 'zh' ? '#/works/README' : '#/en/works/README';
    } else if (normalizedRoute.indexOf('archive-bestjavaer') === 0) {
      activeHref = '#/archive-bestjavaer/README';
    }

    if (!activeHref) {
      return;
    }

    activeLink = Array.from(navbar.querySelectorAll('a[href]')).find(function (link) {
      return normalizeHashHref(link.getAttribute('href') || '') === normalizeHashHref(activeHref);
    });

    if (activeLink) {
      activeLink.classList.add('active');
      activeLink.setAttribute('aria-current', 'page');

      if (activeLink.closest('li')) {
        activeLink.closest('li').classList.add('active');
      }
    }
  }

  function getSidebarLocale(route) {
    var normalizedRoute = normalizeRoute(route);

    if (
      normalizedRoute === 'README.zh-CN' ||
      normalizedRoute === 'ai-articles' ||
      normalizedRoute.indexOf('ai-articles/') === 0 ||
      normalizedRoute === 'ai-resources' ||
      normalizedRoute.indexOf('ai-resources/') === 0 ||
      normalizedRoute === 'works' ||
      normalizedRoute.indexOf('works/') === 0 ||
      normalizedRoute === 'development-guidelines' ||
      normalizedRoute.indexOf('development-guidelines/') === 0
    ) {
      activeSidebarLocale = 'zh';
      return activeSidebarLocale;
    }

    if (
      normalizedRoute === 'home.en' ||
      normalizedRoute === 'home.print.en' ||
      normalizedRoute === 'README' ||
      normalizedRoute.indexOf('en/') === 0
    ) {
      activeSidebarLocale = 'en';
      return activeSidebarLocale;
    }

    if (normalizedRoute.indexOf('archive-bestjavaer') === 0) {
      activeSidebarLocale = 'zh';
      return activeSidebarLocale;
    }

    activeSidebarLocale = 'zh';
    return activeSidebarLocale;
  }

  function findSidebarLink(sidebar, item, handledLinks) {
    var hrefs = [item.enHref, item.zhHref].map(normalizeHashHref);
    var texts = [item.enText, item.zhText];

    return Array.from(sidebar.querySelectorAll('a[href]')).find(function (link) {
      var href = normalizeHashHref(link.getAttribute('href') || '');
      var text = link.textContent.trim();

      return handledLinks.indexOf(link) === -1 && (hrefs.indexOf(href) !== -1 || texts.indexOf(text) !== -1);
    });
  }

  function localizeSidebarGroupLabels(sidebar, locale) {
    var replacements = {};

    sidebarGroupLabels.forEach(function (label) {
      replacements[label.enText] = locale === 'zh' ? label.zhText : label.enText;
      replacements[label.zhText] = locale === 'zh' ? label.zhText : label.enText;
    });

    Array.from(sidebar.querySelectorAll('li')).forEach(function (item) {
      Array.from(item.childNodes).some(function (node) {
        var text = node.textContent ? node.textContent.trim() : '';

        if (node.nodeType === 3 && replacements[text]) {
          node.textContent = replacements[text];
          return true;
        }

        if (node.nodeType === 1 && node.tagName === 'P' && replacements[text]) {
          node.textContent = replacements[text];
          return true;
        }

        return false;
      });
    });
  }

  function syncSidebarActiveState(sidebar, route, locale) {
    var activeHref = getActiveSidebarHref(route, locale);

    Array.from(sidebar.querySelectorAll('li.active')).forEach(function (item) {
      item.classList.remove('active');
    });

    if (!activeHref) {
      return;
    }

    Array.from(sidebar.querySelectorAll('a[href]')).forEach(function (link) {
      if (normalizeHashHref(link.getAttribute('href') || '') !== activeHref) {
        return;
      }

      var item = link.closest('li');

      while (item && sidebar.contains(item)) {
        item.classList.add('active');
        item = item.parentElement ? item.parentElement.closest('li') : null;
      }
    });
  }

  function getActiveSidebarHref(route, locale) {
    var normalizedRoute = normalizeRoute(route);

    if (normalizedRoute === '' || normalizedRoute === '/' || normalizedRoute === 'README') {
      return normalizeHashHref('#/');
    }

    if (normalizedRoute === 'README.zh-CN') {
      return normalizeHashHref('#/README.zh-CN');
    }

    if (!/\/README$/.test(normalizedRoute) && normalizedRoute.indexOf('/') > -1) {
      normalizedRoute = normalizedRoute.replace(/\/[^/]+$/, '/README');
    }

    if (locale === 'zh' && normalizedRoute.indexOf('en/') === 0) {
      normalizedRoute = normalizedRoute.replace(/^en\//, '');
    }

    return normalizeHashHref('#/' + normalizedRoute);
  }

  function normalizeHashHref(href) {
    var cleanHref = (href || '').trim();

    if (cleanHref.indexOf('#/') > -1) {
      cleanHref = '#/' + cleanHref.split('#/')[1];
    }

    cleanHref = cleanHref.split('?')[0].replace(/\.md$/i, '').replace(/\/+$/, '');

    if (cleanHref === '#') {
      cleanHref = '#/';
    }

    try {
      cleanHref = decodeURIComponent(cleanHref);
    } catch (error) {
      return cleanHref;
    }

    return cleanHref || '#/';
  }

  function normalizeRoute(route) {
    var normalized = (route || '').replace(/^\/+/, '').replace(/\.md$/i, '').replace(/\/+$/, '');

    try {
      normalized = decodeURIComponent(normalized);
    } catch (error) {
      return normalized;
    }

    return normalized;
  }

  function renderArticleCards() {
    var route = getCurrentRoute();
    var routeState = applyDesignRouteClasses(route);
    var isHome = routeState.isHome;
    var isArticleIndex = routeState.isArticleIndex;
    var isCategoryIndex = routeState.isCategoryIndex;
    var currentMarkdownPath = getCurrentMarkdownPath(route);
    var isArticleDetail = routeState.isArticleDetail;

    var section = document.querySelector('.markdown-section');

    if (!section) {
      return;
    }

    syncDocumentLanguage(route);

    if (!routeState.isDesignManaged) {
      decorateDocumentPage(section, route);
      updateDocumentPageTitle(section, route);
    }

    if (routeState.isDesignManaged && !isDesignRouteReady(routeState)) {
      return;
    }

    if (!isArticleDetail) {
      clearArticleRail(isCategoryIndex);
      section.classList.remove('article-prose');
      document.documentElement.classList.remove('article-guide-collapsed');
    }

    if (!routeState.isDesignManaged) {
      renderArticleTopbar(getArticleRootForRoute(route));
      localizeSidebar();
      return;
    }

    if (isHome) {
      decorateHomePage(section);
      updateDesignDocumentTitle('cxuan-ai-labs');
      markDesignHydrated(routeState);
    } else {
      stopHomeNeuralCanvas();
    }

    if (isCategoryIndex) {
      decorateCategoryIndex(section, route);
      updateDesignDocumentTitle(getCategoryPageTitle(section, route));
      markDesignHydrated(routeState);
      return;
    }

    if (isArticleDetail) {
      decorateArticleDetail(section, currentMarkdownPath);
      renderSeriesNav(section, currentMarkdownPath);
      updateDesignDocumentTitle(getArticlePageTitle(section));
      markDesignHydrated(routeState);
    }

    if (!isArticleIndex) {
      return;
    }

    if (routeState.isDesignHomeRoute) {
      decorateDesignHomeIndex(section, routeState);
    }

    updateDesignDocumentTitle(routeState.isEnglish ? 'Featured Articles' : '精选文章');
    renderDesignRecentUpdates(section, routeState);

    Array.from(section.querySelectorAll('ul')).forEach(function (list) {
      var items = Array.from(list.children).filter(function (item) {
        return item.tagName === 'LI';
      });
      var articleItems = items.map(toArticleItem).filter(Boolean);

      if (articleItems.length < 2) {
        return;
      }

      list.classList.add('article-card-grid');
      articleItems.forEach(function (item) {
        renderCard(item);
      });
    });

    markDesignHydrated(routeState);
  }

  function markDesignHydrated(routeState) {
    if (routeState && pendingDesignRoute === routeState.route) {
      pendingDesignRoute = '';
      pendingDesignRouteStartedAt = 0;
    }

    document.documentElement.classList.remove('cx-design-booting');
  }

  function applyDesignRouteClasses(route) {
    var state = getDesignRouteState(route);
    var hasDesignHome = !!document.querySelector('.cx-design-home') || state.isDesignHomeRoute;
    var isDirectoryRoute = /^(?:en\/)?(?:works|ai-resources|development-guidelines)\/README$/.test(state.route);

    document.documentElement.classList.toggle('home-page', state.isHome);
    document.documentElement.classList.toggle('article-index-page', state.isArticleIndex);
    document.documentElement.classList.toggle('category-design-page', state.isCategoryIndex);
    document.documentElement.classList.toggle('article-detail-page', state.isArticleDetail);
    document.documentElement.classList.toggle('wide-page', state.isHome || state.isArticleIndex);
    document.documentElement.classList.toggle('cx-design-page', hasDesignHome);
    document.documentElement.classList.toggle('cx-design-managed', state.isDesignManaged);
    document.documentElement.classList.toggle('cx-doc-page', !state.isDesignManaged);
    document.documentElement.classList.toggle('cx-directory-route', isDirectoryRoute);
    document.documentElement.classList.toggle('cx-legacy-page', state.route.indexOf('archive-bestjavaer') === 0);
    applySiteTheme(getStoredHomeNeuralTheme(), false);

    if (!state.isHome) {
      document.documentElement.classList.remove('print-light', 'print-dark');
    }

    if (!state.isDesignManaged) {
      document.documentElement.classList.remove('cx-design-booting');
      pendingDesignRoute = '';
      pendingDesignRouteStartedAt = 0;
    }

    return state;
  }

  function prepareDesignRouteTransition(hashOrHref, forcePending) {
    var route = getRouteFromHashOrHref(hashOrHref);
    var state = applyDesignRouteClasses(route);
    var currentRoute = normalizeRoute(getCurrentRoute());

    if (state.isDesignManaged) {
      document.documentElement.classList.add('cx-design-booting');

      if (forcePending || route !== currentRoute) {
        pendingDesignRoute = route;
        pendingDesignRouteStartedAt = Date.now();
      }
    }
  }

  function isDesignRouteReady(routeState) {
    if (!pendingDesignRoute || pendingDesignRoute !== routeState.route) {
      return true;
    }

    if (hasRenderedDesignRouteContent(routeState) && Date.now() - pendingDesignRouteStartedAt > 350) {
      return true;
    }

    return lastDocsifyDoneRoute === routeState.route &&
      lastDocsifyDoneAt >= pendingDesignRouteStartedAt;
  }

  function hasRenderedDesignRouteContent(routeState) {
    var section = document.querySelector('.markdown-section');
    var text;

    if (!section) {
      return false;
    }

    text = section.textContent.replace(/\s+/g, '').trim();

    if (!text) {
      return false;
    }

    if (routeState.isArticleDetail) {
      return !!section.querySelector('h1') && text.length > 30;
    }

    if (routeState.isCategoryIndex) {
      return !!section.querySelector('.category-design-shell, h1, ul');
    }

    if (routeState.isArticleIndex) {
      return !!section.querySelector('.cx-design-home, h1, ul');
    }

    return routeState.isHome && text.length > 10;
  }

  function scheduleHomeLanguageDetection() {
    window.setTimeout(resolveHomeLanguage, 0);
  }

  function resolveHomeLanguage() {
    var route = normalizeRoute(getCurrentRoute());
    var manualLanguage = getStoredHomeLanguage();
    var cachedLanguage;

    if (!isAutoLanguageHomeRoute(route)) {
      document.documentElement.classList.remove('cx-language-detecting');
      syncDocumentLanguage(route);
      return;
    }

    if (manualLanguage) {
      applyDetectedHomeLanguage(manualLanguage);
      return;
    }

    cachedLanguage = getCachedDetectedHomeLanguage();

    if (cachedLanguage) {
      applyDetectedHomeLanguage(cachedLanguage);
      return;
    }

    detectHomeLanguageByIp()
      .then(function (language) {
        var resolvedLanguage = language || detectHomeLanguageFromBrowser();

        cacheDetectedHomeLanguage(resolvedLanguage);
        applyDetectedHomeLanguage(resolvedLanguage);
      })
      .catch(function () {
        var fallbackLanguage = detectHomeLanguageFromBrowser();

        cacheDetectedHomeLanguage(fallbackLanguage);
        applyDetectedHomeLanguage(fallbackLanguage);
      });
  }

  function isAutoLanguageHomeRoute(route) {
    return route === '' || route === '/' || route === 'README';
  }

  function isPrintEntry() {
    return /print\.html$/.test(window.location.pathname);
  }

  function applyDetectedHomeLanguage(language) {
    document.documentElement.classList.remove('cx-language-detecting');

    if (language === 'en' && isAutoLanguageHomeRoute(normalizeRoute(getCurrentRoute()))) {
      navigateDesignRoute(isPrintEntry() ? '#/home.print.en' : '#/home.en');
      return;
    }

    syncDocumentLanguage(getCurrentRoute());
  }

  function syncDocumentLanguage(route) {
    var normalizedRoute = normalizeRoute(route);

    if (normalizedRoute.indexOf('archive-bestjavaer') === 0) {
      document.documentElement.lang = 'zh-CN';
      return;
    }

    document.documentElement.lang =
      normalizedRoute === 'home.en' ||
      normalizedRoute === 'home.print.en' ||
      /^en(?:\/|$)/.test(normalizedRoute)
        ? 'en'
        : 'zh-CN';
  }

  function decorateDocumentPage(section, route) {
    var normalizedRoute = normalizeRoute(route);
    var isDirectoryPage = /^(?:en\/)?(?:works|ai-resources|development-guidelines)\/README$/.test(normalizedRoute);
    var isLegacyPage = normalizedRoute.indexOf('archive-bestjavaer') === 0;
    var isNotFound = /^404\b/.test((section.querySelector('h1') || {}).textContent || '') ||
      !!section.querySelector('.cx-not-found');

    section.classList.toggle('cx-directory-page', isDirectoryPage);
    section.classList.toggle('cx-not-found-page', isNotFound);

    Array.from(section.querySelectorAll(':scope > ul')).forEach(function (list) {
      list.classList.toggle('cx-directory-grid', isDirectoryPage);

      Array.from(list.children).forEach(function (item) {
        item.classList.toggle('cx-directory-card', isDirectoryPage);

        if (isDirectoryPage) {
          enhanceDirectoryCard(item);
        }
      });
    });

    if (isLegacyPage) {
      bindLegacyImageFallbacks(section);
    }
  }

  function enhanceDirectoryCard(item) {
    var primaryLink = item.querySelector(':scope > a[href], :scope > p:first-child a[href]');

    if (!primaryLink) {
      return;
    }

    item.setAttribute('role', 'link');
    item.setAttribute('tabindex', '0');
    item.setAttribute('data-cx-card-href', primaryLink.getAttribute('href') || '');

    if (item.getAttribute('data-cx-card-bound') === 'true') {
      return;
    }

    item.setAttribute('data-cx-card-bound', 'true');
    item.addEventListener('click', function (event) {
      var selection = window.getSelection ? window.getSelection().toString() : '';

      if (event.target.closest('a, button, input, textarea, select') || selection) {
        return;
      }

      primaryLink.click();
    });
    item.addEventListener('keydown', function (event) {
      if (event.key !== 'Enter' && event.key !== ' ') {
        return;
      }

      event.preventDefault();
      primaryLink.click();
    });
  }

  function bindLegacyImageFallbacks(section) {
    Array.from(section.querySelectorAll('img[src]')).forEach(function (image) {
      var applyFallback = function () {
        if (image.getAttribute('data-cx-image-fallback') === 'true') {
          return;
        }

        image.setAttribute('data-cx-image-fallback', 'true');
        image.setAttribute('data-cx-original-src', image.getAttribute('src') || '');
        image.alt = image.alt || '历史文章图片暂不可用';
        image.src = './assets/archive-image-unavailable.svg';
      };

      if (image.getAttribute('data-cx-image-bound') === 'true') {
        return;
      }

      image.setAttribute('data-cx-image-bound', 'true');
      image.addEventListener('error', applyFallback);

      if (image.complete && !image.naturalWidth) {
        applyFallback();
      }
    });
  }

  function updateDocumentPageTitle(section, route) {
    var heading = section.querySelector('h1');
    var normalizedRoute = normalizeRoute(route);
    var title = heading && heading.textContent ? heading.textContent.trim() : '';

    if (!title && normalizedRoute.indexOf('archive-bestjavaer') === 0) {
      title = 'archive-bestjavaer';
    }

    if (!title) {
      return;
    }

    updateDesignDocumentTitle(title);
  }

  function detectHomeLanguageByIp() {
    var controller = window.AbortController ? new AbortController() : null;
    var timeout = window.setTimeout(function () {
      if (controller) {
        controller.abort();
      }
    }, 900);

    if (/^(localhost|127\.0\.0\.1|0\.0\.0\.0)$/i.test(window.location.hostname)) {
      window.clearTimeout(timeout);
      return Promise.resolve('');
    }

    return fetch('/api/geo', {
      cache: 'no-store',
      headers: {
        accept: 'application/json'
      },
      signal: controller ? controller.signal : undefined
    })
      .then(function (response) {
        if (!response.ok) {
          return '';
        }

        return response.json();
      })
      .then(function (payload) {
        if (!payload || !payload.language) {
          return '';
        }

        return normalizeHomeLanguage(payload.language);
      })
      .catch(function () {
        return '';
      })
      .then(function (language) {
        window.clearTimeout(timeout);
        return language;
      });
  }

  function detectHomeLanguageFromBrowser() {
    var languages = navigator.languages && navigator.languages.length
      ? navigator.languages
      : [navigator.language || ''];
    var timezone = '';
    var hasChineseLanguage = languages.some(function (language) {
      return /^zh\b/i.test(language || '');
    });

    if (hasChineseLanguage) {
      return 'zh';
    }

    try {
      timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    } catch (error) {
      timezone = '';
    }

    return /^Asia\/(Shanghai|Chongqing|Harbin|Urumqi|Hong_Kong|Macau|Taipei)$/i.test(timezone)
      ? 'zh'
      : 'en';
  }

  function getStoredHomeLanguage() {
    try {
      return normalizeHomeLanguage(window.localStorage.getItem(HOME_LANGUAGE_KEY));
    } catch (error) {
      return '';
    }
  }

  function setStoredHomeLanguage(language) {
    var normalized = normalizeHomeLanguage(language);

    if (!normalized) {
      return;
    }

    try {
      window.localStorage.setItem(HOME_LANGUAGE_KEY, normalized);
    } catch (error) {
      return;
    }
  }

  function getCachedDetectedHomeLanguage() {
    var cached;

    try {
      cached = JSON.parse(window.sessionStorage.getItem(HOME_LANGUAGE_DETECTED_KEY) || '{}');
    } catch (error) {
      return '';
    }

    if (!cached.language || !cached.time || Date.now() - cached.time > HOME_LANGUAGE_DETECTED_TTL) {
      return '';
    }

    return normalizeHomeLanguage(cached.language);
  }

  function cacheDetectedHomeLanguage(language) {
    var normalized = normalizeHomeLanguage(language);

    if (!normalized) {
      return;
    }

    try {
      window.sessionStorage.setItem(HOME_LANGUAGE_DETECTED_KEY, JSON.stringify({
        language: normalized,
        time: Date.now()
      }));
    } catch (error) {
      return;
    }
  }

  function normalizeHomeLanguage(language) {
    var value = (language || '').toString().trim().toLowerCase();

    if (value === 'zh' || value === 'zh-cn' || value === 'cn' || value === 'chinese') {
      return 'zh';
    }

    if (value === 'en' || value === 'en-us' || value === 'english') {
      return 'en';
    }

    return '';
  }

  function getDesignRouteState(route) {
    var normalizedRoute = normalizeRoute(route);
    var markdownPath = getCurrentMarkdownPath(normalizedRoute);
    var articleRoot = getArticleRootForRoute(normalizedRoute);
    var isEnglish = isEnglishArticleRoot(articleRoot);
    var isHome = isHomeRoute(normalizedRoute);
    var isArticleIndex = isArticleIndexRoute(normalizedRoute);
    var isCategoryIndex = isCategoryIndexRoute(normalizedRoute);
    var isArticleDetail = isArticleMarkdown(markdownPath);
    var isDesignHomeRoute = normalizedRoute === 'ai-articles' ||
      normalizedRoute === 'ai-articles/README' ||
      normalizedRoute === 'en/ai-articles' ||
      normalizedRoute === 'en/ai-articles/README';

    return {
      articleRoot: articleRoot,
      isArticleDetail: isArticleDetail,
      isArticleIndex: isArticleIndex,
      isCategoryIndex: isCategoryIndex,
      isDesignHomeRoute: isDesignHomeRoute,
      isDesignManaged: isHome || isArticleIndex || isArticleDetail,
      isEnglish: isEnglish,
      isHome: isHome,
      route: normalizedRoute
    };
  }

  function getArticleRootForRoute(route) {
    var normalizedRoute = normalizeRoute(route || getCurrentRoute());

    return normalizedRoute.indexOf('en/') === 0 ? 'en/ai-articles' : 'ai-articles';
  }

  function getArticleRootForPath(path) {
    var normalizedPath = normalizeMarkdownPath(path || '');

    return normalizedPath.indexOf('en/ai-articles/') === 0 ? 'en/ai-articles' : 'ai-articles';
  }

  function isEnglishArticleRoot(articleRoot) {
    return articleRoot === 'en/ai-articles';
  }

  function getRouteFromHashOrHref(hashOrHref) {
    var route = hashOrHref || window.location.hash || '#/';
    var hashIndex = route.indexOf('#/');

    if (hashIndex > -1) {
      route = route.slice(hashIndex + 2);
    } else {
      route = route.replace(/^#\/?/, '');
    }

    return normalizeRoute(route.split('?')[0].split('#')[0]);
  }

  function clearArticleRail(keepTopbar) {
    var rail = document.querySelector('.article-detail-rail');
    var leftGuide = document.querySelector('.article-left-guide');
    var topbar = document.querySelector('.article-topbar');

    if (rail) {
      rail.remove();
    }

    if (leftGuide) {
      leftGuide.remove();
    }

    if (topbar && !keepTopbar) {
      topbar.remove();
    }
  }

  function decorateCategoryIndex(section, route) {
    var articleRoot = getArticleRootForRoute(route);
    var isEnglish = isEnglishArticleRoot(articleRoot);

    if (section.querySelector('.category-design-shell')) {
      renderArticleTopbar(articleRoot);
      return;
    }

    var meta = getCategoryPageMeta(route, articleRoot);
    var titleNode = section.querySelector('h1');
    var descriptionNode = Array.from(section.children).find(function (node) {
      return node.tagName === 'P' && !node.classList.contains('branch-back');
    });
    var articles = collectCategoryArticles(section);
    var title = titleNode ? titleNode.textContent.trim() : meta.fallbackTitle;
    var description = descriptionNode ? descriptionNode.textContent.trim() : '';
    var shell = document.createElement('section');
    var breadcrumb = document.createElement('div');
    var featuredLink = document.createElement('a');
    var hero = document.createElement('header');
    var pill = document.createElement('div');
    var titleRow = document.createElement('div');
    var listHeader = document.createElement('div');
    var listCount = document.createElement('span');
    var list = document.createElement('div');
    var pagination = document.createElement('div');

    section.classList.add('category-design-section');
    section.textContent = '';
    renderArticleTopbar(articleRoot);

    shell.className = 'category-design-shell ' + meta.catClass;
    breadcrumb.className = 'category-page-breadcrumb';
    featuredLink.href = '#/' + articleRoot + '/README';
    featuredLink.textContent = isEnglish ? 'Featured' : '精选';
    breadcrumb.appendChild(featuredLink);
    appendText(breadcrumb, 'span', '', '/');
    appendText(breadcrumb, 'strong', '', meta.name);

    hero.className = 'category-page-hero';
    pill.className = 'category-page-pill';
    appendText(pill, 'span', '', meta.name);
    appendText(pill, 'span', '', '·');
    appendText(pill, 'strong', '', meta.en);

    titleRow.className = 'category-page-title-row';
    appendText(titleRow, 'span', 'category-page-number', meta.num);
    appendText(titleRow, 'h1', '', title);

    hero.appendChild(pill);
    hero.appendChild(titleRow);

    if (description) {
      appendText(hero, 'p', 'category-page-description', description);
    }

    appendText(
      hero,
      'div',
      'category-page-meta',
      isEnglish ? articles.length + ' articles · Updating' : '共 ' + articles.length + ' 篇 · 持续更新中'
    );

    listHeader.className = 'category-list-header';
    appendText(listHeader, 'h2', '', isEnglish ? 'All Articles' : '全部文章');
    listCount.textContent = '';
    listHeader.appendChild(listCount);

    list.className = 'category-page-list';
    pagination.className = 'category-page-pagination';

    if (!articles.length) {
      appendText(list, 'p', 'category-empty-state', isEnglish ? 'No articles in this category yet.' : '这个分类暂时还没有文章。');
    } else {
      renderCategoryArticlePage({
        articles: articles,
        countNode: listCount,
        isEnglish: isEnglish,
        list: list,
        listHeader: listHeader,
        page: 1,
        pageSize: CATEGORY_PAGE_SIZE,
        pagination: pagination
      });
    }

    shell.appendChild(breadcrumb);
    shell.appendChild(hero);
    shell.appendChild(listHeader);
    shell.appendChild(list);
    shell.appendChild(pagination);
    section.appendChild(shell);
  }

  function renderCategoryArticlePage(state, requestedPage, userTriggered) {
    var totalPages = Math.max(1, Math.ceil(state.articles.length / state.pageSize));
    var page = Math.max(1, Math.min(totalPages, requestedPage || state.page || 1));
    var start = (page - 1) * state.pageSize;
    var pageArticles = state.articles.slice(start, start + state.pageSize);

    state.page = page;
    state.totalPages = totalPages;
    state.list.textContent = '';

    pageArticles.forEach(function (article, offset) {
      state.list.appendChild(createCategoryArticleRow(article, start + offset, state.isEnglish));
    });

    hydrateCategoryArticleSummaries(pageArticles, state.list, state.isEnglish);
    renderCategoryPagination(state);

    state.countNode.textContent = formatCategoryPageCount(state.articles.length, page, totalPages, state.isEnglish);

    if (userTriggered && state.listHeader.scrollIntoView) {
      state.listHeader.scrollIntoView({ block: 'start', behavior: 'smooth' });
    }
  }

  function formatCategoryPageCount(total, page, totalPages, isEnglish) {
    if (totalPages <= 1) {
      return isEnglish ? total + ' items' : total + ' 篇';
    }

    return isEnglish
      ? total + ' items · page ' + page + ' / ' + totalPages
      : total + ' 篇 · 第 ' + page + ' / ' + totalPages + ' 页';
  }

  function renderCategoryPagination(state) {
    var totalPages = state.totalPages || 1;
    var page = state.page || 1;
    var pages = getVisibleCategoryPages(page, totalPages);

    state.pagination.textContent = '';

    if (totalPages <= 1) {
      return;
    }

    state.pagination.appendChild(createCategoryPageButton(state.isEnglish ? 'Previous' : '上一页', page - 1, page <= 1, false, state));

    pages.forEach(function (pageNumber) {
      if (pageNumber === 'gap') {
        appendText(state.pagination, 'span', 'category-page-pagination-gap', '...');
        return;
      }

      state.pagination.appendChild(createCategoryPageButton(String(pageNumber), pageNumber, false, pageNumber === page, state));
    });

    state.pagination.appendChild(createCategoryPageButton(state.isEnglish ? 'Next' : '下一页', page + 1, page >= totalPages, false, state));
  }

  function getVisibleCategoryPages(page, totalPages) {
    var pages = [];
    var start = Math.max(1, page - 1);
    var end = Math.min(totalPages, page + 1);
    var current;

    pages.push(1);

    if (start > 2) {
      pages.push('gap');
    }

    for (current = start; current <= end; current += 1) {
      if (current !== 1 && current !== totalPages) {
        pages.push(current);
      }
    }

    if (end < totalPages - 1) {
      pages.push('gap');
    }

    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages.filter(function (value, index) {
      return value === 'gap' || pages.indexOf(value) === index;
    });
  }

  function createCategoryPageButton(label, page, disabled, isCurrent, state) {
    var button = document.createElement('button');

    button.type = 'button';
    button.className = 'category-page-pagination-button';
    button.textContent = label;
    button.disabled = !!disabled;

    if (isCurrent) {
      button.classList.add('is-current');
      button.setAttribute('aria-current', 'page');
    }

    button.addEventListener('click', function () {
      if (!button.disabled) {
        renderCategoryArticlePage(state, page, true);
      }
    });

    return button;
  }

  function getCategoryPageTitle(section, route) {
    var renderedTitle = section.querySelector('.category-page-title-row h1');
    var meta;

    if (renderedTitle && renderedTitle.textContent.trim()) {
      return renderedTitle.textContent.trim();
    }

    meta = getCategoryPageMeta(route);
    return meta.fallbackTitle || meta.name || '文章分类';
  }

  function getArticlePageTitle(section) {
    var title = section.querySelector('h1');

    return title && title.textContent.trim() ? title.textContent.trim() : '文章';
  }

  function updateDesignDocumentTitle(title) {
    var cleanTitle = title && title.trim ? title.trim() : '';

    document.title = cleanTitle && cleanTitle !== 'cxuan-ai-labs'
      ? cleanTitle + ' | cxuan-ai-labs'
      : 'cxuan-ai-labs';

    syncRouteMetadata(cleanTitle || 'cxuan-ai-labs');
  }

  function setMetaContent(selector, content) {
    var meta = document.querySelector(selector);

    if (meta && content) {
      meta.setAttribute('content', content);
    }
  }

  function getRouteMetaDescription(title) {
    var candidates = document.querySelectorAll(
      '.sn-hero-statement, .article-prose > p, .category-design-page .markdown-section p, .cx-design-home p'
    );
    var description = '';
    var index;
    var text;

    for (index = 0; index < candidates.length; index += 1) {
      text = candidates[index].textContent.replace(/\s+/g, ' ').trim();
      if (
        text.length >= 32 &&
        text.indexOf('English | 中文') === -1 &&
        text.indexOf('CC BY-SA') === -1
      ) {
        description = text;
        break;
      }
    }

    if (!description && title && title !== 'cxuan-ai-labs') {
      description = document.documentElement.lang === 'en'
        ? title + ': curated field notes, practical tests, and first-hand lessons from cxuan-ai-labs.'
        : title + '：汇集 cxuan-ai-labs 的实战文章、工具实测、踩坑记录与产品判断。';
    }

    if (!description) {
      description = document.documentElement.lang === 'en'
        ? 'Field notes on Codex, Claude Code, agent workflows, AI tools, and product judgment.'
        : '长期折腾 Codex、Claude Code 和 Agent 工作流，记录真实踩坑、工具实测和产品判断。';
    }

    return description.length > 160 ? description.slice(0, 157) + '…' : description;
  }

  function toAbsolutePageUrl(value) {
    try {
      return new URL(value, window.location.href).href;
    } catch (error) {
      return value;
    }
  }

  function encodePublicPath(value) {
    return value
      .split('/')
      .filter(Boolean)
      .map(function (segment) {
        try {
          return encodeURIComponent(decodeURIComponent(segment));
        } catch (error) {
          return encodeURIComponent(segment);
        }
      })
      .join('/');
  }

  function getCleanPublicPath(route) {
    var normalized = normalizeRoute(route).replace(/\.md$/i, '');
    var match;
    var prefix;
    var tail;

    if (!normalized || normalized === 'README') {
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

    match = normalized.match(/^(en\/)?ai-articles\/(0[1-6]-[^/]+)\/(.+)$/);

    if (!match) {
      return window.location.pathname + (normalized ? '#/' + encodeURI(normalized) : '');
    }

    prefix = match[1] ? '/en' : '';
    tail = match[3] === 'README' ? '' : encodePublicPath(match[3]) + '/';
    return prefix + '/articles/' + match[2] + '/' + tail;
  }

  function setAlternateLink(language, href) {
    var selector = 'link[rel="alternate"][hreflang="' + language + '"]';
    var link = document.querySelector(selector);

    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'alternate');
      link.setAttribute('hreflang', language);
      document.head.appendChild(link);
    }

    link.setAttribute('href', href);
  }

  function syncKnownRouteAlternates(route) {
    var normalized = normalizeRoute(route).replace(/\.md$/i, '');
    var match = normalized.match(/^(en\/)?ai-articles\/(0[1-6]-[^/]+)\/README$/);
    var chinesePath;
    var englishPath;

    if (!normalized || normalized === 'README' || normalized === 'home.en') {
      chinesePath = '/';
      englishPath = '/en/';
    } else if (normalized === 'ai-articles/README' || normalized === 'en/ai-articles/README') {
      chinesePath = '/articles/';
      englishPath = '/en/articles/';
    } else if (match) {
      chinesePath = '/articles/' + match[2] + '/';
      englishPath = '/en/articles/' + match[2] + '/';
    } else {
      return;
    }

    setAlternateLink('zh-CN', window.location.origin + chinesePath);
    setAlternateLink('en', window.location.origin + englishPath);
    setAlternateLink('x-default', window.location.origin + chinesePath);
  }

  function syncRouteMetadata(title) {
    var route = normalizeRoute(getCurrentRoute());
    var canonical = window.location.origin + getCleanPublicPath(route);
    var description = getRouteMetaDescription(title);
    var image = document.querySelector('.article-prose img[src], .sn-showcase-slide.is-active img[src]');
    var imageUrl = image
      ? toAbsolutePageUrl(image.getAttribute('src'))
      : toAbsolutePageUrl('./assets/home-neural-hero.png');
    var canonicalLink = document.querySelector('link[rel="canonical"]');
    var metaTitle = title && title !== 'cxuan-ai-labs' ? title + ' | cxuan-ai-labs' : 'cxuan-ai-labs';
    var isArticle = document.documentElement.classList.contains('article-detail-page');
    var isEnglish = document.documentElement.lang === 'en';

    if (canonicalLink) {
      canonicalLink.setAttribute('href', canonical);
    }

    setMetaContent('meta[name="description"]', description);
    setMetaContent('meta[property="og:title"]', metaTitle);
    setMetaContent('meta[property="og:description"]', description);
    setMetaContent('meta[property="og:type"]', isArticle ? 'article' : 'website');
    setMetaContent('meta[property="og:locale"]', isEnglish ? 'en_US' : 'zh_CN');
    setMetaContent('meta[property="og:url"]', canonical);
    setMetaContent('meta[property="og:image"]', imageUrl);
    setMetaContent('meta[name="twitter:title"]', metaTitle);
    setMetaContent('meta[name="twitter:description"]', description);
    setMetaContent('meta[name="twitter:image"]', imageUrl);
    syncKnownRouteAlternates(route);
  }

  function getCategoryPageMeta(route, articleRoot) {
    var normalizedRoute = normalizeRoute(route);
    var found = categoryPageDefinitions.find(function (item) {
      return normalizedRoute.indexOf('/' + item.folder + '/README') > -1 ||
        normalizedRoute.indexOf(item.folder + '/README') === 0 ||
        normalizedRoute.indexOf('ai-articles/' + item.folder + '/README') > -1;
    });

    if (found) {
      return localizeCategoryDefinition(found, articleRoot || getArticleRootForRoute(route));
    }

    return {
      folder: '',
      num: '00',
      name: isEnglishArticleRoot(articleRoot || getArticleRootForRoute(route)) ? 'Content' : '内容',
      navText: isEnglishArticleRoot(articleRoot || getArticleRootForRoute(route)) ? 'Content' : '内容',
      en: 'CONTENT',
      fallbackTitle: isEnglishArticleRoot(articleRoot || getArticleRootForRoute(route)) ? 'Article Category' : '文章分类',
      catClass: 'is-tutorial'
    };
  }

  function localizeCategoryDefinition(category, articleRoot) {
    var isEnglish = isEnglishArticleRoot(articleRoot);
    var localized = {};
    var key;

    for (key in category) {
      if (Object.prototype.hasOwnProperty.call(category, key)) {
        localized[key] = category[key];
      }
    }

    localized.name = isEnglish ? category.nameEn : category.name;
    localized.navText = isEnglish ? category.navTextEn : category.navText;
    localized.fallbackTitle = isEnglish ? category.fallbackTitleEn : category.fallbackTitle;
    localized.description = isEnglish ? category.descriptionEn : category.description;
    localized.href = '#/' + (articleRoot || 'ai-articles') + '/' + category.folder + '/README';

    return localized;
  }

  function collectCategoryArticles(section) {
    var seen = {};

    return Array.from(section.querySelectorAll('li')).map(toArticleItem).filter(function (article) {
      if (!article || seen[article.markdownPath]) {
        return false;
      }

      seen[article.markdownPath] = true;
      return true;
    });
  }

  function createCategoryArticleRow(article, index, isEnglish) {
    var row = document.createElement('a');
    var number = document.createElement('span');
    var main = document.createElement('span');
    var title = document.createElement('span');
    var summary = document.createElement('span');
    var date = document.createElement('time');
    var arrow = document.createElement('span');

    row.className = 'category-page-row';
    row.href = article.href;
    number.className = 'category-page-row-number';
    number.textContent = String(index + 1).padStart(2, '0');
    main.className = 'category-page-row-main';
    title.className = 'category-page-row-title';
    title.textContent = article.title;
    summary.className = 'category-page-row-summary is-loading';
    summary.setAttribute('data-category-summary', '');
    summary.setAttribute('data-markdown-path', article.markdownPath);
    summary.textContent = isEnglish ? 'Loading summary...' : '正在读取摘要...';
    date.className = 'category-page-row-date';
    date.dateTime = article.date || '';
    date.textContent = article.date || '未标注';
    arrow.className = 'category-page-row-arrow';
    arrow.textContent = '→';

    main.appendChild(title);
    main.appendChild(summary);
    row.appendChild(number);
    row.appendChild(main);
    row.appendChild(date);
    row.appendChild(arrow);

    return row;
  }

  function hydrateCategoryArticleSummaries(articles, list, isEnglish) {
    Array.from(list.querySelectorAll('[data-category-summary]')).forEach(function (node, offset) {
      var article = articles[offset];

      if (!article) {
        return;
      }

      getCategoryArticleSummary(article, isEnglish).then(function (summary) {
        if (!document.body.contains(node) || node.getAttribute('data-markdown-path') !== article.markdownPath) {
          return;
        }

        node.textContent = summary;
        node.classList.remove('is-loading');
      });
    });
  }

  function getCategoryArticleSummary(article, isEnglish) {
    var fallback = isEnglish ? 'Open the article to read the full note.' : '点击阅读全文，查看完整内容。';
    var key = article.markdownPath;

    if (!key) {
      return Promise.resolve(fallback);
    }

    if (!articleSummaryCache[key]) {
      articleSummaryCache[key] = fetch(key + '?v=' + DESIGN_DATA_VERSION, { cache: 'no-cache' })
        .then(function (response) {
          return response.ok ? response.text() : '';
        })
        .then(function (markdown) {
          var paragraphs = extractMarkdownPreviewParagraphs(markdown);

          return paragraphs[0] || fallback;
        })
        .catch(function () {
          return fallback;
        });
    }

    return articleSummaryCache[key];
  }

  function decorateArticleDetail(section, currentMarkdownPath) {
    var title = getArticleTitle(section);
    var meta = getArticleDetailMeta(section, currentMarkdownPath);
    var articleRoot = getArticleRootForPath(currentMarkdownPath);

    section.classList.add('article-prose');
    decorateDateBlockquote(section, meta);
    renderArticleBreadcrumb(section, meta.category, title);
    renderArticleTopbar(articleRoot);
    renderArticleLeftGuide(section, title);
    renderArticleRail(section, title, meta);
  }

  function getArticleTitle(section) {
    var heading = section.querySelector('h1');

    return heading ? heading.textContent.trim() : '文章';
  }

  function getArticleDetailMeta(section, currentMarkdownPath) {
    var date = '';
    var firstQuote = section.querySelector('blockquote');
    var quoteText = firstQuote ? firstQuote.textContent.replace(/\s+/g, ' ').trim() : '';
    var dateMatch = quoteText.match(/(\d{4}-\d{2}-\d{2})/);
    var categoryMeta = getArticleCategoryMeta(currentMarkdownPath);
    var words = section.textContent.replace(/\s+/g, '').length;
    var minutes = Math.max(3, Math.round(words / 520));
    var isEnglish = isEnglishArticleRoot(getArticleRootForPath(currentMarkdownPath));

    if (dateMatch) {
      date = dateMatch[1];
    }

    return {
      category: categoryMeta.category,
      difficulty: categoryMeta.difficulty,
      date: date,
      isEnglish: isEnglish,
      minutes: isEnglish ? minutes + ' min' : minutes + ' 分钟'
    };
  }

  function getArticleCategoryMeta(markdownPath) {
    var categories = [
      { marker: '/01-agent-and-coding/', category: 'Agent 与编程', categoryEn: 'Agents & Coding', difficulty: '入门', difficultyEn: 'Beginner' },
      { marker: '/02-models-and-research/', category: '模型与研究', categoryEn: 'Models & Research', difficulty: '进阶', difficultyEn: 'Advanced' },
      { marker: '/03-tools-and-resources/', category: '工具与资源', categoryEn: 'Tools & Resources', difficulty: '工具', difficultyEn: 'Tools' },
      { marker: '/04-industry-and-business/', category: '产业与商业', categoryEn: 'Industry & Business', difficulty: '观察', difficultyEn: 'Analysis' },
      { marker: '/05-ai-creation-and-media/', category: '生成与多媒体', categoryEn: 'Creation & Media', difficulty: '实验', difficultyEn: 'Experiment' },
      { marker: '/06-notes-and-observations/', category: '观察与杂谈', categoryEn: 'Notes & Incidents', difficulty: '随笔', difficultyEn: 'Notes' }
    ];
    var normalizedPath = '/' + normalizeMarkdownPath(markdownPath);
    var isEnglish = isEnglishArticleRoot(getArticleRootForPath(markdownPath));
    var found = categories.find(function (item) {
      return normalizedPath.indexOf(item.marker) > -1;
    });

    if (!found) {
      return isEnglish ? { category: 'Article', difficulty: 'Read' } : { category: '文章', difficulty: '阅读' };
    }

    return {
      category: isEnglish ? found.categoryEn : found.category,
      difficulty: isEnglish ? found.difficultyEn : found.difficulty
    };
  }

  function decorateDateBlockquote(section, meta) {
    var firstQuote = section.querySelector('blockquote');

    if (!firstQuote || firstQuote.classList.contains('article-date-note')) {
      return;
    }

    if (/日期\s*[：:]/.test(firstQuote.textContent)) {
      firstQuote.classList.add('article-date-note');
      firstQuote.textContent = '';
      appendText(firstQuote, 'span', '', meta.date || '未标注');
      appendText(firstQuote, 'span', '', '·');
      appendText(firstQuote, 'span', '', meta.minutes);
      appendText(
        firstQuote,
        'span',
        'article-date-category',
        meta.isEnglish ? meta.difficulty + ' · ' + meta.category : meta.difficulty + meta.category
      );

      if (firstQuote.nextElementSibling && firstQuote.nextElementSibling.tagName === 'P') {
        firstQuote.parentNode.insertBefore(firstQuote, firstQuote.nextElementSibling.nextSibling);
      }
    }
  }

  function renderArticleBreadcrumb(section, category, title) {
    var firstHeading = section.querySelector('h1');
    var breadcrumb = section.querySelector('.article-breadcrumb');

    if (!firstHeading) {
      return;
    }

    if (!breadcrumb) {
      breadcrumb = document.createElement('div');
      breadcrumb.className = 'article-breadcrumb';
      firstHeading.parentNode.insertBefore(breadcrumb, firstHeading);
    }

    breadcrumb.textContent = '';
    appendText(breadcrumb, 'span', '', category);
    appendText(breadcrumb, 'span', '', '/');
    appendText(breadcrumb, 'strong', '', title);
  }

  function renderArticleTopbar(articleRoot) {
    var existing = document.querySelector('.article-topbar');
    var topbar = existing || document.createElement('header');
    var currentRoute = normalizeRoute(getCurrentRoute());
    var currentRoot = articleRoot || getArticleRootForRoute(currentRoute);
    var isEnglish = /^en(?:\/|$)/.test(currentRoute) || isEnglishArticleRoot(currentRoot);
    var isLegacy = /^archive-bestjavaer(?:\/|$)/.test(currentRoute);
    var links = getUnifiedTopbarLinks(isEnglish);
    var brand;
    var context;
    var nav;
    var search;
    var theme;
    var language;
    var github;

    topbar.className = 'article-topbar' + (isLegacy ? ' is-legacy' : '');
    topbar.setAttribute('aria-label', isEnglish ? 'Site navigation' : '站点导航');
    brand = topbar.querySelector('.article-topbar-brand') || document.createElement('a');
    nav = topbar.querySelector('.article-topbar-nav') || document.createElement('nav');
    search = topbar.querySelector('.article-topbar-search') || document.createElement('button');

    setCxBrandLogo(brand, 'article-topbar-brand', isEnglish ? '#/home.en' : '#/');

    if (!brand.parentElement) {
      topbar.appendChild(brand);
    }

    context = topbar.querySelector('.article-topbar-context') || document.createElement('span');
    context.className = 'article-topbar-context';
    context.textContent = isLegacy ? 'LEGACY ARCHIVE' : '';
    context.hidden = !isLegacy;

    if (!context.parentElement) {
      topbar.appendChild(context);
    }

    nav.className = 'article-topbar-nav';
    nav.setAttribute('aria-label', isEnglish ? 'Primary navigation' : '主导航');
    nav.textContent = '';

    if (!nav.parentElement) {
      topbar.appendChild(nav);
    }

    links.forEach(function (item) {
      var link = document.createElement('a');
      var isActive = item.matches.some(function (pattern) {
        return pattern.test(currentRoute);
      });

      link.href = item.href;
      link.setAttribute('data-cx-route', item.href);
      link.setAttribute('data-cx-nav-key', item.key);
      link.setAttribute('data-no-router', '');
      link.textContent = item.text;

      if (isActive) {
        link.className = 'is-active';
        link.setAttribute('aria-current', 'page');
      } else {
        link.className = '';
        link.removeAttribute('aria-current');
      }

      nav.appendChild(link);
    });

    theme = document.createElement('button');
    theme.className = 'article-topbar-theme';
    theme.type = 'button';
    theme.setAttribute('data-cx-theme-toggle', '');
    theme.addEventListener('click', function () {
      setHomeNeuralTheme(getStoredHomeNeuralTheme() === 'light' ? 'dark' : 'light', true);
    });
    nav.appendChild(theme);

    language = document.createElement('a');
    language.className = 'article-topbar-language';
    language.href = getUnifiedLanguageHref(currentRoute, isEnglish);
    language.setAttribute('data-cx-language-choice', isEnglish ? 'zh' : 'en');
    language.textContent = isEnglish ? '中文' : 'EN';
    nav.appendChild(language);

    github = document.createElement('a');
    github.className = 'article-topbar-github';
    github.href = 'https://github.com/crisxuan';
    github.target = '_blank';
    github.rel = 'noopener noreferrer';
    github.textContent = 'GitHub';
    nav.appendChild(github);

    search.className = 'article-topbar-search';
    search.type = 'button';
    search.setAttribute('data-cx-search', '');
    search.textContent = isEnglish ? '⌕ Search' : '⌕ 搜索';

    if (!search.parentElement) {
      topbar.appendChild(search);
    }

    if (!existing) {
      document.body.insertBefore(topbar, document.body.firstChild);
    }

    updateSiteThemeControls(getStoredHomeNeuralTheme());
  }

  function getUnifiedTopbarLinks(isEnglish) {
    return [
      {
        href: isEnglish ? '#/en/ai-articles/README' : '#/ai-articles/README',
        key: 'articles',
        matches: [/^(?:en\/)?ai-articles(?:\/|$)/],
        text: isEnglish ? 'Articles' : '文章'
      },
      {
        href: isEnglish ? '#/en/works/README' : '#/works/README',
        key: 'works',
        matches: [/^(?:en\/)?works(?:\/|$)/],
        text: isEnglish ? 'Works' : '作品'
      },
      {
        href: isEnglish ? '#/en/ai-resources/README' : '#/ai-resources/README',
        key: 'resources',
        matches: [/^(?:en\/)?ai-resources(?:\/|$)/],
        text: isEnglish ? 'Resources' : '资源'
      },
      {
        href: isEnglish ? '#/en/development-guidelines/README' : '#/development-guidelines/README',
        key: 'guidelines',
        matches: [/^(?:en\/)?development-guidelines(?:\/|$)/],
        text: isEnglish ? 'Guides' : '规约'
      },
      {
        href: '#/archive-bestjavaer/README',
        key: 'archive',
        matches: [/^archive-bestjavaer(?:\/|$)/],
        text: isEnglish ? 'Archive' : '归档'
      }
    ];
  }

  function getUnifiedLanguageHref(route, isEnglish) {
    var normalizedRoute = normalizeRoute(route);
    var categoryMatch = normalizedRoute.match(/^(?:en\/)?ai-articles\/([^/]+)(?:\/README)?$/);

    if (categoryMatch && categoryMatch[1] !== 'README') {
      return '#/' + (isEnglish ? '' : 'en/') + 'ai-articles/' + categoryMatch[1] + '/README';
    }

    if (/^(?:en\/)?ai-articles(?:\/|$)/.test(normalizedRoute)) {
      return isEnglish ? '#/ai-articles/README' : '#/en/ai-articles/README';
    }

    if (/^(?:en\/)?works(?:\/|$)/.test(normalizedRoute)) {
      return isEnglish ? '#/works/README' : '#/en/works/README';
    }

    if (/^(?:en\/)?ai-resources(?:\/|$)/.test(normalizedRoute)) {
      return isEnglish ? '#/ai-resources/README' : '#/en/ai-resources/README';
    }

    if (/^(?:en\/)?development-guidelines(?:\/|$)/.test(normalizedRoute)) {
      return isEnglish ? '#/development-guidelines/README' : '#/en/development-guidelines/README';
    }

    return isEnglish ? '#/' : '#/home.en';
  }

  function renderArticleLeftGuide(section, title) {
    var sidebar = document.querySelector('.sidebar');
    var existing = document.querySelector('.article-left-guide');
    var guide = existing || document.createElement('div');
    var headings = Array.from(section.querySelectorAll('h2'));
    var groups = groupArticleGuideItems(headings);
    var guideTitle = document.createElement('div');
    var close = document.createElement('button');
    var isCollapsed = document.documentElement.classList.contains('article-guide-collapsed');

    if (!sidebar) {
      return;
    }

    guide.className = 'article-left-guide';
    guide.textContent = '';
    guideTitle.className = 'article-left-title';
    guideTitle.textContent = shortenArticleGuideTitle(title);
    close.className = 'article-left-collapse';
    close.type = 'button';
    close.setAttribute('aria-label', isCollapsed ? '展开目录' : '收起目录');
    close.setAttribute('aria-expanded', isCollapsed ? 'false' : 'true');
    close.textContent = isCollapsed ? '›' : '‹';
    guide.appendChild(guideTitle);
    guide.appendChild(close);

    groups.forEach(function (group) {
      if (!group.items.length) {
        return;
      }

      var block = document.createElement('section');
      var heading = document.createElement('div');
      var list = document.createElement('div');

      block.className = 'article-left-group';
      heading.className = 'article-left-group-title';
      heading.textContent = group.title;
      list.className = 'article-left-list';
      block.appendChild(heading);
      block.appendChild(list);

      group.items.forEach(function (item, index) {
        var link = document.createElement('a');
        var anchor = item.heading.querySelector('a[href]');

        link.href = anchor ? anchor.getAttribute('href') : '#';
        link.textContent = item.heading.textContent.trim();

        if (index === 0 && group.isFirst) {
          link.className = 'is-active';
        }

        list.appendChild(link);
      });

      guide.appendChild(block);
    });

    if (!existing) {
      sidebar.insertBefore(guide, sidebar.firstChild);
    }
  }

  function groupArticleGuideItems(headings) {
    var labels = ['快速开始', '进阶用法', '实战与避坑', '更多教程'];
    var groups = labels.map(function (label, index) {
      return { title: label, items: [], isFirst: index === 0 };
    });

    headings.forEach(function (heading, index) {
      var groupIndex = Math.min(Math.floor(index / 3), groups.length - 1);

      groups[groupIndex].items.push({ heading: heading });
    });

    return groups;
  }

  function shortenArticleGuideTitle(title) {
    var clean = (title || '文章指南').replace(/[:：].*$/, '').trim();

    if (clean.length > 14) {
      clean = clean.slice(0, 14);
    }

    return clean || '文章指南';
  }

  function renderArticleRail(section, title, meta) {
    var content = section.parentElement;
    var existing = document.querySelector('.article-detail-rail');
    var rail = existing || document.createElement('aside');
    var headings = Array.from(section.querySelectorAll('h2')).slice(0, 8);

    if (!content) {
      return;
    }

    rail.className = 'article-detail-rail';
    rail.setAttribute('aria-label', '文章信息和本页目录');
    rail.textContent = '';
    rail.appendChild(createArticleToc(headings));
    rail.appendChild(createArticleInfoCard(meta));

    if (!existing) {
      content.appendChild(rail);
    }
  }

  function createArticleToc(headings) {
    var toc = document.createElement('nav');
    var title = document.createElement('div');
    var list = document.createElement('div');

    toc.className = 'article-toc';
    title.className = 'article-rail-title';
    title.textContent = '本页目录';
    list.className = 'article-toc-list';
    toc.appendChild(title);
    toc.appendChild(list);

    headings.forEach(function (heading) {
      var anchor = heading.querySelector('a[href]');
      var link = document.createElement('a');

      link.href = anchor ? anchor.getAttribute('href') : '#';
      link.textContent = heading.textContent.trim();
      list.appendChild(link);
    });

    return toc;
  }

  function createArticleInfoCard(meta) {
    var card = document.createElement('section');
    var title = document.createElement('div');
    var rows = [
      ['分类', meta.category],
      ['更新', meta.date || '未标注'],
      ['阅读', meta.minutes],
      ['难度', meta.difficulty]
    ];

    card.className = 'article-info-card';
    title.className = 'article-rail-title';
    title.textContent = '文章信息';
    card.appendChild(title);

    rows.forEach(function (row) {
      var item = document.createElement('div');

      item.className = 'article-info-row';
      appendText(item, 'span', '', row[0]);
      appendText(item, 'strong', '', row[1]);
      card.appendChild(item);
    });

    return card;
  }

  function renderSeriesNav(section, currentMarkdownPath) {
    if (section.querySelector('.article-series-nav')) {
      return;
    }

    var articleRoot = currentMarkdownPath.indexOf('en/ai-articles/') === 0 ? 'en/ai-articles' : 'ai-articles';
    var isEnglishArticle = articleRoot === 'en/ai-articles';

    getArticleIndex(articleRoot).then(function (articles) {
      var activePath = getCurrentMarkdownPath(getCurrentRoute());
      var index = articles.findIndex(function (article) {
        return normalizeMarkdownPath(article.markdownPath) === normalizeMarkdownPath(currentMarkdownPath);
      });

      if (normalizeMarkdownPath(activePath) !== normalizeMarkdownPath(currentMarkdownPath) || index < 0) {
        return;
      }

      var previous = articles[index - 1] || null;
      var next = articles[index + 1] || null;

      if (!previous && !next) {
        return;
      }

      var nav = document.createElement('div');

      nav.className = 'article-series-nav';
      nav.setAttribute('aria-label', isEnglishArticle ? 'Article series navigation' : '文章连载导航');
      nav.setAttribute('role', 'navigation');
      nav.appendChild(createSeriesCard(previous, isEnglishArticle ? 'Previous' : '上一篇', isEnglishArticle ? 'This is the first article' : '已经是第一篇', 'previous'));
      nav.appendChild(createSeriesCard(next, isEnglishArticle ? 'Next' : '下一篇', isEnglishArticle ? 'This is the last article' : '已经是最后一篇', 'next'));
      section.appendChild(nav);
    });
  }

  function createSeriesCard(article, label, fallbackTitle, direction) {
    var card = document.createElement(article ? 'a' : 'span');
    var labelNode = document.createElement('span');
    var titleNode = document.createElement('span');
    var dateNode = document.createElement('span');

    card.className = 'article-series-card is-' + direction + (article ? '' : ' is-disabled');

    if (article) {
      card.href = article.href;
    }

    labelNode.className = 'article-series-card-label';
    titleNode.className = 'article-series-card-title';
    dateNode.className = 'article-series-card-date';
    labelNode.textContent = label;
    titleNode.textContent = article ? article.title : fallbackTitle;
    dateNode.textContent = article && article.date ? article.date : '';

    card.appendChild(labelNode);
    card.appendChild(titleNode);
    card.appendChild(dateNode);

    return card;
  }

  function getArticleIndex(articleRoot) {
    articleRoot = articleRoot || 'ai-articles';

    if (articleIndexCache[articleRoot]) {
      return articleIndexCache[articleRoot];
    }

    articleIndexCache[articleRoot] = fetch(articleRoot + '/README.md?v=' + DESIGN_DATA_VERSION, {
      cache: 'no-cache'
    })
      .then(function (response) {
        if (!response.ok) {
          return '';
        }

        return response.text();
      })
      .then(function (markdown) {
        return extractArticleIndex(markdown, articleRoot);
      })
      .catch(function () {
        return [];
      });

    return articleIndexCache[articleRoot];
  }

  function extractArticleIndex(markdown, articleRoot) {
    var articles = [];
    var pattern = /^\s*-\s*(\d{4}-\d{2}-\d{2})\s*-\s*\[([^\]]+)\]\(([^)]+)\)/gm;
    var match;

    while ((match = pattern.exec(markdown))) {
      var markdownPath = resolveIndexMarkdownPath(match[3], articleRoot);

      if (!isArticleMarkdown(markdownPath)) {
        continue;
      }

      articles.push({
        date: match[1],
        href: toRouteHref(markdownPath),
        markdownPath: markdownPath,
        title: match[2].trim()
      });
    }

    return articles;
  }

  function resolveIndexMarkdownPath(href, articleRoot) {
    articleRoot = articleRoot || 'ai-articles';

    var cleanHref = (href || '').split('?')[0].split('#')[0].trim();

    if (!cleanHref || /^(https?:|mailto:)/i.test(cleanHref)) {
      return '';
    }

    if (cleanHref.indexOf('#/') === 0) {
      return toMarkdownPath(cleanHref);
    }

    if (cleanHref.indexOf('./') === 0) {
      cleanHref = articleRoot + '/' + cleanHref.slice(2);
    } else if (cleanHref.indexOf(articleRoot + '/') !== 0) {
      cleanHref = articleRoot + '/' + cleanHref.replace(/^\/+/, '');
    }

    if (!/\.md$/i.test(cleanHref)) {
      cleanHref += '.md';
    }

    return cleanHref.replace(/^\/+/, '');
  }

  function decorateDesignHomeIndex(section, routeState) {
    renderArticleTopbar(routeState.articleRoot);

    if (section.querySelector('.cx-design-home')) {
      renderDesignFeaturedCards(section, routeState);
      return;
    }

    section.insertBefore(createDesignHomeIndex(routeState), section.firstChild);
    renderDesignFeaturedCards(section, routeState);
  }

  function createDesignHomeIndex(routeState) {
    var articleRoot = routeState.articleRoot;
    var isEnglish = routeState.isEnglish;
    var homeHref = isEnglish ? (isPrintEntry() ? '#/home.print.en' : '#/home.en') : '#/';
    var home = document.createElement('section');
    var shell = document.createElement('div');
    var featured = document.createElement('section');
    var featuredHead = document.createElement('div');
    var featuredGrid = document.createElement('div');
    var recent = document.createElement('section');
    var recentHead = document.createElement('div');
    var recentSearch = document.createElement('button');
    var recentList = document.createElement('div');
    var footer = document.createElement('footer');
    var footerBrandBlock = document.createElement('div');
    var footerLinks = document.createElement('div');
    var contentLinks = document.createElement('div');
    var elsewhereLinks = document.createElement('div');

    home.className = 'cx-design-home';
    home.setAttribute('aria-label', isEnglish ? 'cxuan-ai-labs reading home' : 'cxuan-ai-labs 阅读主页');

    shell.className = 'cx-design-shell';
    featured.className = 'cx-featured-section';
    featured.setAttribute('aria-label', isEnglish ? 'Featured articles' : '精选文章');
    featuredHead.className = 'cx-featured-head';
    appendSectionHeading(featuredHead, isEnglish ? 'Featured' : '精选', isEnglish ? '/ Selected' : '/ Featured');
    featuredGrid.className = 'cx-category-cards';
    featuredGrid.setAttribute('data-cx-featured-cards', '');
    appendText(featuredGrid, 'p', 'category-empty-state', isEnglish ? 'Loading featured articles...' : '正在加载精选文章...');
    featured.appendChild(featuredHead);
    featured.appendChild(featuredGrid);

    recent.className = 'cx-recent-section';
    recent.setAttribute('aria-label', isEnglish ? 'Recent updates' : '最近更新');
    recentHead.className = 'cx-section-head';
    appendSectionHeading(recentHead, isEnglish ? 'Recent Updates' : '最近更新', '/ Recent');
    recentSearch.type = 'button';
    recentSearch.setAttribute('data-cx-search', '');
    recentSearch.textContent = isEnglish ? 'View all →' : '查看全部 →';
    recentHead.appendChild(recentSearch);
    recentList.className = 'cx-recent-list';
    appendText(recentList, 'p', 'category-empty-state', isEnglish ? 'Loading recent articles...' : '正在加载最近更新...');
    recent.appendChild(recentHead);
    recent.appendChild(recentList);

    footer.className = 'cx-design-footer';
    footerBrandBlock.appendChild(createFooterBrand(homeHref));
    appendText(
      footerBrandBlock,
      'p',
      '',
      isEnglish ? 'Technical notes for the AI era · docs CC BY-SA 4.0 / code MIT' : 'AI 时代的技术分享 · docs CC BY-SA 4.0 / code MIT'
    );
    footerLinks.className = 'cx-footer-links';
    footerLinks.setAttribute('aria-label', isEnglish ? 'Footer navigation' : '页脚导航');
    appendText(contentLinks, 'span', '', isEnglish ? 'Content' : '内容');
    categoryPageDefinitions.forEach(function (category) {
      var meta = localizeCategoryDefinition(category, articleRoot);
      var link = document.createElement('a');

      link.href = meta.href;
      link.textContent = meta.navText;
      contentLinks.appendChild(link);
    });
    appendText(elsewhereLinks, 'span', '', isEnglish ? 'Elsewhere' : '在别处');
    appendFooterExternalLink(elsewhereLinks, 'GitHub', 'https://github.com/crisxuan/bestJavaer');
    appendFooterExternalLink(elsewhereLinks, 'Vercel', 'https://vercel.com');
    footerLinks.appendChild(contentLinks);
    footerLinks.appendChild(elsewhereLinks);
    footer.appendChild(footerBrandBlock);
    footer.appendChild(footerLinks);

    shell.appendChild(featured);
    shell.appendChild(recent);
    shell.appendChild(footer);
    home.appendChild(shell);

    return home;
  }

  function appendSectionHeading(parent, text, suffix) {
    var heading = document.createElement('h2');

    heading.appendChild(document.createTextNode(text + ' '));
    appendText(heading, 'span', '', suffix);
    parent.appendChild(heading);
  }

  function appendDesignSearchButton(parent, label) {
    var button = document.createElement('button');
    var kbd = document.createElement('kbd');

    button.className = 'cx-design-search';
    button.type = 'button';
    button.setAttribute('data-cx-search', '');
    button.appendChild(document.createTextNode('⌕ ' + label + ' '));
    kbd.textContent = '⌘K';
    button.appendChild(kbd);
    parent.appendChild(button);
  }

  function createFooterBrand(href) {
    var brand = document.createElement('a');

    setCxBrandLogo(brand, 'cx-footer-brand', href);

    return brand;
  }

  function setCxBrandLogo(brand, className, href) {
    var image = document.createElement('img');

    brand.className = className;
    brand.href = href || '#/';
    brand.setAttribute('aria-label', 'cxuan-ai-labs');
    brand.textContent = '';

    image.className = 'cx-brand-logo-image';
    image.src = './assets/cxuan-ai-labs-logo.png?v=2';
    image.alt = 'cxuan-ai-labs';
    image.decoding = 'async';

    brand.appendChild(image);
  }

  function appendFooterExternalLink(parent, text, href) {
    var link = document.createElement('a');

    link.href = href;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = text;
    parent.appendChild(link);
  }

  function renderDesignFeaturedCards(section, routeState) {
    var grid = section.querySelector('[data-cx-featured-cards]');
    var articleRoot = routeState.articleRoot;
    var versionKey = DESIGN_DATA_VERSION + ':' + articleRoot;

    if (!grid || grid.getAttribute('data-cx-featured-version') === versionKey) {
      return;
    }

    grid.setAttribute('data-cx-featured-version', 'loading');

    buildDesignSearchIndex(articleRoot).then(function (index) {
      var articles = index
        .filter(function (entry) {
          return entry.typeKey === 'article' && entry.date;
        })
        .sort(function (left, right) {
          return right.date.localeCompare(left.date);
        })
        .slice(0, 6);

      if (!document.body.contains(grid)) {
        return;
      }

      grid.textContent = '';
      grid.setAttribute('data-cx-featured-version', versionKey);

      articles.forEach(function (entry, index) {
        grid.appendChild(createDesignFeaturedCard(entry, index, routeState.isEnglish));
      });

      if (!articles.length) {
        appendText(grid, 'p', 'category-empty-state', routeState.isEnglish ? 'No featured articles yet.' : '暂无精选文章。');
      }
    }).catch(function () {
      grid.removeAttribute('data-cx-featured-version');
    });
  }

  function createDesignFeaturedCard(entry, index, isEnglish) {
    var card = document.createElement('button');

    card.className = 'cx-category-card ' + (index === 0 ? 'cx-category-card-main ' : '') + (entry.catClass || '');
    card.type = 'button';
    card.setAttribute('data-cx-dynamic-preview', '');
    card.setAttribute('data-cx-title', entry.title);
    card.setAttribute('data-cx-date', entry.date);
    card.setAttribute('data-cx-preview-category', getRecentCategoryLabel(entry.category, isEnglish));
    card.setAttribute('data-cx-cat-class', entry.catClass || '');
    card.setAttribute('data-cx-href', entry.href);
    card.setAttribute('data-cx-read', isEnglish ? 'Article' : '文章');

    appendText(card, 'span', 'cx-card-label', getRecentCategoryLabel(entry.category, isEnglish) + ' · ' + (entry.categoryTag || 'AI'));
    appendText(card, 'span', 'cx-card-title', entry.title);
    appendText(card, 'span', 'cx-card-desc', entry.categoryDescription || (isEnglish ? 'A field note from the cxuan-ai-labs archive.' : '来自 cxuan-ai-labs 的真实记录。'));
    appendText(card, 'span', 'cx-card-meta', entry.date + ' · ' + (isEnglish ? 'Preview' : '预览'));
    appendText(card, 'span', 'cx-card-arrow', '→').setAttribute('aria-hidden', 'true');

    return card;
  }

  function decorateHomePage(section) {
    var latestArticles = collectHomeUpdateArticles(section).slice(0, 6);
    var classes = [
      'home-reading-grid',
      'home-feature-grid',
      'home-update-list',
      'home-reason-grid'
    ];
    var classByHeading = {
      '先从这几篇开始': 'home-reading-grid',
      'Start Here': 'home-reading-grid',
      '新主线': 'home-feature-grid',
      'Main Sections': 'home-feature-grid',
      '最近更新': 'home-update-list',
      'Recent Updates': 'home-update-list',
      '为什么值得关注': 'home-reason-grid',
      'Why Follow': 'home-reason-grid'
    };

    ensureHomeNeuralCanvas(section);
    updateHomeCoverMeta(section);

    Array.from(section.querySelectorAll('h2')).forEach(function (heading) {
      var listClass = classByHeading[heading.textContent.trim()];
      var next = heading.nextElementSibling;

      if (!listClass || !next || next.tagName !== 'UL') {
        return;
      }

      classes.forEach(function (className) {
        next.classList.remove(className);
      });
      next.classList.add(listClass);

      if (listClass === 'home-reading-grid') {
        renderFeaturedCards(next, latestArticles);
      }

      if (listClass === 'home-feature-grid') {
        renderFeatureCards(next);
      }
    });
  }

  function ensureHomeNeuralCanvas(section) {
    var cover = section.querySelector('.home-cover');
    var canvas;

    if (!cover) {
      stopHomeNeuralCanvas();
      return;
    }

    canvas = cover.querySelector('.home-neural-canvas');

    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.className = 'home-neural-canvas';
      canvas.setAttribute('aria-hidden', 'true');
      cover.insertBefore(canvas, cover.firstChild);
    }

    if (homeNeuralAnimation.canvas !== canvas) {
      stopHomeNeuralCanvas();
      homeNeuralAnimation.canvas = canvas;
      homeNeuralAnimation.ctx = canvas.getContext('2d');
      homeNeuralAnimation.width = 0;
      homeNeuralAnimation.height = 0;
    }

    if (homeNeuralAnimation.cover !== cover) {
      bindHomeNeuralPointer(cover);
    }

    ensureHomeNeuralThemeToggle(cover);
    setHomeNeuralTheme(getStoredHomeNeuralTheme(), false);

    homeNeuralAnimation.reduced = !!(
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );

    resizeHomeNeuralCanvas(true);

    if (homeNeuralAnimation.reduced) {
      drawHomeNeuralFrame(performance.now(), true);
      return;
    }

    if (!homeNeuralAnimation.running) {
      homeNeuralAnimation.running = true;
      homeNeuralAnimation.last = performance.now();
      homeNeuralAnimation.frame = window.requestAnimationFrame(drawHomeNeuralFrame);
    }
  }

  function updateHomeCoverMeta(section) {
    var meta = section.querySelector('.home-cover-meta');
    var isEnglish = !!section.querySelector('.home-cover-en') || document.documentElement.lang === 'en';
    var articleRoot = isEnglish ? 'en/ai-articles' : 'ai-articles';

    if (!meta) {
      return;
    }

    buildDesignSearchIndex(articleRoot).then(function (index) {
      var total = index.filter(function (entry) {
        return entry.typeKey === 'article';
      }).length;

      if (!document.body.contains(meta) || !total) {
        return;
      }

      meta.textContent = isEnglish
        ? total + ' articles · Updated continuously'
        : total + ' 篇文章 · 持续更新中';
    }).catch(function () {
      // Keep the static fallback count if the index cannot be fetched.
    });
  }

  function stopHomeNeuralCanvas() {
    if (homeNeuralAnimation.frame) {
      window.cancelAnimationFrame(homeNeuralAnimation.frame);
    }

    homeNeuralAnimation.frame = 0;
    homeNeuralAnimation.running = false;

    if (homeNeuralAnimation.pointerCleanup) {
      homeNeuralAnimation.pointerCleanup();
    }

    homeNeuralAnimation.pointerCleanup = null;
    homeNeuralAnimation.cover = null;
  }

  function bindHomeNeuralPointer(cover) {
    var pointer = homeNeuralAnimation.pointer;
    var updatePointer = function (event) {
      var canvas = homeNeuralAnimation.canvas;
      var rect;

      if (!canvas) {
        return;
      }

      rect = canvas.getBoundingClientRect();
      pointer.targetX = Math.max(0, Math.min(rect.width, event.clientX - rect.left));
      pointer.targetY = Math.max(0, Math.min(rect.height, event.clientY - rect.top));

      if (!pointer.active) {
        pointer.x = pointer.targetX;
        pointer.y = pointer.targetY;
      }

      pointer.active = true;
      pointer.lastMovedAt = performance.now();
    };
    var releasePointer = function () {
      pointer.active = false;
    };

    if (homeNeuralAnimation.pointerCleanup) {
      homeNeuralAnimation.pointerCleanup();
    }

    homeNeuralAnimation.cover = cover;
    cover.addEventListener('pointermove', updatePointer, { passive: true });
    cover.addEventListener('pointerenter', updatePointer, { passive: true });
    cover.addEventListener('pointerleave', releasePointer, { passive: true });
    window.addEventListener('blur', releasePointer);

    homeNeuralAnimation.pointerCleanup = function () {
      cover.removeEventListener('pointermove', updatePointer);
      cover.removeEventListener('pointerenter', updatePointer);
      cover.removeEventListener('pointerleave', releasePointer);
      window.removeEventListener('blur', releasePointer);
    };
  }

  function ensureHomeNeuralThemeToggle(cover) {
    var toggle = cover.querySelector('[data-home-neural-theme-toggle]');

    if (!toggle) {
      toggle = document.createElement('button');
      toggle.className = 'home-neural-theme-toggle';
      toggle.type = 'button';
      toggle.setAttribute('data-home-neural-theme-toggle', '');
      toggle.innerHTML = '<span class="home-neural-theme-toggle-track" aria-hidden="true"><span class="home-neural-theme-toggle-thumb"></span></span><span class="home-neural-theme-toggle-label"></span>';
      cover.appendChild(toggle);
      toggle.addEventListener('click', function () {
        setHomeNeuralTheme(homeNeuralAnimation.theme === 'dark' ? 'light' : 'dark', true);
      });
    }

    updateHomeNeuralThemeToggle(toggle);
  }

  function getStoredHomeNeuralTheme() {
    var stored = '';

    try {
      stored = window.localStorage.getItem(HOME_NEURAL_THEME_KEY) || '';
    } catch (error) {
      stored = '';
    }

    return stored === 'dark' ? 'dark' : 'light';
  }

  function applySiteTheme(theme, persist) {
    var normalized = theme === 'light' ? 'light' : 'dark';
    var html = document.documentElement;
    var isHome = html.classList.contains('home-page');
    var meta = document.querySelector('meta[name="theme-color"]');

    html.classList.toggle('cx-theme-light', normalized === 'light');
    html.classList.toggle('cx-theme-dark', normalized === 'dark');
    html.classList.toggle('home-neural-light', isHome && normalized === 'light');
    html.classList.toggle('home-neural-dark', isHome && normalized === 'dark');
    html.style.colorScheme = normalized;

    if (meta) {
      meta.setAttribute('content', normalized === 'light' ? '#f5f7f7' : '#0a0c10');
    }

    if (persist) {
      try {
        window.localStorage.setItem(HOME_NEURAL_THEME_KEY, normalized);
      } catch (error) {
        // Storage can be unavailable; keep the current page in the selected theme.
      }
    }

    updateSiteThemeControls(normalized);
    return normalized;
  }

  function updateSiteThemeControls(theme) {
    var isLight = theme === 'light';
    var isEnglish = document.documentElement.lang === 'en';

    Array.from(document.querySelectorAll('[data-cx-theme-toggle]')).forEach(function (toggle) {
      toggle.textContent = isEnglish
        ? (isLight ? '◐ Dark' : '◐ Light')
        : (isLight ? '◐ 暗色' : '◐ 亮色');
      toggle.setAttribute(
        'aria-label',
        isEnglish
          ? (isLight ? 'Switch to dark theme' : 'Switch to light theme')
          : (isLight ? '切换到暗色模式' : '切换到亮色模式')
      );
      toggle.setAttribute('aria-pressed', isLight ? 'false' : 'true');
    });
  }

  function setHomeNeuralTheme(theme, persist) {
    var normalized = applySiteTheme(theme, persist);
    var toggle;

    homeNeuralAnimation.theme = normalized;

    toggle = document.querySelector('[data-home-neural-theme-toggle]');
    if (toggle) {
      updateHomeNeuralThemeToggle(toggle);
    }

    return normalized;
  }

  /* 全站只保留一个主题状态源。首页动画脚本通过这个小接口复用同一套
     存储、根 class 和 meta theme-color 更新，避免路由两侧各写一遍。 */
  window.CxuanSiteTheme = {
    get: getStoredHomeNeuralTheme,
    set: setHomeNeuralTheme
  };

  function updateHomeNeuralThemeToggle(toggle) {
    var isLight = homeNeuralAnimation.theme === 'light';
    var isEnglish = document.documentElement.lang === 'en';
    var label = isEnglish
      ? (isLight ? 'Light' : 'Dark')
      : (isLight ? '白' : '黑');
    var nextLabel = isEnglish
      ? (isLight ? 'Switch to dark background' : 'Switch to light background')
      : (isLight ? '切换到黑色背景' : '切换到白色背景');
    var labelNode = toggle.querySelector('.home-neural-theme-toggle-label');

    toggle.setAttribute('aria-label', nextLabel);
    toggle.setAttribute('aria-pressed', isLight ? 'true' : 'false');

    if (labelNode) {
      labelNode.textContent = label;
    }
  }

  function resizeHomeNeuralCanvas(force) {
    var canvas = homeNeuralAnimation.canvas;
    var ctx = homeNeuralAnimation.ctx;
    var rect;
    var width;
    var height;
    var dpr;

    if (!canvas || !ctx) {
      return false;
    }

    rect = canvas.getBoundingClientRect();
    width = Math.max(1, Math.round(rect.width));
    height = Math.max(1, Math.round(rect.height));
    dpr = 1;

    if (!force && width === homeNeuralAnimation.width && height === homeNeuralAnimation.height && dpr === homeNeuralAnimation.dpr) {
      return false;
    }

    homeNeuralAnimation.width = width;
    homeNeuralAnimation.height = height;
    homeNeuralAnimation.dpr = dpr;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    buildHomeNeuralScene(width, height);

    return true;
  }

  function buildHomeNeuralScene(width, height) {
    var random = createHomeNeuralRandom(((Math.round(width) * 73856093) ^ (Math.round(height) * 19349663) ^ 0x9e3779b9) >>> 0);
    var clusterDefinitions = [
      {
        color: 'white',
        compact: 0.48,
        count: Math.round(clampHomeNeural(width / 32, 36, 58)),
        cx: width * 0.82,
        cy: height * 0.26,
        depthMax: 1,
        depthMin: 0.68,
        hubs: 4,
        linkDistance: Math.max(132, width * 0.13),
        name: 'right-cortex',
        rx: width * 0.26,
        ry: height * 0.32,
        streamRate: 0.08,
        tilt: -0.08
      },
      {
        color: 'white',
        compact: 0.55,
        count: Math.round(clampHomeNeural(width / 32, 34, 58)),
        cx: width * 0.18,
        cy: height * 0.28,
        depthMax: 0.95,
        depthMin: 0.52,
        hubs: 4,
        linkDistance: Math.max(126, width * 0.13),
        name: 'left-cortex',
        rx: width * 0.26,
        ry: height * 0.28,
        streamRate: 0.075,
        tilt: 0.12
      },
      {
        color: 'mist',
        compact: 0.58,
        count: Math.round(clampHomeNeural(width / 46, 22, 34)),
        cx: width * 0.48,
        cy: height * 0.2,
        depthMax: 0.82,
        depthMin: 0.38,
        hubs: 2,
        linkDistance: Math.max(118, width * 0.115),
        name: 'top-mesh',
        rx: width * 0.31,
        ry: height * 0.18,
        streamRate: 0.045,
        tilt: -0.02
      },
      {
        color: 'mist',
        compact: 0.72,
        count: Math.round(clampHomeNeural(width / 44, 26, 44)),
        cx: width * 0.52,
        cy: height * 0.58,
        depthMax: 0.9,
        depthMin: 0.44,
        hubs: 2,
        linkDistance: Math.max(130, width * 0.12),
        name: 'mid-web',
        rx: width * 0.38,
        ry: height * 0.22,
        streamRate: 0.045,
        tilt: 0.1
      },
      {
        color: 'ghost',
        count: Math.round(clampHomeNeural(width / 45, 28, 50)),
        depthMax: 0.78,
        depthMin: 0.3,
        hubs: 2,
        linkDistance: Math.max(104, width * 0.1),
        mode: 'wave',
        name: 'lower-axon',
        streamRate: 0.035,
        wave: {
          amplitude: 0.11,
          phase: 0.28,
          x0: -0.04,
          x1: 1.04,
          y: 0.82
        }
      },
      {
        color: 'ghost',
        compact: 0.54,
        count: Math.round(clampHomeNeural(width / 64, 18, 32)),
        cx: width * 0.84,
        cy: height * 0.76,
        depthMax: 0.68,
        depthMin: 0.26,
        hubs: 1,
        linkDistance: Math.max(120, width * 0.11),
        name: 'right-lower',
        rx: width * 0.24,
        ry: height * 0.2,
        streamRate: 0.025,
        tilt: -0.18
      }
      ,
      {
        color: 'mist',
        compact: 0.56,
        count: Math.round(clampHomeNeural(width / 70, 18, 30)),
        cx: width * 0.22,
        cy: height * 0.76,
        depthMax: 0.76,
        depthMin: 0.32,
        hubs: 2,
        linkDistance: Math.max(112, width * 0.105),
        name: 'left-lower',
        rx: width * 0.3,
        ry: height * 0.2,
        streamRate: 0.035,
        tilt: -0.14
      },
      {
        color: 'ghost',
        count: Math.round(clampHomeNeural((width * height) / 7600, 220, 380)),
        depthMax: 0.66,
        depthMin: 0.2,
        hubs: 0,
        linkDistance: Math.max(92, Math.min(148, width * 0.072)),
        mode: 'tile',
        name: 'full-field',
        streamRate: 0.028
      }
    ];
    var nodes = [];
    var links = [];
    var streams = [];
    var linkKeys = {};

    clusterDefinitions.forEach(function (cluster, clusterIndex) {
      var clusterStart = nodes.length;
      var i;

      for (i = 0; i < cluster.count; i += 1) {
        nodes.push(createHomeNeuralNode(cluster, clusterIndex, i, cluster.count, width, height, random));
      }

      cluster.start = clusterStart;
      cluster.end = nodes.length;
      cluster.hub = clusterStart;

      connectHomeNeuralCluster(nodes, links, streams, linkKeys, cluster, random);
    });

    addHomeNeuralBridges(nodes, links, streams, linkKeys, clusterDefinitions[0], clusterDefinitions[2], 7, random);
    addHomeNeuralBridges(nodes, links, streams, linkKeys, clusterDefinitions[1], clusterDefinitions[2], 7, random);
    addHomeNeuralBridges(nodes, links, streams, linkKeys, clusterDefinitions[2], clusterDefinitions[3], 7, random);
    addHomeNeuralBridges(nodes, links, streams, linkKeys, clusterDefinitions[3], clusterDefinitions[4], 6, random);
    addHomeNeuralBridges(nodes, links, streams, linkKeys, clusterDefinitions[4], clusterDefinitions[5], 5, random);
    addHomeNeuralBridges(nodes, links, streams, linkKeys, clusterDefinitions[1], clusterDefinitions[6], 5, random);
    addHomeNeuralBridges(nodes, links, streams, linkKeys, clusterDefinitions[6], clusterDefinitions[4], 5, random);
    addHomeNeuralBridges(nodes, links, streams, linkKeys, clusterDefinitions[0], clusterDefinitions[5], 5, random);
    addHomeNeuralBridges(nodes, links, streams, linkKeys, clusterDefinitions[1], clusterDefinitions[3], 6, random);
    addHomeNeuralBridges(nodes, links, streams, linkKeys, clusterDefinitions[7], clusterDefinitions[0], 12, random);
    addHomeNeuralBridges(nodes, links, streams, linkKeys, clusterDefinitions[7], clusterDefinitions[1], 12, random);
    addHomeNeuralBridges(nodes, links, streams, linkKeys, clusterDefinitions[7], clusterDefinitions[3], 14, random);
    addHomeNeuralBridges(nodes, links, streams, linkKeys, clusterDefinitions[7], clusterDefinitions[4], 12, random);

    Array.from({ length: Math.round(clampHomeNeural((width * height) / 56000, 22, 54)) }, function (_, index) {
      nodes.push(createHomeAmbientNode(width, height, index, random));
    });

    homeNeuralAnimation.nodes = nodes;
    homeNeuralAnimation.clusters = clusterDefinitions;
    homeNeuralAnimation.fibers = createHomeNeuralFibers(width, height, random);
    homeNeuralAnimation.links = links.filter(function (link) {
      return link.a !== link.b;
    }).sort(function (left, right) {
      return Number(right.strong) - Number(left.strong);
    }).slice(0, Math.round(clampHomeNeural(width / 3.2, 380, 640)));
    homeNeuralAnimation.streams = streams.filter(function (stream) {
      return stream.a !== stream.b;
    }).slice(0, Math.round(clampHomeNeural(width / 28, 48, 78)));
  }

  function createHomeNeuralRandom(seed) {
    var value = seed || 1;

    return function () {
      value = (value * 1664525 + 1013904223) >>> 0;
      return value / 4294967296;
    };
  }

  function clampHomeNeural(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function connectHomeNeuralCluster(nodes, links, streams, linkKeys, cluster, random) {
    var i;

    for (i = cluster.start; i < cluster.end; i += 1) {
      var source = nodes[i];
      var localCandidates = [];
      var j;
      var limit;

      for (j = cluster.start; j < cluster.end; j += 1) {
        var target;
        var dx;
        var dy;
        var distance;

        if (i === j) {
          continue;
        }

        target = nodes[j];
        dx = source.x - target.x;
        dy = source.y - target.y;
        distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > cluster.linkDistance && !source.hub && !target.hub) {
          continue;
        }

        localCandidates.push({
          distance: distance / (0.62 + target.depth * 0.5),
          index: j,
          rawDistance: distance
        });
      }

      localCandidates.sort(function (left, right) {
        return left.distance - right.distance;
      });

      limit = source.hub ? 5 : (i % 7 === 0 ? 3 : 2);
      localCandidates.slice(0, limit).forEach(function (candidate, candidateIndex) {
        var strong = source.hub || candidateIndex === 0 || candidate.rawDistance < cluster.linkDistance * 0.42;

        addHomeNeuralLink(links, linkKeys, i, candidate.index, cluster.color, strong, random);

        if (random() < cluster.streamRate || (strong && random() < cluster.streamRate * 1.6)) {
          streams.push(createHomeNeuralStream(i, candidate.index, cluster.color, 0.018, 0.052, random));
        }
      });
    }
  }

  function addHomeNeuralBridges(nodes, links, streams, linkKeys, leftCluster, rightCluster, count, random) {
    var start = leftCluster.start;
    var end = leftCluster.end;
    var i;

    for (i = 0; i < count; i += 1) {
      var leftIndex = start + Math.floor(random() * Math.max(1, end - start));
      var rightIndex = findNearestHomeNeuralNode(nodes, leftIndex, rightCluster.start, rightCluster.end, i, random);

      if (rightIndex >= 0) {
        addHomeNeuralLink(links, linkKeys, leftIndex, rightIndex, i % 3 === 0 ? 'white' : 'mist', i < 3, random);

        if (i % 2 === 0 || random() < 0.36) {
          streams.push(createHomeNeuralStream(leftIndex, rightIndex, 'signal', 0.014, 0.044, random));
        }
      }
    }
  }

  function findNearestHomeNeuralNode(nodes, sourceIndex, start, end, offset, random) {
    var source = nodes[sourceIndex];
    var nearestIndex = -1;
    var nearestDistance = Infinity;
    var i;

    for (i = start; i < end; i += 1) {
      var target = nodes[i];
      var dx = source.x - target.x;
      var dy = source.y - target.y;
      var distance = dx * dx + dy * dy;

      distance = distance * (0.9 + ((offset || 0) % 5) * 0.03) + random() * 7200;

      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = i;
      }
    }

    return nearestIndex;
  }

  function addHomeNeuralLink(links, linkKeys, a, b, color, strong, random) {
    var left = Math.min(a, b);
    var right = Math.max(a, b);
    var key = left + ':' + right;

    if (left === right || linkKeys[key]) {
      return;
    }

    linkKeys[key] = true;
    links.push(createHomeNeuralLink(left, right, color, strong, random));
  }

  function createHomeNeuralNode(cluster, clusterIndex, index, total, width, height, random) {
    var hubCount = cluster.hubs == null ? 1 : cluster.hubs;
    var isHub = index < hubCount;
    var theta = index * 2.39996 + random() * 0.72;
    var ring = Math.pow(random(), cluster.compact || 0.62);
    var jitter = 0.78 + random() * 0.44;
    var depth = cluster.depthMin + random() * (cluster.depthMax - cluster.depthMin);
    var cols;
    var rows;
    var col;
    var row;
    var localX;
    var localY;
    var nodeAlpha;
    var nodeRadius;
    var x;
    var y;

    if (cluster.mode === 'wave') {
      var t = total <= 1 ? 0 : (index + random() * 0.65) / total;
      var wave = cluster.wave;
      var bend = Math.sin((t + wave.phase) * Math.PI * 1.4) * wave.amplitude;

      x = width * (wave.x0 + (wave.x1 - wave.x0) * t) + (random() - 0.5) * width * 0.035;
      y = height * (wave.y + bend) + (random() - 0.5) * height * 0.09;
    } else if (cluster.mode === 'tile') {
      cols = Math.ceil(Math.sqrt(total * width / Math.max(1, height)));
      rows = Math.ceil(total / Math.max(1, cols));
      col = index % cols;
      row = Math.floor(index / cols);
      x = width * ((col + 0.5 + (random() - 0.5) * 0.74) / cols);
      y = height * ((row + 0.5 + (random() - 0.5) * 0.7) / rows);
    } else if (isHub) {
      theta = index * (Math.PI * 2 / Math.max(1, hubCount)) - Math.PI * 0.15;
      ring = index === 0 ? 0.05 : 0.14 + random() * 0.1;
      localX = Math.cos(theta) * cluster.rx * ring;
      localY = Math.sin(theta) * cluster.ry * ring;
      x = cluster.cx + localX + localY * (cluster.tilt || 0);
      y = cluster.cy + localY - localX * (cluster.tilt || 0) * 0.34;
    } else {
      localX = Math.cos(theta) * cluster.rx * ring * jitter;
      localY = Math.sin(theta) * cluster.ry * ring * (0.72 + random() * 0.46);
      x = cluster.cx + localX + localY * (cluster.tilt || 0);
      y = cluster.cy + localY - localX * (cluster.tilt || 0) * 0.34;
    }

    nodeAlpha = cluster.mode === 'tile'
      ? 0.2 + random() * 0.26
      : (isHub ? 0.7 : 0.34) + random() * (isHub ? 0.12 : 0.3);
    nodeRadius = cluster.mode === 'tile'
      ? 0.34 + random() * 0.72
      : isHub ? 1.15 + random() * 1.05 : 0.42 + random() * 1.08;

    return {
      alpha: nodeAlpha,
      cluster: cluster.name,
      clusterIndex: clusterIndex,
      color: cluster.color,
      depth: depth,
      driftX: (cluster.mode === 'tile' ? 5 + random() * 9 : isHub ? 5 : 8 + random() * 18) * (0.72 + depth * 0.52),
      driftY: (cluster.mode === 'tile' ? 5 + random() * 8 : isHub ? 4 : 6 + random() * 14) * (0.62 + depth * 0.46),
      hub: isHub,
      orbit: isHub ? 0 : ring,
      orbitSpeed: (isHub ? 0.18 : 0.08 + random() * 0.18) * (random() > 0.5 ? 1 : -1),
      phase: random() * Math.PI * 2,
      radius: nodeRadius * (0.85 + depth * 0.45),
      speedX: 0.18 + random() * 0.34,
      speedY: 0.14 + random() * 0.3,
      theta: theta,
      x: clampHomeNeural(x, -width * 0.08, width * 1.08),
      y: clampHomeNeural(y, -height * 0.08, height * 1.08)
    };
  }

  function createHomeAmbientNode(width, height, index, random) {
    return {
      alpha: 0.14 + random() * 0.18,
      cluster: 'ambient',
      clusterIndex: 9,
      color: index % 4 === 0 ? 'mist' : 'ghost',
      depth: 0.16 + random() * 0.46,
      driftX: 8 + random() * 22,
      driftY: 8 + random() * 18,
      hub: false,
      orbit: 1,
      orbitSpeed: 0.015 + random() * 0.038,
      phase: random() * Math.PI * 2,
      radius: 0.34 + random() * 0.74,
      speedX: 0.08 + random() * 0.18,
      speedY: 0.08 + random() * 0.18,
      theta: random() * Math.PI * 2,
      x: width * (0.02 + random() * 0.96),
      y: height * (0.04 + random() * 0.9)
    };
  }

  function createHomeNeuralStream(a, b, color, minSpeed, maxSpeed, random) {
    return {
      a: a,
      b: b,
      color: color,
      length: 0.045 + random() * 0.095,
      phase: random() * Math.PI * 2,
      progress: random(),
      speed: minSpeed + random() * (maxSpeed - minSpeed),
      width: 0.32 + random() * 0.5
    };
  }

  function createHomeNeuralLink(a, b, color, strong, random) {
    return {
      a: a,
      alpha: strong ? 0.28 + random() * 0.14 : 0.08 + random() * 0.11,
      b: b,
      color: color,
      phase: random() * Math.PI * 2,
      strong: strong,
      width: strong ? 0.42 + random() * 0.36 : 0.24 + random() * 0.24
    };
  }

  function createHomeNeuralFibers(width, height, random) {
    var fibers = [];
    var count = Math.round(clampHomeNeural(width / 90, 18, 32));
    var i;

    for (i = 0; i < count; i += 1) {
      var lane = i / Math.max(1, count - 1);
      var fromBottom = i % 3 === 1;
      var fromTop = i % 4 === 0;
      var reverse = i % 3 === 2;
      var x0 = width * (reverse ? (0.86 + random() * 0.2) : (-0.1 + random() * 0.18));
      var y0 = height * (fromTop ? (0.06 + random() * 0.22) : (fromBottom ? 0.78 + random() * 0.22 : 0.26 + random() * 0.48));
      var x1 = width * (reverse ? (-0.08 + random() * 0.2) : (0.82 + random() * 0.24));
      var y1 = height * (0.08 + random() * 0.78);
      var lift = (random() - 0.5) * height * 0.18;

      if (i % 5 === 0) {
        x0 = width * (0.34 + random() * 0.32);
        y0 = height * (-0.08 + random() * 0.18);
        x1 = width * (0.18 + random() * 0.72);
        y1 = height * (0.72 + random() * 0.34);
      }

      fibers.push({
        alpha: 0.06 + random() * 0.13,
        c1x: width * (0.12 + lane * 0.34 + random() * 0.2),
        c1y: y0 + height * (0.12 + random() * 0.22) + lift,
        c2x: width * (0.42 + random() * 0.42),
        c2y: y1 + height * (-0.22 + random() * 0.44),
        color: i % 4 === 0 ? 'white' : 'mist',
        depth: 0.42 + random() * 0.58,
        phase: random() * Math.PI * 2,
        pulseCount: i % 5 === 0 ? 2 : 1,
        speed: 0.018 + random() * 0.038,
        width: 0.32 + random() * 0.72,
        wobble: 0.08 + random() * 0.16,
        x0: x0,
        x1: x1,
        y0: y0,
        y1: y1
      });
    }

    return fibers;
  }

  function drawHomeNeuralFrame(timestamp, drawOnly) {
    var ctx = homeNeuralAnimation.ctx;
    var width = homeNeuralAnimation.width;
    var height = homeNeuralAnimation.height;
    var nodes = homeNeuralAnimation.nodes;
    var time = timestamp * 0.001;
    var pointer;
    var positions;

    if (!ctx || !homeNeuralAnimation.canvas || !document.body.contains(homeNeuralAnimation.canvas)) {
      stopHomeNeuralCanvas();
      return;
    }

    if (!drawOnly && document.hidden) {
      homeNeuralAnimation.frame = window.requestAnimationFrame(drawHomeNeuralFrame);
      return;
    }

    if (!drawOnly && shouldSkipHomeNeuralFrame(timestamp)) {
      homeNeuralAnimation.frame = window.requestAnimationFrame(drawHomeNeuralFrame);
      return;
    }

    homeNeuralAnimation.lastFrameAt = timestamp;

    resizeHomeNeuralCanvas(false);
    width = homeNeuralAnimation.width;
    height = homeNeuralAnimation.height;
    nodes = homeNeuralAnimation.nodes;

    ctx.clearRect(0, 0, width, height);
    ctx.save();
    ctx.globalCompositeOperation = isHomeNeuralLight() ? 'source-over' : 'lighter';
    pointer = updateHomeNeuralPointerState(timestamp);

    positions = nodes.map(function (node) {
      var wave = Math.sin(time * node.speedX + node.phase);
      var cross = Math.cos(time * node.speedY + node.phase * 1.7);
      var fine = Math.sin(time * node.orbitSpeed + node.theta) * 0.5 + 0.5;
      var x = node.x;
      var y = node.y;
      var pointerPosition;

      x = x + wave * node.driftX + cross * node.driftX * 0.22;
      y = y + cross * node.driftY + Math.sin(time * (node.speedY * 0.67) + node.phase * 0.3) * node.driftY * 0.24;
      pointerPosition = applyHomeNeuralPointerInfluence(pointer, x, y, node.depth, width);

      return {
        alpha: node.alpha,
        cluster: node.cluster,
        clusterIndex: node.clusterIndex,
        color: node.color,
        depth: node.depth,
        energy: fine,
        hub: node.hub,
        radius: node.radius,
        x: pointerPosition.x,
        y: pointerPosition.y
      };
    });

    drawHomeNeuralAtmosphere(ctx, width, height, time);
    drawHomeNeuralFibers(ctx, width, height, time, pointer);
    drawHomeSynapseAura(ctx, positions, time);
    drawHomeNeuralConnections(ctx, positions, time);
    drawHomeNeuralStreams(ctx, positions, time);
    drawHomeNeuralNodes(ctx, positions, time);
    drawHomePointerField(ctx, positions, time, pointer);

    ctx.restore();

    if (!drawOnly && homeNeuralAnimation.running) {
      homeNeuralAnimation.frame = window.requestAnimationFrame(drawHomeNeuralFrame);
    }
  }

  function updateHomeNeuralPointerState(timestamp) {
    var pointer = homeNeuralAnimation.pointer;
    var width = homeNeuralAnimation.width;
    var height = homeNeuralAnimation.height;
    var targetStrength = 0;
    var idleFor = timestamp - pointer.lastMovedAt;

    if (!pointer.lastMovedAt) {
      pointer.targetX = width * 0.72;
      pointer.targetY = height * 0.42;
      pointer.x = pointer.targetX;
      pointer.y = pointer.targetY;
    }

    if (pointer.active || idleFor < 900) {
      targetStrength = 1;
    }

    pointer.x += (pointer.targetX - pointer.x) * (pointer.active ? 0.86 : 0.42);
    pointer.y += (pointer.targetY - pointer.y) * (pointer.active ? 0.86 : 0.42);
    pointer.strength += (targetStrength - pointer.strength) * (pointer.active ? 0.34 : 0.16);

    return pointer;
  }

  function shouldSkipHomeNeuralFrame(timestamp) {
    var pointer = homeNeuralAnimation.pointer;
    var recentlyMoved = pointer && pointer.lastMovedAt && timestamp - pointer.lastMovedAt < 900;
    var frameBudget = (pointer && pointer.active) || recentlyMoved ? 16 : 42;

    return timestamp - homeNeuralAnimation.lastFrameAt < frameBudget;
  }

  function applyHomeNeuralPointerInfluence(pointer, x, y, depth, width) {
    var radius;
    var dx;
    var dy;
    var distance;
    var influence;
    var pull;
    var swirl;

    if (!pointer || pointer.strength < 0.015) {
      return { x: x, y: y };
    }

    radius = Math.max(190, Math.min(340, width * 0.22));
    dx = x - pointer.x;
    dy = y - pointer.y;
    distance = Math.max(1, Math.sqrt(dx * dx + dy * dy));

    if (distance > radius) {
      return { x: x, y: y };
    }

    influence = Math.pow(1 - distance / radius, 2) * pointer.strength;
    pull = influence * (0.055 + depth * 0.04);
    swirl = influence * (6 + depth * 9);

    return {
      x: x - dx * pull - dy / distance * swirl,
      y: y - dy * pull + dx / distance * swirl
    };
  }

  function drawHomePointerField(ctx, positions, time, pointer) {
    var color;
    var gradient;
    var radius;
    var nearest;

    if (!pointer || pointer.strength < 0.02) {
      return;
    }

    color = getHomeNeuralRgb('pointer');
    radius = 76 + Math.sin(time * 1.7) * 8;
    gradient = ctx.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, radius);
    gradient.addColorStop(0, 'rgba(' + color + ', ' + (0.11 * pointer.strength).toFixed(3) + ')');
    gradient.addColorStop(0.28, 'rgba(' + color + ', ' + (0.045 * pointer.strength).toFixed(3) + ')');
    gradient.addColorStop(1, 'rgba(' + color + ', 0)');

    ctx.beginPath();
    ctx.arc(pointer.x, pointer.y, radius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();

    nearest = positions.map(function (node, index) {
      var dx = node.x - pointer.x;
      var dy = node.y - pointer.y;

      return {
        distance: Math.sqrt(dx * dx + dy * dy),
        index: index
      };
    }).filter(function (item) {
      return item.distance < 290;
    }).sort(function (left, right) {
      return left.distance - right.distance;
    }).slice(0, 7);

    nearest.forEach(function (item, order) {
      var node = positions[item.index];
      var alpha = (1 - item.distance / 290) * pointer.strength * (0.2 - order * 0.016);

      if (alpha <= 0) {
        return;
      }

      ctx.beginPath();
      ctx.moveTo(pointer.x, pointer.y);
      drawHomeNeuralCurve(ctx, { x: pointer.x, y: pointer.y }, node, time + order * 0.37);
      ctx.strokeStyle = 'rgba(' + color + ', ' + alpha.toFixed(3) + ')';
      ctx.lineWidth = 0.5;
      ctx.stroke();
    });

    ctx.beginPath();
    ctx.arc(pointer.x, pointer.y, 2.1 + Math.sin(time * 3.4) * 0.45, 0, Math.PI * 2);
    ctx.fillStyle = isHomeNeuralLight()
      ? 'rgba(18, 21, 24, 0.72)'
      : 'rgba(255, 255, 255, 0.88)';
    ctx.fill();
  }

  function drawHomeNeuralAtmosphere(ctx, width, height, time) {
    var color = getHomeNeuralRgb('atmosphere');
    var alphaScale = isHomeNeuralLight() ? 0.34 : 1;
    var hazePoints = [
      {
        alpha: 0.05 * alphaScale,
        radius: Math.max(width, height) * 0.42,
        x: width * (0.78 + Math.sin(time * 0.045) * 0.018),
        y: height * (0.24 + Math.cos(time * 0.038) * 0.028)
      },
      {
        alpha: 0.04 * alphaScale,
        radius: Math.max(width, height) * 0.36,
        x: width * (0.66 + Math.cos(time * 0.035) * 0.024),
        y: height * (0.84 + Math.sin(time * 0.04) * 0.02)
      },
      {
        alpha: 0.028 * alphaScale,
        radius: Math.max(width, height) * 0.48,
        x: width * (0.22 + Math.sin(time * 0.03) * 0.02),
        y: height * (0.7 + Math.cos(time * 0.034) * 0.02)
      }
    ];

    ctx.save();
    ctx.globalCompositeOperation = 'source-over';

    hazePoints.forEach(function (point) {
      var gradient = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, point.radius);

      gradient.addColorStop(0, 'rgba(' + color + ', ' + point.alpha.toFixed(3) + ')');
      gradient.addColorStop(0.34, 'rgba(' + color + ', ' + (point.alpha * 0.24).toFixed(3) + ')');
      gradient.addColorStop(1, 'rgba(' + color + ', 0)');

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
    });

    ctx.restore();
  }

  function drawHomeNeuralFibers(ctx, width, height, time, pointer) {
    homeNeuralAnimation.fibers.forEach(function (fiber, index) {
      var color = getHomeNeuralRgb(fiber.color);
      var frame = getHomeNeuralFiberFrame(fiber, time, pointer, width);
      var breath = 0.78 + Math.sin(time * 0.32 + fiber.phase) * 0.22;
      var alpha = fiber.alpha * breath * (isHomeNeuralLight() ? 0.82 : 1);
      var pulseIndex;

      ctx.beginPath();
      ctx.moveTo(frame.x0, frame.y0);
      ctx.bezierCurveTo(frame.c1x, frame.c1y, frame.c2x, frame.c2y, frame.x1, frame.y1);
      ctx.strokeStyle = 'rgba(' + color + ', ' + alpha.toFixed(3) + ')';
      ctx.lineWidth = fiber.width * (0.8 + fiber.depth * 0.7);
      ctx.stroke();

      for (pulseIndex = 0; pulseIndex < fiber.pulseCount; pulseIndex += 1) {
        var progress = (fiber.phase * 0.13 + time * fiber.speed + pulseIndex / fiber.pulseCount + index * 0.017) % 1;
        var tail = Math.max(0, progress - 0.055);
        var head = getCubicHomeNeuralPoint(frame, progress);
        var tailPoint = getCubicHomeNeuralPoint(frame, tail);
      var pulseAlpha = (0.22 + fiber.depth * 0.4) * (isHomeNeuralLight() ? 0.78 : 1);

        ctx.beginPath();
        ctx.moveTo(tailPoint.x, tailPoint.y);
        ctx.lineTo(head.x, head.y);
        ctx.strokeStyle = 'rgba(' + getHomeNeuralRgb('signal') + ', ' + pulseAlpha.toFixed(3) + ')';
        ctx.lineWidth = fiber.width * 1.35;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(head.x, head.y, 1.05 + fiber.depth * 1.2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + getHomeNeuralRgb('signal') + ', ' + Math.min(0.86, pulseAlpha + 0.2).toFixed(3) + ')';
        ctx.fill();
      }
    });
  }

  function getHomeNeuralFiberFrame(fiber, time, pointer, width) {
    var sway = Math.sin(time * fiber.wobble + fiber.phase);
    var cross = Math.cos(time * fiber.wobble * 0.73 + fiber.phase * 1.8);
    var pointerPull = pointer && pointer.strength > 0.02 ? pointer.strength : 0;
    var pullX = 0;
    var pullY = 0;

    if (pointerPull) {
      pullX = (pointer.x - width * 0.5) * 0.018 * pointerPull * fiber.depth;
      pullY = (pointer.y - fiber.y1) * 0.018 * pointerPull * fiber.depth;
    }

    return {
      c1x: fiber.c1x + sway * 18 * fiber.depth + pullX * 0.7,
      c1y: fiber.c1y + cross * 16 * fiber.depth + pullY * 0.44,
      c2x: fiber.c2x - cross * 22 * fiber.depth + pullX,
      c2y: fiber.c2y + sway * 20 * fiber.depth + pullY,
      x0: fiber.x0 + cross * 6,
      x1: fiber.x1 + sway * 12 + pullX * 0.36,
      y0: fiber.y0 + sway * 8,
      y1: fiber.y1 + cross * 10 + pullY * 0.34
    };
  }

  function drawHomeSynapseAura(ctx, positions, time) {
    positions.forEach(function (node) {
      var color;
      var pulse;
      var radius;
      var gradient;

      if (!node.hub || node.cluster === 'ambient') {
        return;
      }

      color = getHomeNeuralRgb(node.color);
      pulse = 0.6 + Math.sin(time * 1.1 + node.x * 0.01) * 0.4;
      radius = (node.cluster === 'right-cortex' ? 22 : 18) + pulse * 10;
      gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, radius);
      gradient.addColorStop(0, 'rgba(' + color + ', ' + (0.09 * node.alpha).toFixed(3) + ')');
      gradient.addColorStop(0.18, 'rgba(' + color + ', ' + (0.035 * node.alpha).toFixed(3) + ')');
      gradient.addColorStop(1, 'rgba(' + color + ', 0)');

      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(node.x, node.y, 7 + pulse * 7, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(' + color + ', ' + (0.025 + pulse * 0.035).toFixed(3) + ')';
      ctx.lineWidth = 0.42;
      ctx.stroke();
    });
  }

  function drawHomeNeuralConnections(ctx, positions, time) {
    homeNeuralAnimation.links.forEach(function (link) {
      var left = positions[link.a];
      var right = positions[link.b];
      var alpha;

      if (!left || !right) {
        return;
      }

      alpha = link.alpha * ((left.alpha + right.alpha) / 2) * (0.82 + Math.sin(time * 0.55 + link.phase) * 0.18);
      alpha *= isHomeNeuralLight() ? 1.72 : 1;
      alpha = Math.min(isHomeNeuralLight() ? 0.28 : 0.46, alpha);
      ctx.beginPath();
      ctx.moveTo(left.x, left.y);
      drawHomeNeuralCurve(ctx, left, right, time + link.phase);
      ctx.strokeStyle = 'rgba(' + getHomeNeuralRgb(link.color) + ', ' + alpha.toFixed(3) + ')';
      ctx.lineWidth = link.width * Math.max(0.56, (left.depth + right.depth) / 2);
      ctx.stroke();
    });
  }

  function drawHomeNeuralCurve(ctx, start, end, time) {
    var midX = (start.x + end.x) / 2;
    var midY = (start.y + end.y) / 2;
    var dx = end.x - start.x;
    var dy = end.y - start.y;
    var distance = Math.max(1, Math.sqrt(dx * dx + dy * dy));
    var offset = Math.sin(time * 0.32) * Math.min(20, distance * 0.08);
    var cx = midX - dy / distance * offset;
    var cy = midY + dx / distance * offset;

    ctx.quadraticCurveTo(cx, cy, end.x, end.y);

    return { x: cx, y: cy };
  }

  function drawHomeNeuralStreams(ctx, positions, time) {
    homeNeuralAnimation.streams.forEach(function (stream) {
      var start = positions[stream.a];
      var end = positions[stream.b];
      var progress;
      var x;
      var y;
      var control;
      var tailStart;
      var tailEnd;
      var color;

      if (!start || !end) {
        return;
      }

      progress = (stream.progress + time * stream.speed + Math.sin(time * 0.2 + stream.phase) * 0.025) % 1;
      control = getHomeNeuralControl(start, end, time + stream.phase);
      x = quadraticPoint(start.x, control.x, end.x, progress);
      y = quadraticPoint(start.y, control.y, end.y, progress);
      tailStart = Math.max(0, progress - stream.length);
      tailEnd = Math.max(0, progress - stream.length * 0.35);
      color = getHomeNeuralRgb(stream.color);

      ctx.beginPath();
      ctx.moveTo(
        quadraticPoint(start.x, control.x, end.x, tailStart),
        quadraticPoint(start.y, control.y, end.y, tailStart)
      );
      ctx.quadraticCurveTo(
        quadraticPoint(start.x, control.x, end.x, tailEnd),
        quadraticPoint(start.y, control.y, end.y, tailEnd),
        x,
        y
      );
      ctx.strokeStyle = 'rgba(' + color + ', ' + (isHomeNeuralLight() ? '0.22' : '0.38') + ')';
      ctx.lineWidth = stream.width;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(x, y, 0.58 + Math.sin(time * 3.2 + stream.phase) * 0.18, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(' + color + ', 0.68)';
      ctx.fill();
    });
  }

  function drawHomeNeuralNodes(ctx, positions, time) {
    positions.forEach(function (node, index) {
      var pulse = 0.72 + Math.sin(time * (node.hub ? 1.2 : 0.86) + index * 0.73) * 0.28;
      var radius = node.radius * node.depth * (node.hub ? 1.06 + pulse * 0.3 : 0.72 + pulse * 0.22);
      var color = getHomeNeuralRgb(node.color);
      var glowRadius = radius * (node.hub ? 4.4 : 2.2);
      var gradient;

      if (node.hub || node.depth > 0.74) {
        gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, glowRadius);
        gradient.addColorStop(0, 'rgba(' + color + ', ' + (0.32 * node.alpha).toFixed(3) + ')');
        gradient.addColorStop(0.28, 'rgba(' + color + ', ' + ((node.hub ? 0.08 : 0.035) * node.alpha).toFixed(3) + ')');
        gradient.addColorStop(1, 'rgba(' + color + ', 0)');

        ctx.beginPath();
        ctx.arc(node.x, node.y, glowRadius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(node.x, node.y, Math.max(0.36, radius), 0, Math.PI * 2);
      ctx.fillStyle = isHomeNeuralLight()
        ? 'rgba(22, 25, 29, ' + Math.min(0.82, node.alpha + 0.1).toFixed(3) + ')'
        : 'rgba(248, 248, 248, ' + Math.min(0.9, node.alpha + 0.14).toFixed(3) + ')';
      ctx.fill();
    });
  }

  function getHomeNeuralControl(start, end, time) {
    var midX = (start.x + end.x) / 2;
    var midY = (start.y + end.y) / 2;
    var dx = end.x - start.x;
    var dy = end.y - start.y;
    var distance = Math.max(1, Math.sqrt(dx * dx + dy * dy));
    var offset = Math.sin(time * 0.32) * Math.min(20, distance * 0.08);

    return {
      x: midX - dy / distance * offset,
      y: midY + dx / distance * offset
    };
  }

  function quadraticPoint(start, control, end, progress) {
    var inverse = 1 - progress;

    return inverse * inverse * start + 2 * inverse * progress * control + progress * progress * end;
  }

  function cubicPoint(start, controlA, controlB, end, progress) {
    var inverse = 1 - progress;

    return inverse * inverse * inverse * start +
      3 * inverse * inverse * progress * controlA +
      3 * inverse * progress * progress * controlB +
      progress * progress * progress * end;
  }

  function getCubicHomeNeuralPoint(frame, progress) {
    return {
      x: cubicPoint(frame.x0, frame.c1x, frame.c2x, frame.x1, progress),
      y: cubicPoint(frame.y0, frame.c1y, frame.c2y, frame.y1, progress)
    };
  }

  function isHomeNeuralLight() {
    return homeNeuralAnimation.theme === 'light';
  }

  function getHomeNeuralRgb(color) {
    if (isHomeNeuralLight()) {
      if (color === 'ghost') {
        return '70, 74, 81';
      }

      if (color === 'mist') {
        return '38, 42, 48';
      }

      if (color === 'atmosphere') {
        return '20, 22, 26';
      }

      if (color === 'pointer') {
        return '24, 27, 32';
      }

      if (color === 'signal') {
        return '18, 20, 24';
      }

      return '17, 19, 23';
    }

    if (color === 'ghost') {
      return '116, 120, 126';
    }

    if (color === 'mist') {
      return '196, 200, 205';
    }

    if (color === 'signal') {
      return '255, 255, 255';
    }

    if (color === 'atmosphere' || color === 'pointer') {
      return '244, 246, 248';
    }

    return '248, 249, 250';
  }

  function collectHomeUpdateArticles(section) {
    var updateHeadings = ['最近更新', 'Recent Updates'];
    var updateList = Array.from(section.querySelectorAll('h2')).reduce(function (found, heading) {
      if (found || updateHeadings.indexOf(heading.textContent.trim()) === -1) {
        return found;
      }

      return heading.nextElementSibling && heading.nextElementSibling.tagName === 'UL' ? heading.nextElementSibling : null;
    }, null);

    if (!updateList) {
      return [];
    }

    return Array.from(updateList.children).map(toHomeUpdateItem).filter(Boolean);
  }

  function toHomeUpdateItem(listItem) {
    if (!listItem || listItem.tagName !== 'LI') {
      return null;
    }

    var link = listItem.querySelector('a[href]');

    if (!link) {
      return null;
    }

    var markdownPath = toMarkdownPath(link.getAttribute('href') || '');

    if (!markdownPath || !isArticleMarkdown(markdownPath)) {
      return null;
    }

    var rawText = listItem.textContent.replace(/\s+/g, ' ').trim();
    var dateMatch = rawText.match(/^(\d{4}-\d{2}-\d{2})\s*(?:[·-])\s*/);

    return {
      date: dateMatch ? dateMatch[1] : '',
      href: toRouteHref(markdownPath),
      markdownPath: markdownPath,
      summary: dateMatch ? dateMatch[1] : '',
      title: link.textContent.trim()
    };
  }

  function renderFeaturedCards(list, latestArticles) {
    if (latestArticles && latestArticles.length) {
      renderLatestFeaturedCards(list, latestArticles);
      return;
    }

    Array.from(list.children).forEach(function (item) {
      if (item.tagName !== 'LI' || item.classList.contains('home-reading-item')) {
        return;
      }

      var link = item.querySelector('a[href]');

      if (!link) {
        return;
      }

      var markdownPath = toMarkdownPath(link.getAttribute('href') || '');

      if (!markdownPath || !isArticleMarkdown(markdownPath)) {
        return;
      }

      var summaryNode = Array.from(item.querySelectorAll('p')).find(function (paragraph) {
        return !paragraph.querySelector('a[href]');
      });

      renderFeaturedCard({
        href: toRouteHref(markdownPath),
        item: item,
        markdownPath: markdownPath,
        summary: summaryNode ? summaryNode.textContent.trim() : '',
        title: link.textContent.trim()
      });
    });
  }

  function renderLatestFeaturedCards(list, articles) {
    var key = articles.map(function (article) {
      return article.date + ':' + article.markdownPath;
    }).join('|');

    if (list.getAttribute('data-home-latest-key') === key) {
      return;
    }

    list.setAttribute('data-home-latest-key', key);
    list.textContent = '';

    articles.forEach(function (article) {
      var item = document.createElement('li');

      list.appendChild(item);
      renderFeaturedCard({
        date: article.date,
        href: article.href,
        item: item,
        markdownPath: article.markdownPath,
        summary: article.summary,
        title: article.title
      });
    });
  }

  function renderFeaturedCard(article) {
    var item = article.item;
    var card = document.createElement('a');
    var media = document.createElement('span');
    var body = document.createElement('span');
    var title = document.createElement('span');
    var summary = document.createElement('span');

    item.className = 'home-reading-item';
    card.className = 'home-reading-card';
    card.href = article.href;
    media.className = 'home-reading-card-media is-loading';
    media.innerHTML = '<span>AI</span>';
    body.className = 'home-reading-card-body';
    title.className = 'home-reading-card-title';
    summary.className = 'home-reading-card-summary';
    title.textContent = article.title;
    summary.textContent = article.summary;

    body.appendChild(title);
    body.appendChild(summary);
    card.appendChild(media);
    card.appendChild(body);
    item.textContent = '';
    item.appendChild(card);

    getCover(article.markdownPath).then(function (cover) {
      media.classList.remove('is-loading');

      var image = document.createElement('img');
      image.alt = article.title;
      image.loading = 'lazy';
      image.src = cover || createGeneratedCover(article.title);
      media.textContent = '';
      media.appendChild(image);
    });
  }

  function renderFeatureCards(list) {
    Array.from(list.children).forEach(function (item) {
      if (item.tagName !== 'LI' || item.classList.contains('home-feature-item')) {
        return;
      }

      var link = item.querySelector('a[href]');

      if (!link) {
        return;
      }

      var summaryNode = Array.from(item.querySelectorAll('p')).find(function (paragraph) {
        return !paragraph.querySelector('a[href]');
      });
      var href = link.getAttribute('href') || '#/';
      var title = link.textContent.trim();
      var summary = summaryNode ? summaryNode.textContent.trim() : '';
      var card = document.createElement('a');
      var media = document.createElement('span');
      var image = document.createElement('img');
      var body = document.createElement('span');
      var titleNode = document.createElement('span');
      var summaryNodeNew = document.createElement('span');

      item.className = 'home-feature-item';
      card.className = 'home-feature-card';
      card.href = href;
      media.className = 'home-feature-card-media';
      image.alt = title;
      image.loading = 'lazy';
      image.src = createGeneratedCover(title, summary || 'cxuan-ai-labs');
      body.className = 'home-feature-card-body';
      titleNode.className = 'home-feature-card-title';
      summaryNodeNew.className = 'home-feature-card-summary';
      titleNode.textContent = title;
      summaryNodeNew.textContent = summary;

      media.appendChild(image);
      body.appendChild(titleNode);
      body.appendChild(summaryNodeNew);
      card.appendChild(media);
      card.appendChild(body);
      item.textContent = '';
      item.appendChild(card);
    });
  }

  function bindDesignHomeInteractions() {
    if (designHomeInteractionsBound) {
      return;
    }

    designHomeInteractionsBound = true;

    /* 统一在 click 阶段处理路由。旧实现同时监听 pointer/mouse 的按下、抬起
       和 click，一次操作会触发多轮导航准备，快速切页时容易遗留过渡状态。 */
    document.addEventListener('click', handleDesignRouteClick, true);
    document.addEventListener('click', handleHomeLanguageChoice, true);
    document.addEventListener('click', prepareDesignAnchorNavigation, true);

    document.addEventListener('click', function (event) {
      var target = getElementTarget(event);

      if (!target) {
        return;
      }

      if (target.closest('[data-cx-close-search]') || target.classList.contains('cx-search-modal')) {
        event.preventDefault();
        closeDesignSearch();
        return;
      }

      var searchTrigger = target.closest('[data-cx-search], .cx-design-search, .article-topbar-search');

      if (searchTrigger) {
        event.preventDefault();
        openDesignSearch();
        return;
      }

      var collapseTrigger = target.closest('.article-left-collapse');

      if (collapseTrigger) {
        event.preventDefault();
        setArticleGuideCollapsed(!document.documentElement.classList.contains('article-guide-collapsed'));
        return;
      }

      if (target.closest('[data-cx-close-preview]') || target.classList.contains('cx-design-modal')) {
        event.preventDefault();
        closeDesignPreview();
        return;
      }

      var dynamicPostTrigger = target.closest('[data-cx-dynamic-preview]');

      if (dynamicPostTrigger) {
        event.preventDefault();
        openDynamicDesignPostPreview(dynamicPostTrigger);
        return;
      }

      var categoryTrigger = target.closest('[data-cx-category]');

      if (categoryTrigger) {
        var categoryHref = getDesignCategoryHref(categoryTrigger.getAttribute('data-cx-category'));

        event.preventDefault();

        if (categoryHref) {
          navigateDesignRoute(categoryHref, categoryTrigger.getAttribute('data-cx-category'));
        }

        return;
      }

      var postTrigger = target.closest('[data-cx-preview]');

      if (postTrigger) {
        event.preventDefault();
        openDesignPostPreview(postTrigger.getAttribute('data-cx-preview'));
        return;
      }

    });

    document.addEventListener('keydown', function (event) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        openDesignSearch();
        return;
      }

      if (event.key === 'Escape') {
        if (document.querySelector('.cx-search-modal')) {
          closeDesignSearch();
          return;
        }

        closeDesignPreview();
      }
    });
  }

  function getElementTarget(event) {
    var target = event.target;

    if (!target) {
      return null;
    }

    return target.nodeType === 1 ? target : target.parentElement;
  }

  function handleHomeLanguageChoice(event) {
    var target = getElementTarget(event);
    var trigger;

    if (!target) {
      return;
    }

    trigger = target.closest('[data-cx-language-choice]');

    if (!trigger) {
      return;
    }

    setStoredHomeLanguage(trigger.getAttribute('data-cx-language-choice'));
    document.documentElement.classList.remove('cx-language-detecting');
  }

  function handleDesignRouteClick(event) {
    var target = getElementTarget(event);
    var routeTrigger;
    var routeHref;

    if (!target || !shouldHandleDesignRouteClick(event)) {
      return;
    }

    routeTrigger = target.closest('[data-cx-route]');

    if (!routeTrigger) {
      return;
    }

    routeHref = extractDesignRouteHash(
      routeTrigger.getAttribute('data-cx-route') ||
      routeTrigger.getAttribute('href')
    );

    if (!routeHref) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    if (isDuplicateDesignRouteEvent(routeHref)) {
      return;
    }

    navigateDesignRoute(routeHref, routeTrigger.getAttribute('data-cx-nav-key'));
  }

  function prepareDesignAnchorNavigation(event) {
    var target = getElementTarget(event);
    var anchor;
    var routeHref;

    if (!target || !shouldHandleDesignRouteClick(event)) {
      return;
    }

    if (target.closest('[data-cx-route]')) {
      return;
    }

    anchor = target.closest('a[href]');

    if (!anchor || anchor.target || anchor.hasAttribute('download')) {
      return;
    }

    routeHref = extractDesignRouteHash(anchor.getAttribute('href') || '');

    if (!routeHref) {
      return;
    }

    if (isSamePageDesignAnchor(routeHref)) {
      event.preventDefault();
      event.stopPropagation();

      if (isDuplicateDesignRouteEvent(routeHref)) {
        return;
      }

      navigateSamePageDesignAnchor(routeHref, true);
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    if (isDuplicateDesignRouteEvent(routeHref)) {
      return;
    }

    navigateDesignRoute(routeHref);
  }

  function isSamePageDesignAnchor(hash) {
    return hash.indexOf('?id=') > -1 &&
      getRouteFromHashOrHref(hash) === normalizeRoute(getCurrentRoute());
  }

  function handleSamePageDesignAnchorHash(hash) {
    if (!isSamePageDesignAnchor(hash)) {
      return false;
    }

    navigateSamePageDesignAnchor(hash, false);
    return true;
  }

  function navigateSamePageDesignAnchor(hash, updateUrl) {
    var targetId = getDesignAnchorId(hash);

    pendingDesignRoute = '';
    pendingDesignRouteStartedAt = 0;
    document.documentElement.classList.remove('cx-design-booting');

    if (updateUrl && window.history && window.history.pushState && window.location.hash !== hash) {
      window.history.pushState(
        null,
        '',
        window.location.pathname + window.location.search + hash
      );
    }

    if (!targetId) {
      return;
    }

    window.setTimeout(function () {
      scrollToDesignAnchor(targetId);
      syncArticleGuideAnchorActive(hash);
    }, 0);
  }

  function getDesignAnchorId(hash) {
    var queryIndex = (hash || '').indexOf('?');
    var params;
    var id;

    if (queryIndex === -1) {
      return '';
    }

    params = new URLSearchParams(hash.slice(queryIndex + 1));
    id = params.get('id') || '';

    try {
      return decodeURIComponent(id);
    } catch (error) {
      return id;
    }
  }

  function scrollToDesignAnchor(targetId) {
    var target = findDesignAnchorTarget(targetId);
    var topbar = document.querySelector('.article-topbar');
    var offset = (topbar ? topbar.getBoundingClientRect().height : 0) + 26;
    var top;

    if (!target) {
      return;
    }

    top = target.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({
      behavior: 'smooth',
      top: Math.max(0, top)
    });
  }

  function findDesignAnchorTarget(targetId) {
    var decodedId = targetId || '';
    var target = document.getElementById(decodedId);

    if (target) {
      return target;
    }

    return Array.from(document.querySelectorAll('h2, h3, h4')).find(function (heading) {
      var anchor = heading.querySelector('a[href*="?id="]');
      var anchorHref = anchor ? extractDesignRouteHash(anchor.getAttribute('href') || '') : '';

      return getDesignAnchorId(anchorHref) === decodedId ||
        heading.textContent.trim() === decodedId;
    }) || null;
  }

  function syncArticleGuideAnchorActive(hash) {
    var currentId = getDesignAnchorId(hash);

    Array.from(document.querySelectorAll('.article-left-list a, .article-toc-list a')).forEach(function (link) {
      var linkHash = extractDesignRouteHash(link.getAttribute('href') || '');

      link.classList.toggle('is-active', getDesignAnchorId(linkHash) === currentId);
    });
  }

  function isDuplicateDesignRouteEvent(hash) {
    var now = Date.now();

    if (latestDesignRouteEvent.hash === hash && now - latestDesignRouteEvent.time < 450) {
      latestDesignRouteEvent.time = now;
      return true;
    }

    latestDesignRouteEvent.hash = hash;
    latestDesignRouteEvent.time = now;
    return false;
  }

  function setArticleGuideCollapsed(isCollapsed) {
    var button = document.querySelector('.article-left-collapse');

    document.documentElement.classList.toggle('article-guide-collapsed', isCollapsed);

    if (button) {
      button.setAttribute('aria-expanded', isCollapsed ? 'false' : 'true');
      button.setAttribute('aria-label', isCollapsed ? '展开目录' : '收起目录');
      button.textContent = isCollapsed ? '›' : '‹';
    }
  }

  function openDesignSearch() {
    var existing = document.querySelector('.cx-search-modal');
    var modal = existing || document.createElement('div');
    var panel = document.createElement('div');
    var top = document.createElement('div');
    var title = document.createElement('div');
    var close = document.createElement('button');
    var input = document.createElement('input');
    var results = document.createElement('div');
    var articleRoot = getArticleRootForRoute(getCurrentRoute());
    var isEnglish = isEnglishArticleRoot(articleRoot);

    if (existing) {
      input = existing.querySelector('.cx-search-input');

      if (input) {
        input.focus();
        input.select();
      }

      return;
    }

    closeDesignPreview();
    modal.className = 'cx-search-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', isEnglish ? 'Search articles' : '搜索文章');

    panel.className = 'cx-search-panel';
    top.className = 'cx-search-top';
    title.className = 'cx-search-title';
    title.textContent = isEnglish ? 'Search Articles' : '搜索文章';
    close.className = 'cx-search-close';
    close.type = 'button';
    close.setAttribute('data-cx-close-search', '');
    close.setAttribute('aria-label', isEnglish ? 'Close search' : '关闭搜索');
    close.textContent = '×';

    input.className = 'cx-search-input';
    input.type = 'search';
    input.placeholder = isEnglish ? 'Search by title, category, or keyword' : '输入文章标题、分类或关键词';
    input.autocomplete = 'off';
    input.spellcheck = false;

    results.className = 'cx-search-results';
    results.textContent = isEnglish ? 'Building index...' : '正在建立索引...';

    top.appendChild(title);
    top.appendChild(close);
    panel.appendChild(top);
    panel.appendChild(input);
    panel.appendChild(results);
    modal.appendChild(panel);
    document.body.appendChild(modal);
    document.documentElement.classList.add('cx-search-open');

    buildDesignSearchIndex(articleRoot).then(function (index) {
      renderDesignSearchResults(results, index, input.value, isEnglish);

      input.addEventListener('input', function () {
        renderDesignSearchResults(results, index, input.value, isEnglish);
      });

      input.addEventListener('keydown', function (event) {
        var firstResult = results.querySelector('.cx-search-result');

        if (event.key === 'Enter' && firstResult) {
          event.preventDefault();
          prepareDesignRouteTransition(firstResult.getAttribute('href'));
          window.location.hash = firstResult.getAttribute('href');
          closeDesignSearch();
        }
      });
    });

    window.setTimeout(function () {
      input.focus();
    }, 0);
  }

  function closeDesignSearch() {
    var modal = document.querySelector('.cx-search-modal');

    if (modal && modal.parentElement) {
      modal.parentElement.removeChild(modal);
    }

    document.documentElement.classList.remove('cx-search-open');
  }

  function buildDesignSearchIndex(articleRoot) {
    articleRoot = articleRoot || getArticleRootForRoute(getCurrentRoute());

    if (designSearchIndexPromises[articleRoot]) {
      return designSearchIndexPromises[articleRoot];
    }

    designSearchIndexPromises[articleRoot] = Promise.all(categoryPageDefinitions.map(function (category) {
      var categoryRoot = articleRoot + '/' + category.folder;

      return fetch(categoryRoot + '/README.md?v=' + DESIGN_DATA_VERSION, { cache: 'no-cache' })
        .then(function (response) {
          return response.ok ? response.text() : '';
        })
        .then(function (markdown) {
          return extractSearchEntries(markdown, categoryRoot, category);
        })
        .catch(function () {
          return [];
        });
    })).then(function (groups) {
      var entries = [];
      var seen = {};

      categoryPageDefinitions.forEach(function (category) {
        var meta = localizeCategoryDefinition(category, articleRoot);

        entries.push({
          category: meta.name,
          categoryDescription: meta.description,
          categoryTag: meta.en,
          catClass: meta.catClass,
          date: '',
          href: meta.href,
          title: meta.fallbackTitle,
          type: isEnglishArticleRoot(articleRoot) ? 'Category' : '分类',
          typeKey: 'category'
        });
      });

      groups.forEach(function (group) {
        group.forEach(function (entry) {
          if (seen[entry.href]) {
            return;
          }

          seen[entry.href] = true;
          entries.push(entry);
        });
      });

      return entries;
    });

    return designSearchIndexPromises[articleRoot];
  }

  function extractSearchEntries(markdown, articleRoot, category) {
    var entries = [];
    var pattern = /^\s*-\s*(\d{4}-\d{2}-\d{2})\s*-\s*\[([^\]]+)]\(([^)]+)\)/gm;
    var baseArticleRoot = getArticleRootForPath(articleRoot + '/placeholder.md');
    var meta = localizeCategoryDefinition(category, baseArticleRoot);
    var match;

    while ((match = pattern.exec(markdown))) {
      var markdownPath = resolveIndexMarkdownPath(match[3], articleRoot);

      if (!isArticleMarkdown(markdownPath)) {
        continue;
      }

      entries.push({
        category: meta.name,
        categoryDescription: meta.description,
        categoryTag: meta.en,
        catClass: meta.catClass,
        date: match[1],
        href: toRouteHref(markdownPath),
        title: match[2].trim(),
        type: isEnglishArticleRoot(baseArticleRoot) ? 'Article' : '文章',
        typeKey: 'article'
      });
    }

    return entries;
  }

  function renderDesignSearchResults(container, index, query, isEnglish) {
    var cleanQuery = (query || '').trim().toLowerCase();
    var results = cleanQuery
      ? index.filter(function (entry) {
        return (entry.title + ' ' + entry.category + ' ' + entry.date).toLowerCase().indexOf(cleanQuery) > -1;
      }).slice(0, 10)
      : index.slice(0, 8);

    container.textContent = '';

    if (!results.length) {
      appendText(container, 'div', 'cx-search-empty', isEnglish ? 'No matching articles.' : '没有匹配的文章。');
      return;
    }

    results.forEach(function (entry) {
      var link = document.createElement('a');
      var meta = document.createElement('span');

      link.className = 'cx-search-result';
      link.href = entry.href;
      link.addEventListener('click', closeDesignSearch);
      appendText(link, 'strong', '', entry.title);
      meta.className = 'cx-search-result-meta';
      meta.textContent = entry.type + ' · ' + entry.category + (entry.date ? ' · ' + entry.date : '');
      link.appendChild(meta);
      container.appendChild(link);
    });
  }

  function renderDesignRecentUpdates(section, routeState) {
    var list = section.querySelector('.cx-recent-list');
    var articleRoot = routeState && routeState.articleRoot ? routeState.articleRoot : getArticleRootForRoute(getCurrentRoute());
    var isEnglish = isEnglishArticleRoot(articleRoot);
    var versionKey = DESIGN_DATA_VERSION + ':' + articleRoot;

    if (!list || list.getAttribute('data-cx-recent-version') === versionKey) {
      return;
    }

    list.setAttribute('data-cx-recent-version', 'loading');

    buildDesignSearchIndex(articleRoot).then(function (index) {
      var articles = index
        .filter(function (entry) {
          return entry.typeKey === 'article' && entry.date;
        })
        .sort(function (left, right) {
          return right.date.localeCompare(left.date);
        })
        .slice(0, 8);

      if (!document.body.contains(list)) {
        return;
      }

      list.textContent = '';
      list.setAttribute('data-cx-recent-version', versionKey);

      articles.forEach(function (entry, index) {
        list.appendChild(createRecentUpdateRow(entry, index, isEnglish));
      });
    }).catch(function () {
      list.removeAttribute('data-cx-recent-version');
    });
  }

  function createRecentUpdateRow(entry, index, isEnglish) {
    var row = document.createElement('button');
    var catClass = entry.catClass || '';
    var categoryLabel = getRecentCategoryLabel(entry.category, isEnglish);

    row.className = 'cx-recent-row';
    row.type = 'button';
    row.setAttribute('data-cx-dynamic-preview', '');
    row.setAttribute('data-cx-title', entry.title);
    row.setAttribute('data-cx-date', entry.date);
    row.setAttribute('data-cx-preview-category', categoryLabel);
    row.setAttribute('data-cx-cat-class', catClass);
    row.setAttribute('data-cx-href', entry.href);
    row.setAttribute('data-cx-read', isEnglish ? 'Article' : '文章');

    appendText(row, 'span', 'cx-recent-index', String(index + 1).padStart(2, '0'));
    appendText(row, 'span', 'cx-recent-cat ' + catClass, categoryLabel);
    appendText(row, 'span', 'cx-recent-title', entry.title);
    appendText(row, 'span', 'cx-recent-date', entry.date);

    return row;
  }

  function getRecentCategoryLabel(category, isEnglish) {
    if (isEnglish) {
      if (category === 'AI Observations') {
        return 'AI';
      }

      if (category === 'Resources') {
        return 'Resource';
      }

      if (category === 'Labs') {
        return 'Lab';
      }

      return category || 'Article';
    }

    if (category === '实验记录') {
      return '实验';
    }

    return category || '文章';
  }

  function openDesignPostPreview(key) {
    var preview = designPostPreviews[key];
    var modalParts;
    var heading;
    var meta;
    var excerpt;
    var body;

    if (!preview) {
      return;
    }

    modalParts = createDesignPreviewFrame('即时预览 · ' + preview.cat, preview.catClass, preview.href, '阅读全文');
    heading = document.createElement('h2');
    meta = document.createElement('div');
    excerpt = document.createElement('p');
    body = document.createElement('div');

    heading.textContent = preview.title;
    meta.className = 'cx-post-meta';
    appendText(meta, 'span', '', preview.date);
    appendText(meta, 'span', '', '·');
    appendText(meta, 'span', '', preview.read);

    excerpt.className = 'cx-post-excerpt';
    excerpt.textContent = preview.excerpt;
    body.className = 'cx-post-body';

    preview.body.forEach(function (paragraph) {
      appendText(body, 'p', '', paragraph);
    });

    modalParts.body.appendChild(heading);
    modalParts.body.appendChild(meta);
    modalParts.body.appendChild(excerpt);
    modalParts.body.appendChild(body);
    showDesignPreview(modalParts.modal);
  }

  function openDynamicDesignPostPreview(trigger) {
    var href = trigger.getAttribute('data-cx-href') || '';
    var isEnglish = isEnglishArticleRoot(getArticleRootForPath(toMarkdownPath(href)));
    var preview = {
      cat: trigger.getAttribute('data-cx-preview-category') || '文章',
      catClass: trigger.getAttribute('data-cx-cat-class') || '',
      date: trigger.getAttribute('data-cx-date') || '',
      href: href,
      read: trigger.getAttribute('data-cx-read') || (isEnglish ? 'Article' : '文章'),
      title: trigger.getAttribute('data-cx-title') || (isEnglish ? 'Untitled article' : '未命名文章')
    };
    var modalParts;
    var heading;
    var meta;
    var excerpt;
    var body;

    if (!preview.href) {
      return;
    }

    modalParts = createDesignPreviewFrame(
      (isEnglish ? 'Preview · ' : '即时预览 · ') + preview.cat,
      preview.catClass,
      preview.href,
      isEnglish ? 'Read article' : '阅读全文'
    );
    heading = document.createElement('h2');
    meta = document.createElement('div');
    excerpt = document.createElement('p');
    body = document.createElement('div');

    heading.textContent = preview.title;
    meta.className = 'cx-post-meta';
    appendText(meta, 'span', '', preview.date);
    appendText(meta, 'span', '', '·');
    appendText(meta, 'span', '', preview.read);

    excerpt.className = 'cx-post-excerpt';
    excerpt.textContent = isEnglish ? 'Loading article preview...' : '正在读取文章摘要...';
    body.className = 'cx-post-body';

    modalParts.body.appendChild(heading);
    modalParts.body.appendChild(meta);
    modalParts.body.appendChild(excerpt);
    modalParts.body.appendChild(body);
    showDesignPreview(modalParts.modal);

    fetchDynamicPostPreview(preview.href).then(function (paragraphs) {
      if (!document.body.contains(modalParts.modal)) {
        return;
      }

      excerpt.textContent = paragraphs[0] || (isEnglish ? 'This article is available in the current category. Open it to read the full text.' : '这篇文章已同步到当前分类，点击阅读全文查看完整内容。');
      body.textContent = '';
      paragraphs.slice(1, 4).forEach(function (paragraph) {
        appendText(body, 'p', '', paragraph);
      });
    }).catch(function () {
      if (document.body.contains(modalParts.modal)) {
        excerpt.textContent = isEnglish ? 'This article is available in the current category. Open it to read the full text.' : '这篇文章已同步到当前分类，点击阅读全文查看完整内容。';
      }
    });
  }

  function fetchDynamicPostPreview(href) {
    var markdownPath = toMarkdownPath(href);

    if (!markdownPath) {
      return Promise.resolve([]);
    }

    return fetch(markdownPath + '?v=' + DESIGN_DATA_VERSION, { cache: 'no-cache' })
      .then(function (response) {
        return response.ok ? response.text() : '';
      })
      .then(extractMarkdownPreviewParagraphs);
  }

  function extractMarkdownPreviewParagraphs(markdown) {
    var source = (markdown || '')
      .replace(/^---[\s\S]*?---\s*/, '')
      .replace(/```[\s\S]*?```/g, '\n')
      .replace(/<!--[\s\S]*?-->/g, '\n');

    return source.split(/\n{2,}/)
      .map(cleanMarkdownPreviewText)
      .filter(function (paragraph) {
        return paragraph &&
          paragraph.length > 18 &&
          !/^#+\s*/.test(paragraph) &&
          !/^\|/.test(paragraph) &&
          !isMarkdownPreviewNoise(paragraph);
      })
      .slice(0, 4);
  }

  function isMarkdownPreviewNoise(paragraph) {
    return /^(English|中文)\s*[|｜]/i.test(paragraph) ||
      /^本篇原文[:：]/.test(paragraph) ||
      /^返回(首页|目录|上一页)/.test(paragraph) ||
      /^Back to/i.test(paragraph);
  }

  function cleanMarkdownPreviewText(text) {
    return (text || '')
      .split('\n')
      .filter(function (line) {
        return !/^\s*(#|!\[|>|[-*+]\s|\d+\.\s|```)/.test(line);
      })
      .join(' ')
      .replace(/!\[[^\]]*]\([^)]+\)/g, '')
      .replace(/\[([^\]]+)]\([^)]+\)/g, '$1')
      .replace(/[`*_~]/g, '')
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function openDesignCategoryPreview(key) {
    var category = designCategoryPreviews[key];
    var modalParts;
    var heading;
    var count;
    var items;

    if (!category) {
      return;
    }

    modalParts = createDesignPreviewFrame('当前分类 · ' + category.en, category.catClass, category.href, '查看全部');
    heading = document.createElement('div');
    count = document.createElement('div');
    items = document.createElement('div');

    heading.className = 'cx-preview-heading';
    appendText(heading, 'span', 'cx-preview-num ' + category.catClass, category.num);
    appendText(heading, 'h2', '', category.name);

    count.className = 'cx-preview-count';
    count.textContent = '共 ' + category.count + ' 篇 · 即时预览';

    items.className = 'cx-preview-items';
    category.items.forEach(function (item) {
      var link = document.createElement('a');

      link.className = 'cx-preview-item ' + category.catClass;
      link.href = item.href;
      appendText(link, 'strong', '', item.title);
      appendText(link, 'time', '', item.date);
      appendText(link, 'span', '', '→');
      items.appendChild(link);
    });

    modalParts.body.appendChild(heading);
    modalParts.body.appendChild(count);
    modalParts.body.appendChild(items);
    showDesignPreview(modalParts.modal);
  }

  function getDesignCategoryHref(key) {
    var category = designCategoryPreviews[key];

    return category ? category.href : '';
  }

  function shouldHandleDesignRouteClick(event) {
    return (event.button === 0 || typeof event.button === 'undefined') &&
      !event.metaKey &&
      !event.ctrlKey &&
      !event.shiftKey &&
      !event.altKey;
  }

  function extractDesignRouteHash(href) {
    var hashIndex;

    if (!href) {
      return '';
    }

    hashIndex = href.indexOf('#/');

    if (hashIndex === -1) {
      return '';
    }

    return href.slice(hashIndex);
  }

  function navigateDesignRoute(hash) {
    prepareDesignRouteTransition(hash);
    closeDesignPreview();
    closeDesignSearch();

    if (window.location.hash !== hash) {
      window.location.hash = hash;
    } else {
      scheduleRender();
    }

    if (window.location.search) {
      window.history.replaceState(
        null,
        '',
        window.location.pathname + window.location.hash
      );
    }

    window.scrollTo(0, 0);
  }

  function createDesignPreviewFrame(label, catClass, href, sideLabel) {
    var modal = document.createElement('div');
    var panel = document.createElement('div');
    var body = document.createElement('div');
    var top = document.createElement('div');
    var pill = document.createElement('span');
    var close = document.createElement('button');
    var side = document.createElement('a');
    var sideMark = document.createElement('span');
    var sideText = document.createElement('span');

    modal.className = 'cx-design-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');

    panel.className = 'cx-design-preview';
    panel.setAttribute('data-cx-modal-panel', '');

    body.className = 'cx-design-preview-body';
    top.className = 'cx-preview-top';

    pill.className = 'cx-preview-pill ' + catClass;
    pill.textContent = label;

    close.className = 'cx-preview-close';
    close.type = 'button';
    close.setAttribute('data-cx-close-preview', '');
    close.setAttribute('aria-label', '关闭');
    close.textContent = '×';

    side.className = 'cx-preview-side';
    side.href = href;
    side.setAttribute('data-cx-route', href);
    side.setAttribute('data-cx-nav-key', catClass || 'preview');
    side.setAttribute('data-no-router', '');
    sideMark.className = 'cx-preview-side-mark ' + catClass;
    sideMark.textContent = '→';
    sideText.className = 'cx-preview-side-text';
    sideText.textContent = sideLabel;

    top.appendChild(pill);
    top.appendChild(close);
    body.appendChild(top);
    side.appendChild(sideMark);
    side.appendChild(sideText);
    panel.appendChild(body);
    panel.appendChild(side);
    modal.appendChild(panel);

    return {
      body: body,
      modal: modal
    };
  }

  function showDesignPreview(modal) {
    closeDesignPreview();
    document.body.appendChild(modal);
    document.documentElement.classList.add('cx-preview-open');

    window.setTimeout(function () {
      var closeButton = modal.querySelector('.cx-preview-close');

      if (closeButton) {
        closeButton.focus();
      }
    }, 0);
  }

  function closeDesignPreview() {
    var modal = document.querySelector('.cx-design-modal');

    if (modal && modal.parentElement) {
      modal.parentElement.removeChild(modal);
    }

    document.documentElement.classList.remove('cx-preview-open');
  }

  function appendText(parent, tagName, className, text) {
    var node = document.createElement(tagName);

    if (className) {
      node.className = className;
    }

    node.textContent = text;
    parent.appendChild(node);

    return node;
  }

  function toArticleItem(listItem) {
    var link = listItem.querySelector('a[href]');

    if (!link) {
      return null;
    }

    var href = link.getAttribute('href') || '';
    var markdownPath = toMarkdownPath(href);

    if (!markdownPath || !isArticleMarkdown(markdownPath)) {
      return null;
    }

    var rawText = listItem.textContent.replace(/\s+/g, ' ').trim();
    var dateMatch = rawText.match(/^(\d{4}-\d{2}-\d{2})\s*-\s*/);

    return {
      date: dateMatch ? dateMatch[1] : '',
      href: toRouteHref(markdownPath),
      item: listItem,
      markdownPath: markdownPath,
      title: link.textContent.trim()
    };
  }

  function renderCard(article) {
    var item = article.item;

    if (item.classList.contains('article-card-item')) {
      return;
    }

    var card = document.createElement('a');
    var media = document.createElement('span');
    var body = document.createElement('span');
    var date = document.createElement('span');
    var title = document.createElement('span');

    item.className = 'article-card-item';
    card.className = 'article-card';
    card.href = article.href;
    media.className = 'article-card-media is-loading';
    media.innerHTML = '<span>AI</span>';
    body.className = 'article-card-body';
    date.className = 'article-card-date';
    title.className = 'article-card-title';
    date.textContent = article.date || 'AI Article';
    title.textContent = article.title;

    body.appendChild(date);
    body.appendChild(title);
    card.appendChild(media);
    card.appendChild(body);
    item.textContent = '';
    item.appendChild(card);

    getCover(article.markdownPath).then(function (cover) {
      media.classList.remove('is-loading');

      var image = document.createElement('img');
      image.alt = article.title;
      image.loading = 'lazy';
      image.src = cover || createGeneratedCover(article.title);
      media.textContent = '';
      media.appendChild(image);
    });
  }

  function getCover(markdownPath) {
    if (coverCache.has(markdownPath)) {
      return coverCache.get(markdownPath);
    }

    var request = fetch(markdownPath + '?v=20260531-card-cover', {
      cache: 'force-cache'
    })
      .then(function (response) {
        if (!response.ok) {
          return '';
        }

        return response.text();
      })
      .then(function (markdown) {
        return extractFirstImage(markdown, markdownPath);
      })
      .catch(function () {
        return '';
      });

    coverCache.set(markdownPath, request);
    return request;
  }

  function extractFirstImage(markdown, markdownPath) {
    var imagePattern = /!\[[^\]]*]\(([^)\s]+)(?:\s+["'][^"']*["'])?\)|<img[^>]+src=["']([^"']+)["'][^>]*>/ig;
    var imageMatch = imagePattern.exec(markdown);
    var src = imageMatch && (imageMatch[1] || imageMatch[2]);

    if (src) {
      return resolveImageSource(src, markdownPath);
    }

    return '';
  }

  function getCurrentRoute() {
    return (window.location.hash || '#/').replace(/^#\/?/, '').split('?')[0];
  }

  function getCurrentMarkdownPath(route) {
    var path = (route || '').replace(/^\/+/, '');

    if (!path || path === 'README' || /\/README$/.test(path)) {
      return '';
    }

    if (!/\.md$/i.test(path)) {
      path += '.md';
    }

    return path;
  }

  function isArticleIndexRoute(route) {
    return (
      route === 'ai-articles' ||
      route === 'ai-articles/' ||
      route === 'ai-articles/README' ||
      /^ai-articles\/[^/]+\/README$/.test(route) ||
      route === 'en/ai-articles' ||
      route === 'en/ai-articles/' ||
      route === 'en/ai-articles/README' ||
      /^en\/ai-articles\/[^/]+\/README$/.test(route)
    );
  }

  function isCategoryIndexRoute(route) {
    var normalizedRoute = normalizeRoute(route);

    return /^(?:en\/)?ai-articles\/0[1-6]-[^/]+\/README$/.test(normalizedRoute);
  }

  function isHomeRoute(route) {
    return (
      route === '' ||
      route === '/' ||
      route === 'README' ||
      route === 'home.en' ||
      route === 'home.print' ||
      route === 'home.print.en'
    );
  }

  function isArticleMarkdown(path) {
    return (
      (
        /^ai-articles\/[^/]+\/.+\.md$/.test(path) ||
        /^en\/ai-articles\/[^/]+\/.+\.md$/.test(path)
      ) &&
      !/\/README\.md$/.test(path)
    );
  }

  function toMarkdownPath(href) {
    var route = '';

    if (href.indexOf('#/') === 0) {
      route = href.slice(2);
    } else if (href.indexOf('#/') > -1) {
      route = href.split('#/')[1];
    } else if (/\.md(?:$|[?#])/.test(href)) {
      route = resolveRelativeMarkdownPath(href);
    }

    route = route.split('?')[0].split('#')[0].replace(/^\/+/, '');

    if (!route) {
      return '';
    }

    if (!/\.md$/i.test(route)) {
      route += '.md';
    }

    return route;
  }

  function toRouteHref(markdownPath) {
    return '#/' + markdownPath.replace(/\.md$/i, '').replace(/^\/+/, '');
  }

  function normalizeMarkdownPath(markdownPath) {
    var normalized = (markdownPath || '').replace(/^\/+/, '');

    try {
      return decodeURIComponent(normalized);
    } catch (error) {
      return normalized;
    }
  }

  function resolveRelativeMarkdownPath(href) {
    var base = getCurrentRoute();

    if (!base || base === 'README') {
      base = '';
    } else if (/\/README$/.test(base)) {
      base = base.replace(/README$/, '');
    } else {
      base = base.replace(/[^/]+$/, '');
    }

    var rootPath = getSiteRootPath();
    var url = new URL(href, window.location.origin + rootPath + base);
    var path = url.pathname;

    if (path.indexOf(rootPath) === 0) {
      path = path.slice(rootPath.length);
    }

    return path.replace(/^\/+/, '');
  }

  function resolveImageSource(src, markdownPath) {
    var trimmed = (src || '').trim();

    if (/^(?:https?:)?\/\//i.test(trimmed) || /^(?:data|blob):/i.test(trimmed) || trimmed.charAt(0) === '/') {
      return trimmed;
    }

    var rootPath = getSiteRootPath();
    var articleDirectory = markdownPath.replace(/[^/]+$/, '');

    return new URL(trimmed, window.location.origin + rootPath + articleDirectory).href;
  }

  function getSiteRootPath() {
    var path = window.location.pathname;

    return path.charAt(path.length - 1) === '/' ? path : path.replace(/[^/]*$/, '');
  }

  function createGeneratedCover(title, caption) {
    var safeTitle = escapeXml(title || 'AI Article');
    var safeCaption = escapeXml(caption || 'AI notes · tools · workflow');
    var svg = [
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 540">',
      '<rect width="960" height="540" fill="#effaf6"/>',
      '<rect x="44" y="44" width="872" height="452" rx="24" fill="#ffffff" stroke="#bfe8dc" stroke-width="2"/>',
      '<path d="M80 388H880" stroke="#00b38a" stroke-width="8" stroke-linecap="round"/>',
      '<text x="80" y="148" fill="#008f70" font-family="Arial, sans-serif" font-size="34" font-weight="700">cxuan-ai-labs</text>',
      '<foreignObject x="80" y="194" width="800" height="150">',
      '<div xmlns="http://www.w3.org/1999/xhtml" style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Arial,sans-serif;font-size:44px;font-weight:800;line-height:1.28;color:#303c39;">',
      safeTitle,
      '</div>',
      '</foreignObject>',
      '<foreignObject x="80" y="426" width="800" height="52">',
      '<div xmlns="http://www.w3.org/1999/xhtml" style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Arial,sans-serif;font-size:22px;font-weight:600;line-height:1.35;color:#7b8a86;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">',
      safeCaption,
      '</div>',
      '</foreignObject>',
      '</svg>'
    ].join('');

    return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
  }

  function escapeXml(text) {
    return String(text).replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }
}());
